from django.db import models

# Create your models here.
class TaskList(models.Model):
    task_name = models.CharField(max_length=100)

    def __str__(self):
        return self.task_name

class Task(models.Model):
    task_list = models.ForeignKey(TaskList, on_delete=models.CASCADE)
    text = models.CharField(max_length=300)
    complete = models.BooleanField(default=False)

    def __str__(self):
        return self.text