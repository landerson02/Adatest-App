from django.urls import path, include
from .api_views import views, tests, logs, perturbations
from .api_views.views import index


urlpatterns = [
    path('', index, name='index'),
    path('', include("django_nextjs.urls")),
    # path('api/react/', views.ReactView.as_view(), name='react'),

    # Test endpoints
    path('core/tests/get/<str:my_topic>', views.test_get),
    path('core/tests/post/<str:topic>', tests.test_generate),
    path('core/tests/clear', tests.test_clear),
    path('core/tests/delete/<str:pk>', tests.test_delete), 
    path('core/tests/init', views.init_database), 
    path('core/tests/all', views.get_all), 
    path('core/tests/add/<str:topic>/<str:ground_truth>', tests.add_test),
    path('core/tests/edit/<str:topic>', tests.edit_test),

    path('core/tests/process/<str:decision>/<str:topic>', tests.process_list),

    # Log endpoints
    path('core/logs/add', views.log_action),
    path('core/logs/clear', views.log_clear),
    path('core/logs/save', views.save_log),

    # Perturbation endpoints
    path('core/perturbations/generate/<str:topic>', views.generate_perturbations),
    path('core/perturbations/get', views.get_perturbations),
    path('core/perturbations/validate/<str:validation>', views.validate_perturbations),
    path('core/perturbations/edit/<str:topic>', views.edit_perturbation),
    path('core/perturbations/add/<str:topic>', views.add_new_pert),
    path('core/perturbations/test/<str:topic>', views.test_new_pert),
]




