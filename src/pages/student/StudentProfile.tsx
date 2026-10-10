import React from 'react';
import { 
  Camera, 
  ScanFace, 
  Bell, 
  FileText, 
  HelpCircle, 
  ChevronRight,
  Mail,
  User,
  Phone,
  GraduationCap,
  Award,
  ShieldCheck,
  Calendar,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

interface StudentProfileProps {
  onReEnrollFace?: () => void;
  onLogout?: () => void;
}

const getInitials = (name: string) => {
  const clean = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s+/i, '').trim();
  const parts = clean.split(' ').filter(Boolean);
  if (parts.length === 0) return 'ST';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const StudentProfile: React.FC<StudentProfileProps> = ({ onReEnrollFace, onLogout }) => {
  const { selectedStudent, currentUser } = useAppStore();

  const studentName = currentUser?.name || selectedStudent.name;
  const studentEmail = currentUser?.email || selectedStudent.email;
  const studentRoll = currentUser?.rollNumber || selectedStudent.rollNumber;
  const studentDept = currentUser?.department || selectedStudent.department;
  const studentYear = currentUser?.year || selectedStudent.year;
  const studentSection = currentUser?.section || selectedStudent.section || '—';
  const studentPhone = currentUser?.phone || selectedStudent.phone || 'Not Provided';
  const studentMentor = currentUser?.mentorName || selectedStudent.mentorName || 'Unassigned';
  const attendanceRate = currentUser?.attendanceRate ?? selectedStudent.attendanceRate ?? 92;
  const isEnrolled = currentUser?.faceIdStatus === 'enrolled' || selectedStudent?.faceIdStatus === 'enrolled';
  const displayPhoto = currentUser?.photoUrl || selectedStudent?.photoUrl;

  const settingsRows = [
    {
      label: 'My Face ID Biometrics',
      sub: isEnrolled ? 'Enrolled & Active (1-Time Verified)' : 'Action Required: Register Face ID',
      icon: <ScanFace size={16} className={isEnrolled ? 'text-emerald-600' : 'text-amber-600'} />,
      action: onReEnrollFace || (() => alert('Face ID registration')),
    },
    {
      label: 'Notification Preferences',
      sub: 'Class alerts & reminders',
      icon: <Bell size={16} className="text-indigo-600" />,
      action: () => alert('Notification settings'),
    },
    {
      label: 'Semester Attendance Report',
      sub: 'Download PDF Transcript',
      icon: <FileText size={16} className="text-emerald-600" />,
      action: () => alert('Downloading Attendance Transcript PDF...'),
    },
    {
      label: 'Help & Campus Support',
      sub: 'IT desk & beacon issues',
      icon: <HelpCircle size={16} className="text-slate-500" />,
      action: () => alert('Campus IT Desk: support@smartattendance.edu'),
    },
  ];

  return (
    <div className="flex-1 p-4 space-y-5 overflow-y-auto pb-24 bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Profile Header */}
      <div className="flex flex-col items-center text-center pt-2">
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 text-white flex items-center justify-center text-2xl font-black shadow-lg border-2 border-teal-400 ring-4 ring-teal-50 overflow-hidden">
            {displayPhoto ? (
              <img src={displayPhoto} alt={studentName} className="w-full h-full object-cover" />
            ) : (
              getInitials(studentName)
            )}
          </div>
          <button
            onClick={onReEnrollFace}
            title={isEnrolled ? "Update Face ID" : "Register Face ID"}
            className={`absolute -bottom-1 -right-1 p-1.5 rounded-full text-white shadow-md border-2 border-white hover:scale-105 transition cursor-pointer ${
              isEnrolled ? 'bg-teal-600 hover:bg-teal-700' : 'bg-amber-500 hover:bg-amber-600 ring-2 ring-amber-300'
            }`}
          >
            <Camera size={13} />
          </button>
        </div>

        <div className="mt-3 space-y-0.5">
          <h3 className="font-extrabold text-lg text-slate-900 flex items-center justify-center gap-1.5">
            <span>{studentName}</span>
            <span title="Verified Institutional Student">
              <ShieldCheck size={16} className="text-teal-600 inline" />
            </span>
          </h3>
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 font-mono font-bold text-xs">
            {studentRoll}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1.5 font-medium">
          <Mail size={13} className="text-teal-600" />
          <span className="font-semibold text-slate-800">{studentEmail}</span>
        </div>
      </div>

      {/* Dedicated One-Time Face ID Registration Status Card */}
      <div className={`rounded-2xl p-4 border transition-all ${
        isEnrolled 
          ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-emerald-200 shadow-xs' 
          : 'bg-gradient-to-r from-amber-50 via-orange-50 to-white border-amber-300 shadow-sm'
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-2xl shrink-0 ${isEnrolled ? 'bg-emerald-500 text-white shadow-xs' : 'bg-amber-500 text-white animate-pulse'}`}>
              <ScanFace size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-slate-900">
                  {isEnrolled ? 'Biometric Face ID Enrolled' : 'One-Time Face ID Registration'}
                </h4>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  isEnrolled ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  {isEnrolled ? 'Verified Active' : 'Action Required'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {isEnrolled
                  ? 'Your biometric face profile is verified with 98% neural confidence. Touchless classroom check-in is enabled.'
                  : 'Register your face once from your profile to enable Bluetooth proximity check-ins in lecture halls.'}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            {isEnrolled ? 'Status: 1-Time Setup Complete' : 'Takes 10 seconds using your camera'}
          </span>
          <button
            onClick={onReEnrollFace}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs ${
              isEnrolled
                ? 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-105 text-white shadow-amber-500/25'
            }`}
          >
            <span>{isEnrolled ? 'Update Photo' : 'Register Face Now'}</span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Official Institutional Excel Roster Record Details Card */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-[11px] font-extrabold tracking-wider uppercase text-slate-400 flex items-center gap-1.5">
            <Sparkles size={13} className="text-teal-600" />
            <span>Institutional Profile Details</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px]">
            Roster Verified
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
            <User size={15} className="text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Full Name</span>
              <span className="font-bold text-slate-800">{studentName}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
            <ShieldCheck size={15} className="text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Roll No / Student ID</span>
              <span className="font-mono font-bold text-slate-800">{studentRoll || 'Not Provided'}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
            <Mail size={15} className="text-teal-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Official Email</span>
              <span className="font-bold text-slate-800 truncate block">{studentEmail}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
            <GraduationCap size={15} className="text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Program & Year</span>
              <span className="font-bold text-slate-800">{studentDept} • Year {studentYear} (Sec {studentSection})</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
            <Phone size={15} className="text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">Mobile / Phone</span>
              <span className="font-mono font-bold text-slate-800">{studentPhone}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100 sm:col-span-2">
            <Award size={15} className="text-indigo-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Faculty Mentor</span>
                <span className="text-[10px] text-teal-700 font-bold">Attendance: {attendanceRate}%</span>
              </div>
              <span className="font-bold text-slate-800 block mt-0.5">{studentMentor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Rows */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
        {settingsRows.map((row, idx) => (
          <button
            key={idx}
            onClick={row.action}
            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-50 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-100">{row.icon}</div>
              <div>
                <span className="text-xs font-bold text-slate-800 block">{row.label}</span>
                <span className="text-[10px] text-slate-500">{row.sub}</span>
              </div>
            </div>
            <ChevronRight size={15} className="text-slate-400" />
          </button>
        ))}
      </div>

      {/* Logout Action */}
      {onLogout && (
        <button
          onClick={onLogout}
          className="w-full p-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <LogOut size={15} />
          <span>Sign Out of Student Account</span>
        </button>
      )}
    </div>
  );
};
