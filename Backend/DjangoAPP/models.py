from django.db import models
from django.contrib.auth.models import User

class Task(models.Model):
    task_id = models.BigAutoField(primary_key=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    priority = models.IntegerField()
    points = models.IntegerField()
    status = models.CharField(max_length=50, blank=True, default="pending")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tasks")

    def __str__(self):
        return self.title