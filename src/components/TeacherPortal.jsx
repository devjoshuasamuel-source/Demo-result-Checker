import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';

export default function TeacherPortal() {
  const {
    teachers,
    selectedTeacherId,
    students,
    classes,
    subjects,
    results,
    saveOrSubmitResult,
    updateStudent,
    logoutTeacher,
    setCurrentRole,
    theme,
    toggleTheme,
    schoolLogo,
    schoolName
  } = useContext(AppContext);

  // Active Authenticated Teacher
  const activeTeacher = teachers.find(t => t.id === selectedTeacherId) || teachers[0];

  // Selected filter states
  const [selectedClassId, setSelectedClassId] = useState(activeTeacher ? activeTeacher.assignedClass : 'jss1');
  const [term, setTerm] = useState('3rd Term');
  const [session, setSession] = useState('2025/2026');

  // Active selected student for results entry
  const [activeStudentForResults, setActiveStudentForResults] = useState(null);
  const [studentScores, setStudentScores] = useState({}); // maps subjectId -> { ca1, ca2, exam }
  
  // Rating states (traits & psychomotor)
  const [studentTraits, setStudentTraits] = useState({
    activeness: 3, attendance: 3, punctuality: 3, selfControl: 3, honesty: 3, humility: 3, leadership: 3, neatness: 3, communication: 3
  });
  const [studentPsychomotor, setStudentPsychomotor] = useState({
    handwriting: 3, fluency: 3, neatness: 3
  });

  // Remarks & Signatures state
  const [masterTeacherRemark, setMasterTeacherRemark] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [teacherSignature, setTeacherSignature] = useState('');
  const [teacherDate, setTeacherDate] = useState('');

  const [principalRemark, setPrincipalRemark] = useState('');
  const [principalName, setPrincipalName] = useState('Mrs Chinyere Anokam');
  const [principalSignature, setPrincipalSignature] = useState('');
  const [principalDate, setPrincipalDate] = useState('');
  
  // Validation errors map for the current student
  const [validationErrors, setValidationErrors] = useState({});
  const [successBanner, setSuccessBanner] = useState('');

  // Editing student profile states
  const [editingStudentProfile, setEditingStudentProfile] = useState(null); // student object or null
  const [studentProfileForm, setStudentProfileForm] = useState({
    name: '', rollNo: '', dob: '', fatherName: '', motherName: '', parentContact: '', photo: ''
  });

  // Force-align class filter when teacher changes
  useEffect(() => {
    if (activeTeacher) {
      setSelectedClassId(activeTeacher.assignedClass);
    }
  }, [activeTeacher]);

  // Handle switching to Add Results for a specific student
  const startAddResults = (std) => {
    setActiveStudentForResults(std);
    setSuccessBanner('');
    setValidationErrors({});

    // Find if there is an existing master result for this student/class/term/session
    const masterRes = results.find(
      r => r.studentId === std.id && r.classId === selectedClassId && r.term === term && r.session === session
    );

    const initialScores = {};
    const classObj = classes.find(c => c.id === selectedClassId) || { subjects: [] };
    const classSubjects = classObj.subjects || [];

    classSubjects.forEach(subId => {
      const existingScore = masterRes?.scores?.[subId] || { ca1: '', ca2: '', exam: '', total: '' };
      initialScores[subId] = {
        ca1: existingScore.ca1 === '-' || existingScore.ca1 === undefined ? '' : existingScore.ca1.toString(),
        ca2: existingScore.ca2 === '-' || existingScore.ca2 === undefined ? '' : existingScore.ca2.toString(),
        exam: existingScore.exam === '-' || existingScore.exam === undefined ? '' : existingScore.exam.toString()
      };
    });

    setStudentScores(initialScores);
    setStudentTraits(masterRes?.traits || {
      activeness: 3, attendance: 3, punctuality: 3, selfControl: 3, honesty: 3, humility: 3, leadership: 3, neatness: 3, communication: 3
    });
    setStudentPsychomotor(masterRes?.psychomotor || {
      handwriting: 3, fluency: 3, neatness: 3
    });
    
    setMasterTeacherRemark(masterRes?.remarks?.teacher || '');
    setTeacherName(masterRes?.remarks?.teacherName || activeTeacher.name);
    setTeacherSignature(masterRes?.remarks?.teacherSignature || '');
    setTeacherDate(masterRes?.remarks?.teacherDate || new Date().toISOString().split('T')[0]);

    setPrincipalRemark(masterRes?.remarks?.principal || '');
    setPrincipalName(masterRes?.remarks?.principalName || 'Mrs Chinyere Anokam');
    setPrincipalSignature(masterRes?.remarks?.principalSignature || '');
    setPrincipalDate(masterRes?.remarks?.principalDate || new Date().toISOString().split('T')[0]);
  };

  const handleScoreChange = (subId, field, value) => {
    setSuccessBanner('');
    let numericVal = value === '' ? '' : parseFloat(value);
    let error = '';

    if (numericVal !== '') {
      if (isNaN(numericVal)) {
        error = 'Must be a number';
      } else if (field === 'ca1' && (numericVal < 0 || numericVal > 20)) {
        error = 'CA1 must be 0-20';
      } else if (field === 'ca2' && (numericVal < 0 || numericVal > 20)) {
        error = 'CA2 must be 0-20';
      } else if (field === 'exam' && (numericVal < 0 || numericVal > 60)) {
        error = 'Exam must be 0-60';
      }
    }

    setValidationErrors(prev => ({
      ...prev,
      [`${subId}_${field}`]: error
    }));

    setStudentScores(prev => ({
      ...prev,
      [subId]: {
        ...prev[subId],
        [field]: value
      }
    }));
  };

  // Signature file readers
  const handleSignatureUpload = (e, role) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 200 * 1024) {
      alert("Signature image size must be less than 200KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      if (role === 'teacher') {
        setTeacherSignature(uploadEvent.target.result);
      } else {
        setPrincipalSignature(uploadEvent.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeSignature = (role) => {
    if (role === 'teacher') {
      setTeacherSignature('');
    } else {
      setPrincipalSignature('');
    }
  };

  // Save changes for all subjects, traits, remarks, and signatures of the student
  const handleSaveStudentScores = () => {
    const hasErrors = Object.values(validationErrors).some(err => err !== '');
    if (hasErrors) {
      alert('Please resolve the validation errors before saving.');
      return;
    }

    const classObj = classes.find(c => c.id === selectedClassId) || { subjects: [] };
    const classSubjects = classObj.subjects || [];

    // Find existing master result
    const masterRes = results.find(
      r => r.studentId === activeStudentForResults.id && r.classId === selectedClassId && r.term === term && r.session === session
    );

    const finalScores = masterRes ? { ...masterRes.scores } : {};
    classSubjects.forEach(subId => {
      const entry = studentScores[subId];
      if (entry) {
        const ca1 = entry.ca1 === '' ? 0 : parseFloat(entry.ca1);
        const ca2 = entry.ca2 === '' ? 0 : parseFloat(entry.ca2);
        const exam = entry.exam === '' ? 0 : parseFloat(entry.exam);
        const total = ca1 + ca2 + exam;
        finalScores[subId] = { ca1, ca2, exam, total };
      }
    });

    const resultPayload = {
      studentId: activeStudentForResults.id,
      classId: selectedClassId,
      term,
      session,
      scores: finalScores,
      traits: studentTraits,
      psychomotor: studentPsychomotor,
      remarks: {
        teacher: masterTeacherRemark.trim(),
        teacherName: teacherName.trim(),
        teacherSignature: teacherSignature,
        teacherDate: teacherDate,
        principal: principalRemark.trim(),
        principalName: principalName.trim(),
        principalSignature: principalSignature,
        principalDate: principalDate
      }
    };

    saveOrSubmitResult(resultPayload, `${activeTeacher.name} (Teacher)`);
    setSuccessBanner(`Scores & evaluation for ${activeStudentForResults.name} saved successfully!`);
    setActiveStudentForResults(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Edit Profile actions
  const startEditProfile = (std) => {
    setEditingStudentProfile(std);
    setStudentProfileForm({
      name: std.name,
      rollNo: std.rollNo !== undefined && std.rollNo !== null ? std.rollNo.toString() : '',
      dob: std.dob || '',
      fatherName: std.fatherName || '',
      motherName: std.motherName || '',
      parentContact: std.parentContact || '',
      photo: std.photo || ''
    });
  };

  const handleProfileFormSubmit = (e) => {
    e.preventDefault();
    if (!studentProfileForm.name.trim()) return;

    const val = parseInt(studentProfileForm.rollNo);
    if (isNaN(val) || val < 0 || val > 5000) {
      alert("Roll number must be an integer between 0 and 5000.");
      return;
    }

    // Check uniqueness (except the student themselves)
    const isDuplicate = students.some(s => s.id !== editingStudentProfile.id && s.rollNo === val);
    if (isDuplicate) {
      alert("This Roll Number is already assigned to another student. Roll numbers must be unique.");
      return;
    }

    updateStudent(editingStudentProfile.id, {
      ...studentProfileForm,
      rollNo: val
    }, `${activeTeacher.name} (Teacher)`);

    setEditingStudentProfile(null);
    setSuccessBanner(`Profile details for ${studentProfileForm.name} updated successfully.`);
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
      setStudentProfileForm(prev => ({
        ...prev,
        photo: uploadEvent.target.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const classStudents = students.filter(s => s.classId === selectedClassId && s.active);

  return (
    <div className="dashboard-content" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Top Header Bar for Teachers */}
      <div className="teacher-header-bar">
        {/* Left Side: Brand branding logo and name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src={schoolLogo} alt={`${schoolName} Logo`} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          <div>
            <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>Teacher Portal</span>
          </div>
        </div>

        {/* Right Side: Account details and actions */}
        <div className="teacher-header-actions">
          {/* Theme switcher */}
          <button 
            type="button" 
            onClick={toggleTheme} 
            className="btn btn-secondary" 
            style={{ padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}
            title="Toggle Theme Mode"
          >
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            )}
          </button>

          {/* Teacher Profile Info */}
          <div style={{ fontSize: '0.85rem', textAlign: 'right' }}>
            <span style={{ fontWeight: 600, display: 'block' }}>{activeTeacher?.name}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Faculty Class Teacher</span>
          </div>

          {/* Logout Button */}
          <button 
            type="button" 
            className="btn" 
            onClick={() => {
              logoutTeacher();
              setCurrentRole('student');
            }}
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.9rem',
              fontSize: '0.8rem', 
              fontWeight: 700, 
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444', 
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.05)'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Teacher Dashboard</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Welcome back, <strong style={{ color: 'var(--primary)' }}>{activeTeacher?.name}</strong>. Enter CA/Exam scores and student remarks.
        </p>
      </div>

      {successBanner && (
        <div className="alert-message alert-success" style={{ marginBottom: '1.5rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{successBanner}</span>
        </div>
      )}

      {/* Dynamic Filters Bar */}
      <div className="glass-panel responsive-form-grid-three" style={{
        padding: '1.5rem',
        marginBottom: '2rem',
        border: '1px solid var(--border)'
      }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Target Class (Assigned Only)</label>
          <select
            className="form-control"
            value={selectedClassId}
            disabled={true}
          >
            <option value={activeTeacher.assignedClass}>{activeTeacher.assignedClass.toUpperCase()}</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Academic Session</label>
          <select className="form-control" value={session} onChange={(e) => setSession(e.target.value)}>
            <option value="2025/2026">2025/2026 Session</option>
            <option value="2026/2027">2026/2027 Session</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Term Selector</label>
          <select className="form-control" value={term} onChange={(e) => setTerm(e.target.value)}>
            <option value="1st Term">1st Term</option>
            <option value="2nd Term">2nd Term</option>
            <option value="3rd Term">3rd Term</option>
          </select>
        </div>
      </div>

      {/* Main Mode Switcher */}
      {!activeStudentForResults ? (
        /* MODE 1: Student List Table */
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <div style={{
            backgroundColor: '#00a859',
            padding: '1rem 1.5rem',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.15rem' }}>
              Student Registry List — {selectedClassId.toUpperCase()} ({session} Session)
            </h3>
            <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>
              {classStudents.length} Active Students
            </span>
          </div>

          <div className="table-container" style={{ margin: 0 }}>
            <table className="custom-table" style={{ width: '100%' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6' }}>
                  <th style={{ width: '50px' }}>No.</th>
                  <th style={{ width: '80px' }}>Photos</th>
                  <th>Name</th>
                  <th>Roll No</th>
                  <th>Class</th>
                  <th>Year</th>
                  <th style={{ textAlign: 'right', width: '220px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No active students found in JSS 1. Please register students in the registry.
                    </td>
                  </tr>
                ) : (
                  classStudents.map((std, index) => {
                    return (
                      <tr key={std.id}>
                        <td>{index + 1}</td>
                        <td>
                          <img
                            src={std.photo}
                            alt={std.name}
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '4px',
                              objectFit: 'cover',
                              border: '1px solid var(--border)'
                            }}
                          />
                        </td>
                        <td style={{ fontWeight: 700, textTransform: 'uppercase' }}>
                          {std.name}
                        </td>
                        <td><code>{std.rollNo}</code></td>
                        <td>{selectedClassId.toUpperCase()}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {session.replace('/', '-')} Academic Session
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => startEditProfile(std)}
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                              Edit Profile
                            </button>
                            <button
                              onClick={() => startAddResults(std)}
                              className="btn btn-primary"
                              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', backgroundColor: '#00a859', borderColor: '#00a859', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                              </svg>
                              Add Results
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* MODE 2: Add Results (subjects spreadsheet + traits inline + remarks & signatures) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Header Action Row */}
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <button onClick={() => setActiveStudentForResults(null)} className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Students List
            </button>
          </div>

          {/* Results spreadsheet panel */}
          <div className="glass-panel" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{
              backgroundColor: 'var(--bg-tertiary)',
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <img
                src={activeStudentForResults.photo}
                alt={activeStudentForResults.name}
                style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
              />
              <div>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                  Assigning Results: {activeStudentForResults.name.toUpperCase()}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Roll Number: <strong>{activeStudentForResults.rollNo}</strong> | Class: <strong>{selectedClassId.toUpperCase()}</strong> | {term} ({session})
                </span>
              </div>
            </div>

            <div className="table-container" style={{ margin: 0 }}>
              <table className="custom-table" style={{ width: '100%' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e2e8f0' }}>
                    <th style={{ width: '60px' }}>No.</th>
                    <th>Subject</th>
                    <th style={{ width: '130px', textAlign: 'center' }}>CA 1 <small style={{ display: 'block', color: 'var(--text-muted)' }}>15/20%</small></th>
                    <th style={{ width: '130px', textAlign: 'center' }}>CA 2 <small style={{ display: 'block', color: 'var(--text-muted)' }}>15/20%</small></th>
                    <th style={{ width: '130px', textAlign: 'center' }}>Exams <small style={{ display: 'block', color: 'var(--text-muted)' }}>60/70%</small></th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Total <small style={{ display: 'block', color: 'var(--text-muted)' }}>100%</small></th>
                    <th style={{ width: '200px', textAlign: 'center' }}>Teacher's Remarks <small style={{ display: 'block', color: 'var(--text-muted)' }}>Subject Performance</small></th>
                    <th style={{ width: '70px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(classes.find(c => c.id === selectedClassId)?.subjects || []).map((subId, idx) => {
                    const subName = subjects[subId]?.name || subId;
                    const entry = studentScores[subId] || { ca1: '', ca2: '', exam: '' };
                    
                    const ca1Err = validationErrors[`${subId}_ca1`];
                    const ca2Err = validationErrors[`${subId}_ca2`];
                    const examErr = validationErrors[`${subId}_exam`];

                    const ca1Num = parseFloat(entry.ca1) || 0;
                    const ca2Num = parseFloat(entry.ca2) || 0;
                    const examNum = parseFloat(entry.exam) || 0;
                    const total = entry.ca1 !== '' || entry.ca2 !== '' || entry.exam !== '' ? (ca1Num + ca2Num + examNum) : null;

                    // Compute remarks formula
                    let performancePill = { text: 'Fail', color: '#ef4444', bgColor: '#fef2f2' };
                    if (total !== null) {
                      if (total >= 70) {
                        performancePill = { text: 'Good', color: '#10b981', bgColor: '#ecfdf5' };
                      } else if (total >= 50) {
                        performancePill = { text: 'Satisfactory', color: '#3b82f6', bgColor: '#eff6ff' };
                      }
                    }

                    return (
                      <tr key={subId}>
                        <td>{idx + 1}</td>
                        <td style={{ fontWeight: 600, textTransform: 'uppercase' }}>{subName}</td>
                        
                        {/* CA1 Input */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <input
                              type="number"
                              className="form-control"
                              style={{
                                width: '76px',
                                textAlign: 'center',
                                borderRadius: '24px',
                                padding: '0.35rem 0.5rem',
                                borderColor: ca1Err ? 'var(--danger)' : 'var(--border)'
                              }}
                              placeholder="0-20"
                              value={entry.ca1}
                              onChange={(e) => handleScoreChange(subId, 'ca1', e.target.value)}
                            />
                            {ca1Err && <span style={{ fontSize: '0.6rem', color: 'var(--danger)', marginTop: '0.2rem' }}>{ca1Err}</span>}
                          </div>
                        </td>

                        {/* CA2 Input */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <input
                              type="number"
                              className="form-control"
                              style={{
                                width: '76px',
                                textAlign: 'center',
                                borderRadius: '24px',
                                padding: '0.35rem 0.5rem',
                                borderColor: ca2Err ? 'var(--danger)' : 'var(--border)'
                              }}
                              placeholder="0-20"
                              value={entry.ca2}
                              onChange={(e) => handleScoreChange(subId, 'ca2', e.target.value)}
                            />
                            {ca2Err && <span style={{ fontSize: '0.6rem', color: 'var(--danger)', marginTop: '0.2rem' }}>{ca2Err}</span>}
                          </div>
                        </td>

                        {/* Exam Input */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <input
                              type="number"
                              className="form-control"
                              style={{
                                width: '76px',
                                textAlign: 'center',
                                borderRadius: '24px',
                                padding: '0.35rem 0.5rem',
                                borderColor: examErr ? 'var(--danger)' : 'var(--border)'
                              }}
                              placeholder="0-60"
                              value={entry.exam}
                              onChange={(e) => handleScoreChange(subId, 'exam', e.target.value)}
                            />
                            {examErr && <span style={{ fontSize: '0.6rem', color: 'var(--danger)', marginTop: '0.2rem' }}>{examErr}</span>}
                          </div>
                        </td>

                        {/* Total Score */}
                        <td style={{ textAlign: 'center', fontWeight: 'bold' }}>
                          <span style={{
                            display: 'inline-block',
                            width: '42px',
                            height: '42px',
                            lineHeight: '40px',
                            borderRadius: '50%',
                            border: '1px solid var(--border)',
                            backgroundColor: 'var(--bg-tertiary)',
                            fontSize: '0.9rem'
                          }}>
                            {total !== null ? total : 'Auto'}
                          </span>
                        </td>

                        {/* Remark Pill */}
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.35rem 1.25rem',
                            borderRadius: '24px',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            color: performancePill.color,
                            backgroundColor: performancePill.bgColor,
                            border: `1px solid ${performancePill.color}40`,
                            minWidth: '100px',
                            textAlign: 'center'
                          }}>
                            {performancePill.text}
                          </span>
                        </td>

                        {/* Save Check Circle */}
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (ca1Err || ca2Err || examErr) {
                                alert("Please resolve input errors first.");
                                return;
                              }
                              alert(`Scores for ${subName} validated and cached!`);
                            }}
                            style={{
                              border: 'none',
                              backgroundColor: 'transparent',
                              color: '#3b82f6',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '0.25rem'
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--primary)' }}>
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 1: Effective Development & Psychomotor Skills (Matches screenshot) */}
          <div className="responsive-grid-two-cols" style={{ gap: '1.5rem' }}>
            
            {/* Effective Development Panel */}
            <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', margin: 0 }}>
                  Effective Development
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Rating Scale: 1 to 5
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.keys(studentTraits).map(trait => (
                  <div key={trait} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
                    <span style={{ fontSize: '0.85rem', textTransform: 'capitalize', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {trait.replace(/([A-Z])/g, ' $1')}
                    </span>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      {[1, 2, 3, 4, 5].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setStudentTraits(prev => ({ ...prev, [trait]: val }))}
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            border: '1px solid var(--border)',
                            backgroundColor: studentTraits[trait] === val ? 'var(--primary)' : 'var(--bg-tertiary)',
                            color: studentTraits[trait] === val ? '#ffffff' : 'var(--text-primary)',
                            fontWeight: 'bold',
                            fontSize: '0.775rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Psychomotor Skills Panel */}
            <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', margin: 0 }}>
                  Psychomotor Skills
                </h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  Rating Scale: 1 to 5
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.keys(studentPsychomotor).map(skill => (
                  <div key={skill} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem' }}>
                    <span style={{ fontSize: '0.85rem', textTransform: 'capitalize', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {skill}
                    </span>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      {[1, 2, 3, 4, 5].map(val => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setStudentPsychomotor(prev => ({ ...prev, [skill]: val }))}
                          style={{
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            border: '1px solid var(--border)',
                            backgroundColor: studentPsychomotor[skill] === val ? 'var(--accent)' : 'var(--bg-tertiary)',
                            color: studentPsychomotor[skill] === val ? '#ffffff' : 'var(--text-primary)',
                            fontWeight: 'bold',
                            fontSize: '0.775rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)'
                }}>
                  <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>Scale Indicators:</strong>
                  5: Excellent | 4: Very Good | 3: Good | 2: Fair | 1: Poor
                </div>
              </div>
            </div>

          </div>

          {/* Section 2: Remarks & Signatures for Teacher & Principal (Matches screenshot) */}
          <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
              Remarks & Signatures
            </h3>

            <div className="responsive-grid-two-cols" style={{ gap: '2rem' }}>
              
              {/* Class Teacher Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary)', borderBottom: '1px solid var(--border)', paddingBottom: '0.25rem' }}>
                  | Class Teacher
                </h4>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Teacher Comments</label>
                  <textarea
                    className="form-control"
                    style={{ height: '70px', fontSize: '0.85rem' }}
                    placeholder="Enter classroom observation / conduct remark..."
                    value={masterTeacherRemark}
                    onChange={(e) => setMasterTeacherRemark(e.target.value)}
                  />
                </div>

                <div className="responsive-grid-two-cols" style={{ gap: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Teacher Name</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ fontSize: '0.85rem' }}
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Date</label>
                    <input
                      type="date"
                      className="form-control"
                      style={{ fontSize: '0.85rem' }}
                      value={teacherDate}
                      onChange={(e) => setTeacherDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Teacher Signature</label>
                  {teacherSignature ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '120px',
                        height: '70px',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        padding: '0.25rem'
                      }}>
                        <img src={teacherSignature} alt="Teacher Signature" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSignature('teacher')}
                        className="btn btn-danger"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      border: '2px dashed var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '1rem',
                      textAlign: 'center',
                      backgroundColor: 'var(--bg-tertiary)',
                      cursor: 'pointer',
                      position: 'relative'
                    }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Choose Signature File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleSignatureUpload(e, 'teacher')}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          opacity: 0,
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Principal Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent)', borderBottom: '1px solid var(--border)', paddingBottom: '0.25rem' }}>
                  | Principal
                </h4>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Principal Comments</label>
                  <textarea
                    className="form-control"
                    style={{ height: '70px', fontSize: '0.85rem' }}
                    placeholder="Enter school principal terminal review..."
                    value={principalRemark}
                    onChange={(e) => setPrincipalRemark(e.target.value)}
                  />
                </div>

                <div className="responsive-grid-two-cols" style={{ gap: '0.75rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Principal Name</label>
                    <input
                      type="text"
                      className="form-control"
                      style={{ fontSize: '0.85rem' }}
                      value={principalName}
                      onChange={(e) => setPrincipalName(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Date</label>
                    <input
                      type="date"
                      className="form-control"
                      style={{ fontSize: '0.85rem' }}
                      value={principalDate}
                      onChange={(e) => setPrincipalDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Principal Signature</label>
                  {principalSignature ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        width: '120px',
                        height: '70px',
                        backgroundColor: '#ffffff',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        padding: '0.25rem'
                      }}>
                        <img src={principalSignature} alt="Principal Signature" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSignature('principal')}
                        className="btn btn-danger"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      border: '2px dashed var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '1rem',
                      textAlign: 'center',
                      backgroundColor: 'var(--bg-tertiary)',
                      cursor: 'pointer',
                      position: 'relative'
                    }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Choose Signature File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleSignatureUpload(e, 'principal')}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          opacity: 0,
                          cursor: 'pointer'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Save & Submit Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button onClick={() => setActiveStudentForResults(null)} className="btn btn-secondary">
              Cancel
            </button>
            <button onClick={handleSaveStudentScores} className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem', backgroundColor: '#00a859', borderColor: '#00a859' }}>
              Save & Submit Results
            </button>
          </div>

        </div>
      )}

      {/* MODAL 1: Edit Student Profile (for teachers) */}
      {editingStudentProfile && (
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
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)'
          }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
              Modify Student Profile: {editingStudentProfile.name}
            </h3>

            <form onSubmit={handleProfileFormSubmit} className="responsive-grid-two-cols" style={{ gap: '1rem' }}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={studentProfileForm.name}
                  onChange={(e) => setStudentProfileForm({ ...studentProfileForm, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Roll Number (0-5000)</label>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  className="form-control"
                  value={studentProfileForm.rollNo}
                  onChange={(e) => setStudentProfileForm({ ...studentProfileForm, rollNo: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  className="form-control"
                  value={studentProfileForm.dob}
                  onChange={(e) => setStudentProfileForm({ ...studentProfileForm, dob: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Father's Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={studentProfileForm.fatherName}
                  onChange={(e) => setStudentProfileForm({ ...studentProfileForm, fatherName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Mother's Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={studentProfileForm.motherName}
                  onChange={(e) => setStudentProfileForm({ ...studentProfileForm, motherName: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Parent's Contact / Phone</label>
                <input
                  type="text"
                  className="form-control"
                  value={studentProfileForm.parentContact}
                  onChange={(e) => setStudentProfileForm({ ...studentProfileForm, parentContact: e.target.value })}
                />
              </div>

              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label>Passport Photo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img
                    src={studentProfileForm.photo}
                    alt="Passport"
                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border)' }}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    style={{ padding: '0.2rem', fontSize: '0.75rem', height: 'auto', flex: 1 }}
                    onChange={handlePhotoUpload}
                  />
                </div>
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setEditingStudentProfile(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
