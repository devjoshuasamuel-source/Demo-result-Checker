// Seed data for Manna Academy Result Checker

export const initialClasses = [
  { id: 'jss1', name: 'JSS 1', baseName: 'JSS 1', arm: '', subjects: ['math', 'eng', 'basic_sci', 'civic_edu', 'agric_sci'] },
  { id: 'jss2', name: 'JSS 2', baseName: 'JSS 2', arm: '', subjects: ['math', 'eng', 'basic_sci', 'civic_edu', 'intro_tech'] },
  { id: 'sss1', name: 'SSS 1', baseName: 'SSS 1', arm: '', subjects: ['math', 'eng', 'physics', 'chemistry', 'biology', 'civic_edu'] },
  { id: 'sss2', name: 'SSS 2', baseName: 'SSS 2', arm: '', subjects: ['math', 'eng', 'physics', 'chemistry', 'biology', 'geography'] }
];

export const initialSubjects = {
  math: { id: 'math', name: 'Mathematics', defaultTeacher: 'Miss Blessing Obaka' },
  eng: { id: 'eng', name: 'English Language', defaultTeacher: 'Mr. David Vance' },
  basic_sci: { id: 'basic_sci', name: 'Basic Science', defaultTeacher: 'Dr. John Okoye' },
  civic_edu: { id: 'civic_edu', name: 'Civic Education', defaultTeacher: 'Mrs. Sarah Adeleke' },
  agric_sci: { id: 'agric_sci', name: 'Agricultural Science', defaultTeacher: 'Mr. Ibrahim Yusuf' },
  intro_tech: { id: 'intro_tech', name: 'Introductory Technology', defaultTeacher: 'Mr. Samuel Bello' },
  physics: { id: 'physics', name: 'Physics', defaultTeacher: 'Dr. John Okoye' },
  chemistry: { id: 'chemistry', name: 'Chemistry', defaultTeacher: 'Mrs. Blessing Benson' },
  biology: { id: 'biology', name: 'Biology', defaultTeacher: 'Mrs. Sarah Adeleke' },
  geography: { id: 'geography', name: 'Geography', defaultTeacher: 'Mr. Ibrahim Yusuf' }
};

// Beautiful default svg avatars (data URLs) for students and teachers
export const defaultAvatars = [
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%234f46e5"/><circle cx="50" cy="40" r="20" fill="%23ffffff"/><path d="M20,85 C20,65 30,55 50,55 C70,55 80,65 80,85 Z" fill="%23ffffff"/></svg>',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23059669"/><circle cx="50" cy="40" r="20" fill="%23ffffff"/><path d="M20,85 C20,65 30,55 50,55 C70,55 80,65 80,85 Z" fill="%23ffffff"/></svg>',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23db2777"/><circle cx="50" cy="40" r="20" fill="%23ffffff"/><path d="M20,85 C20,65 30,55 50,55 C70,55 80,65 80,85 Z" fill="%23ffffff"/></svg>',
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23ea580c"/><circle cx="50" cy="40" r="20" fill="%23ffffff"/><path d="M20,85 C20,65 30,55 50,55 C70,55 80,65 80,85 Z" fill="%23ffffff"/></svg>'
];

export const initialTeachers = [
  { id: 't1', name: 'Miss Blessing Obaka', email: 'blessing.obaka@mannaacademy.sch.ng', password: 'password123', assignedClass: 'jss1', subjects: ['math'], photo: defaultAvatars[0] },
  { id: 't2', name: 'Mr. David Vance', email: 'david.vance@mannaacademy.sch.ng', password: 'password123', assignedClass: 'sss1', subjects: ['eng'], photo: defaultAvatars[1] },
  { id: 't3', name: 'Dr. John Okoye', email: 'john.okoye@mannaacademy.sch.ng', password: 'password123', assignedClass: 'sss2', subjects: ['physics', 'basic_sci'], photo: defaultAvatars[2] },
  { id: 't4', name: 'Mrs. Blessing Benson', email: 'blessing.b@mannaacademy.sch.ng', password: 'password123', assignedClass: 'sss1', subjects: ['chemistry'], photo: defaultAvatars[3] }
];

// Seed standard Signatures as cursive SVGs
export const mockSignatures = {
  teacher: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="50" viewBox="0 0 150 50"><path d="M10,35 Q30,10 50,30 T90,20 T130,30" fill="none" stroke="%231e3a8a" stroke-width="2" stroke-linecap="round"/><text x="15" y="45" font-family="cursive" font-size="10" fill="%231e3a8a">Miss Blessing Obaka</text></svg>',
  principal: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="50" viewBox="0 0 150 50"><path d="M15,25 C30,5 45,45 60,25 S85,5 110,25 S135,15 145,35" fill="none" stroke="%23064e3b" stroke-width="2.5" stroke-linecap="round"/><text x="15" y="45" font-family="cursive" font-size="11" fill="%23064e3b">Mrs Chinyere Anokam</text></svg>'
};

export const initialStudents = [
  {
    id: 'std1',
    name: 'Adegoke Samson',
    classId: 'jss1',
    rollNo: 481,
    dob: '2014-06-15',
    fatherName: 'Mr. Ezekiel Adegoke',
    motherName: 'Mrs. Victoria Adegoke',
    photo: defaultAvatars[0],
    active: true
  },
  {
    id: 'std2',
    name: 'Chinedu Eze',
    classId: 'jss1',
    rollNo: 724,
    dob: '2013-11-20',
    fatherName: 'Mr. Julius Eze',
    motherName: 'Mrs. Florence Eze',
    photo: defaultAvatars[1],
    active: true
  },
  {
    id: 'std3',
    name: 'Fatima Abubakar',
    classId: 'jss1',
    rollNo: 119,
    dob: '2014-03-08',
    fatherName: 'Mr. Abubakar Kabir',
    motherName: 'Mrs. Aisha Abubakar',
    photo: defaultAvatars[2],
    active: true
  },
  {
    id: 'std4',
    name: 'Okonkwo Emeka',
    classId: 'sss1',
    rollNo: 890,
    dob: '2011-09-12',
    fatherName: 'Mr. Gregory Okonkwo',
    motherName: 'Mrs. Stella Okonkwo',
    photo: defaultAvatars[3],
    active: true
  },
  {
    id: 'std5',
    name: 'Balogun Elizabeth',
    classId: 'sss1',
    rollNo: 335,
    dob: '2012-01-25',
    fatherName: 'Mr. Samuel Balogun',
    motherName: 'Mrs. Janet Balogun',
    photo: defaultAvatars[2],
    active: true
  }
];

export const initialResults = [
  {
    id: 'res_std1_jss1',
    studentId: 'std1',
    classId: 'jss1',
    term: '3rd Term',
    session: '2025/2026',
    status: 'published', // published, draft
    scores: {
      math: { ca1: 18, ca2: 17, exam: 54, total: 89 },
      eng: { ca1: 15, ca2: 16, exam: 48, total: 79 },
      basic_sci: { ca1: 14, ca2: 14, exam: 42, total: 70 },
      civic_edu: { ca1: 19, ca2: 18, exam: 58, total: 95 },
      agric_sci: { ca1: 12, ca2: 15, exam: 38, total: 65 }
    },
    traits: {
      activeness: 5,
      attendance: 5,
      punctuality: 4,
      selfControl: 4,
      honesty: 5,
      humility: 5,
      leadership: 4,
      neatness: 5,
      communication: 4
    },
    psychomotor: {
      handwriting: 4,
      fluency: 5,
      neatness: 4
    },
    remarks: {
      teacher: 'Adegoke is an exceptional student. His academic enthusiasm and neatness are outstanding. Keep up the high standard.',
      teacherName: 'Mrs. Miss Blessing Obaka',
      teacherSignature: mockSignatures.teacher,
      teacherDate: '2026-07-28',
      principal: 'A stellar academic performance. Promoted to JSS 2 with honors.',
      principalName: 'Mrs Chinyere Anokam',
      principalSignature: mockSignatures.principal,
      principalDate: '2026-07-30'
    }
  },
  {
    id: 'res_std2_jss1',
    studentId: 'std2',
    classId: 'jss1',
    term: '3rd Term',
    session: '2025/2026',
    status: 'published',
    scores: {
      math: { ca1: 12, ca2: 11, exam: 35, total: 58 },
      eng: { ca1: 14, ca2: 13, exam: 40, total: 67 },
      basic_sci: { ca1: 10, ca2: 12, exam: 32, total: 54 },
      civic_edu: { ca1: 15, ca2: 14, exam: 45, total: 74 },
      agric_sci: { ca1: 11, ca2: 10, exam: 30, total: 51 }
    },
    traits: {
      activeness: 4,
      attendance: 4,
      punctuality: 3,
      selfControl: 3,
      honesty: 4,
      humility: 4,
      leadership: 3,
      neatness: 4,
      communication: 3
    },
    psychomotor: {
      handwriting: 3,
      fluency: 4,
      neatness: 3
    },
    remarks: {
      teacher: 'Chinedu has shown satisfactory progress this term. More effort is needed in Mathematics and Sciences.',
      teacherName: 'Mrs. Miss Blessing Obaka',
      teacherSignature: mockSignatures.teacher,
      teacherDate: '2026-07-28',
      principal: 'Good results. Promoted to JSS 2.',
      principalName: 'Mrs Chinyere Anokam',
      principalSignature: mockSignatures.principal,
      principalDate: '2026-07-30'
    }
  },
  {
    id: 'res_std3_jss1',
    studentId: 'std3',
    classId: 'jss1',
    term: '3rd Term',
    session: '2025/2026',
    status: 'draft', // Draft, so result lookup will return "Result not yet available" until published!
    scores: {
      math: { ca1: 19, ca2: 19, exam: 58, total: 96 },
      eng: { ca1: 17, ca2: 18, exam: 52, total: 87 },
      basic_sci: { ca1: 16, ca2: 17, exam: 49, total: 82 },
      civic_edu: { ca1: 18, ca2: 19, exam: 56, total: 93 },
      agric_sci: { ca1: 15, ca2: 16, exam: 45, total: 76 }
    },
    traits: {
      activeness: 5,
      attendance: 5,
      punctuality: 5,
      selfControl: 5,
      honesty: 5,
      humility: 5,
      leadership: 5,
      neatness: 5,
      communication: 5
    },
    psychomotor: {
      handwriting: 5,
      fluency: 5,
      neatness: 5
    },
    remarks: {
      teacher: 'An outstanding genius. Fatima has topped the class in all assessments. Unmatched dedication.',
      teacherName: 'Mrs. Miss Blessing Obaka',
      teacherSignature: mockSignatures.teacher,
      teacherDate: '2026-07-28',
      principal: '', // Admin has not yet added Principal remark or published
      principalName: 'Mrs Chinyere Anokam',
      principalSignature: mockSignatures.principal,
      principalDate: ''
    }
  },
  {
    id: 'res_std4_sss1',
    studentId: 'std4',
    classId: 'sss1',
    term: '3rd Term',
    session: '2025/2026',
    status: 'published',
    scores: {
      math: { ca1: 16, ca2: 15, exam: 46, total: 77 },
      eng: { ca1: 15, ca2: 15, exam: 45, total: 75 },
      physics: { ca1: 14, ca2: 13, exam: 41, total: 68 },
      chemistry: { ca1: 15, ca2: 14, exam: 43, total: 72 },
      biology: { ca1: 16, ca2: 17, exam: 49, total: 82 },
      civic_edu: { ca1: 15, ca2: 16, exam: 47, total: 78 }
    },
    traits: {
      activeness: 4,
      attendance: 5,
      punctuality: 4,
      selfControl: 4,
      honesty: 4,
      humility: 4,
      leadership: 4,
      neatness: 4,
      communication: 4
    },
    psychomotor: {
      handwriting: 4,
      fluency: 4,
      neatness: 4
    },
    remarks: {
      teacher: 'Emeka is a focused and hardworking student. He shows great aptitude in Sciences.',
      teacherName: 'Mr. David Vance',
      teacherSignature: mockSignatures.teacher,
      teacherDate: '2026-07-28',
      principal: 'A very good result. Promoted to SSS 2.',
      principalName: 'Mrs Chinyere Anokam',
      principalSignature: mockSignatures.principal,
      principalDate: '2026-07-30'
    }
  }
];

export const initialAuditLogs = [
  {
    id: 'log1',
    action: 'System initialized with mock data',
    user: 'System Admin',
    timestamp: '2026-08-08T00:00:00Z',
    details: 'Initial database configuration and seed records loaded.'
  },
  {
    id: 'log2',
    action: 'Class assigned to Teachers',
    user: 'Principal Anokam',
    timestamp: '2026-08-08T01:15:00Z',
    details: 'Mrs. Miss Blessing Obaka assigned to JSS 1 Mathematics; Mr. David Vance assigned to SSS 1 English.'
  },
  {
    id: 'log3',
    action: 'Draft results submitted',
    user: 'Mrs. Miss Blessing Obaka (Teacher)',
    timestamp: '2026-08-08T03:30:00Z',
    details: 'Submitted final JSS 1 3rd Term results for Samson, Chinedu, and Fatima as Draft.'
  },
  {
    id: 'log4',
    action: 'Results Approved & Published',
    user: 'System Admin',
    timestamp: '2026-08-08T04:45:00Z',
    details: 'Published JSS 1 results for Adegoke Samson and Chinedu Eze. Held Fatima Abubakar in draft.'
  }
];
