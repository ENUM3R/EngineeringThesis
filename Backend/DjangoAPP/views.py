from rest_framework import viewsets, permissions, generics
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from .models import Task
from .serializers import TaskSerializer, UserSerializer, RegisterSerializer

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class RegisterViewSet(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
