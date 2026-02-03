import type { 
  EOICourse, 
  EOIClassSession, 
  EOIAttendanceStats, 
  AcademicCalendar, 
  NewEOISession 
} from '../types/attendance'

/**
 * Días festivos típicos en España (pueden configurarse por región)
 */
export const SPANISH_HOLIDAYS_2025_2026 = [
  // 2025
  new Date('2025-01-01'), // Año Nuevo
  new Date('2025-01-06'), // Reyes Magos
  new Date('2025-03-28'), // Jueves Santo
  new Date('2025-03-29'), // Viernes Santo
  new Date('2025-05-01'), // Día del Trabajador
  new Date('2025-08-15'), // Asunción de la Virgen
  new Date('2025-10-13'), // Día de la Hispanidad
  new Date('2025-11-03'), // Todos los Santos
  new Date('2025-12-06'), // Día de la Constitución
  new Date('2025-12-08'), // Inmaculada Concepción
  new Date('2025-12-22'), // Navidad
  new Date('2025-12-24'), // Navidad
  new Date('2025-12-25'), // Navidad
  new Date('2025-12-29'), // Navidad
  new Date('2025-12-31'), // Navidad
  
  // 2026
  new Date('2026-01-01'), // Año Nuevo
  new Date('2026-01-05'), // Reyes Magos
  new Date('2026-01-06'), // Reyes Magos
  new Date('2026-01-07'), // Reyes Magos
  new Date('2026-02-11'), // C1
  new Date('2026-02-09'), // C1
  new Date('2026-04-17'), // Jueves Santo
  new Date('2026-04-18'), // Viernes Santo
  new Date('2026-05-01'), // Día del Trabajador
  new Date('2026-08-15'), // Asunción de la Virgen
  new Date('2026-10-12'), // Día de la Hispanidad
  new Date('2026-11-01'), // Todos los Santos
  new Date('2026-12-06'), // Día de la Constitución
  new Date('2026-12-08'), // Inmaculada Concepción
  new Date('2026-12-25'), // Navidad
]

/**
 * Generar calendario académico automático basado en fechas de inicio/fin y días de clase
 */
export function generateAcademicCalendar(
  startDate: Date,
  endDate: Date,
  classDays: number[], // [1, 3] para lunes y miércoles
  holidays: Date[] = SPANISH_HOLIDAYS_2025_2026
): AcademicCalendar {
  return {
    startDate,
    endDate,
    holidays,
    teacherAbsentDays: [],
    classDays
  }
}

/**
 * Generar todas las sesiones programadas para un curso EOI
 */
export function generateScheduledSessions(
  calendar: AcademicCalendar,
  generateId: () => string
): EOIClassSession[] {
  const sessions: EOIClassSession[] = []
  const currentDate = new Date(calendar.startDate)
  
  while (currentDate <= calendar.endDate) {
    const dayOfWeek = currentDate.getDay()
    
    // Si es un día de clase programado
    if (calendar.classDays.includes(dayOfWeek)) {
      const dateStr = currentDate.toDateString()
      const isHoliday = calendar.holidays.some(holiday => holiday.toDateString() === dateStr)
      const isTeacherAbsent = calendar.teacherAbsentDays.some(absent => absent.toDateString() === dateStr)
      
      sessions.push({
        id: generateId(),
        date: new Date(currentDate),
        attended: false,
        wasScheduled: true,
        isHoliday,
        teacherAbsent: isTeacherAbsent,
        sessionType: isHoliday || isTeacherAbsent ? 'cancelled' : 'regular',
        notes: isHoliday ? 'Día festivo' : isTeacherAbsent ? 'Profesor ausente' : undefined
      })
    }
    
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  
  return sessions.sort((a, b) => a.date.getTime() - b.date.getTime())
}

/**
 * Calcular estadísticas de asistencia para EOI (excluyendo días no lectivos)
 */
export function calculateEOIAttendanceStats(course: EOICourse): EOIAttendanceStats {
  const now = new Date()
  const allSessions = course.sessions.filter(session => session.date <= now)

  // Sesiones que realmente cuentan para el porcentaje (excluir canceladas)
  const validSessions = allSessions.filter(session => 
    session.sessionType !== 'cancelled' && 
    !session.isHoliday && 
    !session.teacherAbsent
  )

  const attendedSessions = validSessions.filter(session => session.attended).length
  const cancelledSessions = allSessions.filter(session => 
    session.sessionType === 'cancelled' || 
    session.isHoliday || 
    session.teacherAbsent
  ).length

  const examSessions = allSessions.filter(session => session.sessionType === 'exam').length

  const totalSessions = allSessions.length
  const scheduledSessions = validSessions.length
  const missedSessions = scheduledSessions - attendedSessions

  // Porcentaje basado solo en sesiones válidas
  const validAttendancePercentage = scheduledSessions > 0 
    ? Math.round((attendedSessions / scheduledSessions) * 100) 
    : 0

  // Porcentaje tradicional (incluyendo todo)
  const attendancePercentage = totalSessions > 0 
    ? Math.round((attendedSessions / totalSessions) * 100) 
    : 0

  // Historial mensual
  const attendanceHistory = generateMonthlyHistory(validSessions)

  return {
    totalSessions,
    attendedSessions,
    attendancePercentage,
    missedSessions,
    scheduledSessions,
    cancelledSessions,
    examSessions,
    validAttendancePercentage,
    attendanceHistory
  }
}

/**
 * Generar historial de asistencia por meses
 */
function generateMonthlyHistory(sessions: EOIClassSession[]) {
  const monthlyData = new Map<string, { attended: number, total: number }>()
  
  sessions.forEach(session => {
    const monthKey = `${session.date.getFullYear()}-${session.date.getMonth() + 1}`
    const monthName = session.date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
    
    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, { attended: 0, total: 0 })
    }
    
    const data = monthlyData.get(monthKey)!
    data.total++
    if (session.attended) {
      data.attended++
    }
  })
  
  return Array.from(monthlyData.entries()).map(([key, data]) => {
    const [year, month] = key.split('-')
    const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('es-ES', { 
      month: 'long', 
      year: 'numeric' 
    })
    
    return {
      month: monthName,
      percentage: data.total > 0 ? Math.round((data.attended / data.total) * 100) : 0,
      attendedCount: data.attended,
      scheduledCount: data.total
    }
  })
}

/**
 * Marcar ausencia de profesor en una fecha específica
 */
export function markTeacherAbsent(
  course: EOICourse, 
  date: Date, 
  reason?: string
): EOICourse {
  const updatedCalendar = {
    ...course.academicCalendar,
    teacherAbsentDays: [...course.academicCalendar.teacherAbsentDays, date]
  }
  
  const updatedSessions = course.sessions.map(session => {
    if (session.date.toDateString() === date.toDateString()) {
      return {
        ...session,
        teacherAbsent: true,
        sessionType: 'cancelled' as const,
        notes: reason || 'Profesor ausente'
      }
    }
    return session
  })
  
  return {
    ...course,
    academicCalendar: updatedCalendar,
    sessions: updatedSessions
  }
}

/**
 * Obtener próximas clases programadas
 */
export function getUpcomingClasses(course: EOICourse, days: number = 7): EOIClassSession[] {
  const now = new Date()
  const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
  
  return course.sessions
    .filter(session => session.date >= now && session.date <= futureDate)
    .filter(session => session.sessionType !== 'cancelled')
    .sort((a, b) => a.date.getTime() - b.date.getTime())
}

/**
 * Verificar si se cumple el mínimo de asistencia requerido por EOI (normalmente 65%)
 */
export function meetsEOIAttendanceRequirement(stats: EOIAttendanceStats, requiredPercentage: number = 65): boolean {
  return stats.validAttendancePercentage >= requiredPercentage
}

/**
 * Calcular sesiones restantes para alcanzar el objetivo
 */
export function calculateSessionsNeededForTarget(
  stats: EOIAttendanceStats, 
  targetPercentage: number,
  remainingSessions: number
): { 
  needed: number, 
  achievable: boolean, 
  currentProjection: number 
} {
  const { attendedSessions, scheduledSessions } = stats
  const totalFutureSessions = scheduledSessions + remainingSessions
  
  // Sesiones necesarias para alcanzar el objetivo
  const sessionsNeededForTarget = Math.ceil((targetPercentage / 100) * totalFutureSessions)
  const sessionsStillNeeded = Math.max(0, sessionsNeededForTarget - attendedSessions)
  
  // ¿Es alcanzable asistiendo a todas las sesiones restantes?
  const maxPossibleAttended = attendedSessions + remainingSessions
  const maxPossiblePercentage = totalFutureSessions > 0 
    ? (maxPossibleAttended / totalFutureSessions) * 100 
    : 0
  
  return {
    needed: sessionsStillNeeded,
    achievable: maxPossiblePercentage >= targetPercentage,
    currentProjection: maxPossiblePercentage
  }
}