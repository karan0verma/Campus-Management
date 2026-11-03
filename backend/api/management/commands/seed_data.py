from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from api.models import User, Building, Floor, Room, Equipment, Complaint, RepairRemark


class Command(BaseCommand):
    help = 'Populates the database with demo users, infrastructure hierarchy, equipment, and complaint history.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE('Beginning database seeding for CampusOps...'))

        # 1. Create Users
        admin_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@campusops.edu',
                'first_name': 'Administrator',
                'last_name': 'System',
                'role': User.ROLE_ADMIN,
                'phone': '+91 98765 43210',
                'department': 'Campus Infrastructure Management',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        admin_user.set_password('admin123')
        admin_user.save()

        tech_raj, _ = User.objects.get_or_create(
            username='tech_raj',
            defaults={
                'email': 'rajesh.kumar@campusops.edu',
                'first_name': 'Rajesh',
                'last_name': 'Kumar',
                'role': User.ROLE_TECHNICIAN,
                'phone': '+91 98111 22334',
                'department': 'Electrical & Hardware Maintenance',
            }
        )
        tech_raj.set_password('tech123')
        tech_raj.save()

        tech_priya, _ = User.objects.get_or_create(
            username='tech_priya',
            defaults={
                'email': 'priya.sharma@campusops.edu',
                'first_name': 'Priya',
                'last_name': 'Sharma',
                'role': User.ROLE_TECHNICIAN,
                'phone': '+91 98222 33445',
                'department': 'IT Infrastructure & Networking',
            }
        )
        tech_priya.set_password('tech123')
        tech_priya.save()

        student_arun, _ = User.objects.get_or_create(
            username='student_arun',
            defaults={
                'email': 'arun.verma@student.edu',
                'first_name': 'Arun',
                'last_name': 'Verma',
                'role': User.ROLE_STUDENT,
                'phone': '+91 99333 44556',
                'department': 'Computer Science & Engineering',
            }
        )
        student_arun.set_password('student123')
        student_arun.save()

        student_sneha, _ = User.objects.get_or_create(
            username='student_sneha',
            defaults={
                'email': 'sneha.patel@student.edu',
                'first_name': 'Sneha',
                'last_name': 'Patel',
                'role': User.ROLE_STUDENT,
                'phone': '+91 99444 55667',
                'department': 'Electronics & Communication',
            }
        )
        student_sneha.set_password('student123')
        student_sneha.save()

        self.stdout.write(self.style.SUCCESS('Users created (admin, tech_raj, tech_priya, student_arun, student_sneha).'))

        # 2. Create Buildings
        b_eng, _ = Building.objects.get_or_create(
            code='ENG-A',
            defaults={
                'name': 'Engineering Block A',
                'description': 'Main engineering division housing Computer Science and Electronics laboratories.'
            }
        )

        b_sci, _ = Building.objects.get_or_create(
            code='SCI-B',
            defaults={
                'name': 'Science & Research Block',
                'description': 'Applied sciences, Physics, Chemistry, and specialized advanced compute facilities.'
            }
        )

        b_acad, _ = Building.objects.get_or_create(
            code='ACAD-M',
            defaults={
                'name': 'Main Academic Block',
                'description': 'Central auditorium, administrative offices, and institutional seminar halls.'
            }
        )

        # 3. Create Floors
        f_eng_0, _ = Floor.objects.get_or_create(
            building=b_eng, floor_number=0, defaults={'name': 'Ground Floor'}
        )
        f_eng_1, _ = Floor.objects.get_or_create(
            building=b_eng, floor_number=1, defaults={'name': 'First Floor'}
        )
        f_eng_2, _ = Floor.objects.get_or_create(
            building=b_eng, floor_number=2, defaults={'name': 'Second Floor'}
        )

        f_sci_0, _ = Floor.objects.get_or_create(
            building=b_sci, floor_number=0, defaults={'name': 'Ground Floor'}
        )
        f_sci_1, _ = Floor.objects.get_or_create(
            building=b_sci, floor_number=1, defaults={'name': 'First Floor'}
        )

        f_acad_0, _ = Floor.objects.get_or_create(
            building=b_acad, floor_number=0, defaults={'name': 'Ground Floor'}
        )

        # 4. Create Rooms
        r_cs_lab1, _ = Room.objects.get_or_create(
            floor=f_eng_0, room_number='101',
            defaults={'name': 'Computer Lab 1', 'room_type': 'Laboratory'}
        )
        r_cs_class102, _ = Room.objects.get_or_create(
            floor=f_eng_0, room_number='102',
            defaults={'name': 'Lecture Hall 102', 'room_type': 'Classroom'}
        )
        r_cs_lab2, _ = Room.objects.get_or_create(
            floor=f_eng_1, room_number='201',
            defaults={'name': 'Computer Lab 2', 'room_type': 'Laboratory'}
        )
        r_robotics_lab, _ = Room.objects.get_or_create(
            floor=f_eng_2, room_number='301',
            defaults={'name': 'IoT & Robotics Lab', 'room_type': 'Laboratory'}
        )
        r_physics_lab, _ = Room.objects.get_or_create(
            floor=f_sci_0, room_number='G-01',
            defaults={'name': 'Physics Laboratory', 'room_type': 'Laboratory'}
        )
        r_auditorium, _ = Room.objects.get_or_create(
            floor=f_acad_0, room_number='AUD-1',
            defaults={'name': 'Central Auditorium', 'room_type': 'Auditorium'}
        )

        # 5. Create Equipment
        eq_data = [
            # Computer Lab 1 (Eng Ground Floor)
            (r_cs_lab1, 'Computer', 'PC-001', Equipment.STATUS_WORKING),
            (r_cs_lab1, 'Computer', 'PC-002', Equipment.STATUS_NOT_WORKING),
            (r_cs_lab1, 'Computer', 'PC-003', Equipment.STATUS_WORKING),
            (r_cs_lab1, 'Air Conditioner', 'AC-001', Equipment.STATUS_WORKING),
            (r_cs_lab1, 'Fan', 'FAN-001', Equipment.STATUS_WORKING),
            (r_cs_lab1, 'Light', 'LIGHT-001', Equipment.STATUS_WORKING),
            (r_cs_lab1, 'Digital Projector', 'PROJ-001', Equipment.STATUS_NOT_WORKING),

            # Lecture Hall 102
            (r_cs_class102, 'Smart Board Projector', 'PROJ-102', Equipment.STATUS_WORKING),
            (r_cs_class102, 'Air Conditioner', 'AC-102', Equipment.STATUS_WORKING),
            (r_cs_class102, 'Audio Amplifier', 'AMP-102', Equipment.STATUS_WORKING),

            # Computer Lab 2 (Eng 1st Floor)
            (r_cs_lab2, 'Workstation PC', 'PC-201', Equipment.STATUS_WORKING),
            (r_cs_lab2, 'Workstation PC', 'PC-202', Equipment.STATUS_WORKING),
            (r_cs_lab2, 'Air Conditioner', 'AC-201', Equipment.STATUS_NOT_WORKING),

            # IoT & Robotics Lab (Eng 2nd Floor)
            (r_robotics_lab, '3D Printer', '3DP-301', Equipment.STATUS_WORKING),
            (r_robotics_lab, 'Oscilloscope Station', 'OSC-301', Equipment.STATUS_WORKING),

            # Physics Lab (Science Block)
            (r_physics_lab, 'Digital Spectrometer', 'SPEC-01', Equipment.STATUS_WORKING),
            (r_physics_lab, 'Power Supply Unit', 'PSU-01', Equipment.STATUS_WORKING),

            # Auditorium
            (r_auditorium, 'Audio Mixer Console', 'MIXER-01', Equipment.STATUS_WORKING),
            (r_auditorium, 'Main Stage Projector', 'PROJ-AUD', Equipment.STATUS_WORKING),
        ]

        equipment_map = {}
        for room, name, eq_id, status in eq_data:
            eq, _ = Equipment.objects.get_or_create(
                equipment_id=eq_id,
                defaults={'room': room, 'name': name, 'status': status}
            )
            # Update room and status
            eq.room = room
            eq.name = name
            eq.status = status
            eq.save()
            equipment_map[eq_id] = eq

        self.stdout.write(self.style.SUCCESS(f'Created {len(equipment_map)} equipment items.'))

        # 6. Sample Complaints & Repair Remarks for complete lifecycle demonstration
        now = timezone.now()

        # Complaint 1: Historical Resolved Complaint on PC-001
        c1, created1 = Complaint.objects.get_or_create(
            ticket_id='TKT-20261028-1001',
            defaults={
                'student': student_arun,
                'equipment': equipment_map['PC-001'],
                'description': 'Computer PC-001 does not power on. Power indicator LED remains unlit.',
                'status': Complaint.STATUS_RESOLVED,
                'assigned_to': tech_raj,
                'created_at': now - timedelta(days=5),
                'resolved_at': now - timedelta(days=4),
            }
        )
        if created1:
            RepairRemark.objects.create(
                complaint=c1, technician=student_arun,
                status_from='', status_to=Complaint.STATUS_PENDING,
                remarks='Complaint registered by student_arun.',
                created_at=now - timedelta(days=5)
            )
            RepairRemark.objects.create(
                complaint=c1, technician=admin_user,
                status_from=Complaint.STATUS_PENDING, status_to=Complaint.STATUS_ASSIGNED,
                remarks='Assigned complaint to Rajesh Kumar (Hardware Specialist).',
                created_at=now - timedelta(days=5, hours=2)
            )
            RepairRemark.objects.create(
                complaint=c1, technician=tech_raj,
                status_from=Complaint.STATUS_ASSIGNED, status_to=Complaint.STATUS_IN_PROGRESS,
                remarks='Tested wall outlet. Voltage normal. Opening cabinet to inspect SMPS power supply.',
                created_at=now - timedelta(days=4, hours=6)
            )
            RepairRemark.objects.create(
                complaint=c1, technician=tech_raj,
                status_from=Complaint.STATUS_IN_PROGRESS, status_to=Complaint.STATUS_RESOLVED,
                remarks='Power supply unit replaced with spare 450W SMPS. System booted into OS and stress tested successfully.',
                created_at=now - timedelta(days=4)
            )

        # Complaint 2: In Progress Complaint on AC-201
        c2, created2 = Complaint.objects.get_or_create(
            ticket_id='TKT-20261101-2002',
            defaults={
                'student': student_sneha,
                'equipment': equipment_map['AC-201'],
                'description': 'Air conditioner in Computer Lab 2 is blowing room-temperature air and compressor makes heavy vibrating noise.',
                'status': Complaint.STATUS_IN_PROGRESS,
                'assigned_to': tech_raj,
                'created_at': now - timedelta(days=1),
            }
        )
        if created2:
            RepairRemark.objects.create(
                complaint=c2, technician=student_sneha,
                status_from='', status_to=Complaint.STATUS_PENDING,
                remarks='Complaint registered by student_sneha.',
                created_at=now - timedelta(days=1)
            )
            RepairRemark.objects.create(
                complaint=c2, technician=admin_user,
                status_from=Complaint.STATUS_PENDING, status_to=Complaint.STATUS_ASSIGNED,
                remarks='Assigned to Rajesh Kumar for HVAC inspection.',
                created_at=now - timedelta(hours=18)
            )
            RepairRemark.objects.create(
                complaint=c2, technician=tech_raj,
                status_from=Complaint.STATUS_ASSIGNED, status_to=Complaint.STATUS_IN_PROGRESS,
                remarks='Inspected condenser coils and fan motor. Cleaned air filters. Currently refilling R-32 refrigerant gas.',
                created_at=now - timedelta(hours=4)
            )

        # Complaint 3: Assigned Complaint on PROJ-001
        c3, created3 = Complaint.objects.get_or_create(
            ticket_id='TKT-20261102-3003',
            defaults={
                'student': student_arun,
                'equipment': equipment_map['PROJ-001'],
                'description': 'Projector display colors distorted (heavy purple tint) and bulb warning light is blinking yellow.',
                'status': Complaint.STATUS_ASSIGNED,
                'assigned_to': tech_priya,
                'created_at': now - timedelta(hours=8),
            }
        )
        if created3:
            RepairRemark.objects.create(
                complaint=c3, technician=student_arun,
                status_from='', status_to=Complaint.STATUS_PENDING,
                remarks='Complaint registered by student_arun.',
                created_at=now - timedelta(hours=8)
            )
            RepairRemark.objects.create(
                complaint=c3, technician=admin_user,
                status_from=Complaint.STATUS_PENDING, status_to=Complaint.STATUS_ASSIGNED,
                remarks='Assigned to Priya Sharma for multimedia diagnosis.',
                created_at=now - timedelta(hours=3)
            )

        # Complaint 4: Pending Complaint on PC-002
        c4, created4 = Complaint.objects.get_or_create(
            ticket_id='TKT-20261102-4004',
            defaults={
                'student': student_sneha,
                'equipment': equipment_map['PC-002'],
                'description': 'Monitor display goes blank after 2 minutes of usage. CPU stays on.',
                'status': Complaint.STATUS_PENDING,
                'created_at': now - timedelta(hours=1),
            }
        )
        if created4:
            RepairRemark.objects.create(
                complaint=c4, technician=student_sneha,
                status_from='', status_to=Complaint.STATUS_PENDING,
                remarks='Complaint registered by student_sneha.',
                created_at=now - timedelta(hours=1)
            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded database with full demo data!'))
