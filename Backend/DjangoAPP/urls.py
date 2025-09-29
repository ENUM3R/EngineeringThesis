from django.contrib import admin
from django.urls import path, include
from .views import TaskViewSet, UserViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'users', UserViewSet)


urlpatterns = [
    path('',include(router.urls)),
]