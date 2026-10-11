import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cache the client instance
let supabaseClient: SupabaseClient | null = null;
let cachedColumns: string[] | null = null;

export interface EnquiryInput {
  fullName?: string;
  name?: string;
  ownerName?: string;
  phone: string;
  email?: string;
  requirement?: string;
  requirementType?: string;
  serviceInterest?: string;
  preferredLocation?: string;
  location?: string;
  propertyLocation?: string;
  propertyInterest?: string;
  propertyType?: string;
  bhk?: string;
  budget?: string;
  budgetOrArea?: string;
  monthlyBudget?: string;
  expectedPrice?: string;
  area?: string;
  approximateArea?: string;
  message?: string;
  additionalRequirements?: string;
  additionalDetails?: string;
  source?: string;
  [key: string]: any;
}

export interface SupabaseConfigStatus {
  configured: boolean;
  hasUrl: boolean;
  hasKey: boolean;
  urlHost?: string;
  keyType?: 'service_role' | 'anon' | 'unknown';
}

/**
 * Retrieve Supabase configuration status safely without exposing secret keys
 */
export function getSupabaseConfigStatus(): SupabaseConfigStatus {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    '';

  const hasUrl = Boolean(url && url.trim().startsWith('http'));
  const hasKey = Boolean(key && key.trim().length > 10);

  let urlHost: string | undefined;
  if (hasUrl) {
    try {
      urlHost = new URL(url).host;
    } catch {
      urlHost = 'invalid-url';
    }
  }

  let keyType: 'service_role' | 'anon' | 'unknown' | undefined;
  if (hasKey) {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      keyType = 'service_role';
    } else if (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY) {
      keyType = 'anon';
    } else {
      keyType = 'unknown';
    }
  }

  return {
    configured: hasUrl && hasKey,
    hasUrl,
    hasKey,
    urlHost,
    keyType,
  };
}

/**
 * Lazy initialization of Supabase client to prevent boot crashes if variables are missing
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) {
    return supabaseClient;
  }

  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  try {
    supabaseClient = createClient(url.trim(), key.trim(), {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    return supabaseClient;
  } catch (err) {
    console.error('[Supabase Client Init Error]:', err);
    return null;
  }
}

/**
 * Discovers columns of the existing `enquiries` table by inspecting existing records
 */
export async function discoverEnquiriesColumns(): Promise<string[] | null> {
  if (cachedColumns && cachedColumns.length > 0) {
    return cachedColumns;
  }

  const client = getSupabaseClient();
  if (!client) return null;

  try {
    // Try to fetch 1 row to inspect existing column keys
    const { data, error } = await client.from('enquiries').select('*').limit(1);
    if (!error && data && data.length > 0) {
      cachedColumns = Object.keys(data[0]);
      console.log('[Supabase] Discovered columns from existing row:', cachedColumns);
      return cachedColumns;
    }
  } catch (e) {
    console.warn('[Supabase] Could not inspect columns from existing rows:', e);
  }

  return null;
}

/**
 * Builds candidate payload objects matching various standard naming conventions
 */
function buildCandidatePayloads(input: EnquiryInput): Record<string, any>[] {
  const clientName = input.fullName || input.name || input.ownerName || 'Website Visitor';
  const clientPhone = input.phone || '';
  const clientEmail = input.email && input.email.trim() ? input.email.trim() : null;
  const clientReq = input.requirement || input.requirementType || input.serviceInterest || 'General Enquiry';
  const clientLocation = input.preferredLocation || input.location || input.propertyLocation || null;
  const clientPropType = input.propertyType || null;
  const clientBhk = input.bhk || null;
  const clientBudget = input.budget || input.budgetOrArea || input.monthlyBudget || input.expectedPrice || null;
  const clientArea = input.area || input.approximateArea || null;
  const clientMsg = input.message || input.additionalRequirements || input.additionalDetails || null;
  const clientSource = input.source || 'Website';
  const clientInterest = input.propertyInterest || null;

  // Candidates ordered from most standard Supabase schema to minimal schemas
  const candidates: Record<string, any>[] = [
    // Standard full schema (snake_case)
    {
      name: clientName,
      full_name: clientName,
      phone: clientPhone,
      phone_number: clientPhone,
      email: clientEmail,
      requirement: clientReq,
      requirement_type: clientReq,
      preferred_location: clientLocation,
      location: clientLocation,
      property_type: clientPropType,
      bhk: clientBhk,
      budget: clientBudget,
      area: clientArea,
      message: clientMsg,
      source: clientSource,
      property_interest: clientInterest,
      status: 'new',
    },
    // Standard schema with just primary snake_case names
    {
      name: clientName,
      phone: clientPhone,
      email: clientEmail,
      requirement: clientReq,
      location: clientLocation,
      property_type: clientPropType,
      bhk: clientBhk,
      budget: clientBudget,
      message: clientMsg,
      source: clientSource,
    },
    // Schema using full_name instead of name
    {
      full_name: clientName,
      phone_number: clientPhone,
      email: clientEmail,
      requirement: clientReq,
      property_type: clientPropType,
      budget: clientBudget,
      message: clientMsg,
    },
    // Minimal essential schema
    {
      name: clientName,
      phone: clientPhone,
      email: clientEmail,
      message: clientMsg || `${clientReq} enquiry for ${clientPropType || 'property'} (${clientBhk || ''}) in ${clientLocation || 'MMR'}`,
    },
    // Pure minimal schema
    {
      name: clientName,
      phone: clientPhone,
      message: `${clientReq} | Phone: ${clientPhone} | Email: ${clientEmail || 'N/A'} | Location: ${clientLocation || 'N/A'} | Budget: ${clientBudget || 'N/A'}`,
    },
  ];

  return candidates;
}

/**
 * Extracts the missing column name from Supabase/PostgREST error messages
 */
function extractMissingColumn(errorMessage: string): string | null {
  // Pattern 1: Could not find the 'xyz' column of 'enquiries' in the schema cache
  const match1 = errorMessage.match(/Could not find the ['"]?([a-zA-Z0-9_]+)['"]? column/i);
  if (match1 && match1[1]) return match1[1];

  // Pattern 2: column "xyz" of relation "enquiries" does not exist
  const match2 = errorMessage.match(/column ['"]?([a-zA-Z0-9_]+)['"]? of relation/i);
  if (match2 && match2[1]) return match2[1];

  // Pattern 3: column "xyz" does not exist
  const match3 = errorMessage.match(/column ['"]?([a-zA-Z0-9_]+)['"]? does not exist/i);
  if (match3 && match3[1]) return match3[1];

  return null;
}

/**
 * Inserts an enquiry into the existing Supabase `enquiries` table.
 * Strictly verifies the insertion and NEVER reports fake success.
 */
export async function insertEnquiryIntoSupabase(input: EnquiryInput): Promise<{
  success: boolean;
  id?: string | number;
  data?: any;
  error?: string;
  details?: any;
}> {
  const status = getSupabaseConfigStatus();
  if (!status.configured) {
    return {
      success: false,
      error: 'Supabase credentials are not configured. Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) are set.',
      details: status,
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      error: 'Failed to initialize Supabase client with the provided credentials.',
    };
  }

  // Check if we already know the table columns
  const knownColumns = await discoverEnquiriesColumns();

  // Try candidate payloads
  const candidateList = buildCandidatePayloads(input);

  for (let candidate of candidateList) {
    // If we have known columns, filter candidate keys to strictly those present
    let workingPayload: Record<string, any> = {};
    if (knownColumns && knownColumns.length > 0) {
      for (const [key, val] of Object.entries(candidate)) {
        if (knownColumns.includes(key)) {
          workingPayload[key] = val;
        }
      }
      // If none of candidate matched known columns, don't prune to empty
      if (Object.keys(workingPayload).length === 0) {
        workingPayload = { ...candidate };
      }
    } else {
      workingPayload = { ...candidate };
    }

    // Attempt insertion with adaptive missing-column stripping loop
    let attempts = 0;
    const maxAttempts = 8;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        // Try inserting with .select() to get generated record and ID
        const { data, error, status: httpStatus } = await client
          .from('enquiries')
          .insert([workingPayload])
          .select();

        if (!error && data && data.length > 0) {
          const insertedRow = data[0];
          // Cache discovered columns from successful insert
          cachedColumns = Object.keys(insertedRow);
          console.log('[Supabase Success] Enquiry inserted into enquiries table. ID:', insertedRow.id || 'N/A');
          return {
            success: true,
            id: insertedRow.id,
            data: insertedRow,
          };
        }

        // If insert failed because SELECT is disallowed by RLS policy, but INSERT is allowed
        if (error && error.code === '42501' && error.message.toLowerCase().includes('violates row-level security policy')) {
          // Attempt plain INSERT without .select()
          console.log('[Supabase RLS] Retrying insert without .select() returning clause...');
          const plainResult = await client.from('enquiries').insert([workingPayload]);
          if (!plainResult.error && (plainResult.status === 201 || plainResult.status === 200)) {
            console.log('[Supabase Success] Enquiry successfully recorded in enquiries table (HTTP 201 Created).');
            return {
              success: true,
              id: 'SUBMITTED',
              data: workingPayload,
            };
          }
        }

        if (error) {
          console.warn(`[Supabase Insert Attempt ${attempts} Error]:`, error.message);

          // Check if error is due to an unknown column
          const missingCol = extractMissingColumn(error.message);
          if (missingCol && workingPayload[missingCol] !== undefined) {
            console.log(`[Supabase Pruning] Column "${missingCol}" not found in enquiries table, removing and retrying...`);
            delete workingPayload[missingCol];
            if (Object.keys(workingPayload).length === 0) {
              break; // Try next candidate
            }
            continue; // Retry with pruned payload
          }

          // Check for NOT-NULL constraint violations
          const notNullMatch = error.message.match(/null value in column ['"]?([a-zA-Z0-9_]+)['"]? violates not-null/i);
          if (notNullMatch && notNullMatch[1]) {
            const col = notNullMatch[1];
            workingPayload[col] = input[col] || input.name || input.phone || 'N/A';
            continue;
          }

          // If error is permission or RLS
          if (error.code === '42501' || error.message.toLowerCase().includes('row-level security')) {
            return {
              success: false,
              error: `Supabase RLS error: ${error.message}. Please configure SUPABASE_SERVICE_ROLE_KEY or allow anonymous inserts in enquiries table.`,
              details: error,
            };
          }

          // If relation does not exist
          if (error.code === '42P01' || error.message.toLowerCase().includes('relation "enquiries" does not exist')) {
            return {
              success: false,
              error: 'Table "enquiries" was not found in the connected Supabase project. Please verify that the "enquiries" table exists in your public schema.',
              details: error,
            };
          }

          // Break to next candidate
          break;
        }
      } catch (err: any) {
        console.error('[Supabase Exception during insert]:', err);
        break;
      }
    }
  }

  return {
    success: false,
    error: 'Failed to insert enquiry into Supabase "enquiries" table. Please check schema constraints or connection keys.',
  };
}

/**
 * Checks connection to the Supabase project and queries the `enquiries` table
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  message: string;
  tableFound: boolean;
  rowCount?: number;
  sampleColumns?: string[];
  config: SupabaseConfigStatus;
}> {
  const config = getSupabaseConfigStatus();
  if (!config.configured) {
    return {
      connected: false,
      message: 'Supabase URL or Key is not configured in environment.',
      tableFound: false,
      config,
    };
  }

  const client = getSupabaseClient();
  if (!client) {
    return {
      connected: false,
      message: 'Could not instantiate Supabase client with given credentials.',
      tableFound: false,
      config,
    };
  }

  try {
    const { data, error, count } = await client
      .from('enquiries')
      .select('*', { count: 'exact' })
      .limit(5);

    if (error) {
      return {
        connected: false,
        message: `Connected to Supabase project, but query on "enquiries" failed: ${error.message}`,
        tableFound: error.code !== '42P01',
        config,
      };
    }

    const sampleColumns = data && data.length > 0 ? Object.keys(data[0]) : [];
    if (sampleColumns.length > 0) {
      cachedColumns = sampleColumns;
    }

    return {
      connected: true,
      message: `Successfully connected to Supabase and verified "enquiries" table (${count ?? (data ? data.length : 0)} existing records).`,
      tableFound: true,
      rowCount: count ?? (data ? data.length : 0),
      sampleColumns,
      config,
    };
  } catch (err: any) {
    return {
      connected: false,
      message: `Failed to connect to Supabase: ${err.message || String(err)}`,
      tableFound: false,
      config,
    };
  }
}
