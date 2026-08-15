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

  // Format Roll / Registration Number (e.g. MA/000481)
  const formatRegNo = (rollNo) => {
    if (!rollNo) return '-';
    const padded = String(rollNo).padStart(5, '0');
    return `MA/${padded}`;
  };

  // Shield secondary logo
  const secondaryLogo = (
    <img src="/logo-secondary.png" alt="Manna Crest Logo" className="logo-right-img" onError={(e) => {
      // Fallback to primary if secondary load fails
      e.target.src = ctxLogo;
    }} />
  );

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

      <div className="report-card font-manna">
        {/* Header / Branding block */}
        <div className="report-header">
          <div className="report-logo">
            <img src={ctxLogo} alt="Manna Academy Logo" className="logo-left-img" />
          </div>
          <div className="report-school-details">
            <h1>MANNA ACADEMY,</h1>
            <h2 className="school-city">KADUNA</h2>
            <p className="school-meta-address">
              Plot C2A, Hakimi Close, off Makera-Kujama Road, Sabo G.R.A, Kaduna South, Kaduna
            </p>
            <p className="school-established">
              Established in 2019
            </p>
          </div>
          <div className="report-logo">
            {secondaryLogo}
          </div>
        </div>

        {/* Divider and centered student name */}
        <div className="header-divider"></div>
        <h2 className="student-header-title">
          {student.name ? student.name.toUpperCase() : '-'}
        </h2>

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

          <div className="student-top-details">
            <div className="detail-line"><span className="detail-label">Name</span><span className="detail-dots">:</span><span className="detail-val text-uppercase">{student.name || '-'}</span></div>
            <div className="detail-line"><span className="detail-label">Class</span><span className="detail-dots">:</span><span className="detail-val text-uppercase">{activeClass.name || '-'}</span></div>
            <div className="detail-line"><span className="detail-label">Roll No</span><span className="detail-dots">:</span><span className="detail-val">{String(student.rollNo || '-').padStart(5, '0')}</span></div>
            <div className="detail-line"><span className="detail-label">Regi No</span><span className="detail-dots">:</span><span className="detail-val">{formatRegNo(student.rollNo)}</span></div>
            <div className="detail-line"><span className="detail-label">Exam</span><span className="detail-dots">:</span><span className="detail-val">{activeResult.term} Result</span></div>
          </div>
        </div>

        {/* Identity Grid Table */}
        <div className="identity-table-wrapper">
          <table className="identity-table-grid">
            <tbody>
              <tr>
                <td className="grid-label">Name of Student</td>
                <td className="grid-val text-uppercase">{student.name || '-'}</td>
                <td className="grid-label">Admission No</td>
                <td className="grid-val">{formatRegNo(student.rollNo)}</td>
              </tr>
              <tr>
                <td className="grid-label">Date of Birth</td>
                <td className="grid-val">{student.dob || '-'}</td>
                <td className="grid-label">Father's Name</td>
                <td className="grid-val">{student.fatherName || '-'}</td>
              </tr>
              <tr>
                <td className="grid-label">Mother's Name</td>
                <td className="grid-val">{student.motherName || '-'}</td>
                <td className="grid-label">Class</td>
                <td className="grid-val text-uppercase">{activeClass.name || '-'}</td>
              </tr>
              <tr>
                <td className="grid-label">Year</td>
                <td className="grid-val" colSpan="3">{activeResult.session || '-'} Academic Session</td>
              </tr>
              <tr>
                <td className="grid-label">Total Marks Obtainable</td>
                <td className="grid-val">{totalObtainable}</td>
                <td className="grid-label">Total Marks Obtained</td>
                <td className="grid-val">{studentRankInfo.totalScore}</td>
              </tr>
              <tr>
                <td className="grid-label">Average</td>
                <td className="grid-val" colSpan="3">{studentRankInfo.average}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section divider banner */}
        <div className="section-banner-centered">
          Grade Sheet
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
            <table className="manna-grid-table">
              <thead>
                <tr>
                  <th style={{ width: '45px' }} rowspan="2">No.</th>
                  <th style={{ textAlign: 'left' }} rowspan="2">Subject</th>
                  <th style={{ width: '85px' }}>CA 1</th>
                  <th style={{ width: '85px' }}>CA 2</th>
                  <th style={{ width: '85px' }}>Exams</th>
                  <th style={{ width: '85px' }}>Total</th>
                  <th>Teacher's Remarks</th>
                </tr>
                <tr className="sub-headers">
                  <th>15/20%</th>
                  <th>15/20%</th>
                  <th>60/70%</th>
                  <th>100%</th>
                  <th>Subject Performance</th>
                </tr>
              </thead>
              <tbody>
                {activeClass.subjects && activeClass.subjects.map((subId, index) => {
                  const sub = subjects[subId] || { name: subId };
                  const score = activeResult.scores[subId] || { ca1: '-', ca2: '-', exam: '-', total: '-' };
                  const gradeInfo = score.total !== '-' ? getGradeInfo(score.total) : { grade: '-', remark: '-', color: '#64748b' };
                  
                  return (
                    <tr key={subId}>
                      <td>{index + 1}</td>
                      <td className="subject-name">{sub.name}</td>
                      <td>{score.ca1}</td>
                      <td>{score.ca2}</td>
                      <td>{score.exam}</td>
                      <td className="bold-highlight">{score.total}</td>
                      <td className="remark-text-cell">{gradeInfo.remark}</td>
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
              
              return (
                <div key={subId} className="subject-card">
                  <div className="subject-card-header">
                    <span className="subject-card-index">#{index + 1}</span>
                    <h4 className="subject-card-name">{sub.name}</h4>
                  </div>
                  
                  <div className="subject-card-scores">
                    <div className="score-row">
                      <span className="score-label">CA 1 (15/20%)</span>
                      <span className="score-value">{score.ca1}</span>
                    </div>
                    <div className="score-row">
                      <span className="score-label">CA 2 (15/20%)</span>
                      <span className="score-value">{score.ca2}</span>
                    </div>
                    <div className="score-row">
                      <span className="score-label">Exam (60/70%)</span>
                      <span className="score-value">{score.exam}</span>
                    </div>
                    <div className="score-row total-highlight">
                      <span className="score-label">Total Score (100%)</span>
                      <span className="score-value bold-highlight">{score.total}</span>
                    </div>
                  </div>
                  
                  <div className="subject-card-footer">
                    <div className="badge-wrapper">
                      <span className="badge-title">Teacher's Remarks</span>
                      <span className="remark-text-val">{gradeInfo.remark}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Development traits Sidebars */}
          <div className="traits-layout-grid">
            {/* Effective Development ratings */}
            <div className="traits-block-table">
              <table>
                <thead>
                  <tr>
                    <th>Effective Development</th>
                    <th style={{ width: '80px' }}>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="trait-item-row">
                    <td>Activeness</td>
                    <td className="rating-val">{activeResult.traits?.activeness || 0}</td>
                  </tr>
                  <tr className="trait-item-row">
                    <td>Attendance</td>
                    <td className="rating-val">{activeResult.traits?.attendance || 0}</td>
                  </tr>
                  <tr className="trait-item-row">
                    <td>Punctuality</td>
                    <td className="rating-val">{activeResult.traits?.punctuality || 0}</td>
                  </tr>
                  <tr className="trait-item-row">
                    <td>Self Control</td>
                    <td className="rating-val">{activeResult.traits?.selfControl || 0}</td>
                  </tr>
                  <tr className="trait-item-row">
                    <td>Honesty</td>
                    <td className="rating-val">{activeResult.traits?.honesty || 0}</td>
                  </tr>
                  <tr className="trait-item-row">
                    <td>Humility</td>
                    <td className="rating-val">{activeResult.traits?.humility || 0}</td>
                  </tr>
                  <tr className="trait-item-row">
                    <td>Leadership</td>
                    <td className="rating-val">{activeResult.traits?.leadership || 0}</td>
                  </tr>
                  <tr className="trait-item-row">
                    <td>Neatness</td>
                    <td className="rating-val">{activeResult.traits?.neatness || 0}</td>
                  </tr>
                  <tr className="trait-item-row">
                    <td>Communication</td>
                    <td className="rating-val">{activeResult.traits?.communication || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Psychomotor ratings */}
            <div className="traits-block-table">
              <table>
                <thead>
                  <tr>
                    <th>Psychomotor Skills</th>
                    <th style={{ width: '80px' }}>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="trait-item-row">
                    <td>Handwriting</td>
                    <td className="rating-val">{activeResult.psychomotor?.handwriting || 0}</td>
                  </tr>
                  <tr className="trait-item-row">
                    <td>Fluency</td>
                    <td className="rating-val">{activeResult.psychomotor?.fluency || 0}</td>
                  </tr>
                  <tr className="trait-item-row">
                    <td>Neatness</td>
                    <td className="rating-val">{activeResult.psychomotor?.neatness || 0}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Remarks and signatures block */}
        <div className="manna-remarks-section">
          <div className="remarks-header-bar">Remarks</div>
          
          <div className="remarks-content-body">
            {/* Teacher Remarks Row */}
            <div className="remarks-row">
              <div className="remarks-label-block">
                <span className="bold-lbl">Master/Mistress Remarks:</span>
                <span className="remark-val-text">
                  {activeResult.remarks?.teacher || 'Jayden is a Jovial child but easily gets distracted.'}
                </span>
              </div>
              <div className="signatures-grid-row">
                <div className="sig-meta-col">
                  <span className="sig-lbl">Name:</span>
                  <span className="sig-val">{activeResult.remarks?.teacherName || 'Miss Blessing Obaka'}</span>
                </div>
                <div className="sig-meta-col flex-center-sig">
                  <span className="sig-lbl">Signature:</span>
                  <div className="signature-box-img">
                    {activeResult.remarks?.teacherSignature ? (
                      <img src={activeResult.remarks.teacherSignature} alt="Teacher Signature" />
                    ) : (
                      <span className="sig-fallback-text">{activeResult.remarks?.teacherName || 'Miss Blessing Obaka'}</span>
                    )}
                  </div>
                </div>
                <div className="sig-meta-col">
                  <span className="sig-lbl">Date:</span>
                  <span className="sig-val">{activeResult.remarks?.teacherDate || '2026-07-23'}</span>
                </div>
              </div>
            </div>

            {/* Divider between teacher and principal */}
            <div className="remarks-divider-line"></div>

            {/* Principal Remarks Row */}
            <div className="remarks-row">
              <div className="remarks-label-block">
                <span className="bold-lbl">Principal's Remarks:</span>
                <span className="remark-val-text">
                  {activeResult.remarks?.principal || 'A good result but keep practising. Promoted to pre-Nursery class.'}
                </span>
              </div>
              <div className="signatures-grid-row">
                <div className="sig-meta-col">
                  <span className="sig-lbl">Name of Principal:</span>
                  <span className="sig-val">{activeResult.remarks?.principalName || 'Mrs Chinyere Anokam'}</span>
                </div>
                <div className="sig-meta-col flex-center-sig">
                  <span className="sig-lbl">Signature:</span>
                  <div className="signature-box-img">
                    {activeResult.remarks?.principalSignature ? (
                      <img src={activeResult.remarks.principalSignature} alt="Principal Signature" />
                    ) : (
                      <span className="sig-fallback-text" style={{ color: '#064e3b' }}>{activeResult.remarks?.principalName || 'Mrs Chinyere Anokam'}</span>
                    )}
                  </div>
                </div>
                <div className="sig-meta-col">
                  <span className="sig-lbl">Date:</span>
                  <span className="sig-val">{activeResult.remarks?.principalDate || '2026-07-23'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info stamp */}
        <div className="certificate-bottom-bar font-mono">
          <span>Verification Code: MNA-MD5-{(activeResult.id).toUpperCase()}</span>
          <span>Security Hash: PRINT-VALID-{new Date(activeResult.remarks?.principalDate || Date.now()).getFullYear()}</span>
        </div>
      </div>
    </div>
  );
}
