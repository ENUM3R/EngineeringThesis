from rest_framework import viewsets, permissions, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from .models import Task, UserProfile, CyclicTask, SubTask
from .serializers import TaskSerializer, UserSerializer, RegisterSerializer, UserProfileSerializer, SubTaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        from django.utils import timezone
        
        user_request = Task.objects.filter(user=self.request.user)

        # Auto-update overdue tasks
        now = timezone.now()
        overdue_tasks = user_request.filter(
            end_date__lt=now,
            status__in=["pending", "in progress"]
        )
        overdue_tasks.update(status="overdue")
        
        # Auto-mark abandoned tasks as done (but keep abandoned status)
        # This is handled in the serializer/response, not in DB

        status_filter = self.request.query_params.get("status")
        if status_filter == "done":
            # Include both "done" and "abandoned" tasks in done list
            user_request = user_request.filter(status__in=["done", "abandoned"])
        else:
            user_request = user_request.filter(status__in=["pending", "in progress", "overdue"])

        return user_request.order_by("end_date")
    
    def perform_create(self, serializer) -> None:
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_done(self, request, pk=None) -> Response:
        from django.utils import timezone
        
        task = self.get_object()
        
        # Check original status before changing
        is_abandoned = task.status == "abandoned"
        
        # Calculate points before changing status
        task.calculate_points()
        
        # Check if task is overdue (end_date has passed)
        is_overdue = task.end_date and task.end_date < timezone.now()
        
        # If abandoned, give 0 points. If overdue, give half points. Otherwise full points.
        points_to_add = 0
        if not is_abandoned:
            points_to_add = task.points
            if is_overdue:
                points_to_add = task.points // 2
            # Only change status to "done" if not abandoned
            task.status = "done"
        # If abandoned, keep status as "abandoned" but treat as done for display
        
        task.save()  # Save the status change

        # Get or create profile
        profile, created = UserProfile.objects.get_or_create(user=task.user)
        profile.current_points += points_to_add
        profile.save()

        return Response({
            "message": "Task marked as done",
            "task_points": task.points,
            "points_awarded": points_to_add,
            "is_overdue": is_overdue,
            "user_total_points": profile.current_points,
        }, status=200)

    @action(detail=False, methods=['post'])
    def create_cyclic(self, request):
        """
        Create a task with cyclic behavior.
        Expected payload:
        {
            "title": "...",
            "description": "...",
            "start_date": "...",
            "end_date": "...",
            "priority": 5,
            "frequency": "weekly"  # or "daily", "monthly", "quarterly"
        }
        """
        task_data = request.data.copy()
        frequency = task_data.pop('frequency', 'weekly')
        occurrences_count = task_data.pop('occurrences_count', 12)
        
        # Validate occurrences_count
        occurrences_count = max(2, min(12, int(occurrences_count)))
        
        serializer = self.get_serializer(data=task_data)
        serializer.is_valid(raise_exception=True)
        task = serializer.save(user=request.user)
        
        CyclicTask.objects.create(task=task, frequency=frequency, occurrences_count=occurrences_count)
        
        return Response({
            "message": "Cyclic task created",
            "task": TaskSerializer(task).data
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def create_split(self, request):
        """
        Create a parent task and split it into subtasks.
        Expected payload:
        {
            "title": "Parent Task",
            "description": "...",
            "priority": 5,
            "subtasks": [
                {
                    "title": "Subtask 1",
                    "start_date": "...",
                    "end_date": "...",
                    "priority": 3
                },
                {
                    "title": "Subtask 2",
                    "start_date": "...",
                    "end_date": "...",
                    "priority": 4
                }
            ]
        }
        """        
        task_data = request.data.copy()
        subtasks_data = task_data.pop('subtasks', [])
        
        if subtasks_data:
            dates = [sub.get('start_date') for sub in subtasks_data if sub.get('start_date')]
            end_dates = [sub.get('end_date') for sub in subtasks_data if sub.get('end_date')]
            if dates:
                task_data['start_date'] = min(dates)
            if end_dates:
                task_data['end_date'] = max(end_dates)
        
        serializer = self.get_serializer(data=task_data)
        serializer.is_valid(raise_exception=True)
        parent_task = serializer.save(user=request.user)
        
        created_subtasks: list = []
        for subtask_data in subtasks_data:
            subtask = SubTask.objects.create(
                parent_task=parent_task,
                title=subtask_data.get('title', 'Untitled'),
                start_date=subtask_data.get('start_date'),
                end_date=subtask_data.get('end_date'),
                priority=subtask_data.get('priority', 1),
                status='pending'
            )
            created_subtasks.append(SubTaskSerializer(subtask).data)
        
        return Response({
            "message": "Split task created",
            "parent_task": TaskSerializer(parent_task).data,
            "subtasks": created_subtasks
        }, status=status.HTTP_201_CREATED)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class RegisterViewSet(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs) -> Response:
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({"message": "User registered successfully!"}, status=status.HTTP_201_CREATED)

class ProfileViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def me(self, request) -> Response:
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)