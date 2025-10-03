from django.db import models

class Task(models.Model):
    task_id = models.BigAutoField(primary_key=True)
    title = models.CharField(max_length=200)
    description = models.TextField( blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    priority = models.IntegerField()
    points = models.IntegerField()
    status = models.CharField(max_length=50, blank=True, default="pending")

    def __str__(self):
        return self.title
    
class User(models.Model):
    user_id = models.BigAutoField(primary_key=True)
    user_login = models.CharField()
    user_password = models.CharField()