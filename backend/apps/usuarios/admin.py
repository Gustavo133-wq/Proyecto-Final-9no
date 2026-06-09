from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, UserPermission


class UserPermissionInline(admin.TabularInline):
    model = UserPermission
    extra = 0


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    inlines = (UserPermissionInline,)
    fieldsets = UserAdmin.fieldsets + (
        ("Contratación Docente EMI", {"fields": ("is_admin", "phone")}),
    )
    list_display = ("username", "email", "first_name", "last_name", "is_admin", "is_active")
    list_filter = ("is_admin", "is_active")