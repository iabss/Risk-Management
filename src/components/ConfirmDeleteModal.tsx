import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemDetails?: {
    code?: string;
    title?: string;
    category?: string;
    department?: string;
    count?: number;
  };
  confirmButtonText?: string;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemDetails,
  confirmButtonText = 'Ya, Hapus Sekarang',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#16161A] rounded-sm shadow-2xl border border-white/10 overflow-hidden my-auto">
        {/* Header */}
        <div className="p-4 border-b border-white/5 bg-[#0F0F12] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-sm bg-red-950/40 border border-red-900/50 text-red-400">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <h3 className="text-base font-serif text-white">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-sm text-white/40 hover:text-white hover:bg-white/5 transition"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-white/70 leading-relaxed">{message}</p>

          {itemDetails && (
            <div className="p-3 bg-[#0F0F12] border border-white/5 rounded-sm space-y-1.5 text-xs">
              {itemDetails.count !== undefined && itemDetails.count > 0 && (
                <div className="flex items-center justify-between text-white/50 font-mono text-[11px]">
                  <span>Jumlah Data:</span>
                  <span className="font-bold text-red-400">
                    {itemDetails.count} Profil Risiko
                  </span>
                </div>
              )}
              {itemDetails.code && (
                <div className="flex items-center space-x-2">
                  <span className="px-1.5 py-0.5 rounded-sm font-mono text-[10px] font-bold bg-white/5 text-white/80 border border-white/10">
                    {itemDetails.code}
                  </span>
                  {itemDetails.category && (
                    <span className="text-[10px] uppercase font-mono tracking-wider text-white/40">
                      {itemDetails.category}
                    </span>
                  )}
                </div>
              )}
              {itemDetails.title && (
                <p className="font-medium text-white line-clamp-2">
                  {itemDetails.title}
                </p>
              )}
              {itemDetails.department && (
                <p className="text-[11px] text-white/40 font-mono">
                  Departemen: {itemDetails.department}
                </p>
              )}
            </div>
          )}

          <div className="p-2.5 bg-red-950/20 border border-red-900/30 rounded-sm">
            <p className="text-[11px] font-mono text-red-300/80">
              ⚠️ Perhatian: Data profil risiko, penilaian probabilitas & dampak, serta daftar rencana tindakan mitigasi terkait akan dihapus secara permanen.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-[#0F0F12] flex items-center justify-end space-x-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-[#1F1F24] hover:bg-[#282830] text-white/80 hover:text-white rounded-sm border border-white/10 transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-xs font-medium bg-red-600 hover:bg-red-500 text-white rounded-sm border border-red-500/50 flex items-center space-x-1.5 transition active:scale-95 shadow-sm"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{confirmButtonText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
