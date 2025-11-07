from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Task, WorkSession, CyclicTask, SubTask, UserProfile

class WorkSessionSerializer(serializers.ModelSerializer):
    hours_spent: float = serializers.FloatField(read_only=True)

    class Meta:
        model = WorkSession
        fields: set[str] = {'id', 'start_time', 'end_time', 'hours_spent'}
class CyclicTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = CyclicTask
        fields = ['id', 'frequency', 'occurrences_count']

class SubTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubTask
        fields = ['id', 'title', 'start_date', 'end_date', 'priority', 'status']
class TaskSerializer(serializers.ModelSerializer):
    sessions: WorkSessionSerializer = WorkSessionSerializer(many=True, read_only=True)
    total_hours: float = serializers.FloatField(read_only=True) 
    day_span: int = serializers.IntegerField(read_only=True)
    cycle: CyclicTaskSerializer = CyclicTaskSerializer(read_only=True)
    subtasks: SubTaskSerializer = SubTaskSerializer(many=True, read_only=True)
    is_cyclic: bool = serializers.SerializerMethodField()
    is_split: bool = serializers.SerializerMethodField()
    
    class Meta:
        model = Task
        fields = '__all__'
    
    def get_is_cyclic(self, obj) -> bool:
        return hasattr(obj, 'cycle')
    
    def get_is_split(self, obj) -> bool:
        return obj.subtasks.exists()
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

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['id', 'username', 'current_points', 'total_points_earned', 'points_spent']