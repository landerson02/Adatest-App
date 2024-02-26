from django.urls import path 
from .views import TestView

from django.urls import path, include
from . import views
from .views import index

urlpatterns = [
    # path('', TestView.as_view()),
    path('', index, name='index'),
    path('', include("django_nextjs.urls")),
    path('api/react/', views.ReactView.as_view(), name='react'),
]