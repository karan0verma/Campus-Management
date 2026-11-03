from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Building, Floor, Room, Equipment, Complaint, RepairRemark


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'role', 'first_name', 'last_name', 'email', 'phone', 'department', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_superuser', 'is_active')
    search_fields = ('username', 'first_name', 'last_name', 'email', 'phone', 'department')
    ordering = ('username',)
    fieldsets = BaseUserAdmin.fieldsets + (
        ('CampusOps Profile', {'fields': ('role', 'phone', 'department')}),
    )
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('CampusOps Profile', {'fields': ('role', 'phone', 'department')}),
    )


@admin.register(Building)
class BuildingAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'description', 'created_at')
    search_fields = ('code', 'name')
    ordering = ('name',)


@admin.register(Floor)
class FloorAdmin(admin.ModelAdmin):
    list_display = ('building', 'floor_number', 'name', 'created_at')
    list_filter = ('building',)
    search_fields = ('name', 'building__name', 'building__code')
    ordering = ('building', 'floor_number')


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('room_number', 'name', 'room_type', 'floor', 'get_building', 'created_at')
    list_filter = ('room_type', 'floor__building')
    search_fields = ('room_number', 'name', 'floor__name', 'floor__building__name')
    ordering = ('room_number',)

    @admin.display(description='Building')
    def get_building(self, obj):
        return obj.floor.building.name


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ('equipment_id', 'name', 'room', 'get_building', 'status', 'created_at', 'updated_at')
    list_filter = ('status', 'room__floor__building')
    search_fields = ('equipment_id', 'name', 'room__room_number', 'room__name')
    ordering = ('equipment_id',)

    @admin.display(description='Building')
    def get_building(self, obj):
        return obj.room.floor.building.name


class RepairRemarkInline(admin.TabularInline):
    model = RepairRemark
    extra = 0
    readonly_fields = ('created_at',)


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ('ticket_id', 'student', 'equipment', 'status', 'assigned_to', 'created_at', 'resolved_at')
    list_filter = ('status', 'assigned_to')
    search_fields = ('ticket_id', 'description', 'student__username', 'equipment__equipment_id', 'equipment__name')
    ordering = ('-created_at',)
    inlines = [RepairRemarkInline]


@admin.register(RepairRemark)
class RepairRemarkAdmin(admin.ModelAdmin):
    list_display = ('complaint', 'technician', 'status_from', 'status_to', 'remarks', 'created_at')
    list_filter = ('status_from', 'status_to', 'technician')
    search_fields = ('complaint__ticket_id', 'remarks', 'technician__username')
    ordering = ('-created_at',)
