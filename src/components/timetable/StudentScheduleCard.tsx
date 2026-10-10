import React from 'react';
import { 
  User, 
  GraduationCap, 
  Clock, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Radio, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { TimetableSlotItem } from './TimetableMatrixView';

export interface StudentProfile {
  id: string;
  name: string;
  rollNumber: string;
  email?: string;
  department: string;
  year: number;
  section: string;
  attendanceRate?: number;
}

interface StudentScheduleCardProps {
  student: StudentProfile;
  today: string;
  todaySchedule: TimetableSlotItem[];
  currentClass: TimetableSlotItem | null;
  totalWeeklyLectures: number;
  onViewFullSchedule?: () => void;
}

export const StudentScheduleCard: React.FC<StudentScheduleCardProps> = ({
  student,
  today,
  todaySchedule,
  currentClass,
  totalWeeklyLectures,
  onViewFullSchedule,
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Student Identity Card */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Ambient Glowing Background Elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Avatar & Personal Details */}
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl md:text-2xl font-black text-teal-200 shadow-inner shrink-0">
              {getInitials(student.name)}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/30 text-teal-200 border border-teal-400/30 tracking-wider font-mono">
                  {student.rollNumber}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/15 text-white border border-white/20">
                  Section {student.section}
                </span>
              </div>

              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                {student.name}
              </h2>

              <p className="text-teal-100/90 text-sm font-medium mt-0.5 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-teal-300 shrink-0" />
                {student.department} &bull; Year {student.year}
              </p>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3 text-center">
              <span className="text-[11px] font-semibold text-teal-200 uppercase tracking-wider block">
                Attendance
              </span>
              <span className="text-2xl font-black text-white">
                {student.attendanceRate ? `${student.attendanceRate.toFixed(1)}%` : '92.0%'}
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3 text-center">
              <span className="text-[11px] font-semibold text-teal-200 uppercase tracking-wider block">
                Lectures / Wk
              </span>
              <span className="text-2xl font-black text-teal-300">
                {totalWeeklyLectures || 36}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Active / Next Lecture Highlight Banner */}
      {currentClass ? (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/90 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-md shrink-0 animate-pulse">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                    Happening Right Now &bull; Period {currentClass.periodRoman || currentClass.periodNumber}
                  </span>
                  <span className="text-xs text-slate-500 font-medium font-mono">
                    {currentClass.timeRange}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 leading-tight">
                  {currentClass.courseCode}: {currentClass.courseName}
                </h3>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <User className="w-3.5 h-3.5 text-teal-700" />
                    {currentClass.facultyName}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-900 bg-white px-2 py-0.5 rounded border border-emerald-200">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    Room: {currentClass.room}
                  </span>
                </div>
              </div>
            </div>

            {onViewFullSchedule && (
              <button
                type="button"
                onClick={onViewFullSchedule}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-colors shadow-sm self-start md:self-center shrink-0"
              >
                <span>View Full Weekly Matrix</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              No active class ongoing at this moment. You have <strong>{todaySchedule.length}</strong> classes scheduled for {today}.
            </span>
          </div>
          {onViewFullSchedule && (
            <button
              type="button"
              onClick={onViewFullSchedule}
              className="font-bold text-teal-700 hover:text-teal-900 whitespace-nowrap"
            >
              See Weekly Schedule &rarr;
            </button>
          )}
        </div>
      )}

      {/* Today's Schedule Overview Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-700" />
            <h3 className="font-bold text-slate-900 text-sm">
              Today's Schedule ({today})
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {todaySchedule.length} Periods Scheduled
          </span>
        </div>

        {todaySchedule.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {todaySchedule.map((slot) => {
              const isCurrent = currentClass?.id === slot.id;
              return (
                <div
                  key={slot.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-teal-50/90 border-teal-300 ring-2 ring-teal-500/40 shadow-sm'
                      : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-white text-teal-800 border border-slate-200 font-mono">
                      Period {slot.periodRoman || slot.periodNumber}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {slot.timeRange}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mb-1">
                    {slot.courseCode}: {slot.courseName}
                  </h4>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 mt-2 pt-1.5 border-t border-slate-200/50">
                    <span className="truncate max-w-[120px]">{slot.facultyName}</span>
                    <span className="font-mono font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[10px]">
                      {slot.room}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 text-xs italic">
            No classes scheduled for today. Enjoy your day!
          </div>
        )}
      </div>
    </div>
  );
};
