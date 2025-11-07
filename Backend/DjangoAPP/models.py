from django.db import models
from django.contrib.auth.models import User
from datetime import datetime, date, timedelta, time

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
    start_date: datetime = models.DateTimeField(null=True, blank=True)
    end_date: datetime = models.DateTimeField(null=True, blank=True)
    priority: int = models.IntegerField(default=0)
    points: int = models.IntegerField(default=0)
    status: str = models.CharField(max_length=50, blank=True, default="pending")

    def __str__(self) -> str:
        return self.title
    
    @property
    def total_hours(self) -> int:
        if self.sessions.exists():
            return sum(session.hours_spent for session in self.sessions.all())
        return 1
    
    @property
    def day_span(self) -> int:
        if self.start_date and self.end_date:
            delta: timedelta = self.end_date - self.start_date
            return max(delta.days, 1)
        return 1
    
    def calculate_points(self) -> int:
        # New formula: (end_date.day - start_date.day) * priority * 10
        if self.start_date and self.end_date:
            day_diff = (self.end_date.date() - self.start_date.date()).days
            if day_diff <= 0:
                day_diff = 1  # Minimum 1 day
            points: int = day_diff * self.priority * 10
        else:
            # Fallback if dates are missing
            points: int = self.priority * 10
        self.points = int(points)
        self.save()
        return self.points

class WorkSession(models.Model):
    task: int = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="sessions")
    start_time: time = models.TimeField(null=True, blank=True)
    end_time: time = models.TimeField(null=True, blank=True)

    @property
    def hours_spent(self) -> float:
        if self.start_time and self.end_time:
            hours: float = datetime.combine(date.min, self.end_time) - datetime.combine(date.min, self.start_time)
            return max(hours.seconds / 3600, 1)
        return 1

class CyclicTask(models.Model):
    task = models.OneToOneField(Task, on_delete=models.CASCADE, related_name="cycle")
    frequency: str = models.CharField(max_length=50)
    occurrences_count: int = models.IntegerField(default=12)

class SubTask(models.Model):
    parent_task: int = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="subtasks")
    title: str = models.CharField(max_length=50)
    start_date: date = models.DateTimeField()
    end_date: date = models.DateTimeField()
    priority: int = models.IntegerField(default=1)
    status: str = models.CharField(max_length=50, default="pending")

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    current_points: int = models.IntegerField(default=0)  # Available points (can be spent)
    total_points_earned: int = models.IntegerField(default=0)  # All points ever earned (only increases)
    points_spent: int = models.IntegerField(default=0)  # Total points spent in marketplace

    def __str__(self) -> str:
        return f"{self.user.username} Profile"