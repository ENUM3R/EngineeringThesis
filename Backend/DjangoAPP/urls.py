from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, RegisterViewSet

router = DefaultRouter()
router.register(r'tasks', TaskViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path("register/", RegisterViewSet.as_view(), name="register"),
]
