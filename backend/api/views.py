from django.shortcuts import get_object_or_404
from django.contrib.auth import authenticate
from django.utils import timezone
from django.db import models
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, Building, Floor, Room, Equipment, Complaint, RepairRemark
from .serializers import (
    UserSerializer, UserCreateSerializer,
    BuildingSerializer, FloorSerializer, RoomSerializer,
    EquipmentSerializer, ComplaintSerializer, ComplaintCreateSerializer,
    RepairRemarkSerializer
)
from .permissions import IsAdminRole, IsAdminOrReadOnly, IsTechnicianRole, IsStudentRole

# Master passkeys for registering staff roles securely
ADMIN_PASSKEY = "ADMIN@CAMPUS2026"
TECH_PASSKEY = "TECH@CAMPUS2026"


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    """
    Self-service registration for Students, Technicians, and Admins.
    Technicians and Admins require secret authorization passkeys issued by the Head Administrator.
    """
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()
    role = request.data.get('role', User.ROLE_STUDENT).strip().lower()
    security_key = request.data.get('security_key', '').strip()
    email = request.data.get('email', '').strip()
    first_name = request.data.get('first_name', '').strip()
    last_name = request.data.get('last_name', '').strip()
    phone = request.data.get('phone', '').strip()
    department = request.data.get('department', '').strip()

    if not username or not password:
        return Response(
            {'error': 'Username and password are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if role not in [User.ROLE_STUDENT, User.ROLE_TECHNICIAN, User.ROLE_ADMIN]:
        return Response(
            {'error': f'Invalid role "{role}". Allowed roles are: student, technician, admin.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Security check for staff roles
    if role == User.ROLE_ADMIN:
        if security_key != ADMIN_PASSKEY:
            return Response(
                {
                    'error': 'Invalid Master Admin Passkey. Only authorized personnel with the Master Admin Passkey can register as Admin.'
                },
                status=status.HTTP_403_FORBIDDEN
            )
    elif role == User.ROLE_TECHNICIAN:
        if security_key not in [TECH_PASSKEY, ADMIN_PASSKEY]:
            return Response(
                {
                    'error': 'Invalid Technician Passkey. Please enter the unique security key provided by the College Administrator.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

    if User.objects.filter(username=username).exists():
        return Response(
            {'error': f'An account with username "{username}" already exists. Please choose a different username.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    default_dept = 'General Student' if role == User.ROLE_STUDENT else (
        'Maintenance & Repairs' if role == User.ROLE_TECHNICIAN else 'Campus Administration'
    )

    user = User.objects.create_user(
        username=username,
        password=password,
        email=email,
        first_name=first_name,
        last_name=last_name,
        role=role,
        phone=phone,
        department=department or default_dept
    )

    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user).data
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """
    Authenticate user and return JWT tokens and user profile.
    """
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'error': 'Username and password are required.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    user = authenticate(request, username=username, password=password)
    if not user:
        return Response(
            {'error': 'Invalid username or password.'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user).data
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def me_view(request):
    """
    Return currently authenticated user profile.
    """
    return Response(UserSerializer(request.user).data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def technicians_list_view(request):
    """
    List all technicians for assignment dropdowns.
    """
    technicians = User.objects.filter(role=User.ROLE_TECHNICIAN, is_active=True)
    return Response(UserSerializer(technicians, many=True).data)


class UserViewSet(viewsets.ModelViewSet):
    """
    Manage users (Admins only).
    """
    queryset = User.objects.all().order_by('-date_joined')
    permission_classes = [IsAdminRole]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(username__icontains=search)
        return queryset

    @action(detail=False, methods=['get'])
    def passkeys(self, request):
        """
        Return the authorization passkeys for staff registration (Admin only).
        """
        return Response({
            'admin_passkey': ADMIN_PASSKEY,
            'technician_passkey': TECH_PASSKEY,
            'message': 'Share these passkeys only with authorized personnel for account creation.'
        })


class BuildingViewSet(viewsets.ModelViewSet):
    queryset = Building.objects.all()
    serializer_class = BuildingSerializer
    permission_classes = [IsAdminOrReadOnly]


class FloorViewSet(viewsets.ModelViewSet):
    queryset = Floor.objects.all().select_related('building')
    serializer_class = FloorSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        building_id = self.request.query_params.get('building')
        if building_id:
            queryset = queryset.filter(building_id=building_id)
        return queryset


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all().select_related('floor', 'floor__building')
    serializer_class = RoomSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        floor_id = self.request.query_params.get('floor')
        building_id = self.request.query_params.get('building')
        if floor_id:
            queryset = queryset.filter(floor_id=floor_id)
        if building_id:
            queryset = queryset.filter(floor__building_id=building_id)
        return queryset


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def college_layout_tree(request):
    """
    Return full hierarchical layout tree for navigation:
    College -> Buildings -> Floors -> Rooms (with equipment summary)
    """
    buildings = Building.objects.prefetch_related(
        'floors__rooms__equipment'
    ).all()

    tree_data = []
    for b in buildings:
        floors_data = []
        for f in b.floors.all():
            rooms_data = []
            for r in f.rooms.all():
                rooms_data.append({
                    'id': r.id,
                    'room_number': r.room_number,
                    'name': r.name,
                    'room_type': r.room_type,
                    'equipment_count': r.equipment.count(),
                    'working_count': r.equipment.filter(status=Equipment.STATUS_WORKING).count(),
                    'faulty_count': r.equipment.filter(status=Equipment.STATUS_NOT_WORKING).count(),
                })
            floors_data.append({
                'id': f.id,
                'floor_number': f.floor_number,
                'name': f.name,
                'rooms': rooms_data,
                'rooms_count': len(rooms_data),
            })
        tree_data.append({
            'id': b.id,
            'name': b.name,
            'code': b.code,
            'description': b.description,
            'floors': floors_data,
            'floors_count': len(floors_data),
        })

    return Response(tree_data)


class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.all().select_related(
        'room', 'room__floor', 'room__floor__building'
    )
    serializer_class = EquipmentSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        room_id = self.request.query_params.get('room')
        floor_id = self.request.query_params.get('floor')
        building_id = self.request.query_params.get('building')
        status_param = self.request.query_params.get('status')
        search = self.request.query_params.get('search')

        if room_id:
            queryset = queryset.filter(room_id=room_id)
        if floor_id:
            queryset = queryset.filter(room__floor_id=floor_id)
        if building_id:
            queryset = queryset.filter(room__floor__building_id=building_id)
        if status_param:
            queryset = queryset.filter(status=status_param)
        if search:
            queryset = queryset.filter(
                models.Q(name__icontains=search) |
                models.Q(equipment_id__icontains=search)
            )
        return queryset

    @action(detail=False, methods=['post'], permission_classes=[IsAdminRole])
    def bulk_create(self, request):
        """
        Quickly generate multiple equipment items with naming prefix (e.g. R101-PC-01 to 30)
        """
        room_id = request.data.get('room')
        name = request.data.get('name', 'Equipment').strip()
        prefix = request.data.get('prefix', '').strip().upper()
        count = int(request.data.get('count', 1))
        start_num = int(request.data.get('start', 1))

        if not room_id or not prefix:
            return Response(
                {'error': 'room and prefix (e.g. R101-PC-) are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        room = get_object_or_404(Room, id=room_id)
        created_items = []
        for i in range(start_num, start_num + count):
            eq_id = f"{prefix}{i:02d}" if count < 100 else f"{prefix}{i:03d}"
            if not Equipment.objects.filter(equipment_id=eq_id).exists():
                eq = Equipment.objects.create(
                    room=room,
                    name=name,
                    equipment_id=eq_id,
                    status=Equipment.STATUS_WORKING
                )
                created_items.append(eq)

        return Response(
            EquipmentSerializer(created_items, many=True).data,
            status=status.HTTP_201_CREATED
        )

    @action(detail=True, methods=['get'])
    def history(self, request, pk=None):
        """
        Get complete maintenance, complaint, and repair history for an equipment item.
        """
        equipment = self.get_object()
        complaints = equipment.complaints.select_related(
            'student', 'assigned_to'
        ).prefetch_related('remarks', 'remarks__technician').order_by('-created_at')

        history_data = []
        for comp in complaints:
            history_data.append({
                'ticket_id': comp.ticket_id,
                'complaint_id': comp.id,
                'description': comp.description,
                'status': comp.status,
                'student_name': f"{comp.student.first_name} {comp.student.last_name}".strip() or comp.student.username,
                'assigned_to': (f"{comp.assigned_to.first_name} {comp.assigned_to.last_name}".strip() or comp.assigned_to.username) if comp.assigned_to else None,
                'created_at': comp.created_at,
                'resolved_at': comp.resolved_at,
                'remarks': [
                    {
                        'id': rem.id,
                        'technician': (f"{rem.technician.first_name} {rem.technician.last_name}".strip() or rem.technician.username) if rem.technician else 'System',
                        'status_from': rem.status_from,
                        'status_to': rem.status_to,
                        'remarks': rem.remarks,
                        'created_at': rem.created_at,
                    }
                    for rem in comp.remarks.all()
                ]
            })

        return Response({
            'equipment': EquipmentSerializer(equipment).data,
            'history': history_data
        })

    @action(detail=True, methods=['patch'], permission_classes=[IsAdminRole])
    def update_status(self, request, pk=None):
        """
        Allow admin to manually override equipment working status.
        """
        equipment = self.get_object()
        new_status = request.data.get('status')
        if new_status not in [Equipment.STATUS_WORKING, Equipment.STATUS_NOT_WORKING]:
            return Response(
                {'error': 'Invalid status. Must be Working or Not Working.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        equipment.status = new_status
        equipment.save()
        return Response(EquipmentSerializer(equipment).data)


class ComplaintViewSet(viewsets.ModelViewSet):
    queryset = Complaint.objects.all().select_related(
        'student', 'equipment', 'equipment__room',
        'equipment__room__floor', 'equipment__room__floor__building',
        'assigned_to'
    ).prefetch_related('remarks', 'remarks__technician')

    def get_serializer_class(self):
        if self.action == 'create':
            return ComplaintCreateSerializer
        return ComplaintSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        complaint = serializer.save()
        return Response(ComplaintSerializer(complaint).data, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        if user.role == User.ROLE_STUDENT:
            queryset = queryset.filter(student=user)
        elif user.role == User.ROLE_TECHNICIAN:
            queryset = queryset.filter(assigned_to=user)
        # Admin sees all complaints

        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        equipment_id = self.request.query_params.get('equipment')
        if equipment_id:
            queryset = queryset.filter(equipment_id=equipment_id)

        technician_id = self.request.query_params.get('technician')
        if technician_id:
            queryset = queryset.filter(assigned_to_id=technician_id)

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                models.Q(ticket_id__icontains=search) |
                models.Q(description__icontains=search) |
                models.Q(equipment__equipment_id__icontains=search) |
                models.Q(equipment__name__icontains=search)
            )

        return queryset

    @action(detail=True, methods=['post'], permission_classes=[IsAdminRole])
    def assign(self, request, pk=None):
        """
        Admin assigns complaint to a registered technician.
        """
        complaint = self.get_object()
        technician_id = request.data.get('technician_id')

        if not technician_id:
            return Response(
                {'error': 'technician_id is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        technician = get_object_or_404(User, id=technician_id, role=User.ROLE_TECHNICIAN)
        status_before = complaint.status
        complaint.assigned_to = technician
        complaint.status = Complaint.STATUS_ASSIGNED
        complaint.save()

        # Log repair history
        RepairRemark.objects.create(
            complaint=complaint,
            technician=technician,
            status_from=status_before,
            status_to=Complaint.STATUS_ASSIGNED,
            remarks=f"Complaint assigned to {technician.get_full_name() or technician.username} by Admin."
        )

        return Response(ComplaintSerializer(complaint).data)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """
        Technician or Admin updates repair progress:
        - Change status to In Progress
        - Enter repair remarks
        - Mark as Resolved (after completing repair)
        """
        complaint = self.get_object()
        user = request.user

        # Role permission check: must be admin or the assigned technician
        if user.role != User.ROLE_ADMIN and complaint.assigned_to != user:
            return Response(
                {'error': 'You do not have permission to update this complaint.'},
                status=status.HTTP_403_FORBIDDEN
            )

        new_status = request.data.get('status')
        remarks = request.data.get('remarks', '').strip()

        valid_transitions = [Complaint.STATUS_IN_PROGRESS, Complaint.STATUS_RESOLVED]
        if new_status not in valid_transitions:
            return Response(
                {'error': f'Status must be one of {valid_transitions}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_status == Complaint.STATUS_RESOLVED and not remarks:
            return Response(
                {'error': 'Repair remarks are required when marking a complaint as Resolved.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        status_before = complaint.status
        complaint.status = new_status
        if new_status == Complaint.STATUS_RESOLVED:
            complaint.resolved_at = timezone.now()
        complaint.save()

        # Save repair remark history
        RepairRemark.objects.create(
            complaint=complaint,
            technician=user if user.role == User.ROLE_TECHNICIAN else complaint.assigned_to,
            status_from=status_before,
            status_to=new_status,
            remarks=remarks or f"Status changed to {new_status}."
        )

        return Response(ComplaintSerializer(complaint).data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_stats_view(request):
    """
    Get dashboard metrics tailored to the requesting user's role.
    """
    user = request.user
    role = user.role

    if role == User.ROLE_ADMIN:
        total_complaints = Complaint.objects.count()
        pending = Complaint.objects.filter(status=Complaint.STATUS_PENDING).count()
        assigned = Complaint.objects.filter(status=Complaint.STATUS_ASSIGNED).count()
        in_progress = Complaint.objects.filter(status=Complaint.STATUS_IN_PROGRESS).count()
        resolved = Complaint.objects.filter(status=Complaint.STATUS_RESOLVED).count()

        total_equipment = Equipment.objects.count()
        working_equipment = Equipment.objects.filter(status=Equipment.STATUS_WORKING).count()
        faulty_equipment = Equipment.objects.filter(status=Equipment.STATUS_NOT_WORKING).count()

        total_buildings = Building.objects.count()
        total_floors = Floor.objects.count()
        total_rooms = Room.objects.count()
        total_technicians = User.objects.filter(role=User.ROLE_TECHNICIAN).count()
        total_students = User.objects.filter(role=User.ROLE_STUDENT).count()

        return Response({
            'role': role,
            'complaints': {
                'total': total_complaints,
                'pending': pending,
                'assigned': assigned,
                'in_progress': in_progress,
                'resolved': resolved,
            },
            'equipment': {
                'total': total_equipment,
                'working': working_equipment,
                'not_working': faulty_equipment,
            },
            'infrastructure': {
                'buildings': total_buildings,
                'floors': total_floors,
                'rooms': total_rooms,
            },
            'users': {
                'technicians': total_technicians,
                'students': total_students,
            }
        })

    elif role == User.ROLE_TECHNICIAN:
        assigned_complaints = Complaint.objects.filter(assigned_to=user)
        total_assigned = assigned_complaints.count()
        pending_action = assigned_complaints.filter(status=Complaint.STATUS_ASSIGNED).count()
        in_progress = assigned_complaints.filter(status=Complaint.STATUS_IN_PROGRESS).count()
        resolved = assigned_complaints.filter(status=Complaint.STATUS_RESOLVED).count()

        return Response({
            'role': role,
            'complaints': {
                'total': total_assigned,
                'assigned': pending_action,
                'in_progress': in_progress,
                'resolved': resolved,
            }
        })

    else:  # Student
        my_complaints = Complaint.objects.filter(student=user)
        return Response({
            'role': role,
            'complaints': {
                'total': my_complaints.count(),
                'pending': my_complaints.filter(status=Complaint.STATUS_PENDING).count(),
                'assigned': my_complaints.filter(status=Complaint.STATUS_ASSIGNED).count(),
                'in_progress': my_complaints.filter(status=Complaint.STATUS_IN_PROGRESS).count(),
                'resolved': my_complaints.filter(status=Complaint.STATUS_RESOLVED).count(),
            }
        })
