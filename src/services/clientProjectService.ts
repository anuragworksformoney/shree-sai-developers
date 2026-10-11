import { ClientProject, ClientProjectStatus } from '../types';
import { getAuthHeaders, clearStoredAdminToken } from './propertyService';

export async function fetchClientProjects(): Promise<ClientProject[]> {
  const res = await fetch('/api/admin/client-projects', {
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    if (res.status === 401) {
      clearStoredAdminToken();
      throw new Error('UNAUTHORIZED');
    }
    throw new Error(data.error || 'Failed to fetch client projects');
  }

  return data.projects || [];
}

export async function createClientProject(payload: {
  clientName: string;
  projectName: string;
  projectType: string;
  startDate?: string;
  expectedCompletionDate?: string;
  status: ClientProjectStatus;
  url?: string;
  notes?: string;
}): Promise<ClientProject> {
  const res = await fetch('/api/admin/client-projects', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    if (res.status === 401) {
      clearStoredAdminToken();
      throw new Error('UNAUTHORIZED');
    }
    throw new Error(data.error || 'Failed to create client project');
  }

  return data.project;
}

export async function updateClientProject(
  id: string,
  payload: Partial<ClientProject>
): Promise<ClientProject> {
  const res = await fetch(`/api/admin/client-projects/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    if (res.status === 401) {
      clearStoredAdminToken();
      throw new Error('UNAUTHORIZED');
    }
    throw new Error(data.error || 'Failed to update client project');
  }

  return data.project;
}

export async function updateClientProjectStatus(
  id: string,
  status: ClientProjectStatus
): Promise<ClientProject> {
  const res = await fetch(`/api/admin/client-projects/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    if (res.status === 401) {
      clearStoredAdminToken();
      throw new Error('UNAUTHORIZED');
    }
    throw new Error(data.error || 'Failed to update project status');
  }

  return data.project;
}

export async function deleteClientProject(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`/api/admin/client-projects/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    if (res.status === 401) {
      clearStoredAdminToken();
      throw new Error('UNAUTHORIZED');
    }
    throw new Error(data.error || 'Failed to delete client project');
  }

  return data;
}
