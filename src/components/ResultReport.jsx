import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';

function PillRating({ value }) {
  const ratingValue = parseInt(value, 10) || 0;
  return (
    <div className="pill-rating" aria-label={`${ratingValue} out of 5`}>
      {[1, 2, 3, 4, 5].map((num) => (
        <span
          key={num}
          className={`pill-bar-segment ${num <= ratingValue ? 'filled' : ''}`}
        />
      ))}
      <span className="pill-rating-numeric">{ratingValue}/5</span>
    </div>
  );
}

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
    reportCardHeaderFontSize,
    setCurrentRole
  } = useContext(AppContext);

  // Determine active result: passed-in for bulk prints, or global context
  const activeResult = customResult || viewingResult;

  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table' on mobile devices
  const [showSecondaryMeta, setShowSecondaryMeta] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState({});

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

  const handleBackToHome = () => {
    setViewingResult(null);
    setCurrentRole('student');
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
      <div className="report-card font-manna">
        {/* Header / Branding block */}
        <div className="report-header desktop-only-section">
          <div className="report-logo">
            <img src={ctxLogo} alt="Manna Academy Logo" className="logo-left-img" />
          </div>
          <div className="report-school-details">
            <h1>Manna Academy, Kaduna</h1>
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
        <div className="header-divider desktop-only-section"></div>
        <h2 className="student-header-title desktop-only-section">
          {student.name ? student.name.toUpperCase() : '-'}
        </h2>

        {/* Student identity block */}
        <div className="report-identity desktop-only-section">
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
        <div className="identity-table-wrapper desktop-only-section">
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
                <td className="grid-label"></td>
                <td className="grid-val"></td>
              </tr>
              <tr>
                <td className="grid-label">Class</td>
                <td className="grid-val text-uppercase">{activeClass.name || '-'}</td>
                <td className="grid-label">Year</td>
                <td className="grid-val">{activeResult.session || '-'} Academic Session</td>
              </tr>
              <tr>
                <td className="grid-label">Total Marks Obtainable</td>
                <td className="grid-val">{totalObtainable}</td>
                <td className="grid-label">Total Marks Obtained</td>
                <td className="grid-val">{studentRankInfo.totalScore}</td>
              </tr>
              <tr>
                <td className="grid-label">Average</td>
                <td className="grid-val">{studentRankInfo.average}%</td>
                <td className="grid-label"></td>
                <td className="grid-val"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section divider banner */}
        <div className="section-banner-centered desktop-only-section">
          Grade Sheet
        </div>

        {/* Mobile-Only Hero Summary Card & Profile Header */}
        <div className="mobile-only-section no-print">
          <div className="mobile-hero-card">
            <div className="mobile-hero-main">
              <div className="mobile-hero-avatar">
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

              <div className="mobile-hero-info">
                <h3 className="mobile-hero-name">{student.name || '-'}</h3>
                <div className="mobile-hero-sub">
                  <span className="mobile-hero-class">{activeClass.name || '-'}</span>
                  <span className="mobile-hero-divider">•</span>
                  <span className="mobile-hero-roll">Roll: {String(student.rollNo || '-').padStart(5, '0')}</span>
                </div>
              </div>

              <div className={`mobile-hero-gpa ${getPerformanceClass(studentRankInfo.average)}`}>
                <span className="gpa-label">Average</span>
                <span className="gpa-value">{studentRankInfo.average}%</span>
              </div>
            </div>

            <button 
              type="button"
              className="mobile-details-toggle-btn"
              onClick={() => setShowSecondaryMeta(!showSecondaryMeta)}
              aria-expanded={showSecondaryMeta}
            >
              <span>{showSecondaryMeta ? 'Hide Details' : 'Show Secondary Details'}</span>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                className={`chevron-icon ${showSecondaryMeta ? 'rotated' : ''}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <div className={`mobile-secondary-meta-drawer ${showSecondaryMeta ? 'expanded' : ''}`}>
              <div className="mobile-meta-grid">
                <div className="meta-grid-item">
                  <span className="meta-item-label">Reg. Number</span>
                  <span className="meta-item-val">{formatRegNo(student.rollNo)}</span>
                </div>
                <div className="meta-grid-item">
                  <span className="meta-item-label">Session</span>
                  <span className="meta-item-val">{activeResult.session}</span>
                </div>
                <div className="meta-grid-item">
                  <span className="meta-item-label">Term</span>
                  <span className="meta-item-val">{activeResult.term}</span>
                </div>
                <div className="meta-grid-item">
                  <span className="meta-item-label">Date of Birth</span>
                  <span className="meta-item-val">{student.dob || '-'}</span>
                </div>
                <div className="meta-grid-item">
                  <span className="meta-item-label">Father's Name</span>
                  <span className="meta-item-val">{student.fatherName || '-'}</span>
                </div>
                <div className="meta-grid-item">
                  <span className="meta-item-label">Mother's Name</span>
                  <span className="meta-item-val">{student.motherName || '-'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mobile-section-header">
            Grade Sheet
          </div>
        </div>

        {/* Mobile layout view switcher */}
        <div className="mobile-view-toggle no-print desktop-only-section">
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
        <div className="report-body desktop-only-section">
          <div className="desktop-split-layout">
            {/* Left Column: Grade Sheet (70% width) */}
            <div className="desktop-layout-left">
              <div className="table-wrapper report-table-view">
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
                      
                      const totalScore = parseFloat(score.total);
                      let remarkClass = 'remark-normal';
                      if (!isNaN(totalScore)) {
                        if (totalScore >= 75) remarkClass = 'remark-badge-green';
                        else if (totalScore >= 50) remarkClass = 'remark-badge-blue';
                        else remarkClass = 'remark-badge-red';
                      }

                      return (
                        <tr key={subId}>
                          <td>{index + 1}</td>
                          <td className="subject-name">{sub.name.toUpperCase()} ✓</td>
                          <td>{score.ca1}</td>
                          <td>{score.ca2}</td>
                          <td>{score.exam}</td>
                          <td className="bold-highlight">{score.total}</td>
                          <td className="remark-text-cell">
                            <span className={`remark-pill ${remarkClass}`}>{gradeInfo.remark}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Developmental Traits (30% width) */}
            <div className="desktop-layout-right">
              {/* Effective Development ratings */}
              <div className="traits-block-table">
                <table>
                  <thead>
                    <tr>
                      <th>Effective Development</th>
                      <th style={{ width: '70px' }}>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Activeness', val: activeResult.traits?.activeness },
                      { label: 'Attendance', val: activeResult.traits?.attendance },
                      { label: 'Punctuality', val: activeResult.traits?.punctuality },
                      { label: 'Self Control', val: activeResult.traits?.selfControl },
                      { label: 'Honesty', val: activeResult.traits?.honesty },
                      { label: 'Humility', val: activeResult.traits?.humility },
                      { label: 'Leadership', val: activeResult.traits?.leadership },
                      { label: 'Neatness', val: activeResult.traits?.neatness },
                      { label: 'Communication', val: activeResult.traits?.communication }
                    ].map((item) => (
                      <tr key={item.label} className="trait-item-row">
                        <td>{item.label}</td>
                        <td className="rating-val">{item.val || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Psychomotor ratings */}
              <div className="traits-block-table" style={{ marginTop: '1.25rem' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Psychomotor Skills</th>
                      <th style={{ width: '70px' }}>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: 'Handwriting', val: activeResult.psychomotor?.handwriting },
                      { label: 'Fluency', val: activeResult.psychomotor?.fluency },
                      { label: 'Neatness', val: activeResult.psychomotor?.neatness }
                    ].map((item) => (
                      <tr key={item.label} className="trait-item-row">
                        <td>{item.label}</td>
                        <td className="rating-val">{item.val || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Subject Cards & Traits & Remarks Sections */}
        <div className="mobile-only-section no-print">
          {/* Subject scorecard cards list */}
          <div className="mobile-subject-cards-list">
            {activeClass.subjects && activeClass.subjects.map((subId, index) => {
              const sub = subjects[subId] || { name: subId };
              const score = activeResult.scores[subId] || { ca1: '-', ca2: '-', exam: '-', total: '-' };
              const gradeInfo = score.total !== '-' ? getGradeInfo(score.total) : { grade: '-', remark: '-', color: '#64748b' };
              
              const totalScore = parseFloat(score.total);
              let performanceClass = 'perf-red';
              if (!isNaN(totalScore)) {
                if (totalScore >= 75) performanceClass = 'perf-green';
                else if (totalScore >= 50) performanceClass = 'perf-amber';
              } else {
                performanceClass = 'perf-gray';
              }

              return (
                <div key={subId} className={`mobile-subject-card ${performanceClass}`}>
                  <div className="card-top-row">
                    <div className="card-subject-info">
                      <span className="card-subject-index">#{index + 1}</span>
                      <span className="card-subject-name">{sub.name.toUpperCase()}</span>
                    </div>
                    <div className="card-badge-group">
                      <span className="percentage-badge">{score.total !== '-' ? `${score.total}%` : '-'}</span>
                      <span className="letter-grade-badge">{gradeInfo.grade}</span>
                    </div>
                  </div>
                  
                  <div className="card-bottom-grid">
                    <div className="grid-score-pill"><span>CA 1:</span> <strong>{score.ca1}</strong></div>
                    <div className="grid-score-pill"><span>CA 2:</span> <strong>{score.ca2}</strong></div>
                    <div className="grid-score-pill"><span>Exam:</span> <strong>{score.exam}</strong></div>
                    <div className="grid-score-pill highlight-pill"><span>Total:</span> <strong>{score.total}</strong></div>
                  </div>

                  {gradeInfo.remark && gradeInfo.remark !== '-' && (
                    <div className="card-teacher-remark">
                      <span className="remark-lbl">Remark:</span> <span className="remark-val">{gradeInfo.remark}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Development traits Sidebars */}
          <div className="mobile-traits-section">
            <div className="mobile-traits-card">
              <h4 className="traits-card-header">Effective Development</h4>
              <div className="traits-list">
                {[
                  { label: 'Activeness', val: activeResult.traits?.activeness },
                  { label: 'Attendance', val: activeResult.traits?.attendance },
                  { label: 'Punctuality', val: activeResult.traits?.punctuality },
                  { label: 'Self Control', val: activeResult.traits?.selfControl },
                  { label: 'Honesty', val: activeResult.traits?.honesty },
                  { label: 'Humility', val: activeResult.traits?.humility },
                  { label: 'Leadership', val: activeResult.traits?.leadership },
                  { label: 'Neatness', val: activeResult.traits?.neatness },
                  { label: 'Communication', val: activeResult.traits?.communication }
                ].map((item) => (
                  <div key={item.label} className="trait-row">
                    <span className="trait-lbl">{item.label}</span>
                    <PillRating value={item.val || 0} />
                  </div>
                ))}
              </div>
            </div>

            <div className="mobile-traits-card">
              <h4 className="traits-card-header">Psychomotor Skills</h4>
              <div className="traits-list">
                {[
                  { label: 'Handwriting', val: activeResult.psychomotor?.handwriting },
                  { label: 'Fluency', val: activeResult.psychomotor?.fluency },
                  { label: 'Neatness', val: activeResult.psychomotor?.neatness }
                ].map((item) => (
                  <div key={item.label} className="trait-row">
                    <span className="trait-lbl">{item.label}</span>
                    <PillRating value={item.val || 0} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Remarks & Signatures Cards */}
          <div className="mobile-remarks-list">
            <div className="mobile-section-header">Remarks</div>

            <div className="remarks-quote-card">
              <div className="quote-card-header">
                <svg className="quote-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.19 12.07c0-2.48-.99-4.74-2.61-6.37l1.42-1.42C12.21 6.5 13.19 9.17 13.19 12.07v6.93H6.26v-6.93h4.93zm9 0c0-2.48-.99-4.74-2.61-6.37l1.42-1.42c2.21 2.21 3.19 4.88 3.19 7.78v6.93h-6.93v-6.93h4.93z"/>
                </svg>
                <span className="quote-author-role">Class Teacher's Remarks</span>
              </div>
              <p className="quote-text">
                "{activeResult.remarks?.teacher || 'Jayden is a Jovial child but easily gets distracted.'}"
              </p>
              <div className="quote-card-footer">
                <div className="author-meta">
                  <span className="author-name">{activeResult.remarks?.teacherName || 'Miss Blessing Obaka'}</span>
                  <span className="signature-date">{activeResult.remarks?.teacherDate || '2026-07-23'}</span>
                </div>
                <div className="signature-display">
                  {activeResult.remarks?.teacherSignature ? (
                    <img src={activeResult.remarks.teacherSignature} alt="Teacher Signature" />
                  ) : (
                    <span className="sig-fallback-text">{activeResult.remarks?.teacherName || 'Miss Blessing Obaka'}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="remarks-quote-card">
              <div className="quote-card-header">
                <svg className="quote-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.19 12.07c0-2.48-.99-4.74-2.61-6.37l1.42-1.42C12.21 6.5 13.19 9.17 13.19 12.07v6.93H6.26v-6.93h4.93zm9 0c0-2.48-.99-4.74-2.61-6.37l1.42-1.42c2.21 2.21 3.19 4.88 3.19 7.78v6.93h-6.93v-6.93h4.93z"/>
                </svg>
                <span className="quote-author-role">Principal's Remarks</span>
              </div>
              <p className="quote-text">
                "{activeResult.remarks?.principal || 'A good result but keep practising. Promoted to pre-Nursery class.'}"
              </p>
              <div className="quote-card-footer">
                <div className="author-meta">
                  <span className="author-name">{activeResult.remarks?.principalName || 'Mrs Chinyere Anokam'}</span>
                  <span className="signature-date">{activeResult.remarks?.principalDate || '2026-07-23'}</span>
                </div>
                <div className="signature-display">
                  {activeResult.remarks?.principalSignature ? (
                    <img src={activeResult.remarks.principalSignature} alt="Principal Signature" />
                  ) : (
                    <span className="sig-fallback-text" style={{ color: '#064e3b' }}>{activeResult.remarks?.principalName || 'Mrs Chinyere Anokam'}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Verification Box */}
          <div className="mobile-verification-box">
            <div className="verification-header">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="secure-icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Secure Verification Portal</span>
            </div>
            <div className="verification-details font-mono">
              <div className="code-line">
                <span className="code-lbl">Verification Code:</span>
                <span className="code-val">MNA-MD5-{(activeResult.id).toUpperCase()}</span>
              </div>
              <div className="code-line">
                <span className="code-lbl">Security Hash:</span>
                <span className="code-val">PRINT-VALID-{new Date(activeResult.remarks?.principalDate || Date.now()).getFullYear()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Remarks and signatures block */}
        <div className="manna-remarks-section desktop-only-section">
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
        <div className="certificate-bottom-bar font-mono desktop-only-section">
          <span>Verification Code: MNA-MD5-{(activeResult.id).toUpperCase()}</span>
          <span>Security Hash: PRINT-VALID-{new Date(activeResult.remarks?.principalDate || Date.now()).getFullYear()}</span>
        </div>
      </div>

      {/* Bottom Action Buttons (hidden when printing) */}
      {!customResult && (
        <div className="bottom-actions-container no-print">
          <div className="actions-row-centered">
            <button onClick={handlePrint} className="btn-golden btn-print">
              🖨 Print
            </button>
            <button onClick={handleBackClick} className="btn-golden btn-search">
              🔄 Search Again
            </button>
          </div>
          <button onClick={handleBackToHome} className="btn-golden btn-home-full">
            Back To Home Page
          </button>
        </div>
      )}
    </div>
  );
}
