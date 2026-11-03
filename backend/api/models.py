import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
    ROLE_STUDENT = 'student'
    ROLE_ADMIN = 'admin'
    ROLE_TECHNICIAN = 'technician'

    ROLE_CHOICES = (
        (ROLE_STUDENT, 'Student'),
        (ROLE_ADMIN, 'Admin'),
        (ROLE_TECHNICIAN, 'Technician'),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default=ROLE_STUDENT)
    phone = models.CharField(max_length=20, blank=True, default='')
    department = models.CharField(max_length=100, blank=True, default='')

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"


class Building(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    description = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.code})"


class Floor(models.Model):
    building = models.ForeignKey(Building, on_delete=models.CASCADE, related_name='floors')
    floor_number = models.IntegerField()
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['floor_number']
        constraints = [
            models.UniqueConstraint(fields=['building', 'floor_number'], name='unique_building_floor')
        ]

    def __str__(self):
        return f"{self.building.name} - {self.name}"


class Room(models.Model):
    floor = models.ForeignKey(Floor, on_delete=models.CASCADE, related_name='rooms')
    room_number = models.CharField(max_length=50)
    name = models.CharField(max_length=100)
    room_type = models.CharField(max_length=50, default='Laboratory')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['room_number']
        constraints = [
            models.UniqueConstraint(fields=['floor', 'room_number'], name='unique_floor_room')
        ]

    def __str__(self):
        return f"{self.name} ({self.room_number}) - {self.floor.name}"


class Equipment(models.Model):
    STATUS_WORKING = 'Working'
    STATUS_NOT_WORKING = 'Not Working'

    STATUS_CHOICES = (
        (STATUS_WORKING, 'Working'),
        (STATUS_NOT_WORKING, 'Not Working'),
    )

    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='equipment')
    name = models.CharField(max_length=100)
    equipment_id = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_WORKING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['equipment_id']

    def __str__(self):
        return f"{self.name} - {self.equipment_id} ({self.status})"


class Complaint(models.Model):
    STATUS_PENDING = 'Pending'
    STATUS_ASSIGNED = 'Assigned'
    STATUS_IN_PROGRESS = 'In Progress'
    STATUS_RESOLVED = 'Resolved'

    STATUS_CHOICES = (
        (STATUS_PENDING, 'Pending'),
        (STATUS_ASSIGNED, 'Assigned'),
        (STATUS_IN_PROGRESS, 'In Progress'),
        (STATUS_RESOLVED, 'Resolved'),
    )

    ticket_id = models.CharField(max_length=32, unique=True, editable=False)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='complaints')
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='complaints')
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_complaints'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if not self.ticket_id:
            # Generate unique ticket ID like TKT-20261102-XXXX
            today_str = timezone.now().strftime('%Y%m%d')
            rand_suffix = uuid.uuid4().hex[:5].upper()
            self.ticket_id = f"TKT-{today_str}-{rand_suffix}"

        # If marking resolved, set resolved_at if not set
        if self.status == self.STATUS_RESOLVED and not self.resolved_at:
            self.resolved_at = timezone.now()

        super().save(*args, **kwargs)

        # Update equipment status based on complaint lifecycle
        if is_new and self.status != self.STATUS_RESOLVED:
            # New active complaint marks equipment as Not Working
            self.equipment.status = Equipment.STATUS_NOT_WORKING
            self.equipment.save(update_fields=['status', 'updated_at'])
        elif self.status == self.STATUS_RESOLVED:
            # Check if there are other unresolved complaints on this equipment
            other_active = Complaint.objects.filter(
                equipment=self.equipment
            ).exclude(pk=self.pk).exclude(status=self.STATUS_RESOLVED).exists()
            if not other_active:
                self.equipment.status = Equipment.STATUS_WORKING
                self.equipment.save(update_fields=['status', 'updated_at'])

    def __str__(self):
        return f"{self.ticket_id} - {self.equipment.equipment_id} ({self.status})"


class RepairRemark(models.Model):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='remarks')
    technician = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='repair_remarks'
    )
    status_from = models.CharField(max_length=20)
    status_to = models.CharField(max_length=20)
    remarks = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.complaint.ticket_id}: {self.status_from} -> {self.status_to}"
