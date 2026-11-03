from rest_framework import permissions


class IsAdminRole(permissions.BasePermission):
    """Allows access only to users with role 'admin'."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == 'admin' or request.user.is_superuser)
        )


class IsTechnicianRole(permissions.BasePermission):
    """Allows access to users with role 'technician'."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'technician'
        )


class IsStudentRole(permissions.BasePermission):
    """Allows access to users with role 'student'."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            request.user.role == 'student'
        )


class IsAdminOrReadOnly(permissions.BasePermission):
    """Allows read access to any authenticated user, write access only to admins."""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.role == 'admin' or request.user.is_superuser
