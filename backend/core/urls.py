from django.urls import path, re_path

from django.urls import path, include
from . import views
from .views import index

urlpatterns = [
    re_path(r'^core/tests/$', views.test_list),
    # path('', TestView.as_view()),
    path('', index, name='index'),
    path('', include("django_nextjs.urls")),
    path('api/react/', views.ReactView.as_view(), name='react'),
]