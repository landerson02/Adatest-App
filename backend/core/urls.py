from django.urls import path, re_path

from django.urls import path, include
from . import views
from .views import index

urlpatterns = [
    path('core/tests/get', views.test_get),
    # path('', TestView.as_view()),
    path('', index, name='index'),
    path('', include("django_nextjs.urls")),
    path('api/react/', views.ReactView.as_view(), name='react'),

    path('core/tests/post', views.test_generate),
    path('core/tests/clear', views.test_clear),
    path('core/tests/clear_all', views.all_clear),
    path('core/tests/delete/<str:pk>', views.test_delete), 
    path('core/tests/approve/<str:pk>', views.test_update_approved), 
    path('core/tests/label/<str:pk>', views.test_update_approved, ), 
    path('core/tests/init', views.init_database)
]