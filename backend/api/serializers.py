from rest_framework import serializers
from .models import User, Building, Floor, Room, Equipment, Complaint, RepairRemark


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'phone', 'department', 'date_joined'
        ]
        read_only_fields = ['id', 'date_joined']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=4)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'password', 'email', 'first_name',
            'last_name', 'role', 'phone', 'department'
        ]

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class BuildingSerializer(serializers.ModelSerializer):
    floors_count = serializers.SerializerMethodField()
    rooms_count = serializers.SerializerMethodField()
    equipment_count = serializers.SerializerMethodField()

    class Meta:
        model = Building
        fields = [
            'id', 'name', 'code', 'description',
            'floors_count', 'rooms_count', 'equipment_count', 'created_at'
        ]

    def get_floors_count(self, obj):
        return obj.floors.count()

    def get_rooms_count(self, obj):
        return Room.objects.filter(floor__building=obj).count()

    def get_equipment_count(self, obj):
        return Equipment.objects.filter(room__floor__building=obj).count()


class FloorSerializer(serializers.ModelSerializer):
    building_name = serializers.CharField(source='building.name', read_only=True)
    building_code = serializers.CharField(source='building.code', read_only=True)
    rooms_count = serializers.SerializerMethodField()
    equipment_count = serializers.SerializerMethodField()

    class Meta:
        model = Floor
        fields = [
            'id', 'building', 'building_name', 'building_code',
            'floor_number', 'name', 'rooms_count', 'equipment_count', 'created_at'
        ]

    def get_rooms_count(self, obj):
        return obj.rooms.count()

    def get_equipment_count(self, obj):
        return Equipment.objects.filter(room__floor=obj).count()


class RoomSerializer(serializers.ModelSerializer):
    floor_name = serializers.CharField(source='floor.name', read_only=True)
    floor_number = serializers.IntegerField(source='floor.floor_number', read_only=True)
    building_id = serializers.IntegerField(source='floor.building.id', read_only=True)
    building_name = serializers.CharField(source='floor.building.name', read_only=True)
    equipment_count = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = [
            'id', 'floor', 'floor_name', 'floor_number',
            'building_id', 'building_name', 'room_number', 'name',
            'room_type', 'equipment_count', 'created_at'
        ]

    def get_equipment_count(self, obj):
        return obj.equipment.count()


class EquipmentSerializer(serializers.ModelSerializer):
    room_name = serializers.CharField(source='room.name', read_only=True)
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    floor_id = serializers.IntegerField(source='room.floor.id', read_only=True)
    floor_name = serializers.CharField(source='room.floor.name', read_only=True)
    floor_number = serializers.IntegerField(source='room.floor.floor_number', read_only=True)
    building_id = serializers.IntegerField(source='room.floor.building.id', read_only=True)
    building_name = serializers.CharField(source='room.floor.building.name', read_only=True)
    complaints_count = serializers.SerializerMethodField()
    active_complaints_count = serializers.SerializerMethodField()

    class Meta:
        model = Equipment
        fields = [
            'id', 'room', 'room_name', 'room_number',
            'floor_id', 'floor_name', 'floor_number',
            'building_id', 'building_name', 'name', 'equipment_id',
            'status', 'complaints_count', 'active_complaints_count',
            'created_at', 'updated_at'
        ]

    def get_complaints_count(self, obj):
        return obj.complaints.count()

    def get_active_complaints_count(self, obj):
        return obj.complaints.exclude(status=Complaint.STATUS_RESOLVED).count()


class RepairRemarkSerializer(serializers.ModelSerializer):
    technician_name = serializers.SerializerMethodField()

    class Meta:
        model = RepairRemark
        fields = [
            'id', 'complaint', 'technician', 'technician_name',
            'status_from', 'status_to', 'remarks', 'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'technician_name']

    def get_technician_name(self, obj):
        if obj.technician:
            name = f"{obj.technician.first_name} {obj.technician.last_name}".strip()
            return name if name else obj.technician.username
        return 'System'


class ComplaintSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_email = serializers.EmailField(source='student.email', read_only=True)
    student_phone = serializers.CharField(source='student.phone', read_only=True)
    equipment_name = serializers.CharField(source='equipment.name', read_only=True)
    equipment_id_str = serializers.CharField(source='equipment.equipment_id', read_only=True)
    room_id = serializers.IntegerField(source='equipment.room.id', read_only=True)
    room_name = serializers.CharField(source='equipment.room.name', read_only=True)
    room_number = serializers.CharField(source='equipment.room.room_number', read_only=True)
    floor_id = serializers.IntegerField(source='equipment.room.floor.id', read_only=True)
    floor_name = serializers.CharField(source='equipment.room.floor.name', read_only=True)
    building_id = serializers.IntegerField(source='equipment.room.floor.building.id', read_only=True)
    building_name = serializers.CharField(source='equipment.room.floor.building.name', read_only=True)
    assigned_to_name = serializers.SerializerMethodField()
    remarks = RepairRemarkSerializer(many=True, read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id', 'ticket_id', 'student', 'student_name', 'student_email', 'student_phone',
            'equipment', 'equipment_name', 'equipment_id_str',
            'room_id', 'room_name', 'room_number',
            'floor_id', 'floor_name', 'building_id', 'building_name',
            'description', 'status', 'assigned_to', 'assigned_to_name',
            'created_at', 'updated_at', 'resolved_at', 'remarks'
        ]
        read_only_fields = ['id', 'ticket_id', 'created_at', 'updated_at', 'resolved_at']

    def get_student_name(self, obj):
        name = f"{obj.student.first_name} {obj.student.last_name}".strip()
        return name if name else obj.student.username

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            name = f"{obj.assigned_to.first_name} {obj.assigned_to.last_name}".strip()
            return name if name else obj.assigned_to.username
        return None


class ComplaintCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = ['id', 'ticket_id', 'equipment', 'description', 'status', 'created_at']
        read_only_fields = ['id', 'ticket_id', 'status', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        complaint = Complaint.objects.create(
            student=user,
            equipment=validated_data['equipment'],
            description=validated_data['description'],
            status=Complaint.STATUS_PENDING
        )
        # Log initial creation in remarks
        RepairRemark.objects.create(
            complaint=complaint,
            technician=user,
            status_from='',
            status_to=Complaint.STATUS_PENDING,
            remarks=f"Complaint registered by {user.username}."
        )
        return complaint
