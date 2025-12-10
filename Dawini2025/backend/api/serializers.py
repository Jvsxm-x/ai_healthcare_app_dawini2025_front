from rest_framework import serializers
from django.contrib.auth.models import User
from .models import PatientProfile, Alert

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username','email']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True, required=False)
    class Meta:
        model = User
        fields = ('username','email','password','role')
    def create(self, validated_data):
        role = validated_data.pop('role', 'patient')
        user = User(username=validated_data['username'], email=validated_data.get('email',''))
        user.set_password(validated_data['password'])
        user.save()
        PatientProfile.objects.create(user=user, role=role)
        return user

class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = PatientProfile
        fields = '__all__'

class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = '__all__'
