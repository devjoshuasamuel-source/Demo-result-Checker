import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';

export default function LoginPortal() {
  const {
    currentRole,
    setCurrentRole,
    schoolName,
    schoolSubtitle,
    validateLookup,
    setViewingResult,
    loginTeacher,
    loginAdmin,
    lockoutUntil,
    setLockoutUntil,
    setFailedAttempts,
    maintenanceMode,
    schoolLogo,
    connectCloudSync,
    syncBlobId
  } = useContext(AppContext);

  // Sync tab selection with top navbar roles
  const [activeTab, setActiveTab] = useState(currentRole === 'student' ? 'student' : 'staff');

  // Student Form Inputs
  const [studName, setStudName] = useState('');
  const [studRollNo, setStudRollNo] = useState('');

  // Staff Form Inputs
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Common UI states
  const [errorMsg, setErrorMsg] = useState('');
  const [locked, setLocked] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  // Student matching states (from StudentLookup)
  const [matchedStudent, setMatchedStudent] = useState(null);
  const [availableResults, setAvailableResults] = useState([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [statusMessage, setStatusMessage] = useState('');

  const [showSyncInput, setShowSyncInput] = useState(false);
  const [inputSyncKey, setInputSyncKey] = useState('');

  // Keep Login Portal tabs in sync with top navigation role picks
  useEffect(() => {
    if (currentRole === 'student') {
      setActiveTab('student');
    } else {
      setActiveTab('staff');
    }
    setErrorMsg('');
  }, [currentRole]);

  // Lockout countdown timer for student lookups
  useEffect(() => {
    if (!lockoutUntil) {
      setLocked(false);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      if (now >= lockoutUntil) {
        setLockoutUntil(null);
        setFailedAttempts(0);
        setLocked(false);
        setErrorMsg('');
        clearInterval(interval);
      } else {
        setLocked(true);
        setSecondsRemaining(Math.ceil((lockoutUntil - now) / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockoutUntil, setLockoutUntil, setFailedAttempts]);

  // Synchronize Tab Switching back to Top Navigation bar
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'student') {
      setCurrentRole('student');
      setMatchedStudent(null);
    } else {
      setCurrentRole('student');
    }
    setErrorMsg('');
  };

  // Submit Student lookup verification
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!studName.trim() || !studRollNo.trim()) {
      setErrorMsg('Please enter both name and roll number.');
      return;
    }

    setErrorMsg('');
    setStatusMessage('');

    const lookup = await validateLookup(studName, studRollNo);

    if (!lookup.success) {
      setErrorMsg(lookup.error);
      if (lookup.locked) {
        setLocked(true);
      }
      return;
    }

    setMatchedStudent(lookup.student);
    setAvailableResults(lookup.resultsList);
    setErrorMsg('');

    if (lookup.resultsList.length === 0) {
      setStatusMessage('No result records found for your student profile. Please contact the administrator.');
      setSelectedResultIndex(-1);
    } else {
      setSelectedResultIndex(0);
      const defaultRes = lookup.resultsList[0];
      if (defaultRes.status !== 'published') {
        setStatusMessage('Result not yet available. The school is currently compiling results for this term. Please check back later.');
      } else {
        setStatusMessage('');
      }
    }
  };

  const handleResultSelect = (idx) => {
    setSelectedResultIndex(idx);
    const selected = availableResults[idx];
    if (selected.status !== 'published') {
      setStatusMessage('Result not yet available. The school is currently compiling results for this term. Please check back later.');
    } else {
      setStatusMessage('');
    }
  };

  const handleCheckResult = () => {
    if (selectedResultIndex < 0) return;
    const selected = availableResults[selectedResultIndex];
    if (selected.status === 'published') {
      setViewingResult(selected);
    }
  };

  const handleResetStudent = () => {
    setMatchedStudent(null);
    setAvailableResults([]);
    setSelectedResultIndex(-1);
    setStudName('');
    setStudRollNo('');
    setErrorMsg('');
    setStatusMessage('');
  };

  // Submit Staff Credentials Authentication
  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    if (!staffEmail.trim() || !staffPassword.trim()) {
      setErrorMsg('Please enter both your email and password.');
      return;
    }

    setErrorMsg('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: staffEmail, password: staffPassword })
      });
      const data = await response.json();

      if (data.success) {
        setStaffEmail('');
        setStaffPassword('');
        if (data.role === 'admin') {
          loginAdmin(data.user);
          setCurrentRole('admin');
        } else if (data.role === 'teacher') {
          loginTeacher(data.user);
          setCurrentRole('teacher');
        }
      } else {
        setErrorMsg(data.error || 'Invalid email or password. Please verify credentials.');
      }
    } catch (err) {
      setErrorMsg('Server connection failed. Please try again.');
    }
  };

  const nameParts = schoolName.split(' ');
  const firstWord = nameParts[0] || 'MANNA';
  const restOfName = nameParts.slice(1).join(' ') || 'Academy';

  return (
    <div className="login-portal-wrapper">
      <div className="login-portal-card-outer">
        {/* Brand header */}
        <div className="login-portal-brand-header">
          <div className="brand-logo-frame">
            <img 
              src={schoolLogo} 
              alt={`${schoolName} Logo`} 
            />
          </div>
          <h1 className="login-brand-title">Higgsfield Academy</h1>
          <p className="login-brand-subtitle">Academic Results Portal</p>
        </div>

        {/* Pill Selector Tab Switcher */}
        <div className="login-pill-switcher">
          <button 
            type="button" 
            className={`pill-switch-btn ${activeTab === 'student' ? 'active' : ''}`}
            onClick={() => handleTabChange('student')}
          >
            Student Portal
          </button>
          <button 
            type="button" 
            className={`pill-switch-btn ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => handleTabChange('staff')}
          >
            Staff Login
          </button>
        </div>

        {/* Elevated Form Card */}
        <div className="login-form-card-inner">
          {/* Error Message Panel */}
          {errorMsg && (
            <div className="alert-message alert-error" style={{ marginBottom: '1.25rem', animation: 'fadeIn 0.2s ease' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Student Access Portal View */}
          {activeTab === 'student' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              {maintenanceMode ? (
                <div style={{ textAlign: 'center', padding: '1rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="maintenance-icon-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Portal Under Compilations</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.825rem', lineHeight: '1.5', maxWidth: '320px', margin: 0 }}>
                    The student results checker portal is temporarily locked. We are currently compiling new academic marks and updates. Please check back later.
                  </p>
                </div>
              ) : (
                <>
                  {locked && (
                    <div className="alert-message alert-warning" style={{ flexDirection: 'column', gap: '0.25rem', alignItems: 'center', textAlign: 'center', marginBottom: '1.25rem' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span style={{ fontWeight: 'bold', fontSize: '0.9rem', marginTop: '0.25rem' }}>Access Temporarily Locked</span>
                      <span style={{ fontSize: '0.775rem' }}>Too many failed attempts. Please wait {secondsRemaining} seconds.</span>
                    </div>
                  )}

                  {!matchedStudent && !locked && (
                    <form onSubmit={handleStudentSubmit}>
                      <div className="form-group">
                        <label htmlFor="studName">Student Full Name</label>
                        <div className="input-with-icon-wrapper">
                          <svg className="field-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <input
                            id="studName"
                            type="text"
                            className="form-control-icon"
                            placeholder="e.g. Samson Ugo"
                            value={studName}
                            onChange={(e) => setStudName(e.target.value)}
                            autoComplete="name"
                            autoCorrect="off"
                            autoCapitalize="words"
                            spellCheck="false"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label htmlFor="studRoll">Roll Number</label>
                        <div className="input-with-icon-wrapper">
                          <svg className="field-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.333 0 4 .667 4 2v1H5v-1c0-1.333 2.667-2 2-2z" />
                          </svg>
                          <input
                            id="studRoll"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="form-control-icon"
                            placeholder="e.g. 481"
                            value={studRollNo}
                            onChange={(e) => setStudRollNo(e.target.value.replace(/\D/g, ''))}
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="btn-auth-primary"
                        style={{ marginTop: '1.5rem' }}
                      >
                        Access Student Records →
                      </button>
                    </form>
                  )}

                  {matchedStudent && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        backgroundColor: 'var(--bg-tertiary)',
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)'
                      }}>
                        <img
                          src={matchedStudent.photo}
                          alt={matchedStudent.name}
                          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                        />
                        <div>
                          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>{matchedStudent.name}</h4>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Class: {matchedStudent.classId.toUpperCase()} • Roll No: {matchedStudent.rollNo}</p>
                        </div>
                      </div>

                      {availableResults.length > 0 && (
                        <div className="form-group" style={{ margin: 0 }}>
                          <label htmlFor="resultTermSelect">Available Academic Terms</label>
                          <select
                            id="resultTermSelect"
                            className="form-control"
                            value={selectedResultIndex}
                            onChange={(e) => handleResultSelect(parseInt(e.target.value))}
                          >
                            {availableResults.map((r, idx) => (
                              <option key={r.id} value={idx}>
                                {r.session} session - {r.term}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {statusMessage && (
                        <div className={`alert-message ${availableResults.length > 0 ? 'alert-warning' : 'alert-error'}`} style={{ margin: 0 }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span style={{ fontSize: '0.8rem' }}>{statusMessage}</span>
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                        <button
                          onClick={handleResetStudent}
                          className="btn btn-secondary"
                          style={{ flex: 1, padding: '0.7rem' }}
                        >
                          Reset Search
                        </button>

                        {availableResults.length > 0 && availableResults[selectedResultIndex]?.status === 'published' && (
                          <button
                            onClick={handleCheckResult}
                            className="btn btn-primary"
                            style={{ flex: 1.5, padding: '0.7rem', fontWeight: 600 }}
                          >
                            View Result Sheet
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'staff' && (
            <form onSubmit={handleStaffSubmit} style={{ animation: 'fadeIn 0.3s ease' }}>
              <div className="form-group">
                <label htmlFor="staffMail">School Email Address</label>
                <div className="input-with-icon-wrapper">
                  <svg className="field-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    id="staffMail"
                    type="email"
                    className="form-control-icon"
                    placeholder="e.g. blessing.obaka@higgsfield.sch.ng"
                    value={staffEmail}
                    onChange={(e) => setStaffEmail(e.target.value)}
                    autoComplete="email"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck="false"
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label htmlFor="staffPass">Password</label>
                <div className="input-with-icon-wrapper">
                  <svg className="field-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    id="staffPass"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control-icon"
                    placeholder="••••••••"
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    autoComplete="current-password"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck="false"
                    required
                    style={{ paddingRight: '2.75rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle-btn"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.025 10.025 0 014.132-5.4M9.88 9.88a3 3 0 104.24 4.24M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-auth-primary"
                style={{ marginTop: '1.5rem' }}
              >
                Authenticate Staff Login →
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="login-portal-mobile-footer no-print">
          <p>🔒 End-to-End Encrypted Student Portal</p>
          <p className="powered-by-text">Powered by Higgsfield Academy</p>
        </div>
      </div>
    </div>
  );
}
