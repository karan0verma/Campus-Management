from django.core.management.base import BaseCommand
from api.models import User, Building, Floor, Room, Equipment, Complaint, RepairRemark

class Command(BaseCommand):
    help = 'Clears all sample complaints, equipment, rooms, floors, and buildings, keeping only the superadmin.'

    def handle(self, *args, **options):
        self.stdout.write('Clearing all demo complaints and remarks...')
        RepairRemark.objects.all().delete()
        Complaint.objects.all().delete()

        self.stdout.write('Clearing all demo equipment...')
        Equipment.objects.all().delete()

        self.stdout.write('Clearing all demo rooms, floors, and buildings...')
        Room.objects.all().delete()
        Floor.objects.all().delete()
        Building.objects.all().delete()

        self.stdout.write('Clearing non-admin demo users...')
        User.objects.exclude(username='admin').delete()

        self.stdout.write(self.style.SUCCESS('Database cleaned! Only the Admin user remains.'))
