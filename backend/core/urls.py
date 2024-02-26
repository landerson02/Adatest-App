from django.urls import path, re_path
from core import views


urlpatterns = [
    re_path(r'^core/tests/$', views.test_list),
]