from rest_framework.permissions import BasePermission
from .models import UserPermission, Scope


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin


def build_permissions_map(user):
    if user.is_admin:
        return None
    perms = {}
    for p in UserPermission.objects.filter(user=user):
        if p.module not in perms:
            perms[p.module] = {}
        perms[p.module][p.action] = p.scope
    return perms


def has_permission(user, module, action):
    if user.is_admin:
        return True
    return UserPermission.objects.filter(user=user, module=module, action=action).exists()


def get_scope(user, module, action):
    if user.is_admin:
        return Scope.ALL
    perm = UserPermission.objects.filter(user=user, module=module, action=action).first()
    return perm.scope if perm else None


class HasModulePermission(BasePermission):
    module = ""
    action = ""

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return has_permission(request.user, self.module, self.action)