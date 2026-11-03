import requests
import time

BASE = 'http://127.0.0.1:8000/api'

def run_tests():
    print('=== STARTING 11-STEP END-TO-END VERIFICATION ===')

    timestamp = int(time.time())

    # Step 1: Admin Login
    print('1. Admin logs in...')
    res = requests.post(f'{BASE}/auth/login/', json={'username': 'admin', 'password': 'admin123'})
    assert res.status_code == 200, f'Admin login failed: {res.text}'
    admin_token = res.json()['access']
    admin_headers = {'Authorization': f'Bearer {admin_token}', 'Content-Type': 'application/json'}
    print('   Admin authenticated successfully. Role:', res.json()['user']['role'])

    # Step 1b: Admin creates Building, Floor, Room
    bldg_code = f'ROBO-{timestamp % 10000}'
    print(f'1b. Admin creates building {bldg_code}...')
    res = requests.post(f'{BASE}/buildings/', json={
        'name': f'Robotics Center {timestamp % 10000}',
        'code': bldg_code,
        'description': 'Advanced robotics and mechatronics lab center'
    }, headers=admin_headers)
    assert res.status_code == 201, f'Create building failed: {res.text}'
    bldg = res.json()
    print(f'   Created building: {bldg["name"]} (ID: {bldg["id"]}, Code: {bldg["code"]})')

    print('1c. Admin adds a floor to that building...')
    res = requests.post(f'{BASE}/floors/', json={
        'building': bldg['id'],
        'floor_number': 1,
        'name': 'Level 1 Mechatronics'
    }, headers=admin_headers)
    assert res.status_code == 201, f'Create floor failed: {res.text}'
    flr = res.json()
    print(f'   Created floor: {flr["name"]} (ID: {flr["id"]})')

    print('1d. Admin adds a room to that floor...')
    res = requests.post(f'{BASE}/rooms/', json={
        'floor': flr['id'],
        'room_number': 'RW-101',
        'name': 'Autonomous Drone & Robotics Lab',
        'room_type': 'Laboratory'
    }, headers=admin_headers)
    assert res.status_code == 201, f'Create room failed: {res.text}'
    room = res.json()
    print(f'   Created room: {room["name"]} (ID: {room["id"]})')

    # Step 2: Admin adds equipment to that room
    eq_code = f'DRN-{timestamp % 10000}'
    print(f'2. Admin registers equipment {eq_code} in that room...')
    res = requests.post(f'{BASE}/equipment/', json={
        'room': room['id'],
        'name': 'Hexacopter Drone Station',
        'equipment_id': eq_code,
        'status': 'Working'
    }, headers=admin_headers)
    assert res.status_code == 201, f'Create equipment failed: {res.text}'
    equipment = res.json()
    print(f'   Created equipment: {equipment["name"]} (ID: {equipment["id"]}, Code: {equipment["equipment_id"]}, Status: {equipment["status"]})')

    # Step 3: Student logs in
    print('3. Student logs in...')
    res = requests.post(f'{BASE}/auth/login/', json={'username': 'student_arun', 'password': 'student123'})
    assert res.status_code == 200, f'Student login failed: {res.text}'
    student_token = res.json()['access']
    student_headers = {'Authorization': f'Bearer {student_token}', 'Content-Type': 'application/json'}
    print('   Student authenticated successfully. Role:', res.json()['user']['role'])

    # Step 4: Student selects equipment and raises a complaint
    print(f'4. Student submits a maintenance complaint for {eq_code}...')
    res = requests.post(f'{BASE}/complaints/', json={
        'equipment': equipment['id'],
        'description': 'Propeller motor 3 rotor failing to spin during calibration and battery heats excessively.'
    }, headers=student_headers)
    assert res.status_code == 201, f'Submit complaint failed: {res.text}'
    complaint = res.json()
    ticket_id = complaint['ticket_id']
    complaint_id = complaint['id']
    print(f'   Complaint generated with Ticket ID: {ticket_id} (Status: {complaint["status"]})')

    # Check equipment status automatically updated to 'Not Working'
    res = requests.get(f'{BASE}/equipment/{equipment["id"]}/', headers=student_headers)
    assert res.json()['status'] == 'Not Working', f'Equipment status expected Not Working, got: {res.json()["status"]}'
    print('   Equipment status automatically marked as Not Working.')

    # Step 5: Complaint appears in admin dashboard
    print('5. Verifying complaint appears in admin dashboard...')
    res = requests.get(f'{BASE}/complaints/?search={ticket_id}', headers=admin_headers)
    assert res.status_code == 200 and len(res.json()) >= 1, 'Complaint not found in admin complaints list'
    assert res.json()[0]['ticket_id'] == ticket_id
    print(f'   Complaint {ticket_id} verified in Admin Dashboard.')

    # Step 6: Admin assigns the complaint to technician (tech_raj)
    print('6. Admin assigns complaint to technician Rajesh Kumar...')
    res = requests.get(f'{BASE}/technicians/', headers=admin_headers)
    techs = res.json()
    tech_raj = next(t for t in techs if t['username'] == 'tech_raj')
    res = requests.post(f'{BASE}/complaints/{complaint_id}/assign/', json={'technician_id': tech_raj['id']}, headers=admin_headers)
    assert res.status_code == 200, f'Assign failed: {res.text}'
    assigned_complaint = res.json()
    assert assigned_complaint['status'] == 'Assigned'
    assert assigned_complaint['assigned_to'] == tech_raj['id']
    print(f'   Complaint status updated to: {assigned_complaint["status"]}, assigned to: {tech_raj["username"]}')

    # Step 7: Technician logs in and sees assigned complaint
    print('7. Technician logs in and checks assigned complaints...')
    res = requests.post(f'{BASE}/auth/login/', json={'username': 'tech_raj', 'password': 'tech123'})
    assert res.status_code == 200
    tech_token = res.json()['access']
    tech_headers = {'Authorization': f'Bearer {tech_token}', 'Content-Type': 'application/json'}
    res = requests.get(f'{BASE}/complaints/?status=Assigned', headers=tech_headers)
    my_assigned = [c for c in res.json() if c['ticket_id'] == ticket_id]
    assert len(my_assigned) == 1, 'Technician did not find the assigned ticket'
    print(f'   Technician tech_raj verified ticket {ticket_id} in assigned queue.')

    # Step 8: Technician updates status to In Progress and adds repair remarks
    print('8. Technician starts work (In Progress) and adds inspection remark...')
    res = requests.post(f'{BASE}/complaints/{complaint_id}/update_status/', json={
        'status': 'In Progress',
        'remarks': 'Bench tested motor ESC controller. Detected loose solder on signal line. Re-soldering and testing.'
    }, headers=tech_headers)
    assert res.status_code == 200, f'Update to In Progress failed: {res.text}'
    assert res.json()['status'] == 'In Progress'
    print('   Ticket status changed to: In Progress.')

    # Step 9: Technician marks complaint as Resolved
    print('9. Technician marks complaint Resolved with final repair remarks...')
    res = requests.post(f'{BASE}/complaints/{complaint_id}/update_status/', json={
        'status': 'Resolved',
        'remarks': 'ESC signal terminal re-soldered and heat-shrink wrapped. Battery tested at 12.6V. Motor spins smoothly at 100% throttle.'
    }, headers=tech_headers)
    assert res.status_code == 200, f'Update to Resolved failed: {res.text}'
    resolved_complaint = res.json()
    assert resolved_complaint['status'] == 'Resolved'
    assert resolved_complaint['resolved_at'] is not None
    print('   Ticket status changed to: Resolved with resolution timestamp.')

    # Step 10: Student and Admin see updated status and equipment is restored to Working
    print('10. Verifying Student and Admin see status Resolved and Equipment is Working...')
    res_student = requests.get(f'{BASE}/complaints/{complaint_id}/', headers=student_headers)
    assert res_student.json()['status'] == 'Resolved'
    res_admin = requests.get(f'{BASE}/complaints/{complaint_id}/', headers=admin_headers)
    assert res_admin.json()['status'] == 'Resolved'

    res_eq = requests.get(f'{BASE}/equipment/{equipment["id"]}/', headers=admin_headers)
    assert res_eq.json()['status'] == 'Working', f'Equipment should be Working, got: {res_eq.json()["status"]}'
    print('   Equipment status restored to: Working.')

    # Step 11: Equipment history displays the completed repair
    print('11. Verifying Equipment History ledger contains full repair audit trail...')
    res_hist = requests.get(f'{BASE}/equipment/{equipment["id"]}/history/', headers=admin_headers)
    assert res_hist.status_code == 200
    history_data = res_hist.json()
    assert len(history_data['history']) >= 1
    record = history_data['history'][0]
    assert record['ticket_id'] == ticket_id
    assert record['status'] == 'Resolved'
    assert len(record['remarks']) >= 3
    print('   Audit remarks recorded:')
    for r in record['remarks']:
        print(f'     - [{r["created_at"][:19]}] {r["technician"]} ({r["status_from"]} -> {r["status_to"]}): {r["remarks"]}')

    print('=== ALL 11 WORKFLOW STEPS PASSED WITH 100% SUCCESS! ===')

if __name__ == '__main__':
    run_tests()
