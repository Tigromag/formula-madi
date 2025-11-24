from django.urls import path
from . import views

app_name = 'files'

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('section/<str:section>/', views.section_view, name='section'),
    path('upload/', views.upload_file, name='upload'),
    path('download/<int:pk>/', views.download_file, name='download'),
    path('search/', views.search_ajax, name='search'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('register/', views.register, name='register'),
]