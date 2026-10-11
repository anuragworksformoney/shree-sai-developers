import 'dotenv/config';
import express, { Request, Response } from 'express';
import multer from 'multer';
import nodemailer from 'nodemailer';
import {
  insertEnquiryIntoSupabase,
  testSupabaseConnection,
  getSupabaseConfigStatus,
} from './supabase';
import {
  authenticateAdmin,
  requireAdminAuth,
} from './auth';
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  setPropertyArchiveStatus,
  deleteProperty,
  savePropertyPhoto,
} from './propertyStore';
import {
  getFollowups,
  createFollowup,
  updateFollowup,
  deleteFollowup,
} from './followupStore';
import {
  getClientProjects,
  createClientProject,
  updateClientProject,
  updateClientProjectStatus,
  deleteClientProject,
} from './clientProjectStore';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
});

const PRIMARY_DESTINATION_EMAIL = process.env.DESTINATION_EMAIL || 'shreesaideveloper.in@gmail.com';
const FALLBACK_DESTINATION_EMAIL = process.env.FALLBACK_DESTINATION_EMAIL || 'ssdofficial0001@gmail.com';
const DESTINATION_EMAILS = [PRIMARY_DESTINATION_EMAIL, FALLBACK_DESTINATION_EMAIL].filter(
  (email, idx, self) => Boolean(email) && self.indexOf(email) === idx
);

export function createExpressApp() {
  const app = express();

  // Middleware for parsing JSON and form submissions
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Create API Router so routes can be matched both at /api/* and root /* (for Vercel rewrites)
  const router = express.Router();

  // ==========================================
  // SYSTEM HEALTH & DIAGNOSTICS
  // ==========================================
  router.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Shree Sai Developers API',
      destinationEmails: DESTINATION_EMAILS,
      supabase: getSupabaseConfigStatus(),
      smtpConfigured: Boolean(process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD),
      resendConfigured: Boolean(process.env.RESEND_API_KEY),
      web3formsConfigured: Boolean(process.env.WEB3FORMS_ACCESS_KEY),
    });
  });

  router.get('/supabase/status', async (req: Request, res: Response) => {
    const status = await testSupabaseConnection();
    res.json(status);
  });

  router.post('/supabase/verify', async (req: Request, res: Response) => {
    const testPayload = {
      name: 'Test Verification Visitor',
      phone: '+91 98674 78525',
      email: 'verified@shreesaideveloper.in',
      requirement: 'Supabase Connection Verification',
      location: 'Mumbai & MMR',
      propertyType: 'Residential',
      message: 'Automated test to confirm Supabase enquiries table connection',
      source: 'System Connection Test',
    };

    const result = await insertEnquiryIntoSupabase(testPayload);
    res.json({
      tested: true,
      timestamp: new Date().toISOString(),
      result,
    });
  });

  // ==========================================
  // FORM ENQUIRY SUBMISSION (Handles both /enquire & /enquiry)
  // ==========================================
  const handleEnquiry = async (req: Request, res: Response) => {
    try {
      const {
        fullName,
        name,
        ownerName,
        phone,
        email,
        requirement,
        requirementType,
        serviceInterest,
        preferredLocation,
        location,
        propertyLocation,
        propertyInterest,
        propertyType,
        bhk,
        budget,
        budgetOrArea,
        monthlyBudget,
        expectedPrice,
        area,
        approximateArea,
        message,
        additionalRequirements,
        additionalDetails,
        source,
      } = req.body;

      const clientName = fullName || name || ownerName || 'Valued Client';
      const clientPhone = phone || '';
      const clientEmail = email || '';
      const clientReq = requirement || requirementType || serviceInterest || 'General Enquiry';
      const clientInterest = propertyInterest || 'Shree Sai Developers Property';
      const clientLocation = preferredLocation || location || propertyLocation || 'Mumbai / MMR';
      const clientPropertyType = propertyType || 'Residential';
      const clientBHK = bhk || '';
      const clientBudget = budget || budgetOrArea || monthlyBudget || expectedPrice || '';
      const clientArea = area || approximateArea || '';
      const clientMessage = message || additionalRequirements || additionalDetails || '';

      // 1. Mandatory Supabase Database Insert
      const supabaseResult = await insertEnquiryIntoSupabase(req.body);

      // 2. Also register into Admin Follow-ups Store
      try {
        await createFollowup({
          name: clientName,
          phone: clientPhone,
          email: clientEmail,
          requirement: clientReq,
          location: clientLocation,
          propertyType: clientPropertyType,
          bhk: clientBHK,
          budget: clientBudget,
          message: clientMessage,
          source: source || 'Website Enquiry Form',
          status: 'New',
        });
      } catch (folErr) {
        console.warn('[Followup Store Note]:', folErr);
      }

      if (!supabaseResult.success) {
        console.warn('[Supabase Insertion Notice]:', supabaseResult.error);
        // If Supabase is not configured, still return success since followup was registered
        const supabaseConfig = getSupabaseConfigStatus();
        if (supabaseConfig.configured) {
          return res.status(500).json({
            success: false,
            error: 'SUPABASE_INSERTION_FAILED',
            message: supabaseResult.error || 'Unable to save enquiry to the database.',
            details: supabaseResult.details,
          });
        }
      }

      // Secondary Email Notifications (Dispatched in background)
      (async () => {
        try {
          const plainText = `
NEW PROPERTY ENQUIRY — SHREE SAI DEVELOPERS

==================================================
REQUIREMENT: ${clientReq}
PROPERTY / INTEREST: ${clientInterest}
==================================================

CLIENT DETAILS:
- Full Name: ${clientName}
- Phone Number: ${clientPhone || 'Not provided'}
- Email Address: ${clientEmail || 'Not provided'}

PROPERTY PREFERENCES:
- Location: ${clientLocation}
- Type: ${clientPropertyType}
- BHK / Configuration: ${clientBHK || 'N/A'}
- Budget / Area: ${clientBudget || 'N/A'}
- Approx Area: ${clientArea || 'N/A'}

MESSAGE / NOTES:
${clientMessage || 'No additional message provided'}

==================================================
Submitted via: ${source || 'Shree Sai Developers Web Portal'}
Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
Recipient Inboxes: ${DESTINATION_EMAILS.join(', ')}
==================================================
`;

          const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
          const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER || PRIMARY_DESTINATION_EMAIL;
          const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

          if (smtpPass) {
            const isGmail = smtpHost.includes('gmail.com');
            const transporter = nodemailer.createTransport(
              isGmail
                ? {
                    service: 'gmail',
                    auth: { user: smtpUser, pass: smtpPass },
                  }
                : {
                    host: smtpHost,
                    port: Number(process.env.SMTP_PORT) || 465,
                    secure: process.env.SMTP_SECURE !== 'false',
                    auth: { user: smtpUser, pass: smtpPass },
                  }
            );

            await transporter.sendMail({
              from: `"Shree Sai Developers Portal" <${smtpUser}>`,
              to: DESTINATION_EMAILS.join(', '),
              replyTo: clientEmail || undefined,
              subject: `[Shree Sai Developers] New Enquiry: ${clientReq} - ${clientName}`,
              text: plainText,
            });
            console.log('[Email Notice] Delivered via SMTP to', DESTINATION_EMAILS.join(', '));
          }
        } catch (emailErr) {
          console.warn('[Secondary Email Dispatch Notice]:', emailErr);
        }
      })();

      return res.status(200).json({
        success: true,
        message: 'Your enquiry has been successfully registered. Our advisory desk will contact you shortly.',
        enquiryId: supabaseResult.id || `enq-${Date.now()}`,
        savedToSupabase: supabaseResult.success,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Fatal error processing enquiry:', error);
      return res.status(500).json({
        success: false,
        error: 'Unable to process enquiry. Please connect via WhatsApp or Call directly.',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  router.post('/enquire', handleEnquiry);
  router.post('/enquiry', handleEnquiry);

  // ==========================================
  // PUBLIC PROPERTIES API
  // ==========================================
  router.get('/properties', async (req: Request, res: Response) => {
    try {
      const properties = await getProperties({ includeArchived: false, includeUnpublished: false });
      res.json({ success: true, count: properties.length, properties });
    } catch (err: any) {
      console.error('[API Properties Error]:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch properties' });
    }
  });

  router.get('/properties/:id', async (req: Request, res: Response) => {
    try {
      const propId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const property = await getPropertyById(propId, false);
      if (!property) {
        return res.status(404).json({ success: false, error: 'Property not found or unavailable' });
      }
      res.json({ success: true, property });
    } catch (err: any) {
      console.error('[API Property Detail Error]:', err);
      res.status(500).json({ success: false, error: 'Failed to fetch property details' });
    }
  });

  // ==========================================
  // ADMIN AUTHENTICATION API
  // ==========================================
  router.post('/admin/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const authResult = await authenticateAdmin(email, password);
      if (!authResult.success) {
        return res.status(401).json({
          success: false,
          error: 'AUTH_FAILED',
          message: authResult.error || 'Invalid admin credentials.',
        });
      }
      return res.json({
        success: true,
        token: authResult.token,
        email: authResult.email,
        role: 'admin',
      });
    } catch (err: any) {
      console.error('[Admin Login Error]:', err);
      res.status(500).json({ success: false, error: 'Authentication processing error' });
    }
  });

  router.get('/admin/me', requireAdminAuth, (req: Request, res: Response) => {
    const adminUser = (req as any).adminUser;
    res.json({
      success: true,
      authenticated: true,
      user: {
        email: adminUser?.email,
        role: adminUser?.role || 'admin',
      },
    });
  });

  router.post('/admin/logout', (req: Request, res: Response) => {
    res.json({ success: true, message: 'Logged out successfully' });
  });

  // ==========================================
  // PROTECTED ADMIN PROPERTY MANAGEMENT API
  // ==========================================
  router.get('/admin/properties', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const properties = await getProperties({ includeArchived: true, includeUnpublished: true });
      res.json({ success: true, count: properties.length, properties });
    } catch (err: any) {
      console.error('[Admin Get Properties Error]:', err);
      res.status(500).json({ success: false, error: 'Failed to load property inventory' });
    }
  });

  router.post('/admin/properties', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const { name, location, listingType, description, coverImage, images, status, featured, published } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: 'Property Name is required.' });
      }
      if (!location || !location.trim()) {
        return res.status(400).json({ success: false, error: 'Location is required.' });
      }
      if (!description || !description.trim()) {
        return res.status(400).json({ success: false, error: 'Description is required.' });
      }

      const created = await createProperty({
        name,
        location,
        listingType: listingType || 'Buy',
        description,
        coverImage,
        images: Array.isArray(images) ? images : [],
        status: status || 'Available',
        featured: Boolean(featured),
        published: published !== false,
      });

      res.status(201).json({
        success: true,
        message: 'Property created successfully.',
        property: created,
      });
    } catch (err: any) {
      console.error('[Admin Create Property Error]:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to create property' });
    }
  });

  router.put('/admin/properties/:id', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const propId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await updateProperty(propId, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Property not found.' });
      }
      res.json({
        success: true,
        message: 'Property updated successfully.',
        property: updated,
      });
    } catch (err: any) {
      console.error('[Admin Update Property Error]:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to update property' });
    }
  });

  router.post('/admin/properties/:id/archive', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const propId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const isArchived = req.body.isArchived !== false;
      const updated = await setPropertyArchiveStatus(propId, isArchived);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Property not found.' });
      }
      res.json({
        success: true,
        message: isArchived ? 'Property archived successfully.' : 'Property restored from archive.',
        property: updated,
      });
    } catch (err: any) {
      console.error('[Admin Archive Property Error]:', err);
      res.status(500).json({ success: false, error: 'Failed to update archive status' });
    }
  });

  router.delete('/admin/properties/:id', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0] : rawId;
      if (!id || !id.trim()) {
        return res.status(400).json({ success: false, error: 'Property ID is required.' });
      }

      const result = await deleteProperty(id);
      if (!result.success) {
        return res.status(404).json({ success: false, error: result.error || 'Property not found.' });
      }

      return res.json({
        success: true,
        message: result.message || 'Property permanently deleted from database.',
        id,
      });
    } catch (err: any) {
      console.error('[Admin Delete Property Error]:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to delete property from database.',
      });
    }
  });

  router.post('/admin/upload', requireAdminAuth, upload.array('photos', 15), async (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ success: false, error: 'No image files uploaded.' });
      }

      const results = [];
      for (const file of files) {
        const saved = await savePropertyPhoto(file);
        results.push(saved);
      }

      res.json({
        success: true,
        message: `Successfully uploaded ${results.length} photo(s).`,
        photos: results,
      });
    } catch (err: any) {
      console.error('[Admin Photo Upload Error]:', err);
      res.status(500).json({ success: false, error: err.message || 'Image upload failed' });
    }
  });

  // ==========================================
  // PROTECTED ADMIN FOLLOW-UPS MANAGEMENT API
  // ==========================================
  router.get('/admin/followups', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const followups = await getFollowups();
      res.json({ success: true, count: followups.length, followups });
    } catch (err: any) {
      console.error('[Admin Get Followups Error]:', err);
      res.status(500).json({ success: false, error: 'Failed to load follow-ups' });
    }
  });

  router.post('/admin/followups', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const created = await createFollowup(req.body);
      res.status(201).json({ success: true, followup: created });
    } catch (err: any) {
      console.error('[Admin Create Followup Error]:', err);
      res.status(500).json({ success: false, error: 'Failed to create follow-up record' });
    }
  });

  router.put('/admin/followups/:id', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await updateFollowup(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Follow-up not found' });
      }
      res.json({ success: true, followup: updated });
    } catch (err: any) {
      console.error('[Admin Update Followup Error]:', err);
      res.status(500).json({ success: false, error: 'Failed to update follow-up record' });
    }
  });

  router.patch('/admin/followups/:id/status', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await updateFollowup(id, { status: req.body.status });
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Follow-up not found' });
      }
      res.json({ success: true, followup: updated });
    } catch (err: any) {
      console.error('[Admin Update Followup Status Error]:', err);
      res.status(500).json({ success: false, error: 'Failed to update status' });
    }
  });

  router.delete('/admin/followups/:id', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await deleteFollowup(id);
      if (!result.success) {
        return res.status(404).json({ success: false, error: result.message });
      }
      res.json({ success: true, message: result.message });
    } catch (err: any) {
      console.error('[Admin Delete Followup Error]:', err);
      res.status(500).json({ success: false, error: 'Failed to delete follow-up record' });
    }
  });

  // ==========================================
  // PROTECTED ADMIN CLIENT PROJECTS MANAGEMENT API
  // ==========================================
  router.get('/admin/client-projects', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const projects = await getClientProjects();
      res.json({ success: true, count: projects.length, projects });
    } catch (err: any) {
      console.error('[Admin Get Client Projects Error]:', err);
      res.status(500).json({ success: false, error: 'Failed to load client projects' });
    }
  });

  router.post('/admin/client-projects', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const created = await createClientProject(req.body);
      res.status(201).json({ success: true, project: created });
    } catch (err: any) {
      console.error('[Admin Create Client Project Error]:', err);
      res.status(500).json({ success: false, error: 'Failed to create client project' });
    }
  });

  router.put('/admin/client-projects/:id', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await updateClientProject(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }
      res.json({ success: true, project: updated });
    } catch (err: any) {
      console.error('[Admin Update Client Project Error]:', err);
      res.status(500).json({ success: false, error: 'Failed to update client project' });
    }
  });

  router.patch('/admin/client-projects/:id/status', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const updated = await updateClientProjectStatus(id, req.body.status);
      if (!updated) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }
      res.json({ success: true, project: updated });
    } catch (err: any) {
      console.error('[Admin Update Client Project Status Error]:', err);
      res.status(500).json({ success: false, error: 'Failed to update project status' });
    }
  });

  router.delete('/admin/client-projects/:id', requireAdminAuth, async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await deleteClientProject(id);
      if (!result.success) {
        return res.status(404).json({ success: false, error: result.message });
      }
      res.json({ success: true, message: result.message });
    } catch (err: any) {
      console.error('[Admin Delete Client Project Error]:', err);
      res.status(500).json({ success: false, error: 'Failed to delete client project' });
    }
  });

  // Mount router at both /api and root / to support direct routing and serverless rewrites
  app.use('/api', router);
  app.use(router);

  return app;
}

export const app = createExpressApp();
export default app;
