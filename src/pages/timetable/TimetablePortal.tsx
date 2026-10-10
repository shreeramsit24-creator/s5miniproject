import React, { useState, useEffect, useTransition } from 'react';
import { 
  Calendar, 
  GraduationCap, 
  RefreshCw, 
  Download, 
  Printer, 
  Search, 
  Sparkles, 
  Clock, 
  Users, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  Building2,
  FileSpreadsheet,
  Zap,
  ExternalLink
} from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

import { TimetableMatrixView, TimetableSlotItem, PeriodHeader } from '../../components/timetable/TimetableMatrixView';
import { StudentScheduleCard, StudentProfile } from '../../components/timetable/StudentScheduleCard';
import { exportTimetableToExcel, exportTimetableToPdf } from '../../utils/timetableExporter';

interface SectionItem {
  id: string;
  name: string;
  displayName: string;
  code: string;
  department: string;
  year: number;
  slotCount: number;
}

interface AutocompleteStudent {
  id: string;
  name: string;
  rollNumber: string;
  department: string;
  year: number;
  section: string;
}

export const TimetablePortal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'section' | 'student' | 'sync'>('section');

  // Section View State
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [selectedSectionCode, setSelectedSectionCode] = useState<string>('A');
  const [sectionData, setSectionData] = useState<{
    section: string;
    sectionCode: string;
    displayName: string;
    department: string;
    year: number;
    totalWeeklyLectures: number;
    periods: PeriodHeader[];
    days: string[];
    matrix: Record<string, Array<TimetableSlotItem | null>>;
    slots: TimetableSlotItem[];
  } | null>(null);
  const [isLoadingSection, setIsLoadingSection] = useState(false);

  // Student View State
  const [studentSearchInput, setStudentSearchInput] = useState<string>('7376242IT303');
  const [studentSuggestions, setStudentSuggestions] = useState<AutocompleteStudent[]>([]);
  const [isSearchingStudents, setIsSearchingStudents] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [studentTimetable, setStudentTimetable] = useState<{
    student: StudentProfile;
    section: string;
    sectionCode: string;
    department: string;
    year: number;
    totalWeeklyLectures: number;
    periods: PeriodHeader[];
    days: string[];
    matrix: Record<string, Array<TimetableSlotItem | null>>;
    slots: TimetableSlotItem[];
    today: string;
    todaySchedule: TimetableSlotItem[];
    currentClass: TimetableSlotItem | null;
  } | null>(null);
  const [isLoadingStudent, setIsLoadingStudent] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);

  // Admin Sync State
  const [syncSheetUrl, setSyncSheetUrl] = useState<string>(
    'https://docs.google.com/spreadsheets/d/1aSq6dYmaSuXOBSmFHMIUyDINmO2konnEAd23bU5nnSI/export?format=csv&gid=0'
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    importedSlots: number;
    sectionsAssigned: number;
    syncedAt: string;
    message: string;
  } | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // 1. Fetch available sections on mount
  useEffect(() => {
    fetchSections();
    fetchStudentSchedule('7376242IT303'); // Load initial student schedule
  }, []);

  const fetchSections = async () => {
    try {
      const res = await axios.get('/api/v1/timetable/sections');
      const data: SectionItem[] = res.data;
      setSections(data);
      if (data.length > 0) {
        // Default to section A or first available
        const hasA = data.find((s) => s.code.toUpperCase() === 'A');
        const defaultCode = hasA ? 'A' : data[0].code;
        setSelectedSectionCode(defaultCode);
        fetchSectionTimetable(defaultCode);
      }
    } catch (err) {
      console.error('Failed to load sections:', err);
    }
  };

  // 2. Fetch section matrix
  const fetchSectionTimetable = async (secCode: string) => {
    setIsLoadingSection(true);
    try {
      const res = await axios.get(`/api/v1/timetable/section/${secCode}`);
      setSectionData(res.data);
    } catch (err) {
      console.error(`Failed to load timetable for section ${secCode}:`, err);
    } finally {
      setIsLoadingSection(false);
    }
  };

  const handleSelectSection = (code: string) => {
    setSelectedSectionCode(code);
    fetchSectionTimetable(code);
  };

  // 3. Search and fetch student schedule
  const fetchStudentSchedule = async (query: string) => {
    if (!query || !query.trim()) return;
    setIsLoadingStudent(true);
    setStudentError(null);
    setShowSuggestions(false);
    try {
      const res = await axios.get(`/api/v1/timetable/student/${encodeURIComponent(query.trim())}`);
      setStudentTimetable(res.data);
      setStudentSearchInput(res.data.student.rollNumber || res.data.student.name);
    } catch (err: any) {
      console.error('Student lookup error:', err);
      setStudentError(
        err.response?.data?.detail || `No student matching "${query}" found. Try roll number "7376242IT303" or name "SIVAGOKUL C".`
      );
      setStudentTimetable(null);
    } finally {
      setIsLoadingStudent(false);
    }
  };

  // Autocomplete suggestions as user types
  const handleStudentSearchChange = async (val: string) => {
    setStudentSearchInput(val);
    if (!val || val.trim().length < 2) {
      setStudentSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsSearchingStudents(true);
    try {
      const res = await axios.get(`/api/v1/timetable/students?search=${encodeURIComponent(val.trim())}`);
      setStudentSuggestions(res.data);
      setShowSuggestions(true);
    } catch (err) {
      console.error('Autocomplete error:', err);
    } finally {
      setIsSearchingStudents(false);
    }
  };

  // 4. Trigger 1-Click Master Google Sheet Sync
  const handleTriggerSync = async () => {
    setIsSyncing(true);
    setSyncError(null);
    setSyncResult(null);
    try {
      const res = await axios.post(`/api/v1/timetable/sync?url=${encodeURIComponent(syncSheetUrl.trim())}`);
      setSyncResult(res.data);
      // Refresh active view
      await fetchSections();
      if (selectedSectionCode) {
        await fetchSectionTimetable(selectedSectionCode);
      }
      if (studentTimetable?.student?.rollNumber) {
        await fetchStudentSchedule(studentTimetable.student.rollNumber);
      }
    } catch (err: any) {
      console.error('Sync failed:', err);
      setSyncError(err.response?.data?.detail || 'Failed to sync Google Sheet. Please check the URL.');
    } finally {
      setIsSyncing(false);
    }
  };

  // 5. Export handlers
  const handleExportExcel = () => {
    if (activeTab === 'student' && studentTimetable) {
      exportTimetableToExcel(
        {
          title: `Student Timetable - ${studentTimetable.student.name}`,
          department: studentTimetable.department,
          year: studentTimetable.year,
          sectionOrStudent: `${studentTimetable.student.name} (${studentTimetable.student.rollNumber})`,
          periods: studentTimetable.periods,
          days: studentTimetable.days,
          matrix: studentTimetable.matrix,
          rawSlots: studentTimetable.slots,
        },
        `Timetable_Student_${studentTimetable.student.rollNumber}`
      );
    } else if (sectionData) {
      exportTimetableToExcel(
        {
          title: `Class Timetable - ${sectionData.section}`,
          department: sectionData.department,
          year: sectionData.year,
          sectionOrStudent: sectionData.section,
          periods: sectionData.periods,
          days: sectionData.days,
          matrix: sectionData.matrix,
          rawSlots: sectionData.slots,
        },
        `Timetable_Class_${sectionData.sectionCode}`
      );
    }
  };

  const handleExportPdf = () => {
    if (activeTab === 'student' && studentTimetable) {
      exportTimetableToPdf({
        title: `Student Schedule: ${studentTimetable.student.name}`,
        department: studentTimetable.department,
        year: studentTimetable.year,
        sectionOrStudent: `${studentTimetable.student.name} (${studentTimetable.student.rollNumber}) - ${studentTimetable.section}`,
        periods: studentTimetable.periods,
        days: studentTimetable.days,
        matrix: studentTimetable.matrix,
      });
    } else if (sectionData) {
      exportTimetableToPdf({
        title: `Class Section Schedule: ${sectionData.section}`,
        department: sectionData.department,
        year: sectionData.year,
        sectionOrStudent: sectionData.displayName,
        periods: sectionData.periods,
        days: sectionData.days,
        matrix: sectionData.matrix,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col">
      {/* Top Institutional Header Bar */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title="Return to Home / Login"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center font-black shadow-md shadow-teal-700/20">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-none flex items-center gap-2">
                  <span>Academic Master Timetable</span>
                  <span className="hidden sm:inline-block text-[10px] uppercase font-bold bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                    Live Portal
                  </span>
                </h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Bannari Amman Institute of Technology &bull; S5 Mini Project Schedule
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
              title="Export as Excel .xlsx spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Export Excel</span>
            </button>

            <button
              type="button"
              onClick={handleExportPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
              title="Print / Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span className="hidden md:inline">Print / PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main View Mode Selector Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto gap-4 py-3">
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('section')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'section'
                    ? 'bg-white text-teal-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4 text-teal-600" />
                <span>Class / Section Timetable</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('student')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'student'
                    ? 'bg-white text-teal-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-teal-600" />
                <span>Student Personal Schedule</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('sync')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'sync'
                    ? 'bg-white text-teal-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-600" />
                <span>Admin 1-Click Re-Sync</span>
              </button>
            </div>

            {/* Live Indicator / Quick Stats */}
            <div className="hidden lg:flex items-center gap-4 text-xs font-semibold text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Google Sheet Live Sync Active</span>
              </div>
              <span>&bull;</span>
              <span>72 Total Class Slots</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        {/* =========================================================================
            TAB 1: CLASS / SECTION TIMETABLE VIEW
        ========================================================================= */}
        {activeTab === 'section' && (
          <div className="space-y-6">
            {/* Controls Bar: Section Pills & Metrics */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Select Class / Section
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {sections.map((sec) => {
                    const isSelected = selectedSectionCode.toUpperCase() === sec.code.toUpperCase();
                    return (
                      <button
                        key={sec.id}
                        type="button"
                        onClick={() => handleSelectSection(sec.code)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20 scale-[1.02]'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{sec.name}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            isSelected ? 'bg-teal-900 text-teal-200' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {sec.slotCount} slots
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Section Metrics */}
              {sectionData && (
                <div className="flex items-center gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 text-xs">
                  <div className="text-right">
                    <span className="text-slate-400 font-medium block">Department</span>
                    <span className="font-bold text-slate-800">{sectionData.department}</span>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div className="text-right">
                    <span className="text-slate-400 font-medium block">Lectures / Week</span>
                    <span className="font-bold text-teal-700 text-base">{sectionData.totalWeeklyLectures}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Weekly Timetable Grid */}
            {isLoadingSection ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-600">Loading weekly section schedule...</p>
              </div>
            ) : sectionData ? (
              <TimetableMatrixView
                periods={sectionData.periods}
                days={sectionData.days}
                matrix={sectionData.matrix}
                sectionLabel={sectionData.displayName}
                departmentLabel={sectionData.department}
              />
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
                No section data available. Please re-sync using the Admin Re-Sync tab.
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: STUDENT PERSONAL SCHEDULE VIEW
        ========================================================================= */}
        {activeTab === 'student' && (
          <div className="space-y-6">
            {/* Student Search & Autocomplete Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Lookup Student Timetable
              </span>

              <div className="relative max-w-xl">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={studentSearchInput}
                      onChange={(e) => handleStudentSearchChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          fetchStudentSchedule(studentSearchInput);
                        }
                      }}
                      placeholder="Enter Roll Number (e.g. 7376242IT303) or Student Name..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm font-semibold text-slate-900 transition-all outline-none"
                    />
                    {isSearchingStudents && (
                      <RefreshCw className="w-4 h-4 text-slate-400 animate-spin absolute right-3.5 top-1/2 -translate-y-1/2" />
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => fetchStudentSchedule(studentSearchInput)}
                    disabled={isLoadingStudent}
                    className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-sm shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {isLoadingStudent ? 'Searching...' : 'Lookup'}
                  </button>
                </div>

                {/* Suggestions Dropdown */}
                {showSuggestions && studentSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 max-h-60 overflow-y-auto z-40 divide-y divide-slate-100 animate-in fade-in slide-in-from-top-1 duration-150">
                    {studentSuggestions.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => fetchStudentSchedule(st.rollNumber)}
                        className="w-full text-left px-4 py-3 hover:bg-teal-50/60 flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer"
                      >
                        <div>
                          <span className="font-bold text-slate-900 block">{st.name}</span>
                          <span className="text-slate-500 text-[11px] font-mono">{st.rollNumber}</span>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 text-teal-800">
                            Section {st.section}
                          </span>
                          <span className="block text-[10px] text-slate-400">{st.department}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Error Message */}
              {studentError && (
                <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{studentError}</span>
                </div>
              )}
            </div>

            {/* Student Schedule Display */}
            {isLoadingStudent ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-600">Resolving student roster and weekly timetable...</p>
              </div>
            ) : studentTimetable ? (
              <div className="space-y-6">
                <StudentScheduleCard
                  student={studentTimetable.student}
                  today={studentTimetable.today}
                  todaySchedule={studentTimetable.todaySchedule}
                  currentClass={studentTimetable.currentClass}
                  totalWeeklyLectures={studentTimetable.totalWeeklyLectures}
                />

                {/* Student Full Weekly Matrix */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-teal-700" />
                      <span>Weekly Schedule Matrix ({studentTimetable.section})</span>
                    </h3>
                  </div>

                  <TimetableMatrixView
                    periods={studentTimetable.periods}
                    days={studentTimetable.days}
                    matrix={studentTimetable.matrix}
                    activeSlotId={studentTimetable.currentClass?.id}
                    sectionLabel={`${studentTimetable.student.name} &bull; ${studentTimetable.section}`}
                    departmentLabel={studentTimetable.department}
                  />
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* =========================================================================
            TAB 3: ADMIN 1-CLICK SHEET RE-SYNC VIEW
        ========================================================================= */}
        {activeTab === 'sync' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">
                    Master Timetable 1-Click Re-Sync
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Automatically deconstructs combined Section A & Section B cells into structured timetables.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Master Google Sheet CSV Export URL
                  </label>
                  <input
                    type="url"
                    value={syncSheetUrl}
                    onChange={(e) => setSyncSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=0"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-xs font-mono text-slate-800 transition-all outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Direct public Google Sheet CSV endpoint for "S5 MINI PROJECT TIME TABLE".
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleTriggerSync}
                    disabled={isSyncing}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-teal-700 to-teal-800 hover:from-teal-800 hover:to-teal-900 text-white font-bold text-sm shadow-md shadow-teal-800/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Parsing Dual Sections & Updating Database...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Re-Sync Master Timetable Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Feedback Alert */}
              {syncResult && (
                <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 animate-in fade-in duration-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm">Synchronization Successful!</h4>
                      <p className="text-xs text-emerald-700 mt-0.5">{syncResult.message}</p>
                      <div className="flex items-center gap-4 mt-2 text-[11px] font-semibold text-emerald-800">
                        <span>Slots Imported: <strong>{syncResult.importedSlots}</strong></span>
                        <span>Sections Updated: <strong>{syncResult.sectionsAssigned}</strong></span>
                        <span>Time: {new Date(syncResult.syncedAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {syncError && (
                <div className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 animate-in fade-in duration-200">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm">Sync Encountered an Issue</h4>
                      <p className="text-xs text-rose-700 mt-0.5">{syncError}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Parsing Architecture Explanation Card */}
            <div className="bg-slate-100/70 border border-slate-200/80 rounded-2xl p-5 text-xs text-slate-600 space-y-2">
              <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>How the Dual-Section Parsing Engine Works</span>
              </h4>
              <p>
                Each cell in the Google Sheet contains combined data for both Section A and Section B (e.g. <code>22IT305 SOFTWARE ENGINEERING Mrs.SANTHIYA B (SEC A) (A-201) Mrs priya J (SEC-B) (A-202)</code>).
              </p>
              <ul className="list-disc list-inside space-y-1 pl-1 text-slate-600">
                <li>Splits combined entries into independent records for Section A and Section B.</li>
                <li>Extracts individual room numbers (e.g. <code>A-201</code> vs <code>A-202</code>).</li>
                <li>Handles multi-line courses and cross-batch prefixes (e.g. <code>S3 IT 22HS005- SOFTSKILLS...</code>).</li>
                <li>Normalizes section order regardless of whether Section A or Section B appears first in the cell.</li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
