from django.urls import include, path

from .api_views import logs, perturbations, tests, topics, views
from .api_views.views import index

urlpatterns = [
    path('', index, name='index'),
    path('', include("django_nextjs.urls")),

    path('core/config/get', views.get_app_config),

    # Test endpoints (api_views/tests.py)
    path('core/tests/get/<str:topic>', tests.get_by_topic),
    path('core/tests/post/<str:topic>', tests.test_generate),
    path('core/tests/clear/<str:config>', tests.test_clear),
    path('core/tests/delete/<str:pk>', tests.test_delete), 
    path('core/tests/init', views.init_database), 
    path('core/tests/all', tests.get_all_tests), 
    path('core/tests/add/<str:topic>/<str:ground_truth>', tests.add_test),
    path('core/tests/edit/<str:topic>', tests.edit_test),
    path('core/tests/process/<str:decision>/<str:topic>', tests.process_list),

    # Log endpoints (api_views/logs.py)
    path('core/logs/add', logs.log_action),
    path('core/logs/clear', logs.log_clear),
    path('core/logs/save', logs.save_log),

    # Perturbation endpoints (api_views/perturbations.py)
    path('core/perturbations/generate/<str:topic>', perturbations.generate_perturbations),
    path('core/perturbations/get', perturbations.get_perturbations),
    path('core/perturbations/validate/<str:validation>', perturbations.validate_perturbations),
    path('core/perturbations/edit/<str:topic>', perturbations.edit_perturbation),
    path('core/perturbations/add', perturbations.add_new_pert),
    path('core/perturbations/test', perturbations.test_new_pert),
    path('core/perturbations/delete', perturbations.delete_perturbation),
    path('core/perturbations/getType/<str:pert_type>', perturbations.get_perturbation_type),
    path('core/perturbations/getAll', perturbations.get_all_perturbation_types),

    # Topic endpoints (api_views/topics.py)
    path('core/topics/add', topics.add_topic),
    path('core/topics/get', topics.get_topics),
    path('core/topics/delete', topics.delete_topic),
    path('core/topics/test', topics.test_topic_prompt)
]




