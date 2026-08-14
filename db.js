import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import {
  initialClasses,
  initialSubjects,
  initialStudents,
  initialResults,
  initialTeachers
} from './src/mockData.js';

dotenv.config();

const { Pool } = pg;

let poolInstance;
let isJsonFallback = false;

if (process.env.DATABASE_URL) {
  poolInstance = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && (process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1'))
      ? false
      : { rejectUnauthorized: false }
  });
} else {
  isJsonFallback = true;
}

class PoolWrapper {
  async query(sql, params = []) {
    if (isJsonFallback) {
      return await mockPool.query(sql, params);
    } else {
      return await poolInstance.query(sql, params);
    }
  }
}

const poolWrapper = new PoolWrapper();

class JsonPool {
  constructor() {
    this.dbPath = path.resolve('db.json');
    this.data = null;
    this.inTransaction = false;
  }

  load() {
    if (this.data) return;
    if (fs.existsSync(this.dbPath)) {
      try {
        const raw = fs.readFileSync(this.dbPath, 'utf8');
        this.data = JSON.parse(raw);
      } catch (e) {
        console.error('Error reading JSON DB, initializing empty:', e);
        this.data = {};
      }
    } else {
      this.data = {};
    }

    const tables = ['settings', 'classes', 'subjects', 'teachers', 'students', 'results', 'audit_logs', 'lockouts'];
    tables.forEach(t => {
      if (!this.data[t]) this.data[t] = [];
    });
  }

  save() {
    if (this.inTransaction) return;
    try {
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('Error writing to JSON DB:', e);
    }
  }

  async init() {
    this.load();
    
    // Seed default data if empty
    if (!this.data.settings || this.data.settings.length === 0) {
      console.log('Seeding local settings table...');
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
      this.data.settings = [{
        id: 1,
        school_name: 'Higgsfield Academy',
        school_subtitle: 'Standalone Academic Results Checker Portal',
        school_logo: '/logo.png',
        school_motto: 'Knowledge and Integrity',
        school_address: 'Km 12, Lagos-Ibadan Expressway, Lagos, Nigeria | Est. 2012',
        report_card_font: 'inter',
        report_card_header_font: 'cinzel',
        report_card_header_font_size: '2rem',
        admin_name: 'Dr. Joseph Alao',
        admin_email: 'admin@higgsfield.edu',
        admin_password: 'admin123',
        admin_avatar: defaultAvatar,
        current_session: '2025/2026',
        current_term: '3rd Term',
        allow_student_reg: true,
        maintenance_mode: false,
        grading_scale: defaultGradingScale
      }];
    }

    if (!this.data.classes || this.data.classes.length === 0) {
      console.log('Seeding local classes table...');
      this.data.classes = initialClasses.map(c => ({
        id: c.id,
        name: c.name,
        base_name: c.baseName,
        arm: c.arm,
        subjects: c.subjects
      }));
    }

    if (!this.data.subjects || this.data.subjects.length === 0) {
      console.log('Seeding local subjects table...');
      this.data.subjects = Object.keys(initialSubjects).map(key => ({
        id: initialSubjects[key].id,
        name: initialSubjects[key].name,
        default_teacher: initialSubjects[key].defaultTeacher
      }));
    }

    if (!this.data.teachers || this.data.teachers.length === 0) {
      console.log('Seeding local teachers table...');
      this.data.teachers = initialTeachers.map(t => ({
        id: t.id,
        name: t.name,
        email: t.email,
        password: t.password || 'password123',
        assigned_class: t.assignedClass,
        subjects: t.subjects,
        photo: t.photo
      }));
    }

    if (!this.data.students || this.data.students.length === 0) {
      console.log('Seeding local students table...');
      this.data.students = initialStudents.map(s => ({
        id: s.id,
        name: s.name,
        class_id: s.classId,
        roll_no: s.rollNo,
        dob: s.dob,
        father_name: s.fatherName,
        mother_name: s.motherName,
        parent_contact: s.parentContact || '',
        photo: s.photo,
        active: s.active
      }));
    }

    if (!this.data.results || this.data.results.length === 0) {
      console.log('Seeding local results table...');
      this.data.results = initialResults.map(r => ({
        id: r.id,
        student_id: r.studentId,
        class_id: r.classId,
        term: r.term,
        session: r.session,
        status: r.status,
        scores: r.scores,
        traits: r.traits,
        psychomotor: r.psychomotor,
        remarks: r.remarks
      }));
    }

    this.save();
    console.log('Local JSON database verified and seeded successfully.');
  }

  async query(sql, params = []) {
    this.load();
    const queryStr = sql.trim().replace(/\s+/g, ' ');
    const uppercaseQuery = queryStr.toUpperCase();

    // Transactions
    if (uppercaseQuery === 'BEGIN') {
      this.inTransaction = true;
      return { rows: [] };
    }
    if (uppercaseQuery === 'COMMIT') {
      this.inTransaction = false;
      this.save();
      return { rows: [] };
    }
    if (uppercaseQuery === 'ROLLBACK') {
      this.inTransaction = false;
      this.data = null;
      this.load();
      return { rows: [] };
    }

    // Create Table (noop)
    if (uppercaseQuery.startsWith('CREATE TABLE')) {
      return { rows: [] };
    }

    // Truncate
    if (uppercaseQuery.startsWith('TRUNCATE')) {
      const tables = ['settings', 'classes', 'subjects', 'teachers', 'students', 'results', 'audit_logs', 'lockouts'];
      tables.forEach(t => {
        this.data[t] = [];
      });
      this.save();
      return { rows: [] };
    }

    // Select Count
    const countMatch = queryStr.match(/SELECT\s+COUNT\(\*\)\s+FROM\s+(\w+)/i);
    if (countMatch) {
      const tableName = countMatch[1].toLowerCase();
      const count = this.data[tableName] ? this.data[tableName].length : 0;
      return { rows: [{ count: String(count) }] };
    }

    // SELECT queries
    if (uppercaseQuery.startsWith('SELECT')) {
      if (/FROM\s+settings/i.test(queryStr)) {
        return { rows: this.data.settings || [] };
      }
      if (/FROM\s+classes/i.test(queryStr)) {
        return { rows: this.data.classes || [] };
      }
      if (/FROM\s+subjects/i.test(queryStr)) {
        if (/id\s*=\s*\$1/i.test(queryStr)) {
          const found = this.data.subjects.filter(s => s.id === params[0]);
          return { rows: found };
        }
        return { rows: this.data.subjects || [] };
      }
      if (/FROM\s+teachers/i.test(queryStr)) {
        if (/LOWER\(email\)\s*=\s*LOWER\(\$1\)/i.test(queryStr)) {
          const found = this.data.teachers.filter(t => t.email && t.email.toLowerCase() === params[0].toLowerCase());
          return { rows: found };
        }
        if (/id\s*=\s*\$1/i.test(queryStr)) {
          const found = this.data.teachers.filter(t => t.id === params[0]);
          return { rows: found };
        }
        return { rows: this.data.teachers || [] };
      }
      if (/FROM\s+students/i.test(queryStr)) {
        if (/LOWER\(name\)\s*=\s*LOWER\(\$1\)\s+AND\s+roll_no\s*=\s*\$2/i.test(queryStr)) {
          const found = this.data.students.filter(s => s.name && s.name.toLowerCase() === params[0].toLowerCase() && s.roll_no === params[1]);
          return { rows: found };
        }
        if (/id\s*=\s*\$1/i.test(queryStr)) {
          const found = this.data.students.filter(s => s.id === params[0]);
          return { rows: found };
        }
        return { rows: this.data.students || [] };
      }
      if (/FROM\s+results/i.test(queryStr)) {
        if (/student_id\s*=\s*\$1/i.test(queryStr)) {
          const found = this.data.results.filter(r => r.student_id === params[0]);
          return { rows: found };
        }
        return { rows: this.data.results || [] };
      }
      if (/FROM\s+audit_logs/i.test(queryStr)) {
        const sorted = [...(this.data.audit_logs || [])].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        return { rows: sorted };
      }
      if (/FROM\s+lockouts/i.test(queryStr)) {
        if (/ip\s*=\s*\$1/i.test(queryStr)) {
          const found = this.data.lockouts.filter(l => l.ip === params[0]);
          return { rows: found };
        }
        return { rows: this.data.lockouts || [] };
      }
    }

    // INSERT queries
    if (uppercaseQuery.startsWith('INSERT INTO')) {
      if (/INSERT\s+INTO\s+settings/i.test(queryStr)) {
        const settingsObj = {
          id: 1,
          school_name: params[0],
          school_subtitle: params[1],
          school_logo: params[2],
          school_motto: params[3],
          school_address: params[4],
          report_card_font: params[5],
          report_card_header_font: params[6],
          report_card_header_font_size: params[7],
          admin_name: params[8],
          admin_email: params[9],
          admin_password: params[10],
          admin_avatar: params[11],
          current_session: params[12],
          current_term: params[13],
          allow_student_reg: params[14],
          maintenance_mode: params[15],
          grading_scale: typeof params[16] === 'string' ? JSON.parse(params[16]) : params[16]
        };
        this.data.settings = [settingsObj];
        this.save();
        return { rows: [settingsObj] };
      }
      if (/INSERT\s+INTO\s+classes/i.test(queryStr)) {
        const obj = {
          id: params[0],
          name: params[1],
          base_name: params[2],
          arm: params[3],
          subjects: typeof params[4] === 'string' ? JSON.parse(params[4]) : params[4]
        };
        this.data.classes = (this.data.classes || []).filter(c => c.id !== obj.id);
        this.data.classes.push(obj);
        this.save();
        return { rows: [obj] };
      }
      if (/INSERT\s+INTO\s+subjects/i.test(queryStr)) {
        const obj = {
          id: params[0],
          name: params[1],
          default_teacher: params[2]
        };
        this.data.subjects = (this.data.subjects || []).filter(s => s.id !== obj.id);
        this.data.subjects.push(obj);
        this.save();
        return { rows: [obj] };
      }
      if (/INSERT\s+INTO\s+teachers/i.test(queryStr)) {
        const obj = {
          id: params[0],
          name: params[1],
          email: params[2],
          password: params[3],
          assigned_class: params[4],
          subjects: typeof params[5] === 'string' ? JSON.parse(params[5]) : params[5],
          photo: params[6]
        };
        this.data.teachers = (this.data.teachers || []).filter(t => t.id !== obj.id);
        this.data.teachers.push(obj);
        this.save();
        return { rows: [obj] };
      }
      if (/INSERT\s+INTO\s+students/i.test(queryStr)) {
        const obj = {
          id: params[0],
          name: params[1],
          class_id: params[2],
          roll_no: params[3],
          dob: params[4],
          father_name: params[5],
          mother_name: params[6],
          parent_contact: params[7],
          photo: params[8],
          active: params[9]
        };
        this.data.students = (this.data.students || []).filter(s => s.id !== obj.id);
        this.data.students.push(obj);
        this.save();
        return { rows: [obj] };
      }
      if (/INSERT\s+INTO\s+results/i.test(queryStr)) {
        const obj = {
          id: params[0],
          student_id: params[1],
          class_id: params[2],
          term: params[3],
          session: params[4],
          status: params[5],
          scores: typeof params[6] === 'string' ? JSON.parse(params[6]) : params[6],
          traits: typeof params[7] === 'string' ? JSON.parse(params[7]) : params[7],
          psychomotor: typeof params[8] === 'string' ? JSON.parse(params[8]) : params[8],
          remarks: typeof params[9] === 'string' ? JSON.parse(params[9]) : params[9]
        };
        this.data.results = (this.data.results || []).filter(r => r.id !== obj.id);
        this.data.results.push(obj);
        this.save();
        return { rows: [obj] };
      }
      if (/INSERT\s+INTO\s+audit_logs/i.test(queryStr)) {
        const obj = {
          id: params[0],
          action: params[1],
          username: params[2],
          timestamp: params[3],
          details: params[4]
        };
        this.data.audit_logs = (this.data.audit_logs || []).filter(l => l.id !== obj.id);
        this.data.audit_logs.push(obj);
        this.save();
        return { rows: [obj] };
      }
      if (/INSERT\s+INTO\s+lockouts/i.test(queryStr)) {
        const obj = {
          ip: params[0],
          failed_attempts: params[1],
          lockout_until: params[2]
        };
        const existing = (this.data.lockouts || []).find(l => l.ip === obj.ip);
        if (existing) {
          existing.failed_attempts = obj.failed_attempts;
          existing.lockout_until = obj.lockout_until;
        } else {
          if (!this.data.lockouts) this.data.lockouts = [];
          this.data.lockouts.push(obj);
        }
        this.save();
        return { rows: [obj] };
      }
    }

    // UPDATE queries
    if (uppercaseQuery.startsWith('UPDATE')) {
      if (/UPDATE\s+settings/i.test(queryStr)) {
        const settingsObj = {
          id: 1,
          school_name: params[0],
          school_subtitle: params[1],
          school_logo: params[2],
          school_motto: params[3],
          school_address: params[4],
          report_card_font: params[5],
          report_card_header_font: params[6],
          report_card_header_font_size: params[7],
          admin_name: params[8],
          admin_email: params[9],
          admin_password: params[10],
          admin_avatar: params[11],
          current_session: params[12],
          current_term: params[13],
          allow_student_reg: params[14],
          maintenance_mode: params[15],
          grading_scale: typeof params[16] === 'string' ? JSON.parse(params[16]) : params[16]
        };
        this.data.settings = [settingsObj];
        this.save();
        return { rows: [settingsObj] };
      }
      if (/UPDATE\s+students/i.test(queryStr)) {
        const idx = this.data.students.findIndex(s => s.id === params[9]);
        if (idx !== -1) {
          this.data.students[idx] = {
            ...this.data.students[idx],
            name: params[0],
            class_id: params[1],
            roll_no: params[2],
            dob: params[3],
            father_name: params[4],
            mother_name: params[5],
            parent_contact: params[6],
            photo: params[7],
            active: params[8]
          };
        }
        this.save();
        return { rows: idx !== -1 ? [this.data.students[idx]] : [] };
      }
      if (/UPDATE\s+teachers/i.test(queryStr)) {
        if (/SET\s+subjects\s*=\s*\$1/i.test(queryStr)) {
          const idx = this.data.teachers.findIndex(t => t.id === params[1]);
          if (idx !== -1) {
            this.data.teachers[idx].subjects = typeof params[0] === 'string' ? JSON.parse(params[0]) : params[0];
          }
          this.save();
          return { rows: idx !== -1 ? [this.data.teachers[idx]] : [] };
        } else {
          const idx = this.data.teachers.findIndex(t => t.id === params[6]);
          if (idx !== -1) {
            this.data.teachers[idx] = {
              ...this.data.teachers[idx],
              name: params[0],
              email: params[1],
              password: params[2],
              assigned_class: params[3],
              subjects: typeof params[4] === 'string' ? JSON.parse(params[4]) : params[4],
              photo: params[5]
            };
          }
          this.save();
          return { rows: idx !== -1 ? [this.data.teachers[idx]] : [] };
        }
      }
      if (/UPDATE\s+subjects/i.test(queryStr)) {
        const idx = this.data.subjects.findIndex(s => s.id === params[2]);
        if (idx !== -1) {
          this.data.subjects[idx] = {
            ...this.data.subjects[idx],
            name: params[0],
            default_teacher: params[1]
          };
        }
        this.save();
        return { rows: idx !== -1 ? [this.data.subjects[idx]] : [] };
      }
      if (/UPDATE\s+classes/i.test(queryStr)) {
        if (/SET\s+subjects\s*=\s*\$1/i.test(queryStr)) {
          const idx = this.data.classes.findIndex(c => c.id === params[1]);
          if (idx !== -1) {
            this.data.classes[idx].subjects = typeof params[0] === 'string' ? JSON.parse(params[0]) : params[0];
          }
          this.save();
          return { rows: idx !== -1 ? [this.data.classes[idx]] : [] };
        } else {
          const idx = this.data.classes.findIndex(c => c.id === params[2]);
          if (idx !== -1) {
            this.data.classes[idx] = {
              ...this.data.classes[idx],
              base_name: params[0],
              arm: params[1]
            };
          }
          this.save();
          return { rows: idx !== -1 ? [this.data.classes[idx]] : [] };
        }
      }
      if (/UPDATE\s+results/i.test(queryStr)) {
        if (/remarks\s*=\s*\$1/i.test(queryStr)) {
          const idx = this.data.results.findIndex(r => r.id === params[1]);
          if (idx !== -1) {
            this.data.results[idx].remarks = typeof params[0] === 'string' ? JSON.parse(params[0]) : params[0];
          }
          this.save();
          return { rows: idx !== -1 ? [this.data.results[idx]] : [] };
        }
        if (/status\s*=\s*'published'/i.test(queryStr)) {
          if (/class_id/i.test(queryStr)) {
            this.data.results.forEach(r => {
              if (r.class_id === params[0] && r.term === params[1] && r.session === params[2] && r.status === 'draft') {
                r.status = 'published';
              }
            });
            this.save();
            return { rows: [] };
          } else {
            const idx = this.data.results.findIndex(r => r.id === params[0]);
            if (idx !== -1) this.data.results[idx].status = 'published';
            this.save();
            return { rows: idx !== -1 ? [this.data.results[idx]] : [] };
          }
        }
        if (/status\s*=\s*'draft'/i.test(queryStr)) {
          if (/class_id/i.test(queryStr)) {
            this.data.results.forEach(r => {
              if (r.class_id === params[0] && r.term === params[1] && r.session === params[2] && r.status === 'published') {
                r.status = 'draft';
              }
            });
            this.save();
            return { rows: [] };
          } else {
            const idx = this.data.results.findIndex(r => r.id === params[0]);
            if (idx !== -1) this.data.results[idx].status = 'draft';
            this.save();
            return { rows: idx !== -1 ? [this.data.results[idx]] : [] };
          }
        }
      }
    }

    // DELETE queries
    if (uppercaseQuery.startsWith('DELETE')) {
      if (/DELETE\s+FROM\s+lockouts/i.test(queryStr)) {
        this.data.lockouts = (this.data.lockouts || []).filter(l => l.ip !== params[0]);
        this.save();
        return { rows: [] };
      }
      if (/DELETE\s+FROM\s+students/i.test(queryStr)) {
        this.data.students = (this.data.students || []).filter(s => s.id !== params[0]);
        this.save();
        return { rows: [] };
      }
      if (/DELETE\s+FROM\s+teachers/i.test(queryStr)) {
        this.data.teachers = (this.data.teachers || []).filter(t => t.id !== params[0]);
        this.save();
        return { rows: [] };
      }
      if (/DELETE\s+FROM\s+subjects/i.test(queryStr)) {
        this.data.subjects = (this.data.subjects || []).filter(s => s.id !== params[0]);
        this.save();
        return { rows: [] };
      }
      if (/DELETE\s+FROM\s+classes/i.test(queryStr)) {
        this.data.classes = (this.data.classes || []).filter(c => c.id !== params[0]);
        this.save();
        return { rows: [] };
      }
    }

    console.warn('Unhandled mock query:', sql, params);
    return { rows: [] };
  }
}

const mockPool = new JsonPool();

export async function initDb() {
  console.log('Connecting to PostgreSQL database and initializing tables...');
  try {
    if (isJsonFallback) {
      throw new Error('No DATABASE_URL configured');
    }
    await poolInstance.query('SELECT 1');
    console.log('PostgreSQL connection successful!');
  } catch (err) {
    console.warn('PostgreSQL connection failed. Falling back to local JSON database (db.json)...');
    console.warn('Error details:', err.message);
    isJsonFallback = true;
  }

  if (isJsonFallback) {
    await mockPool.init();
  } else {
    // 1. Create tables in PostgreSQL
    await poolInstance.query(`
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

    await poolInstance.query(`
      CREATE TABLE IF NOT EXISTS classes (
        id TEXT PRIMARY KEY,
        name TEXT,
        base_name TEXT,
        arm TEXT,
        subjects JSONB
      )
    `);

    await poolInstance.query(`
      CREATE TABLE IF NOT EXISTS subjects (
        id TEXT PRIMARY KEY,
        name TEXT,
        default_teacher TEXT
      )
    `);

    await poolInstance.query(`
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

    await poolInstance.query(`
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

    await poolInstance.query(`
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

    await poolInstance.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        action TEXT,
        username TEXT,
        timestamp TEXT,
        details TEXT
      )
    `);

    await poolInstance.query(`
      CREATE TABLE IF NOT EXISTS lockouts (
        ip TEXT PRIMARY KEY,
        failed_attempts INTEGER DEFAULT 0,
        lockout_until BIGINT DEFAULT 0
      )
    `);

    // 2. Seeding default data if tables are empty
    const settingsCount = await poolInstance.query('SELECT COUNT(*) FROM settings');
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
      await poolInstance.query(
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

    const classesCount = await poolInstance.query('SELECT COUNT(*) FROM classes');
    if (parseInt(classesCount.rows[0].count) === 0) {
      console.log('Seeding classes table...');
      for (const c of initialClasses) {
        await poolInstance.query(
          `INSERT INTO classes (id, name, base_name, arm, subjects) VALUES ($1, $2, $3, $4, $5)`,
          [c.id, c.name, c.baseName, c.arm, JSON.stringify(c.subjects)]
        );
      }
    }

    const subjectsCount = await poolInstance.query('SELECT COUNT(*) FROM subjects');
    if (parseInt(subjectsCount.rows[0].count) === 0) {
      console.log('Seeding subjects table...');
      for (const key of Object.keys(initialSubjects)) {
        const s = initialSubjects[key];
        await poolInstance.query(
          `INSERT INTO subjects (id, name, default_teacher) VALUES ($1, $2, $3)`,
          [s.id, s.name, s.defaultTeacher]
        );
      }
    }

    const teachersCount = await poolInstance.query('SELECT COUNT(*) FROM teachers');
    if (parseInt(teachersCount.rows[0].count) === 0) {
      console.log('Seeding teachers table...');
      for (const t of initialTeachers) {
        await poolInstance.query(
          `INSERT INTO teachers (id, name, email, password, assigned_class, subjects, photo) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [t.id, t.name, t.email, t.password || 'password123', t.assignedClass, JSON.stringify(t.subjects), t.photo]
        );
      }
    }

    const studentsCount = await poolInstance.query('SELECT COUNT(*) FROM students');
    if (parseInt(studentsCount.rows[0].count) === 0) {
      console.log('Seeding students table...');
      for (const s of initialStudents) {
        await poolInstance.query(
          `INSERT INTO students (id, name, class_id, roll_no, dob, father_name, mother_name, parent_contact, photo, active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [s.id, s.name, s.classId, s.rollNo, s.dob, s.fatherName, s.motherName, s.parentContact || '', s.photo, s.active]
        );
      }
    }

    const resultsCount = await poolInstance.query('SELECT COUNT(*) FROM results');
    if (parseInt(resultsCount.rows[0].count) === 0) {
      console.log('Seeding results table...');
      for (const r of initialResults) {
        await poolInstance.query(
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
}

export { poolWrapper as pool };
