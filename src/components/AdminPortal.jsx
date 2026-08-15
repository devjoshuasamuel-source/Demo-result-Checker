import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import ResultReport from './ResultReport';

export default function AdminPortal() {
  const {
    classes,
    subjects,
    students,
    results,
    auditLogs,
    gradingScale,
    teachers,
    addStudent,
    updateStudent,
    removeStudent,
    publishResult,
    unpublishResult,
    publishClassResults,
    unpublishClassResults,
    addPrincipalRemark,
    applyBulkRemarksByBand,
    saveGradingScale,
    getClassRanking,
    addTeacher,
    updateTeacher,
    removeTeacher,
    addSubject,
    updateSubject,
    removeSubject,
    updateClassSubjects,
    createClass,
    updateClass,
    removeClass,
    theme,
    toggleTheme,
    setCurrentRole,
    adminPassword,
    setAdminPassword,
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
    disconnectCloudSync,
    connectCloudSync
  } = useContext(AppContext);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Settings tab local states
  const [settSchoolName, setSettSchoolName] = useState(schoolName);
  const [settSchoolSubtitle, setSettSchoolSubtitle] = useState(schoolSubtitle);
  const [settSession, setSettSession] = useState(currentSession);
  const [settTerm, setSettTerm] = useState(currentTerm);
  const [settAllowReg, setSettAllowReg] = useState(allowStudentReg);
  const [settMaintMode, setSettMaintMode] = useState(maintenanceMode);
  const [settAdminEmail, setSettAdminEmail] = useState(adminEmail);
  const [settSchoolLogo, setSettSchoolLogo] = useState(schoolLogo);
  const [settAdminName, setSettAdminName] = useState(adminName);
  const [settAdminAvatar, setSettAdminAvatar] = useState(adminAvatar);
  const [settSchoolMotto, setSettSchoolMotto] = useState(schoolMotto);
  const [settSchoolAddress, setSettSchoolAddress] = useState(schoolAddress);
  const [settReportFont, setSettReportFont] = useState(reportCardFont);
  const [settHeaderFont, setSettHeaderFont] = useState(reportCardHeaderFont);
  const [settHeaderFontSize, setSettHeaderFontSize] = useState(reportCardHeaderFontSize);

  const [oldPasswordInput, setOldPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [pairKeyInput, setPairKeyInput] = useState('');

  const [showTeacherPassword, setShowTeacherPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setSettSchoolName(schoolName);
    setSettSchoolSubtitle(schoolSubtitle);
    setSettSession(currentSession);
    setSettTerm(currentTerm);
    setSettAllowReg(allowStudentReg);
    setSettMaintMode(maintenanceMode);
    setSettAdminEmail(adminEmail);
    setSettSchoolLogo(schoolLogo);
    setSettAdminName(adminName);
    setSettAdminAvatar(adminAvatar);
    setSettSchoolMotto(schoolMotto);
    setSettSchoolAddress(schoolAddress);
    setSettReportFont(reportCardFont);
    setSettHeaderFont(reportCardHeaderFont);
    setSettHeaderFontSize(reportCardHeaderFontSize);
  }, [schoolName, schoolSubtitle, currentSession, currentTerm, allowStudentReg, maintenanceMode, adminEmail, schoolLogo, adminName, adminAvatar, schoolMotto, schoolAddress, reportCardFont, reportCardHeaderFont, reportCardHeaderFontSize]);
  // Active admin tab selection
  const [activeTab, setActiveTab] = useState('students'); // students, curriculum, approval, grading, logs

  // Filter selection inside Approval queue tab
  const [approvalClass, setApprovalClass] = useState('jss1');
  const [approvalTerm, setApprovalTerm] = useState('3rd Term');
  const [approvalSession, setApprovalSession] = useState('2025/2026');

  // Student CRUD states
  const [editingStudent, setEditingStudent] = useState(null); // student object or 'new'
  
  // Class CRUD states
  const [editingClass, setEditingClass] = useState(null); // class object or 'new'
  const [classForm, setClassForm] = useState({
    id: '', name: '', arm: '', subjects: []
  });
  const [studentForm, setStudentForm] = useState({
    name: '', classId: 'jss1', rollNo: '', dob: '', fatherName: '', motherName: '', photo: '', parentContact: ''
  });

  // Teacher CRUD states
  const [editingTeacher, setEditingTeacher] = useState(null); // teacher object or 'new'
  const [teacherForm, setTeacherForm] = useState({
    name: '', email: '', password: '', assignedClass: 'jss1', subjects: [], photo: ''
  });

  // Subject CRUD states
  const [editingSubject, setEditingSubject] = useState(null); // subject object or 'new'
  const [subjectForm, setSubjectForm] = useState({
    id: '', name: '', defaultTeacher: ''
  });

  // Class structure subject allocation states
  const [editingClassSubjects, setEditingClassSubjects] = useState(null); // classId or null
  const [selectedClassSubjects, setSelectedClassSubjects] = useState([]); // array of subjectIds

  // Principal Remark edit modal state
  const [selectedResultForRemark, setSelectedResultForRemark] = useState(null); // result object
  const [remarkInput, setRemarkInput] = useState('');

  // Bulk print mode state
  const [bulkPrintActive, setBulkPrintActive] = useState(false);

  // Grading scale temporary state
  const [editedScale, setEditedScale] = useState([...gradingScale]);

  // Bulk remark band presets
  const [bulkBands, setBulkBands] = useState([
    { min: 75, max: 100, remark: 'An excellent academic performance. Promoted with honors.' },
    { min: 50, max: 74, remark: 'A very good results. Promoted to the next class.' },
    { min: 0, max: 49, remark: 'Satisfactory performance. You need to put more effort in key subjects.' }
  ]);

  // Handle student create or edit submit
  const handleStudentFormSubmit = (e) => {
    e.preventDefault();
    if (!studentForm.name.trim()) return;

    let targetRollNo = studentForm.rollNo ? parseInt(studentForm.rollNo) : null;
    if (studentForm.rollNo && (isNaN(targetRollNo) || targetRollNo < 0 || targetRollNo > 5000)) {
      alert("Roll number must be an integer between 0 and 5000.");
      return;
    }

    // Check uniqueness
    if (targetRollNo !== null) {
      const isDuplicate = students.some(s => 
        s.id !== (editingStudent === 'new' ? null : editingStudent.id) && s.rollNo === targetRollNo
      );
      if (isDuplicate) {
        alert(`Roll number ${targetRollNo} is already assigned to another student.`);
        return;
      }
    }

    const payload = {
      ...studentForm,
      rollNo: targetRollNo
    };

    if (editingStudent === 'new') {
      addStudent(payload, 'Admin Portal');
    } else {
      updateStudent(editingStudent.id, payload, 'Admin Portal');
    }

    setEditingStudent(null);
    setStudentForm({
      name: '', classId: 'jss1', rollNo: '', dob: '', fatherName: '', motherName: '', photo: '', parentContact: ''
    });
  };

  const startEditStudent = (std) => {
    setEditingStudent(std);
    setStudentForm({
      name: std.name,
      classId: std.classId,
      rollNo: std.rollNo !== undefined && std.rollNo !== null ? std.rollNo.toString() : '',
      dob: std.dob,
      fatherName: std.fatherName,
      motherName: std.motherName,
      photo: std.photo,
      parentContact: std.parentContact || ''
    });
  };

  const startNewStudent = () => {
    setEditingStudent('new');
    setStudentForm({
      name: '', classId: 'jss1', rollNo: '', dob: '', fatherName: '', motherName: '', photo: '', parentContact: ''
    });
  };

  const handleDeleteStudent = (studentId) => {
    const std = students.find(s => s.id === studentId);
    const name = std ? std.name : 'this student';
    if (window.confirm(`Are you sure you want to permanently delete student "${name}"? This action cannot be undone.`)) {
      removeStudent(studentId, 'Admin Portal');
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Passport size must be less than 2MB to optimize performance.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setStudentForm(prev => ({
        ...prev,
        photo: uploadEvent.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleTeacherPhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Passport size must be less than 2MB to optimize performance.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      setTeacherForm(prev => ({
        ...prev,
        photo: uploadEvent.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  // Teacher CRUD Handlers
  const handleTeacherFormSubmit = (e) => {
    e.preventDefault();
    if (!teacherForm.name.trim() || !teacherForm.email.trim()) return;

    if (editingTeacher === 'new') {
      addTeacher(teacherForm, 'Admin Portal');
    } else {
      updateTeacher(editingTeacher.id, teacherForm, 'Admin Portal');
    }

    setEditingTeacher(null);
    setTeacherForm({
      name: '', email: '', password: '', assignedClass: 'jss1', subjects: [], photo: ''
    });
  };

  const startEditTeacher = (t) => {
    setEditingTeacher(t);
    setTeacherForm({
      name: t.name,
      email: t.email,
      password: t.password || '',
      assignedClass: t.assignedClass,
      subjects: t.subjects || [],
      photo: t.photo || ''
    });
  };

  const startNewTeacher = () => {
    setEditingTeacher('new');
    setTeacherForm({
      name: '', email: '', password: '', assignedClass: 'jss1', subjects: [], photo: ''
    });
  };

  const handleDeleteTeacher = (teacherId) => {
    if (teachers.length <= 1) {
      alert('Cannot delete the only remaining teacher. You must have at least one teacher in the system.');
      return;
    }
    if (window.confirm('Are you sure you want to remove this class teacher?')) {
      removeTeacher(teacherId, 'Admin Portal');
    }
  };

  // Subject CRUD Handlers
  const handleSubjectFormSubmit = (e) => {
    e.preventDefault();
    if (!subjectForm.name.trim()) return;

    const subData = { ...subjectForm };
    if (editingSubject === 'new') {
      // Auto-generate derived clean ID from the name
      const derivedId = subjectForm.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
      subData.id = derivedId || 'subj_' + Date.now();
      addSubject(subData, 'Admin Portal');
    } else {
      updateSubject(editingSubject.id, subData, 'Admin Portal');
    }

    setEditingSubject(null);
    setSubjectForm({
      id: '', name: '', defaultTeacher: ''
    });
  };

  const startEditSubject = (sub) => {
    setEditingSubject(sub);
    setSubjectForm({
      id: sub.id,
      name: sub.name,
      defaultTeacher: sub.defaultTeacher || ''
    });
  };

  const startNewSubject = () => {
    setEditingSubject('new');
    setSubjectForm({
      id: '', name: '', defaultTeacher: ''
    });
  };

  const handleDeleteSubject = (subjectId) => {
    if (Object.keys(subjects).length <= 1) {
      alert('Cannot delete the only remaining subject. You must have at least one subject in the system.');
      return;
    }
    if (window.confirm('Are you sure you want to remove this subject? This will also remove it from all class structures and assigned teachers.')) {
      removeSubject(subjectId, 'Admin Portal');
    }
  };

  // Class CRUD Handlers
  const handleClassFormSubmit = (e) => {
    e.preventDefault();
    if (!classForm.name.trim()) return;

    const baseName = classForm.name.trim();
    const arm = classForm.arm.trim();

    if (editingClass === 'new') {
      const combined = arm ? `${baseName} ${arm}` : baseName;
      const classIdCleaned = combined.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!classIdCleaned) {
        alert('Invalid Class Name/Arm. It must contain alphanumeric characters (e.g. JSS 3, Arm: A).');
        return;
      }
      const exists = classes.some(c => c.id === classIdCleaned);
      if (exists) {
        alert(`A class with the derived code "${classIdCleaned}" already exists. Please choose a different name or arm.`);
        return;
      }
      createClass(classIdCleaned, baseName, arm, classForm.subjects, 'Admin Portal');
    } else {
      updateClass(editingClass.id, baseName, arm, 'Admin Portal');
      updateClassSubjects(editingClass.id, classForm.subjects, 'Admin Portal');
    }

    setEditingClass(null);
    setClassForm({
      id: '', name: '', arm: '', subjects: []
    });
  };

  const startEditClass = (cl) => {
    setEditingClass(cl);
    setClassForm({
      id: cl.id,
      name: cl.baseName || cl.name,
      arm: cl.arm || '',
      subjects: cl.subjects || []
    });
  };

  const startNewClass = () => {
    setEditingClass('new');
    setClassForm({
      id: '', name: '', arm: '', subjects: []
    });
  };

  const handleDeleteClass = (classId) => {
    const classStudentsCount = students.filter(s => s.classId === classId).length;
    let confirmMsg = 'Are you sure you want to delete this class structure?';
    if (classStudentsCount > 0) {
      confirmMsg = `This class has ${classStudentsCount} registered student(s). Deleting the class structure will leave them unassigned. Are you sure you want to proceed?`;
    }
    if (window.confirm(confirmMsg)) {
      removeClass(classId, 'Admin Portal');
      if (editingClass && editingClass.id === classId) {
        setEditingClass(null);
        setClassForm({ id: '', name: '', arm: '', subjects: [] });
      }
    }
  };

  // Class Structure Subject Allocation Handlers
  const handleSaveClassSubjects = () => {
    if (!editingClassSubjects) return;
    updateClassSubjects(editingClassSubjects, selectedClassSubjects, 'Admin Portal');
    setEditingClassSubjects(null);
    setSelectedClassSubjects([]);
  };

  const startEditClassSubjects = (cl) => {
    setEditingClassSubjects(cl.id);
    setSelectedClassSubjects(cl.subjects || []);
  };

  // Approval operations
  const handleSinglePublish = (resId) => {
    publishResult(resId, 'Admin Portal');
  };

  const handleSingleUnpublish = (resId) => {
    unpublishResult(resId, 'Admin Portal');
  };

  const handleBulkPublish = () => {
    publishClassResults(approvalClass, approvalTerm, approvalSession, 'Admin Portal');
  };

  const handleBulkUnpublish = () => {
    unpublishClassResults(approvalClass, approvalTerm, approvalSession, 'Admin Portal');
  };

  const openRemarkModal = (res) => {
    setSelectedResultForRemark(res);
    setRemarkInput(res.remarks?.principal || '');
  };

  const handleSaveRemark = () => {
    if (!selectedResultForRemark) return;
    addPrincipalRemark(selectedResultForRemark.id, remarkInput, 'Admin Portal');
    setSelectedResultForRemark(null);
    setRemarkInput('');
  };

  const handleApplyBulkRemarks = () => {
    applyBulkRemarksByBand(approvalClass, approvalTerm, approvalSession, bulkBands, 'Admin Portal');
    alert('Bulk Principal remarks successfully applied to all results in this class based on performance bands!');
  };

  // Save modified grading rules
  const handleGradingChange = (idx, field, val) => {
    const updated = [...editedScale];
    updated[idx] = {
      ...updated[idx],
      [field]: field === 'grade' || field === 'remark' || field === 'color' ? val : parseInt(val)
    };
    setEditedScale(updated);
  };

  const handleSaveGrading = () => {
    saveGradingScale(editedScale, 'Admin Portal');
    alert('Grading scale thresholds successfully updated!');
  };

  // Get matching results in current class for review list
  const filteredResults = results.filter(
    r => r.classId === approvalClass && r.term === approvalTerm && r.session === approvalSession
  );

  // Filter students active in the current review class
  const classStudents = students.filter(s => s.classId === approvalClass && s.active);

  // Bulk print layouts helper
  const handleStartBulkPrint = () => {
    // Only print published results
    const published = filteredResults.filter(r => r.status === 'published');
    if (published.length === 0) {
      alert('There are no published results to print for this class/term.');
      return;
    }
    setBulkPrintActive(true);
    // Let layout render then trigger browser print
    setTimeout(() => {
      window.print();
    }, 300);
  };

  if (bulkPrintActive) {
    const published = filteredResults.filter(r => r.status === 'published');
    return (
      <div style={{ padding: '1rem', backgroundColor: '#ffffff' }}>
        <div className="no-print" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-secondary)',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border)',
          marginBottom: '2rem'
        }}>
          <span style={{ fontWeight: 600 }}>Bulk Printing mode ({published.length} Results loaded)</span>
          <button onClick={() => setBulkPrintActive(false)} className="btn btn-secondary">
            Exit Print View
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {published.map(res => (
            <ResultReport key={res.id} customResult={res} />
          ))}
        </div>
      </div>
    );
  }


  const nameParts = schoolName.split(' ');
  const firstWord = nameParts[0] || 'MANNA';
  const restOfName = nameParts.slice(1).join(' ') || 'Academy';

  return (
    <div className="admin-layout-container">
      {/* Sidebar overlay for mobile drawer */}
      <div 
        className={`admin-sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Admin Sidebar Navigation */}
      <aside className={`admin-sidebar-wrapper ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Brand logo */}
        <div className="admin-sidebar-logo" onClick={() => setCurrentRole('student')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src={schoolLogo} alt={`${schoolName} Logo`} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          <div>
            <span className="admin-sidebar-logo-text">{firstWord.toUpperCase()}</span>
            <span className="admin-sidebar-logo-sub">{restOfName.toUpperCase()}</span>
          </div>
        </div>

        <nav className="admin-sidebar-nav">
          <button onClick={() => { setActiveTab('students'); setSidebarOpen(false); }} className={`admin-sidebar-link ${activeTab === 'students' ? 'active' : ''}`} title="Student Registry">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Student Registry</span>
          </button>

          <button onClick={() => { setActiveTab('teachers'); setSidebarOpen(false); }} className={`admin-sidebar-link ${activeTab === 'teachers' ? 'active' : ''}`} title="Class Teachers">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Class Teachers</span>
          </button>

          <button onClick={() => { setActiveTab('subjects'); setSidebarOpen(false); }} className={`admin-sidebar-link ${activeTab === 'subjects' ? 'active' : ''}`} title="Subject Registry">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14h6m-6 4h6m-6-8h6" />
            </svg>
            <span>Subject Registry</span>
          </button>

          <button onClick={() => { setActiveTab('classes'); setSidebarOpen(false); }} className={`admin-sidebar-link ${activeTab === 'classes' ? 'active' : ''}`} title="Class Registry">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span>Class Registry</span>
          </button>

          <button onClick={() => { setActiveTab('curriculum'); setSidebarOpen(false); }} className={`admin-sidebar-link ${activeTab === 'curriculum' ? 'active' : ''}`} title="Curriculum Setup">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span>Curriculum Setup</span>
          </button>

          <button onClick={() => { setActiveTab('approval'); setSidebarOpen(false); }} className={`admin-sidebar-link ${activeTab === 'approval' ? 'active' : ''}`} title="Results Queue">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Results Queue</span>
          </button>

          <button onClick={() => { setActiveTab('grading'); setSidebarOpen(false); }} className={`admin-sidebar-link ${activeTab === 'grading' ? 'active' : ''}`} title="Grading Scale">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <span>Grading Scale</span>
          </button>

          <button onClick={() => { setActiveTab('logs'); setSidebarOpen(false); }} className={`admin-sidebar-link ${activeTab === 'logs' ? 'active' : ''}`} title="Audit Logs">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <span>Audit Logs</span>
          </button>

          <button onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }} className={`admin-sidebar-link ${activeTab === 'settings' ? 'active' : ''}`} title="Portal Settings">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Portal Settings</span>
          </button>
        </nav>
      </aside>

      {/* Main Area Wrapper */}
      <div className="admin-main-wrapper">
        {/* Top Header Bar */}
        <header className="admin-header-bar no-print">
          {mobileSearchOpen ? (
            <div className="admin-header-search-expanded" style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '0.75rem' }}>
              <button 
                type="button"
                onClick={() => setMobileSearchOpen(false)} 
                className="btn btn-secondary btn-icon btn-search-back"
                title="Back"
                style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', flexShrink: 0, padding: 0 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="admin-header-search-container-expanded" style={{ position: 'relative', flexGrow: 1 }}>
                <svg className="admin-header-search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.7 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Search registry..." 
                  className="admin-header-search-input"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  autoFocus
                />
              </div>
            </div>
          ) : (
            <>
              {/* Left Breadcrumbs & Mobile toggle button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button 
                  onClick={() => setSidebarOpen(true)} 
                  className="admin-hamburger-btn" 
                  title="Open Navigation Menu"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Desktop Sidebar Collapse Toggle */}
                <button 
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
                  className="admin-collapse-toggle-btn no-print" 
                  title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                  style={{
                    backgroundColor: '#facc15',
                    color: '#0f172a',
                    border: '1px solid rgba(0, 0, 0, 0.15)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    marginRight: '0.75rem',
                    boxShadow: '0 2px 8px rgba(250, 204, 21, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {sidebarCollapsed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7M19 19l-7-7 7-7" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Right Header items */}
              <div className="admin-header-actions">
                {/* Mobile Search Toggle Trigger */}
                <button 
                  onClick={() => setMobileSearchOpen(true)}
                  className="btn btn-secondary btn-icon admin-mobile-search-trigger-btn"
                  title="Search registry"
                  style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', padding: 0 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>

                {/* Search container */}
                <div className="admin-header-search-container">
                  <svg className="admin-header-search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input 
                    type="text" 
                    placeholder="Search registry..." 
                    className="admin-header-search-input"
                  />
                </div>

                {/* Notification Bell */}
                <button 
                  className="btn btn-secondary btn-icon" 
                  style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', padding: 0 }}
                  title="Notifications"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="btn btn-secondary btn-icon"
                  title="Toggle Light/Dark Theme"
                  style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', padding: 0 }}
                >
                  {theme === 'light' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m2.828-9.9a5 5 0 11-7.07 7.07l.707-.707M17.657 17.657l.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                </button>

                {/* Profile Avatar */}
                <div className="admin-header-profile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img 
                    src={adminAvatar}
                    alt="Admin Avatar"
                    className="admin-header-avatar"
                  />
                  <div className="admin-header-profile-info">
                    <span className="admin-header-profile-name">{adminName}</span>
                    <span className="admin-header-profile-role">Principal Admin</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      logoutAdmin();
                      setCurrentRole('student');
                    }}
                    className="btn"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      color: '#ff8a8a',
                      border: '1px solid rgba(255, 138, 138, 0.4)',
                      borderRadius: 'var(--radius-full)',
                      cursor: 'pointer',
                      marginLeft: '0.75rem',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 6px rgba(239, 68, 68, 0.1)'
                    }}
                    title="Secure Lock Dashboard"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </header>

        {/* Scrollable Content Pane */}
        <div className="admin-content-scrollable">
        
        {/* Tab 1: Student Manager (CRUD) */}
        {activeTab === 'students' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Student Registry</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Manage profiles, roll numbers, and parent identity details.</p>
              </div>
              
              {!editingStudent && (
                allowStudentReg ? (
                  <button onClick={startNewStudent} className="btn btn-primary">
                    Register New Student
                  </button>
                ) : (
                  <div style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--warning-light)', color: 'var(--warning)', borderRadius: 'var(--radius-md)', fontSize: '0.825rem', fontWeight: 600 }}>
                    Registry Locked by Admin
                  </div>
                )
              )}
            </div>

            {/* Student editor inline form */}
            {editingStudent && (
              <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                  {editingStudent === 'new' ? 'Register New Student Profile' : `Modify Profile: ${editingStudent.name}`}
                </h3>

                <form onSubmit={handleStudentFormSubmit} className="responsive-form-grid-three">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Roll Number (0-5000) (Optional - Auto generates if empty)</label>
                    <input
                      type="number"
                      min="0"
                      max="5000"
                      className="form-control"
                      placeholder="e.g. 481"
                      value={studentForm.rollNo}
                      onChange={(e) => setStudentForm({ ...studentForm, rollNo: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Class Assignment</label>
                    <select
                      className="form-control"
                      value={studentForm.classId}
                      onChange={(e) => setStudentForm({ ...studentForm, classId: e.target.value })}
                    >
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                      type="date"
                      className="form-control"
                      value={studentForm.dob}
                      onChange={(e) => setStudentForm({ ...studentForm, dob: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Father's Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={studentForm.fatherName}
                      onChange={(e) => setStudentForm({ ...studentForm, fatherName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Mother's Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={studentForm.motherName}
                      onChange={(e) => setStudentForm({ ...studentForm, motherName: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label>Parent's Contact / Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. +234 803 123 4567"
                      value={studentForm.parentContact}
                      onChange={(e) => setStudentForm({ ...studentForm, parentContact: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label>Student Passport Photo</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {studentForm.photo ? (
                        <img
                          src={studentForm.photo}
                          alt="Passport Preview"
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1px solid var(--border)'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--bg-tertiary)',
                          border: '1px dashed var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          color: 'var(--text-secondary)'
                        }}>No Pic</div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', height: 'auto', flex: 1 }}
                        onChange={handlePhotoUpload}
                      />
                    </div>
                  </div>

                  <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button type="button" onClick={() => setEditingStudent(null)} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingStudent === 'new' ? 'Create Record' : 'Apply Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Students List Table */}
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Roll No</th>
                    <th>Class</th>
                    <th>DOB</th>
                    <th>Parents</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(std => {
                    const cl = classes.find(c => c.id === std.classId) || { name: std.classId };
                    return (
                      <tr key={std.id}>
                        <td>
                          <img src={std.photo} alt={std.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }} />
                        </td>
                        <td style={{ fontWeight: 600 }}>{std.name}</td>
                        <td><code>{std.rollNo}</code></td>
                        <td>{cl.name}</td>
                        <td>{std.dob}</td>
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          Father: {std.fatherName || '-'}<br/>
                          Mother: {std.motherName || '-'}<br/>
                          {std.parentContact && <span>Contact: <strong>{std.parentContact}</strong></span>}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                            <button onClick={() => startEditStudent(std)} className="btn btn-secondary btn-icon" title="Edit Student">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(std.id)}
                              className="btn btn-danger btn-icon"
                              title="Delete Student"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Class Teachers Registry (CRUD) */}
        {activeTab === 'teachers' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Class Teachers Registry</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Manage teacher assignments, credentials, and subject responsibilities.</p>
              </div>
              
              {!editingTeacher && (
                <button onClick={startNewTeacher} className="btn btn-primary">
                  Register New Class Teacher
                </button>
              )}
            </div>

            {/* Teacher CRUD Form */}
            {editingTeacher && (
              <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                  {editingTeacher === 'new' ? 'Register New Class Teacher Profile' : `Modify Profile: ${editingTeacher.name}`}
                </h3>

                <form onSubmit={handleTeacherFormSubmit} className="responsive-form-grid-three">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={teacherForm.name}
                      onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={teacherForm.email}
                      onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Assigned Class</label>
                    <select
                      className="form-control"
                      value={teacherForm.assignedClass}
                      onChange={(e) => setTeacherForm({ ...teacherForm, assignedClass: e.target.value, subjects: [] })}
                    >
                      {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Portal Login Password</label>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <input
                        type={showTeacherPassword ? 'text' : 'password'}
                        className="form-control"
                        placeholder="e.g. password123"
                        value={teacherForm.password}
                        onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                        required
                        style={{ width: '100%', paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowTeacherPassword(!showTeacherPassword)}
                        style={{
                          position: 'absolute',
                          right: '0.75rem',
                          background: 'none',
                          border: 'none',
                          padding: '0.25rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-secondary)',
                          opacity: 0.7,
                          transition: 'opacity 0.2s ease'
                        }}
                        aria-label={showTeacherPassword ? "Hide password" : "Show password"}
                        onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
                      >
                        {showTeacherPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.025 10.025 0 014.132-5.4M9.88 9.88a3 3 0 104.24 4.24M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label>Teacher Passport Photo</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {teacherForm.photo ? (
                        <img
                          src={teacherForm.photo}
                          alt="Passport Preview"
                          style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '1px solid var(--border)'
                          }}
                        />
                      ) : (
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--bg-tertiary)',
                          border: '1px dashed var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.65rem',
                          color: 'var(--text-secondary)'
                        }}>No Pic</div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="form-control"
                        style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem', height: 'auto', flex: 1 }}
                        onChange={handleTeacherPhotoUpload}
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 3' }}>
                    <label>Subjects Taught in Class</label>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.75rem',
                      marginTop: '0.5rem',
                      border: '1px solid var(--border)',
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-secondary)'
                    }}>
                      {(classes.find(c => c.id === teacherForm.assignedClass)?.subjects || []).map(subId => {
                        const subName = subjects[subId]?.name || subId;
                        const isChecked = teacherForm.subjects.includes(subId);
                        return (
                          <label key={subId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 'normal', cursor: 'pointer', margin: 0 }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const updatedSubjects = e.target.checked
                                  ? [...teacherForm.subjects, subId]
                                  : teacherForm.subjects.filter(id => id !== subId);
                                setTeacherForm({ ...teacherForm, subjects: updatedSubjects });
                              }}
                            />
                            {subName}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ gridColumn: 'span 3', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button type="button" onClick={() => setEditingTeacher(null)} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingTeacher === 'new' ? 'Register Teacher' : 'Apply Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Teachers Registry Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {teachers.map(t => (
                <div key={t.id} className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--border)', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => startEditTeacher(t)} className="btn btn-secondary btn-icon" style={{ width: '28px', height: '28px', padding: 0 }} title="Edit Teacher">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDeleteTeacher(t.id)} className="btn btn-danger btn-icon" style={{ width: '28px', height: '28px', padding: 0 }} title="Remove Teacher">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    {t.photo ? (
                      <img
                        src={t.photo}
                        alt={t.name}
                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                      />
                    ) : (
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--bg-tertiary)',
                        border: '1px dashed var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        color: 'var(--text-secondary)'
                      }}>No Pic</div>
                    )}
                    <div>
                      <h3 style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0, paddingRight: '3rem' }}>{t.name}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{t.email}</p>
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Assigned Form Class:</span>
                      <span className="badge badge-info" style={{ textTransform: 'uppercase', padding: '0.25rem 0.5rem' }}>{t.assignedClass}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Portal Password:</span>
                      <code style={{ fontSize: '0.825rem', color: 'var(--primary)' }}>{t.password || 'password123'}</code>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>Subject Responsibilities:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {t.subjects && t.subjects.length > 0 ? (
                        t.subjects.map(s => (
                          <span key={s} style={{
                            fontSize: '0.75rem',
                            backgroundColor: 'var(--bg-tertiary)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)'
                          }}>
                            {subjects[s]?.name || s}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '0.75rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>No subjects assigned</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2.7: Subject Registry (CRUD) */}
        {activeTab === 'subjects' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Subject Registry</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Configure academic subjects and default teacher allocations.</p>
              </div>
              
              {!editingSubject && (
                <button onClick={startNewSubject} className="btn btn-primary">
                  Register New Subject
                </button>
              )}
            </div>

            {/* Subject CRUD Form */}
            {editingSubject && (
              <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                  {editingSubject === 'new' ? 'Register New Subject' : `Modify Subject: ${editingSubject.name}`}
                </h3>

                <form onSubmit={handleSubjectFormSubmit} className="responsive-grid-two-cols" style={{ gap: '1rem' }}>
                  {/* Subject Name Input */}

                  <div className="form-group">
                    <label>Subject Title / Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Agricultural Science"
                      value={subjectForm.name}
                      onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button type="button" onClick={() => setEditingSubject(null)} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingSubject === 'new' ? 'Register Subject' : 'Apply Changes'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Subjects Table */}
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Subject Name</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(subjects).map(sub => (
                    <tr key={sub.id}>
                      <td style={{ fontWeight: 600 }}>{sub.name}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button onClick={() => startEditSubject(sub)} className="btn btn-secondary btn-icon" title="Edit Subject">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button onClick={() => handleDeleteSubject(sub.id)} className="btn btn-danger btn-icon" title="Delete Subject">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Class Registry */}
        {activeTab === 'classes' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Class Registry Manager</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Register classes, configure names, and assign curriculum subjects.</p>
              </div>
              <button onClick={startNewClass} className="btn btn-primary">
                + Register New Class
              </button>
            </div>

            {editingClass && (
              <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                  {editingClass === 'new' ? 'Register New Class' : `Modify Class: ${editingClass.name}`}
                </h3>

                <form onSubmit={handleClassFormSubmit} className="responsive-grid-two-cols" style={{ gap: '1.25rem' }}>
                  <div className="form-group">
                    <label>Base Class / Grade</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. JSS 1"
                      value={classForm.name}
                      onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Class Arm / Division</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. A, B, Science, Art"
                      value={classForm.arm}
                      onChange={(e) => setClassForm({ ...classForm, arm: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ marginBottom: '0.5rem', display: 'block' }}>Allocate Subjects to Curriculum</label>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '0.75rem',
                      backgroundColor: 'var(--bg-tertiary)',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)'
                    }}>
                      {Object.values(subjects).map(sub => {
                        const isChecked = classForm.subjects.includes(sub.id);
                        return (
                          <label key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem' }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setClassForm(prev => {
                                  const updatedSubjects = checked
                                    ? [...prev.subjects, sub.id]
                                    : prev.subjects.filter(id => id !== sub.id);
                                  return { ...prev, subjects: updatedSubjects };
                                });
                              }}
                            />
                            <span>{sub.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ gridColumn: 'span 2', display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
                      {editingClass === 'new' ? 'Create Class' : 'Save Changes'}
                    </button>
                    <button type="button" onClick={() => setEditingClass(null)} className="btn btn-secondary">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Classes Table */}
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Base Class</th>
                    <th>Arm / Division</th>
                    <th>Students Count</th>
                    <th>Curriculum Subjects</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classes.map(cl => {
                    const studentCount = students.filter(s => s.classId === cl.id).length;
                    return (
                      <tr key={cl.id}>
                        <td style={{ fontWeight: 600 }}>{cl.baseName || cl.name}</td>
                        <td style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{cl.arm || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 'normal' }}>None</span>}</td>
                        <td style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{studentCount}</td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                            {cl.subjects && cl.subjects.length > 0 ? (
                              cl.subjects.map(subId => (
                                <span key={subId} style={{
                                  fontSize: '0.7rem',
                                  backgroundColor: 'var(--bg-tertiary)',
                                  padding: '0.15rem 0.4rem',
                                  borderRadius: 'var(--radius-sm)',
                                  border: '1px solid var(--border)'
                                }}>
                                  {subjects[subId]?.name || subId}
                                </span>
                              ))
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No subjects allocated</span>
                            )}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                            <button onClick={() => startEditClass(cl)} className="btn btn-secondary btn-icon" title="Edit Class">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button onClick={() => handleDeleteClass(cl.id)} className="btn btn-danger btn-icon" title="Delete Class">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Curriculum Configuration */}
        {activeTab === 'curriculum' && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Curriculum & Form Allocation</h2>
              <p style={{ color: 'var(--text-secondary)' }}>View school class structures, subject registers, and teacher assignments.</p>
            </div>

            <div className="responsive-grid-split">
              {/* Classes structural list */}
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>Class structures</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {classes.map(cl => (
                    <div key={cl.id} className="glass-panel" style={{ padding: '1.25rem', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
                        <div>
                          <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginRight: '0.5rem' }}>{cl.name.toUpperCase()}</span>
                          <span className="badge badge-info">{cl.subjects?.length || 0} Subjects</span>
                        </div>
                        <button
                          onClick={() => startEditClassSubjects(cl)}
                          className="btn btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.725rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          title="Allocate Subjects to Class"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Allocate Subjects
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {cl.subjects?.map(subId => (
                          <span key={subId} style={{
                            fontSize: '0.75rem',
                            backgroundColor: 'var(--bg-tertiary)',
                            padding: '0.25rem 0.5rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)'
                          }}>
                            {subjects[subId]?.name || subId}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Teachers lists (View-Only in Curriculum setup tab) */}
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--accent)', marginBottom: '0.75rem' }}>Assigned Class Teachers</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {teachers.map(t => (
                    <div key={t.id} className="glass-panel" style={{ padding: '1rem', border: '1px solid var(--border)' }}>
                      <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.name}</h4>
                      <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>Email: {t.email}</p>
                      
                      <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', fontWeight: 600 }}>
                        <span>Class: <strong style={{ color: 'var(--primary)' }}>{t.assignedClass.toUpperCase()}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Approval Queue */}
        {activeTab === 'approval' && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Academic Reviews Queue</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Review teacher submissions, customize principal's remarks, and manage publication states.</p>
            </div>

            {/* Approval Class/Term Filters */}
            <div className="glass-panel responsive-form-grid-three" style={{
              padding: '1.25rem',
              marginBottom: '2rem',
              border: '1px solid var(--border)'
            }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Target Class</label>
                <select className="form-control" value={approvalClass} onChange={(e) => setApprovalClass(e.target.value)}>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Academic Session</label>
                <select className="form-control" value={approvalSession} onChange={(e) => setApprovalSession(e.target.value)}>
                  <option value="2025/2026">2025/2026 Session</option>
                  <option value="2026/2027">2026/2027 Session</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Academic Term</label>
                <select className="form-control" value={approvalTerm} onChange={(e) => setApprovalTerm(e.target.value)}>
                  <option value="1st Term">1st Term</option>
                  <option value="2nd Term">2nd Term</option>
                  <option value="3rd Term">3rd Term</option>
                </select>
              </div>
            </div>

            {/* Bulk Controls */}
            <div className="glass-panel" style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleBulkPublish} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                  Publish All Drafts
                </button>
                <button onClick={handleBulkUnpublish} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                  Withdraw All Published
                </button>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handleApplyBulkRemarks} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', borderColor: 'var(--accent)' }}>
                  Bulk Remarks By Band
                </button>

                <button onClick={handleStartBulkPrint} className="btn btn-primary" style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--accent)' }}>
                  Bulk Print Published Cards
                </button>
              </div>
            </div>

            {/* Results Review Table */}
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Roll No</th>
                    <th>Average Score</th>
                    <th>Class Position</th>
                    <th>Principal Remark</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map(std => {
                    const res = filteredResults.find(r => r.studentId === std.id);
                    
                    // Stats calculated using position tools
                    const rankings = getClassRanking(approvalClass, approvalTerm, approvalSession);
                    const rankInfo = rankings[std.id] || { rank: '-', average: '-' };

                    return (
                      <tr key={std.id}>
                        <td style={{ fontWeight: 600 }}>{std.name}</td>
                        <td><code>{std.rollNo}</code></td>
                        <td style={{ fontWeight: 'bold' }}>{rankInfo.average !== '-' ? rankInfo.average + '%' : '-'}</td>
                        <td>{rankInfo.rank !== '-' ? rankInfo.rank : '-'}</td>
                        <td style={{ fontSize: '0.775rem', fontStyle: 'italic', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {res?.remarks?.principal || <span style={{ color: 'var(--text-muted)' }}>No remark added</span>}
                        </td>
                        <td>
                          {res ? (
                            <span className={`badge ${res.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                              {res.status}
                            </span>
                          ) : (
                            <span className="badge badge-danger" style={{ opacity: 0.5 }}>Unsubmitted</span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {res ? (
                            <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                              <button onClick={() => openRemarkModal(res)} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.725rem' }}>
                                Principal Remark
                              </button>
                              
                              {res.status === 'draft' ? (
                                <button onClick={() => handleSinglePublish(res.id)} className="btn btn-success" style={{ padding: '0.3rem 0.6rem', fontSize: '0.725rem' }}>
                                  Approve & Release
                                </button>
                              ) : (
                                <button onClick={() => handleSingleUnpublish(res.id)} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.725rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}>
                                  Withdraw
                                </button>
                              )}
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No scores submitted</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bulk Remark Threshold Config details */}
            <div className="glass-panel" style={{ padding: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>Bulk Remarks Ranges configuration</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {bulkBands.map((band, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: '100px' }}>Avg {band.min}% - {band.max}%:</span>
                    <input
                      type="text"
                      className="form-control"
                      style={{ flex: 1, padding: '0.35rem 0.5rem', fontSize: '0.8rem' }}
                      value={band.remark}
                      onChange={(e) => {
                        const updated = [...bulkBands];
                        updated[idx].remark = e.target.value;
                        setBulkBands(updated);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Grading Scale manager */}
        {activeTab === 'grading' && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Grading Scale Boundaries</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Configure range limits and remarks mapping for Nigerian WAEC standards.</p>
            </div>

            <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {editedScale.map((rule, idx) => (
                  <div key={rule.grade} className="grading-scale-row">
                    <div>
                      <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>Grade {rule.grade}</span>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.7rem' }}>Min Score</label>
                      <input
                        type="number"
                        className="form-control"
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                        value={rule.min}
                        onChange={(e) => handleGradingChange(idx, 'min', e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.7rem' }}>Max Score</label>
                      <input
                        type="number"
                        className="form-control"
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                        value={rule.max}
                        onChange={(e) => handleGradingChange(idx, 'max', e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.7rem' }}>Qualitative Remark</label>
                      <input
                        type="text"
                        className="form-control"
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                        value={rule.remark}
                        onChange={(e) => handleGradingChange(idx, 'remark', e.target.value)}
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label style={{ fontSize: '0.7rem' }}>Alert Color Color-Code</label>
                      <select
                        className="form-control"
                        style={{ padding: '0.35rem 0.5rem', fontSize: '0.85rem' }}
                        value={rule.color}
                        onChange={(e) => handleGradingChange(idx, 'color', e.target.value)}
                      >
                        <option value="var(--success)">Green (Success)</option>
                        <option value="var(--warning)">Orange (Warning)</option>
                        <option value="var(--danger)">Red (Danger)</option>
                      </select>
                    </div>
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                  <button onClick={handleSaveGrading} className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                    Save Grading Rules
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Audit Log visual timelists */}
        {activeTab === 'logs' && (
          <div>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Audit Ledger Logs</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Chronological history ledger of result submissions, modifications, and publications.</p>
            </div>

            <div className="responsive-grid-split">
              {/* Audit timelines */}
              <div className="glass-panel" style={{ padding: '1.5rem', maxHeight: '600px', overflowY: 'auto' }}>
                <div className="audit-timeline">
                  {auditLogs.map(log => (
                    <div key={log.id} className="audit-item">
                      <div className="audit-meta">
                        <span>User: <strong>{log.user}</strong></span>
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="audit-title">{log.action}</div>
                      <div className="audit-desc">{log.details}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulated Parent Notifications dashboard */}
              <div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--primary)', marginBottom: '0.75rem' }}>Parent Dispatch Alerts Log</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Dispatched SMS / Email logs fired in background when results are published.
                </p>

                <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '480px', overflowY: 'auto' }}>
                  {results.filter(r => r.status === 'published').map(res => {
                    const std = students.find(s => s.id === res.studentId) || {};
                    return (
                      <div key={res.id} style={{
                        padding: '0.75rem',
                        backgroundColor: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                        fontSize: '0.75rem'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontWeight: 600 }}>
                          <span style={{ color: 'var(--success)' }}>SMS Dispatch Sent</span>
                          <span style={{ color: 'var(--text-muted)' }}>{res.remarks?.principalDate}</span>
                        </div>
                        <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                          "Dear Parent, {std.name}'s {res.term} results for the {res.session} academic session have been published. Name: {std.name}, Roll No: {std.rollNo}. Please check results checker portal."
                        </p>
                      </div>
                    );
                  })}
                  {results.filter(r => r.status === 'published').length === 0 && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                      No dispatched notification logs. Notifications are sent when results are published.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Tab 9: Portal Settings */}
        {activeTab === 'settings' && (
          <div style={{ animation: 'fadeIn 0.3s ease' }}>
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Portal Settings</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Manage school branding, active term records, registration locks, and portal access variables.</p>
            </div>

            <div className="settings-grid-layout">
              {/* Branding Section */}
              <div className="glass-panel" style={{ padding: '1.75rem', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  School Branding
                </h3>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ position: 'relative' }}>
                    <img 
                      src={settSchoolLogo} 
                      alt="Logo Preview" 
                      style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'contain', backgroundColor: '#ffffff', padding: '6px', border: '2px solid var(--border)' }} 
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>Change School Logo</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      style={{ fontSize: '0.75rem' }} 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 1024 * 1024) {
                            alert('Error: Image size should be less than 1MB to avoid local storage overflow.');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (uploadEvent) => {
                            setSettSchoolLogo(uploadEvent.target.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>PNG, JPG, or SVG. Max size 1MB.</span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="schoolNameInput">School Name</label>
                  <input
                    id="schoolNameInput"
                    type="text"
                    className="form-control"
                    value={settSchoolName}
                    onChange={(e) => setSettSchoolName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="schoolSubtitleInput">School Subtitle / Motto Banner</label>
                  <input
                    id="schoolSubtitleInput"
                    type="text"
                    className="form-control"
                    value={settSchoolSubtitle}
                    onChange={(e) => setSettSchoolSubtitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="schoolMottoInput">School Motto (Report Card)</label>
                  <input
                    id="schoolMottoInput"
                    type="text"
                    className="form-control"
                    value={settSchoolMotto}
                    onChange={(e) => setSettSchoolMotto(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="schoolAddressInput">School Address & Metadata (Report Card)</label>
                  <textarea
                    id="schoolAddressInput"
                    className="form-control"
                    rows="2"
                    value={settSchoolAddress}
                    onChange={(e) => setSettSchoolAddress(e.target.value)}
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reportCardFontSelect">Report Card Body Font Style</label>
                  <select
                    id="reportCardFontSelect"
                    className="form-control"
                    value={settReportFont}
                    onChange={(e) => setSettReportFont(e.target.value)}
                  >
                    <option value="inter">Inter (Modern & Clean)</option>
                    <option value="outfit">Outfit (Sleek & Geometric)</option>
                    <option value="raleway">Raleway (Elegant & Stylish Sans-serif)</option>
                    <option value="baloo2">Baloo 2 (Playful & Friendly Rounded)</option>
                    <option value="lora">Lora (Classic Book Serif)</option>
                    <option value="cinzel">Cinzel (Traditional Roman Serif)</option>
                    <option value="playfair">Playfair Display (Premium Editorial Serif)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="reportCardHeaderFontSelect">Report Card Header Font Style</label>
                  <select
                    id="reportCardHeaderFontSelect"
                    className="form-control"
                    value={settHeaderFont}
                    onChange={(e) => setSettHeaderFont(e.target.value)}
                  >
                    <option value="inter">Inter (Modern & Clean)</option>
                    <option value="outfit">Outfit (Sleek & Geometric)</option>
                    <option value="raleway">Raleway (Elegant & Stylish Sans-serif)</option>
                    <option value="baloo2">Baloo 2 (Playful & Friendly Rounded)</option>
                    <option value="lora">Lora (Classic Book Serif)</option>
                    <option value="cinzel">Cinzel (Traditional Roman Serif)</option>
                    <option value="playfair">Playfair Display (Premium Editorial Serif)</option>
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="reportCardHeaderFontSizeSelect">Report Card Header Font Size</label>
                  <select
                    id="reportCardHeaderFontSizeSelect"
                    className="form-control"
                    value={settHeaderFontSize}
                    onChange={(e) => setSettHeaderFontSize(e.target.value)}
                  >
                    <option value="1.5rem">1.5rem (Small)</option>
                    <option value="1.75rem">1.75rem (Medium)</option>
                    <option value="2rem">2rem (Standard)</option>
                    <option value="2.25rem">2.25rem (Large)</option>
                    <option value="2.5rem">2.5rem (Extra Large)</option>
                  </select>
                </div>
              </div>

              {/* Term & Academic Session Section */}
              <div className="glass-panel" style={{ padding: '1.75rem', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Academic Calendar
                </h3>

                <div className="form-group">
                  <label htmlFor="sessionInput">Active Academic Session</label>
                  <input
                    id="sessionInput"
                    type="text"
                    placeholder="e.g. 2025/2026"
                    className="form-control"
                    value={settSession}
                    onChange={(e) => setSettSession(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="termInput">Active Term</label>
                  <select
                    id="termInput"
                    className="form-control"
                    value={settTerm}
                    onChange={(e) => setSettTerm(e.target.value)}
                  >
                    <option value="1st Term">1st Term</option>
                    <option value="2nd Term">2nd Term</option>
                    <option value="3rd Term">3rd Term</option>
                  </select>
                </div>
              </div>

              {/* Security and Password */}
              <div className="glass-panel" style={{ padding: '1.75rem', border: '1px solid var(--border)' }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Admin Profile & Credentials
                </h3>

                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ position: 'relative' }}>
                    <img 
                      src={settAdminAvatar} 
                      alt="Admin Profile Preview" 
                      style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)', backgroundColor: 'var(--bg-tertiary)' }} 
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.25rem' }}>Upload Profile Picture</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      style={{ fontSize: '0.75rem' }} 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 1024 * 1024) {
                            alert('Error: Image size should be less than 1MB to avoid local storage overflow.');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = (uploadEvent) => {
                            setSettAdminAvatar(uploadEvent.target.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>PNG, JPG, or SVG. Max size 1MB.</span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="adminNameInput">Admin Full Name</label>
                  <input
                    id="adminNameInput"
                    type="text"
                    className="form-control"
                    value={settAdminName}
                    onChange={(e) => setSettAdminName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="adminEmailInput">Admin Login Email</label>
                  <input
                    id="adminEmailInput"
                    type="email"
                    className="form-control"
                    value={settAdminEmail}
                    onChange={(e) => setSettAdminEmail(e.target.value)}
                    required
                  />
                </div>

                 <div className="form-group">
                  <label htmlFor="oldPass">Current Password</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      id="oldPass"
                      type={showOldPassword ? 'text' : 'password'}
                      placeholder="Enter current password..."
                      className="form-control"
                      value={oldPasswordInput}
                      onChange={(e) => setOldPasswordInput(e.target.value)}
                      style={{ width: '100%', paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        background: 'none',
                        border: 'none',
                        padding: '0.25rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)',
                        opacity: 0.7,
                        transition: 'opacity 0.2s ease'
                      }}
                      aria-label={showOldPassword ? "Hide password" : "Show password"}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
                    >
                      {showOldPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.025 10.025 0 014.132-5.4M9.88 9.88a3 3 0 104.24 4.24M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="newPass">New Password</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      id="newPass"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Enter new password..."
                      className="form-control"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      style={{ width: '100%', paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        background: 'none',
                        border: 'none',
                        padding: '0.25rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)',
                        opacity: 0.7,
                        transition: 'opacity 0.2s ease'
                      }}
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
                    >
                      {showNewPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.025 10.025 0 014.132-5.4M9.88 9.88a3 3 0 104.24 4.24M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor="confirmPass">Confirm New Password</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      id="confirmPass"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Retype new password..."
                      className="form-control"
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      style={{ width: '100%', paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        background: 'none',
                        border: 'none',
                        padding: '0.25rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-secondary)',
                        opacity: 0.7,
                        transition: 'opacity 0.2s ease'
                      }}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
                    >
                      {showConfirmPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.025 10.025 0 014.132-5.4M9.88 9.88a3 3 0 104.24 4.24M3 3l18 18" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Registry Locks and System Maintenance Controls */}
              <div className="glass-panel" style={{ padding: '1.75rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Site Controls
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                  {/* Registry Lock Switch */}
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', userSelect: 'none' }}>
                    <input
                      type="checkbox"
                      style={{ marginTop: '0.25rem', cursor: 'pointer' }}
                      checked={!settAllowReg}
                      onChange={(e) => setSettAllowReg(!e.target.checked)}
                    />
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>Lock Student Registrations</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Disables registering new student profiles on the dashboard to freeze records.</span>
                    </div>
                  </label>

                  {/* Maintenance Mode Switch */}
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', cursor: 'pointer', userSelect: 'none' }}>
                    <input
                      type="checkbox"
                      style={{ marginTop: '0.25rem', cursor: 'pointer' }}
                      checked={settMaintMode}
                      onChange={(e) => setSettMaintMode(e.target.checked)}
                    />
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>Lock Student Results Lookup (Maintenance)</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Replaces student search page with a maintenance message when compiling term details.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Database Backup Panel */}
              <div className="glass-panel" style={{ padding: '1.75rem', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Database Backup
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                  Export and import your student lists, teacher accounts, and compiled academic marks as a JSON file.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
                  {/* Export Button */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>Export Database</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Download full database configuration as a JSON file.</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={exportDatabase}
                      style={{ flexShrink: 0, padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    >
                      Export JSON
                    </button>
                  </div>

                  {/* Import Button */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>Import Database</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Restore or merge data from a previously exported JSON backup file.</span>
                    </div>
                    <label
                      className="btn btn-primary"
                      style={{
                        flexShrink: 0,
                        padding: '0.5rem 1rem',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'inline-block',
                        textAlign: 'center',
                        margin: 0
                      }}
                    >
                      Import JSON
                      <input
                        type="file"
                        accept=".json"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (uploadEvent) => {
                              const result = importDatabase(uploadEvent.target.result);
                              if (result.success) {
                                alert('Database imported successfully! The portal will now reload to apply all changes.');
                                window.location.reload();
                              } else {
                                alert(`Error: Failed to import database. ${result.error}`);
                              }
                            };
                            reader.readAsText(file);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={() => {
                  setSettSchoolName(schoolName);
                  setSettSchoolSubtitle(schoolSubtitle);
                  setSettSession(currentSession);
                  setSettTerm(currentTerm);
                  setSettAllowReg(allowStudentReg);
                  setSettMaintMode(maintenanceMode);
                  setSettAdminEmail(adminEmail);
                  setSettSchoolLogo(schoolLogo);
                  setSettAdminName(adminName);
                  setSettAdminAvatar(adminAvatar);
                  setSettSchoolMotto(schoolMotto);
                  setSettSchoolAddress(schoolAddress);
                  setSettReportFont(reportCardFont);
                  setSettHeaderFont(reportCardHeaderFont);
                  setSettHeaderFontSize(reportCardHeaderFontSize);
                  setOldPasswordInput('');
                  setNewPasswordInput('');
                  setConfirmPasswordInput('');
                  alert('Changes discarded!');
                }}
              >
                Discard Changes
              </button>
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => {
                  // Password change verification
                  if (newPasswordInput || oldPasswordInput || confirmPasswordInput) {
                    if (oldPasswordInput !== adminPassword) {
                      alert('Error: The current password entered is incorrect.');
                      return;
                    }
                    if (newPasswordInput !== confirmPasswordInput) {
                      alert('Error: New password and confirmation do not match.');
                      return;
                    }
                    if (newPasswordInput.length < 4) {
                      alert('Error: New password must be at least 4 characters long.');
                      return;
                    }
                    setAdminPassword(newPasswordInput);
                  }

                  // Update branding and control settings
                  setSchoolName(settSchoolName);
                  setSchoolSubtitle(settSchoolSubtitle);
                  setCurrentSession(settSession);
                  setCurrentTerm(settTerm);
                  setAllowStudentReg(settAllowReg);
                  setMaintenanceMode(settMaintMode);
                  setAdminEmail(settAdminEmail);
                  setSchoolLogo(settSchoolLogo);
                  setAdminName(settAdminName);
                  setAdminAvatar(settAdminAvatar);

                  setSchoolMotto(settSchoolMotto);
                  setSchoolAddress(settSchoolAddress);
                  setReportCardFont(settReportFont);
                  setReportCardHeaderFont(settHeaderFont);
                  setReportCardHeaderFontSize(settHeaderFontSize);

                  setOldPasswordInput('');
                  setNewPasswordInput('');
                  setConfirmPasswordInput('');

                  alert('System settings updated successfully!');
                }}
              >
                Save Settings Configuration
              </button>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Single Principal Remark Modal */}
      {selectedResultForRemark && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '500px',
            padding: '2rem',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)'
          }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
              Add Principal's Remark
            </h3>

            <div className="form-group">
              <label>Review comments</label>
              <textarea
                className="form-control"
                style={{ width: '100%', height: '100px' }}
                placeholder="Principal comments..."
                value={remarkInput}
                onChange={(e) => setRemarkInput(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
              <button onClick={() => setSelectedResultForRemark(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleSaveRemark} className="btn btn-primary">
                Save & Sign Off
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Allocate Subjects Modal */}
      {editingClassSubjects && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1.5rem',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div className="glass-panel" style={{
            width: '100%',
            maxWidth: '500px',
            padding: '2rem',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)'
          }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: 'var(--primary)' }}>
              Allocate Subjects: {classes.find(c => c.id === editingClassSubjects)?.name.toUpperCase()}
            </h3>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.75rem',
              maxHeight: '300px',
              overflowY: 'auto',
              border: '1px solid var(--border)',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-tertiary)',
              marginBottom: '1.5rem'
            }}>
              {Object.values(subjects).map(sub => {
                const isChecked = selectedClassSubjects.includes(sub.id);
                return (
                  <label key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 'normal', cursor: 'pointer', margin: 0 }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...selectedClassSubjects, sub.id]
                          : selectedClassSubjects.filter(id => id !== sub.id);
                        setSelectedClassSubjects(updated);
                      }}
                    />
                    {sub.name}
                  </label>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setEditingClassSubjects(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleSaveClassSubjects} className="btn btn-primary">
                Save Allocation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
