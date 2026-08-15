import React, { createContext, useState, useEffect, useRef } from 'react';
import { defaultAvatars } from '../mockData';

export const AppContext = createContext();

const defaultGradingScale = [
  { grade: 'A1', min: 75, max: 100, remark: 'Excellent', color: 'var(--success)' },
  { grade: 'B2', min: 70, max: 74, remark: 'Very Good', color: 'var(--success)' },
  { grade: 'B3', min: 65, max: 69, remark: 'Good', color: 'var(--success)' },
  { grade: 'C4', min: 60, max: 64, remark: 'Credit', color: 'var(--success)' },
  { grade: 'C5', min: 55, max: 59, remark: 'Credit', color: 'var(--success)' },
  { grade: 'C6', min: 50, max: 54, remark: 'Credit', color: 'var(--success)' },
  { grade: 'D7', min: 45, max: 49, remark: 'Pass', color: 'var(--warning)' },
  { grade: 'E8', min: 40, max: 44, remark: 'Pass', color: 'var(--warning)' },
  { grade: 'F9', min: 0, max: 39, remark: 'Fail', color: 'var(--danger)' }
];

export const AppProvider = ({ children }) => {
  const [isBootstrapped, setIsBootstrapped] = useState(false);

  // Core Data States
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [gradingScale, setGradingScale] = useState(defaultGradingScale);

  // Security Lockout State (Student Lookup)
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState(null);

  // Session & UI states
  const [currentRole, setCurrentRole] = useState('student'); // student, teacher, admin
  const [selectedTeacherId, setSelectedTeacherId] = useState(() => {
    return localStorage.getItem('mc_selected_teacher_id') || 't1';
  });
  const [isTeacherLoggedIn, setIsTeacherLoggedIn] = useState(() => {
    return localStorage.getItem('mc_teacher_logged_in') === 'true';
  });
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('mc_admin_logged_in') === 'true';
  });
  const [viewingResult, setViewingResult] = useState(null); 

  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('mc_theme') || 'light';
  });

  // Settings & Branding States
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [adminEmail, setAdminEmail] = useState('admin@mannaacademy.sch.ng');
  const [schoolName, setSchoolName] = useState('Manna Academy');
  const [schoolSubtitle, setSchoolSubtitle] = useState('Kaduna');
  const [schoolLogo, setSchoolLogo] = useState('/logo.png');
  const [schoolMotto, setSchoolMotto] = useState('Established in 2019');
  const [schoolAddress, setSchoolAddress] = useState('Plot C2A, Hakimi Close, off Makera-Kujama Road, Sabo G.R.A, Kaduna South, Kaduna');
  const [reportCardFont, setReportCardFont] = useState('inter');
  const [reportCardHeaderFont, setReportCardHeaderFont] = useState('cinzel');
  const [reportCardHeaderFontSize, setReportCardHeaderFontSize] = useState('2rem');
  const [adminName, setAdminName] = useState('Mrs Chinyere Anokam');
  
  const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%231e3a8a'/><circle cx='50' cy='40' r='20' fill='%23ffffff'/><path d='M20,85 C20,65 30,55 50,55 C70,55 80,65 80,85 Z' fill='%23ffffff'/></svg>";
  const [adminAvatar, setAdminAvatar] = useState(defaultAvatar);
  const [currentSession, setCurrentSession] = useState('2025/2026');
  const [currentTerm, setCurrentTerm] = useState('3rd Term');
  const [allowStudentReg, setAllowStudentReg] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mc_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Sync login status for page refreshes
  useEffect(() => {
    localStorage.setItem('mc_teacher_logged_in', isTeacherLoggedIn.toString());
  }, [isTeacherLoggedIn]);

  useEffect(() => {
    localStorage.setItem('mc_selected_teacher_id', selectedTeacherId);
  }, [selectedTeacherId]);

  useEffect(() => {
    localStorage.setItem('mc_admin_logged_in', isAdminLoggedIn.toString());
  }, [isAdminLoggedIn]);

  // Load database into state on mount
  const fetchData = async () => {
    try {
      const res = await fetch('/api/bootstrap');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSchoolName(data.settings.schoolName);
          setSchoolSubtitle(data.settings.schoolSubtitle);
          setSchoolLogo(data.settings.schoolLogo);
          setSchoolMotto(data.settings.schoolMotto);
          setSchoolAddress(data.settings.schoolAddress);
          setReportCardFont(data.settings.reportCardFont);
          setReportCardHeaderFont(data.settings.reportCardHeaderFont);
          setReportCardHeaderFontSize(data.settings.reportCardHeaderFontSize);
          setAdminName(data.settings.adminName);
          setAdminEmail(data.settings.adminEmail);
          setAdminPassword(data.settings.adminPassword);
          setAdminAvatar(data.settings.adminAvatar);
          setCurrentSession(data.settings.currentSession);
          setCurrentTerm(data.settings.currentTerm);
          setAllowStudentReg(data.settings.allowStudentReg);
          setMaintenanceMode(data.settings.maintenanceMode);
          if (data.settings.gradingScale) {
            setGradingScale(typeof data.settings.gradingScale === 'string' ? JSON.parse(data.settings.gradingScale) : data.settings.gradingScale);
          }
        }
        if (data.classes) setClasses(data.classes);
        if (data.subjects) setSubjects(data.subjects);
        if (data.teachers) setTeachers(data.teachers);
        if (data.students) setStudents(data.students);
        if (data.results) setResults(data.results);
        if (data.auditLogs) setAuditLogs(data.auditLogs);

        // Check if there is legacy local storage data to restore
        const legacyMigrated = localStorage.getItem('mc_data_migrated_to_db');
        if (legacyMigrated !== 'true') {
          let legacyStudents = [];
          let legacyResults = [];
          let legacyClasses = [];
          let legacyTeachers = [];
          let legacySubjects = {};
          let legacyAuditLogs = [];
          let legacyGradingScale = null;

          try {
            legacyStudents = JSON.parse(localStorage.getItem('mc_students') || '[]');
            legacyResults = JSON.parse(localStorage.getItem('mc_results') || '[]');
            legacyClasses = JSON.parse(localStorage.getItem('mc_classes') || '[]');
            legacyTeachers = JSON.parse(localStorage.getItem('mc_teachers') || '[]');
            legacySubjects = JSON.parse(localStorage.getItem('mc_subjects') || '{}');
            legacyAuditLogs = JSON.parse(localStorage.getItem('mc_audit_logs') || '[]');
            legacyGradingScale = JSON.parse(localStorage.getItem('mc_grading_scale') || 'null');
          } catch (e) {
            console.error('Error parsing legacy localStorage data:', e);
          }

          const hasLegacyData = legacyStudents.length > 0 || legacyResults.length > 0 || legacyClasses.length > 0;
          
          if (hasLegacyData) {
            console.log('Legacy local storage data detected. Checking if database restore is needed...');
            
            const serverStudentIds = (data.students || []).map(s => s.id);
            const defaultStudentIds = ['std1', 'std2', 'std3', 'std4', 'std5'];
            const isServerDefault = serverStudentIds.length === 0 || 
              (serverStudentIds.length === 5 && serverStudentIds.every(id => defaultStudentIds.includes(id)));

            if (isServerDefault) {
              console.log('Database is in default state. Automatically restoring legacy local storage data to database server...');
              
              const importPayload = {
                classes: legacyClasses.length > 0 ? legacyClasses : (data.classes || []),
                students: legacyStudents.length > 0 ? legacyStudents : (data.students || []),
                results: legacyResults.length > 0 ? legacyResults : (data.results || []),
                teachers: legacyTeachers.length > 0 ? legacyTeachers : (data.teachers || []),
                subjects: Object.keys(legacySubjects).length > 0 ? legacySubjects : (data.subjects || {}),
                auditLogs: legacyAuditLogs.length > 0 ? legacyAuditLogs : (data.auditLogs || []),
                gradingScale: legacyGradingScale || data.settings?.gradingScale || defaultGradingScale,
                schoolName: localStorage.getItem('mc_school_name') || data.settings?.schoolName || 'Manna Academy',
                schoolSubtitle: localStorage.getItem('mc_school_subtitle') || data.settings?.schoolSubtitle || 'Kaduna',
                schoolLogo: localStorage.getItem('mc_school_logo') || data.settings?.schoolLogo || '/logo.png',
                schoolMotto: localStorage.getItem('mc_school_motto') || data.settings?.schoolMotto || 'Established in 2019',
                schoolAddress: localStorage.getItem('mc_school_address') || data.settings?.schoolAddress || '',
                reportCardFont: localStorage.getItem('mc_report_card_font') || data.settings?.reportCardFont || 'inter',
                reportCardHeaderFont: localStorage.getItem('mc_report_card_header_font') || data.settings?.reportCardHeaderFont || 'cinzel',
                reportCardHeaderFontSize: localStorage.getItem('mc_report_card_header_font_size') || data.settings?.reportCardHeaderFontSize || '2rem',
                adminName: localStorage.getItem('mc_admin_name') || data.settings?.adminName || 'Mrs Chinyere Anokam',
                adminEmail: localStorage.getItem('mc_admin_email') || data.settings?.adminEmail || 'admin@mannaacademy.sch.ng',
                adminPassword: localStorage.getItem('mc_admin_password') || data.settings?.adminPassword || 'admin123',
                adminAvatar: localStorage.getItem('mc_admin_avatar') || data.settings?.adminAvatar || defaultAvatar,
                currentSession: localStorage.getItem('mc_current_session') || data.settings?.currentSession || '2025/2026',
                currentTerm: localStorage.getItem('mc_current_term') || data.settings?.currentTerm || '3rd Term',
                allowStudentReg: localStorage.getItem('mc_allow_student_reg') !== 'false',
                maintenanceMode: localStorage.getItem('mc_maintenance_mode') === 'true'
              };

              try {
                const response = await fetch('/api/import', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(importPayload)
                });

                if (response.ok) {
                  console.log('Legacy data restored successfully!');
                  localStorage.setItem('mc_data_migrated_to_db', 'true');
                  window.location.reload();
                } else {
                  console.error('Failed to import legacy database payload.');
                }
              } catch (importErr) {
                console.error('Error during automatic data migration:', importErr);
              }
            } else {
              console.log('Database already contains non-default records. Skipping automatic restore.');
              localStorage.setItem('mc_data_migrated_to_db', 'true');
            }
          } else {
            localStorage.setItem('mc_data_migrated_to_db', 'true');
          }
        }
      }
    } catch (err) {
      console.error('Failed to bootstrap data:', err);
    } finally {
      setIsBootstrapped(true);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const isFirstLoad = useRef(true);

  // Sync settings when they change after bootstrap completes (debounced)
  useEffect(() => {
    if (!isBootstrapped) return;
    
    // Skip initial sync when values are initialized from bootstrap
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    const saveSettings = async () => {
      try {
        await fetch('/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            schoolName,
            schoolSubtitle,
            schoolLogo,
            schoolMotto,
            schoolAddress,
            reportCardFont,
            reportCardHeaderFont,
            reportCardHeaderFontSize,
            adminName,
            adminEmail,
            adminPassword,
            adminAvatar,
            currentSession,
            currentTerm,
            allowStudentReg,
            maintenanceMode,
            gradingScale
          })
        });
      } catch (err) {
        console.error('Failed to sync settings to server:', err);
      }
    };

    const timer = setTimeout(saveSettings, 1000);
    return () => clearTimeout(timer);
  }, [
    isBootstrapped,
    schoolName, schoolSubtitle, schoolLogo, schoolMotto, schoolAddress,
    reportCardFont, reportCardHeaderFont, reportCardHeaderFontSize,
    adminName, adminEmail, adminPassword, adminAvatar, currentSession,
    currentTerm, allowStudentReg, maintenanceMode, gradingScale
  ]);

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/audit-logs');
      if (res.ok) {
        const logs = await res.json();
        setAuditLogs(logs);
      }
    } catch (e) {
      console.error('Failed to fetch audit logs:', e);
    }
  };

  // Auth Helpers
  const loginAdmin = () => {
    setIsAdminLoggedIn(true);
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        action: 'Admin Logout',
        user: 'System',
        timestamp: new Date().toISOString(),
        details: 'Administrator logged out of dashboard.'
      })
    }).then(() => fetchAuditLogs());
  };

  const loginTeacher = (user) => {
    setSelectedTeacherId(user.id);
    setIsTeacherLoggedIn(true);
  };

  const logoutTeacher = () => {
    setIsTeacherLoggedIn(false);
    fetch('/api/audit-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        action: 'Teacher Logout',
        user: 'System',
        timestamp: new Date().toISOString(),
        details: 'Logged out of Teacher Panel.'
      })
    }).then(() => fetchAuditLogs());
  };

  // Grade Lookup Helper
  const getGradeInfo = (score) => {
    const parsed = parseFloat(score);
    if (isNaN(parsed)) return { grade: '-', remark: '-', color: 'var(--text-muted)' };
    const rule = gradingScale.find(r => parsed >= r.min && parsed <= r.max);
    return rule || { grade: 'F9', remark: 'Fail', color: 'var(--danger)' };
  };

  // Roll Number generator
  const generateRollNo = () => {
    let roll = 0;
    let exists = true;
    let attempts = 0;
    while (exists && attempts < 10000) {
      roll = Math.floor(Math.random() * 5001); // 0 to 5000
      exists = students.some(s => s.rollNo === roll);
      attempts++;
    }
    if (exists) {
      for (let i = 0; i <= 5000; i++) {
        if (!students.some(s => s.rollNo === i)) {
          return i;
        }
      }
      throw new Error("No available roll numbers in range 0-5000.");
    }
    return roll;
  };

  // Class Rankings Calculator
  const getClassRanking = (classId, term, session) => {
    const classResults = results.filter(r => r.classId === classId && r.term === term && r.session === session);
    const scoredResults = classResults.map(res => {
      const subjectScores = Object.values(res.scores);
      const totalScore = subjectScores.reduce((acc, curr) => acc + (curr.total || 0), 0);
      const avg = subjectScores.length > 0 ? (totalScore / subjectScores.length) : 0;
      return {
        studentId: res.studentId,
        totalScore,
        avg
      };
    });

    scoredResults.sort((a, b) => b.totalScore - a.totalScore);

    let currentRank = 1;
    const rankings = {};
    scoredResults.forEach((item, idx) => {
      if (idx > 0 && item.totalScore < scoredResults[idx - 1].totalScore) {
        currentRank = idx + 1;
      }
      rankings[item.studentId] = {
        rank: currentRank,
        totalScore: item.totalScore,
        average: parseFloat(item.avg.toFixed(1))
      };
    });

    return rankings;
  };

  // Student CRUD Operations
  const addStudent = async (studentData, actor) => {
    let rollNoVal = parseInt(studentData.rollNo);
    if (isNaN(rollNoVal) || rollNoVal < 0 || rollNoVal > 5000) {
      rollNoVal = generateRollNo();
    }
    const payload = {
      ...studentData,
      rollNo: rollNoVal,
      photo: studentData.photo || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)]
    };

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentData: payload, actor })
      });
      if (res.ok) {
        const newStudent = await res.json();
        setStudents(prev => [...prev, newStudent]);
        fetchAuditLogs();
        return newStudent;
      }
    } catch (err) {
      console.error(err);
      alert('Failed to register student on server.');
    }
  };

  const updateStudent = async (studentId, updatedData, actor) => {
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updatedData, actor })
      });
      if (res.ok) {
        const updated = await res.json();
        setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...updated } : s));
        fetchAuditLogs();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update student profile on server.');
    }
  };

  const removeStudent = async (studentId, actor) => {
    try {
      const res = await fetch(`/api/students/${studentId}?actor=${encodeURIComponent(actor)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setStudents(prev => prev.filter(s => s.id !== studentId));
        fetchAuditLogs();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to remove student from server.');
    }
  };

  // Teacher CRUD Operations
  const addTeacher = async (teacherData, actor) => {
    const payload = {
      ...teacherData,
      password: teacherData.password || 'password123',
      photo: teacherData.photo || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%234f46e5"/><circle cx="50" cy="40" r="20" fill="%23ffffff"/><path d="M20,85 C20,65 30,55 50,55 C70,55 80,65 80,85 Z" fill="%23ffffff"/></svg>'
    };

    try {
      const res = await fetch('/api/teachers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherData: payload, actor })
      });
      if (res.ok) {
        const newTeacher = await res.json();
        setTeachers(prev => [...prev, newTeacher]);
        fetchAuditLogs();
        return newTeacher;
      }
    } catch (err) {
      console.error(err);
      alert('Failed to add teacher to server.');
    }
  };

  const updateTeacher = async (teacherId, updatedData, actor) => {
    try {
      const res = await fetch(`/api/teachers/${teacherId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updatedData, actor })
      });
      if (res.ok) {
        const updated = await res.json();
        setTeachers(prev => prev.map(t => t.id === teacherId ? { ...t, ...updated } : t));
        fetchAuditLogs();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update teacher profile on server.');
    }
  };

  const removeTeacher = async (teacherId, actor) => {
    try {
      const res = await fetch(`/api/teachers/${teacherId}?actor=${encodeURIComponent(actor)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setTeachers(prev => prev.filter(t => t.id !== teacherId));
        fetchAuditLogs();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete teacher from server.');
    }
  };

  // Subject CRUD Operations
  const addSubject = async (subjectData, actor) => {
    try {
      const res = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectData, actor })
      });
      if (res.ok) {
        const newSubject = await res.json();
        setSubjects(prev => ({ ...prev, [newSubject.id]: newSubject }));
        fetchAuditLogs();
        return newSubject;
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create subject on server.');
    }
  };

  const updateSubject = async (subjectId, updatedData, actor) => {
    try {
      const res = await fetch(`/api/subjects/${subjectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updatedData, actor })
      });
      if (res.ok) {
        const updated = await res.json();
        setSubjects(prev => ({ ...prev, [subjectId]: { ...prev[subjectId], ...updated } }));
        fetchAuditLogs();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update subject on server.');
    }
  };

  const removeSubject = async (subjectId, actor) => {
    try {
      const res = await fetch(`/api/subjects/${subjectId}?actor=${encodeURIComponent(actor)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSubjects(prev => {
          const next = { ...prev };
          delete next[subjectId];
          return next;
        });
        setClasses(prev => prev.map(c => ({
          ...c,
          subjects: c.subjects.filter(id => id !== subjectId)
        })));
        setTeachers(prev => prev.map(t => ({
          ...t,
          subjects: t.subjects ? t.subjects.filter(id => id !== subjectId) : []
        })));
        fetchAuditLogs();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete subject from server.');
    }
  };

  // Results Operations
  const saveOrSubmitResult = async (resultData, actor) => {
    try {
      const res = await fetch('/api/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultData, actor })
      });
      if (res.ok) {
        const updatedResult = await res.json();
        setResults(prev => {
          const idx = prev.findIndex(r => r.id === updatedResult.id);
          if (idx >= 0) {
            return prev.map((r, i) => i === idx ? updatedResult : r);
          } else {
            return [...prev, updatedResult];
          }
        });
        fetchAuditLogs();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit student result to server.');
    }
  };

  const publishResult = async (resultId, actor) => {
    try {
      const res = await fetch('/api/results/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId, actor })
      });
      if (res.ok) {
        setResults(prev => prev.map(r => r.id === resultId ? { ...r, status: 'published' } : r));
        fetchAuditLogs();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to publish result.');
    }
  };

  const unpublishResult = async (resultId, actor) => {
    try {
      const res = await fetch('/api/results/unpublish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId, actor })
      });
      if (res.ok) {
        setResults(prev => prev.map(r => r.id === resultId ? { ...r, status: 'draft' } : r));
        fetchAuditLogs();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to withdraw result.');
    }
  };

  const publishClassResults = async (classId, term, session, actor) => {
    try {
      const res = await fetch('/api/results/publish-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, term, session, actor })
      });
      if (res.ok) {
        setResults(prev => prev.map(r => {
          if (r.classId === classId && r.term === term && r.session === session && r.status === 'draft') {
            return { ...r, status: 'published' };
          }
          return r;
        }));
        fetchAuditLogs();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to bulk publish results.');
    }
  };

  const unpublishClassResults = async (classId, term, session, actor) => {
    try {
      const res = await fetch('/api/results/unpublish-class', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, term, session, actor })
      });
      if (res.ok) {
        setResults(prev => prev.map(r => {
          if (r.classId === classId && r.term === term && r.session === session && r.status === 'published') {
            return { ...r, status: 'draft' };
          }
          return r;
        }));
        fetchAuditLogs();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to bulk withdraw results.');
    }
  };

  const addPrincipalRemark = async (resultId, remark, actor) => {
    try {
      const res = await fetch('/api/results/remark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId, remark, actor })
      });
      if (res.ok) {
        setResults(prev => prev.map(r => {
          if (r.id === resultId) {
            return {
              ...r,
              remarks: {
                ...(r.remarks || {}),
                principal: remark,
                principalName: 'Mrs Chinyere Anokam',
                principalSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="50" viewBox="0 0 150 50"><path d="M15,25 C25,10 40,40 55,25 S80,10 100,25 S125,15 135,35" fill="none" stroke="%23064e3b" stroke-width="2.5" stroke-linecap="round"/><text x="15" y="45" font-family="cursive" font-size="11" fill="%23064e3b">Mrs Chinyere Anokam</text></svg>',
                principalDate: new Date().toISOString().split('T')[0]
              }
            };
          }
          return r;
        }));
        fetchAuditLogs();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to record principal comment.');
    }
  };

  const applyBulkRemarksByBand = async (classId, term, session, bands, actor) => {
    try {
      const res = await fetch('/api/results/bulk-remarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, term, session, bands, actor })
      });
      if (res.ok) {
        const rankings = getClassRanking(classId, term, session);
        setResults(prev => prev.map(r => {
          if (r.classId === classId && r.term === term && r.session === session) {
            const stats = rankings[r.studentId];
            if (!stats) return r;
            const avg = stats.average;
            const matchingBand = bands.find(b => avg >= b.min && avg <= b.max);
            const remark = matchingBand ? matchingBand.remark : 'Good effort, keep striving for excellence.';
            return {
              ...r,
              remarks: {
                ...(r.remarks || {}),
                principal: remark,
                principalName: 'Mrs Chinyere Anokam',
                principalSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="50" viewBox="0 0 150 50"><path d="M15,25 C25,10 40,40 55,25 S80,10 100,25 S125,15 135,35" fill="none" stroke="%23064e3b" stroke-width="2.5" stroke-linecap="round"/><text x="15" y="45" font-family="cursive" font-size="11" fill="%23064e3b">Mrs Chinyere Anokam</text></svg>',
                principalDate: new Date().toISOString().split('T')[0]
              }
            };
          }
          return r;
        }));
        fetchAuditLogs();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to apply bulk remarks.');
    }
  };

  // Settings & Grading Config
  const saveGradingScale = (newScale, actor) => {
    setGradingScale(newScale);
  };

  // Class Management
  const createClass = async (classId, baseName, arm, subjectIds, actor) => {
    try {
      const res = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId, baseName, arm, subjectIds, actor })
      });
      if (res.ok) {
        const newClass = await res.json();
        setClasses(prev => [...prev, newClass]);
        fetchAuditLogs();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to register class on server.');
    }
  };

  const updateClass = async (classId, baseName, arm, actor) => {
    try {
      const res = await fetch(`/api/classes/${classId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseName, arm, actor })
      });
      if (res.ok) {
        const updated = await res.json();
        setClasses(prev => prev.map(c => c.id === classId ? { ...c, ...updated } : c));
        fetchAuditLogs();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update class details.');
    }
  };

  const updateClassSubjects = async (classId, subjectIds, actor) => {
    try {
      const res = await fetch(`/api/classes/${classId}/subjects`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectIds, actor })
      });
      if (res.ok) {
        const updated = await res.json();
        setClasses(prev => prev.map(c => c.id === classId ? { ...c, subjects: updated.subjects } : c));
        fetchAuditLogs();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to allocate class subjects.');
    }
  };

  const removeClass = async (classId, actor) => {
    try {
      const res = await fetch(`/api/classes/${classId}?actor=${encodeURIComponent(actor)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setClasses(prev => prev.filter(c => c.id !== classId));
        fetchAuditLogs();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete class.');
    }
  };

  // Student Lookup validation
  const validateLookup = async (name, rollNo) => {
    try {
      const response = await fetch('/api/students/verify-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, rollNo })
      });
      const data = await response.json();
      return data;
    } catch (err) {
      return { success: false, error: 'Connection to server failed. Please try again.' };
    }
  };

  // Database Backup Helpers
  const getFullDatabaseJson = () => {
    return {
      classes,
      subjects,
      teachers,
      students,
      results,
      auditLogs,
      gradingScale,
      adminEmail,
      adminPassword,
      schoolName,
      schoolSubtitle,
      schoolLogo,
      schoolMotto,
      schoolAddress,
      reportCardFont,
      reportCardHeaderFont,
      reportCardHeaderFontSize,
      adminName,
      adminAvatar,
      currentSession,
      currentTerm,
      allowStudentReg,
      maintenanceMode
    };
  };

  const exportDatabase = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(getFullDatabaseJson(), null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `manna_academy_db_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importDatabase = async (importedJson) => {
    try {
      const data = typeof importedJson === 'string' ? JSON.parse(importedJson) : importedJson;
      if (!data.classes || !data.students || !data.teachers) {
        throw new Error("Missing core database arrays.");
      }

      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        alert("Database imported successfully! Refreshing browser...");
        window.location.reload();
        return { success: true };
      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to parse import on server.');
      }
    } catch (e) {
      console.error('Failed to import database:', e);
      return { success: false, error: e.message };
    }
  };

  // Deprecated Cloud Sync hooks (no-op to prevent admin portal page crash)
  const syncBlobId = '';
  const connectCloudSync = async () => {
    return { success: false, error: 'JSONBlob Cloud Sync is deprecated. PostgreSQL database is active.' };
  };
  const disconnectCloudSync = () => {};

  return (
    <AppContext.Provider
      value={{
        classes,
        subjects,
        teachers,
        students,
        results,
        auditLogs,
        gradingScale,
        currentRole,
        selectedTeacherId,
        isTeacherLoggedIn,
        viewingResult,
        failedAttempts,
        lockoutUntil,
        setCurrentRole,
        setSelectedTeacherId,
        setIsTeacherLoggedIn,
        loginTeacher,
        logoutTeacher,
        setViewingResult,
        setLockoutUntil,
        setFailedAttempts,
        getGradeInfo,
        getClassRanking,
        addStudent,
        updateStudent,
        removeStudent,
        addTeacher,
        updateTeacher,
        removeTeacher,
        addSubject,
        updateSubject,
        removeSubject,
        saveOrSubmitResult,
        publishResult,
        unpublishResult,
        publishClassResults,
        unpublishClassResults,
        addPrincipalRemark,
        applyBulkRemarksByBand,
        saveGradingScale,
        createClass,
        updateClassSubjects,
        updateClass,
        removeClass,
        validateLookup,
        theme,
        toggleTheme,
        adminPassword,
        setAdminPassword,
        isAdminLoggedIn,
        setIsAdminLoggedIn,
        schoolName,
        setSchoolName,
        schoolSubtitle,
        setSchoolSubtitle,
        currentSession,
        setCurrentSession,
        currentTerm,
        setCurrentTerm,
        allowStudentReg,
        setAllowStudentReg,
        maintenanceMode,
        setMaintenanceMode,
        loginAdmin,
        logoutAdmin,
        adminEmail,
        setAdminEmail,
        schoolLogo,
        setSchoolLogo,
        adminName,
        setAdminName,
        adminAvatar,
        setAdminAvatar,
        schoolMotto,
        setSchoolMotto,
        schoolAddress,
        setSchoolAddress,
        reportCardFont,
        setReportCardFont,
        reportCardHeaderFont,
        setReportCardHeaderFont,
        reportCardHeaderFontSize,
        setReportCardHeaderFontSize,
        exportDatabase,
        importDatabase,
        syncBlobId,
        connectCloudSync,
        disconnectCloudSync
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
