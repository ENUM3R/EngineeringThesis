from django.db import models

class Task(models.Model):
    task_id = models.BigAutoField(primary_key=True)
    title = models.CharField(max_length=255)
    description = models.TextField(max_length=255, blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    priority = models.IntegerField(max_length=5)
    points = models.IntegerField(max_length=100)

    def __str__(self):
        return self.title
    
class User(models.Model):
    user_id = models.BigAutoField(primary_key=True)
    user_login = models.CharField(max_length=20)
    user_password = models.CharField(max_length=20)