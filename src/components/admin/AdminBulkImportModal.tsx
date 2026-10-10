import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  X, 
  FileSpreadsheet, 
  Loader2, 
  Users, 
  GraduationCap, 
  FileText,
  Key,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Filter,
  Check,
  ChevronLeft,
  ChevronRight,
  Link2,
  Save,
  RefreshCw
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { adminApi } from '../../api/client';
import { useAppStore } from '../../store/useAppStore';

interface AdminBulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface PreviewRow {
  row_number: number;
  data: Record<string, any>;
  action?: 'create' | 'update' | 'unchanged';
  status: 'valid' | 'warning' | 'error';
  errors: string[];
}

interface ImportSummary {
  imported: number;
  updated?: number;
  skipped: number;
  errors: Array<{ row_number: number; data: Record<string, any>; reason: string }>;
  credentials: Array<{
    name: string;
    email: string;
    identifier: string;
    role: string;
    temporaryPassword: string;
    department: string;
  }>;
  message: string;
}

export const AdminBulkImportModal: React.FC<AdminBulkImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { syncWithBackend } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Tab: 'student' | 'faculty'
  const [activeTab, setActiveTab] = useState<'student' | 'faculty'>('student');

  // Stored URLs per tab
  const [studentSheetUrl, setStudentSheetUrl] = useState('');
  const [facultySheetUrl, setFacultySheetUrl] = useState('');
  const [isSavingUrl, setIsSavingUrl] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSyncingAndApplying, setIsSyncingAndApplying] = useState(false);

  // Upload & File State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sheetUrl, setSheetUrl] = useState('');
  const [isFetchingUrl, setIsFetchingUrl] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

  // Preview & Validation State
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [previewStats, setPreviewStats] = useState<{
    total: number;
    valid: number;
    warning: number;
    error: number;
  }>({ total: 0, valid: 0, warning: 0, error: 0 });

  // Filter in preview table
  const [previewFilter, setPreviewFilter] = useState<'all' | 'valid' | 'invalid'>('all');
  const [previewPage, setPreviewPage] = useState(1);
  const rowsPerPage = 10;

  // General error banner
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Post-import summary state
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);

  // Preload saved Google Sheet URLs from institutional configs
  useEffect(() => {
    if (isOpen) {
      loadSavedConfigs();
    }
  }, [isOpen]);

  const loadSavedConfigs = async () => {
    try {
      const res = await adminApi.getSheetConfigs();
      if (res?.student?.url) {
        setStudentSheetUrl(res.student.url);
        if (activeTab === 'student') setSheetUrl(res.student.url);
      }
      if (res?.faculty?.url) {
        setFacultySheetUrl(res.faculty.url);
        if (activeTab === 'faculty') setSheetUrl(res.faculty.url);
      }
    } catch (err) {
      console.warn('Notice: Sheet configs check did not load:', err);
    }
  };

  if (!isOpen) return null;

  // Handle Tab Switch (reset file selection and restore tab-specific URL)
  const handleTabChange = (tab: 'student' | 'faculty') => {
    setActiveTab(tab);
    resetUpload();
    setSheetUrl(tab === 'student' ? studentSheetUrl : facultySheetUrl);
  };

  // Reset file and preview
  const resetUpload = () => {
    setSelectedFile(null);
    setIsFetchingUrl(false);
    setPreviewRows([]);
    setPreviewHeaders([]);
    setPreviewStats({ total: 0, valid: 0, warning: 0, error: 0 });
    setErrorMessage(null);
    setImportSummary(null);
    setPreviewPage(1);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Save Google Sheet URL to institutional config
  const handleSaveUrl = async () => {
    if (!sheetUrl.trim()) return;
    setIsSavingUrl(true);
    setErrorMessage(null);
    try {
      await adminApi.saveSheetConfig({
        sheet_type: activeTab,
        url: sheetUrl.trim(),
        sync_interval_minutes: 0,
        auto_apply: false,
      });
      if (activeTab === 'student') setStudentSheetUrl(sheetUrl.trim());
      else setFacultySheetUrl(sheetUrl.trim());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || err.message || 'Failed to save Google Sheet URL.');
    } finally {
      setIsSavingUrl(false);
    }
  };

  // Fetch from Google Sheet or Web CSV link
  const handleFetchFromUrl = async () => {
    if (!sheetUrl.trim()) {
      setErrorMessage('Please enter a Google Sheet or CSV link.');
      return;
    }

    setIsFetchingUrl(true);
    setErrorMessage(null);
    setImportSummary(null);

    try {
      const response = await adminApi.syncSheet(activeTab, sheetUrl.trim());
      setPreviewRows(response.preview_rows || []);
      setPreviewHeaders(
        response.preview_rows && response.preview_rows[0]?.data
          ? Object.keys(response.preview_rows[0].data)
          : []
      );
      setPreviewStats({
        total: response.total_rows || 0,
        valid: response.valid_rows_count || 0,
        warning: response.warning_rows_count || 0,
        error: response.error_rows_count || 0,
      });
      setSelectedFile(new File([], `Google Sheet (${activeTab.toUpperCase()})`));
      setPreviewPage(1);
    } catch (err: any) {
      console.error('Failed to sync via link:', err);
      let detail = err.response?.data?.detail || err.message || 'Failed to fetch from Google Sheet URL.';
      if (detail === 'Network Error') {
        detail = 'Connection error: Unable to reach Google Sheet. Please publish it via File > Share > Publish to web > CSV, or upload the Excel file directly above.';
      }
      setErrorMessage(typeof detail === 'string' ? detail : JSON.stringify(detail));
      setSelectedFile(null);
    } finally {
      setIsFetchingUrl(false);
    }
  };

  // Direct Sync & Apply from Google Sheet
  const handleSyncAndApply = async () => {
    if (!sheetUrl.trim()) {
      setErrorMessage('Please enter a Google Sheet URL.');
      return;
    }
    setIsSyncingAndApplying(true);
    setErrorMessage(null);
    setImportSummary(null);

    try {
      // Auto-save the config first
      try {
        await adminApi.saveSheetConfig({
          sheet_type: activeTab,
          url: sheetUrl.trim(),
          sync_interval_minutes: 0,
          auto_apply: false,
        });
        if (activeTab === 'student') setStudentSheetUrl(sheetUrl.trim());
        else setFacultySheetUrl(sheetUrl.trim());
      } catch (e) {
        // Silently continue with sync
      }

      const response = await adminApi.syncSheet(activeTab, sheetUrl.trim());
      const validRows = (response.preview_rows || []).filter(
        (r: any) => r.status === 'valid' || r.status === 'warning'
      );
      if (validRows.length === 0) {
        setErrorMessage('No valid records found in the Google Sheet to import.');
        setPreviewRows(response.preview_rows || []);
        setSelectedFile(new File([], `Google Sheet (${activeTab.toUpperCase()})`));
        return;
      }

      // Automatically confirm and apply rows
      const confirmRes = await adminApi.confirmImport({
        import_type: activeTab,
        rows: response.preview_rows,
      });
      setImportSummary(confirmRes);
      setSelectedFile(new File([], `Google Sheet (${activeTab.toUpperCase()})`));
      await syncWithBackend();
      onSuccess();
    } catch (err: any) {
      console.error('Sync & Apply error:', err);
      let detail = err.response?.data?.detail || err.message || 'Failed to sync & apply from Google Sheet.';
      setErrorMessage(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setIsSyncingAndApplying(false);
    }
  };

  // Download official pre-formatted Excel template
  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    try {
      await adminApi.downloadImportTemplate(activeTab);
    } catch (err: any) {
      console.error('Failed to download template:', err);
      setErrorMessage('Could not download Excel template. Please try again.');
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  // Process uploaded file and fetch server-side preview validation
  const processFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setErrorMessage('Please upload a valid spreadsheet file (.xlsx, .xls, or .csv)');
      return;
    }

    setSelectedFile(file);
    setIsParsing(true);
    setErrorMessage(null);
    setImportSummary(null);

    try {
      const response = await adminApi.previewImport(file, activeTab);
      setPreviewRows(response.preview_rows || []);
      setPreviewHeaders(response.headers || []);
      setPreviewStats({
        total: response.total_rows || 0,
        valid: response.valid_rows_count || 0,
        warning: response.warning_rows_count || 0,
        error: response.error_rows_count || 0,
      });
      setPreviewPage(1);
    } catch (err: any) {
      console.error('Failed to preview file:', err);
      const detail = err.response?.data?.detail || 'Failed to parse Excel file. Ensure you use the official template.';
      setErrorMessage(typeof detail === 'string' ? detail : JSON.stringify(detail));
      setSelectedFile(null);
    } finally {
      setIsParsing(false);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Filtered rows for preview table
  const filteredPreviewRows = previewRows.filter((row) => {
    if (previewFilter === 'valid') return row.status === 'valid';
    if (previewFilter === 'invalid') return row.status === 'error' || row.status === 'warning';
    return true;
  });

  const paginatedRows = filteredPreviewRows.slice(
    (previewPage - 1) * rowsPerPage,
    previewPage * rowsPerPage
  );
  const totalPages = Math.ceil(filteredPreviewRows.length / rowsPerPage) || 1;

  // Confirm Import: Import valid & warning (auto-provisioning) rows!
  const handleConfirmImport = async () => {
    if (previewStats.valid + previewStats.warning === 0) {
      setErrorMessage('There are no valid rows to import. Please resolve the errors in your spreadsheet.');
      return;
    }

    setIsImporting(true);
    setErrorMessage(null);

    try {
      const response = await adminApi.confirmImport({
        import_type: activeTab,
        rows: previewRows,
      });

      setImportSummary(response);
      await syncWithBackend();
      onSuccess();
    } catch (err: any) {
      console.error('Failed to confirm import:', err);
      const detail = err.response?.data?.detail || 'Import failed. Please try again.';
      setErrorMessage(typeof detail === 'string' ? detail : JSON.stringify(detail));
    } finally {
      setIsImporting(false);
    }
  };

  // Download Error Report as Excel file
  const handleDownloadErrorReport = () => {
    const errorRows = previewRows.filter((r) => r.status === 'error' || r.status === 'warning');
    if (errorRows.length === 0) return;

    const exportData = errorRows.map((r) => ({
      'Row Number': r.row_number,
      'Status': r.status.toUpperCase(),
      'Errors / Warnings': r.errors.join('; '),
      ...r.data,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Validation Errors');
    XLSX.writeFile(workbook, `${activeTab}_import_errors.xlsx`);
  };

  // Download Generated Credentials as Excel file
  const handleDownloadCredentials = () => {
    if (!importSummary || !importSummary.credentials || importSummary.credentials.length === 0) return;

    const credsData = importSummary.credentials.map((c) => ({
      'Full Name': c.name,
      'Login Email': c.email,
      'Identifier': c.identifier,
      'Role': c.role.toUpperCase(),
      'Department': c.department,
      'Temporary Password': c.temporaryPassword,
      'First Login Status': 'Password Reset Required',
    }));

    const worksheet = XLSX.utils.json_to_sheet(credsData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'User Credentials');
    XLSX.writeFile(workbook, `${activeTab}_generated_credentials.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-3xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Excel Bulk Import</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  Admin Portal
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Upload student rosters or faculty directories to bulk create accounts & profiles automatically.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Tabs: Student vs Faculty */}
        <div className="px-6 pt-4 border-b border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
            <button
              onClick={() => handleTabChange('student')}
              className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'student'
                  ? 'bg-white text-amber-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap size={15} />
              <span>Import Students</span>
            </button>

            <button
              onClick={() => handleTabChange('faculty')}
              className={`px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'faculty'
                  ? 'bg-white text-amber-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users size={15} />
              <span>Import Faculty</span>
            </button>
          </div>

          {/* Download Template Button */}
          <button
            onClick={handleDownloadTemplate}
            disabled={isDownloadingTemplate}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 transition flex items-center gap-2 cursor-pointer shadow-2xs"
          >
            {isDownloadingTemplate ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            <span>Download {activeTab === 'student' ? 'Student' : 'Faculty'} Template (.xlsx)</span>
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-3">
              <AlertCircle size={18} className="shrink-0 text-rose-600 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold block">Import Validation Notice:</span>
                <p className="leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Post-Import Summary Banner */}
          {importSummary && (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-3xl space-y-3 animate-in fade-in">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">
                      Bulk Import Successfully Completed!
                    </h4>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      {importSummary.message}
                    </p>
                  </div>
                </div>

                {importSummary.credentials.length > 0 && (
                  <button
                    onClick={handleDownloadCredentials}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition flex items-center gap-2 cursor-pointer"
                  >
                    <Key size={14} />
                    <span>Download Generated Credentials (.xlsx)</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                <div className="p-2.5 bg-white/80 rounded-xl border border-emerald-100">
                  <span className="text-slate-500 block text-[11px]">Newly Created</span>
                  <span className="text-base font-bold text-emerald-700">{importSummary.imported}</span>
                </div>
                <div className="p-2.5 bg-white/80 rounded-xl border border-emerald-100">
                  <span className="text-slate-500 block text-[11px]">Updated Records</span>
                  <span className="text-base font-bold text-sky-700">{importSummary.updated || 0}</span>
                </div>
                <div className="p-2.5 bg-white/80 rounded-xl border border-emerald-100">
                  <span className="text-slate-500 block text-[11px]">Skipped</span>
                  <span className="text-base font-bold text-rose-600">{importSummary.skipped}</span>
                </div>
                <div className="p-2.5 bg-white/80 rounded-xl border border-emerald-100">
                  <span className="text-slate-500 block text-[11px]">Credentials Ready</span>
                  <span className="text-base font-bold text-slate-800">{importSummary.credentials.length}</span>
                </div>
              </div>
            </div>
          )}

          {/* Upload Drop Zone (when no file is selected yet) */}
          {!selectedFile && (
            <>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center space-y-3 ${
                isDragging
                  ? 'border-amber-500 bg-amber-50/50 scale-[0.99]'
                  : 'border-slate-300 hover:border-amber-500 bg-slate-50/70 hover:bg-slate-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="w-16 h-16 rounded-3xl bg-amber-100/70 text-amber-700 flex items-center justify-center shadow-xs">
                {isParsing ? (
                  <Loader2 size={30} className="animate-spin" />
                ) : (
                  <Upload size={30} />
                )}
              </div>

              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-900">
                  {isParsing ? 'Validating Spreadsheet...' : `Upload ${activeTab === 'student' ? 'Student' : 'Faculty'} File`}
                </div>
                <p className="text-xs text-slate-500 max-w-sm">
                  Drag and drop your formatted <strong className="text-slate-700">.xlsx</strong>, <strong className="text-slate-700">.xls</strong>, or <strong className="text-slate-700">.csv</strong> file here, or click to browse.
                </p>
              </div>

              <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-400">
                <span className="px-2 py-0.5 rounded-md bg-slate-200/70 font-mono">.XLSX</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-200/70 font-mono">.XLS</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-200/70 font-mono">.CSV</span>
                <span>Auto-detects Row 3 headers &amp; Roman numerals</span>
              </div>
            </div>

            {/* OR PASTE GOOGLE SHEET LINK */}
            <div className="space-y-3">
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-white px-2">
                  OR Paste Google Sheet Link
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div className="p-4 bg-slate-50/80 border border-slate-200/90 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Link2 size={14} className="text-emerald-600" />
                    <span>{activeTab === 'student' ? 'Student Roster' : 'Faculty Directory'} Google Sheet URL</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {((activeTab === 'student' && studentSheetUrl) || (activeTab === 'faculty' && facultySheetUrl)) && (
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                        <Check size={10} />
                        <span>URL Saved</span>
                      </span>
                    )}
                    <span className="text-[10px] text-slate-500">
                      Public or Published link
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      placeholder={`Paste ${activeTab === 'student' ? 'Student Roster' : 'Faculty Directory'} Google Sheet URL (edit, share, or published link)`}
                      value={sheetUrl}
                      onChange={(e) => setSheetUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleFetchFromUrl();
                        }
                      }}
                      className="w-full pl-3.5 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-mono"
                    />
                    {sheetUrl && (
                      <button
                        type="button"
                        onClick={() => setSheetUrl('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={handleSaveUrl}
                      disabled={isSavingUrl || !sheetUrl.trim()}
                      className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-3 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-2xs"
                      title="Save URL to database configuration"
                    >
                      {isSavingUrl ? (
                        <Loader2 size={13} className="animate-spin text-emerald-600" />
                      ) : saveSuccess ? (
                        <Check size={13} className="text-emerald-600" />
                      ) : (
                        <Save size={13} className="text-slate-500" />
                      )}
                      <span>Save</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleFetchFromUrl}
                      disabled={isFetchingUrl || isSyncingAndApplying || !sheetUrl.trim()}
                      className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold px-3 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-2xs"
                      title="Fetch and preview records before applying"
                    >
                      {isFetchingUrl ? (
                        <Loader2 size={13} className="animate-spin text-emerald-600" />
                      ) : (
                        <RefreshCw size={13} className="text-slate-500" />
                      )}
                      <span>Preview</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSyncAndApply}
                      disabled={isFetchingUrl || isSyncingAndApplying || !sheetUrl.trim()}
                      className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Sync from Google Sheet and immediately import valid records"
                    >
                      {isSyncingAndApplying ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Sparkles size={13} />
                      )}
                      <span>Sync & Apply</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Tip: In Google Sheets, use <strong>File &rarr; Share &rarr; Publish to web &rarr; CSV</strong> or set link access to <em>&ldquo;Anyone with link can view&rdquo;</em> for direct syncing.
                </p>
              </div>
            </div>
            </>
          )}

          {/* Selected File & Preview Section */}
          {selectedFile && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* File Info Bar */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                    <FileSpreadsheet size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span>{selectedFile.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {previewStats.total} rows parsed from sheet
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={resetUpload}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Choose Different File
                  </button>
                </div>
              </div>

              {/* Validation Summary Stat Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 block">Total Rows</span>
                  <span className="text-lg font-bold text-slate-900">{previewStats.total}</span>
                </div>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                  <span className="text-[11px] font-semibold text-emerald-700 block flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    <span>Valid Rows</span>
                  </span>
                  <span className="text-lg font-bold text-emerald-700">{previewStats.valid}</span>
                </div>

                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200">
                  <span className="text-[11px] font-semibold text-amber-700 block flex items-center gap-1">
                    <AlertTriangle size={12} />
                    <span>Warnings</span>
                  </span>
                  <span className="text-lg font-bold text-amber-700">{previewStats.warning}</span>
                </div>

                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200">
                  <span className="text-[11px] font-semibold text-rose-700 block flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>Errors</span>
                  </span>
                  <span className="text-lg font-bold text-rose-700">{previewStats.error}</span>
                </div>
              </div>

              {/* Filter Tabs for Preview Table */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
                  <button
                    onClick={() => {
                      setPreviewFilter('all');
                      setPreviewPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                      previewFilter === 'all'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    All Rows ({previewRows.length})
                  </button>

                  <button
                    onClick={() => {
                      setPreviewFilter('valid');
                      setPreviewPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                      previewFilter === 'valid'
                        ? 'bg-white text-emerald-700 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Valid Only ({previewStats.valid})
                  </button>

                  <button
                    onClick={() => {
                      setPreviewFilter('invalid');
                      setPreviewPage(1);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
                      previewFilter === 'invalid'
                        ? 'bg-white text-rose-700 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Errors / Warnings ({previewStats.error + previewStats.warning})
                  </button>
                </div>

                {/* Download Error Report Button */}
                {(previewStats.error > 0 || previewStats.warning > 0) && (
                  <button
                    onClick={handleDownloadErrorReport}
                    className="inline-flex items-center gap-1.5 text-xs text-rose-700 hover:text-rose-800 font-bold bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Download Error Report ({previewStats.error + previewStats.warning} rows)</span>
                  </button>
                )}
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-100/80 sticky top-0 z-10 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3 w-14 text-center">Row</th>
                        <th className="py-2.5 px-3 w-28 text-center">Status</th>
                        <th className="py-2.5 px-3">Name</th>
                        <th className="py-2.5 px-3">Email</th>
                        <th className="py-2.5 px-3">{activeTab === 'student' ? 'Roll No' : 'Employee ID'}</th>
                        <th className="py-2.5 px-3">Department</th>
                        <th className="py-2.5 px-3">{activeTab === 'student' ? 'Sem / Sec' : 'Designation'}</th>
                        <th className="py-2.5 px-3 min-w-[200px]">Validation Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white font-normal">
                      {paginatedRows.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400">
                            No rows match the selected filter.
                          </td>
                        </tr>
                      ) : (
                        paginatedRows.map((row) => {
                          const isErr = row.status === 'error';
                          const isWarn = row.status === 'warning';

                          return (
                            <tr
                              key={row.row_number}
                              className={`hover:bg-slate-50/80 transition ${
                                isErr ? 'bg-rose-50/30' : isWarn ? 'bg-amber-50/20' : ''
                              }`}
                            >
                              <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-500">
                                #{row.row_number}
                              </td>

                              <td className="py-2.5 px-3 text-center">
                                {isErr && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                    <AlertCircle size={10} />
                                    <span>Error</span>
                                  </span>
                                )}
                                {isWarn && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                    <AlertTriangle size={10} />
                                    <span>{row.action === 'update' ? 'Update' : 'Warning'}</span>
                                  </span>
                                )}
                                {row.status === 'valid' && (
                                  row.action === 'update' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                                      <CheckCircle2 size={10} />
                                      <span>Update</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                      <CheckCircle2 size={10} />
                                      <span>New</span>
                                    </span>
                                  )
                                )}
                              </td>

                              <td className="py-2.5 px-3 font-semibold text-slate-900">
                                {row.data.full_name || <span className="text-rose-400 italic">Empty</span>}
                              </td>

                              <td className="py-2.5 px-3 text-slate-600 font-mono text-[11px]">
                                {row.data.email || <span className="text-rose-400 italic">Empty</span>}
                              </td>

                              <td className="py-2.5 px-3 font-mono text-[11px] text-slate-800 font-bold">
                                {activeTab === 'student' ? row.data.roll_number : row.data.employee_id}
                              </td>

                              <td className="py-2.5 px-3 text-slate-700">
                                {row.data.department || <span className="text-rose-400 italic">Empty</span>}
                              </td>

                              <td className="py-2.5 px-3 text-slate-600">
                                {activeTab === 'student'
                                  ? `${row.data.semester || '5'} / ${row.data.section || 'A'}`
                                  : row.data.designation || 'Faculty'}
                              </td>

                              <td className="py-2.5 px-3">
                                {row.errors.length > 0 ? (
                                  <ul className="space-y-0.5 text-[11px]">
                                    {row.errors.map((err, i) => (
                                      <li
                                        key={i}
                                        className={`flex items-start gap-1 ${
                                          isErr ? 'text-rose-600' : 'text-amber-700'
                                        }`}
                                      >
                                        <span className="font-bold">•</span>
                                        <span>{err}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium">
                                    <Check size={12} />
                                    <span>Ready to import</span>
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination footer */}
                {totalPages > 1 && (
                  <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                    <div>
                      Showing {(previewPage - 1) * rowsPerPage + 1} to{' '}
                      {Math.min(previewPage * rowsPerPage, filteredPreviewRows.length)} of{' '}
                      {filteredPreviewRows.length} rows
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                        disabled={previewPage === 1}
                        className="p-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span className="px-2 font-bold text-slate-700">
                        Page {previewPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setPreviewPage((p) => Math.min(totalPages, p + 1))}
                        disabled={previewPage === totalPages}
                        className="p-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {selectedFile && (previewStats.valid + previewStats.warning > 0) ? (
              <span>
                <strong className="text-emerald-700">{previewStats.valid + previewStats.warning}</strong> ready rows will be imported.{' '}
                {previewStats.error > 0 && (
                  <strong className="text-rose-600">{previewStats.error} invalid rows will be skipped.</strong>
                )}
              </span>
            ) : (
              <span>Download the sample template, populate with records, and upload to proceed.</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
            >
              Close
            </button>

            {selectedFile && (
              <button
                onClick={handleConfirmImport}
                disabled={isImporting || (previewStats.valid + previewStats.warning === 0)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition flex items-center gap-2 shadow-md shadow-amber-600/20 cursor-pointer"
              >
                {isImporting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Processing Batch Import...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Confirm Import ({previewStats.valid + previewStats.warning} Ready Rows)</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
