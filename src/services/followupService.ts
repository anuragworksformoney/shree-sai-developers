import { FollowupRecord, FollowupStatus } from '../types';
import { getAuthHeaders, clearStoredAdminToken } from './propertyService';

export async function fetchFollowups(): Promise<FollowupRecord[]> {
  const res = await fetch('/api/admin/followups', {
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    if (res.status === 401) {
      clearStoredAdminToken();
      throw new Error('UNAUTHORIZED');
    }
    throw new Error(data.error || 'Failed to fetch follow-ups');
  }

  return data.followups || [];
}

export async function createFollowup(payload: Partial<FollowupRecord>): Promise<FollowupRecord> {
  const res = await fetch('/api/admin/followups', {
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
    throw new Error(data.error || 'Failed to create follow-up record');
  }

  return data.followup;
}

export async function updateFollowup(
  id: string,
  payload: Partial<FollowupRecord>
): Promise<FollowupRecord> {
  const res = await fetch(`/api/admin/followups/${encodeURIComponent(id)}`, {
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
    throw new Error(data.error || 'Failed to update follow-up record');
  }

  return data.followup;
}

export async function updateFollowupStatus(
  id: string,
  status: FollowupStatus
): Promise<FollowupRecord> {
  const res = await fetch(`/api/admin/followups/${encodeURIComponent(id)}/status`, {
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
    throw new Error(data.error || 'Failed to update status');
  }

  return data.followup;
}

export async function deleteFollowup(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`/api/admin/followups/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    if (res.status === 401) {
      clearStoredAdminToken();
      throw new Error('UNAUTHORIZED');
    }
    throw new Error(data.error || data.message || 'Failed to delete follow-up record from database.');
  }

  return data;
}
