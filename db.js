import pg from 'pg';
import dotenv from 'dotenv';
import {
  initialClasses,
  initialSubjects,
  initialStudents,
  initialResults,
  initialTeachers
} from './src/mockData.js';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1'))
    ? false
    : { rejectUnauthorized: false }
});

export async function initDb() {
  console.log('Connecting to PostgreSQL database and initializing tables...');
  
  // 1. Create tables
  await pool.query(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY DEFAULT 1,
      school_name TEXT,
      school_subtitle TEXT,
      school_logo TEXT,
      school_motto TEXT,
      school_address TEXT,
      report_card_font TEXT,
      report_card_header_font TEXT,
      report_card_header_font_size TEXT,
      admin_name TEXT,
      admin_email TEXT,
      admin_password TEXT,
      admin_avatar TEXT,
      current_session TEXT,
      current_term TEXT,
      allow_student_reg BOOLEAN,
      maintenance_mode BOOLEAN,
      grading_scale JSONB
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      name TEXT,
      base_name TEXT,
      arm TEXT,
      subjects JSONB
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT,
      default_teacher TEXT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      assigned_class TEXT,
      subjects JSONB,
      photo TEXT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS students (
      id TEXT PRIMARY KEY,
      name TEXT,
      class_id TEXT,
      roll_no INTEGER,
      dob TEXT,
      father_name TEXT,
      mother_name TEXT,
      parent_contact TEXT,
      photo TEXT,
      active BOOLEAN
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS results (
      id TEXT PRIMARY KEY,
      student_id TEXT,
      class_id TEXT,
      term TEXT,
      session TEXT,
      status TEXT,
      scores JSONB,
      traits JSONB,
      psychomotor JSONB,
      remarks JSONB
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      action TEXT,
      username TEXT,
      timestamp TEXT,
      details TEXT
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS lockouts (
      ip TEXT PRIMARY KEY,
      failed_attempts INTEGER DEFAULT 0,
      lockout_until BIGINT DEFAULT 0
    )
  `);

  // 2. Seeding default data if tables are empty
  const settingsCount = await pool.query('SELECT COUNT(*) FROM settings');
  if (parseInt(settingsCount.rows[0].count) === 0) {
    console.log('Seeding settings table...');
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
    const defaultAvatar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='%231e3a8a'/><circle cx='50' cy='40' r='20' fill='%23ffffff'/><path d='M20,85 C20,65 30,55 50,55 C70,55 80,65 80,85 Z' fill='%23ffffff'/></svg>";
    await pool.query(
      `INSERT INTO settings (id, school_name, school_subtitle, school_logo, school_motto, school_address, report_card_font, report_card_header_font, report_card_header_font_size, admin_name, admin_email, admin_password, admin_avatar, current_session, current_term, allow_student_reg, maintenance_mode, grading_scale) VALUES (1, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [
        'Higgsfield Academy',
        'Standalone Academic Results Checker Portal',
        '/logo.png',
        'Knowledge and Integrity',
        'Km 12, Lagos-Ibadan Expressway, Lagos, Nigeria | Est. 2012',
        'inter',
        'cinzel',
        '2rem',
        'Dr. Joseph Alao',
        'admin@higgsfield.edu',
        'admin123',
        defaultAvatar,
        '2025/2026',
        '3rd Term',
        true,
        false,
        JSON.stringify(defaultGradingScale)
      ]
    );
  }

  const classesCount = await pool.query('SELECT COUNT(*) FROM classes');
  if (parseInt(classesCount.rows[0].count) === 0) {
    console.log('Seeding classes table...');
    for (const c of initialClasses) {
      await pool.query(
        `INSERT INTO classes (id, name, base_name, arm, subjects) VALUES ($1, $2, $3, $4, $5)`,
        [c.id, c.name, c.baseName, c.arm, JSON.stringify(c.subjects)]
      );
    }
  }

  const subjectsCount = await pool.query('SELECT COUNT(*) FROM subjects');
  if (parseInt(subjectsCount.rows[0].count) === 0) {
    console.log('Seeding subjects table...');
    for (const key of Object.keys(initialSubjects)) {
      const s = initialSubjects[key];
      await pool.query(
        `INSERT INTO subjects (id, name, default_teacher) VALUES ($1, $2, $3)`,
        [s.id, s.name, s.defaultTeacher]
      );
    }
  }

  const teachersCount = await pool.query('SELECT COUNT(*) FROM teachers');
  if (parseInt(teachersCount.rows[0].count) === 0) {
    console.log('Seeding teachers table...');
    for (const t of initialTeachers) {
      await pool.query(
        `INSERT INTO teachers (id, name, email, password, assigned_class, subjects, photo) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [t.id, t.name, t.email, t.password || 'password123', t.assignedClass, JSON.stringify(t.subjects), t.photo]
      );
    }
  }

  const studentsCount = await pool.query('SELECT COUNT(*) FROM students');
  if (parseInt(studentsCount.rows[0].count) === 0) {
    console.log('Seeding students table...');
    for (const s of initialStudents) {
      await pool.query(
        `INSERT INTO students (id, name, class_id, roll_no, dob, father_name, mother_name, parent_contact, photo, active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [s.id, s.name, s.classId, s.rollNo, s.dob, s.fatherName, s.motherName, s.parentContact || '', s.photo, s.active]
      );
    }
  }

  const resultsCount = await pool.query('SELECT COUNT(*) FROM results');
  if (parseInt(resultsCount.rows[0].count) === 0) {
    console.log('Seeding results table...');
    for (const r of initialResults) {
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

  console.log('Database tables verified and seeded successfully.');
}

export { pool };
