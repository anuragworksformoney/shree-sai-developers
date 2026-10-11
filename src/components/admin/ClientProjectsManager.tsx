import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  RefreshCw,
  Edit3,
  Trash2,
  ExternalLink,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Loader2,
  Filter,
} from 'lucide-react';
import { ClientProject, ClientProjectStatus } from '../../types';
import {
  createClientProject,
  updateClientProject,
  updateClientProjectStatus,
  deleteClientProject,
} from '../../services/clientProjectService';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

const PROJECT_TYPES = [
  'Residential Development',
  'Commercial Property',
  'Plotting & Land Advisory',
  'Interior Fit-Out',
  'Construction & Civil',
  'Property Advisory',
  'Consulting & Documentation',
  'Other',
];

const STATUS_OPTIONS: ClientProjectStatus[] = [
  'Planning',
  'In Progress',
  'Under Review',
  'On Hold',
  'Completed',
];

interface ClientProjectsManagerProps {
  projects: ClientProject[];
  loading: boolean;
  onRefresh: () => Promise<void>;
  onShowFeedback: (type: 'success' | 'error', text: string) => void;
  onProjectsChange: (projects: ClientProject[]) => void;
}

export const ClientProjectsManager: React.FC<ClientProjectsManagerProps> = ({
  projects,
  loading,
  onRefresh,
  onShowFeedback,
  onProjectsChange,
}) => {
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ClientProjectStatus>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Form Fields
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('Residential Development');
  const [customType, setCustomType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [expectedCompletionDate, setExpectedCompletionDate] = useState('');
  const [status, setStatus] = useState<ClientProjectStatus>('Planning');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Permanent Delete Modal State
  const [projectToDelete, setProjectToDelete] = useState<ClientProject | null>(null);
  const [isDeletingProject, setIsDeletingProject] = useState(false);
  const [projectDeleteError, setProjectDeleteError] = useState<string | null>(null);

  // Quick Status Updating ID
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Open Add Modal
  const handleOpenAdd = () => {
    setModalMode('add');
    setEditingProjectId(null);
    setClientName('');
    setProjectName('');
    setProjectType('Residential Development');
    setCustomType('');
    setStartDate('');
    setExpectedCompletionDate('');
    setStatus('Planning');
    setUrl('');
    setNotes('');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (project: ClientProject) => {
    setModalMode('edit');
    setEditingProjectId(project.id);
    setClientName(project.clientName);
    setProjectName(project.projectName);

    if (PROJECT_TYPES.includes(project.projectType)) {
      setProjectType(project.projectType);
      setCustomType('');
    } else {
      setProjectType('Other');
      setCustomType(project.projectType);
    }

    setStartDate(project.startDate || '');
    setExpectedCompletionDate(project.expectedCompletionDate || '');
    setStatus(project.status);
    setUrl(project.url || '');
    setNotes(project.notes || '');
    setIsModalOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName.trim()) {
      onShowFeedback('error', 'Client Name is required.');
      return;
    }
    if (!projectName.trim()) {
      onShowFeedback('error', 'Project Name is required.');
      return;
    }

    const finalType = projectType === 'Other' ? customType.trim() || 'Other' : projectType;

    const payload = {
      clientName: clientName.trim(),
      projectName: projectName.trim(),
      projectType: finalType,
      startDate,
      expectedCompletionDate,
      status,
      url: url.trim(),
      notes: notes.trim(),
    };

    setIsSaving(true);
    try {
      if (modalMode === 'add') {
        const created = await createClientProject(payload);
        onProjectsChange([created, ...projects]);
        onShowFeedback('success', `Project "${created.projectName}" created successfully.`);
      } else if (modalMode === 'edit' && editingProjectId) {
        const updated = await updateClientProject(editingProjectId, payload);
        onProjectsChange(projects.map((p) => (p.id === editingProjectId ? updated : p)));
        onShowFeedback('success', `Project "${updated.projectName}" updated successfully.`);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      onShowFeedback('error', err.message || 'Failed to save project.');
    } finally {
      setIsSaving(false);
    }
  };

  // Quick Status Update
  const handleStatusChange = async (projectId: string, newStatus: ClientProjectStatus) => {
    setUpdatingStatusId(projectId);
    try {
      const updated = await updateClientProjectStatus(projectId, newStatus);
      onProjectsChange(projects.map((p) => (p.id === projectId ? updated : p)));
      onShowFeedback('success', `Status updated to "${newStatus}".`);
    } catch (err: any) {
      onShowFeedback('error', err.message || 'Failed to update project status.');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Delete Project Handlers
  const handleOpenDelete = (project: ClientProject) => {
    setProjectToDelete(project);
    setProjectDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setIsDeletingProject(true);
    setProjectDeleteError(null);

    try {
      await deleteClientProject(projectToDelete.id);
      // Wait for backend success and refetch UI from real database
      await onRefresh();
      onShowFeedback('success', `Project "${projectToDelete.projectName}" was permanently deleted from the database.`);
      setProjectToDelete(null);
    } catch (err: any) {
      const errMsg = err.message || 'Failed to delete project from database.';
      setProjectDeleteError(errMsg);
      onShowFeedback('error', errMsg);
      // Project remains visible in UI on failure
    } finally {
      setIsDeletingProject(false);
    }
  };

  // Status Badge Styling Helper
  const getStatusBadge = (s: ClientProjectStatus) => {
    switch (s) {
      case 'Planning':
        return 'bg-sky-500/15 text-sky-300 border-sky-500/30';
      case 'In Progress':
        return 'bg-[#D4AF37]/15 text-[#D4AF37] border-[#D4AF37]/35';
      case 'Under Review':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'On Hold':
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
      case 'Completed':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/35';
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  // Filtered Projects
  const filteredProjects = projects.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (typeFilter !== 'all' && p.projectType !== typeFilter) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchClient = p.clientName.toLowerCase().includes(q);
      const matchProject = p.projectName.toLowerCase().includes(q);
      const matchType = p.projectType.toLowerCase().includes(q);
      const matchNotes = p.notes ? p.notes.toLowerCase().includes(q) : false;
      if (!matchClient && !matchProject && !matchType && !matchNotes) return false;
    }

    return true;
  });

  // Metrics
  const totalCount = projects.length;
  const inProgressCount = projects.filter((p) => p.status === 'In Progress').length;
  const planningCount = projects.filter((p) => p.status === 'Planning').length;
  const completedCount = projects.filter((p) => p.status === 'Completed').length;

  return (
    <div className="space-y-6 font-montserrat">
      {/* Top Section Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2A3454] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-bold">
              SHREE SAI DEVELOPERS &bull; PROJECT MANAGEMENT
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#FFFFFF] mt-0.5 font-cinzel">
            Client Projects
          </h2>
          <p className="text-xs text-[#CBD5E1] mt-0.5">
            Internal project module for tracking client milestones, timelines, and status.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-[4px] bg-[#D4AF37] hover:bg-[#e5c158] text-[#0C2340] font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="card-hw bg-[#1C2541] border border-[rgba(212,175,55,0.15)] p-4 rounded-[4px]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">Total Projects</p>
          <p className="text-xl sm:text-2xl font-bold text-[#FFFFFF] mt-1 font-cinzel">{totalCount}</p>
        </div>

        <div className="card-hw bg-[#1C2541] border border-[rgba(212,175,55,0.15)] p-4 rounded-[4px]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37]">In Progress</p>
          <p className="text-xl sm:text-2xl font-bold text-[#D4AF37] mt-1 font-cinzel">{inProgressCount}</p>
        </div>

        <div className="card-hw bg-[#1C2541] border border-[rgba(212,175,55,0.15)] p-4 rounded-[4px]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Planning</p>
          <p className="text-xl sm:text-2xl font-bold text-sky-400 mt-1 font-cinzel">{planningCount}</p>
        </div>

        <div className="card-hw bg-[#1C2541] border border-[rgba(212,175,55,0.15)] p-4 rounded-[4px]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Completed</p>
          <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1 font-cinzel">{completedCount}</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="card-hw bg-[#1C2541] border border-[rgba(212,175,55,0.15)] p-4 rounded-[4px] space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by client, project name, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 bg-[#0B1325] border border-[#2A3454] focus:border-[#D4AF37] rounded-[4px] text-xs text-[#FFFFFF] focus:outline-none transition-colors"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-2 bg-[#0B1325] border border-[#2A3454] focus:border-[#D4AF37] rounded-[4px] text-xs text-[#FFFFFF] focus:outline-none cursor-pointer"
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-2 bg-[#0B1325] border border-[#2A3454] focus:border-[#D4AF37] rounded-[4px] text-xs text-[#FFFFFF] focus:outline-none cursor-pointer"
            >
              <option value="all">All Project Types</option>
              {PROJECT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
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
              title="Refresh Projects"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Display */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin mx-auto" />
          <p className="text-xs text-[#CBD5E1]">Loading client projects...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="py-16 text-center space-y-4 card-hw bg-[#1C2541] border border-[rgba(212,175,55,0.2)] p-8 rounded-[4px] shadow-xl">
          <Briefcase className="w-10 h-10 text-[#94A3B8] mx-auto stroke-[1.5]" />
          <h3 className="text-base font-bold text-[#FFFFFF] font-cinzel">No Client Projects Found</h3>
          <p className="text-xs text-[#CBD5E1] max-w-sm mx-auto">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'No projects match your current filters. Try resetting search criteria.'
              : 'Create internal client projects to track milestones, dates, and progress for Shree Sai Developers clients.'}
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-[4px] bg-[#D4AF37] hover:bg-[#e5c158] text-[#0C2340] font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Client Project</span>
          </button>
        </div>
      ) : (
        <div className="card-hw bg-[#1C2541] border border-[rgba(212,175,55,0.15)] rounded-[4px] overflow-hidden shadow-xl">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#2A3454] bg-[#0A0F1D]/80 text-[11px] font-bold text-[#D4AF37] uppercase tracking-wider font-cinzel">
                  <th className="py-3.5 px-4">Client Name</th>
                  <th className="py-3.5 px-4">Project Name</th>
                  <th className="py-3.5 px-4">Project Type</th>
                  <th className="py-3.5 px-4">Timeline</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Link / Notes</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A3454] text-xs">
                {filteredProjects.map((project) => (
                  <tr key={project.id} className="hover:bg-[#0B1325]/50 transition-colors">
                    {/* Client Name */}
                    <td className="py-3.5 px-4 font-semibold text-[#FFFFFF]">
                      {project.clientName}
                    </td>

                    {/* Project Name */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#E2E8F0] block font-cinzel">
                        {project.projectName}
                      </span>
                    </td>

                    {/* Project Type */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-[3px] bg-[#0B1325] border border-[#2A3454] text-[11px] text-[#CBD5E1]">
                        {project.projectType}
                      </span>
                    </td>

                    {/* Timeline */}
                    <td className="py-3.5 px-4 text-[11px] text-[#94A3B8]">
                      {project.startDate || project.expectedCompletionDate ? (
                        <div className="space-y-0.5">
                          {project.startDate && <div>Start: {project.startDate}</div>}
                          {project.expectedCompletionDate && (
                            <div className="text-[#CBD5E1]">Due: {project.expectedCompletionDate}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[#64748B]">Dates not set</span>
                      )}
                    </td>

                    {/* Status with Quick Select */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5">
                        <select
                          value={project.status}
                          disabled={updatingStatusId === project.id}
                          onChange={(e) => handleStatusChange(project.id, e.target.value as ClientProjectStatus)}
                          className={`px-2 py-1 rounded-[4px] border text-[11px] font-bold uppercase tracking-wider cursor-pointer focus:outline-none transition-colors ${getStatusBadge(
                            project.status
                          )}`}
                        >
                          {STATUS_OPTIONS.map((st) => (
                            <option key={st} value={st} className="bg-[#0B1325] text-[#FFFFFF]">
                              {st}
                            </option>
                          ))}
                        </select>
                        {updatingStatusId === project.id && (
                          <Loader2 className="w-3 h-3 text-[#D4AF37] animate-spin" />
                        )}
                      </div>
                    </td>

                    {/* Link & Notes */}
                    <td className="py-3.5 px-4 text-xs">
                      <div className="space-y-1 max-w-xs">
                        {project.url && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-[#D4AF37] hover:underline"
                          >
                            <span>Open URL</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                        {project.notes && (
                          <p className="text-[11px] text-[#94A3B8] line-clamp-1" title={project.notes}>
                            {project.notes}
                          </p>
                        )}
                        {!project.url && !project.notes && (
                          <span className="text-[#64748B] text-[11px]">—</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(project)}
                          className="p-1.5 text-[#CBD5E1] hover:text-[#D4AF37] border border-[#2A3454] hover:border-[#D4AF37] rounded-[4px] transition-colors cursor-pointer bg-[#0B1325]"
                          title="Edit Project"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(project)}
                          className="p-1.5 text-[#CBD5E1] hover:text-rose-400 border border-[#2A3454] hover:border-rose-400 rounded-[4px] transition-colors cursor-pointer bg-[#0B1325]"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile & Tablet Card View */}
          <div className="block lg:hidden divide-y divide-[#2A3454]">
            {filteredProjects.map((project) => (
              <div key={project.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider block">
                      Client: {project.clientName}
                    </span>
                    <h4 className="text-base font-bold text-[#FFFFFF] font-cinzel mt-0.5">
                      {project.projectName}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(project)}
                      className="p-1.5 text-[#CBD5E1] hover:text-[#D4AF37] border border-[#2A3454] rounded-[4px] cursor-pointer bg-[#0B1325]"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenDelete(project)}
                      className="p-1.5 text-[#CBD5E1] hover:text-rose-400 border border-[#2A3454] rounded-[4px] cursor-pointer bg-[#0B1325]"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded-[3px] bg-[#0B1325] border border-[#2A3454] text-[11px] text-[#CBD5E1]">
                    {project.projectType}
                  </span>

                  <select
                    value={project.status}
                    onChange={(e) => handleStatusChange(project.id, e.target.value as ClientProjectStatus)}
                    className={`px-2 py-0.5 rounded-[3px] border text-[11px] font-bold uppercase tracking-wider cursor-pointer ${getStatusBadge(
                      project.status
                    )}`}
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st} className="bg-[#0B1325] text-[#FFFFFF]">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                {(project.startDate || project.expectedCompletionDate) && (
                  <div className="text-[11px] text-[#94A3B8] flex items-center gap-3">
                    {project.startDate && <span>Start: {project.startDate}</span>}
                    {project.expectedCompletionDate && (
                      <span className="text-[#CBD5E1]">Due: {project.expectedCompletionDate}</span>
                    )}
                  </div>
                )}

                {project.notes && (
                  <p className="text-xs text-[#CBD5E1] bg-[#0B1325] p-2.5 rounded-[4px] border border-[#2A3454] leading-relaxed">
                    {project.notes}
                  </p>
                )}

                {project.url && (
                  <div>
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#D4AF37] hover:underline"
                    >
                      <span>Project Link / Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==========================================
          ADD / EDIT PROJECT MODAL
         ========================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050811]/85 backdrop-blur-xs animate-in fade-in">
          <div className="max-w-xl w-full card-hw bg-[#1C2541] border border-[rgba(212,175,55,0.25)] rounded-[4px] shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#2A3454] pb-3.5">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#D4AF37] block">
                  SHREE SAI DEVELOPERS &bull; INTERNAL PROJECT
                </span>
                <h3 className="text-lg font-bold text-[#FFFFFF] font-cinzel mt-0.5">
                  {modalMode === 'add' ? 'Add Client Project' : 'Edit Client Project'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#94A3B8] hover:text-[#FFFFFF] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Client Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#E2E8F0] mb-1.5">
                  Client Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Sharma, Radiant Housing, Evershine Group"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B1325] border border-[#2A3454] focus:border-[#D4AF37] rounded-[4px] text-xs text-[#FFFFFF] focus:outline-none transition-colors"
                />
              </div>

              {/* Project Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#E2E8F0] mb-1.5">
                  Project Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sai Enclave Wing B, Vasai Commercial Hub"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B1325] border border-[#2A3454] focus:border-[#D4AF37] rounded-[4px] text-xs text-[#FFFFFF] focus:outline-none transition-colors"
                />
              </div>

              {/* Project Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#E2E8F0] mb-1.5">
                    Project Type
                  </label>
                  <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B1325] border border-[#2A3454] focus:border-[#D4AF37] rounded-[4px] text-xs text-[#FFFFFF] focus:outline-none transition-colors cursor-pointer"
                  >
                    {PROJECT_TYPES.map((t) => (
                      <option key={t} value={t} className="bg-[#0B1325] text-[#FFFFFF]">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#E2E8F0] mb-1.5">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ClientProjectStatus)}
                    className="w-full px-3 py-2 bg-[#0B1325] border border-[#2A3454] focus:border-[#D4AF37] rounded-[4px] text-xs text-[#FFFFFF] focus:outline-none transition-colors cursor-pointer"
                  >
                    {STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st} className="bg-[#0B1325] text-[#FFFFFF]">
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {projectType === 'Other' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#E2E8F0] mb-1.5">
                    Specify Custom Project Type
                  </label>
                  <input
                    type="text"
                    placeholder="Enter custom project classification"
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B1325] border border-[#2A3454] focus:border-[#D4AF37] rounded-[4px] text-xs text-[#FFFFFF] focus:outline-none transition-colors"
                  />
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#E2E8F0] mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B1325] border border-[#2A3454] focus:border-[#D4AF37] rounded-[4px] text-xs text-[#FFFFFF] focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#E2E8F0] mb-1.5">
                    Expected Completion Date
                  </label>
                  <input
                    type="date"
                    value={expectedCompletionDate}
                    onChange={(e) => setExpectedCompletionDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B1325] border border-[#2A3454] focus:border-[#D4AF37] rounded-[4px] text-xs text-[#FFFFFF] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#E2E8F0] mb-1.5">
                  Project / Reference URL <span className="text-[#94A3B8] font-normal normal-case">(optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... or project link"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B1325] border border-[#2A3454] focus:border-[#D4AF37] rounded-[4px] text-xs text-[#FFFFFF] focus:outline-none transition-colors"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#E2E8F0] mb-1.5">
                  Internal Notes &amp; Remarks <span className="text-[#94A3B8] font-normal normal-case">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Milestone details, payment status, customer preferences, or site coordination notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B1325] border border-[#2A3454] focus:border-[#D4AF37] rounded-[4px] text-xs text-[#FFFFFF] focus:outline-none transition-colors"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2A3454]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-[#CBD5E1] hover:text-[#FFFFFF] border border-[#2A3454] hover:bg-[#0B1325] rounded-[4px] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider bg-[#D4AF37] hover:bg-[#e5c158] text-[#0C2340] rounded-[4px] inline-flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{modalMode === 'add' ? 'Create Project' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Database Permanent Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={Boolean(projectToDelete)}
        title="Delete Project from Database"
        itemName={projectToDelete ? `${projectToDelete.projectName} (${projectToDelete.clientName})` : ''}
        itemType="client project"
        isDeleting={isDeletingProject}
        errorMessage={projectDeleteError}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeletingProject) {
            setProjectToDelete(null);
            setProjectDeleteError(null);
          }
        }}
      />
    </div>
  );
};
