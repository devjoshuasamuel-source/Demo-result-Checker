import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

export default function ResultReport({ customResult = null, onBack = null }) {
  const {
    viewingResult,
    setViewingResult,
    students,
    classes,
    subjects,
    getGradeInfo,
    getClassRanking,
    schoolName,
    schoolLogo: ctxLogo,
    schoolMotto,
    schoolAddress,
    reportCardFont,
    reportCardHeaderFont,
    reportCardHeaderFontSize
  } = useContext(AppContext);

  // Determine active result: passed-in for bulk prints, or global context
  const activeResult = customResult || viewingResult;

  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table' on mobile devices

  if (!activeResult) return null;

  // Retrieve student and class details
  const student = students.find(s => s.id === activeResult.studentId) || {};
  const activeClass = classes.find(c => c.id === activeResult.classId) || {};
  
  // Calculate rankings and stats
  const rankings = getClassRanking(activeResult.classId, activeResult.term, activeResult.session);
  const studentRankInfo = rankings[activeResult.studentId] || { rank: '-', totalScore: 0, average: 0 };

  const subjectKeys = Object.keys(activeResult.scores);
  const totalObtainable = subjectKeys.length * 100;
  
  // Custom back button handler
  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      setViewingResult(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Convert position rank to ordinal string (e.g. 1st, 2nd, 3rd)
  const getOrdinal = (n) => {
    if (isNaN(n) || n === '-') return '-';
    const s = ["th", "st", "nd", "rd"],
          v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  // Helper to color codes student averages or marks obtained percentage
  const getPerformanceClass = (avg) => {
    const parsed = parseFloat(avg);
    if (isNaN(parsed)) return '';
    if (parsed >= 75) return 'status-accent-green';
    if (parsed >= 50) return 'status-accent-amber';
    return 'status-accent-red';
  };

  // Simple crest logo
  const schoolLogo = (
    <img src={ctxLogo} alt={`${schoolName} Logo`} style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
  );

  // Position badge calculation
  const rankVal = parseInt(studentRankInfo.rank);
  const isTopThree = !isNaN(rankVal) && rankVal >= 1 && rankVal <= 3;

  return (
    <div className="report-card-container">
      {/* Action buttons (hidden when printing) */}
      {!customResult && (
        <div className="report-actions-container no-print">
          <button onClick={handleBackClick} className="btn btn-secondary report-action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Search Again / Back
          </button>
          
          <button onClick={handlePrint} className="btn btn-primary report-action-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Result / Save PDF
          </button>
        </div>
      )}

      <div 
        className="report-card" 
        style={{ 
          fontFamily: 
            reportCardFont === 'outfit' ? "'Outfit', sans-serif" :
            reportCardFont === 'lora' ? "'Lora', serif" :
            reportCardFont === 'cinzel' ? "'Cinzel', serif" :
            reportCardFont === 'playfair' ? "'Playfair Display', serif" :
            reportCardFont === 'raleway' ? "'Raleway', sans-serif" :
            reportCardFont === 'baloo2' ? "'Baloo 2', sans-serif" :
            "'Inter', sans-serif"
        }}
      >
        {/* Header / Branding block */}
        <div className="report-header">
          <div className="report-logo">{schoolLogo}</div>
          <div className="report-school-details">
            <h1 
              style={{ 
                fontFamily: 
                  reportCardHeaderFont === 'inter' ? "'Inter', sans-serif" :
                  reportCardHeaderFont === 'outfit' ? "'Outfit', sans-serif" :
                  reportCardHeaderFont === 'raleway' ? "'Raleway', sans-serif" :
                  reportCardHeaderFont === 'baloo2' ? "'Baloo 2', sans-serif" :
                  reportCardHeaderFont === 'lora' ? "'Lora', serif" :
                  reportCardHeaderFont === 'playfair' ? "'Playfair Display', serif" :
                  "'Cinzel', serif",
                fontSize: reportCardHeaderFontSize
              }}
            >
              {schoolName.toUpperCase()}
            </h1>
            <p className="motto">{schoolMotto}</p>
            <p className="meta">
              {schoolAddress}
            </p>
            <p className="meta" style={{ textTransform: 'uppercase', fontWeight: 700, color: '#0f1c3f', marginTop: '0.25rem' }}>
              {activeResult.session} Academic Session • Official Termly Report
            </p>
          </div>
          <div className="report-logo">{schoolLogo}</div>
        </div>

        {/* Student identity block */}
        <div className="report-identity">
          <div className="student-photo-frame">
            {student.photo ? (
              <img src={student.photo} alt={student.name} />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
                <rect width="100" height="100" fill="#f8fafc" />
                <circle cx="50" cy="40" r="20" fill="#cbd5e1" />
                <path d="M20,85 C20,65 30,55 50,55 C70,55 80,65 80,85 Z" fill="#cbd5e1" />
              </svg>
            )}
          </div>

          <div className="identity-details-grid">
            <div className="identity-field">
              <div className="label">Student Name</div>
              <div className="value" style={{ textTransform: 'uppercase' }}>{student.name || '-'}</div>
            </div>
            <div className="identity-field">
              <div className="label">Roll Number</div>
              <div className="value">{student.rollNo || '-'}</div>
            </div>
            <div className="identity-field">
              <div className="label">Class / Form</div>
              <div className="value" style={{ textTransform: 'uppercase' }}>{activeClass.name || '-'}</div>
            </div>
            <div className="identity-field">
              <div className="label">Date of Birth</div>
              <div className="value">{student.dob || '-'}</div>
            </div>
            <div className="identity-field">
              <div className="label">Father's Name</div>
              <div className="value">{student.fatherName || '-'}</div>
            </div>
            <div className="identity-field">
              <div className="label">Mother's Name</div>
              <div className="value">{student.motherName || '-'}</div>
            </div>
            <div className="identity-field">
              <div className="label">Academic Term</div>
              <div className="value">{activeResult.term}</div>
            </div>
            <div className="identity-field">
              <div className="label">Academic Session</div>
              <div className="value">{activeResult.session || '-'}</div>
            </div>
            <div className="identity-field">
              <div className="label">Class Position</div>
              <div className="value">
                <span className={isTopThree ? 'position-badge-top' : 'position-badge-neutral'}>
                  {getOrdinal(studentRankInfo.rank)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section divider banner */}
        <div className="section-banner">
          Grade Sheet
        </div>

        {/* Academic statistics summary strip */}
        <div className="report-stats-strip">
          <div className="stat-strip-item">
            <span>Obtainable Marks</span>
            <strong>{totalObtainable}</strong>
          </div>
          <div className="stat-strip-item">
            <span>Marks Obtained</span>
            <strong className={getPerformanceClass(studentRankInfo.average)}>{studentRankInfo.totalScore}</strong>
          </div>
          <div className="stat-strip-item">
            <span>Student Average</span>
            <strong className={getPerformanceClass(studentRankInfo.average)}>{studentRankInfo.average}%</strong>
          </div>
          <div className="stat-strip-item">
            <span>Compilation Status</span>
            <strong>FINAL</strong>
          </div>
        </div>

        {/* Mobile layout view switcher */}
        <div className="mobile-view-toggle no-print">
          <button 
            type="button" 
            onClick={() => setViewMode('card')} 
            className={`toggle-btn ${viewMode === 'card' ? 'active' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Card View (Mobile-First)
          </button>
          <button 
            type="button" 
            onClick={() => setViewMode('table')} 
            className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Table View (Scrollable)
          </button>
        </div>

        {/* Report contents */}
        <div className="report-body">
          {/* Main Grade sheet table wrapped in rounded container */}
          <div className={`table-wrapper report-table-view ${viewMode === 'table' ? 'active-view' : 'hidden-view'}`}>
            <table className="school-grid-table">
              <thead>
                <tr>
                  <th style={{ width: '45px' }}>No.</th>
                  <th style={{ textAlign: 'left' }}>Subject</th>
                  <th style={{ width: '75px' }}>CA 1 (20%)</th>
                  <th style={{ width: '75px' }}>CA 2 (20%)</th>
                  <th style={{ width: '75px' }}>Exam (60%)</th>
                  <th style={{ width: '85px' }}>Total (100%)</th>
                  <th style={{ width: '75px' }}>Grade</th>
                  <th style={{ width: '130px' }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {activeClass.subjects && activeClass.subjects.map((subId, index) => {
                  const sub = subjects[subId] || { name: subId };
                  const score = activeResult.scores[subId] || { ca1: '-', ca2: '-', exam: '-', total: '-' };
                  const gradeInfo = score.total !== '-' ? getGradeInfo(score.total) : { grade: '-', remark: '-', color: '#64748b' };
                  
                  // Grade Based Coloring classes & soft badges
                  let rowClass = '';
                  let pillClass = '';

                  const g = gradeInfo.grade.toUpperCase();
                  if (g.startsWith('A')) {
                    rowClass = 'row-tint-excellent';
                    pillClass = 'badge-excellent';
                  } else if (g.startsWith('B')) {
                    rowClass = 'row-tint-verygood';
                    pillClass = 'badge-verygood';
                  } else if (g.startsWith('C')) {
                    rowClass = 'row-tint-credit';
                    pillClass = 'badge-credit';
                  } else if (g.startsWith('D') || g.startsWith('E')) {
                    rowClass = ''; // Weak pass gets no row tint
                    pillClass = 'badge-weakpass';
                  } else if (g.startsWith('F')) {
                    rowClass = 'row-tint-fail';
                    pillClass = 'badge-fail';
                  }

                  return (
                    <tr key={subId} className={rowClass}>
                      <td>{index + 1}</td>
                      <td className="subject-name">{sub.name}</td>
                      <td>{score.ca1}</td>
                      <td>{score.ca2}</td>
                      <td>{score.exam}</td>
                      <td className="bold-highlight" style={{ fontSize: '0.9rem' }}>{score.total}</td>
                      <td>
                        <span className={`grade-pill-badge ${pillClass}`}>
                          {gradeInfo.grade}
                        </span>
                      </td>
                      <td>
                        <span className={`grade-pill-badge ${pillClass}`} style={{ minWidth: 'auto', display: 'inline-block' }}>
                          {gradeInfo.remark}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile-First Card View (visible only on mobile screen) */}
          <div className={`mobile-cards-grid report-cards-view ${viewMode === 'card' ? 'active-view' : 'hidden-view'}`}>
            {activeClass.subjects && activeClass.subjects.map((subId, index) => {
              const sub = subjects[subId] || { name: subId };
              const score = activeResult.scores[subId] || { ca1: '-', ca2: '-', exam: '-', total: '-' };
              const gradeInfo = score.total !== '-' ? getGradeInfo(score.total) : { grade: '-', remark: '-', color: '#64748b' };
              
              let pillClass = '';
              let cardTintClass = '';
              const g = gradeInfo.grade.toUpperCase();
              if (g.startsWith('A')) {
                cardTintClass = 'card-tint-excellent';
                pillClass = 'badge-excellent';
              } else if (g.startsWith('B')) {
                cardTintClass = 'card-tint-verygood';
                pillClass = 'badge-verygood';
              } else if (g.startsWith('C')) {
                cardTintClass = 'card-tint-credit';
                pillClass = 'badge-credit';
              } else if (g.startsWith('D') || g.startsWith('E')) {
                pillClass = 'badge-weakpass';
              } else if (g.startsWith('F')) {
                cardTintClass = 'card-tint-fail';
                pillClass = 'badge-fail';
              }

              return (
                <div key={subId} className={`subject-card ${cardTintClass}`}>
                  <div className="subject-card-header">
                    <span className="subject-card-index">#{index + 1}</span>
                    <h4 className="subject-card-name">{sub.name}</h4>
                  </div>
                  
                  <div className="subject-card-scores">
                    <div className="score-row">
                      <span className="score-label">CA 1 (20%)</span>
                      <span className="score-value">{score.ca1}</span>
                    </div>
                    <div className="score-row">
                      <span className="score-label">CA 2 (20%)</span>
                      <span className="score-value">{score.ca2}</span>
                    </div>
                    <div className="score-row">
                      <span className="score-label">Exam (60%)</span>
                      <span className="score-value">{score.exam}</span>
                    </div>
                    <div className="score-row total-highlight">
                      <span className="score-label">Total Score</span>
                      <span className="score-value bold-highlight">{score.total}</span>
                    </div>
                  </div>
                  
                  <div className="subject-card-footer">
                    <div className="badge-wrapper">
                      <span className="badge-title">Grade</span>
                      <span className={`grade-pill-badge ${pillClass}`}>{gradeInfo.grade}</span>
                    </div>
                    <div className="badge-wrapper">
                      <span className="badge-title">Remarks</span>
                      <span className={`grade-pill-badge ${pillClass}`}>{gradeInfo.remark}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Development traits Sidebars */}
          <div className="traits-sidebar">
            {/* Effective Development ratings */}
            <div className="traits-group">
              <h3>Affective Traits</h3>
              <div className="traits-group-body">
                <div className="trait-row">
                  <span className="trait-name">Activeness</span>
                  <span className="trait-number-rating">{activeResult.traits?.activeness || 0}</span>
                </div>
                <div className="trait-row">
                  <span className="trait-name">Attendance</span>
                  <span className="trait-number-rating">{activeResult.traits?.attendance || 0}</span>
                </div>
                <div className="trait-row">
                  <span className="trait-name">Punctuality</span>
                  <span className="trait-number-rating">{activeResult.traits?.punctuality || 0}</span>
                </div>
                <div className="trait-row">
                  <span className="trait-name">Self Control</span>
                  <span className="trait-number-rating">{activeResult.traits?.selfControl || 0}</span>
                </div>
                <div className="trait-row">
                  <span className="trait-name">Honesty</span>
                  <span className="trait-number-rating">{activeResult.traits?.honesty || 0}</span>
                </div>
                <div className="trait-row">
                  <span className="trait-name">Humility</span>
                  <span className="trait-number-rating">{activeResult.traits?.humility || 0}</span>
                </div>
                <div className="trait-row">
                  <span className="trait-name">Leadership</span>
                  <span className="trait-number-rating">{activeResult.traits?.leadership || 0}</span>
                </div>
                <div className="trait-row">
                  <span className="trait-name">Neatness</span>
                  <span className="trait-number-rating">{activeResult.traits?.neatness || 0}</span>
                </div>
                <div className="trait-row">
                  <span className="trait-name">Communication</span>
                  <span className="trait-number-rating">{activeResult.traits?.communication || 0}</span>
                </div>
              </div>
            </div>

            {/* Psychomotor ratings */}
            <div className="traits-group">
              <h3>Psychomotor Skills</h3>
              <div className="traits-group-body">
                <div className="trait-row">
                  <span className="trait-name">Handwriting</span>
                  <span className="trait-number-rating">{activeResult.psychomotor?.handwriting || 0}</span>
                </div>
                <div className="trait-row">
                  <span className="trait-name">Fluency</span>
                  <span className="trait-number-rating">{activeResult.psychomotor?.fluency || 0}</span>
                </div>
                <div className="trait-row">
                  <span className="trait-name">Neatness</span>
                  <span className="trait-number-rating">{activeResult.psychomotor?.neatness || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Remarks and signatures block wrapped in rounded container */}
        <div className="remarks-table-wrapper">
          <table className="remarks-table">
            <thead>
              <tr>
                <th colSpan="4">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {/* Row 1: Teacher's Remarks */}
              <tr>
                <td colSpan="4">
                  <span className="remark-label">Master/Mistress Remarks:</span>
                  <span className="remark-val">
                    {activeResult.remarks?.teacher || 'Compiling student feedback remarks...'}
                  </span>
                </td>
              </tr>

              {/* Row 2: Teacher details */}
              <tr>
                <td className="detail-name-col">
                  <span className="detail-label">Name:</span>
                  <span className="detail-val">{activeResult.remarks?.teacherName || 'Emily Cole'}</span>
                </td>
                <td className="detail-sig-label-col">
                  <span className="detail-label">Signature:</span>
                </td>
                <td className="detail-sig-val-col">
                  <div className="sig-container">
                    {activeResult.remarks?.teacherSignature ? (
                      <img src={activeResult.remarks.teacherSignature} alt="Teacher Signature" />
                    ) : (
                      <span className="sig-fallback">
                        {activeResult.remarks?.teacherName || 'Emily Cole'}
                      </span>
                    )}
                  </div>
                </td>
                <td className="detail-date-col">
                  <span className="detail-label">Date:</span>
                  <span className="detail-val">{activeResult.remarks?.teacherDate || '-'}</span>
                </td>
              </tr>

              {/* Row 3: Principal's Remarks */}
              <tr>
                <td colSpan="4">
                  <span className="remark-label">Principal's Remarks:</span>
                  <span className="remark-val">
                    {activeResult.remarks?.principal || 'Awaiting Principal Review...'}
                  </span>
                </td>
              </tr>

              {/* Row 4: Principal details */}
              <tr>
                <td className="detail-name-col">
                  <span className="detail-label">Name of Principal:</span>
                  <span className="detail-val">{activeResult.remarks?.principalName || 'Dr. Joseph Alao'}</span>
                </td>
                <td className="detail-sig-label-col">
                  <span className="detail-label">Signature:</span>
                </td>
                <td className="detail-sig-val-col">
                  <div className="sig-container">
                    {activeResult.remarks?.principalSignature ? (
                      <img src={activeResult.remarks.principalSignature} alt="Principal Signature" />
                    ) : (
                      <span className="sig-fallback" style={{ color: '#064e3b' }}>
                        {activeResult.remarks?.principalName || 'Dr. Joseph Alao'}
                      </span>
                    )}
                  </div>
                </td>
                <td className="detail-date-col">
                  <span className="detail-label">Date:</span>
                  <span className="detail-val">{activeResult.remarks?.principalDate || '-'}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer info stamp */}
        <div className="certificate-bottom-bar">
          <span>Verification Code: MNA-MD5-{(activeResult.id).toUpperCase()}</span>
          <span>Security Hash: PRINT-VALID-{new Date(activeResult.remarks?.principalDate || Date.now()).getFullYear()}</span>
        </div>
      </div>
    </div>
  );
}
