import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { pool, initDb } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Bootstrap API
app.get('/api/bootstrap', async (req, res) => {
  try {
    const [
      settings,
      classes,
      subjects,
      teachers,
      students,
      results,
      auditLogs
    ] = await Promise.all([
      pool.query('SELECT * FROM settings WHERE id = 1'),
      pool.query('SELECT * FROM classes'),
      pool.query('SELECT * FROM subjects'),
      pool.query('SELECT * FROM teachers'),
      pool.query('SELECT * FROM students'),
      pool.query('SELECT * FROM results'),
      pool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC')
    ]);

    // format subjects as an object keyed by id
    const subjectsObj = {};
    subjects.rows.forEach(r => {
      subjectsObj[r.id] = { id: r.id, name: r.name, defaultTeacher: r.default_teacher };
    });

    // format classes
    const formattedClasses = classes.rows.map(r => ({
      id: r.id,
      name: r.name,
      baseName: r.base_name,
      arm: r.arm,
      subjects: r.subjects
    }));

    // format teachers
    const formattedTeachers = teachers.rows.map(r => ({
      id: r.id,
      name: r.name,
      email: r.email,
      password: r.password,
      assignedClass: r.assigned_class,
      subjects: r.subjects,
      photo: r.photo
    }));

    // format students
    const formattedStudents = students.rows.map(r => ({
      id: r.id,
      name: r.name,
      classId: r.class_id,
      rollNo: r.roll_no,
      dob: r.dob,
      fatherName: r.father_name,
      motherName: r.mother_name,
      parentContact: r.parent_contact,
      photo: r.photo,
      active: r.active
    }));

    // format results
    const formattedResults = results.rows.map(r => ({
      id: r.id,
      studentId: r.student_id,
      classId: r.class_id,
      term: r.term,
      session: r.session,
      status: r.status,
      scores: r.scores,
      traits: r.traits,
      psychomotor: r.psychomotor,
      remarks: r.remarks
    }));

    // format settings
    const s = settings.rows[0];
    const formattedSettings = s ? {
      schoolName: s.school_name,
      schoolSubtitle: s.school_subtitle,
      schoolLogo: s.school_logo,
      schoolMotto: s.school_motto,
      schoolAddress: s.school_address,
      reportCardFont: s.report_card_font,
      reportCardHeaderFont: s.report_card_header_font,
      reportCardHeaderFontSize: s.report_card_header_font_size,
      adminName: s.admin_name,
      adminEmail: s.admin_email,
      adminPassword: s.admin_password,
      adminAvatar: s.admin_avatar,
      currentSession: s.current_session,
      currentTerm: s.current_term,
      allowStudentReg: s.allow_student_reg,
      maintenanceMode: s.maintenance_mode,
      gradingScale: s.grading_scale
    } : null;

    // format audit logs
    const formattedAuditLogs = auditLogs.rows.map(r => ({
      id: r.id,
      action: r.action,
      user: r.username,
      timestamp: r.timestamp,
      details: r.details
    }));

    res.json({
      classes: formattedClasses,
      subjects: subjectsObj,
      teachers: formattedTeachers,
      students: formattedStudents,
      results: formattedResults,
      auditLogs: formattedAuditLogs,
      settings: formattedSettings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server bootstrap error' });
  }
});

// Authentication Route
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    // 1. Check teacher
    const teacherResult = await pool.query('SELECT * FROM teachers WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    if (teacherResult.rows.length > 0) {
      const teacher = teacherResult.rows[0];
      if ((teacher.password || 'password123').trim() === password.trim()) {
        return res.json({
          success: true,
          role: 'teacher',
          user: {
            id: teacher.id,
            name: teacher.name,
            email: teacher.email,
            assignedClass: teacher.assigned_class,
            subjects: teacher.subjects,
            photo: teacher.photo
          }
        });
      }
    }

    // 2. Check admin
    const settingsResult = await pool.query('SELECT * FROM settings WHERE id = 1');
    const s = settingsResult.rows[0];
    if (s && s.admin_email.trim().toLowerCase() === email.trim().toLowerCase() && s.admin_password.trim() === password.trim()) {
      return res.json({
        success: true,
        role: 'admin',
        user: {
          name: s.admin_name,
          email: s.admin_email,
          avatar: s.admin_avatar
        }
      });
    }

    res.status(401).json({ success: false, error: 'Invalid email or password.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Auth failed.' });
  }
});

// Student Lookup Verification Route
app.post('/api/students/verify-lookup', async (req, res) => {
  const { name, rollNo } = req.body;
  const ip = req.ip || 'unknown';
  const now = Date.now();

  try {
    // 1. Check lockout status
    const lockoutRes = await pool.query('SELECT * FROM lockouts WHERE ip = $1', [ip]);
    const lockout = lockoutRes.rows[0];

    if (lockout && lockout.lockout_until && now < parseInt(lockout.lockout_until)) {
      const remainingSeconds = Math.ceil((parseInt(lockout.lockout_until) - now) / 1000);
      return res.json({
        success: false,
        error: `Too many failed attempts. Lookup is locked. Please try again in ${remainingSeconds} seconds.`,
        locked: true
      });
    }

    // 2. Find student
    const studentRes = await pool.query(
      'SELECT * FROM students WHERE LOWER(name) = LOWER($1) AND roll_no = $2',
      [name.trim(), parseInt(rollNo)]
    );

    if (studentRes.rows.length === 0) {
      // Increment failed attempts
      let attempts = 1;
      if (lockout) {
        attempts = lockout.failed_attempts + 1;
      }

      if (attempts >= 5) {
        const lockoutUntil = now + (5 * 60 * 1000); // 5 minutes
        await pool.query(
          'INSERT INTO lockouts (ip, failed_attempts, lockout_until) VALUES ($1, 0, $2) ON CONFLICT (ip) DO UPDATE SET failed_attempts = 0, lockout_until = $2',
          [ip, lockoutUntil]
        );
        return res.json({
          success: false,
          error: 'Maximum lookup attempts exceeded. Access locked for 5 minutes.',
          locked: true
        });
      } else {
        await pool.query(
          'INSERT INTO lockouts (ip, failed_attempts, lockout_until) VALUES ($1, $2, 0) ON CONFLICT (ip) DO UPDATE SET failed_attempts = $2',
          [ip, attempts]
        );
        return res.json({
          success: false,
          error: `Invalid full name or roll number. (${5 - attempts} attempts remaining)`,
          locked: false
        });
      }
    }

    // Success: Reset lockouts and return student results
    await pool.query('DELETE FROM lockouts WHERE ip = $1', [ip]);

    const student = studentRes.rows[0];
    const resultsRes = await pool.query('SELECT * FROM results WHERE student_id = $1', [student.id]);

    const formattedStudent = {
      id: student.id,
      name: student.name,
      classId: student.class_id,
      rollNo: student.roll_no,
      dob: student.dob,
      fatherName: student.father_name,
      motherName: student.mother_name,
      parentContact: student.parent_contact,
      photo: student.photo,
      active: student.active
    };

    const formattedResults = resultsRes.rows.map(r => ({
      id: r.id,
      studentId: r.student_id,
      classId: r.class_id,
      term: r.term,
      session: r.session,
      status: r.status,
      scores: r.scores,
      traits: r.traits,
      psychomotor: r.psychomotor,
      remarks: r.remarks
    }));

    res.json({
      success: true,
      student: formattedStudent,
      resultsList: formattedResults
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Verification failed.' });
  }
});

// Settings API
app.put('/api/settings', async (req, res) => {
  const {
    schoolName, schoolSubtitle, schoolLogo, schoolMotto, schoolAddress,
    reportCardFont, reportCardHeaderFont, reportCardHeaderFontSize,
    adminName, adminEmail, adminPassword, adminAvatar,
    currentSession, currentTerm, allowStudentReg, maintenanceMode, gradingScale
  } = req.body;

  try {
    await pool.query(
      `UPDATE settings SET 
        school_name = $1, school_subtitle = $2, school_logo = $3, school_motto = $4, school_address = $5,
        report_card_font = $6, report_card_header_font = $7, report_card_header_font_size = $8,
        admin_name = $9, admin_email = $10, admin_password = $11, admin_avatar = $12,
        current_session = $13, current_term = $14, allow_student_reg = $15, maintenance_mode = $16, grading_scale = $17
      WHERE id = 1`,
      [
        schoolName, schoolSubtitle, schoolLogo, schoolMotto, schoolAddress,
        reportCardFont, reportCardHeaderFont, reportCardHeaderFontSize,
        adminName, adminEmail, adminPassword, adminAvatar,
        currentSession, currentTerm, allowStudentReg ? true : false, maintenanceMode ? true : false,
        typeof gradingScale === 'string' ? gradingScale : JSON.stringify(gradingScale)
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update settings.' });
  }
});

// Audit Logs API
app.get('/api/audit-logs', async (req, res) => {
  try {
    const logs = await pool.query('SELECT * FROM audit_logs ORDER BY timestamp DESC');
    res.json(logs.rows.map(r => ({
      id: r.id,
      action: r.action,
      user: r.username,
      timestamp: r.timestamp,
      details: r.details
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch logs.' });
  }
});

app.post('/api/audit-logs', async (req, res) => {
  const { id, action, user, timestamp, details } = req.body;
  try {
    await pool.query(
      'INSERT INTO audit_logs (id, action, username, timestamp, details) VALUES ($1, $2, $3, $4, $5)',
      [id, action, user, timestamp, details]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save log.' });
  }
});

// Students API
app.post('/api/students', async (req, res) => {
  const { studentData, actor } = req.body;
  const id = studentData.id || 'std_' + Date.now();
  try {
    await pool.query(
      `INSERT INTO students (id, name, class_id, roll_no, dob, father_name, mother_name, parent_contact, photo, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        id,
        studentData.name,
        studentData.classId,
        parseInt(studentData.rollNo),
        studentData.dob,
        studentData.fatherName,
        studentData.motherName,
        studentData.parentContact || '',
        studentData.photo,
        studentData.active !== false
      ]
    );

    // Audit Log
    const newLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      action: 'Added Student',
      user: actor,
      timestamp: new Date().toISOString(),
      details: `Registered student ${studentData.name} (Roll No: ${studentData.rollNo}) into class ${studentData.classId}.`
    };
    await pool.query(
      'INSERT INTO audit_logs (id, action, username, timestamp, details) VALUES ($1, $2, $3, $4, $5)',
      [newLog.id, newLog.action, newLog.user, newLog.timestamp, newLog.details]
    );

    res.status(201).json({ ...studentData, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create student' });
  }
});

app.put('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  const { updatedData, actor } = req.body;
  try {
    await pool.query(
      `UPDATE students SET name = $1, class_id = $2, roll_no = $3, dob = $4, father_name = $5, mother_name = $6, parent_contact = $7, photo = $8, active = $9
       WHERE id = $10`,
      [
        updatedData.name,
        updatedData.classId,
        parseInt(updatedData.rollNo),
        updatedData.dob,
        updatedData.fatherName,
        updatedData.motherName,
        updatedData.parentContact || '',
        updatedData.photo,
        updatedData.active !== false,
        id
      ]
    );

    // Audit Log
    const newLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      action: 'Updated Student',
      user: actor,
      timestamp: new Date().toISOString(),
      details: `Modified student profile for ${updatedData.name || id}.`
    };
    await pool.query(
      'INSERT INTO audit_logs (id, action, username, timestamp, details) VALUES ($1, $2, $3, $4, $5)',
      [newLog.id, newLog.action, newLog.user, newLog.timestamp, newLog.details]
    );

    res.json(updatedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update student' });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  const { id } = req.params;
  const { actor } = req.query;
  try {
    const studentRes = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
    const std = studentRes.rows[0];
    await pool.query('DELETE FROM students WHERE id = $1', [id]);

    if (std) {
      const newLog = {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        action: 'Removed Student',
        user: actor || 'Admin',
        timestamp: new Date().toISOString(),
        details: `Deleted student profile for ${std.name} (Roll No: ${std.roll_no}).`
      };
      await pool.query(
        'INSERT INTO audit_logs (id, action, username, timestamp, details) VALUES ($1, $2, $3, $4, $5)',
        [newLog.id, newLog.action, newLog.user, newLog.timestamp, newLog.details]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

// Teachers API
app.post('/api/teachers', async (req, res) => {
  const { teacherData, actor } = req.body;
  const id = teacherData.id || 't_' + Date.now();
  try {
    await pool.query(
      `INSERT INTO teachers (id, name, email, password, assigned_class, subjects, photo)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        id,
        teacherData.name,
        teacherData.email,
        teacherData.password || 'password123',
        teacherData.assignedClass,
        JSON.stringify(teacherData.subjects || []),
        teacherData.photo || ''
      ]
    );

    // Audit Log
    const newLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      action: 'Added Class Teacher',
      user: actor,
      timestamp: new Date().toISOString(),
      details: `Registered teacher ${teacherData.name} and assigned to class ${teacherData.assignedClass}.`
    };
    await pool.query(
      'INSERT INTO audit_logs (id, action, username, timestamp, details) VALUES ($1, $2, $3, $4, $5)',
      [newLog.id, newLog.action, newLog.user, newLog.timestamp, newLog.details]
    );

    res.status(201).json({ ...teacherData, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create teacher' });
  }
});

app.put('/api/teachers/:id', async (req, res) => {
  const { id } = req.params;
  const { updatedData, actor } = req.body;
  try {
    await pool.query(
      `UPDATE teachers SET name = $1, email = $2, password = $3, assigned_class = $4, subjects = $5, photo = $6
       WHERE id = $7`,
      [
        updatedData.name,
        updatedData.email,
        updatedData.password || 'password123',
        updatedData.assignedClass,
        JSON.stringify(updatedData.subjects || []),
        updatedData.photo,
        id
      ]
    );

    // Audit Log
    const newLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      action: 'Updated Class Teacher',
      user: actor,
      timestamp: new Date().toISOString(),
      details: `Modified teacher profile for ${updatedData.name || id}.`
    };
    await pool.query(
      'INSERT INTO audit_logs (id, action, username, timestamp, details) VALUES ($1, $2, $3, $4, $5)',
      [newLog.id, newLog.action, newLog.user, newLog.timestamp, newLog.details]
    );

    res.json(updatedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update teacher' });
  }
});

app.delete('/api/teachers/:id', async (req, res) => {
  const { id } = req.params;
  const { actor } = req.query;
  try {
    const teacherRes = await pool.query('SELECT * FROM teachers WHERE id = $1', [id]);
    const teacher = teacherRes.rows[0];
    await pool.query('DELETE FROM teachers WHERE id = $1', [id]);

    if (teacher) {
      const newLog = {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        action: 'Removed Class Teacher',
        user: actor || 'Admin',
        timestamp: new Date().toISOString(),
        details: `Removed teacher ${teacher.name} from assignment.`
      };
      await pool.query(
        'INSERT INTO audit_logs (id, action, username, timestamp, details) VALUES ($1, $2, $3, $4, $5)',
        [newLog.id, newLog.action, newLog.user, newLog.timestamp, newLog.details]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
});

// Subjects API
app.post('/api/subjects', async (req, res) => {
  const { subjectData, actor } = req.body;
  const id = subjectData.id.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_') || 'sub_' + Date.now();
  try {
    await pool.query(
      `INSERT INTO subjects (id, name, default_teacher)
       VALUES ($1, $2, $3)`,
      [id, subjectData.name, subjectData.defaultTeacher || 'Unassigned']
    );

    // Audit Log
    const newLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      action: 'Added Subject',
      user: actor,
      timestamp: new Date().toISOString(),
      details: `Registered subject ${subjectData.name} (${id}).`
    };
    await pool.query(
      'INSERT INTO audit_logs (id, action, username, timestamp, details) VALUES ($1, $2, $3, $4, $5)',
      [newLog.id, newLog.action, newLog.user, newLog.timestamp, newLog.details]
    );

    res.status(201).json({ id, name: subjectData.name, defaultTeacher: subjectData.defaultTeacher });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

app.put('/api/subjects/:id', async (req, res) => {
  const { id } = req.params;
  const { updatedData, actor } = req.body;
  try {
    await pool.query(
      `UPDATE subjects SET name = $1, default_teacher = $2 WHERE id = $3`,
      [updatedData.name, updatedData.defaultTeacher, id]
    );

    // Audit Log
    const newLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      action: 'Updated Subject',
      user: actor,
      timestamp: new Date().toISOString(),
      details: `Modified subject details for ${updatedData.name || id}.`
    };
    await pool.query(
      'INSERT INTO audit_logs (id, action, username, timestamp, details) VALUES ($1, $2, $3, $4, $5)',
      [newLog.id, newLog.action, newLog.user, newLog.timestamp, newLog.details]
    );

    res.json(updatedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

app.delete('/api/subjects/:id', async (req, res) => {
  const { id } = req.params;
  const { actor } = req.query;
  try {
    const subRes = await pool.query('SELECT * FROM subjects WHERE id = $1', [id]);
    const sub = subRes.rows[0];

    await pool.query('DELETE FROM subjects WHERE id = $1', [id]);

    // Cascade delete reference from classes
    const classes = await pool.query('SELECT * FROM classes');
    for (const c of classes.rows) {
      if (Array.isArray(c.subjects) && c.subjects.includes(id)) {
        const filtered = c.subjects.filter(sid => sid !== id);
        await pool.query('UPDATE classes SET subjects = $1 WHERE id = $2', [JSON.stringify(filtered), c.id]);
      }
    }

    // Cascade delete reference from teachers
    const teachers = await pool.query('SELECT * FROM teachers');
    for (const t of teachers.rows) {
      if (Array.isArray(t.subjects) && t.subjects.includes(id)) {
        const filtered = t.subjects.filter(sid => sid !== id);
        await pool.query('UPDATE teachers SET subjects = $1 WHERE id = $2', [JSON.stringify(filtered), t.id]);
      }
    }

    if (sub) {
      const newLog = {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        action: 'Removed Subject',
        user: actor || 'Admin',
        timestamp: new Date().toISOString(),
        details: `Deleted subject ${sub.name} (${id}) from registry.`
      };
      await pool.query(
        'INSERT INTO audit_logs (id, action, username, timestamp, details) VALUES ($1, $2, $3, $4, $5)',
        [newLog.id, newLog.action, newLog.user, newLog.timestamp, newLog.details]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

// Classes API
app.post('/api/classes', async (req, res) => {
  const { classId, baseName, arm, subjectIds, actor } = req.body;
  const fullName = arm.trim() ? `${baseName.trim()} ${arm.trim()}` : baseName.trim();
  try {
    await pool.query(
      `INSERT INTO classes (id, name, base_name, arm, subjects) VALUES ($1, $2, $3, $4, $5)`,
      [classId, fullName, baseName.trim(), arm.trim(), JSON.stringify(subjectIds)]
    );

    // Audit Log
    const newLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      action: 'Created Class',
      user: actor,
      timestamp: new Date().toISOString(),
      details: `Added class ${fullName} (${classId}) to curriculum.`
    };
    await pool.query(
      'INSERT INTO audit_logs (id, action, username, timestamp, details) VALUES ($1, $2, $3, $4, $5)',
      [newLog.id, newLog.action, newLog.user, newLog.timestamp, newLog.details]
    );

    res.status(201).json({ id: classId, name: fullName, baseName, arm, subjects: subjectIds });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create class' });
  }
});

app.put('/api/classes/:id', async (req, res) => {
  const { id } = req.params;
  const { baseName, arm, actor } = req.body;
  const fullName = arm.trim() ? `${baseName.trim()} ${arm.trim()}` : baseName.trim();
  try {
    await pool.query(
      `UPDATE classes SET name = $1, base_name = $2, arm = $3 WHERE id = $4`,
      [fullName, baseName.trim(), arm.trim(), id]
    );

    // Audit Log
    const newLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      action: 'Updated Class',
      user: actor,
      timestamp: new Date().toISOString(),
      details: `Renamed class ID ${id} to ${fullName}.`
    };
    await pool.query(
      'INSERT INTO audit_logs (id, action, username, timestamp, details) VALUES ($1, $2, $3, $4, $5)',
      [newLog.id, newLog.action, newLog.user, newLog.timestamp, newLog.details]
    );

    res.json({ id, name: fullName, baseName, arm });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update class' });
  }
});

app.put('/api/classes/:id/subjects', async (req, res) => {
  const { id } = req.params;
  const { subjectIds, actor } = req.body;
  try {
    await pool.query(
      `UPDATE classes SET subjects = $1 WHERE id = $2`,
      [JSON.stringify(subjectIds), id]
    );

    // Audit Log
    const newLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      action: 'Allocated Class Subjects',
      user: actor,
      timestamp: new Date().toISOString(),
      details: `Updated subjects allocation for class ID ${id}.`
    };
    await pool.query(
      'INSERT INTO audit_logs (id, action, username, timestamp, details) VALUES ($1, $2, $3, $4, $5)',
      [newLog.id, newLog.action, newLog.user, newLog.timestamp, newLog.details]
    );

    res.json({ id, subjects: subjectIds });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update class subjects' });
  }
});

app.delete('/api/classes/:id', async (req, res) => {
  const { id } = req.params;
  const { actor } = req.query;
  try {
    await pool.query('DELETE FROM classes WHERE id = $1', [id]);

    const newLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      action: 'Removed Class',
      user: actor || 'Admin',
      timestamp: new Date().toISOString(),
      details: `Deleted class ID ${id} from curriculum.`
    };
    await pool.query(
      'INSERT INTO audit_logs (id, action, username, timestamp, details) VALUES ($1, $2, $3, $4, $5)',
      [newLog.id, newLog.action, newLog.user, newLog.timestamp, newLog.details]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete class' });
  }
});

// Results API
app.post('/api/results', async (req, res) => {
  const { resultData, actor } = req.body;
  const { studentId, classId, term, session } = resultData;

  try {
    // Check if result already exists for this student/class/term/session
    const checkRes = await pool.query(
      'SELECT id FROM results WHERE student_id = $1 AND class_id = $2 AND term = $3 AND session = $4',
      [studentId, classId, term, session]
    );

    let id = checkRes.rows[0]?.id;
    let actionType = 'Created Result';
    let detailsStr = `Teacher submitted scores for student ID ${studentId} in class ${classId} (Published).`;

    if (id) {
      actionType = 'Updated Result';
      detailsStr = `Teacher updated score entries for student ID ${studentId} in class ${classId} (Published).`;
      await pool.query(
        `UPDATE results SET scores = $1, traits = $2, psychomotor = $3, remarks = $4, status = $5
         WHERE id = $6`,
        [
          JSON.stringify(resultData.scores),
          JSON.stringify(resultData.traits),
          JSON.stringify(resultData.psychomotor),
          JSON.stringify(resultData.remarks || {}),
          'published',
          id
        ]
      );
    } else {
      id = resultData.id || 'res_' + Date.now();
      await pool.query(
        `INSERT INTO results (id, student_id, class_id, term, session, status, scores, traits, psychomotor, remarks)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          id,
          studentId,
          classId,
          term,
          session,
          'published',
          JSON.stringify(resultData.scores),
          JSON.stringify(resultData.traits),
          JSON.stringify(resultData.psychomotor),
          JSON.stringify(resultData.remarks || {})
        ]
      );
    }

    // Audit Log
    const newLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      action: actionType,
      user: actor,
      timestamp: new Date().toISOString(),
      details: detailsStr
    };
    await pool.query(
      'INSERT INTO audit_logs (id, action, username, timestamp, details) VALUES ($1, $2, $3, $4, $5)',
      [newLog.id, newLog.action, newLog.user, newLog.timestamp, newLog.details]
    );

    res.json({ id, ...resultData, status: 'published' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save result' });
  }
});

app.post('/api/results/publish', async (req, res) => {
  const { resultId, actor } = req.body;
  try {
    const resRow = await pool.query('SELECT * FROM results WHERE id = $1', [resultId]);
    const r = resRow.rows[0];
    if (r) {
      await pool.query("UPDATE results SET status = 'published' WHERE id = $1", [resultId]);
      
      const newLog = {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        action: 'Published Result',
        user: actor,
        timestamp: new Date().toISOString(),
        details: `Approved and published result for student ID ${r.student_id} in class ${r.class_id}.`
      };
      await pool.query(
        'INSERT INTO audit_logs (id, action, username, timestamp, details) VALUES ($1, $2, $3, $4, $5)',
        [newLog.id, newLog.action, newLog.user, newLog.timestamp, newLog.details]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to publish result' });
  }
});

app.post('/api/results/unpublish', async (req, res) => {
  const { resultId, actor } = req.body;
  try {
    const resRow = await pool.query('SELECT * FROM results WHERE id = $1', [resultId]);
    const r = resRow.rows[0];
    if (r) {
      await pool.query("UPDATE results SET status = 'draft' WHERE id = $1", [resultId]);
      
      const newLog = {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        action: 'Unpublished Result',
        user: actor,
        timestamp: new Date().toISOString(),
        details: `Withdrew result for student ID ${r.student_id} in class ${r.class_id} back to draft.`
      };
      await pool.query(
        'INSERT INTO audit_logs (id, action, username, timestamp, details) VALUES ($1, $2, $3, $4, $5)',
        [newLog.id, newLog.action, newLog.user, newLog.timestamp, newLog.details]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to unpublish result' });
  }
});

app.post('/api/results/publish-class', async (req, res) => {
  const { classId, term, session, actor } = req.body;
  try {
    await pool.query(
      "UPDATE results SET status = 'published' WHERE class_id = $1 AND term = $2 AND session = $3 AND status = 'draft'",
      [classId, term, session]
    );

    const newLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      action: 'Bulk Published Results',
      user: actor,
      timestamp: new Date().toISOString(),
      details: `Approved and published all draft results for class ${classId} (${term}, ${session}).`
    };
    await pool.query(
      'INSERT INTO audit_logs (id, action, username, timestamp, details) VALUES ($1, $2, $3, $4, $5)',
      [newLog.id, newLog.action, newLog.user, newLog.timestamp, newLog.details]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to bulk publish results' });
  }
});

app.post('/api/results/unpublish-class', async (req, res) => {
  const { classId, term, session, actor } = req.body;
  try {
    await pool.query(
      "UPDATE results SET status = 'draft' WHERE class_id = $1 AND term = $2 AND session = $3 AND status = 'published'",
      [classId, term, session]
    );

    const newLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      action: 'Bulk Unpublished Results',
      user: actor,
      timestamp: new Date().toISOString(),
      details: `Withdrew all results for class ${classId} (${term}, ${session}) back to draft.`
    };
    await pool.query(
      'INSERT INTO audit_logs (id, action, username, timestamp, details) VALUES ($1, $2, $3, $4, $5)',
      [newLog.id, newLog.action, newLog.user, newLog.timestamp, newLog.details]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to bulk unpublish results' });
  }
});

app.post('/api/results/remark', async (req, res) => {
  const { resultId, remark, actor } = req.body;
  try {
    const resultRes = await pool.query('SELECT * FROM results WHERE id = $1', [resultId]);
    const r = resultRes.rows[0];
    if (r) {
      const currentRemarks = r.remarks || {};
      const updatedRemarks = {
        ...currentRemarks,
        principal: remark,
        principalName: 'Dr. Joseph Alao',
        principalSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="50" viewBox="0 0 150 50"><path d="M15,25 C30,5 45,45 60,25 S85,5 110,25 S135,15 145,35" fill="none" stroke="%23064e3b" stroke-width="2.5" stroke-linecap="round"/><text x="15" y="45" font-family="cursive" font-size="11" fill="%23064e3b">Dr. Joseph Alao</text></svg>',
        principalDate: new Date().toISOString().split('T')[0]
      };

      await pool.query('UPDATE results SET remarks = $1 WHERE id = $2', [JSON.stringify(updatedRemarks), resultId]);

      const newLog = {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        action: 'Added Principal Remark',
        user: actor,
        timestamp: new Date().toISOString(),
        details: `Saved principal's remark for result ID ${resultId}.`
      };
      await pool.query(
        'INSERT INTO audit_logs (id, action, username, timestamp, details) VALUES ($1, $2, $3, $4, $5)',
        [newLog.id, newLog.action, newLog.user, newLog.timestamp, newLog.details]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add principal remark' });
  }
});

app.post('/api/results/bulk-remarks', async (req, res) => {
  const { classId, term, session, bands, actor } = req.body;

  try {
    // 1. Get results for class/term/session
    const resultsRes = await pool.query(
      'SELECT * FROM results WHERE class_id = $1 AND term = $2 AND session = $3',
      [classId, term, session]
    );

    if (resultsRes.rows.length === 0) {
      return res.json({ success: true });
    }

    // 2. Calculate rankings
    const scoredResults = resultsRes.rows.map(res => {
      const scores = res.scores || {};
      const subjectScores = Object.values(scores);
      const totalScore = subjectScores.reduce((acc, curr) => acc + (curr.total || 0), 0);
      const avg = subjectScores.length > 0 ? (totalScore / subjectScores.length) : 0;
      return {
        id: res.id,
        studentId: res.student_id,
        totalScore,
        avg
      };
    });

    scoredResults.sort((a, b) => b.totalScore - a.totalScore);

    const rankings = {};
    let currentRank = 1;
    scoredResults.forEach((item, idx) => {
      if (idx > 0 && item.totalScore < scoredResults[idx - 1].totalScore) {
        currentRank = idx + 1;
      }
      rankings[item.id] = {
        rank: currentRank,
        totalScore: item.totalScore,
        average: parseFloat(item.avg.toFixed(1))
      };
    });

    // 3. Apply remarks in database
    for (const r of resultsRes.rows) {
      const stats = rankings[r.id];
      if (!stats) continue;

      const avg = stats.average;
      const matchingBand = bands.find(b => avg >= b.min && avg <= b.max);
      const remark = matchingBand ? matchingBand.remark : 'Good effort, keep striving for excellence.';

      const currentRemarks = r.remarks || {};
      const updatedRemarks = {
        ...currentRemarks,
        principal: remark,
        principalName: 'Dr. Joseph Alao',
        principalSignature: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="150" height="50" viewBox="0 0 150 50"><path d="M15,25 C30,5 45,45 60,25 S85,5 110,25 S135,15 145,35" fill="none" stroke="%23064e3b" stroke-width="2.5" stroke-linecap="round"/><text x="15" y="45" font-family="cursive" font-size="11" fill="%23064e3b">Dr. Joseph Alao</text></svg>',
        principalDate: new Date().toISOString().split('T')[0]
      };

      await pool.query('UPDATE results SET remarks = $1 WHERE id = $2', [JSON.stringify(updatedRemarks), r.id]);
    }

    const newLog = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      action: 'Applied Bulk Principal Remarks',
      user: actor,
      timestamp: new Date().toISOString(),
      details: `Assigned principal comments in bulk by average score bands for class ${classId}.`
    };
    await pool.query(
      'INSERT INTO audit_logs (id, action, username, timestamp, details) VALUES ($1, $2, $3, $4, $5)',
      [newLog.id, newLog.action, newLog.user, newLog.timestamp, newLog.details]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to apply bulk remarks' });
  }
});

// Import API (clears existing data and replaces with imported JSON payload)
app.post('/api/import', async (req, res) => {
  const data = req.body;
  try {
    await pool.query('BEGIN');
    // Truncate tables
    await pool.query('TRUNCATE TABLE settings, classes, subjects, teachers, students, results, audit_logs');
    
    // Insert settings
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
    await pool.query(
      `INSERT INTO settings (id, school_name, school_subtitle, school_logo, school_motto, school_address, report_card_font, report_card_header_font, report_card_header_font_size, admin_name, admin_email, admin_password, admin_avatar, current_session, current_term, allow_student_reg, maintenance_mode, grading_scale) VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [
        data.schoolName || 'Higgsfield Academy',
        data.schoolSubtitle || 'Standalone Academic Results Checker Portal',
        data.schoolLogo || '/logo.png',
        data.schoolMotto || 'Knowledge and Integrity',
        data.schoolAddress || '',
        data.reportCardFont || 'inter',
        data.reportCardHeaderFont || 'cinzel',
        data.reportCardHeaderFontSize || '2rem',
        data.adminName || 'Dr. Joseph Alao',
        data.adminEmail || 'admin@higgsfield.edu',
        data.adminPassword || 'admin123',
        data.adminAvatar || '',
        data.currentSession || '2025/2026',
        data.currentTerm || '3rd Term',
        data.allowStudentReg !== false,
        data.maintenanceMode === true,
        JSON.stringify(data.gradingScale || defaultGradingScale)
      ]
    );

    // Insert classes
    if (data.classes) {
      for (const c of data.classes) {
        await pool.query(
          `INSERT INTO classes (id, name, base_name, arm, subjects) VALUES ($1, $2, $3, $4, $5)`,
          [c.id, c.name, c.baseName, c.arm, JSON.stringify(c.subjects)]
        );
      }
    }

    // Insert subjects
    if (data.subjects) {
      for (const key of Object.keys(data.subjects)) {
        const s = data.subjects[key];
        await pool.query(
          `INSERT INTO subjects (id, name, default_teacher) VALUES ($1, $2, $3)`,
          [s.id, s.name, s.defaultTeacher]
        );
      }
    }

    // Insert teachers
    if (data.teachers) {
      for (const t of data.teachers) {
        await pool.query(
          `INSERT INTO teachers (id, name, email, password, assigned_class, subjects, photo) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [t.id, t.name, t.email, t.password || 'password123', t.assignedClass, JSON.stringify(t.subjects), t.photo]
        );
      }
    }

    // Insert students
    if (data.students) {
      for (const s of data.students) {
        await pool.query(
          `INSERT INTO students (id, name, class_id, roll_no, dob, father_name, mother_name, parent_contact, photo, active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [s.id, s.name, s.classId, s.rollNo, s.dob, s.fatherName, s.motherName, s.parentContact || '', s.photo, s.active !== false]
        );
      }
    }

    // Insert results
    if (data.results) {
      for (const r of data.results) {
        await pool.query(
          `INSERT INTO results (id, student_id, class_id, term, session, status, scores, traits, psychomotor, remarks) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            r.id,
            r.studentId,
            r.classId,
            r.term,
            r.session,
            r.status,
            JSON.stringify(r.scores),
            JSON.stringify(r.traits),
            JSON.stringify(r.psychomotor),
            JSON.stringify(r.remarks)
          ]
        );
      }
    }

    // Insert audit logs
    if (data.auditLogs) {
      for (const r of data.auditLogs) {
        await pool.query(
          'INSERT INTO audit_logs (id, action, username, timestamp, details) VALUES ($1, $2, $3, $4, $5)',
          [r.id, r.action, r.user, r.timestamp, r.details]
        );
      }
    }

    await pool.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Failed to import database' });
  }
});

// Serve frontend assets in production
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start Server
async function start() {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (e) {
    console.error('Fatal: Server failed to start due to database error:', e);
    process.exit(1);
  }
}

start();
