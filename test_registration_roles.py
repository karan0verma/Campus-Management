import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000/api"

def run_tests():
    ts = int(time.time())
    print("=== Testing Role-Based Registration & Security Keys ===")

    # Test 1: Student registration without security key (SHOULD PASS)
    student_user = f"test_std_{ts}"
    payload = {
        "username": student_user,
        "password": "Password123!",
        "role": "student",
        "first_name": "Test",
        "last_name": "Student",
        "department": "Computer Science"
    }
    r = requests.post(f"{BASE_URL}/auth/register/", json=payload)
    print("1. Student registration without key:", r.status_code, "->", "PASS" if r.status_code == 201 else f"FAIL ({r.text})")
    assert r.status_code == 201
    assert r.json()['user']['role'] == 'student'

    # Test 2: Technician registration without security key (SHOULD FAIL 403)
    tech_fail_user = f"test_tech_fail_{ts}"
    payload = {
        "username": tech_fail_user,
        "password": "Password123!",
        "role": "technician",
        "security_key": ""
    }
    r = requests.post(f"{BASE_URL}/auth/register/", json=payload)
    print("2. Tech registration without key (expect 403):", r.status_code, "->", "PASS" if r.status_code == 403 else f"FAIL ({r.text})")
    assert r.status_code == 403

    # Test 3: Technician registration with wrong key (SHOULD FAIL 403)
    payload["security_key"] = "WRONG_KEY"
    r = requests.post(f"{BASE_URL}/auth/register/", json=payload)
    print("3. Tech registration with wrong key (expect 403):", r.status_code, "->", "PASS" if r.status_code == 403 else f"FAIL ({r.text})")
    assert r.status_code == 403

    # Test 4: Technician registration with valid TECH@CAMPUS2026 (SHOULD PASS 201)
    tech_success_user = f"test_tech_ok_{ts}"
    payload = {
        "username": tech_success_user,
        "password": "Password123!",
        "role": "technician",
        "security_key": "TECH@CAMPUS2026",
        "first_name": "Ramesh",
        "last_name": "Verma",
        "department": "Electrical & Hardware"
    }
    r = requests.post(f"{BASE_URL}/auth/register/", json=payload)
    print("4. Tech registration with valid TECH key:", r.status_code, "->", "PASS" if r.status_code == 201 else f"FAIL ({r.text})")
    assert r.status_code == 201
    assert r.json()['user']['role'] == 'technician'

    # Test 5: Admin registration with TECH key (SHOULD FAIL 403 - needs ADMIN key)
    admin_fail_user = f"test_admin_fail_{ts}"
    payload = {
        "username": admin_fail_user,
        "password": "Password123!",
        "role": "admin",
        "security_key": "TECH@CAMPUS2026"
    }
    r = requests.post(f"{BASE_URL}/auth/register/", json=payload)
    print("5. Admin registration with tech key (expect 403):", r.status_code, "->", "PASS" if r.status_code == 403 else f"FAIL ({r.text})")
    assert r.status_code == 403

    # Test 6: Admin registration with valid ADMIN@CAMPUS2026 (SHOULD PASS 201)
    admin_success_user = f"test_admin_ok_{ts}"
    payload = {
        "username": admin_success_user,
        "password": "Password123!",
        "role": "admin",
        "security_key": "ADMIN@CAMPUS2026",
        "first_name": "Vikram",
        "last_name": "Aditya",
        "department": "Infrastructure Oversight"
    }
    r = requests.post(f"{BASE_URL}/auth/register/", json=payload)
    print("6. Admin registration with ADMIN key:", r.status_code, "->", "PASS" if r.status_code == 201 else f"FAIL ({r.text})")
    assert r.status_code == 201
    assert r.json()['user']['role'] == 'admin'
    admin_token = r.json()['access']

    # Test 7: Query passkeys endpoint as Admin (SHOULD PASS 200)
    r = requests.get(f"{BASE_URL}/users/passkeys/", headers={"Authorization": f"Bearer {admin_token}"})
    print("7. Admin queries /users/passkeys/:", r.status_code, "->", "PASS" if r.status_code == 200 else f"FAIL ({r.text})")
    assert r.status_code == 200
    data = r.json()
    assert data['admin_passkey'] == "ADMIN@CAMPUS2026"
    assert data['technician_passkey'] == "TECH@CAMPUS2026"
    print("   Data returned:", data)

    print("\nALL 7 REGISTRATION & SECURITY PASSKEY TESTS PASSED SUCCESSFULLY!")

if __name__ == '__main__':
    run_tests()
