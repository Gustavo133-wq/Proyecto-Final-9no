from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, UserPermission


class UserPermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPermission
        fields = ("module", "action", "scope")


class UserSerializer(serializers.ModelSerializer):
    permissions = UserPermissionSerializer(source="custom_permissions", many=True, read_only=True)

    class Meta:
        model = User
        fields = ("id", "username", "email", "first_name", "last_name", "phone", "is_admin", "permissions")
        read_only_fields = ("id", "permissions")


class CreateUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    permissions = serializers.ListField(child=serializers.DictField(), write_only=True, required=False)

    class Meta:
        model = User
        fields = ("username", "email", "first_name", "last_name", "phone", "is_admin", "password", "permissions")

    def create(self, validated_data):
        permissions_data = validated_data.pop("permissions", [])
        user = User.objects.create_user(**validated_data)
        for perm in permissions_data:
            UserPermission.objects.create(user=user, **perm)
        return user


class UpdateUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("email", "first_name", "last_name", "phone", "is_admin")


class SetPermissionsSerializer(serializers.Serializer):
    permissions = serializers.ListField(child=serializers.DictField())

    def validate_permissions(self, value):
        valid_serializers = []
        for item in value:
            s = UserPermissionSerializer(data=item)
            s.is_valid(raise_exception=True)
            valid_serializers.append(s.validated_data)
        return valid_serializers


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data["username"], password=data["password"])
        if not user:
            raise serializers.ValidationError("Credenciales incorrectas.")
        if not user.is_active:
            raise serializers.ValidationError("Usuario inactivo.")
        data["user"] = user
        return data