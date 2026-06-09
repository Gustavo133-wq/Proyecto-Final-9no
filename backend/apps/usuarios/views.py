from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, UserPermission
from .serializers import (
    LoginSerializer, UserSerializer, CreateUserSerializer,
    UpdateUserSerializer, SetPermissionsSerializer, UserPermissionSerializer
)
from .permissions import IsAdmin, build_permissions_map


class LoginView(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        refresh = RefreshToken.for_user(user)
        perms_map = build_permissions_map(user)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "phone": user.phone,
                "is_admin": user.is_admin,
                "permissions": perms_map,
            }
        })


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception:
            pass
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        perms_map = build_permissions_map(request.user)
        return Response(UserSerializer(request.user).data | {"permissions": perms_map})


class UserListCreateView(ListCreateAPIView):
    permission_classes = (IsAdmin,)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return CreateUserSerializer
        return UserSerializer

    def get_queryset(self):
        return User.objects.prefetch_related("custom_permissions").all()


class UserDetailView(RetrieveUpdateDestroyAPIView):
    queryset = User.objects.prefetch_related("custom_permissions").all()
    permission_classes = (IsAdmin,)

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return UpdateUserSerializer
        return UserSerializer


class UserPermissionsView(APIView):
    permission_classes = (IsAdmin,)

    def get(self, request, pk):
        user = User.objects.get(pk=pk)
        perms = UserPermission.objects.filter(user=user)
        return Response(UserPermissionSerializer(perms, many=True).data)

    def put(self, request, pk):
        user = User.objects.get(pk=pk)
        serializer = SetPermissionsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        UserPermission.objects.filter(user=user).delete()
        for perm in serializer.validated_data["permissions"]:
            UserPermission.objects.create(user=user, **perm)
        perms = UserPermission.objects.filter(user=user)
        return Response(UserPermissionSerializer(perms, many=True).data)