import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  User as UserIcon, 
  Sparkles, 
  BookOpen, 
  Info, 
  X,
  ExternalLink
} from 'lucide-react';

export interface TimetableSlotItem {
  id: string;
  day: string;
  periodNumber: number;
  periodRoman?: string;
  startTime: string;
  endTime: string;
  timeRange: string;
  courseCode: string;
  courseName: string;
  facultyName: string;
  room: string;
  section: string;
  color?: string;
}

export interface PeriodHeader {
  period: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  timeRange: string;
}

interface TimetableMatrixViewProps {
  periods: PeriodHeader[];
  days: string[];
  matrix: Record<string, Array<TimetableSlotItem | null>>;
  activeSlotId?: string | null;
  sectionLabel?: string;
  departmentLabel?: string;
}

export const TimetableMatrixView: React.FC<TimetableMatrixViewProps> = ({
  periods,
  days,
  matrix,
  activeSlotId,
  sectionLabel,
  departmentLabel,
}) => {
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlotItem | null>(null);

  const getSubjectColorStyles = (code: string) => {
    // Generate harmonious, consistent pastel/rich accents based on subject code
    const colors = [
      { bg: 'bg-teal-50/90 hover:bg-teal-100/90', border: 'border-teal-200/80', text: 'text-teal-900', badge: 'bg-teal-100 text-teal-800' },
      { bg: 'bg-indigo-50/90 hover:bg-indigo-100/90', border: 'border-indigo-200/80', text: 'text-indigo-900', badge: 'bg-indigo-100 text-indigo-800' },
      { bg: 'bg-sky-50/90 hover:bg-sky-100/90', border: 'border-sky-200/80', text: 'text-sky-900', badge: 'bg-sky-100 text-sky-800' },
      { bg: 'bg-amber-50/90 hover:bg-amber-100/90', border: 'border-amber-200/80', text: 'text-amber-900', badge: 'bg-amber-100 text-amber-800' },
      { bg: 'bg-emerald-50/90 hover:bg-emerald-100/90', border: 'border-emerald-200/80', text: 'text-emerald-900', badge: 'bg-emerald-100 text-emerald-800' },
      { bg: 'bg-violet-50/90 hover:bg-violet-100/90', border: 'border-violet-200/80', text: 'text-violet-900', badge: 'bg-violet-100 text-violet-800' },
    ];
    let hash = 0;
    for (let i = 0; i < code.length; i++) {
      hash = code.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="w-full">
      {/* Timetable Grid Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Subheader Banner */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-200">
              {sectionLabel || 'Section Schedule'}
            </span>
            {departmentLabel && (
              <span className="text-xs font-medium text-slate-500">
                Department of {departmentLabel}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            6 Periods Daily &bull; Mon &ndash; Sat
          </div>
        </div>

        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left min-w-[950px]">
            <thead>
              <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200">
                <th className="py-3 px-4 w-28 text-center font-semibold text-xs uppercase tracking-wider text-slate-500 bg-slate-200/60 border-r border-slate-200/80 sticky left-0 z-10">
                  Day
                </th>
                {periods.map((p) => (
                  <th key={p.period} className="py-3 px-3 text-center border-r border-slate-200/80 last:border-r-0 min-w-[140px]">
                    <div className="text-xs font-bold text-teal-800 uppercase tracking-wide">
                      Period {p.period}
                    </div>
                    <div className="text-[11px] font-medium text-slate-500 mt-0.5 whitespace-nowrap">
                      {p.timeRange}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {days.map((day) => {
                const daySlots = matrix[day] || [];
                const isToday = new Date().toLocaleDateString('en-US', { weekday: 'short' }) === day;

                return (
                  <tr key={day} className={`group transition-colors ${isToday ? 'bg-teal-50/20' : 'hover:bg-slate-50/50'}`}>
                    {/* Day Column Header (Sticky on scroll) */}
                    <td className={`py-4 px-3 text-center font-bold text-sm tracking-wider border-r border-slate-200/80 sticky left-0 z-10 transition-colors ${
                      isToday 
                        ? 'bg-teal-600 text-white shadow-md' 
                        : 'bg-slate-50/95 group-hover:bg-slate-100/90 text-slate-700'
                    }`}>
                      <div>{day.toUpperCase()}</div>
                      {isToday && (
                        <span className="inline-block mt-1 text-[9px] font-extrabold uppercase bg-teal-800 text-teal-100 px-1.5 py-0.5 rounded">
                          Today
                        </span>
                      )}
                    </td>

                    {/* Period Slots */}
                    {periods.map((_, pIdx) => {
                      const slot = daySlots[pIdx];

                      if (!slot) {
                        return (
                          <td key={pIdx} className="p-2 border-r border-slate-100 last:border-r-0 text-center align-top bg-slate-50/30">
                            <div className="h-full min-h-[96px] flex items-center justify-center rounded-xl border border-dashed border-slate-200 text-slate-400 text-xs italic">
                              Free Slot
                            </div>
                          </td>
                        );
                      }

                      const colors = getSubjectColorStyles(slot.courseCode);
                      const isSlotActive = activeSlotId === slot.id;

                      return (
                        <td key={pIdx} className="p-1.5 border-r border-slate-100 last:border-r-0 align-top">
                          <button
                            type="button"
                            onClick={() => setSelectedSlot(slot)}
                            className={`w-full text-left p-2.5 rounded-xl border transition-all duration-200 cursor-pointer min-h-[105px] flex flex-col justify-between group/card relative ${colors.bg} ${colors.border} ${
                              isSlotActive 
                                ? 'ring-2 ring-teal-500 ring-offset-1 shadow-md scale-[1.02]' 
                                : 'hover:shadow-md hover:scale-[1.01]'
                            }`}
                          >
                            {/* Live Active Pulsing Indicator */}
                            {isSlotActive && (
                              <div className="absolute -top-1.5 -right-1.5 flex items-center gap-1 bg-teal-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                                LIVE
                              </div>
                            )}

                            <div>
                              {/* Top Bar: Code & Section badge */}
                              <div className="flex items-center justify-between gap-1 mb-1">
                                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${colors.badge} tracking-wider`}>
                                  {slot.courseCode}
                                </span>
                                <span className="text-[10px] font-medium text-slate-500">
                                  {slot.section}
                                </span>
                              </div>

                              {/* Subject Title */}
                              <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight group-hover/card:text-teal-700 transition-colors">
                                {slot.courseName}
                              </h4>
                            </div>

                            {/* Bottom Bar: Faculty & Room */}
                            <div className="mt-2 pt-1.5 border-t border-slate-200/50 flex flex-col gap-1 text-[11px]">
                              <div className="flex items-center gap-1 text-slate-600 truncate">
                                <UserIcon className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate font-medium">{slot.facultyName}</span>
                              </div>
                              <div className="flex items-center justify-between gap-1 text-[10px] font-semibold text-slate-700">
                                <span className="inline-flex items-center gap-1 text-slate-600">
                                  <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                                  <span className="font-mono bg-white/80 px-1 py-0.5 rounded border border-slate-200/60">
                                    {slot.room}
                                  </span>
                                </span>
                              </div>
                            </div>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slot Details Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-teal-700 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-200" />
                <h3 className="font-bold text-base">Lecture Slot Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSlot(null)}
                className="p-1 rounded-lg text-teal-100 hover:text-white hover:bg-teal-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-sm">
              <div>
                <div className="text-xs font-bold text-teal-700 tracking-wider uppercase mb-1">
                  {selectedSlot.courseCode}
                </div>
                <h2 className="text-lg font-bold text-slate-900 leading-snug">
                  {selectedSlot.courseName}
                </h2>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium block">Assigned Faculty</span>
                  <div className="font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4 text-teal-600" />
                    <span>{selectedSlot.facultyName}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium block">Classroom / Lab</span>
                  <div className="font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-teal-600" />
                    <span>{selectedSlot.room}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium block">Day & Period</span>
                  <div className="font-bold text-slate-800 mt-1 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-teal-600" />
                    <span>{selectedSlot.day} &bull; Period {selectedSlot.periodRoman || selectedSlot.periodNumber}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-xs text-slate-500 font-medium block">Timings</span>
                  <div className="font-bold text-slate-800 mt-1">
                    {selectedSlot.timeRange}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl text-xs text-teal-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <span>
                  Synchronized directly from the Master Google Sheet schedule for <strong>{selectedSlot.section}</strong>. Attendance records and bluetooth BLE sessions automatically adhere to this slot.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedSlot(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
