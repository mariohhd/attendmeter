// Attendance management system for browser
import type { Course, AppData, NewSession, ClassSession } from '../types/attendance'
import { 
  calculateAttendanceStats, 
  generateSessionId, 
  generateCourseId 
} from '../utils/attendance'

const STORAGE_KEY = 'attendmeter_data'

export class AttendanceManager {
  private data: AppData

  constructor() {
    this.data = this.loadData()
  }

  /**
   * Load data from localStorage
   */
  private loadData(): AppData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        // Convert date strings back to Date objects
        parsed.courses.forEach((course: Course) => {
          course.sessions.forEach((session: ClassSession) => {
            session.date = new Date(session.date)
          })
        })
        parsed.lastUpdated = new Date(parsed.lastUpdated)
        return parsed
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error)
    }

    // Return default data if nothing in storage or error
    return {
      courses: [],
      lastUpdated: new Date()
    }
  }

  /**
   * Save data to localStorage
   */
  private saveData(): void {
    try {
      this.data.lastUpdated = new Date()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
      
      // Dispatch custom event for UI updates
      window.dispatchEvent(new CustomEvent('attendanceDataChanged', {
        detail: this.data
      }))
    } catch (error) {
      console.error('Error saving data to localStorage:', error)
    }
  }

  /**
   * Get all courses
   */
  getCourses(): Course[] {
    return this.data.courses
  }

  /**
   * Get a specific course by ID
   */
  getCourse(courseId: string): Course | undefined {
    return this.data.courses.find(course => course.id === courseId)
  }

  /**
   * Add a new course
   */
  addCourse(name: string, color: string = '#6366f1', target?: number): Course {
    const course: Course = {
      id: generateCourseId(),
      name,
      color,
      totalSessions: 0,
      sessions: [],
      target
    }

    this.data.courses.push(course)
    this.saveData()
    return course
  }

  /**
   * Update course details
   */
  updateCourse(courseId: string, updates: Partial<Course>): boolean {
    const courseIndex = this.data.courses.findIndex(course => course.id === courseId)
    if (courseIndex === -1) return false

    this.data.courses[courseIndex] = {
      ...this.data.courses[courseIndex],
      ...updates
    }
    this.saveData()
    return true
  }

  /**
   * Delete a course
   */
  deleteCourse(courseId: string): boolean {
    const courseIndex = this.data.courses.findIndex(course => course.id === courseId)
    if (courseIndex === -1) return false

    this.data.courses.splice(courseIndex, 1)
    this.saveData()
    return true
  }

  /**
   * Add a session to a course
   */
  addSession(courseId: string, sessionData: NewSession): boolean {
    const course = this.getCourse(courseId)
    if (!course) return false

    const session: ClassSession = {
      id: generateSessionId(),
      ...sessionData
    }

    course.sessions.push(session)
    course.totalSessions = course.sessions.length
    this.saveData()
    return true
  }

  /**
   * Update session attendance
   */
  updateSessionAttendance(courseId: string, sessionId: string, attended: boolean): boolean {
    const course = this.getCourse(courseId)
    if (!course) return false

    const session = course.sessions.find(s => s.id === sessionId)
    if (!session) return false

    session.attended = attended
    this.saveData()
    return true
  }

  /**
   * Delete a session
   */
  deleteSession(courseId: string, sessionId: string): boolean {
    const course = this.getCourse(courseId)
    if (!course) return false

    const sessionIndex = course.sessions.findIndex(s => s.id === sessionId)
    if (sessionIndex === -1) return false

    course.sessions.splice(sessionIndex, 1)
    course.totalSessions = course.sessions.length
    this.saveData()
    return true
  }

  /**
   * Get attendance statistics for a course
   */
  getCourseStats(courseId: string) {
    const course = this.getCourse(courseId)
    if (!course) return null

    return calculateAttendanceStats(course)
  }

  /**
   * Get overall statistics across all courses
   */
  getOverallStats() {
    const totalCourses = this.data.courses.length
    const totalSessions = this.data.courses.reduce((sum, course) => sum + course.sessions.length, 0)
    const totalAttended = this.data.courses.reduce((sum, course) => 
      sum + course.sessions.filter(s => s.attended).length, 0
    )
    const overallPercentage = totalSessions > 0 ? Math.round((totalAttended / totalSessions) * 100) : 0

    return {
      totalCourses,
      totalSessions,
      totalAttended,
      overallPercentage,
      totalMissed: totalSessions - totalAttended
    }
  }

  /**
   * Export data for backup
   */
  exportData(): string {
    return JSON.stringify(this.data, null, 2)
  }

  /**
   * Import data from backup
   */
  importData(jsonData: string): boolean {
    try {
      const imported = JSON.parse(jsonData)
      // Validate structure
      if (!imported.courses || !Array.isArray(imported.courses)) {
        throw new Error('Invalid data structure')
      }

      // Convert dates
      imported.courses.forEach((course: Course) => {
        course.sessions.forEach((session: ClassSession) => {
          session.date = new Date(session.date)
        })
      })

      this.data = imported
      this.saveData()
      return true
    } catch (error) {
      console.error('Error importing data:', error)
      return false
    }
  }

  /**
   * Clear all data
   */
  clearAllData(): void {
    this.data = {
      courses: [],
      lastUpdated: new Date()
    }
    this.saveData()
  }
}

// Create global instance
export const attendanceManager = new AttendanceManager()