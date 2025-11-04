from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Task, WorkSession

class WorkSessionSerializer(serializers.ModelSerializer):
    hours_spent: float = serializers.FloatField(read_only=True)

    class Meta:
        model = WorkSession
        fields: set[str] = {'id', 'start_time', 'end_time', 'hours_spent'}

class TaskSerializer(serializers.ModelSerializer):
    sessions = WorkSessionSerializer(many=True, read_only=True)
    total_hours: float = serializers.FloatField(read_only=True) 
    day_span: int = serializers.IntegerField(read_only=True) 
    
    class Meta:
        model = Task
        fields = '__all__'

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user
