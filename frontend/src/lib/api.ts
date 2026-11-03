const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'admin' | 'technician';
  phone: string;
  department: string;
  date_joined: string;
}

export interface Building {
  id: number;
  name: string;
  code: string;
  description: string;
  floors_count: number;
  rooms_count: number;
  equipment_count: number;
  created_at: string;
}

export interface Floor {
  id: number;
  building: number;
  building_name: string;
  building_code: string;
  floor_number: number;
  name: string;
  rooms_count: number;
  equipment_count: number;
  created_at: string;
}

export interface Room {
  id: number;
  floor: number;
  floor_name: string;
  floor_number: number;
  building_id: number;
  building_name: string;
  room_number: string;
  name: string;
  room_type: string;
  equipment_count: number;
  created_at: string;
}

export interface Equipment {
  id: number;
  room: number;
  room_name: string;
  room_number: string;
  floor_id: number;
  floor_name: string;
  floor_number: number;
  building_id: number;
  building_name: string;
  name: string;
  equipment_id: string;
  status: 'Working' | 'Not Working';
  complaints_count: number;
  active_complaints_count: number;
  created_at: string;
  updated_at: string;
}

export interface RepairRemark {
  id: number;
  complaint: number;
  technician: number | null;
  technician_name: string;
  status_from: string;
  status_to: string;
  remarks: string;
  created_at: string;
}

export interface Complaint {
  id: number;
  ticket_id: string;
  student: number;
  student_name: string;
  student_email: string;
  student_phone: string;
  equipment: number;
  equipment_name: string;
  equipment_id_str: string;
  room_id: number;
  room_name: string;
  room_number: string;
  floor_id: number;
  floor_name: string;
  building_id: number;
  building_name: string;
  description: string;
  status: 'Pending' | 'Assigned' | 'In Progress' | 'Resolved';
  assigned_to: number | null;
  assigned_to_name: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  remarks: RepairRemark[];
}

export interface TreeRoom {
  id: number;
  room_number: string;
  name: string;
  room_type: string;
  equipment_count: number;
  working_count: number;
  faulty_count: number;
}

export interface TreeFloor {
  id: number;
  floor_number: number;
  name: string;
  rooms: TreeRoom[];
  rooms_count: number;
}

export interface TreeBuilding {
  id: number;
  name: string;
  code: string;
  description: string;
  floors: TreeFloor[];
  floors_count: number;
}

export interface DashboardStats {
  role: string;
  complaints: {
    total: number;
    pending?: number;
    assigned?: number;
    in_progress?: number;
    resolved?: number;
  };
  equipment?: {
    total: number;
    working: number;
    not_working: number;
  };
  infrastructure?: {
    buildings: number;
    floors: number;
    rooms: number;
  };
  users?: {
    technicians: number;
    students: number;
  };
}

class ApiService {
  private getHeaders(customHeaders: Record<string, string> = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('campusops_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.getHeaders(options.headers as Record<string, string>);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      if (typeof window !== 'undefined' && !endpoint.includes('/auth/login/')) {
        localStorage.removeItem('campusops_token');
        localStorage.removeItem('campusops_user');
      }
    }

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.detail) errorMessage = errorData.detail;
        else if (errorData.error) errorMessage = errorData.error;
        else errorMessage = JSON.stringify(errorData);
      } catch {}
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth API
  async register(data: {
    username: string;
    password: string;
    role?: 'student' | 'admin' | 'technician';
    security_key?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    department?: string;
  }) {
    return this.request<{ access: string; refresh: string; user: User }>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getStaffPasskeys(): Promise<{ admin_passkey: string; technician_passkey: string; message: string }> {
    return this.request<{ admin_passkey: string; technician_passkey: string; message: string }>('/users/passkeys/');
  }

  async login(credentials: { username: string; password: string }) {
    return this.request<{ access: string; refresh: string; user: User }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me/');
  }

  async getTechnicians(): Promise<User[]> {
    return this.request<User[]>('/technicians/');
  }

  // Users (Admin)
  async getUsers(role?: string, search?: string): Promise<User[]> {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (search) params.append('search', search);
    return this.request<User[]>(`/users/?${params.toString()}`);
  }

  async createUser(userData: Partial<User> & { password: string }): Promise<User> {
    return this.request<User>('/users/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Layout tree
  async getLayoutTree(): Promise<TreeBuilding[]> {
    return this.request<TreeBuilding[]>('/layout/tree/');
  }

  // Buildings
  async getBuildings(): Promise<Building[]> {
    return this.request<Building[]>('/buildings/');
  }

  async createBuilding(data: { name: string; code: string; description?: string }): Promise<Building> {
    return this.request<Building>('/buildings/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBuilding(id: number, data: Partial<Building>): Promise<Building> {
    return this.request<Building>(`/buildings/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBuilding(id: number): Promise<void> {
    return this.request<void>(`/buildings/${id}/`, {
      method: 'DELETE',
    });
  }

  // Floors
  async getFloors(buildingId?: number): Promise<Floor[]> {
    const query = buildingId ? `?building=${buildingId}` : '';
    return this.request<Floor[]>(`/floors/${query}`);
  }

  async createFloor(data: { building: number; floor_number: number; name: string }): Promise<Floor> {
    return this.request<Floor>('/floors/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFloor(id: number, data: Partial<Floor>): Promise<Floor> {
    return this.request<Floor>(`/floors/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFloor(id: number): Promise<void> {
    return this.request<void>(`/floors/${id}/`, {
      method: 'DELETE',
    });
  }

  // Rooms
  async getRooms(floorId?: number, buildingId?: number): Promise<Room[]> {
    const params = new URLSearchParams();
    if (floorId) params.append('floor', floorId.toString());
    if (buildingId) params.append('building', buildingId.toString());
    return this.request<Room[]>(`/rooms/?${params.toString()}`);
  }

  async createRoom(data: { floor: number; room_number: string; name: string; room_type?: string }): Promise<Room> {
    return this.request<Room>('/rooms/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRoom(id: number, data: Partial<Room>): Promise<Room> {
    return this.request<Room>(`/rooms/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteRoom(id: number): Promise<void> {
    return this.request<void>(`/rooms/${id}/`, {
      method: 'DELETE',
    });
  }

  // Equipment
  async getEquipment(filters?: { room?: number; floor?: number; building?: number; status?: string; search?: string }): Promise<Equipment[]> {
    const params = new URLSearchParams();
    if (filters?.room) params.append('room', filters.room.toString());
    if (filters?.floor) params.append('floor', filters.floor.toString());
    if (filters?.building) params.append('building', filters.building.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    return this.request<Equipment[]>(`/equipment/?${params.toString()}`);
  }

  async createEquipment(data: { room: number; name: string; equipment_id: string; status?: string }): Promise<Equipment> {
    return this.request<Equipment>('/equipment/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async bulkCreateEquipment(data: {
    room: number;
    name: string;
    prefix: string;
    count: number;
    start?: number;
  }): Promise<Equipment[]> {
    return this.request<Equipment[]>('/equipment/bulk_create/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEquipment(id: number, data: Partial<Equipment>): Promise<Equipment> {
    return this.request<Equipment>(`/equipment/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateEquipmentStatus(id: number, status: 'Working' | 'Not Working'): Promise<Equipment> {
    return this.request<Equipment>(`/equipment/${id}/update_status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async getEquipmentHistory(id: number): Promise<{
    equipment: Equipment;
    history: Array<{
      ticket_id: string;
      complaint_id: number;
      description: string;
      status: string;
      student_name: string;
      assigned_to: string | null;
      created_at: string;
      resolved_at: string | null;
      remarks: Array<{
        id: number;
        technician: string;
        status_from: string;
        status_to: string;
        remarks: string;
        created_at: string;
      }>;
    }>;
  }> {
    return this.request(`/equipment/${id}/history/`);
  }

  // Complaints
  async getComplaints(filters?: { status?: string; equipment?: number; technician?: number; search?: string }): Promise<Complaint[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.equipment) params.append('equipment', filters.equipment.toString());
    if (filters?.technician) params.append('technician', filters.technician.toString());
    if (filters?.search) params.append('search', filters.search);
    return this.request<Complaint[]>(`/complaints/?${params.toString()}`);
  }

  async getComplaint(id: number): Promise<Complaint> {
    return this.request<Complaint>(`/complaints/${id}/`);
  }

  async createComplaint(data: { equipment: number; description: string }): Promise<Complaint> {
    return this.request<Complaint>('/complaints/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async assignComplaint(complaintId: number, technicianId: number): Promise<Complaint> {
    return this.request<Complaint>(`/complaints/${complaintId}/assign/`, {
      method: 'POST',
      body: JSON.stringify({ technician_id: technicianId }),
    });
  }

  async updateComplaintStatus(complaintId: number, data: { status: 'In Progress' | 'Resolved'; remarks: string }): Promise<Complaint> {
    return this.request<Complaint>(`/complaints/${complaintId}/update_status/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/dashboard/stats/');
  }
}

export const api = new ApiService();
