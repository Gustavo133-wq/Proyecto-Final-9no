from django.urls import path
from .views import LoginView, LogoutView, MeView, UserListCreateView, UserDetailView, UserPermissionsView

urlpatterns = [
    path("auth/login/", LoginView.as_view()),
    path("auth/logout/", LogoutView.as_view()),
    path("auth/me/", MeView.as_view()),
    path("users/", UserListCreateView.as_view()),
    path("users/<int:pk>/", UserDetailView.as_view()),
    path("users/<int:pk>/permissions/", UserPermissionsView.as_view()),
]