export interface DepartmentOption {
  code: string;
  name: string;
  shortLabel: string;
  badgeColor?: string;
}

// Canonical department definitions and aliases
export const KNOWN_DEPARTMENTS: Record<string, { code: string; name: string; shortLabel: string; aliases: string[]; badgeColor: string }> = {
  IT: {
    code: 'IT',
    name: 'Information Technology',
    shortLabel: 'IT',
    badgeColor: 'teal',
    aliases: ['it', 'information technology', 'b.tech it', 'b.tech. it', 'infotech', '22it']
  },
  CSE: {
    code: 'CSE',
    name: 'Computer Science and Engineering',
    shortLabel: 'CSE',
    badgeColor: 'indigo',
    aliases: ['cse', 'computer science', 'computer science and engineering', 'b.e cse', 'b.e. cse', 'cs', 'comp sci', '22cs']
  },
  AD: {
    code: 'AD',
    name: 'Artificial Intelligence & Data Science',
    shortLabel: 'AD',
    badgeColor: 'violet',
    aliases: ['ad', 'ai&ds', 'ai & ds', 'aids', 'ai-ds', 'ai/ds', 'artificial intelligence', 'artificial intelligence and data science', 'artificial intelligence & data science', '22ad', 'ai']
  },
  ECE: {
    code: 'ECE',
    name: 'Electronics & Communication Engineering',
    shortLabel: 'ECE',
    badgeColor: 'amber',
    aliases: ['ece', 'electronics and communication engineering', 'electronics & communication engineering', 'electronics', 'ec', '22ec']
  },
  EEE: {
    code: 'EEE',
    name: 'Electrical & Electronics Engineering',
    shortLabel: 'EEE',
    badgeColor: 'blue',
    aliases: ['eee', 'electrical and electronics engineering', 'electrical & electronics engineering', 'electrical', 'ee', '22ee']
  },
  MECH: {
    code: 'MECH',
    name: 'Mechanical Engineering',
    shortLabel: 'MECH',
    badgeColor: 'orange',
    aliases: ['mech', 'mechanical', 'mechanical engineering', '22me']
  },
  CIVIL: {
    code: 'CIVIL',
    name: 'Civil Engineering',
    shortLabel: 'CIVIL',
    badgeColor: 'slate',
    aliases: ['civil', 'civil engineering', 'ce', '22ce']
  },
  HUM: {
    code: 'HUM',
    name: 'Science & Humanities',
    shortLabel: 'HUM',
    badgeColor: 'emerald',
    aliases: ['humanities', 'science and humanities', 'science & humanities', 's&h', 'english', 'maths', 'mathematics', 'physics', 'chemistry', '22hs']
  }
};

/**
 * Resolves any raw text (department string, section name, subject code) into a standardized department code.
 */
export const getDepartmentCode = (raw?: string): string => {
  if (!raw) return 'OTHER';
  const clean = raw.trim().toLowerCase();

  // Check against known department aliases
  for (const [code, info] of Object.entries(KNOWN_DEPARTMENTS)) {
    if (code.toLowerCase() === clean) return code;
    for (const alias of info.aliases) {
      if (clean === alias) return code;
      // Word boundary match: e.g. "Information Technology - Year 3" or "22IT385"
      if (new RegExp(`(^|[^a-z0-9])${alias}([^a-z0-9]|$)`, 'i').test(clean)) {
        return code;
      }
      if (clean.startsWith(alias)) {
        return code;
      }
    }
  }

  // Fallback pattern checks for common prefixes
  if (/^22it|it[\s\-_]|\-it\-/i.test(clean)) return 'IT';
  if (/^22cs|cse?[\s\-_]|\-cse?\-/i.test(clean)) return 'CSE';
  if (/^22ad|ai[\s\-_]|ad[\s\-_]|\-ad\-/i.test(clean)) return 'AD';
  if (/^22ec|ece?[\s\-_]|\-ece?\-/i.test(clean)) return 'ECE';
  if (/^22ee|eee?[\s\-_]|\-eee?\-/i.test(clean)) return 'EEE';

  // Capitalize clean short name if short
  if (clean.length <= 6) return clean.toUpperCase();

  return clean.split(' ').map(w => w.charAt(0).toUpperCase()).join('').slice(0, 4) || 'OTHER';
};

/**
 * Checks if a given text/department matches the selected department filter.
 */
export const matchesDepartmentFilter = (rawText: string | undefined, selectedDept: string): boolean => {
  if (!selectedDept || selectedDept === 'All' || selectedDept === 'all') {
    return true;
  }
  if (!rawText) return false;

  const targetCode = selectedDept.toUpperCase();
  const rawClean = rawText.trim().toLowerCase();

  // Direct exact match
  if (rawClean === targetCode.toLowerCase()) return true;

  // Code match via resolution
  const resolvedCode = getDepartmentCode(rawText);
  if (resolvedCode === targetCode) return true;

  // Alias match
  const known = KNOWN_DEPARTMENTS[targetCode];
  if (known) {
    if (known.name.toLowerCase() === rawClean) return true;
    for (const alias of known.aliases) {
      if (rawClean.includes(alias)) return true;
    }
  }

  return false;
};

/**
 * Checks whether a timetable slot belongs to the selected department filter.
 */
export const isSlotInDepartment = (
  slot: any,
  selectedDept: string,
  classSections: any[] = [],
  subjects: any[] = [],
  faculty: any[] = []
): boolean => {
  if (!selectedDept || selectedDept === 'All' || selectedDept === 'all') {
    return true;
  }

  // 1. Direct check on classSectionName (e.g. "Information Technology - Year 3 - Section A" or "AD - Year 3 - Section A")
  if (slot.classSectionName && matchesDepartmentFilter(slot.classSectionName, selectedDept)) {
    return true;
  }

  // 2. Direct check on subjectCode (e.g. "22IT385", "22CS101", "22AD301")
  if (slot.subjectCode && matchesDepartmentFilter(slot.subjectCode, selectedDept)) {
    return true;
  }

  // 3. Check matched ClassSection entity
  if (slot.classSectionId) {
    const sec = classSections.find(c => c.id === slot.classSectionId);
    if (sec) {
      if (matchesDepartmentFilter(sec.department, selectedDept)) return true;
      if (matchesDepartmentFilter(sec.name, selectedDept)) return true;
    }
  }

  // 4. Check matched Subject entity
  if (slot.subjectId) {
    const sub = subjects.find(s => s.id === slot.subjectId);
    if (sub) {
      if (matchesDepartmentFilter(sub.department, selectedDept)) return true;
      if (matchesDepartmentFilter(sub.code, selectedDept)) return true;
      if (matchesDepartmentFilter(sub.name, selectedDept)) return true;
    }
  }

  // 5. Check matched Faculty entity
  if (slot.facultyId) {
    const fac = faculty.find(f => f.id === slot.facultyId);
    if (fac && fac.department) {
      if (matchesDepartmentFilter(fac.department, selectedDept)) return true;
    }
  }

  return false;
};

/**
 * Dynamically discovers all available departments from live application state
 * including class sections, subjects, timetable slots, and faculty.
 */
export const extractAvailableDepartments = (data: {
  classSections?: any[];
  subjects?: any[];
  faculty?: any[];
  timetable?: any[];
  students?: any[];
}): DepartmentOption[] => {
  const codeMap = new Map<string, { name: string; shortLabel: string; badgeColor: string }>();

  // Always pre-populate the key departments requested: IT, CSE, AD, and ECE
  codeMap.set('IT', {
    name: KNOWN_DEPARTMENTS.IT.name,
    shortLabel: 'IT',
    badgeColor: 'teal'
  });
  codeMap.set('CSE', {
    name: KNOWN_DEPARTMENTS.CSE.name,
    shortLabel: 'CSE',
    badgeColor: 'indigo'
  });
  codeMap.set('AD', {
    name: KNOWN_DEPARTMENTS.AD.name,
    shortLabel: 'AD',
    badgeColor: 'violet'
  });
  codeMap.set('ECE', {
    name: KNOWN_DEPARTMENTS.ECE.name,
    shortLabel: 'ECE',
    badgeColor: 'amber'
  });

  // Scan class sections
  (data.classSections || []).forEach(cs => {
    const code = getDepartmentCode(cs.department || cs.name);
    if (code && code !== 'OTHER' && !codeMap.has(code)) {
      const known = KNOWN_DEPARTMENTS[code];
      codeMap.set(code, {
        name: known ? known.name : cs.department || code,
        shortLabel: known ? known.shortLabel : code,
        badgeColor: known ? known.badgeColor : 'slate'
      });
    }
  });

  // Scan timetable slots
  (data.timetable || []).forEach(s => {
    const code = getDepartmentCode(s.classSectionName || s.subjectCode);
    if (code && code !== 'OTHER' && !codeMap.has(code)) {
      const known = KNOWN_DEPARTMENTS[code];
      codeMap.set(code, {
        name: known ? known.name : code,
        shortLabel: known ? known.shortLabel : code,
        badgeColor: known ? known.badgeColor : 'slate'
      });
    }
  });

  // Scan subjects
  (data.subjects || []).forEach(sub => {
    const code = getDepartmentCode(sub.department || sub.code);
    if (code && code !== 'OTHER' && !codeMap.has(code)) {
      const known = KNOWN_DEPARTMENTS[code];
      codeMap.set(code, {
        name: known ? known.name : sub.department || code,
        shortLabel: known ? known.shortLabel : code,
        badgeColor: known ? known.badgeColor : 'slate'
      });
    }
  });

  // Scan faculty
  (data.faculty || []).forEach(fac => {
    const code = getDepartmentCode(fac.department);
    if (code && code !== 'OTHER' && !codeMap.has(code)) {
      const known = KNOWN_DEPARTMENTS[code];
      codeMap.set(code, {
        name: known ? known.name : fac.department || code,
        shortLabel: known ? known.shortLabel : code,
        badgeColor: known ? known.badgeColor : 'slate'
      });
    }
  });

  // Sort order: IT, CSE, AD, ECE, then alphabetical
  const priorityOrder = ['IT', 'CSE', 'AD', 'ECE', 'EEE', 'MECH', 'CIVIL', 'HUM'];

  const sortedCodes = Array.from(codeMap.keys()).sort((a, b) => {
    const idxA = priorityOrder.indexOf(a);
    const idxB = priorityOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  return [
    { code: 'All', name: 'All Departments', shortLabel: 'All', badgeColor: 'slate' },
    ...sortedCodes.map(c => ({
      code: c,
      name: codeMap.get(c)!.name,
      shortLabel: codeMap.get(c)!.shortLabel,
      badgeColor: codeMap.get(c)!.badgeColor
    }))
  ];
};

/**
 * Resiliently checks whether a timetable slot belongs to a given faculty member.
 * Matches by facultyId (UUID, employeeId, userId) and clean name (handling prefixes like Dr., Mr., etc.).
 */
export const isSlotMatchingFaculty = (slot: any, targetFaculty: any): boolean => {
  if (!slot || !targetFaculty) return false;

  // 1. Direct ID, Employee ID, or User ID match
  if (slot.facultyId) {
    if (
      slot.facultyId === targetFaculty.id ||
      slot.facultyId === targetFaculty.employeeId ||
      slot.facultyId === targetFaculty.userId
    ) {
      return true;
    }
  }

  // 2. Name comparison (cleaning honorifics like Dr., Mr., Mrs., Ms., Prof.)
  const stripTitles = (name: string): string => {
    return (name || '')
      .toLowerCase()
      .replace(/^(dr|mr|mrs|ms|prof)\.?\s+/i, '')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  };

  const slotFacName = stripTitles(slot.facultyName || '');
  const targetFacName = stripTitles(targetFaculty.name || '');

  if (slotFacName && targetFacName) {
    if (slotFacName === targetFacName) return true;
    if (slotFacName.includes(targetFacName) || targetFacName.includes(slotFacName)) return true;
  }

  // 3. Check if slot.facultyId itself is a name string
  if (typeof slot.facultyId === 'string' && targetFacName) {
    const cleanSlotFacId = stripTitles(slot.facultyId);
    if (cleanSlotFacId && (cleanSlotFacId === targetFacName || cleanSlotFacId.includes(targetFacName) || targetFacName.includes(cleanSlotFacId))) {
      return true;
    }
  }

  return false;
};

