from rest_framework import viewsets
from .models import Task
from .serializers import EventSerializer
# Create your views here.

class EventViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = EventSerializer
