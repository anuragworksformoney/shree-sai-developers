import fs from 'fs';
import path from 'path';
import { ClientProject, ClientProjectStatus } from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'client_projects.json');
const TMP_DATA_FILE = path.join('/tmp', 'client_projects.json');

// Ensure directory exists if filesystem is writable
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  // Silent catch for serverless read-only environment
}

let memoryProjects: ClientProject[] | null = null;

function loadProjectsFromFile(): ClientProject[] {
  if (memoryProjects && memoryProjects.length > 0) return memoryProjects;

  // 1. Try primary data file
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryProjects = parsed;
        return memoryProjects;
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
        memoryProjects = parsed;
        return memoryProjects;
      }
    }
  } catch (err) {
    // ignore
  }

  // Generic internal project store: strictly no prefilled fake or unrelated brand records
  memoryProjects = [];
  return memoryProjects;
}

function saveProjectsToFile(projects: ClientProject[]): boolean {
  memoryProjects = projects;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(projects, null, 2), 'utf-8');
    return true;
  } catch (err) {
    // Fallback to /tmp in serverless environment
    try {
      fs.writeFileSync(TMP_DATA_FILE, JSON.stringify(projects, null, 2), 'utf-8');
      return true;
    } catch {
      return true; // cached in memory
    }
  }
}

export async function getClientProjects(): Promise<ClientProject[]> {
  const projects = loadProjectsFromFile();
  return [...projects].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getClientProjectById(id: string): Promise<ClientProject | null> {
  const projects = loadProjectsFromFile();
  return projects.find((p) => p.id === id) || null;
}

export async function createClientProject(data: {
  clientName: string;
  projectName: string;
  projectType?: string;
  startDate?: string;
  expectedCompletionDate?: string;
  status?: ClientProjectStatus;
  url?: string;
  notes?: string;
}): Promise<ClientProject> {
  const projects = loadProjectsFromFile();
  const now = new Date().toISOString();
  const id = `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const newProject: ClientProject = {
    id,
    clientName: data.clientName.trim(),
    projectName: data.projectName.trim(),
    projectType: (data.projectType || 'Residential Development').trim(),
    startDate: data.startDate || '',
    expectedCompletionDate: data.expectedCompletionDate || '',
    status: data.status || 'Planning',
    url: (data.url || '').trim(),
    notes: (data.notes || '').trim(),
    createdAt: now,
    updatedAt: now,
  };

  projects.unshift(newProject);
  saveProjectsToFile(projects);
  return newProject;
}

export async function updateClientProject(
  id: string,
  updates: Partial<ClientProject>
): Promise<ClientProject | null> {
  const projects = loadProjectsFromFile();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const current = projects[index];
  const now = new Date().toISOString();

  const updated: ClientProject = {
    ...current,
    clientName: updates.clientName !== undefined ? updates.clientName.trim() : current.clientName,
    projectName: updates.projectName !== undefined ? updates.projectName.trim() : current.projectName,
    projectType: updates.projectType !== undefined ? updates.projectType.trim() : current.projectType,
    startDate: updates.startDate !== undefined ? updates.startDate : current.startDate,
    expectedCompletionDate: updates.expectedCompletionDate !== undefined ? updates.expectedCompletionDate : current.expectedCompletionDate,
    status: updates.status !== undefined ? updates.status : current.status,
    url: updates.url !== undefined ? updates.url.trim() : current.url,
    notes: updates.notes !== undefined ? updates.notes.trim() : current.notes,
    updatedAt: now,
  };

  projects[index] = updated;
  saveProjectsToFile(projects);
  return updated;
}

export async function updateClientProjectStatus(
  id: string,
  status: ClientProjectStatus
): Promise<ClientProject | null> {
  return updateClientProject(id, { status });
}

export async function deleteClientProject(id: string): Promise<{ success: boolean; message: string }> {
  const projects = loadProjectsFromFile();
  const filtered = projects.filter((p) => p.id !== id);
  if (filtered.length === projects.length) {
    return { success: false, message: 'Project not found' };
  }

  saveProjectsToFile(filtered);
  return { success: true, message: 'Project deleted successfully' };
}
