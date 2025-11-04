from rest_framework import viewsets, permissions, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from .models import Task
from .serializers import TaskSerializer, UserSerializer, RegisterSerializer


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(
            user=self.request.user,
            status__in=["pending", "in progress"]
        ).order_by('end_date')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_done(self, request):
        task = self.get_object()
        task.status = "done"
        task.calculate_points()

        profile = task.user.profile
        profile.current_points += task.points
        profile.save()

        return Response({
            "message": "Task marked as done",
            "task_points": task.points,
            "user_total_points": profile.current_points,
        }, status=200)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class RegisterViewSet(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({"message": "User registered successfully!"}, status=status.HTTP_201_CREATED)
