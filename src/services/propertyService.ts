import { ManagedProperty, PropertyPhotoItem, AdminUser } from '../types';

const ADMIN_TOKEN_KEY = 'ssd_admin_auth_token';

// Fallback seed properties to guarantee instantaneous rendering without layout shift
export const FALLBACK_PROPERTIES: ManagedProperty[] = [
  {
    id: 'shree-sai-apartment',
    name: 'Shree Sai Apartment',
    location: 'Evershine, Vasai',
    listingType: 'Buy / Rent / Heavy Deposit',
    description:
      'Residential development located in Evershine, Vasai. Available for Buy / Rent / Heavy Deposit enquiries directly from the developer.',
    coverImage: '/3.png',
    images: [
      { id: 'sai-1', url: '/3.png', title: 'Main Elevation View', isCover: true },
      { id: 'sai-2', url: '/5.png', title: 'Front Facade & Balconies' },
      { id: 'sai-3', url: '/6.png', title: 'Side Architectural Elevation' },
      { id: 'sai-4', url: '/7.png', title: 'External View' },
      { id: 'sai-5', url: '/8.png', title: 'Surrounding Campus & Approach' },
      { id: 'sai-6', url: '/9.png', title: 'Ground Floor & Parking Site' },
      { id: 'sai-7', url: '/10.png', title: 'Structural Framing Detail' },
      { id: 'sai-brochure', url: '/4.png', title: 'Official Project Brochure' },
    ],
    status: 'Available',
    featured: true,
    published: true,
    isArchived: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'boisar-property',
    name: 'Boisar Property',
    location: 'Boisar',
    listingType: 'Buy / Rent / Heavy Deposit',
    description:
      'Residential development located in Boisar. Available for Buy / Rent / Heavy Deposit enquiries directly from the developer.',
    coverImage: '/1.png',
    images: [
      { id: 'boisar-1', url: '/1.png', title: 'Building Exterior Facade', isCover: true },
      { id: 'boisar-2', url: '/2.png', title: 'Side View & Entrance' },
    ],
    status: 'Available',
    featured: true,
    published: true,
    isArchived: false,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

// Token Helpers
export function getStoredAdminToken(): string | null {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredAdminToken(token: string) {
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch (err) {
    console.error('Failed to store admin token:', err);
  }
}

export function clearStoredAdminToken() {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch (err) {
    console.error('Failed to remove admin token:', err);
  }
}

export function getAuthHeaders(): HeadersInit {
  const token = getStoredAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ==========================================
// PUBLIC API CALLS
// ==========================================

export async function fetchPublishedProperties(): Promise<ManagedProperty[]> {
  try {
    const res = await fetch('/api/properties');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.properties)) {
        return data.properties;
      }
    }
  } catch (err) {
    console.warn('[Properties Fetch Note, using local fallback]:', err);
  }
  return FALLBACK_PROPERTIES;
}

export async function fetchPropertyById(id: string): Promise<ManagedProperty | null> {
  try {
    const res = await fetch(`/api/properties/${encodeURIComponent(id)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.property) {
        return data.property;
      }
    }
  } catch (err) {
    console.warn(`[Property Detail Fetch Note for ${id}]:`, err);
  }

  // Fallback check in local memory
  const fallback = FALLBACK_PROPERTIES.find((p) => p.id === id);
  return fallback || null;
}

// ==========================================
// ADMIN AUTHENTICATION CALLS
// ==========================================

export async function adminLogin(
  email: string,
  password: string
): Promise<{ success: boolean; token?: string; user?: AdminUser; error?: string }> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok && data.success && data.token) {
      setStoredAdminToken(data.token);
      return {
        success: true,
        token: data.token,
        user: { email: data.email, role: 'admin' },
      };
    }

    return {
      success: false,
      error: data.message || data.error || 'Authentication failed. Please check credentials.',
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Unable to connect to authentication service.',
    };
  }
}

export async function verifyAdminSession(): Promise<{ authenticated: boolean; user?: AdminUser }> {
  const token = getStoredAdminToken();
  if (!token) return { authenticated: false };

  try {
    const res = await fetch('/api/admin/me', {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.authenticated && data.user) {
        return { authenticated: true, user: data.user };
      }
    }
    clearStoredAdminToken();
  } catch {
    // Network or server error
  }
  return { authenticated: false };
}

export async function adminLogout(): Promise<void> {
  try {
    await fetch('/api/admin/logout', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch {
    // Ignore network error on logout
  }
  clearStoredAdminToken();
}

// ==========================================
// ADMIN PROPERTY MANAGEMENT CALLS
// ==========================================

export async function fetchAdminProperties(): Promise<ManagedProperty[]> {
  const res = await fetch('/api/admin/properties', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    if (res.status === 401) {
      clearStoredAdminToken();
      throw new Error('UNAUTHORIZED');
    }
    throw new Error('Failed to load property inventory');
  }
  const data = await res.json();
  return data.properties || [];
}

export async function createPropertyListing(propertyData: Partial<ManagedProperty>): Promise<ManagedProperty> {
  const res = await fetch('/api/admin/properties', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(propertyData),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    if (res.status === 401) {
      clearStoredAdminToken();
      throw new Error('UNAUTHORIZED');
    }
    throw new Error(data.error || 'Failed to create property');
  }
  return data.property;
}

export async function updatePropertyListing(
  id: string,
  propertyData: Partial<ManagedProperty>
): Promise<ManagedProperty> {
  const res = await fetch(`/api/admin/properties/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(propertyData),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    if (res.status === 401) {
      clearStoredAdminToken();
      throw new Error('UNAUTHORIZED');
    }
    throw new Error(data.error || 'Failed to update property');
  }
  return data.property;
}

export async function togglePropertyArchive(id: string, isArchived: boolean): Promise<ManagedProperty> {
  const res = await fetch(`/api/admin/properties/${encodeURIComponent(id)}/archive`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ isArchived }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    if (res.status === 401) {
      clearStoredAdminToken();
      throw new Error('UNAUTHORIZED');
    }
    throw new Error(data.error || 'Failed to update archive status');
  }
  return data.property;
}

export async function deletePropertyListing(id: string): Promise<{ success: boolean; message: string; id?: string }> {
  const url = `/api/admin/properties/${encodeURIComponent(id)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.success) {
    if (res.status === 401) {
      clearStoredAdminToken();
      throw new Error('UNAUTHORIZED: Admin session expired or invalid credentials.');
    }
    throw new Error(data.error || data.message || `Failed to delete property from database (HTTP ${res.status})`);
  }
  return data;
}

export async function uploadPropertyPhotos(
  files: File[]
): Promise<{ url: string; filename: string; originalname: string; size: number }[]> {
  const token = getStoredAdminToken();
  const formData = new FormData();
  for (const file of files) {
    formData.append('photos', file);
  }

  const res = await fetch('/api/admin/upload', {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    if (res.status === 401) {
      clearStoredAdminToken();
      throw new Error('UNAUTHORIZED');
    }
    throw new Error(data.error || 'Image upload failed');
  }
  return data.photos || [];
}
