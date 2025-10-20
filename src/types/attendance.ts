// Types for the Attendance Tracker App

export interface ClassSession {
  id: string
  date: Date
  attended: boolean
  notes?: string
}

// EOI-specific types
export interface EOIClassSession extends ClassSession {
  wasScheduled: boolean // Si la clase estaba programada para este día
  teacherAbsent?: boolean // Si el profesor faltó
  isHoliday?: boolean // Si es día festivo
  sessionType: 'regular'  | 'exam' | 'cancelled'
}

export interface AcademicCalendar {
  startDate: Date
  endDate: Date
  holidays: Date[]
  teacherAbsentDays: Date[]
  classDays: number[] // Array of weekdays (0=Sunday, 1=Monday, etc.)
}

export interface Course {
  id: string
  name: string
  color: string
  totalSessions: number
  sessions: ClassSession[]
  target?: number // target attendance percentage (optional)
}

// EOI-specific course type
export interface EOICourse extends Omit<Course, 'sessions'> {
  sessions: EOIClassSession[]
  academicCalendar: AcademicCalendar
  level: string // A1, A2, B1, B2, C1, C2
  language: string // English, French, German, etc.
  teacherEmail?: string
  classroom?: string
  schedule: {
    days: number[] // Days of the week (1=Monday, 3=Wednesday)
    startTime: string // "18:00"
    endTime: string // "20:00"
  }
}

export interface AttendanceStats {
  totalSessions: number
  attendedSessions: number
  attendancePercentage: number
  missedSessions: number
}

// Enhanced stats for EOI
export interface EOIAttendanceStats extends AttendanceStats {
  scheduledSessions: number // Total sessions that were actually scheduled
  cancelledSessions: number // Sessions cancelled due to holidays/teacher absence
  examSessions: number
  validAttendancePercentage: number // Percentage excluding cancelled sessions
  attendanceHistory: Array<{
    month: string
    percentage: number
    attendedCount: number
    scheduledCount: number
  }>
}

export interface AppData {
  courses: Course[]
  eoiCourses: EOICourse[]
  lastUpdated: Date
}

// Utility type for creating new sessions
export interface NewSession {
  date: Date
  attended: boolean
  notes?: string
}

export interface NewEOISession extends NewSession {
  sessionType: 'regular' | 'exam' | 'cancelled'
  teacherAbsent?: boolean
  isHoliday?: boolean
}

// Component props
export interface ThermometerProps {
  percentage: number
  label?: string
  height?: number
  color?: string
}

export interface CourseCardProps {
  course: Course
  stats: AttendanceStats
  onUpdateAttendance?: (courseId: string, sessionId: string, attended: boolean) => void
  onAddSession?: (courseId: string, session: NewSession) => void
}

export interface EOICourseCardProps {
  course: EOICourse
  stats: EOIAttendanceStats
  onUpdateAttendance?: (courseId: string, sessionId: string, attended: boolean) => void
  onMarkTeacherAbsent?: (courseId: string, sessionId: string, absent: boolean) => void
}