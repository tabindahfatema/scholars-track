export interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  class: string;
  joinDate: string;
  teacherId: string; // Add teacher association
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  teacherId: string; // Add teacher association
  date: string;
  status: 'present' | 'absent' | 'late';
  notes?: string;
}

const getUserId = (): string => {
  const user = localStorage.getItem('auth_user');
  if (user) {
    const userData = JSON.parse(user);
    return userData.id;
  }
  throw new Error('User not authenticated');
};

const STUDENTS_KEY = 'attendance_students';
const ATTENDANCE_KEY = 'attendance_records';

export const storageService = {
  // Student management
  getStudents(): Student[] {
    try {
      const userId = getUserId();
      const stored = localStorage.getItem(STUDENTS_KEY);
      const allStudents = stored ? JSON.parse(stored) : [];
      // Filter students for current user
      return allStudents.filter((student: Student) => student.teacherId === userId);
    } catch (error) {
      return [];
    }
  },

  saveStudents(students: Student[]): void {
    try {
      const userId = getUserId();
      const stored = localStorage.getItem(STUDENTS_KEY);
      const allStudents = stored ? JSON.parse(stored) : [];
      
      // Remove existing students for this user
      const otherUsersStudents = allStudents.filter((student: Student) => student.teacherId !== userId);
      
      // Add current user's students
      const updatedStudents = [...otherUsersStudents, ...students];
      
      localStorage.setItem(STUDENTS_KEY, JSON.stringify(updatedStudents));
    } catch (error) {
      console.error('Error saving students:', error);
    }
  },

  addStudent(student: Omit<Student, 'id' | 'teacherId'>): Student {
    try {
      const userId = getUserId();
      const students = this.getStudents();
      const newStudent: Student = {
        ...student,
        id: crypto.randomUUID(),
        teacherId: userId,
      };
      students.push(newStudent);
      this.saveStudents(students);
      return newStudent;
    } catch (error) {
      throw new Error('Failed to add student');
    }
  },

  updateStudent(id: string, updates: Partial<Student>): void {
    const students = this.getStudents();
    const index = students.findIndex(s => s.id === id);
    if (index !== -1) {
      students[index] = { ...students[index], ...updates };
      this.saveStudents(students);
    }
  },

  deleteStudent(id: string): void {
    const students = this.getStudents().filter(s => s.id !== id);
    this.saveStudents(students);
    // Also remove attendance records for this student
    const attendance = this.getAttendance().filter(a => a.studentId !== id);
    this.saveAttendance(attendance);
  },

  // Attendance management
  getAttendance(): AttendanceRecord[] {
    try {
      const userId = getUserId();
      const stored = localStorage.getItem(ATTENDANCE_KEY);
      const allAttendance = stored ? JSON.parse(stored) : [];
      // Filter attendance for current user
      return allAttendance.filter((record: AttendanceRecord) => record.teacherId === userId);
    } catch (error) {
      return [];
    }
  },

  saveAttendance(records: AttendanceRecord[]): void {
    try {
      const userId = getUserId();
      const stored = localStorage.getItem(ATTENDANCE_KEY);
      const allAttendance = stored ? JSON.parse(stored) : [];
      
      // Remove existing attendance for this user
      const otherUsersAttendance = allAttendance.filter((record: AttendanceRecord) => record.teacherId !== userId);
      
      // Add current user's attendance
      const updatedAttendance = [...otherUsersAttendance, ...records];
      
      localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(updatedAttendance));
    } catch (error) {
      console.error('Error saving attendance:', error);
    }
  },

  markAttendance(studentId: string, date: string, status: AttendanceRecord['status'], notes?: string): void {
    try {
      const userId = getUserId();
      const records = this.getAttendance();
      const existingIndex = records.findIndex(r => r.studentId === studentId && r.date === date);
      
      const record: AttendanceRecord = {
        id: existingIndex !== -1 ? records[existingIndex].id : crypto.randomUUID(),
        studentId,
        teacherId: userId,
        date,
        status,
        notes,
      };

      if (existingIndex !== -1) {
        records[existingIndex] = record;
      } else {
        records.push(record);
      }
      
      this.saveAttendance(records);
    } catch (error) {
      throw new Error('Failed to mark attendance');
    }
  },

  getAttendanceByDate(date: string): AttendanceRecord[] {
    return this.getAttendance().filter(r => r.date === date);
  },

  getAttendanceByStudent(studentId: string): AttendanceRecord[] {
    return this.getAttendance().filter(r => r.studentId === studentId);
  },

  getAttendanceStats() {
    const students = this.getStudents();
    const attendance = this.getAttendance();
    const today = new Date().toISOString().split('T')[0];
    
    const todayAttendance = attendance.filter(r => r.date === today);
    const present = todayAttendance.filter(r => r.status === 'present').length;
    const absent = todayAttendance.filter(r => r.status === 'absent').length;
    const late = todayAttendance.filter(r => r.status === 'late').length;
    
    return {
      totalStudents: students.length,
      present,
      absent,
      late,
      attendanceRate: students.length > 0 ? Math.round((present / students.length) * 100) : 0
    };
  }
};

// Initialize with sample data only for new users
export const initializeSampleData = () => {
  try {
    const userId = getUserId();
    const existingStudents = storageService.getStudents();
    
    if (existingStudents.length === 0) {
      const sampleStudents = [
        {
          name: "Alice Johnson",
          email: "alice.johnson@school.edu",
          studentId: "ST001",
          class: "10-A",
          joinDate: "2024-01-15"
        },
        {
          name: "Bob Smith",
          email: "bob.smith@school.edu", 
          studentId: "ST002",
          class: "10-A",
          joinDate: "2024-01-16"
        },
        {
          name: "Carol Davis",
          email: "carol.davis@school.edu",
          studentId: "ST003", 
          class: "10-B",
          joinDate: "2024-01-17"
        },
        {
          name: "David Wilson",
          email: "david.wilson@school.edu",
          studentId: "ST004",
          class: "10-A", 
          joinDate: "2024-01-18"
        }
      ];
      
      sampleStudents.forEach(student => storageService.addStudent(student));
    }
  } catch (error) {
    // User not authenticated, skip sample data
  }
};