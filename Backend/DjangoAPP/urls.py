from django.contrib import admin
from django.urls import path
from . import views
from django.urls import include, path

urlpatterns = [
    #path('admin/', admin.site.urls),
    path('<int:id>', views.hello_view, name='hello_view'),
]