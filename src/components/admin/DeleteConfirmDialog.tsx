import React from 'react';
import { AlertTriangle, Trash2, Loader2, X } from 'lucide-react';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  title?: string;
  itemName: string;
  itemType?: string;
  isDeleting: boolean;
  errorMessage?: string | null;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  isOpen,
  title = 'Confirm Permanent Deletion',
  itemName,
  itemType = 'record',
  isDeleting,
  errorMessage,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150 font-montserrat">
      <div
        className="w-full max-w-md bg-[#1C2541] border border-rose-500/40 rounded-[6px] shadow-2xl overflow-hidden p-6 space-y-5"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <AlertTriangle className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
                Database Action
              </span>
              <h3 id="delete-dialog-title" className="text-base font-bold text-[#FFFFFF] font-cinzel">
                {title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="p-1 text-[#94A3B8] hover:text-[#FFFFFF] hover:bg-[#0B1325] rounded transition-colors cursor-pointer disabled:opacity-50"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 text-xs leading-relaxed text-[#CBD5E1]">
          <p>
            Are you sure you want to permanently delete this {itemType} from the database?
          </p>

          <div className="p-3 bg-[#0B1325] border border-[#2A3454] rounded-[4px] space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Target {itemType.toUpperCase()}:
            </p>
            <p className="text-sm font-bold text-[#FFFFFF] truncate font-cinzel">
              {itemName}
            </p>
          </div>

          <p className="text-rose-300/90 text-[11px] font-medium flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            This action will permanently erase the database record and cannot be undone.
          </p>

          {errorMessage && (
            <div className="p-2.5 bg-rose-950/80 border border-rose-500/50 text-rose-300 rounded text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#2A3454]">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 bg-[#0B1325] hover:bg-[#2A3454] text-[#CBD5E1] border border-[#2A3454] rounded-[4px] text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-[4px] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer transition-colors shadow-md disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Deleting Record...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
