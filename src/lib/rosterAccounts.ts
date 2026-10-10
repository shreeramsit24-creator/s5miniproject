export interface RosterAccount {
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  identifier: string; // Roll No or Staff ID
  department: string;
  designationOrSemester: string;
  mentorOrGroup?: string;
  phone: string;
  password: string;
}

export const OFFICIAL_ROSTER_ACCOUNTS: RosterAccount[] = [
  // Institutional Administrator
  {
    name: 'System Administrator',
    email: 'admin@smartattendance.edu',
    role: 'admin',
    identifier: 'admin',
    department: 'Institutional Administration',
    designationOrSemester: 'Super Administrator',
    mentorOrGroup: 'System Authority',
    phone: '+91 98765 00001',
    password: 'Admin@1234',
  },

  // Official Institutional Faculty Accounts
  {
    name: 'Abi Siva',
    email: 'abisiva1822007@gmail.com',
    role: 'faculty',
    identifier: 'AK2625',
    department: 'Information Technology',
    designationOrSemester: 'Assistant Professor / Project Lead',
    mentorOrGroup: 'IT-A',
    phone: '+91 97873 80220',
    password: 'faculty123',
  },
  {
    name: 'SHREERAM S (santhiya)',
    email: 'itzmeshreerams967@gmail.com',
    role: 'faculty',
    identifier: 'IT1167',
    department: 'Information Technology',
    designationOrSemester: 'Associate Professor',
    mentorOrGroup: 'IT-A',
    phone: '+91 97519 22255',
    password: 'faculty123',
  },
  {
    name: 'Dr. Ramya',
    email: 'shreerams3150@gmail.com',
    role: 'faculty',
    identifier: 'CS1065',
    department: 'Computer Science and Engineering',
    designationOrSemester: 'Assistant Professor',
    mentorOrGroup: 'CSE-C',
    phone: '+91 93845 48757',
    password: 'faculty123',
  },
  {
    name: 'Mr. Stephen',
    email: 'shreerams6508@gmail.com',
    role: 'faculty',
    identifier: 'AD1229',
    department: 'Artificial Intelligence and Data Science',
    designationOrSemester: 'Assistant Professor',
    mentorOrGroup: 'AD-E',
    phone: '+91 99523 11733',
    password: 'faculty123',
  },
  {
    name: 'Mrs. Priya',
    email: 'itzshreerams967@gmail.com',
    role: 'faculty',
    identifier: 'CT1145',
    department: 'Computer Technology',
    designationOrSemester: 'Assistant Professor',
    mentorOrGroup: 'CT-F',
    phone: '+91 94888 78301',
    password: 'faculty123',
  },
  {
    name: 'Mr. Ramasamy',
    email: 'ramasamy208@gmail.com',
    role: 'faculty',
    identifier: 'IT1172',
    department: 'Information Technology',
    designationOrSemester: 'Assistant Professor',
    mentorOrGroup: 'IT-B',
    phone: '+91 63748 56128',
    password: 'faculty123',
  },
  {
    name: 'Mr. Ravikumar',
    email: 'ravi1708@gmail.com',
    role: 'faculty',
    identifier: 'AD1156',
    department: 'Artificial Intelligence and Data Science',
    designationOrSemester: 'Assistant Professor',
    mentorOrGroup: 'AD-H',
    phone: '+91 63859 61238',
    password: 'faculty123',
  },
  {
    name: 'Mrs. Kaviya',
    email: 'kaviya987@gmail.com',
    role: 'faculty',
    identifier: 'IT1149',
    department: 'Information Technology',
    designationOrSemester: 'Assistant Professor',
    mentorOrGroup: 'IT-G',
    phone: '+91 99861 53227',
    password: 'faculty123',
  },

  // Official Institutional Student Accounts
  {
    name: 'SIVAGOKUL C',
    email: 'sivagokulc18@gmail.com',
    role: 'student',
    identifier: '7376242IT303',
    department: 'Information Technology',
    designationOrSemester: 'Semester V (3rd Year)',
    mentorOrGroup: 'Abi Siva',
    phone: '+91 97873 80220',
    password: 'student123',
  },
  {
    name: 'Abi Siva (Student)',
    email: 'abisiva1822007@gmail.com',
    role: 'student',
    identifier: '7376242IT304',
    department: 'Information Technology',
    designationOrSemester: 'Semester V (3rd Year)',
    mentorOrGroup: 'Abi Siva',
    phone: '+91 97873 80220',
    password: 'student123',
  },
];

export const isAuthorizedRosterEmail = (emailOrId: string): boolean => {
  const clean = emailOrId.trim().toLowerCase();
  if (['admin', 'admin@smartattendance.edu', 'admin-01'].includes(clean)) return true;
  if (['faculty', 'ak2625', 'it1167', 'cs1065', 'ad1229', 'ct1145', 'it1172', 'ad1156', 'it1149'].includes(clean)) return true;
  if (['student', '7376242it303', '7376242it304'].includes(clean)) return true;
  return OFFICIAL_ROSTER_ACCOUNTS.some(
    (acc) =>
      acc.email.toLowerCase() === clean ||
      acc.identifier.toLowerCase() === clean
  );
};

export const getRosterAccount = (emailOrId: string, preferredRole?: string): RosterAccount | undefined => {
  const clean = emailOrId.trim().toLowerCase();

  // Shorthand keywords
  if (clean === 'admin' || clean === 'admin-01') {
    return OFFICIAL_ROSTER_ACCOUNTS.find((acc) => acc.role === 'admin');
  }
  if (clean === 'faculty' || clean === 'ak2625') {
    return OFFICIAL_ROSTER_ACCOUNTS.find((acc) => acc.role === 'faculty');
  }
  if (clean === 'student') {
    return OFFICIAL_ROSTER_ACCOUNTS.find((acc) => acc.role === 'student');
  }

  if (preferredRole) {
    const roleMatch = OFFICIAL_ROSTER_ACCOUNTS.find(
      (acc) =>
        acc.role === preferredRole &&
        (acc.email.toLowerCase() === clean || acc.identifier.toLowerCase() === clean)
    );
    if (roleMatch) return roleMatch;
  }

  return OFFICIAL_ROSTER_ACCOUNTS.find(
    (acc) =>
      acc.email.toLowerCase() === clean ||
      acc.identifier.toLowerCase() === clean
  );
};
