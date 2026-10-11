import fs from 'fs';
import path from 'path';
import { FollowupRecord, FollowupStatus } from '../types';
import { getSupabaseClient } from './supabase';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'followups.json');
const TMP_DATA_FILE = path.join('/tmp', 'followups.json');

// Ensure directory exists if filesystem is writable
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  // Silent catch for serverless read-only environment
}

let memoryFollowups: FollowupRecord[] | null = null;

function loadFollowupsFromFile(): FollowupRecord[] {
  if (memoryFollowups && memoryFollowups.length > 0) return memoryFollowups;

  // 1. Try primary data file
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryFollowups = parsed;
        return memoryFollowups;
      }
    }
  } catch (err) {
    // ignore
  }

  // 2. Try serverless tmp file
  try {
    if (fs.existsSync(TMP_DATA_FILE)) {
      const raw = fs.readFileSync(TMP_DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryFollowups = parsed;
        return memoryFollowups;
      }
    }
  } catch (err) {
    // ignore
  }

  memoryFollowups = [];
  return memoryFollowups;
}

function saveFollowupsToFile(records: FollowupRecord[]): boolean {
  memoryFollowups = records;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
    return true;
  } catch (err) {
    // Fallback to /tmp in serverless environment
    try {
      fs.writeFileSync(TMP_DATA_FILE, JSON.stringify(records, null, 2), 'utf-8');
      return true;
    } catch {
      return true; // cached in memory
    }
  }
}

export async function getFollowups(): Promise<FollowupRecord[]> {
  const records = loadFollowupsFromFile();
  return [...records].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getFollowupById(id: string): Promise<FollowupRecord | null> {
  const records = loadFollowupsFromFile();
  return records.find((r) => r.id === id) || null;
}

export async function createFollowup(data: Partial<FollowupRecord>): Promise<FollowupRecord> {
  const records = loadFollowupsFromFile();
  const now = new Date().toISOString();
  const id = `fol-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const newRecord: FollowupRecord = {
    id: data.id || id,
    name: (data.name || (data as any).fullName || 'Valued Client').trim(),
    phone: (data.phone || '').trim(),
    email: (data.email || '').trim(),
    requirement: (data.requirement || 'General Enquiry').trim(),
    location: (data.location || (data as any).preferredLocation || 'Mumbai & MMR').trim(),
    propertyType: (data.propertyType || 'Residential').trim(),
    bhk: (data.bhk || '').trim(),
    budget: (data.budget || '').trim(),
    message: (data.message || '').trim(),
    source: (data.source || 'Website').trim(),
    status: data.status || 'New',
    notes: (data.notes || '').trim(),
    createdAt: now,
    updatedAt: now,
  };

  records.unshift(newRecord);
  saveFollowupsToFile(records);
  return newRecord;
}

export async function updateFollowup(
  id: string,
  updates: Partial<FollowupRecord>
): Promise<FollowupRecord | null> {
  const records = loadFollowupsFromFile();
  const index = records.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const current = records[index];
  const now = new Date().toISOString();

  const updated: FollowupRecord = {
    ...current,
    ...updates,
    updatedAt: now,
  };

  records[index] = updated;
  saveFollowupsToFile(records);
  return updated;
}

export async function deleteFollowup(id: string): Promise<{ success: boolean; message: string }> {
  const records = loadFollowupsFromFile();
  const index = records.findIndex((r) => r.id === id);
  if (index === -1) {
    return { success: false, message: 'Follow-up record not found in database.' };
  }

  // Permanently delete from local database file
  records.splice(index, 1);
  memoryFollowups = records;
  saveFollowupsToFile(records);

  // If Supabase is connected, also delete from Supabase table
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('enquiries').delete().eq('id', id);
    } catch (err) {
      console.warn('[FollowupStore] Supabase delete note:', err);
    }
  }

  return { success: true, message: 'Follow-up record permanently deleted from database.' };
}
