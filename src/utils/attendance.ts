import type { Course, AttendanceStats, ClassSession, EOICourse, EOIAttendanceStats } from '../types/attendance'
import { calculateEOIAttendanceStats } from './eoi-calendar'

/**
 * Calculate attendance statistics for a course
 */
export function calculateAttendanceStats(course: Course): AttendanceStats {
  // Solo contar sesiones impartidas hasta la fecha actual
  const now = new Date()
  const impartedSessions = course.sessions.filter(session => new Date(session.date) <= now)
  const totalImparted = impartedSessions.length
  const attendedImparted = impartedSessions.filter(session => session.attended).length
  const attendancePercentage = totalImparted > 0 ? Math.round((attendedImparted / totalImparted) * 100) : 0
  const missedSessions = totalImparted - attendedImparted

  return {
    totalSessions: totalImparted,
    attendedSessions: attendedImparted,
    attendancePercentage,
    missedSessions
  }
}

/**
 * Calculate attendance statistics for an EOI course (smart calculation)
 */
export function calculateEOIStats(course: EOICourse): EOIAttendanceStats {
  return calculateEOIAttendanceStats(course)
}

/**
 * Generate a unique ID for sessions
 */
export function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Generate a unique ID for courses
 */
export function generateCourseId(): string {
  return `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Get attendance status color based on percentage
 */
export function getAttendanceColor(percentage: number): string {
  if (percentage >= 90) return '#10b981' // green
  if (percentage >= 80) return '#f59e0b' // yellow
  if (percentage >= 65) return '#f97316' // orange
  return '#ef4444' // red
}

/**
 * Get attendance status color based on percentage for EOI (65% minimum)
 */
export function getEOIAttendanceColor(percentage: number): string {
  if (percentage >= 85) return '#10b981' // green - excellent
  if (percentage >= 75) return '#22c55e' // light green - good
  if (percentage >= 65) return '#f59e0b' // yellow - minimum required
  if (percentage >= 50) return '#f97316' // orange - warning
  return '#ef4444' // red - failing
}

/**
 * Get attendance status color based on percentage
 */
export function getAttendanceColorByCourse(percentage: number, course: string): string {
  if (percentage >= 90) return '#10b981' // green
  if (percentage >= 80) return '#f59e0b' // yellow
  if (percentage >= 70) return '#f97316' // orange
  return '#ef4444' // red
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(date)
}

/**
 * Format date for display (short version)
 */
export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    month: 'short',
    day: 'numeric'
  }).format(date)
}

/**
 * Sort sessions by date (newest first)
 */
export function sortSessionsByDate(sessions: ClassSession[]): ClassSession[] {
  return [...sessions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

/**
 * Get attendance status text in Spanish
 */
export function getAttendanceStatusText(percentage: number, isEOI: boolean = false): string {
  const threshold = isEOI ? 65 : 70
  
  if (percentage >= 90) return 'Excelente'
  if (percentage >= 80) return 'Muy buena'
  if (percentage >= threshold) return isEOI ? 'Cumple requisito' : 'Buena'
  if (percentage >= 50) return 'Insuficiente'
  return 'Crítica'
}

/**
 * Get day name in Spanish
 */
export function getDayNameInSpanish(dayNumber: number): string {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return days[dayNumber] || 'Desconocido'
}

/**
 * Get short day name in Spanish
 */
export function getShortDayNameInSpanish(dayNumber: number): string {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
  return days[dayNumber] || '?'
}