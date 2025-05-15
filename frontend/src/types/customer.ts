export interface Customer {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Inactive' | 'Pending';
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
  contactNumber?: string;
  company?: string;
}

export interface CustomerCreate {
  name: string;
  email: string;
  status: 'Active' | 'Inactive' | 'Pending';
  notes?: string;
  contactNumber?: string;
  company?: string;
}

export interface CustomerUpdate {
  id: string;
  name?: string;
  email?: string;
  status?: 'Active' | 'Inactive' | 'Pending';
  notes?: string;
  contactNumber?: string;
  company?: string;
}