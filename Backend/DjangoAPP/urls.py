from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, RegisterViewSet, ProfileViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'profile', ProfileViewSet, basename='profile')

urlpatterns = [
    path('', include(router.urls)),
    path("register/", RegisterViewSet.as_view(), name="register"),
]
