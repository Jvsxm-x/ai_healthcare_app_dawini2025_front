# backend/api/serializers.py

from datetime import datetime
import bcrypt
from bson import Binary, ObjectId
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import PatientProfile, Alert, VitalsRecord
from .mongo_models import collections
Clinic=collections['clinics']
# Serializer pour les champs du User qui existent vraiment
class UserBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['username', 'email']


# Serializer principal du profil patient (le plus important)
class PatientProfileSerializer(serializers.ModelSerializer):
    user = UserBasicSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = PatientProfile
        fields = [
            'id',
            'user',
            'birth_date',
            'phone',
            'address',           # ← celui-ci est dans PatientProfile, pas dans User
            'emergency_contact',
            'medical_history',
            'role',
            'full_name'
        ]
        read_only_fields = ['role', 'user']

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username


# Pour l'inscription (tu avais déjà un bon serializer)
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True, required=False, default='patient')

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'role', 'first_name', 'last_name')

    def create(self, validated_data):
        role = validated_data.pop('role', 'patient')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        PatientProfile.objects.create(user=user, role=role)
        return user


# Alertes
class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = '__all__'


# Pour la prédiction ML
class VitalsSerializer(serializers.Serializer):
    class Meta:
        model = VitalsRecord
        fields = [
            'id',
            'systolic',
            'diastolic',
            'glucose',
            'heart_rate',
            'spo2',
            'temperature',
            'timestamp',
            'patient'  # on l'accepte en lecture, mais on l'ignore en écriture
        ]
        read_only_fields = ['timestamp', 'patient']  # très important !

    # Optionnel : pour afficher le nom du patient
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        ret['patient_name'] = f"{instance.patient.user.first_name} {instance.patient.user.last_name}".strip()
        return ret
    def create(self, validated_data):
        request = self.context.get('request')
        patient_profile = PatientProfile.objects.get(user=request.user)
        validated_data['patient'] = patient_profile
        return super().create(validated_data)
    def update(self, instance, validated_data):
        # On n'autorise pas la mise à jour des enregistrements vitaux pour l'instant
        raise NotImplementedError("Updating vitals records is not supported.")
class VitalsRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = VitalsRecord
        fields = '__all__'

    def create(self, validated_data):
        return VitalsRecord.objects.create(**validated_data)


# backend/api/serializers.py
from bson.errors import InvalidId
from django.contrib.auth.hashers import make_password
from .mongo_models import collections
Clinic = collections['clinics']
Users = collections['users']
ClinicStaff = collections['clinic_staff']
class UserSerializer(serializers.Serializer):
    _id = serializers.CharField(read_only=True)
    username = serializers.CharField()
    email = serializers.EmailField()
    first_name = serializers.CharField(allow_blank=True)
    last_name = serializers.CharField(allow_blank=True)
    phone = serializers.CharField(allow_blank=True, required=False)
    role = serializers.CharField()
    is_active = serializers.BooleanField(default=True)
    clinic = serializers.CharField(allow_null=True)
    clinic_name = serializers.SerializerMethodField()
    clinic_logo = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(read_only=True)

    def get_clinic_name(self, obj):
        if not obj.get('clinic'):
            return None
        try:
            clinic = Clinic.find_one({"_id": ObjectId(obj['clinic'])})
            return clinic.get('name') if clinic else None
        except:
            return None

    def get_clinic_logo(self, obj):
        if not obj.get('clinic'):
            return None
        try:
            clinic = Clinic.find_one({"_id": ObjectId(obj['clinic'])})
            return clinic.get('logo_url') if clinic else None
        except:
            return None
class ClinicStaffCreateSerializer(serializers.Serializer):
    # Champs obligatoires
    username = serializers.CharField(required=True)
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=['clinic_staff', 'clinic_admin'], required=True)
    clinic = serializers.CharField(required=True)  # ObjectId string

    # Champs optionnels (profil complet)
    first_name = serializers.CharField(required=False, allow_blank=True, default='')
    last_name = serializers.CharField(required=False, allow_blank=True, default='')
    phone = serializers.CharField(required=False, allow_blank=True, default='')
    birth_date = serializers.DateField(required=False, allow_null=True, default=None)
    address = serializers.CharField(required=False, allow_blank=True, default='')
    bio = serializers.CharField(required=False, allow_blank=True, default='')
    specialty = serializers.CharField(required=False, allow_blank=True, default='')
    rating = serializers.FloatField(required=False, default=0.0)
    location = serializers.CharField(required=False, allow_blank=True, default='Non précisé')
    years_experience = serializers.IntegerField(required=False, default=0)
    avatar_url = serializers.URLField(required=False, allow_blank=True, default='')
    is_verified = serializers.BooleanField(required=False, default=False)
    consultation_price = serializers.IntegerField(required=False, default=0)

    # ─── VALIDATIONS ─────────────────────────────────────────────────────
    def validate_email(self, value):
        if Users.find_one({"email": {"$regex": f"^{value}$", "$options": "i"}}):
            raise serializers.ValidationError("Cet email est déjà utilisé.")
        return value.lower()

    def validate_username(self, value):
        if Users.find_one({"username": {"$regex": f"^{value}$", "$options": "i"}}):
            raise serializers.ValidationError("Ce nom d'utilisateur est déjà pris.")
        return value.lower()

    def validate_clinic(self, value):
        try:
            oid = ObjectId(value)
        except InvalidId:
            raise serializers.ValidationError("Format d'ObjectId invalide.")
        if not Clinic.find_one({"_id": oid, "is_active": True}):
            raise serializers.ValidationError("Clinique introuvable ou désactivée.")
        return str(oid)

    # ─── CRÉATION ────────────────────────────────────────────────────────
    def create(self, validated_data):
        raw_password = validated_data.pop('password')
        clinic_id = validated_data.pop('clinic')

        # Hachage bcrypt (comme dans ton ancien système)
        password_hash_binary = Binary(bcrypt.hashpw(raw_password.encode('utf-8'), bcrypt.gensalt()))

        now = datetime.utcnow()

        # 1. Création dans la collection `users`
        user_doc = {
            "username": validated_data['username'],
            "email": validated_data['email'],
            "password_hash": password_hash_binary,
            "role": validated_data['role'],
            "first_name": validated_data.get('first_name', ''),
            "last_name": validated_data.get('last_name', ''),
            "phone": validated_data.get('phone', ''),
            "birth_date": validated_data.get('birth_date'),
            "address": validated_data.get('address', ''),
            "bio": validated_data.get('bio', ''),
            "specialty": validated_data.get('specialty', ''),
            "rating": validated_data.get('rating', 0.0),
            "location": validated_data.get('location', 'Non précisé'),
            "years_experience": validated_data.get('years_experience', 0),
            "avatar_url": validated_data.get('avatar_url', ''),
            "is_verified": validated_data.get('is_verified', False),
            "consultation_price": validated_data.get('consultation_price', 0),
            "clinic": clinic_id,
            "is_active": True,
            "created_at": now,
            "updated_at": now,
        }

        result = Users.insert_one(user_doc)
        user_id = result.inserted_id

        # 2. Création dans la collection `clinic_staff` (liaison)
        staff_role = "admin" if validated_data['role'] == "clinic_admin" else "staff"

        ClinicStaff.insert_one({
            "clinic_id": ObjectId(clinic_id),
            "user_username": validated_data['username'],
            "role": staff_role,
            "created_at": now
        })

        # Récupération du user créé pour le retour
        created_user = Users.find_one({"_id": user_id})
        created_user['_id'] = str(created_user['_id'])

        return created_user

    # ─── REPRÉSENTATION ──────────────────────────────────────────────────
    def to_representation(self, instance):
        clinic_name = None
        clinic_logo = None
        if instance.get('clinic'):
            try:
                clinic = Clinic.find_one({"_id": ObjectId(instance['clinic'])})
                if clinic:
                    clinic_name = clinic.get('name')
                    clinic_logo = clinic.get('logo_url')
            except:
                pass

        return {
            "_id": instance['_id'],
            "username": instance['username'],
            "email": instance['email'],
            "first_name": instance.get('first_name', ''),
            "last_name": instance.get('last_name', ''),
            "phone": instance.get('phone', ''),
            "role": instance['role'],
            "clinic": instance.get('clinic'),
            "clinic_name": clinic_name,
            "clinic_logo": clinic_logo,
            "bio": instance.get('bio', ''),
            "specialty": instance.get('specialty', ''),
            "rating": instance.get('rating', 0.0),
            "location": instance.get('location', ''),
            "years_experience": instance.get('years_experience', 0),
            "avatar_url": instance.get('avatar_url', ''),
            "is_verified": instance.get('is_verified', False),
            "consultation_price": instance.get('consultation_price', 0),
            "is_active": instance.get('is_active', True),
            "created_at": instance.get('created_at'),
            "updated_at": instance.get('updated_at'),
        }