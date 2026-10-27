import { 
  Student, 
  Faculty, 
  Subject, 
  ClassSection, 
  TimetableSlot, 
  BookingSlot, 
  NotificationItem, 
  AdminSettings, 
  LeaveRequest, 
  FacultyLeaveRequest 
} from '../types';

export const emptyStudent: Student = {
  id: 'STU-2026-006',
  name: 'SIVAGOKUL C',
  rollNumber: '7376242IT303',
  department: 'Information Technology',
  year: 3,
  section: 'A',
  email: 'sivagokulc18@gmail.com',
  phone: '+91 97873 80220',
  faceIdStatus: 'enrolled',
  attendanceRate: 94.5,
  mentorId: 'FAC-001',
  mentorName: 'Prof. Abi Siva',
  semester: 'Semester V (3rd Year)',
};

export const emptyFaculty: Faculty = {
  id: 'FAC-001',
  name: 'Prof. Abi Siva',
  employeeId: 'AK2625',
  department: 'Information Technology',
  email: 'abisiva1822007@gmail.com',
  phone: '+91 97874 53421',
  designation: 'Assistant Professor / Project Lead',
  isMentor: true,
  mentorGroup: 'Year 3 - AI & DS (Sec A)',
  subjects: [
    'AI301 - Foundations of Machine Learning',
    'AI304 - Deep Learning Laboratory',
    'IT304 - Cloud Computing & Microservices'
  ],
  active: true,
};

export const defaultAdminUser = {
  id: 'ADM-001',
  name: 'Dr. S. Administrator',
  email: 'admin@classsure.edu',
  role: 'admin' as const,
  department: 'Academic Administration',
  phone: '+91 94432 10000',
  designation: 'Chief Academic Controller & System Admin',
};

export const initialStudents: Student[] = [
  {
    id: 'STU-2026-001',
    name: 'Gokul V',
    rollNumber: '7376242AD166',
    department: 'Artificial Intelligence and Data Science',
    year: 3,
    section: 'A',
    email: 'gokul.ad22@bitsathy.ac.in',
    phone: '+91 98421 56789',
    faceIdStatus: 'enrolled',
    attendanceRate: 94.2,
    mentorId: 'FAC-001',
    mentorName: 'Prof. Abi Siva',
    semester: 'Semester 5'
  },
  {
    id: 'STU-2026-002',
    name: 'Ananya Sharma',
    rollNumber: '7376242AD102',
    department: 'Artificial Intelligence and Data Science',
    year: 3,
    section: 'A',
    email: 'ananya.ad22@bitsathy.ac.in',
    phone: '+91 98421 11223',
    faceIdStatus: 'enrolled',
    attendanceRate: 96.5,
    mentorId: 'FAC-001',
    mentorName: 'Prof. Abi Siva',
    semester: 'Semester 5'
  },
  {
    id: 'STU-2026-003',
    name: 'Dinesh Kumar',
    rollNumber: '7376242AD115',
    department: 'Artificial Intelligence and Data Science',
    year: 3,
    section: 'A',
    email: 'dinesh.ad22@bitsathy.ac.in',
    phone: '+91 98421 33445',
    faceIdStatus: 'enrolled',
    attendanceRate: 88.0,
    mentorId: 'FAC-001',
    mentorName: 'Prof. Abi Siva',
    semester: 'Semester 5'
  },
  {
    id: 'STU-2026-004',
    name: 'Harini Rajendran',
    rollNumber: '7376242AD128',
    department: 'Artificial Intelligence and Data Science',
    year: 3,
    section: 'A',
    email: 'harini.ad22@bitsathy.ac.in',
    phone: '+91 98421 55667',
    faceIdStatus: 'enrolled',
    attendanceRate: 97.8,
    mentorId: 'FAC-001',
    mentorName: 'Prof. Abi Siva',
    semester: 'Semester 5'
  },
  {
    id: 'STU-2026-005',
    name: 'Karthik Raja M',
    rollNumber: '7376242AD140',
    department: 'Artificial Intelligence and Data Science',
    year: 3,
    section: 'B',
    email: 'karthik.ad22@bitsathy.ac.in',
    phone: '+91 98421 77889',
    faceIdStatus: 'enrolled',
    attendanceRate: 91.4,
    mentorId: 'FAC-002',
    mentorName: 'Dr. K. Ramesh',
    semester: 'Semester 5'
  },
  {
    id: 'STU-2026-006',
    name: 'SIVAGOKUL C',
    rollNumber: '7376242IT303',
    department: 'Information Technology',
    year: 3,
    section: 'A',
    email: 'sivagokulc18@gmail.com',
    phone: '+91 97873 80220',
    faceIdStatus: 'enrolled',
    attendanceRate: 94.5,
    mentorId: 'FAC-001',
    mentorName: 'Prof. Abi Siva',
    semester: 'Semester V (3rd Year)'
  },
  {
    id: 'STU-2026-006B',
    name: 'Abi Siva (Student)',
    rollNumber: '7376242IT304',
    department: 'Information Technology',
    year: 3,
    section: 'A',
    email: 'abisiva1822007@gmail.com',
    phone: '+91 97873 80220',
    faceIdStatus: 'enrolled',
    attendanceRate: 96.0,
    mentorId: 'FAC-001',
    mentorName: 'Prof. Abi Siva',
    semester: 'Semester V (3rd Year)'
  },
  {
    id: 'STU-2026-007',
    name: 'Sneha Venkatesh',
    rollNumber: '7376242IT345',
    department: 'Information Technology',
    year: 3,
    section: 'A',
    email: 'sneha.it22@bitsathy.ac.in',
    phone: '+91 97890 44556',
    faceIdStatus: 'enrolled',
    attendanceRate: 95.0,
    mentorId: 'FAC-001',
    mentorName: 'Prof. Abi Siva',
    semester: 'Semester 5'
  },
  {
    id: 'STU-2026-008',
    name: 'Rahul Mukundhan',
    rollNumber: '7376242CS201',
    department: 'Computer Science and Engineering',
    year: 3,
    section: 'A',
    email: 'rahul.cs22@bitsathy.ac.in',
    phone: '+91 99401 12345',
    faceIdStatus: 'enrolled',
    attendanceRate: 89.5,
    mentorId: 'FAC-003',
    mentorName: 'Dr. M. Priya',
    semester: 'Semester 5'
  },
  {
    id: 'STU-2026-009',
    name: 'Divya Bharathi S',
    rollNumber: '7376242CS224',
    department: 'Computer Science and Engineering',
    year: 3,
    section: 'A',
    email: 'divya.cs22@bitsathy.ac.in',
    phone: '+91 99401 67890',
    faceIdStatus: 'enrolled',
    attendanceRate: 98.2,
    mentorId: 'FAC-003',
    mentorName: 'Dr. M. Priya',
    semester: 'Semester 5'
  },
  {
    id: 'STU-2026-010',
    name: 'Sanjay Krishnan',
    rollNumber: '7376242EC108',
    department: 'Electronics and Communication Engineering',
    year: 3,
    section: 'A',
    email: 'sanjay.ec22@bitsathy.ac.in',
    phone: '+91 96291 99887',
    faceIdStatus: 'enrolled',
    attendanceRate: 90.7,
    mentorId: 'FAC-004',
    mentorName: 'Prof. R. Karthik',
    semester: 'Semester 5'
  }
];

export const initialFaculty: Faculty[] = [
  {
    id: 'FAC-001',
    name: 'Prof. Abi Siva',
    employeeId: 'AK2625',
    department: 'Information Technology',
    email: 'abisiva1822007@gmail.com',
    phone: '+91 97874 53421',
    designation: 'Assistant Professor / Project Lead',
    isMentor: true,
    mentorGroup: 'Year 3 - AI & DS (Sec A)',
    subjects: [
      'AI301 - Foundations of Machine Learning',
      'AI304 - Deep Learning Laboratory',
      'IT304 - Cloud Computing & Microservices'
    ],
    active: true
  },
  {
    id: 'FAC-002',
    name: 'Dr. K. Ramesh',
    employeeId: 'EMP-9021',
    department: 'Artificial Intelligence and Data Science',
    email: 'ramesh.ai@bitsathy.ac.in',
    phone: '+91 94433 12121',
    designation: 'Professor & Head of Department',
    isMentor: true,
    mentorGroup: 'Year 3 - AI & DS (Sec B)',
    subjects: [
      'AI302 - Deep Learning & Neural Networks',
      'AI303 - Natural Language Processing'
    ],
    active: true
  },
  {
    id: 'FAC-003',
    name: 'Dr. M. Priya',
    employeeId: 'EMP-7812',
    department: 'Computer Science and Engineering',
    email: 'priya.cse@bitsathy.ac.in',
    phone: '+91 94433 34343',
    designation: 'Associate Professor',
    isMentor: true,
    mentorGroup: 'Year 3 - CSE (Sec A)',
    subjects: [
      'CS305 - High-Performance Distributed Databases',
      'CS308 - Compiler Design'
    ],
    active: true
  },
  {
    id: 'FAC-004',
    name: 'Prof. R. Karthik',
    employeeId: 'EMP-6540',
    department: 'Electronics and Communication Engineering',
    email: 'karthik.ece@bitsathy.ac.in',
    phone: '+91 94433 56565',
    designation: 'Assistant Professor (Senior Grade)',
    isMentor: true,
    mentorGroup: 'Year 3 - ECE (Sec A)',
    subjects: [
      'EC306 - IoT & BLE Wireless Sensor Networks',
      'EC309 - Embedded Edge Computing'
    ],
    active: true
  },
  {
    id: 'FAC-005',
    name: 'Dr. S. Kavitha',
    employeeId: 'EMP-5120',
    department: 'Humanities and Science',
    email: 'kavitha.hs@bitsathy.ac.in',
    phone: '+91 94433 78787',
    designation: 'Associate Professor',
    isMentor: false,
    subjects: [
      'HS307 - Professional Ethics & Academic Writing'
    ],
    active: true
  }
];

export const initialSubjects: Subject[] = [
  {
    id: 'SUB-001',
    name: 'Foundations of Machine Learning',
    code: 'AI301',
    credits: 4,
    department: 'Artificial Intelligence and Data Science',
    assignedFacultyIds: ['FAC-001'],
    assignedClassIds: ['SEC-AI-3A', 'SEC-AI-3B']
  },
  {
    id: 'SUB-002',
    name: 'Deep Learning & Neural Networks',
    code: 'AI302',
    credits: 4,
    department: 'Artificial Intelligence and Data Science',
    assignedFacultyIds: ['FAC-002'],
    assignedClassIds: ['SEC-AI-3A', 'SEC-AI-3B']
  },
  {
    id: 'SUB-003',
    name: 'Natural Language Processing',
    code: 'AI303',
    credits: 3,
    department: 'Artificial Intelligence and Data Science',
    assignedFacultyIds: ['FAC-002'],
    assignedClassIds: ['SEC-AI-3A']
  },
  {
    id: 'SUB-004',
    name: 'Deep Learning Laboratory',
    code: 'AI304',
    credits: 2,
    department: 'Artificial Intelligence and Data Science',
    assignedFacultyIds: ['FAC-001'],
    assignedClassIds: ['SEC-AI-3A']
  },
  {
    id: 'SUB-005',
    name: 'Cloud Computing & Microservices',
    code: 'IT304',
    credits: 3,
    department: 'Information Technology',
    assignedFacultyIds: ['FAC-001'],
    assignedClassIds: ['SEC-IT-3A', 'SEC-AI-3A']
  },
  {
    id: 'SUB-006',
    name: 'High-Performance Distributed Databases',
    code: 'CS305',
    credits: 3,
    department: 'Computer Science and Engineering',
    assignedFacultyIds: ['FAC-003'],
    assignedClassIds: ['SEC-CS-3A']
  },
  {
    id: 'SUB-007',
    name: 'IoT & BLE Wireless Sensor Networks',
    code: 'EC306',
    credits: 3,
    department: 'Electronics and Communication Engineering',
    assignedFacultyIds: ['FAC-004'],
    assignedClassIds: ['SEC-AI-3A', 'SEC-EC-3A']
  },
  {
    id: 'SUB-008',
    name: 'Professional Ethics & Academic Writing',
    code: 'HS307',
    credits: 2,
    department: 'Humanities and Science',
    assignedFacultyIds: ['FAC-005'],
    assignedClassIds: ['SEC-AI-3A', 'SEC-IT-3A']
  }
];

export const initialClassSections: ClassSection[] = [
  {
    id: 'SEC-AI-3A',
    name: 'AI & DS - Year 3 (Section A)',
    department: 'Artificial Intelligence and Data Science',
    year: 3,
    section: 'A',
    studentCount: 64,
    subjectFacultyMap: [
      { subjectId: 'SUB-001', facultyId: 'FAC-001' },
      { subjectId: 'SUB-002', facultyId: 'FAC-002' },
      { subjectId: 'SUB-003', facultyId: 'FAC-002' },
      { subjectId: 'SUB-004', facultyId: 'FAC-001' },
      { subjectId: 'SUB-005', facultyId: 'FAC-001' },
      { subjectId: 'SUB-007', facultyId: 'FAC-004' }
    ]
  },
  {
    id: 'SEC-AI-3B',
    name: 'AI & DS - Year 3 (Section B)',
    department: 'Artificial Intelligence and Data Science',
    year: 3,
    section: 'B',
    studentCount: 62,
    subjectFacultyMap: [
      { subjectId: 'SUB-001', facultyId: 'FAC-001' },
      { subjectId: 'SUB-002', facultyId: 'FAC-002' }
    ]
  },
  {
    id: 'SEC-IT-3A',
    name: 'IT - Year 3 (Section A)',
    department: 'Information Technology',
    year: 3,
    section: 'A',
    studentCount: 60,
    subjectFacultyMap: [
      { subjectId: 'SUB-005', facultyId: 'FAC-001' },
      { subjectId: 'SUB-008', facultyId: 'FAC-005' }
    ]
  },
  {
    id: 'SEC-CS-3A',
    name: 'CSE - Year 3 (Section A)',
    department: 'Computer Science and Engineering',
    year: 3,
    section: 'A',
    studentCount: 65,
    subjectFacultyMap: [
      { subjectId: 'SUB-006', facultyId: 'FAC-003' }
    ]
  },
  {
    id: 'SEC-EC-3A',
    name: 'ECE - Year 3 (Section A)',
    department: 'Electronics and Communication Engineering',
    year: 3,
    section: 'A',
    studentCount: 60,
    subjectFacultyMap: [
      { subjectId: 'SUB-007', facultyId: 'FAC-004' }
    ]
  }
];

export const initialTimetable: TimetableSlot[] = [
  // Monday
  {
    id: 'SLOT-MON-1',
    day: 'Mon',
    startTime: '08:45',
    endTime: '09:35',
    period: 1,
    subjectId: 'SUB-001',
    subjectCode: 'AI301',
    subjectName: 'Foundations of Machine Learning',
    facultyId: 'FAC-001',
    facultyName: 'Prof. Abi Siva',
    classSectionId: 'SEC-AI-3A',
    classSectionName: 'AI & DS - Year 3 (Section A)',
    room: 'AI Lab 304',
    color: 'border-l-4 border-indigo-600'
  },
  {
    id: 'SLOT-MON-2',
    day: 'Mon',
    startTime: '09:35',
    endTime: '10:25',
    period: 2,
    subjectId: 'SUB-002',
    subjectCode: 'AI302',
    subjectName: 'Deep Learning & Neural Networks',
    facultyId: 'FAC-002',
    facultyName: 'Dr. K. Ramesh',
    classSectionId: 'SEC-AI-3A',
    classSectionName: 'AI & DS - Year 3 (Section A)',
    room: 'Hall B-201',
    color: 'border-l-4 border-teal-600'
  },
  {
    id: 'SLOT-MON-3',
    day: 'Mon',
    startTime: '10:45',
    endTime: '11:35',
    period: 3,
    subjectId: 'SUB-005',
    subjectCode: 'IT304',
    subjectName: 'Cloud Computing & Microservices',
    facultyId: 'FAC-001',
    facultyName: 'Prof. Abi Siva',
    classSectionId: 'SEC-AI-3A',
    classSectionName: 'AI & DS - Year 3 (Section A)',
    room: 'Turing Hall 102',
    color: 'border-l-4 border-violet-600'
  },
  {
    id: 'SLOT-MON-4',
    day: 'Mon',
    startTime: '11:35',
    endTime: '12:25',
    period: 4,
    subjectId: 'SUB-007',
    subjectCode: 'EC306',
    subjectName: 'IoT & BLE Wireless Sensor Networks',
    facultyId: 'FAC-004',
    facultyName: 'Prof. R. Karthik',
    classSectionId: 'SEC-AI-3A',
    classSectionName: 'AI & DS - Year 3 (Section A)',
    room: 'Sensor Lab 105',
    color: 'border-l-4 border-amber-600'
  },
  {
    id: 'SLOT-MON-5',
    day: 'Mon',
    startTime: '13:30',
    endTime: '15:10',
    period: 5,
    subjectId: 'SUB-004',
    subjectCode: 'AI304',
    subjectName: 'Deep Learning Laboratory',
    facultyId: 'FAC-001',
    facultyName: 'Prof. Abi Siva',
    classSectionId: 'SEC-AI-3A',
    classSectionName: 'AI & DS - Year 3 (Section A)',
    room: 'AI Center Lab 304',
    color: 'border-l-4 border-emerald-600'
  },

  // Tuesday
  {
    id: 'SLOT-TUE-1',
    day: 'Tue',
    startTime: '08:45',
    endTime: '09:35',
    period: 1,
    subjectId: 'SUB-003',
    subjectCode: 'AI303',
    subjectName: 'Natural Language Processing',
    facultyId: 'FAC-002',
    facultyName: 'Dr. K. Ramesh',
    classSectionId: 'SEC-AI-3A',
    classSectionName: 'AI & DS - Year 3 (Section A)',
    room: 'Hall B-201',
    color: 'border-l-4 border-blue-600'
  },
  {
    id: 'SLOT-TUE-2',
    day: 'Tue',
    startTime: '09:35',
    endTime: '10:25',
    period: 2,
    subjectId: 'SUB-001',
    subjectCode: 'AI301',
    subjectName: 'Foundations of Machine Learning',
    facultyId: 'FAC-001',
    facultyName: 'Prof. Abi Siva',
    classSectionId: 'SEC-AI-3A',
    classSectionName: 'AI & DS - Year 3 (Section A)',
    room: 'AI Lab 304',
    color: 'border-l-4 border-indigo-600'
  },
  {
    id: 'SLOT-TUE-3',
    day: 'Tue',
    startTime: '10:45',
    endTime: '11:35',
    period: 3,
    subjectId: 'SUB-002',
    subjectCode: 'AI302',
    subjectName: 'Deep Learning & Neural Networks',
    facultyId: 'FAC-002',
    facultyName: 'Dr. K. Ramesh',
    classSectionId: 'SEC-AI-3A',
    classSectionName: 'AI & DS - Year 3 (Section A)',
    room: 'Hall B-201',
    color: 'border-l-4 border-teal-600'
  },
  {
    id: 'SLOT-TUE-4',
    day: 'Tue',
    startTime: '11:35',
    endTime: '12:25',
    period: 4,
    subjectId: 'SUB-008',
    subjectCode: 'HS307',
    subjectName: 'Professional Ethics & Academic Writing',
    facultyId: 'FAC-005',
    facultyName: 'Dr. S. Kavitha',
    classSectionId: 'SEC-AI-3A',
    classSectionName: 'AI & DS - Year 3 (Section A)',
    room: 'Seminar Hall 2',
    color: 'border-l-4 border-rose-600'
  },

  // Wednesday
  {
    id: 'SLOT-WED-1',
    day: 'Wed',
    startTime: '08:45',
    endTime: '09:35',
    period: 1,
    subjectId: 'SUB-001',
    subjectCode: 'AI301',
    subjectName: 'Foundations of Machine Learning',
    facultyId: 'FAC-001',
    facultyName: 'Prof. Abi Siva',
    classSectionId: 'SEC-AI-3A',
    classSectionName: 'AI & DS - Year 3 (Section A)',
    room: 'AI Lab 304',
    color: 'border-l-4 border-indigo-600'
  },
  {
    id: 'SLOT-WED-2',
    day: 'Wed',
    startTime: '09:35',
    endTime: '10:25',
    period: 2,
    subjectId: 'SUB-005',
    subjectCode: 'IT304',
    subjectName: 'Cloud Computing & Microservices',
    facultyId: 'FAC-001',
    facultyName: 'Prof. Abi Siva',
    classSectionId: 'SEC-AI-3A',
    classSectionName: 'AI & DS - Year 3 (Section A)',
    room: 'Turing Hall 102',
    color: 'border-l-4 border-violet-600'
  },
  {
    id: 'SLOT-WED-3',
    day: 'Wed',
    startTime: '10:45',
    endTime: '11:35',
    period: 3,
    subjectId: 'SUB-003',
    subjectCode: 'AI303',
    subjectName: 'Natural Language Processing',
    facultyId: 'FAC-002',
    facultyName: 'Dr. K. Ramesh',
    classSectionId: 'SEC-AI-3A',
    classSectionName: 'AI & DS - Year 3 (Section A)',
    room: 'Hall B-201',
    color: 'border-l-4 border-blue-600'
  },
  {
    id: 'SLOT-WED-4',
    day: 'Wed',
    startTime: '11:35',
    endTime: '12:25',
    period: 4,
    subjectId: 'SUB-007',
    subjectCode: 'EC306',
    subjectName: 'IoT & BLE Wireless Sensor Networks',
    facultyId: 'FAC-004',
    facultyName: 'Prof. R. Karthik',
    classSectionId: 'SEC-AI-3A',
    classSectionName: 'AI & DS - Year 3 (Section A)',
    room: 'Sensor Lab 105',
    color: 'border-l-4 border-amber-600'
  },

  // Thursday
  {
    id: 'SLOT-THU-1',
    day: 'Thu',
    startTime: '08:45',
    endTime: '09:35',
    period: 1,
    subjectId: 'SUB-002',
    subjectCode: 'AI302',
    subjectName: 'Deep Learning & Neural Networks',
    facultyId: 'FAC-002',
    facultyName: 'Dr. K. Ramesh',
    classSectionId: 'SEC-AI-3A',
    classSectionName: 'AI & DS - Year 3 (Section A)',
    room: 'Hall B-201',
    color: 'border-l-4 border-teal-600'
  },
  {
    id: 'SLOT-THU-2',
    day: 'Thu',
    startTime: '09:35',
    endTime: '10:25',
    period: 2,
    subjectId: 'SUB-003',
    subjectCode: 'AI303',
    subjectName: 'Natural Language Processing',
    facultyId: 'FAC-002',
    facultyName: 'Dr. K. Ramesh',
    classSectionId: 'SEC-AI-3A',
    classSectionName: 'AI & DS - Year 3 (Section A)',
    room: 'Hall B-201',
    color: 'border-l-4 border-blue-600'
  },
  {
    id: 'SLOT-THU-3',
    day: 'Thu',
    startTime: '10:45',
    endTime: '11:35',
    period: 3,
    subjectId: 'SUB-001',
    subjectCode: 'AI301',
    subjectName: 'Foundations of Machine Learning',
    facultyId: 'FAC-001',
    facultyName: 'Prof. Abi Siva',
    classSectionId: 'SEC-AI-3A',
    classSectionName: 'AI & DS - Year 3 (Section A)',
    room: 'AI Lab 304',
    color: 'border-l-4 border-indigo-600'
  },
  {
    id: 'SLOT-THU-4',
    day: 'Thu',
    startTime: '13:30',
    endTime: '15:10',
    period: 5,
    subjectId: 'SUB-007',
    subjectCode: 'EC306',
    subjectName: 'IoT & BLE Sensor Laboratory',
    facultyId: 'FAC-004',
    facultyName: 'Prof. R. Karthik',
    classSectionId: 'SEC-AI-3A',
    classSectionName: 'AI & DS - Year 3 (Section A)',
    room: 'Hardware IoT Lab 108',
    color: 'border-l-4 border-amber-600'
  },

  // Friday
  {
    id: 'SLOT-FRI-1',
    day: 'Fri',
    startTime: '08:45',
    endTime: '09:35',
    period: 1,
    subjectId: 'SUB-005',
    subjectCode: 'IT304',
    subjectName: 'Cloud Computing & Microservices',
    facultyId: 'FAC-001',
    facultyName: 'Prof. Abi Siva',
    classSectionId: 'SEC-AI-3A',
    classSectionName: 'AI & DS - Year 3 (Section A)',
    room: 'Turing Hall 102',
    color: 'border-l-4 border-violet-600'
  },
  {
    id: 'SLOT-FRI-2',
    day: 'Fri',
    startTime: '09:35',
    endTime: '10:25',
    period: 2,
    subjectId: 'SUB-002',
    subjectCode: 'AI302',
    subjectName: 'Deep Learning & Neural Networks',
    facultyId: 'FAC-002',
    facultyName: 'Dr. K. Ramesh',
    classSectionId: 'SEC-AI-3A',
    classSectionName: 'AI & DS - Year 3 (Section A)',
    room: 'Hall B-201',
    color: 'border-l-4 border-teal-600'
  },
  {
    id: 'SLOT-FRI-3',
    day: 'Fri',
    startTime: '10:45',
    endTime: '11:35',
    period: 3,
    subjectId: 'SUB-001',
    subjectCode: 'AI301',
    subjectName: 'Foundations of Machine Learning',
    facultyId: 'FAC-001',
    facultyName: 'Prof. Abi Siva',
    classSectionId: 'SEC-AI-3A',
    classSectionName: 'AI & DS - Year 3 (Section A)',
    room: 'AI Lab 304',
    color: 'border-l-4 border-indigo-600'
  },
  {
    id: 'SLOT-FRI-4',
    day: 'Fri',
    startTime: '11:35',
    endTime: '12:25',
    period: 4,
    subjectId: 'SUB-008',
    subjectCode: 'HS307',
    subjectName: 'Professional Ethics & Academic Writing',
    facultyId: 'FAC-005',
    facultyName: 'Dr. S. Kavitha',
    classSectionId: 'SEC-AI-3A',
    classSectionName: 'AI & DS - Year 3 (Section A)',
    room: 'Seminar Hall 2',
    color: 'border-l-4 border-rose-600'
  },

  // Saturday
  {
    id: 'SLOT-SAT-1',
    day: 'Sat',
    startTime: '08:45',
    endTime: '10:25',
    period: 1,
    subjectId: 'SUB-004',
    subjectCode: 'AI304',
    subjectName: 'Project Research & Capstone Lab',
    facultyId: 'FAC-001',
    facultyName: 'Prof. Abi Siva',
    classSectionId: 'SEC-AI-3A',
    classSectionName: 'AI & DS - Year 3 (Section A)',
    room: 'AI Center Lab 304',
    color: 'border-l-4 border-indigo-600'
  },
  {
    id: 'SLOT-SAT-2',
    day: 'Sat',
    startTime: '10:45',
    endTime: '12:25',
    period: 3,
    subjectId: 'SUB-003',
    subjectCode: 'AI303',
    subjectName: 'NLP Semantic Models Workshop',
    facultyId: 'FAC-002',
    facultyName: 'Dr. K. Ramesh',
    classSectionId: 'SEC-AI-3A',
    classSectionName: 'AI & DS - Year 3 (Section A)',
    room: 'Hall B-201',
    color: 'border-l-4 border-teal-600'
  },

  // Information Technology - Year 3 (Section A) Schedule
  {
    id: 'SLOT-IT-MON-1',
    day: 'Mon',
    startTime: '08:45',
    endTime: '09:35',
    period: 1,
    subjectId: 'SUB-005',
    subjectCode: 'IT304',
    subjectName: 'Cloud Computing & Microservices',
    facultyId: 'FAC-001',
    facultyName: 'Prof. Abi Siva',
    classSectionId: 'SEC-IT-3A',
    classSectionName: 'IT - Year 3 (Section A)',
    room: 'Turing Hall 102',
    color: 'border-l-4 border-teal-600'
  },
  {
    id: 'SLOT-IT-MON-2',
    day: 'Mon',
    startTime: '09:35',
    endTime: '10:25',
    period: 2,
    subjectId: 'SUB-008',
    subjectCode: 'HS307',
    subjectName: 'Professional Ethics & Academic Writing',
    facultyId: 'FAC-005',
    facultyName: 'Dr. S. Kavitha',
    classSectionId: 'SEC-IT-3A',
    classSectionName: 'IT - Year 3 (Section A)',
    room: 'Seminar Hall 2',
    color: 'border-l-4 border-rose-600'
  },
  {
    id: 'SLOT-IT-TUE-1',
    day: 'Tue',
    startTime: '08:45',
    endTime: '09:35',
    period: 1,
    subjectId: 'SUB-005',
    subjectCode: 'IT304',
    subjectName: 'Cloud Computing & Microservices',
    facultyId: 'FAC-001',
    facultyName: 'Prof. Abi Siva',
    classSectionId: 'SEC-IT-3A',
    classSectionName: 'IT - Year 3 (Section A)',
    room: 'Turing Hall 102',
    color: 'border-l-4 border-teal-600'
  },
  {
    id: 'SLOT-IT-WED-1',
    day: 'Wed',
    startTime: '09:35',
    endTime: '10:25',
    period: 2,
    subjectId: 'SUB-005',
    subjectCode: 'IT304',
    subjectName: 'Cloud Computing & Microservices',
    facultyId: 'FAC-001',
    facultyName: 'Prof. Abi Siva',
    classSectionId: 'SEC-IT-3A',
    classSectionName: 'IT - Year 3 (Section A)',
    room: 'Turing Hall 102',
    color: 'border-l-4 border-teal-600'
  },
  {
    id: 'SLOT-IT-THU-1',
    day: 'Thu',
    startTime: '10:45',
    endTime: '11:35',
    period: 3,
    subjectId: 'SUB-005',
    subjectCode: 'IT304',
    subjectName: 'Cloud Computing & Microservices',
    facultyId: 'FAC-001',
    facultyName: 'Prof. Abi Siva',
    classSectionId: 'SEC-IT-3A',
    classSectionName: 'IT - Year 3 (Section A)',
    room: 'Turing Hall 102',
    color: 'border-l-4 border-teal-600'
  },
  {
    id: 'SLOT-IT-FRI-1',
    day: 'Fri',
    startTime: '08:45',
    endTime: '09:35',
    period: 1,
    subjectId: 'SUB-005',
    subjectCode: 'IT304',
    subjectName: 'Cloud Computing & Microservices',
    facultyId: 'FAC-001',
    facultyName: 'Prof. Abi Siva',
    classSectionId: 'SEC-IT-3A',
    classSectionName: 'IT - Year 3 (Section A)',
    room: 'Turing Hall 102',
    color: 'border-l-4 border-teal-600'
  },
  {
    id: 'SLOT-IT-SAT-1',
    day: 'Sat',
    startTime: '08:45',
    endTime: '10:25',
    period: 1,
    subjectId: 'SUB-005',
    subjectCode: 'IT304',
    subjectName: 'Cloud DevOps & Systems Laboratory',
    facultyId: 'FAC-001',
    facultyName: 'Prof. Abi Siva',
    classSectionId: 'SEC-IT-3A',
    classSectionName: 'IT - Year 3 (Section A)',
    room: 'IT Center Lab 3',
    color: 'border-l-4 border-teal-600'
  }
];

export const dbWeeklyTimetableCatalog: TimetableSlot[] = [...initialTimetable];

export const initialBookings: BookingSlot[] = [
  {
    id: 'BOOK-001',
    subjectName: 'Foundations of Machine Learning',
    facultyName: 'Prof. Abi Siva',
    room: 'AI Lab 304',
    date: new Date().toISOString().split('T')[0],
    time: '08:45 AM - 09:35 AM',
    totalSeats: 64,
    bookedSeats: 61,
    studentIds: ['STU-2026-001', 'STU-2026-002', 'STU-2026-003', 'STU-2026-004']
  },
  {
    id: 'BOOK-002',
    subjectName: 'Deep Learning & Neural Networks',
    facultyName: 'Dr. K. Ramesh',
    room: 'Hall B-201',
    date: new Date().toISOString().split('T')[0],
    time: '09:35 AM - 10:25 AM',
    totalSeats: 64,
    bookedSeats: 59,
    studentIds: ['STU-2026-001', 'STU-2026-002']
  },
  {
    id: 'BOOK-003',
    subjectName: 'Cloud Computing & Microservices',
    facultyName: 'Prof. Abi Siva',
    room: 'Turing Hall 102',
    date: new Date().toISOString().split('T')[0],
    time: '10:45 AM - 11:35 AM',
    totalSeats: 60,
    bookedSeats: 58,
    studentIds: ['STU-2026-001', 'STU-2026-006', 'STU-2026-007']
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'NOTIF-001',
    title: 'BLE Micro-Beacon Authenticated',
    body: 'ESP32_AI304_BEACON signal locked at -62 dBm (1.4m proximity). Physical attendance valid.',
    category: 'today',
    read: false,
    accentColor: 'indigo',
    timestamp: 'Just now'
  },
  {
    id: 'NOTIF-002',
    title: 'Attendance Verified • 94.2%',
    body: 'Presence verified for Foundations of Machine Learning with Prof. Abi Siva.',
    category: 'today',
    read: false,
    accentColor: 'emerald',
    timestamp: '08:52 AM'
  },
  {
    id: 'NOTIF-003',
    title: 'On-Duty (OD) Approved',
    body: 'Mentor Prof. Abi Siva approved your Smart India Hackathon participation credit.',
    category: 'this_week',
    read: true,
    accentColor: 'emerald',
    timestamp: 'Yesterday'
  },
  {
    id: 'NOTIF-004',
    title: 'Upcoming Timetable Schedule',
    body: 'Deep Learning Laboratory scheduled in AI Center Lab 304 tomorrow at 1:30 PM.',
    category: 'this_week',
    read: true,
    accentColor: 'amber',
    timestamp: '2 days ago'
  }
];

export const defaultSettings: AdminSettings = {
  bleSignalRange: 15,
  bleRssiThreshold: -75,
  faceConfidenceThreshold: 85,
  livenessCheckEnabled: true,
  autoSyncOffline: true,
  facultyManualOverrideAllowed: true
};

export const initialLeaves: LeaveRequest[] = [
  {
    id: 'LV-2026-001',
    studentId: 'STU-2026-001',
    studentName: 'Gokul V',
    rollNumber: '7376242AD166',
    department: 'Artificial Intelligence and Data Science',
    mentorId: 'FAC-001',
    mentorName: 'Prof. Abi Siva',
    leaveType: 'On-Duty (OD)',
    startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startSession: 'FN',
    endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    endSession: 'AN',
    daysCount: 2,
    isHalfDay: false,
    reason: 'Smart India Hackathon Grand Finale participation representing college AI Team.',
    status: 'pending',
    appliedAt: 'Today, 08:30 AM',
    reviewComment: 'Under review by mentor Prof. Abi Siva'
  },
  {
    id: 'LV-2026-002',
    studentId: 'STU-2026-002',
    studentName: 'Ananya Sharma',
    rollNumber: '7376242AD102',
    department: 'Artificial Intelligence and Data Science',
    mentorId: 'FAC-001',
    mentorName: 'Prof. Abi Siva',
    leaveType: 'Academic / Conference',
    startDate: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    startSession: 'FN',
    endDate: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    endSession: 'AN',
    daysCount: 1,
    isHalfDay: false,
    reason: 'IEEE International Conference oral paper presentation on Neural Edge Architectures.',
    status: 'approved',
    appliedAt: '3 days ago',
    reviewComment: 'Certificate verified. Full attendance credit awarded.'
  },
  {
    id: 'LV-2026-003',
    studentId: 'STU-2026-003',
    studentName: 'Dinesh Kumar',
    rollNumber: '7376242AD115',
    department: 'Artificial Intelligence and Data Science',
    mentorId: 'FAC-001',
    mentorName: 'Prof. Abi Siva',
    leaveType: 'Medical Leave',
    startDate: new Date(Date.now() - 86400000 * 7).toISOString().split('T')[0],
    startSession: 'FN',
    endDate: new Date(Date.now() - 86400000 * 6).toISOString().split('T')[0],
    endSession: 'AN',
    daysCount: 2,
    isHalfDay: false,
    reason: 'Viral fever rest per physician medical advice.',
    status: 'approved',
    appliedAt: 'Last week',
    reviewComment: 'Medical certificate approved.'
  },
  {
    id: 'LV-2026-004',
    studentId: 'STU-2026-006',
    studentName: 'SIVAGOKUL C',
    rollNumber: '7376242IT303',
    department: 'Information Technology',
    mentorId: 'FAC-001',
    mentorName: 'Prof. Abi Siva',
    leaveType: 'On-Duty (OD)',
    startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    startSession: 'FN',
    endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    endSession: 'AN',
    daysCount: 2,
    isHalfDay: false,
    reason: 'Smart India Hackathon Grand Finale participation representing college AI & Cloud Team.',
    status: 'pending',
    appliedAt: 'Today, 08:30 AM',
    reviewComment: 'Under review by mentor Prof. Abi Siva'
  }
];

export const initialFacultyLeaves: FacultyLeaveRequest[] = [
  {
    id: 'FAC-LV-001',
    facultyId: 'FAC-001',
    facultyName: 'Prof. Abi Siva',
    employeeId: 'AK2625',
    department: 'Information Technology',
    leaveType: 'Academic / Conference',
    startDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
    startSession: 'FN',
    endDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
    endSession: 'AN',
    daysCount: 2,
    isHalfDay: false,
    reason: 'Keynote Speaker at National AI & IoT Summit, IIT Madras.',
    status: 'pending',
    appliedAt: 'Yesterday, 04:15 PM',
    substituteFacultyId: 'FAC-002',
    substituteFacultyName: 'Dr. K. Ramesh',
    affectedSubjects: ['AI301 - Foundations of Machine Learning'],
    reviewComment: 'Substitute confirmed by Dr. K. Ramesh'
  }
];
