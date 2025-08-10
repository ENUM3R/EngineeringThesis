from django.shortcuts import render
from django.http import HttpResponse
from .models import *
# Create your views here.

def hello_view(request, id):
    ls = TaskList.objects.get(id=id)
    task = ls.task_set.get(id=1)
    return HttpResponse("<h1>%s</h1>"
    "<br></br><p>%s</p>" % (ls.task_name, task.text))
