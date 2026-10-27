import { create } from 'zustand';
import { BleSession, AttendanceRecord } from '../types';
import { facultyApi, studentApi } from '../api/client';

interface SessionState {
  activeSession: BleSession | null;
  attendanceRecords: AttendanceRecord[];
  historySessions: {
    id: string;
    subjectName: string;
    subjectCode?: string;
    className: string;
    date: string;
    dateStr?: string;
    time: string;
    room?: string;
    presentCount: number;
    totalCount: number;
    attendanceRate: number;
  }[];
  startSession: (params: {
    facultyId: string;
    facultyName: string;
    classSectionId: string;
    classSectionName: string;
    subjectId: string;
    subjectName: string;
    room: string;
    durationMinutes: number;
    faceVerificationRequired: boolean;
    capacity: number;
  }) => void;
  studentCheckIn: (student: {
    id: string;
    name: string;
    rollNumber: string;
    department: string;
    method?: 'ble+face' | 'manual_override';
    overrideReason?: string;
    rssi?: number;
    distanceMeters?: number;
    bleToken?: string;
  }) => boolean;
  endSession: () => void;
  manualMarkPresent: (student: {
    id: string;
    name: string;
    rollNumber: string;
    department: string;
    reason: string;
  }) => void;
  setActiveSession: (session: BleSession | null) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  activeSession: null,
  attendanceRecords: [
    {
      id: 'REC-001',
      sessionId: 'HIST-001',
      studentId: 'STU-2026-001',
      studentName: 'Gokul V',
      rollNumber: '7376242AD166',
      department: 'Artificial Intelligence and Data Science',
      markedAt: '08:52 AM',
      method: 'ble+face',
      faceVerified: true,
    },
    {
      id: 'REC-002',
      sessionId: 'HIST-001',
      studentId: 'STU-2026-002',
      studentName: 'Ananya Sharma',
      rollNumber: '7376242AD102',
      department: 'Artificial Intelligence and Data Science',
      markedAt: '08:53 AM',
      method: 'ble+face',
      faceVerified: true,
    },
    {
      id: 'REC-003',
      sessionId: 'HIST-001',
      studentId: 'STU-2026-003',
      studentName: 'Dinesh Kumar',
      rollNumber: '7376242AD115',
      department: 'Artificial Intelligence and Data Science',
      markedAt: '08:54 AM',
      method: 'ble+face',
      faceVerified: true,
    }
  ],
  historySessions: [
    {
      id: 'HIST-001',
      subjectName: 'Foundations of Machine Learning',
      subjectCode: 'AI301',
      className: 'AI & DS - Year 3 (Section A)',
      date: new Date().toISOString().split('T')[0],
      dateStr: 'Today, 08:45 AM',
      time: '08:45 AM - 09:35 AM',
      room: 'AI Lab 304',
      presentCount: 61,
      totalCount: 64,
      attendanceRate: 95.3,
    },
    {
      id: 'HIST-002',
      subjectName: 'Deep Learning & Neural Networks',
      subjectCode: 'AI302',
      className: 'AI & DS - Year 3 (Section A)',
      date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      dateStr: 'Yesterday, 09:35 AM',
      time: '09:35 AM - 10:25 AM',
      room: 'Hall B-201',
      presentCount: 59,
      totalCount: 64,
      attendanceRate: 92.2,
    },
    {
      id: 'HIST-003',
      subjectName: 'Cloud Computing & Microservices',
      subjectCode: 'IT304',
      className: 'IT - Year 3 (Section A)',
      date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
      dateStr: '2 days ago',
      time: '10:45 AM - 11:35 AM',
      room: 'Turing Hall 102',
      presentCount: 57,
      totalCount: 60,
      attendanceRate: 95.0,
    }
  ],

  clearSession: () => {
    set({
      activeSession: null,
      attendanceRecords: [],
    });
  },

  setActiveSession: (session) => {
    set({ activeSession: session });
  },

  startSession: (params) => {
    const localId = `sess-${Date.now()}`;
    const newSession: BleSession = {
      id: localId,
      facultyId: params.facultyId,
      facultyName: params.facultyName,
      classSectionId: params.classSectionId,
      classSectionName: params.classSectionName,
      subjectId: params.subjectId,
      subjectName: params.subjectName,
      room: params.room,
      status: 'broadcasting',
      durationMinutes: params.durationMinutes,
      faceVerificationRequired: params.faceVerificationRequired,
      startedAt: new Date().toISOString(),
      checkedInStudentIds: [],
      capacity: params.capacity || 45,
    };

    set({
      activeSession: newSession,
      attendanceRecords: [],
    });

    // Call backend to create real session and broadcast on WebSockets
    facultyApi.startSession({
      classSectionId: params.classSectionId,
      classSectionName: params.classSectionName,
      subjectId: params.subjectId,
      subjectName: params.subjectName,
      room: params.room,
      durationMinutes: params.durationMinutes,
      faceVerificationRequired: params.faceVerificationRequired,
      capacity: params.capacity || 45,
    }).then((resp) => {
      if (resp?.sessionId) {
        set((state) => ({
          activeSession: state.activeSession
            ? { ...state.activeSession, id: resp.sessionId }
            : null,
        }));
      }
    }).catch(console.warn);
  },

  studentCheckIn: (student) => {
    const { activeSession, attendanceRecords } = get();
    if (!activeSession) return false;

    // Avoid duplicate check-in
    if (activeSession.checkedInStudentIds.includes(student.id)) {
      return true;
    }

    const newRecord: AttendanceRecord = {
      id: `rec-${Date.now()}-${student.id}`,
      sessionId: activeSession.id,
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      department: student.department,
      markedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      method: student.method || 'ble+face',
      faceVerified: true,
      overrideReason: student.overrideReason,
    };

    set({
      activeSession: {
        ...activeSession,
        checkedInStudentIds: [...activeSession.checkedInStudentIds, student.id],
      },
      attendanceRecords: [newRecord, ...attendanceRecords],
    });

    // Submit attendance check-in to backend
    studentApi.verifyAttendance({
      sessionId: activeSession.id,
      rssi: student.rssi,
      distanceMeters: student.distanceMeters,
      bleToken: student.bleToken,
      faceConfidenceScore: 95.0,
      faceVerified: true,
      method: student.method || 'ble+face',
    }).catch(console.warn);

    return true;
  },

  manualMarkPresent: (student) => {
    const { activeSession, attendanceRecords } = get();
    if (!activeSession) return;

    if (activeSession.checkedInStudentIds.includes(student.id)) return;

    const newRecord: AttendanceRecord = {
      id: `rec-man-${Date.now()}-${student.id}`,
      sessionId: activeSession.id,
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber,
      department: student.department,
      markedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      method: 'manual_override',
      faceVerified: false,
      overrideReason: student.reason,
    };

    set({
      activeSession: {
        ...activeSession,
        checkedInStudentIds: [...activeSession.checkedInStudentIds, student.id],
      },
      attendanceRecords: [newRecord, ...attendanceRecords],
    });

    // Send manual override to backend
    facultyApi.manualCheckin(activeSession.id, student.id, student.reason).catch(console.warn);
  },

  endSession: () => {
    const { activeSession, attendanceRecords, historySessions } = get();
    if (!activeSession) return;

    const presentCount = activeSession.checkedInStudentIds.length;
    const totalCount = activeSession.capacity;
    const rate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    const dateFormatted = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const newHistoryItem = {
      id: activeSession.id,
      subjectName: activeSession.subjectName,
      subjectCode: activeSession.subjectId || '',
      className: activeSession.classSectionName,
      date: dateFormatted,
      dateStr: dateStr,
      room: activeSession.room || 'Room TBD',
      time: today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      presentCount,
      totalCount,
      attendanceRate: rate,
    };

    set({
      activeSession: {
        ...activeSession,
        status: 'ended',
      },
      historySessions: [newHistoryItem, ...historySessions],
    });

    // Notify backend session has ended
    facultyApi.endSession(activeSession.id).catch(console.warn);
  },
}));
