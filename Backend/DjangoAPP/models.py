from django.db import models
from django.contrib.auth.models import User
from datetime import datetime, date, timedelta

STATUS_CHOICES: list[tuple] = [
    ("pending", "Pending"),
    ("in progress", "In Progress"),
    ("done", "Done"),
    ("overdue", "Overdue"),
    ("abandoned", "Abandoned"),
]

class Task(models.Model):
    user: int = models.ForeignKey(User, null=True, default=None, on_delete=models.CASCADE, related_name="tasks")
    title: str = models.CharField(max_length=200)
    description: str = models.TextField(blank=True)
    start_date: date = models.DateTimeField(null=True, blank=True)
    end_date: date = models.DateTimeField(null=True, blank=True)
    priority: int = models.IntegerField(default=0)
    points: int = models.IntegerField(default=0)
    status: str = models.CharField(max_length=50, blank=True, default="pending")

    def __str__(self) -> str:
        return self.title
    
    @property
    def total_hours(self) -> int:
        if self.sessions.existis():
            return sum(session.hours_spent for session in self.sessions.all())
        return 1
    
    @property
    def day_span(self) -> int:
        if self.start_date and self.end_date:
            delta: timedelta = self.end_date - self.start_date
            return max(delta.days, 1)
        return 1
    
    def calculate_points(self) -> int:
        points: int =  self.priority * self.total_hours* self.day_span
        self.points = int(points)
        self.save()
        return self.points

class WorkSession(models.Model):
    task: int = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="sessions")
    start_time: date = models.TimeField(null=True, blank=True)
    end_time: date = models.TimeField(null=True, blank=True)

    @property
    def hours_spent(self) -> float:
        if self.start_time and self.end_time:
            hours: float = datetime.combine(date.min, self.end_time) - datetime.combine(date.min, self.start_time)
            return max(hours.seconds / 3600, 1)
        return 1

class CyclicTask(models.Model):
    task = models.OneToOneField(Task, on_delete=models.CASCADE, related_name="cycle")
    frequency: str = models.CharField(max_length=50)

class SubTask(models.Model):
    parent_task: int = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="subtasks")
    title: str = models.CharField(max_length=50)
    start_date: date = models.DateTimeField()
    end_date: date = models.DateTimeField()
    priority: int = models.IntegerField(default=1)
    status: str = models.CharField(max_length=50, default="pending")

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    current_points: int = models.IntegerField(default=0)

    def __str__(self) -> str:
        return f"{self.user.username} Profile"