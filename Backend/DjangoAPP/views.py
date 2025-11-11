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

        now = timezone.now()
        overdue_tasks = user_request.filter(
            end_date__lt=now,
            status__in=["pending", "in progress"]
        )
        overdue_tasks.update(status="overdue")

        status_filter = self.request.query_params.get("status")
        if status_filter == "done":
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
        is_abandoned: bool = task.status == "abandoned"    
        task.calculate_points()
        is_overdue: bool = task.end_date and task.end_date < timezone.now()
    
        points_to_add: int = 0
        if not is_abandoned:
            points_to_add = task.points
            if is_overdue:
                points_to_add = task.points // 2
            task.status = "done"
        task.save()

        profile, created = UserProfile.objects.get_or_create(user=task.user)
        profile.current_points += points_to_add
        profile.total_points_earned += points_to_add
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
        frequency: str = task_data.pop('frequency', 'weekly')
        occurrences_count: int = task_data.pop('occurrences_count', 12)
        
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
    
    @action(detail=False, methods=['patch'])
    def update_points(self, request) -> Response:
        points_to_deduct = request.data.get('points_to_deduct', 0)
        if points_to_deduct < 0:
            return Response({"error": "Points to deduct must be positive"}, status=status.HTTP_400_BAD_REQUEST)
        
        profile, created = UserProfile.objects.get_or_create(user=request.user)
        available_points: int = profile.current_points - profile.points_spent
        if available_points < points_to_deduct:
            return Response({"error": "Not enough points"}, status=status.HTTP_400_BAD_REQUEST)
        
        profile.points_spent += points_to_deduct
        profile.save()
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def rankings(self, request) -> Response:
        """Get global leaderboard with user rankings"""
        from django.utils import timezone
        from datetime import timedelta
        
        profiles = UserProfile.objects.select_related('user').all().order_by('-total_points_earned')
        
        now = timezone.now()
        current_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        three_months_ago = (current_month - timedelta(days=90)).replace(day=1)
        
        rankings = []
        for rank, profile in enumerate(profiles, start=1):
            this_month_tasks = Task.objects.filter(
                user=profile.user,
                status='done',
                end_date__gte=current_month
            )
            current_month_points = sum(task.points for task in this_month_tasks)
            
            last_3_months_tasks = Task.objects.filter(
                user=profile.user,
                status='done',
                end_date__gte=three_months_ago
            )
            last_3_months_points = sum(task.points for task in last_3_months_tasks)
            
            rankings.append({
                'id': profile.user.id,
                'rank': rank,
                'name': profile.user.username,
                'points': profile.total_points_earned,
                'current_month': current_month_points,
                'last3_months': last_3_months_points,
                'avatar': self._get_avatar(profile.user.id)
            })
        
        return Response(rankings, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def achievements(self, request) -> Response:
        """Get all available achievements"""
        all_achievements = [
            {'id': 1, 'title': 'Rising Star', 'description': 'Reach 500 points', 'icon': '⭐', 'points': 50},
            {'id': 2, 'title': 'Champion', 'description': 'Reach 2000 points', 'icon': '🏆', 'points': 200},
            {'id': 3, 'title': 'Speed Demon', 'description': 'Gain 100 points in one day', 'icon': '⚡', 'points': 100},
            {'id': 4, 'title': 'Consistency King', 'description': 'Maintain 7-day streak', 'icon': '🔥', 'points': 150},
            {'id': 5, 'title': 'Elite Member', 'description': 'Rank in top 10', 'icon': '💎', 'points': 300},
            {'id': 6, 'title': 'Legendary', 'description': 'Reach 3000 points', 'icon': '👑', 'points': 500},
            {'id': 7, 'title': 'Task Master', 'description': 'Complete 100 tasks', 'icon': '✅', 'points': 250},
            {'id': 8, 'title': 'Early Bird', 'description': 'Complete 10 tasks before 9 AM', 'icon': '🌅', 'points': 75},
            {'id': 9, 'title': 'Night Owl', 'description': 'Complete 10 tasks after 10 PM', 'icon': '🦉', 'points': 75},
            {'id': 10, 'title': 'Weekend Warrior', 'description': 'Complete 20 tasks on weekends', 'icon': '🏋️', 'points': 120},
        ]
        return Response(all_achievements, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def user_achievements(self, request) -> Response:
        """Get achievements for the current user"""
        from django.utils import timezone
        from datetime import timedelta
        from collections import defaultdict
        
        user = request.user
        profile, _ = UserProfile.objects.get_or_create(user=user)
        
        all_tasks = Task.objects.filter(user=user, status='done')
        total_tasks = all_tasks.count()
        total_points = profile.total_points_earned
        
        earned_achievements = []
        
        # Rising Star - 500 points
        if total_points >= 500:
            earned_achievements.append({'id': 1, 'title': 'Rising Star', 'description': 'Reach 500 points', 'icon': '⭐', 'points': 50})
        
        # Champion - 2000 points
        if total_points >= 2000:
            earned_achievements.append({'id': 2, 'title': 'Champion', 'description': 'Reach 2000 points', 'icon': '🏆', 'points': 200})
        
        # Legendary - 3000 points
        if total_points >= 3000:
            earned_achievements.append({'id': 6, 'title': 'Legendary', 'description': 'Reach 3000 points', 'icon': '👑', 'points': 500})
        
        # Task Master - 100 tasks
        if total_tasks >= 100:
            earned_achievements.append({'id': 7, 'title': 'Task Master', 'description': 'Complete 100 tasks', 'icon': '✅', 'points': 250})
        
        # Speed Demon - 100 points in one day
        now = timezone.now()
        for task in all_tasks:
            if task.points >= 100:
                day_tasks = Task.objects.filter(
                    user=user,
                    status='done',
                    end_date__date=task.end_date.date()
                )
                day_points = sum(t.points for t in day_tasks)
                if day_points >= 100:
                    earned_achievements.append({'id': 3, 'title': 'Speed Demon', 'description': 'Gain 100 points in one day', 'icon': '⚡', 'points': 100})
                    break
        
        # Consistency King - 7-day streak
        task_dates = sorted(set(task.end_date.date() for task in all_tasks if task.end_date))
        if len(task_dates) >= 7:
            current_streak = 0
            max_streak = 0
            prev_date = None
            for date in task_dates:
                if prev_date and (date - prev_date).days == 1:
                    current_streak += 1
                    max_streak = max(max_streak, current_streak)
                else:
                    current_streak = 1
                prev_date = date
            if max_streak >= 7:
                earned_achievements.append({'id': 4, 'title': 'Consistency King', 'description': 'Maintain 7-day streak', 'icon': '🔥', 'points': 150})
        
        # Elite Member - Top 10 ranking
        user_rank = UserProfile.objects.filter(total_points_earned__gt=profile.total_points_earned).count() + 1
        if user_rank <= 10:
            earned_achievements.append({'id': 5, 'title': 'Elite Member', 'description': 'Rank in top 10', 'icon': '💎', 'points': 300})
        
        # Early Bird - 10 tasks before 9 AM
        early_tasks = [task for task in all_tasks if task.end_date and task.end_date.hour < 9]
        if len(early_tasks) >= 10:
            earned_achievements.append({'id': 8, 'title': 'Early Bird', 'description': 'Complete 10 tasks before 9 AM', 'icon': '🌅', 'points': 75})
        
        # Night Owl - 10 tasks after 10 PM
        night_tasks = [task for task in all_tasks if task.end_date and task.end_date.hour >= 22]
        if len(night_tasks) >= 10:
            earned_achievements.append({'id': 9, 'title': 'Night Owl', 'description': 'Complete 10 tasks after 10 PM', 'icon': '🦉', 'points': 75})
        
        # Weekend Warrior - 20 tasks on weekends
        weekend_tasks = [task for task in all_tasks if task.end_date and task.end_date.weekday() >= 5]
        if len(weekend_tasks) >= 20:
            earned_achievements.append({'id': 10, 'title': 'Weekend Warrior', 'description': 'Complete 20 tasks on weekends', 'icon': '🏋️', 'points': 120})
        
        seen = set()
        unique_achievements = []
        for ach in earned_achievements:
            if ach['id'] not in seen:
                seen.add(ach['id'])
                unique_achievements.append(ach)
        
        return Response(unique_achievements, status=status.HTTP_200_OK)
    
    @action(detail=True, methods=['get'])
    def user_stats(self, request, pk=None) -> Response:
        """Get statistics for a specific user by user ID"""
        from django.utils import timezone
        from datetime import timedelta
        
        try:
            user = User.objects.get(id=pk)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)
        
        profile, _ = UserProfile.objects.get_or_create(user=user)
        
        now = timezone.now()
        current_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        three_months_ago = (current_month - timedelta(days=90)).replace(day=1)
        
        this_month_tasks = Task.objects.filter(
            user=user,
            status='done',
            end_date__gte=current_month
        )
        current_month_points = sum(task.points for task in this_month_tasks)
        
        last_3_months_tasks = Task.objects.filter(
            user=user,
            status='done',
            end_date__gte=three_months_ago
        )
        last_3_months_points = sum(task.points for task in last_3_months_tasks)
        
        all_tasks = Task.objects.filter(user=user, status='done')
        earned_achievements = self._calculate_user_achievements(user, profile, all_tasks)
        
        return Response({
            'user_id': user.id,
            'username': user.username,
            'total_points': profile.total_points_earned,
            'current_month': current_month_points,
            'last3_months': last_3_months_points,
            'achievements': earned_achievements
        }, status=status.HTTP_200_OK)
    
    def _calculate_user_achievements(self, user, profile, all_tasks):
        """Helper method to calculate user achievements"""
        from django.utils import timezone
        from collections import defaultdict
        
        earned_achievements = []
        total_tasks = all_tasks.count()
        total_points = profile.total_points_earned
        
        # Rising Star - 500 points
        if total_points >= 500:
            earned_achievements.append({'id': 1, 'title': 'Rising Star', 'description': 'Reach 500 points', 'icon': '⭐', 'points': 50})
        
        # Champion - 2000 points
        if total_points >= 2000:
            earned_achievements.append({'id': 2, 'title': 'Champion', 'description': 'Reach 2000 points', 'icon': '🏆', 'points': 200})
        
        # Legendary - 3000 points
        if total_points >= 3000:
            earned_achievements.append({'id': 6, 'title': 'Legendary', 'description': 'Reach 3000 points', 'icon': '👑', 'points': 500})
        
        # Task Master - 100 tasks
        if total_tasks >= 100:
            earned_achievements.append({'id': 7, 'title': 'Task Master', 'description': 'Complete 100 tasks', 'icon': '✅', 'points': 250})
        
        # Speed Demon - 100 points in one day
        for task in all_tasks:
            if task.points >= 100:
                day_tasks = Task.objects.filter(
                    user=user,
                    status='done',
                    end_date__date=task.end_date.date()
                )
                day_points = sum(t.points for t in day_tasks)
                if day_points >= 100:
                    earned_achievements.append({'id': 3, 'title': 'Speed Demon', 'description': 'Gain 100 points in one day', 'icon': '⚡', 'points': 100})
                    break
        
        # Consistency King - 7-day streak
        task_dates = sorted(set(task.end_date.date() for task in all_tasks if task.end_date))
        if len(task_dates) >= 7:
            current_streak = 0
            max_streak = 0
            prev_date = None
            for date in task_dates:
                if prev_date and (date - prev_date).days == 1:
                    current_streak += 1
                    max_streak = max(max_streak, current_streak)
                else:
                    current_streak = 1
                prev_date = date
            if max_streak >= 7:
                earned_achievements.append({'id': 4, 'title': 'Consistency King', 'description': 'Maintain 7-day streak', 'icon': '🔥', 'points': 150})
        
        # Elite Member - Top 10 ranking
        user_rank = UserProfile.objects.filter(total_points_earned__gt=profile.total_points_earned).count() + 1
        if user_rank <= 10:
            earned_achievements.append({'id': 5, 'title': 'Elite Member', 'description': 'Rank in top 10', 'icon': '💎', 'points': 300})
        
        # Early Bird - 10 tasks before 9 AM
        early_tasks = [task for task in all_tasks if task.end_date and task.end_date.hour < 9]
        if len(early_tasks) >= 10:
            earned_achievements.append({'id': 8, 'title': 'Early Bird', 'description': 'Complete 10 tasks before 9 AM', 'icon': '🌅', 'points': 75})
        
        # Night Owl - 10 tasks after 10 PM
        night_tasks = [task for task in all_tasks if task.end_date and task.end_date.hour >= 22]
        if len(night_tasks) >= 10:
            earned_achievements.append({'id': 9, 'title': 'Night Owl', 'description': 'Complete 10 tasks after 10 PM', 'icon': '🦉', 'points': 75})
        
        # Weekend Warrior - 20 tasks on weekends
        weekend_tasks = [task for task in all_tasks if task.end_date and task.end_date.weekday() >= 5]
        if len(weekend_tasks) >= 20:
            earned_achievements.append({'id': 10, 'title': 'Weekend Warrior', 'description': 'Complete 20 tasks on weekends', 'icon': '🏋️', 'points': 120})
        
        seen = set()
        unique_achievements = []
        for ach in earned_achievements:
            if ach['id'] not in seen:
                seen.add(ach['id'])
                unique_achievements.append(ach)
        
        return unique_achievements
    
    def _get_avatar(self, user_id: int) -> str:
        """Generate a simple avatar based on user ID"""
        avatars = ['👨‍💻', '👩‍💼', '👨‍🎨', '👩‍🚀', '👨‍🏫', '👩‍⚕️', '👨‍🍳', '👩‍🎭', '👨‍🔬', '👩‍🎤']
        return avatars[user_id % len(avatars)]