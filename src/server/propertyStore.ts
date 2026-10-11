import fs from 'fs';
import path from 'path';
import { ManagedProperty, PropertyPhotoItem } from '../types';
import { getSupabaseClient, getSupabaseConfigStatus } from './supabase';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'properties.json');
const TMP_DATA_FILE = path.join('/tmp', 'properties.json');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads', 'properties');

// Ensure directories exist if filesystem is writable
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (err) {
  // Silent catch for serverless read-only environment
}

try {
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }
} catch (err) {
  // Silent catch for serverless read-only environment
}

// Baseline confirmed properties from Shree Sai Developers
export const SEED_PROPERTIES: ManagedProperty[] = [
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

let memoryProperties: ManagedProperty[] | null = null;

/**
 * Loads properties from JSON file or initializes with seed properties
 */
function loadPropertiesFromFile(): ManagedProperty[] {
  if (memoryProperties && memoryProperties.length > 0) return memoryProperties;

  // 1. Try primary data file
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryProperties = parsed;
        return memoryProperties;
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
        memoryProperties = parsed;
        return memoryProperties;
      }
    }
  } catch (err) {
    // ignore
  }

  // Initialize with seed properties ONLY when DATA_FILE doesn't exist
  memoryProperties = [...SEED_PROPERTIES];
  savePropertiesToFile(memoryProperties);
  return memoryProperties;
}

/**
 * Saves properties to local file store or serverless /tmp
 */
function savePropertiesToFile(properties: ManagedProperty[]) {
  memoryProperties = properties;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(properties, null, 2), 'utf-8');
    return;
  } catch (err) {
    // Fallback to /tmp in read-only serverless environments
    try {
      fs.writeFileSync(TMP_DATA_FILE, JSON.stringify(properties, null, 2), 'utf-8');
    } catch (tmpErr) {
      console.warn('[PropertyStore] Running in memory-only storage mode');
    }
  }
}

/**
 * Syncs properties with Supabase if table exists
 */
async function syncWithSupabase(): Promise<ManagedProperty[] | null> {
  const status = getSupabaseConfigStatus();
  if (!status.configured) return null;

  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client.from('properties').select('*');
    if (!error && Array.isArray(data) && data.length > 0) {
      const mapped: ManagedProperty[] = data.map((row: any) => ({
        id: row.id || `prop-${Date.now()}`,
        name: row.name || 'Untitled Property',
        location: row.location || 'Mumbai & MMR',
        listingType: row.listing_type || row.listingType || 'Buy',
        description: row.description || '',
        coverImage: row.cover_image || row.coverImage || '/3.png',
        images: Array.isArray(row.images) ? row.images : [],
        status: row.status || 'Available',
        featured: Boolean(row.featured),
        published: row.published !== false,
        isArchived: Boolean(row.is_archived ?? row.isArchived),
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.updated_at || new Date().toISOString(),
      }));

      memoryProperties = mapped;
      savePropertiesToFile(mapped);
      return mapped;
    }
  } catch (err) {
    console.warn('[PropertyStore] Supabase properties sync note:', err);
  }

  return null;
}

/**
 * Get all properties with optional filtering
 */
export async function getProperties(options: {
  includeArchived?: boolean;
  includeUnpublished?: boolean;
}): Promise<ManagedProperty[]> {
  const { includeArchived = false, includeUnpublished = false } = options;

  let all = await syncWithSupabase();
  if (!all) {
    all = loadPropertiesFromFile();
  }

  return all.filter((prop) => {
    if (!includeArchived && prop.isArchived) return false;
    if (!includeUnpublished && !prop.published) return false;
    return true;
  });
}

/**
 * Get a single property by ID
 */
export async function getPropertyById(id: string, includeUnpublished = false): Promise<ManagedProperty | null> {
  const all = await getProperties({ includeArchived: includeUnpublished, includeUnpublished });
  const found = all.find((p) => p.id === id);
  return found || null;
}

/**
 * Generates URL-friendly slug ID from name
 */
export function generatePropertyId(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const timestamp = Date.now().toString(36).slice(-4);
  return `${base || 'property'}-${timestamp}`;
}

/**
 * Adds a new property
 */
export async function createProperty(input: {
  name: string;
  location: string;
  listingType: 'Buy' | 'Sell' | 'Rent';
  description: string;
  coverImage?: string;
  images?: PropertyPhotoItem[];
  status?: 'Available' | 'Sold' | 'Rented' | 'Unavailable';
  featured?: boolean;
  published?: boolean;
}): Promise<ManagedProperty> {
  const all = loadPropertiesFromFile();

  const id = generatePropertyId(input.name);
  const now = new Date().toISOString();

  const images = input.images || [];
  const coverImage = input.coverImage || (images.length > 0 ? images[0].url : '/3.png');

  const newProperty: ManagedProperty = {
    id,
    name: input.name.trim(),
    location: input.location.trim(),
    listingType: input.listingType || 'Buy',
    description: input.description.trim(),
    coverImage,
    images,
    status: input.status || 'Available',
    featured: Boolean(input.featured),
    published: input.published !== false,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  };

  all.unshift(newProperty);
  memoryProperties = all;
  savePropertiesToFile(all);

  // Sync to Supabase if table is present
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('properties').insert([
        {
          id: newProperty.id,
          name: newProperty.name,
          location: newProperty.location,
          listing_type: newProperty.listingType,
          description: newProperty.description,
          cover_image: newProperty.coverImage,
          images: newProperty.images,
          status: newProperty.status,
          featured: newProperty.featured,
          published: newProperty.published,
          is_archived: false,
          created_at: newProperty.createdAt,
          updated_at: newProperty.updatedAt,
        },
      ]);
    } catch (sbErr) {
      console.warn('[PropertyStore] Supabase insert note:', sbErr);
    }
  }

  return newProperty;
}

/**
 * Updates an existing property
 */
export async function updateProperty(
  id: string,
  updates: Partial<ManagedProperty>
): Promise<ManagedProperty | null> {
  const all = loadPropertiesFromFile();
  const index = all.findIndex((p) => p.id === id);

  if (index === -1) {
    return null;
  }

  const existing = all[index];
  const now = new Date().toISOString();

  // Prevent changing ID of seed properties
  const isSeed = SEED_PROPERTIES.some((s) => s.id === id);

  const updated: ManagedProperty = {
    ...existing,
    ...updates,
    id: existing.id, // ID remains immutable
    name: updates.name ? updates.name.trim() : existing.name,
    location: updates.location ? updates.location.trim() : existing.location,
    description: updates.description !== undefined ? updates.description.trim() : existing.description,
    updatedAt: now,
  };

  // If coverImage not specified or images changed, ensure coverImage matches
  if (updates.images && updates.images.length > 0 && !updates.coverImage) {
    const coverPhoto = updates.images.find((img) => img.isCover) || updates.images[0];
    updated.coverImage = coverPhoto.url;
  }

  all[index] = updated;
  memoryProperties = all;
  savePropertiesToFile(all);

  // Update in Supabase if configured
  const client = getSupabaseClient();
  if (client) {
    try {
      await client
        .from('properties')
        .update({
          name: updated.name,
          location: updated.location,
          listing_type: updated.listingType,
          description: updated.description,
          cover_image: updated.coverImage,
          images: updated.images,
          status: updated.status,
          featured: updated.featured,
          published: updated.published,
          is_archived: updated.isArchived,
          updated_at: updated.updatedAt,
        })
        .eq('id', id);
    } catch (sbErr) {
      console.warn('[PropertyStore] Supabase update note:', sbErr);
    }
  }

  return updated;
}

/**
 * Safely archive/unarchive property
 */
export async function setPropertyArchiveStatus(id: string, isArchived: boolean): Promise<ManagedProperty | null> {
  return updateProperty(id, { isArchived });
}

/**
 * Permanently deletes property from database
 */
export async function deleteProperty(id: string): Promise<{ success: boolean; message: string; error?: string }> {
  if (!id || typeof id !== 'string') {
    return { success: false, message: 'Invalid property ID.', error: 'Property ID is required.' };
  }

  const all = loadPropertiesFromFile();
  const index = all.findIndex((p) => p.id === id);

  if (index === -1) {
    return { success: false, message: 'Property not found in database.', error: `Property with ID "${id}" does not exist in database.` };
  }

  const [removed] = all.splice(index, 1);
  memoryProperties = all;
  savePropertiesToFile(all);

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('properties').delete().eq('id', id);
    } catch (err) {
      console.warn('[PropertyStore] Supabase delete note:', err);
    }
  }

  return {
    success: true,
    message: `Property "${removed.name}" permanently deleted from database.`,
  };
}

/**
 * Saves uploaded image to Supabase Storage if available, or local filesystem
 */
export async function savePropertyPhoto(
  file: Express.Multer.File
): Promise<{ url: string; filename: string; originalname: string; size: number }> {
  const client = getSupabaseClient();
  const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
  const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${cleanName}-${Date.now()}${ext}`;

  // 1. Try Supabase Storage if configured
  if (client) {
    try {
      const { data, error } = await client.storage
        .from('property-images')
        .upload(`uploads/${filename}`, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (!error && data?.path) {
        const { data: publicUrlData } = client.storage
          .from('property-images')
          .getPublicUrl(data.path);

        if (publicUrlData?.publicUrl) {
          console.log('[Supabase Storage Success] Uploaded property image:', publicUrlData.publicUrl);
          return {
            url: publicUrlData.publicUrl,
            filename,
            originalname: file.originalname,
            size: file.size,
          };
        }
      }
    } catch (storageErr) {
      console.warn('[Supabase Storage Upload Note, falling back to local static]:', storageErr);
    }
  }

  // 2. Fallback to local static uploads directory if writable
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
    const targetPath = path.join(UPLOADS_DIR, filename);
    fs.writeFileSync(targetPath, file.buffer);
    const publicUrl = `/uploads/properties/${filename}`;
    console.log('[Local Storage Success] Saved property image to static uploads:', publicUrl);
    return {
      url: publicUrl,
      filename,
      originalname: file.originalname,
      size: file.size,
    };
  } catch (fsErr) {
    // 3. Resilient serverless fallback (read-only filesystem)
    // Convert to standard Data URL so the uploaded photo is preserved in database / property records
    console.log('[Serverless Storage Fallback] Storing photo as inline Data URL');
    const mime = file.mimetype || 'image/jpeg';
    const base64 = file.buffer.toString('base64');
    const dataUrl = `data:${mime};base64,${base64}`;
    return {
      url: dataUrl,
      filename,
      originalname: file.originalname,
      size: file.size,
    };
  }
}
