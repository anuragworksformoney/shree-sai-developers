import React, { useState } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { WhatsAppIcon } from '../WhatsAppIcon';
import { FollowupRecord, FollowupStatus } from '../../types';
import {
  createFollowup,
  updateFollowup,
  updateFollowupStatus,
  deleteFollowup,
} from '../../services/followupService';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

const STATUS_LIST: FollowupStatus[] = [
  'New',
  'In Contact',
  'Site Visit Scheduled',
  'Converted',
  'Closed',
];

interface FollowupsManagerProps {
  followups: FollowupRecord[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  onShowFeedback: (type: 'success' | 'error', text: string) => void;
  onFollowupsChange: (followups: FollowupRecord[]) => void;
}

export const FollowupsManager: React.FC<FollowupsManagerProps> = ({
  followups,
  loading,
  onRefresh,
  onShowFeedback,
  onFollowupsChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | FollowupStatus>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Manual Add Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formReq, setFormReq] = useState('Buy');
  const [formLoc, setFormLoc] = useState('Vasai');
  const [formPropType, setFormPropType] = useState('Residential');
  const [formBhk, setFormBhk] = useState('');
  const [formBudget, setFormBudget] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Permanent Delete Modal State
  const [recordToDelete, setRecordToDelete] = useState<FollowupRecord | null>(null);
  const [isDeletingRecord, setIsDeletingRecord] = useState(false);
  const [recordDeleteError, setRecordDeleteError] = useState<string | null>(null);

  // Status Badge Class
  const getStatusBadge = (s: FollowupStatus) => {
    switch (s) {
      case 'New':
        return 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/35';
      case 'In Contact':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'Site Visit Scheduled':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'Converted':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35';
      case 'Closed':
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  // Quick Status Update
  const handleStatusChange = async (id: string, newStatus: FollowupStatus) => {
    setUpdatingId(id);
    try {
      const updated = await updateFollowupStatus(id, newStatus);
      onFollowupsChange(followups.map((f) => (f.id === id ? updated : f)));
      onShowFeedback('success', `Status updated to "${newStatus}".`);
    } catch (err: any) {
      onShowFeedback('error', err.message || 'Failed to update follow-up status.');
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete Handlers
  const handleOpenDelete = (record: FollowupRecord) => {
    setRecordToDelete(record);
    setRecordDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!recordToDelete) return;
    setIsDeletingRecord(true);
    setRecordDeleteError(null);

    try {
      await deleteFollowup(recordToDelete.id);
      // Re-fetch from actual database to verify deletion
      await onRefresh();
      onShowFeedback('success', `Follow-up for "${recordToDelete.name}" was permanently deleted from the database.`);
      setRecordToDelete(null);
    } catch (err: any) {
      const errMsg = err.message || 'Failed to delete follow-up record from database.';
      setRecordDeleteError(errMsg);
      onShowFeedback('error', errMsg);
      // Record remains visible in UI on failure
    } finally {
      setIsDeletingRecord(false);
    }
  };

  // Manual Add Form Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      onShowFeedback('error', 'Client Name is required.');
      return;
    }
    if (!formPhone.trim()) {
      onShowFeedback('error', 'Phone Number is required.');
      return;
    }

    setIsSaving(true);
    try {
      const created = await createFollowup({
        name: formName.trim(),
        phone: formPhone.trim(),
        email: formEmail.trim(),
        requirement: formReq,
        location: formLoc,
        propertyType: formPropType,
        bhk: formBhk.trim(),
        budget: formBudget.trim(),
        message: formMessage.trim(),
        source: 'Admin Manual Entry',
        status: 'New',
      });
      onFollowupsChange([created, ...followups]);
      onShowFeedback('success', `Follow-up for "${created.name}" created successfully.`);
      setIsAddModalOpen(false);
      setFormName('');
      setFormPhone('');
      setFormEmail('');
      setFormBhk('');
      setFormBudget('');
      setFormMessage('');
    } catch (err: any) {
      onShowFeedback('error', err.message || 'Failed to create follow-up.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered Records
  const filtered = followups.filter((f) => {
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = f.name?.toLowerCase().includes(q);
      const matchPhone = f.phone?.toLowerCase().includes(q);
      const matchEmail = f.email?.toLowerCase().includes(q);
      const matchLoc = f.location?.toLowerCase().includes(q);
      const matchReq = f.requirement?.toLowerCase().includes(q);
      const matchMsg = f.message?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail && !matchLoc && !matchReq && !matchMsg) return false;
    }
    return true;
  });

  const totalCount = followups.length;
  const newCount = followups.filter((f) => f.status === 'New').length;
  const inContactCount = followups.filter((f) => f.status === 'In Contact').length;
  const visitCount = followups.filter((f) => f.status === 'Site Visit Scheduled').length;
  const convertedCount = followups.filter((f) => f.status === 'Converted').length;

  return (
    <div className="space-y-6 font-montserrat">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3454] pb-5">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-bold">
            SHREE SAI DEVELOPERS &bull; ENQUIRIES &amp; LEADS
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#FFFFFF] mt-0.5 font-cinzel">
            Client Follow-ups
          </h2>
          <p className="text-xs text-[#CBD5E1] mt-0.5">
            Manage buyer, seller, and rental inquiries, site visit requests, and lead follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-[4px] bg-[#D4AF37] hover:bg-[#e5c158] text-[#0C2340] font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Follow-up</span>
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="card-hw bg-[#1C2541] border border-[rgba(212,175,55,0.15)] p-3.5 rounded-[4px]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Total Leads</p>
          <p className="text-xl font-bold text-[#FFFFFF] mt-1 font-cinzel">{totalCount}</p>
        </div>

        <div className="card-hw bg-[#1C2541] border border-[rgba(212,175,55,0.15)] p-3.5 rounded-[4px]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">New</p>
          <p className="text-xl font-bold text-[#D4AF37] mt-1 font-cinzel">{newCount}</p>
        </div>

        <div className="card-hw bg-[#1C2541] border border-[rgba(212,175,55,0.15)] p-3.5 rounded-[4px]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-sky-400">In Contact</p>
          <p className="text-xl font-bold text-sky-400 mt-1 font-cinzel">{inContactCount}</p>
        </div>

        <div className="card-hw bg-[#1C2541] border border-[rgba(212,175,55,0.15)] p-3.5 rounded-[4px]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Site Visit</p>
          <p className="text-xl font-bold text-purple-400 mt-1 font-cinzel">{visitCount}</p>
        </div>

        <div className="card-hw bg-[#1C2541] border border-[rgba(212,175,55,0.15)] p-3.5 rounded-[4px]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Converted</p>
          <p className="text-xl font-bold text-emerald-400 mt-1 font-cinzel">{convertedCount}</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="card-hw bg-[#1C2541] border border-[rgba(212,175,55,0.15)] p-4 rounded-[4px]">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by client name, phone, email, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-[#0B1325] border border-[#2A3454] focus:border-[#D4AF37] rounded-[4px] text-xs text-[#FFFFFF] focus:outline-none transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-2 bg-[#0B1325] border border-[#2A3454] focus:border-[#D4AF37] rounded-[4px] text-xs text-[#FFFFFF] focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              {STATUS_LIST.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {(searchTerm || statusFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="px-2.5 py-2 bg-[#0B1325] border border-[#2A3454] hover:border-[#D4AF37] text-xs text-[#CBD5E1] rounded-[4px] cursor-pointer transition-colors"
              >
                Clear
              </button>
            )}

            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="p-2 bg-[#0B1325] border border-[#2A3454] hover:border-[#D4AF37] text-[#CBD5E1] hover:text-[#D4AF37] rounded-[4px] transition-colors cursor-pointer"
              title="Refresh Follow-ups"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto" />
          <p className="text-xs text-[#CBD5E1]">Loading follow-up records from database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center space-y-4 card-hw bg-[#1C2541] border border-[rgba(212,175,55,0.2)] p-8 rounded-[4px] shadow-xl">
          <Users className="w-10 h-10 text-[#94A3B8] mx-auto stroke-[1.5]" />
          <h3 className="text-base font-bold text-[#FFFFFF] font-cinzel">No Follow-ups Found</h3>
          <p className="text-xs text-[#CBD5E1] max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'all'
              ? 'No records match your filters. Try resetting search criteria.'
              : 'Enquiries submitted through the website will appear here for follow-up and site visit coordination.'}
          </p>
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-[4px] bg-[#D4AF37] hover:bg-[#e5c158] text-[#0C2340] font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Record Follow-up</span>
          </button>
        </div>
      ) : (
        <div className="card-hw bg-[#1C2541] border border-[rgba(212,175,55,0.15)] rounded-[4px] overflow-hidden shadow-xl">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2A3454] bg-[#0A0F1D]/80 text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider font-cinzel">
                  <th className="py-3.5 px-4">Client Contact</th>
                  <th className="py-3.5 px-4">Requirement</th>
                  <th className="py-3.5 px-4">Location / Area</th>
                  <th className="py-3.5 px-4">Budget / Config</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Message / Notes</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3454] text-xs">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#0B1325]/50 transition-colors">
                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-[#FFFFFF] block">{item.name}</span>
                        {item.phone && (
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${item.phone}`}
                              className="text-[#D4AF37] hover:underline inline-flex items-center gap-1 text-[11px]"
                              title="Call Client"
                            >
                              <Phone className="w-2.5 h-2.5" />
                              <span>{item.phone}</span>
                            </a>
                            <a
                              href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#25D366] hover:text-[#20ba59] inline-flex items-center gap-1 text-[11px] font-semibold"
                              title="Chat on WhatsApp"
                            >
                              <WhatsAppIcon className="w-2.5 h-2.5 fill-[#25D366]" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        )}
                        {item.email && (
                          <div className="text-[#94A3B8] text-[11px] flex items-center gap-1">
                            <Mail className="w-2.5 h-2.5" />
                            <span>{item.email}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Requirement */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-[3px] bg-[#0B1325] border border-[#2A3454] text-[11px] text-[#CBD5E1] font-semibold uppercase tracking-wider">
                        {item.requirement}
                      </span>
                      <span className="text-[10px] text-[#94A3B8] block mt-1">
                        Source: {item.source || 'Website'}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 text-[#CBD5E1]">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#D4AF37] shrink-0" />
                        <span>{item.location || 'Mumbai & MMR'}</span>
                      </div>
                    </td>

                    {/* Budget & Config */}
                    <td className="py-3.5 px-4 text-[11px] text-[#CBD5E1]">
                      <div>{item.budget ? `Budget: ${item.budget}` : 'Flexible'}</div>
                      {item.bhk && <div className="text-[#94A3B8]">{item.bhk} BHK</div>}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5">
                        <select
                          value={item.status}
                          disabled={updatingId === item.id}
                          onChange={(e) => handleStatusChange(item.id, e.target.value as FollowupStatus)}
                          className={`px-2 py-1 rounded-[4px] border text-[11px] font-bold uppercase tracking-wider cursor-pointer focus:outline-none transition-colors ${getStatusBadge(
                            item.status
                          )}`}
                        >
                          {STATUS_LIST.map((st) => (
                            <option key={st} value={st} className="bg-[#0B1325] text-[#FFFFFF]">
                              {st}
                            </option>
                          ))}
                        </select>
                        {updatingId === item.id && (
                          <Loader2 className="w-3 h-3 text-[#D4AF37] animate-spin" />
                        )}
                      </div>
                    </td>

                    {/* Message */}
                    <td className="py-3.5 px-4 text-xs max-w-xs">
                      <p className="text-[11px] text-[#94A3B8] line-clamp-2" title={item.message}>
                        {item.message || '—'}
                      </p>
                      <span className="text-[10px] text-[#64748B] block mt-1">
                        {new Date(item.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenDelete(item)}
                        className="p-1.5 text-[#CBD5E1] hover:text-rose-400 border border-[#2A3454] hover:border-rose-400 rounded-[4px] transition-colors cursor-pointer bg-[#0B1325]"
                        title="Permanently Delete Follow-up Record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="block lg:hidden divide-y divide-[#2A3454]">
            {filtered.map((item) => (
              <div key={item.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="font-bold text-[#FFFFFF] text-sm block">{item.name}</span>
                    <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider block mt-0.5">
                      {item.requirement} &bull; {item.location}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenDelete(item)}
                    className="p-1.5 text-[#CBD5E1] hover:text-rose-400 border border-[#2A3454] rounded-[4px] cursor-pointer bg-[#0B1325]"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs">
                  {item.phone && (
                    <div className="flex items-center gap-2.5">
                      <a href={`tel:${item.phone}`} className="text-[#D4AF37] font-semibold flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{item.phone}</span>
                      </a>
                      <a
                        href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#25D366] font-semibold flex items-center gap-1 hover:text-[#20ba59]"
                        title="Chat on WhatsApp"
                      >
                        <WhatsAppIcon className="w-3 h-3 fill-[#25D366]" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  )}
                  {item.email && (
                    <span className="text-[#CBD5E1] flex items-center gap-1 text-[11px]">
                      <Mail className="w-3 h-3" />
                      <span>{item.email}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item.id, e.target.value as FollowupStatus)}
                    className={`px-2 py-0.5 rounded-[3px] border text-[11px] font-bold uppercase tracking-wider cursor-pointer ${getStatusBadge(
                      item.status
                    )}`}
                  >
                    {STATUS_LIST.map((st) => (
                      <option key={st} value={st} className="bg-[#0B1325] text-[#FFFFFF]">
                        {st}
                      </option>
                    ))}
                  </select>

                  <span className="text-[10px] text-[#64748B]">
                    {new Date(item.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </span>
                </div>

                {item.message && (
                  <p className="text-xs text-[#CBD5E1] bg-[#0B1325] p-2.5 rounded-[4px] border border-[#2A3454] leading-relaxed">
                    {item.message}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050811]/85 backdrop-blur-xs animate-in fade-in">
          <div className="max-w-md w-full card-hw bg-[#1C2541] border border-[rgba(212,175,55,0.25)] rounded-[4px] shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#2A3454] pb-3">
              <h3 className="text-base font-bold text-[#FFFFFF] font-cinzel">Record Client Follow-up</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[#94A3B8] hover:text-[#FFFFFF]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#E2E8F0] mb-1 uppercase tracking-wider">Client Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B1325] border border-[#2A3454] rounded-[4px] text-[#FFFFFF] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#E2E8F0] mb-1 uppercase tracking-wider">Phone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B1325] border border-[#2A3454] rounded-[4px] text-[#FFFFFF] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#E2E8F0] mb-1 uppercase tracking-wider">Requirement</label>
                  <select
                    value={formReq}
                    onChange={(e) => setFormReq(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B1325] border border-[#2A3454] rounded-[4px] text-[#FFFFFF] focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Buy">Buy</option>
                    <option value="Sell">Sell</option>
                    <option value="Rent">Rent</option>
                    <option value="Site Visit">Site Visit</option>
                    <option value="General Enquiry">General Enquiry</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#E2E8F0] mb-1 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  placeholder="client@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B1325] border border-[#2A3454] rounded-[4px] text-[#FFFFFF] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-[#E2E8F0] mb-1 uppercase tracking-wider">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Evershine, Vasai"
                    value={formLoc}
                    onChange={(e) => setFormLoc(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B1325] border border-[#2A3454] rounded-[4px] text-[#FFFFFF] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#E2E8F0] mb-1 uppercase tracking-wider">Budget</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹45 - 60 Lakhs"
                    value={formBudget}
                    onChange={(e) => setFormBudget(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B1325] border border-[#2A3454] rounded-[4px] text-[#FFFFFF] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#E2E8F0] mb-1 uppercase tracking-wider">Notes / Message</label>
                <textarea
                  rows={2}
                  placeholder="Client requirements, schedule, or notes..."
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B1325] border border-[#2A3454] rounded-[4px] text-[#FFFFFF] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2A3454]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-[4px] border border-[#2A3454] text-[#CBD5E1]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 rounded-[4px] bg-[#D4AF37] text-[#0C2340] font-bold uppercase tracking-wider flex items-center gap-1"
                >
                  {isSaving && <Loader2 className="w-3 h-3 animate-spin" />}
                  <span>Save Record</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Database Permanent Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={Boolean(recordToDelete)}
        title="Delete Follow-up from Database"
        itemName={recordToDelete ? `${recordToDelete.name} (${recordToDelete.phone || recordToDelete.requirement})` : ''}
        itemType="follow-up record"
        isDeleting={isDeletingRecord}
        errorMessage={recordDeleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeletingRecord) {
            setRecordToDelete(null);
            setRecordDeleteError(null);
          }
        }}
      />
    </div>
  );
};
