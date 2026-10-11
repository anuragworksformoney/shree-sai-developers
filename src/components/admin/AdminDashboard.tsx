import React, { useState, useEffect, useRef } from 'react';
import {
  Building2,
  Lock,
  LogOut,
  Plus,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Archive,
  Eye,
  EyeOff,
  Star,
  UploadCloud,
  X,
  Edit3,
  ExternalLink,
  Search,
  RefreshCw,
} from 'lucide-react';
import {
  ManagedProperty,
  PropertyPhotoItem,
  ListingType,
  PropertyStatus,
  AdminUser,
} from '../../types';
import {
  adminLogin,
  verifyAdminSession,
  adminLogout,
  fetchAdminProperties,
  createPropertyListing,
  updatePropertyListing,
  togglePropertyArchive,
  deletePropertyListing,
  uploadPropertyPhotos,
} from '../../services/propertyService';
import { PREFERRED_LOCATIONS } from '../../data/propertyData';

interface AdminDashboardProps {
  onBackToWebsite: () => void;
  onViewPropertyDetail: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToWebsite,
  onViewPropertyDetail,
}) => {
  // Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Property Inventory State
  const [properties, setProperties] = useState<ManagedProperty[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | ListingType>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | PropertyStatus>('all');
  const [showArchived, setShowArchived] = useState(false);

  // Active View / Form State
  const [viewMode, setViewMode] = useState<'list' | 'add' | 'edit'>('list');
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);

  // Form Fields (Strictly Supported Fields Only)
  const [formName, setFormName] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formCustomLocation, setFormCustomLocation] = useState('');
  const [formListingType, setFormListingType] = useState<ListingType>('Buy');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<PropertyStatus>('Available');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formPublished, setFormPublished] = useState(true);
  const [formPhotos, setFormPhotos] = useState<PropertyPhotoItem[]>([]);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState('');

  // Upload & Submission State
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<ManagedProperty | null>(null);
  const [isDeletingRecord, setIsDeletingRecord] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check existing session on mount
  useEffect(() => {
    verifyAdminSession().then((session) => {
      if (session.authenticated && session.user) {
        setIsAdminAuthenticated(true);
        setAdminUser(session.user);
        loadInventory();
      } else {
        setIsAdminAuthenticated(false);
      }
    });
  }, []);

  const loadInventory = async () => {
    setLoadingProperties(true);
    try {
      const data = await fetchAdminProperties();
      setProperties(data);
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED') {
        setIsAdminAuthenticated(false);
        setAdminUser(null);
      } else {
        showFeedback('error', 'Failed to load property inventory.');
      }
    } finally {
      setLoadingProperties(false);
    }
  };

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setFeedbackMessage({ type, text });
    setTimeout(() => {
      setFeedbackMessage(null);
    }, 4000);
  };

  // Login Handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    const res = await adminLogin(loginEmail, loginPassword);
    setLoginLoading(false);

    if (res.success && res.user) {
      setIsAdminAuthenticated(true);
      setAdminUser(res.user);
      loadInventory();
    } else {
      setLoginError(res.error || 'Invalid admin credentials.');
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    await adminLogout();
    setIsAdminAuthenticated(false);
    setAdminUser(null);
  };

  // Switch to Add Form
  const handleOpenAdd = () => {
    setFormName('');
    setFormLocation('Vasai');
    setFormCustomLocation('');
    setFormListingType('Buy');
    setFormDescription('');
    setFormStatus('Available');
    setFormFeatured(false);
    setFormPublished(true);
    setFormPhotos([]);
    setCoverPhotoUrl('');
    setEditingPropertyId(null);
    setViewMode('add');
  };

  // Switch to Edit Form
  const handleOpenEdit = (prop: ManagedProperty) => {
    setFormName(prop.name);
    const matchedLoc = PREFERRED_LOCATIONS.find((l) => l === prop.location);
    if (matchedLoc) {
      setFormLocation(matchedLoc);
      setFormCustomLocation('');
    } else {
      setFormLocation('Other Location');
      setFormCustomLocation(prop.location);
    }
    setFormListingType(prop.listingType);
    setFormDescription(prop.description);
    setFormStatus(prop.status);
    setFormFeatured(prop.featured);
    setFormPublished(prop.published);
    setFormPhotos(prop.images || []);
    setCoverPhotoUrl(prop.coverImage || prop.images[0]?.url || '');
    setEditingPropertyId(prop.id);
    setViewMode('edit');
  };

  // File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhotos(true);
    try {
      const uploadedPhotos = await uploadPropertyPhotos(Array.from(files));
      if (Array.isArray(uploadedPhotos) && uploadedPhotos.length > 0) {
        const newPhotoItems: PropertyPhotoItem[] = uploadedPhotos.map((photo, i) => ({
          id: `photo-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          url: photo.url,
          title: photo.originalname || 'Property Photo',
        }));
        setFormPhotos((prev) => [...prev, ...newPhotoItems]);
        if (!coverPhotoUrl && uploadedPhotos[0]) {
          setCoverPhotoUrl(uploadedPhotos[0].url);
        }
        showFeedback('success', `Uploaded ${uploadedPhotos.length} photo(s).`);
      } else {
        showFeedback('error', 'Failed to upload photos.');
      }
    } catch {
      showFeedback('error', 'Network error during upload.');
    } finally {
      setIsUploadingPhotos(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    const photoToRemove = formPhotos[index];
    const newPhotos = formPhotos.filter((_, i) => i !== index);
    setFormPhotos(newPhotos);
    if (coverPhotoUrl === photoToRemove.url) {
      setCoverPhotoUrl(newPhotos[0]?.url || '');
    }
  };

  const handleSetCoverPhoto = (url: string) => {
    setCoverPhotoUrl(url);
    showFeedback('success', 'Cover photo updated.');
  };

  const handleSubmitProperty = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalLocation =
      formLocation === 'Other Location' ? formCustomLocation.trim() || 'Mumbai & MMR' : formLocation;

    if (!formName.trim()) {
      showFeedback('error', 'Property Name is required.');
      return;
    }
    if (!finalLocation) {
      showFeedback('error', 'Location is required.');
      return;
    }
    if (!formDescription.trim()) {
      showFeedback('error', 'Description is required.');
      return;
    }

    const payload: Partial<ManagedProperty> = {
      name: formName.trim(),
      location: finalLocation,
      listingType: formListingType,
      description: formDescription.trim(),
      status: formStatus,
      featured: formFeatured,
      published: formPublished,
      images: formPhotos,
      coverImage: coverPhotoUrl || formPhotos[0]?.url || '/3.png',
    };

    setIsSaving(true);
    try {
      if (viewMode === 'add') {
        const created = await createPropertyListing(payload);
        showFeedback('success', `Property "${created.name}" created successfully.`);
      } else if (viewMode === 'edit' && editingPropertyId) {
        const updated = await updatePropertyListing(editingPropertyId, payload);
        showFeedback('success', `Property "${updated.name}" updated successfully.`);
      }

      await loadInventory();
      setViewMode('list');
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to save property listing.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (prop: ManagedProperty) => {
    try {
      await updatePropertyListing(prop.id, { published: !prop.published });
      setProperties((prev) =>
        prev.map((p) => (p.id === prop.id ? { ...p, published: !p.published } : p))
      );
      showFeedback(
        'success',
        `Property "${prop.name}" is now ${!prop.published ? 'Published (Live)' : 'Unpublished (Draft)'}.`
      );
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to change publish status.');
    }
  };

  const handleToggleFeatured = async (prop: ManagedProperty) => {
    try {
      await updatePropertyListing(prop.id, { featured: !prop.featured });
      setProperties((prev) =>
        prev.map((p) => (p.id === prop.id ? { ...p, featured: !p.featured } : p))
      );
      showFeedback(
        'success',
        `Property "${prop.name}" ${!prop.featured ? 'marked as Featured' : 'unfeatured'}.`
      );
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to change featured status.');
    }
  };

  const handleToggleArchive = async (prop: ManagedProperty) => {
    const willArchive = !prop.isArchived;

    try {
      await togglePropertyArchive(prop.id, willArchive);
      setProperties((prev) =>
        prev.map((p) => (p.id === prop.id ? { ...p, isArchived: willArchive } : p))
      );
      showFeedback('success', willArchive ? `Property archived safely.` : `Property restored.`);
    } catch (err: any) {
      showFeedback('error', err.message || 'Failed to update archive status.');
    }
  };

  const handleOpenDeleteConfirm = (prop: ManagedProperty) => {
    console.log('[Admin Portal] Delete button clicked for property ID:', prop.id, prop.name);
    setDeleteConfirmTarget(prop);
  };

  const handleExecuteDelete = async () => {
    if (!deleteConfirmTarget) return;
    const target = deleteConfirmTarget;
    setIsDeletingRecord(true);
    console.log('[Admin Portal] Confirmed permanent deletion for ID:', target.id);

    try {
      console.log('[Admin Portal] Sending DELETE request to /api/admin/properties/' + target.id);
      const result = await deletePropertyListing(target.id);
      console.log('[Admin Portal] Server responded with success:', result);

      // Close dialog
      setDeleteConfirmTarget(null);

      // Mandatory Database Refetch: reload inventory from backend to guarantee UI matches real database state
      console.log('[Admin Portal] Refetching inventory from database...');
      await loadInventory();
      showFeedback('success', result.message || `Property "${target.name}" permanently deleted from database.`);
    } catch (err: any) {
      console.error('[Admin Portal] Delete request failed:', err);
      showFeedback('error', err.message || 'Failed to delete property from database.');
    } finally {
      setIsDeletingRecord(false);
    }
  };

  // ==========================================
  // 1. LOGIN SCREEN (If not authenticated)
  // ==========================================
  if (isAdminAuthenticated === false) {
    return (
      <div className="min-h-screen bg-[#0B1325] text-[#E2E8F0] flex flex-col justify-center items-center px-4 py-12 selection:bg-[#D4AF37]/30 font-montserrat">
        <div className="max-w-md w-full card-hw bg-[#1C2541] border border-[rgba(212,175,55,0.2)] p-6 sm:p-8 rounded-[4px] shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-[4px] bg-[#0B1325] border border-[rgba(212,175,55,0.3)] flex items-center justify-center text-[#D4AF37]">
              <Lock className="w-6 h-6 stroke-[2]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#D4AF37] tracking-tight font-cinzel">
              Protected Admin Portal
            </h1>
            <p className="text-xs text-[#CBD5E1]">
              SHREE SAI DEVELOPERS &bull; Property Management
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/50 text-rose-300 rounded-[4px] text-xs flex items-start gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#E2E8F0] mb-1.5 uppercase tracking-wider">
                Admin Email
              </label>
              <input
                type="email"
                required
                placeholder="ssdofficial0001@gmail.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0B1325] border border-[#2A3454] rounded-[4px] text-xs text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#E2E8F0] mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0B1325] border border-[#2A3454] rounded-[4px] text-xs text-[#FFFFFF] focus:border-[#D4AF37] focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full px-4 py-3 rounded-[4px] bg-[#D4AF37] hover:bg-[#e5c158] text-[#0C2340] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all shadow-md"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#0C2340]" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 stroke-[2]" />
                  <span>Sign In to Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-[#2A3454] flex justify-between items-center text-[11px] text-[#94A3B8]">
            <button
              type="button"
              onClick={onBackToWebsite}
              className="hover:text-[#D4AF37] cursor-pointer inline-flex items-center gap-1 font-bold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Website
            </button>
            <span>Secure Authentication</span>
          </div>
        </div>
      </div>
    );
  }

  // Loading initial auth state
  if (isAdminAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0B1325] text-[#E2E8F0] flex items-center justify-center font-montserrat">
        <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
      </div>
    );
  }

  // Filtered Properties List
  const filteredProperties = properties.filter((p) => {
    if (!showArchived && p.isArchived) return false;
    if (showArchived && !p.isArchived) return false;

    if (filterType !== 'all' && p.listingType !== filterType) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchLoc = p.location.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      if (!matchName && !matchLoc && !matchDesc) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#0B1325] text-[#E2E8F0] flex flex-col selection:bg-[#D4AF37]/30 font-montserrat">
      {/* Feedback Toast */}
      {feedbackMessage && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-[4px] border shadow-2xl flex items-center gap-3 text-xs max-w-sm animate-in slide-in-from-top-3 ${
            feedbackMessage.type === 'success'
              ? 'bg-[#1C2541] border-emerald-500 text-emerald-300'
              : 'bg-[#1C2541] border-rose-500 text-rose-300'
          }`}
        >
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span className="flex-1 font-semibold">{feedbackMessage.text}</span>
          <button onClick={() => setFeedbackMessage(null)} className="text-[#94A3B8] hover:text-[#FFFFFF] cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Admin Top Navigation */}
      <header className="sticky top-0 z-40 bg-[#0A0F1D]/95 backdrop-blur-md border-b border-[rgba(212,175,55,0.15)] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBackToWebsite}
              className="p-1.5 text-[#CBD5E1] hover:text-[#D4AF37] transition-colors rounded-[4px] cursor-pointer"
              title="Return to Public Site"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2]" />
            </button>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] block truncate">
                Admin Dashboard
              </span>
              <h1 className="text-sm sm:text-base font-bold text-[#FFFFFF] truncate font-cinzel">
                SHREE SAI DEVELOPERS &bull; Inventory
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {adminUser && (
              <span className="hidden md:inline text-[11px] text-[#CBD5E1] px-2.5 py-1 bg-[#1C2541] border border-[#2A3454] rounded-[4px] truncate max-w-[200px] font-medium">
                {adminUser.email}
              </span>
            )}

            {viewMode === 'list' && (
              <button
                onClick={handleOpenAdd}
                className="px-3.5 py-2 rounded-[4px] bg-[#D4AF37] hover:bg-[#e5c158] text-[#0C2340] font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Add Property</span>
                <span className="sm:hidden">Add</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="p-2 text-[#CBD5E1] hover:text-rose-400 border border-[#2A3454] hover:border-rose-400/50 bg-[#1C2541] rounded-[4px] transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        </div>
      </header>

      {/* Admin Content Area */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1">
        {/* ==========================================
            VIEW: ADD / EDIT PROPERTY FORM
           ========================================== */}
        {viewMode === 'add' || viewMode === 'edit' ? (
          <div className="max-w-3xl mx-auto card-hw bg-[#1C2541] border border-[rgba(212,175,55,0.2)] p-6 sm:p-8 rounded-[4px] shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#2A3454] pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-bold block">
                  {viewMode === 'add' ? 'New Property Entry' : 'Edit Listing Specifications'}
                </span>
                <h2 className="text-xl font-bold text-[#FFFFFF] mt-0.5 font-cinzel">
                  {viewMode === 'add' ? 'Add Property to Inventory' : `Edit: ${formName || 'Property'}`}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="text-xs text-[#CBD5E1] hover:text-[#FFFFFF] px-3 py-1.5 border border-[#2A3454] rounded-[4px] cursor-pointer hover:bg-[#0B1325] font-medium transition-colors"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmitProperty} className="space-y-5">
              {/* Field 1: Property Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#E2E8F0] mb-1.5">
                  Property Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shree Sai Apartment, Boisar Property"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0B1325] border border-[#2A3454] focus:border-[#D4AF37] rounded-[4px] text-xs text-[#FFFFFF] focus:outline-none transition-colors"
                />
              </div>

              {/* Field 2: Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#E2E8F0] mb-1.5">
                    Location / Area <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#0B1325] border border-[#2A3454] focus:border-[#D4AF37] rounded-[4px] text-xs text-[#FFFFFF] focus:outline-none transition-colors cursor-pointer"
                  >
                    {PREFERRED_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc} className="bg-[#0B1325] text-[#FFFFFF]">
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {formLocation === 'Other Location' && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#E2E8F0] mb-1.5">
                      Specify Custom Location <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Palghar West, Nalasopara East"
                      value={formCustomLocation}
                      onChange={(e) => setFormCustomLocation(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-[#0B1325] border border-[#2A3454] focus:border-[#D4AF37] rounded-[4px] text-xs text-[#FFFFFF] focus:outline-none transition-colors"
                    />
                  </div>
                )}
              </div>

              {/* Field 3: Listing Type & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#E2E8F0] mb-1.5">
                    Listing Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formListingType}
                    onChange={(e) => setFormListingType(e.target.value as ListingType)}
                    className="w-full px-3.5 py-2.5 bg-[#0B1325] border border-[#2A3454] focus:border-[#D4AF37] rounded-[4px] text-xs text-[#FFFFFF] focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="Buy" className="bg-[#0B1325] text-[#FFFFFF]">Buy (For Sale)</option>
                    <option value="Sell" className="bg-[#0B1325] text-[#FFFFFF]">Sell (Exclusive Listing)</option>
                    <option value="Rent" className="bg-[#0B1325] text-[#FFFFFF]">Rent (Lease)</option>
                    <option value="Heavy Deposit" className="bg-[#0B1325] text-[#FFFFFF]">Heavy Deposit</option>
                    <option value="Buy / Rent / Heavy Deposit" className="bg-[#0B1325] text-[#FFFFFF]">Buy / Rent / Heavy Deposit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#E2E8F0] mb-1.5">
                    Current Status <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as PropertyStatus)}
                    className="w-full px-3.5 py-2.5 bg-[#0B1325] border border-[#2A3454] focus:border-[#D4AF37] rounded-[4px] text-xs text-[#FFFFFF] focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="Available" className="bg-[#0B1325] text-[#FFFFFF]">Available (Ready for Enquiries)</option>
                    <option value="Sold" className="bg-[#0B1325] text-[#FFFFFF]">Sold</option>
                    <option value="Rented" className="bg-[#0B1325] text-[#FFFFFF]">Rented</option>
                    <option value="Unavailable" className="bg-[#0B1325] text-[#FFFFFF]">Unavailable</option>
                  </select>
                </div>
              </div>

              {/* Field 4: Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#E2E8F0] mb-1.5">
                  Property Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide verified structural specifications, location advantages, connectivity, municipal certificates, and construction details..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0B1325] border border-[#2A3454] focus:border-[#D4AF37] rounded-[4px] text-xs text-[#FFFFFF] focus:outline-none transition-colors"
                />
              </div>

              {/* Field 5: Property Photos Upload */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#E2E8F0]">
                    Property Photos ({formPhotos.length})
                  </label>
                  <span className="text-[11px] text-[#94A3B8]">Original quality retained</span>
                </div>

                {/* Upload Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#2A3454] hover:border-[#D4AF37] p-6 rounded-[4px] bg-[#0B1325] text-center cursor-pointer transition-colors"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/png,image/jpeg,image/webp,image/jpg"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  {isUploadingPhotos ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
                      <span className="text-xs text-[#D4AF37] font-bold">Uploading and processing photos...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <UploadCloud className="w-8 h-8 text-[#D4AF37]" />
                      <p className="text-xs font-bold text-[#FFFFFF]">
                        Click or drag real property photos to upload
                      </p>
                      <p className="text-[11px] text-[#94A3B8]">
                        Supports multiple PNG, JPG, or WEBP photos (up to 15MB each)
                      </p>
                    </div>
                  )}
                </div>

                {/* Photo Previews */}
                {formPhotos.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    {formPhotos.map((photo, idx) => {
                      const isCover = coverPhotoUrl === photo.url;
                      return (
                        <div
                          key={photo.id || idx}
                          className={`relative aspect-[4/3] rounded-[4px] overflow-hidden border group bg-[#0B1325] ${
                            isCover ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]' : 'border-[#2A3454]'
                          }`}
                        >
                          <img
                            src={photo.url}
                            alt={photo.title || `Photo ${idx + 1}`}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />

                          {/* Cover Badge */}
                          {isCover && (
                            <span className="absolute top-1.5 left-1.5 bg-[#D4AF37] text-[#0C2340] text-[9px] font-bold px-1.5 py-0.5 rounded-[3px] shadow-xs uppercase tracking-wider">
                              Cover
                            </span>
                          )}

                          {/* Action Overlay */}
                          <div className="absolute inset-0 bg-[#0B1325]/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                            {!isCover && (
                              <button
                                type="button"
                                onClick={() => handleSetCoverPhoto(photo.url)}
                                className="px-2 py-1 bg-[#D4AF37] text-[#0C2340] text-[10px] font-bold rounded-[3px] cursor-pointer shadow-xs"
                                title="Set as primary cover"
                              >
                                Set Cover
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(idx)}
                              className="p-1.5 bg-rose-600 text-white rounded-[3px] hover:bg-rose-700 cursor-pointer shadow-xs"
                              title="Remove photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Field 6 & 7: Featured & Published Toggles */}
              <div className="pt-3 border-t border-[#2A3454] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-3 bg-[#0B1325] border border-[#2A3454] rounded-[4px] cursor-pointer hover:border-[#D4AF37] transition-colors">
                  <input
                    type="checkbox"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#FFFFFF] block">Featured Listing</span>
                    <span className="text-[10px] text-[#94A3B8] block">Highlight in top sections</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 bg-[#0B1325] border border-[#2A3454] rounded-[4px] cursor-pointer hover:border-[#D4AF37] transition-colors">
                  <input
                    type="checkbox"
                    checked={formPublished}
                    onChange={(e) => setFormPublished(e.target.checked)}
                    className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#FFFFFF] block">Published (Live)</span>
                    <span className="text-[10px] text-[#94A3B8] block">Visible to public visitors</span>
                  </div>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#2A3454] flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="px-5 py-2.5 bg-[#0B1325] hover:bg-[#1C2541] text-[#CBD5E1] hover:text-[#FFFFFF] rounded-[4px] text-xs font-semibold border border-[#2A3454] transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving || isUploadingPhotos}
                  className="px-6 py-2.5 rounded-[4px] bg-[#D4AF37] hover:bg-[#e5c158] text-[#0C2340] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all shadow-md"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Listing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2]" />
                      <span>{viewMode === 'add' ? 'Publish Property' : 'Save Changes'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ==========================================
              VIEW: PROPERTIES LIST / INVENTORY
             ========================================== */
          <div className="space-y-6">
            {/* Filter and Control Bar */}
            <div className="card-hw bg-[#1C2541] border border-[rgba(212,175,55,0.2)] p-4 rounded-[4px] space-y-3 shadow-xl">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 stroke-[2]" />
                  <input
                    type="text"
                    placeholder="Search properties by name, location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 bg-[#0B1325] border border-[#2A3454] focus:border-[#D4AF37] rounded-[4px] text-xs text-[#FFFFFF] focus:outline-none"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#FFFFFF]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-2.5 py-1.5 bg-[#0B1325] border border-[#2A3454] focus:border-[#D4AF37] rounded-[4px] text-xs text-[#FFFFFF] focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Types</option>
                    <option value="Buy">Buy</option>
                    <option value="Sell">Sell</option>
                    <option value="Rent">Rent</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-2.5 py-1.5 bg-[#0B1325] border border-[#2A3454] focus:border-[#D4AF37] rounded-[4px] text-xs text-[#FFFFFF] focus:outline-none cursor-pointer"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Available">Available</option>
                    <option value="Sold">Sold</option>
                    <option value="Rented">Rented</option>
                    <option value="Unavailable">Unavailable</option>
                  </select>

                  <button
                    onClick={() => setShowArchived(!showArchived)}
                    className={`px-3 py-1.5 rounded-[4px] text-xs font-bold border transition-colors cursor-pointer ${
                      showArchived
                        ? 'bg-[#D4AF37] text-[#0C2340] border-[#D4AF37]'
                        : 'bg-[#0B1325] text-[#CBD5E1] border-[#2A3454] hover:text-[#FFFFFF] hover:border-[#D4AF37]'
                    }`}
                  >
                    {showArchived ? 'Viewing Archived' : 'Active Listings'}
                  </button>

                  <button
                    onClick={loadInventory}
                    disabled={loadingProperties}
                    className="p-2 bg-[#0B1325] border border-[#2A3454] hover:border-[#D4AF37] text-[#CBD5E1] hover:text-[#D4AF37] rounded-[4px] transition-colors cursor-pointer"
                    title="Refresh Inventory"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingProperties ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Inventory List */}
            {loadingProperties ? (
              <div className="py-20 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto" />
                <p className="text-xs text-[#CBD5E1]">Loading inventory database...</p>
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="py-16 text-center space-y-4 card-hw bg-[#1C2541] border border-[rgba(212,175,55,0.2)] p-8 rounded-[4px] shadow-xl">
                <Building2 className="w-10 h-10 text-[#94A3B8] mx-auto stroke-[1.5]" />
                <h3 className="text-base font-bold text-[#FFFFFF] font-cinzel">No properties found</h3>
                <p className="text-xs text-[#CBD5E1] max-w-sm mx-auto">
                  {showArchived
                    ? 'There are no archived properties currently.'
                    : searchTerm || filterType !== 'all' || filterStatus !== 'all'
                    ? 'Try clearing your search filters to view listings.'
                    : 'Click "Add Property" above to create your first new listing.'}
                </p>
                {!showArchived && (
                  <button
                    onClick={handleOpenAdd}
                    className="px-4 py-2 rounded-[4px] bg-[#D4AF37] hover:bg-[#e5c158] text-[#0C2340] font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Property</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProperties.map((prop) => {
                  return (
                    <div
                      key={prop.id}
                      className="card-hw bg-[#1C2541] border border-[rgba(212,175,55,0.15)] hover:border-[rgba(212,175,55,0.4)] rounded-[4px] overflow-hidden flex flex-col transition-colors group shadow-xl"
                    >
                      {/* Card Cover Photo */}
                      <div className="relative aspect-[16/10] bg-[#0A0F1D] overflow-hidden">
                        <img
                          src={prop.coverImage || '/3.png'}
                          alt={prop.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                        />

                        {/* Top Badges */}
                        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] shadow-xs border ${
                              prop.published
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                                : 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/40'
                            }`}
                          >
                            {prop.published ? 'Live' : 'Draft'}
                          </span>
                          {prop.featured && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] bg-[#0B1325]/90 text-[#D4AF37] border border-[rgba(212,175,55,0.4)] shadow-xs">
                              Featured
                            </span>
                          )}
                          {prop.isArchived && (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[4px] bg-[#0B1325]/90 text-slate-300 border border-slate-600 shadow-xs">
                              Archived
                            </span>
                          )}
                        </div>

                        {/* Status Badge */}
                        <div className="absolute bottom-2.5 right-2.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-[4px] bg-[#0B1325]/90 text-[#CBD5E1] border border-[#2A3454] shadow-xs">
                            {prop.status}
                          </span>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-center justify-between text-[11px] text-[#D4AF37] mb-1">
                            <span className="font-bold uppercase tracking-wider">For {prop.listingType}</span>
                            <span className="text-[#94A3B8]">{prop.images?.length || 1} Photo(s)</span>
                          </div>
                          <h3 className="text-base font-bold text-[#FFFFFF] tracking-tight line-clamp-1 font-cinzel">
                            {prop.name}
                          </h3>
                          <p className="text-xs text-[#CBD5E1] mt-0.5 line-clamp-1">{prop.location}</p>
                          <p className="text-xs text-[#94A3B8] mt-2 line-clamp-2 leading-relaxed">
                            {prop.description}
                          </p>
                        </div>

                        {/* Quick Controls Bar */}
                        <div className="pt-3 border-t border-[#2A3454] space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            {/* Live View link */}
                            <button
                              type="button"
                              onClick={() => onViewPropertyDetail(prop.id)}
                              className="inline-flex items-center gap-1 text-[11px] text-[#D4AF37] hover:text-[#e5c158] transition-colors cursor-pointer font-bold uppercase tracking-wider"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View Detail Page</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>

                            {/* Toggles */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleToggleFeatured(prop)}
                                className={`p-1.5 rounded-[4px] transition-colors cursor-pointer ${
                                  prop.featured
                                    ? 'text-[#D4AF37] hover:text-[#FFFFFF]'
                                    : 'text-[#94A3B8] hover:text-[#FFFFFF]'
                                }`}
                                title={prop.featured ? 'Unmark featured' : 'Mark as featured'}
                              >
                                <Star className={`w-3.5 h-3.5 ${prop.featured ? 'fill-current' : ''}`} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleTogglePublish(prop)}
                                className={`p-1.5 rounded-[4px] transition-colors cursor-pointer ${
                                  prop.published
                                    ? 'text-emerald-400 hover:text-emerald-300'
                                    : 'text-[#94A3B8] hover:text-[#FFFFFF]'
                                }`}
                                title={prop.published ? 'Unpublish (make draft)' : 'Publish (make live)'}
                              >
                                {prop.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          {/* Primary Edit / Archive / Delete Action Row */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(prop)}
                              className="flex-1 py-1.5 px-3 bg-[#0B1325] hover:bg-[#1C2541] text-[#E2E8F0] border border-[#2A3454] rounded-[4px] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer uppercase tracking-wider"
                            >
                              <Edit3 className="w-3 h-3 text-[#D4AF37]" />
                              <span>Edit</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleArchive(prop)}
                              className="p-1.5 text-[#CBD5E1] hover:text-[#D4AF37] border border-[#2A3454] hover:border-[#D4AF37] rounded-[4px] transition-colors cursor-pointer bg-[#0B1325]"
                              title={prop.isArchived ? 'Restore property' : 'Archive property safely'}
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenDeleteConfirm(prop)}
                              className="p-1.5 text-[#CBD5E1] hover:text-rose-400 border border-[#2A3454] hover:border-rose-400 rounded-[4px] transition-colors cursor-pointer bg-[#0B1325]"
                              title="Delete listing"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            PERMANENT DELETE CONFIRMATION DIALOG (Works in iframe without blocking window.confirm)
           ========================================== */}
        {deleteConfirmTarget && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs font-montserrat animate-in fade-in duration-150"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
          >
            <div className="bg-[#1C2541] border border-[rgba(212,175,55,0.3)] rounded-[4px] p-6 max-w-md w-full shadow-2xl space-y-5">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-[4px] bg-rose-950/70 border border-rose-500/40 text-rose-400 shrink-0">
                  <Trash2 className="w-5 h-5 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <h3
                    id="delete-dialog-title"
                    className="text-base sm:text-lg font-bold text-[#FFFFFF] font-cinzel"
                  >
                    Permanently Delete Property
                  </h3>
                  <p className="text-xs text-[#CBD5E1] mt-2 leading-relaxed">
                    Are you sure you want to permanently delete{' '}
                    <strong className="text-[#FFFFFF]">&ldquo;{deleteConfirmTarget.name}&rdquo;</strong>?
                  </p>
                  <p className="text-[11px] text-rose-300/90 mt-1.5 font-medium">
                    This will permanently remove the record from the database. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2A3454]">
                <button
                  type="button"
                  disabled={isDeletingRecord}
                  onClick={() => setDeleteConfirmTarget(null)}
                  className="px-4 py-2 bg-[#0B1325] hover:bg-[#2A3454] text-[#CBD5E1] hover:text-[#FFFFFF] border border-[#2A3454] rounded-[4px] text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingRecord}
                  onClick={handleExecuteDelete}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-[4px] text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  {isDeletingRecord ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting from Database...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5 stroke-[2]" />
                      <span>Permanently Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;

