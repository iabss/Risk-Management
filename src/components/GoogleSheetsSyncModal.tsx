import { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  LogOut,
  Sparkles,
  Link,
  Save,
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  googleSignIn,
  googleSignOut,
} from '../services/googleAuth';
import {
  getSavedSpreadsheetId,
  getSavedSpreadsheetUrl,
  saveSpreadsheetInfo,
  syncAllRisksToSpreadsheet,
  createRiskSpreadsheet,
  getSyncedRiskIds,
  SheetSyncResult,
} from '../services/googleSheetsService';
import { RiskItem } from '../types/risk';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  accessToken: string | null;
  onAuthSuccess: (user: User, token: string) => void;
  onAuthLogout: () => void;
  risks: RiskItem[];
  onSyncComplete?: (result: SheetSyncResult) => void;
}

export const GoogleSheetsSyncModal = ({
  isOpen,
  onClose,
  currentUser,
  accessToken,
  onAuthSuccess,
  onAuthLogout,
  risks,
  onSyncComplete,
}: GoogleSheetsSyncModalProps) => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [syncResult, setSyncResult] = useState<SheetSyncResult | null>(null);
  const [manualSheetId, setManualSheetId] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentSheetId = getSavedSpreadsheetId();
  const currentSheetUrl = getSavedSpreadsheetUrl();
  const syncedIds = getSyncedRiskIds();
  const pendingCount = risks.filter((r) => !syncedIds.has(r.id)).length;
  const syncedCount = risks.length - pendingCount;

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      const res = await googleSignIn();
      if (res) {
        onAuthSuccess(res.user, res.accessToken);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal masuk dengan akun Google.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await googleSignOut();
      onAuthLogout();
      setSyncResult(null);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal keluar akun.');
    }
  };

  const handleCreateNewSheet = async () => {
    if (!accessToken) return;
    setIsCreatingSheet(true);
    setErrorMessage(null);
    try {
      const created = await createRiskSpreadsheet(accessToken);
      // Immediately sync all data to new sheet
      const result = await syncAllRisksToSpreadsheet(risks, accessToken, created.id);
      setSyncResult(result);
      if (onSyncComplete) onSyncComplete(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal membuat Google Sheet baru.');
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const handleSyncAll = async () => {
    if (!accessToken) {
      setErrorMessage('Silakan hubungkan akun Google terlebih dahulu.');
      return;
    }
    setIsSyncing(true);
    setErrorMessage(null);
    try {
      const result = await syncAllRisksToSpreadsheet(risks, accessToken);
      setSyncResult(result);
      if (onSyncComplete) onSyncComplete(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal sinkronisasi ke Google Sheet.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveManualSheetId = () => {
    if (!manualSheetId.trim()) return;
    const cleanId = manualSheetId.trim();
    saveSpreadsheetInfo(cleanId, `https://docs.google.com/spreadsheets/d/${cleanId}/edit`);
    setShowManualInput(false);
    setManualSheetId('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#121216] rounded-sm shadow-2xl border border-white/15 my-6 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#0F0F12] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-sm bg-emerald-950/40 border border-emerald-800/60 text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 text-[9px] uppercase font-mono font-bold tracking-widest bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 rounded-sm">
                  AUTO BACKUP & SINKRONISASI
                </span>
                <span className="text-[10px] text-white/40 font-mono hidden sm:inline-block">
                  Google Sheets Realtime
                </span>
              </div>
              <h3 className="text-lg font-serif text-white mt-1">
                Integrasi Backup Google Spreadsheet
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-sm text-white/40 hover:text-white hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5 text-xs text-white/80 overflow-y-auto max-h-[75vh]">
          {errorMessage && (
            <div className="p-3 rounded-sm bg-red-950/50 border border-red-800/80 text-red-200 flex items-start space-x-2 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* User Account Status */}
          <div className="p-4 rounded-sm bg-[#16161C] border border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block mb-1">
                  Status Akun Google:
                </span>
                {currentUser ? (
                  <div className="flex items-center space-x-2.5">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName || 'User'}
                        className="w-8 h-8 rounded-full border border-emerald-500/50"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-emerald-900/60 text-emerald-300 border border-emerald-700 flex items-center justify-center font-bold">
                        {currentUser.displayName?.charAt(0) || 'G'}
                      </div>
                    )}
                    <div>
                      <p className="text-white font-medium text-xs">
                        {currentUser.displayName || 'Akun Google Terhubung'}
                      </p>
                      <p className="text-white/50 text-[11px] font-mono">{currentUser.email}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-white/60">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Belum terhubung ke Akun Google. Masuk untuk mengaktifkan backup otomatis.</span>
                  </div>
                )}
              </div>

              {/* Login / Logout Button */}
              {currentUser ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="px-3 py-1.5 rounded-sm bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/10 transition flex items-center space-x-1.5 self-start sm:self-auto"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar Akun</span>
                </button>
              ) : (
                /* Google Material Button */
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={isSigningIn}
                  className="flex items-center justify-center space-x-2 px-4 py-2 rounded-sm bg-white text-gray-900 hover:bg-gray-100 font-medium text-xs transition shadow-md disabled:opacity-50"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isSigningIn ? 'Menghubungkan...' : 'Sign in with Google'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Sync Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-[#0F0F12] border border-white/5 rounded-sm">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/40 block">
                Total Data Risiko
              </span>
              <p className="text-xl font-bold text-white mt-1">{risks.length} Data</p>
              <span className="text-[10px] text-white/40">Di database dashboard</span>
            </div>

            <div className="p-3 bg-[#0F0F12] border border-white/5 rounded-sm">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 block">
                Tersinkron ke Sheets
              </span>
              <p className="text-xl font-bold text-emerald-400 mt-1">{syncedCount} Data</p>
              <span className="text-[10px] text-white/40">Telah aman ter-backup</span>
            </div>

            <div className="p-3 bg-[#0F0F12] border border-white/5 rounded-sm">
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block">
                Belum Masuk / Pending
              </span>
              <p className="text-xl font-bold text-amber-400 mt-1">{pendingCount} Data</p>
              <span className="text-[10px] text-white/40">Perlu refresh / sync</span>
            </div>
          </div>

          {/* Auto Backup Info Callout */}
          <div className="p-3.5 rounded-sm bg-blue-950/30 border border-blue-900/50 flex items-start space-x-2.5">
            <Sparkles className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-white font-medium text-xs">
                Otomatis Backup Saat Input Risiko Baru
              </p>
              <p className="text-[11px] text-white/70 leading-relaxed">
                Ketika akun Google terhubung, setiap pengguna yang menginput risiko baru di form akan{' '}
                <strong>langsung ditambahkan otomatis ke baris spreadsheet backup</strong>. Jika koneksi sempat tertunda atau terdapat perubahan offline, cukup tekan tombol <strong>Refresh &amp; Sinkronisasi</strong> di bawah.
              </p>
            </div>
          </div>

          {/* Connected Spreadsheet Details */}
          <div className="p-4 rounded-sm bg-[#16161C] border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-white/50">
                Target Google Spreadsheet:
              </span>
              <button
                type="button"
                onClick={() => setShowManualInput(!showManualInput)}
                className="text-[10px] font-mono text-blue-400 hover:underline flex items-center space-x-1"
              >
                <Link className="w-3 h-3" />
                <span>{showManualInput ? 'Batal Ganti ID' : 'Ganti / Hubungkan ID Lain'}</span>
              </button>
            </div>

            {showManualInput ? (
              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="text"
                  placeholder="Masukkan Spreadsheet ID (misal: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms)"
                  value={manualSheetId}
                  onChange={(e) => setManualSheetId(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-[#0F0F12] border border-white/15 rounded-sm text-xs text-white focus:outline-hidden focus:border-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleSaveManualSheetId}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-sm text-xs font-medium transition flex items-center space-x-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan</span>
                </button>
              </div>
            ) : currentSheetId ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-sm bg-[#0E0E12] border border-white/5 font-mono text-[11px]">
                <div className="truncate">
                  <span className="text-white/40 block text-[9px] uppercase">ID SPREADSHEET:</span>
                  <span className="text-emerald-400 font-bold truncate block">{currentSheetId}</span>
                </div>
                {currentSheetUrl && (
                  <a
                    href={currentSheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-sm bg-white/5 hover:bg-white/10 text-blue-300 hover:text-white border border-white/10 transition flex items-center space-x-1 shrink-0 self-start sm:self-auto"
                  >
                    <span>Buka Spreadsheet</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}
              </div>
            ) : (
              <div className="p-3 bg-[#0E0E12] border border-white/5 rounded-sm text-center">
                <p className="text-white/60 text-xs">
                  Belum ada spreadsheet terhubung. Klik tombol di bawah untuk membuat spreadsheet backup baru secara otomatis di Google Drive Anda.
                </p>
                <button
                  type="button"
                  onClick={handleCreateNewSheet}
                  disabled={!accessToken || isCreatingSheet}
                  className="mt-2.5 px-3 py-1.5 rounded-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs transition disabled:opacity-50 inline-flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isCreatingSheet ? 'Membuat Spreadsheet...' : 'Buat Spreadsheet Backup Baru'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Sync Result Toast */}
          {syncResult && (
            <div
              className={`p-3 rounded-sm border flex items-start space-x-2 text-xs ${
                syncResult.success
                  ? 'bg-emerald-950/50 border-emerald-800/80 text-emerald-200'
                  : 'bg-red-950/50 border-red-800/80 text-red-200'
              }`}
            >
              {syncResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="font-medium">{syncResult.message}</p>
                {syncResult.spreadsheetUrl && (
                  <a
                    href={syncResult.spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center text-blue-300 hover:underline text-[11px]"
                  >
                    <span>Lihat di Google Sheets</span>
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 sm:p-4 bg-[#0F0F12] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-white/50 text-[11px] flex items-center space-x-1.5 self-start sm:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Koneksi aman dengan Google Workspace OAuth 2.0</span>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-sm bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition font-medium"
            >
              Tutup
            </button>

            <button
              type="button"
              onClick={handleSyncAll}
              disabled={!accessToken || isSyncing}
              className="px-4 py-2 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center space-x-2 shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>
                {isSyncing
                  ? 'Menyinkronkan...'
                  : pendingCount > 0
                  ? `Refresh & Sinkronisasi (${pendingCount} Pending)`
                  : 'Refresh & Sinkronisasi Semua'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
