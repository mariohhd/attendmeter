import React, { useEffect, useState } from 'react';
import Meter from './Meter.jsx';
// Helper to group sessions by month
function groupSessionsByMonth(sessions) {
  const months = {};
  sessions.forEach(s => {
    const monthKey = `${s.date.getFullYear()}-${String(s.date.getMonth() + 1).padStart(2, '0')}`;
    if (!months[monthKey]) months[monthKey] = [];
    months[monthKey].push(s);
  });
  return months;
}

function getSessionsFromLocalStorage(courseId, fallback) {
  try {
    const saved = localStorage.getItem(`eoi_sessions_${courseId}`);
    if (saved) {
      return JSON.parse(saved).map(s => ({ ...s, date: new Date(s.date) }));
    }
    return fallback.map(s => ({ ...s, date: new Date(s.date) }));
  } catch {
    return fallback.map(s => ({ ...s, date: new Date(s.date) }));
  }
}

function getValidSessions(sessions) {
  return sessions.filter(s => s.sessionType !== 'cancelled' && !s.isHoliday && !s.teacherAbsent);
}

function getRecentHistory(sessions) {
  // Incluir todas las sesiones (válidas e inválidas) para mostrar festivos y ausencias del docente
  const sorted = [...sessions].sort((a, b) => b.date - a.date);
  return sorted.slice(0, 5);
}

function getAttendanceStatus(session) {
  if (session.isHoliday) return 'holiday';
  if (session.teacherAbsent) return 'teacher-absent';
  if (session.sessionType === 'cancelled') return 'cancelled';
  if (session.attended === true) return 'attended';
  if (session.attended === false) return 'absent';
  return 'pending'; // No marcado aún
}

function getSessionDisplayInfo(session) {
  const status = getAttendanceStatus(session);
  
  switch (status) {
    case 'holiday':
      return {
        icon: '🎉',
        text: 'Día festivo',
        color: '#8b5cf6',
        canEdit: false
      };
    case 'teacher-absent':
      return {
        icon: '👩‍🏫',
        text: 'Ausencia del docente',
        color: '#6b7280',
        canEdit: false
      };
    case 'cancelled':
      return {
        icon: '❌',
        text: 'Clase cancelada',
        color: '#ef4444',
        canEdit: false
      };
    case 'attended':
      return {
        icon: '✔️',
        text: 'Asistido',
        color: '#059669',
        canEdit: true
      };
    case 'absent':
      return {
        icon: '❌',
        text: 'Ausente',
        color: '#dc2626',
        canEdit: true
      };
    case 'pending':
      return {
        icon: '⏳',
        text: 'Pendiente de marcar',
        color: '#d97706',
        canEdit: true
      };
    default:
      return {
        icon: '❓',
        text: 'Sin información',
        color: '#6b7280',
        canEdit: false
      };
  }
}

export default function EOICourseCard({ course }) {

  const [sessions, setSessions] = useState(() => getSessionsFromLocalStorage(course.id, course.sessions));

  // Listen for localStorage changes (e.g., from PassedClassesManager)
  useEffect(() => {
    function updateSessions() {
      setSessions(getSessionsFromLocalStorage(course.id, course.sessions));
    }
    window.addEventListener('storage', updateSessions);
    return () => window.removeEventListener('storage', updateSessions);
  }, [course.id, course.sessions]);

  // Filtrar sólo sesiones hasta hoy (no futuras)
  const today = new Date();
  today.setHours(0,0,0,0);
  const pastSessions = sessions.filter(s => s.date <= today);
  const validSessions = getValidSessions(pastSessions);
  const attended = validSessions.filter(s => s.attended).length;
  const scheduled = validSessions.length;
  const validAttendancePercentage = scheduled > 0 ? Math.round((attended / scheduled) * 100) : 0;
  const recentHistory = getRecentHistory(pastSessions);

  // Group only past sessions by month for dropdowns
  const months = groupSessionsByMonth(pastSessions);
  const [openMonth, setOpenMonth] = useState(null);

  // Handlers para editar asistencia y notas
  const handleAttendanceChange = (id, attended) => {
    const updatedSessions = sessions.map(s =>
      s.id === id ? { ...s, attended } : s
    );
    setSessions(updatedSessions);
    
    // Persistir en localStorage
    try {
      localStorage.setItem(`eoi_sessions_${course.id}`, JSON.stringify(updatedSessions));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };
  
  const handleAttendanceToggle = (id, value) => {
    const attended = value === 'attended' ? true : value === 'absent' ? false : null;
    handleAttendanceChange(id, attended);
  };
  
  const handleNotesChange = (id, notes) => {
    const updatedSessions = sessions.map(s =>
      s.id === id ? { ...s, notes } : s
    );
    setSessions(updatedSessions);
    
    // Persistir en localStorage
    try {
      localStorage.setItem(`eoi_sessions_${course.id}`, JSON.stringify(updatedSessions));
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  return (
    <div className="eoi-course-card">
      <style jsx>{`
        .eoi-course-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          overflow: hidden;
          margin: 0 auto 2rem auto;
          max-width: 1200px;
          border: 1px solid #e5e7eb;
        }
        
        .course-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          text-align: center;
        }
        
        .course-name {
          margin: 0 0 1rem 0;
          font-size: 2rem;
          font-weight: 700;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .course-meta {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .course-meta span {
          background: rgba(255, 255, 255, 0.15);
          padding: 0.75rem 1rem;
          border-radius: 8px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .course-meta strong {
          color: #e0e7ff;
          font-weight: 600;
        }
        
        .teacher-email a {
          color: #bfdbfe;
          text-decoration: none;
          transition: color 0.2s;
        }
        
        .teacher-email a:hover {
          color: white;
          text-decoration: underline;
        }
        
        .course-content {
          padding: 2rem;
          display: flex;
          gap: 3rem;
          align-items: flex-start;
        }
        
        @media (max-width: 768px) {
          .course-content {
            flex-direction: column;
            gap: 2rem;
            align-items: center;
          }
          
          .course-meta {
            grid-template-columns: 1fr;
          }
        }
        
        .thermometer-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 220px;
          padding: 1rem;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }
        
        .content-section {
          flex: 1;
          min-width: 0;
        }
        
        .history-section {
          background: #f8fafc;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          border: 1px solid #e2e8f0;
        }
        
        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .history-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 1rem;
          margin-bottom: 0.5rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .history-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .history-item.pending {
          border-left: 4px solid #f59e0b;
          background: #fefce8;
        }
        
        .history-item.holiday {
          border-left: 4px solid #8b5cf6;
          background: #faf5ff;
        }
        
        .history-item.teacher-absent {
          border-left: 4px solid #6b7280;
          background: #f9fafb;
        }
        
        .history-item.cancelled {
          border-left: 4px solid #ef4444;
          background: #fef2f2;
        }
        
        .history-date {
          font-weight: 500;
          color: #4b5563;
        }
        
        .history-status {
          font-weight: 600;
        }
        
        .history-status.pending {
          color: #d97706;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .history-notes {
          font-style: italic;
          color: #6b7280;
          font-size: 0.9rem;
        }
        
        .months-section {
          background: #f8fafc;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid #e2e8f0;
        }
        
        .month-button {
          width: 100%;
          text-align: left;
          font-weight: 600;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          border: none;
          border-radius: 8px;
          padding: 1rem 1.5rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .month-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
        }
        
        .month-sessions {
          background: white;
          border-radius: 8px;
          padding: 1rem;
          border: 1px solid #e5e7eb;
          margin-bottom: 1rem;
        }
        
        .session-item {
          display: grid;
          grid-template-columns: 2fr 1fr 2fr 2fr;
          gap: 1rem;
          align-items: center;
          padding: 1rem;
          margin-bottom: 0.5rem;
          background: #f9fafb;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          transition: background-color 0.2s;
        }
        
        .session-item.non-editable {
          grid-template-columns: 2fr 1fr 2fr auto;
          background: #f8f9fa;
          border: 1px solid #dee2e6;
        }
        
        .session-item:hover {
          background: #f3f4f6;
        }
        
        @media (max-width: 640px) {
          .session-item {
            grid-template-columns: 1fr;
            gap: 0.5rem;
            text-align: center;
          }
          
          .attendance-buttons {
            justify-content: center;
          }
        }
        
        .session-date {
          font-weight: 500;
          color: #374151;
        }
        
        .session-type {
          font-size: 0.9rem;
          color: #6b7280;
          text-transform: capitalize;
        }
        
        .attendance-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #374151;
        }
        
        .attendance-buttons {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        
        .attendance-btn {
          padding: 0.5rem 1rem;
          border: 2px solid transparent;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          background: #f3f4f6;
          color: #6b7280;
        }
        
        .attendance-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        
        .attendance-btn.active {
          color: white;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .attendance-btn.attended.active {
          background: #059669;
          border-color: #047857;
        }
        
        .attendance-btn.absent.active {
          background: #dc2626;
          border-color: #b91c1c;
        }
        
        .attendance-btn.pending.active {
          background: #f59e0b;
          border-color: #d97706;
        }
        
        .attendance-checkbox {
          width: 18px;
          height: 18px;
          accent-color: #3b82f6;
        }
        
        .notes-input {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.9rem;
          transition: border-color 0.2s;
          min-width: 120px;
        }
        
        .notes-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
        
        .session-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 500;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          background: #f3f4f6;
          color: #374151;
        }
        
        .session-info.holiday {
          background: #faf5ff;
          color: #8b5cf6;
          border: 1px solid #c4b5fd;
        }
        
        .session-info.teacher-absent {
          background: #f9fafb;
          color: #6b7280;
          border: 1px solid #d1d5db;
        }
        
        .session-info.cancelled {
          background: #fef2f2;
          color: #ef4444;
          border: 1px solid #fca5a5;
        }
        
        .empty-state {
          text-align: center;
          color: #6b7280;
          font-style: italic;
          padding: 2rem;
        }
      `}</style>
      
      <div className="course-header" style={{ borderColor: course.color }}>
        <h3 className="course-name">{course.name}</h3>
        <div className="course-meta">
          <span className="language-level">
            <strong>Idioma:</strong> {course.language} | <strong>Nivel:</strong> {course.level}
          </span>
          <span className="teacher">
            <strong>Docente:</strong> {course.teacher}
          </span>
          {course.teacherEmail && (
            <span className="teacher-email">
              <strong>Email:</strong> <a href={`mailto:${course.teacherEmail}`}>{course.teacherEmail}</a>
            </span>
          )}
          <span className="schedule">
            <strong>Días:</strong> {Array.isArray(course.schedule.days)
              ? course.schedule.days.map(d => {
                  const daysMap = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                  return daysMap[d] || d;
                }).join(' y ')
              : course.schedule.days}
            <br />
            <strong>Horario:</strong> {course.schedule.startTime} - {course.schedule.endTime}
          </span>
          {course.classroom && (
            <span className="classroom">
              <strong>Aula:</strong> {course.classroom}
            </span>
          )}
        </div>
      </div>
      
      <div className="course-content">
        <div className="thermometer-section">
          <Meter percentage={validAttendancePercentage} label="Asistencia válida" />
        </div>
        
        <div className="content-section">
          <div className="history-section">
            <h4 className="section-title">
              📚 Historial reciente
            </h4>
            {recentHistory.length === 0 ? (
              <div className="empty-state">No hay historial disponible</div>
            ) : (
              <ul className="history-list">
                {recentHistory.map(s => {
                  const status = getAttendanceStatus(s);
                  const displayInfo = getSessionDisplayInfo(s);
                  return (
                    <li key={s.id} className={`history-item ${status}`}>
                      <div>
                        <span className="history-date">
                          {s.date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                        <span className={`history-status ${status}`} style={{ 
                          color: displayInfo.color,
                          marginLeft: '1rem'
                        }}>
                          {displayInfo.icon} {displayInfo.text}
                        </span>
                        {s.notes && (
                          <div className="history-notes">{s.notes}</div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          
          <div className="months-section">
            <h4 className="section-title">
              📅 Clases por mes
            </h4>
            {Object.keys(months).length === 0 ? (
              <div className="empty-state">No hay sesiones registradas</div>
            ) : (
              Object.entries(months)
                .sort(([monthA], [monthB]) => {
                  // Ordenar por fecha descendente (más reciente primero)
                  return new Date(monthB + '-01') - new Date(monthA + '-01');
                })
                .map(([month, monthSessions]) => {
                  const label = new Date(monthSessions[0].date).toLocaleString('es-ES', { month: 'long', year: 'numeric' });
                  return (
                    <div key={month}>
                      <button
                        className="month-button"
                        onClick={() => setOpenMonth(openMonth === month ? null : month)}
                      >
                        <span>{label}</span>
                        <span>{openMonth === month ? '▲' : '▼'}</span>
                      </button>
                      {openMonth === month && (
                        <div className="month-sessions">
                          {monthSessions.map(s => {
                            const status = getAttendanceStatus(s);
                            const displayInfo = getSessionDisplayInfo(s);
                            return (
                              <div key={s.id} className={`session-item ${!displayInfo.canEdit ? 'non-editable' : ''}`}>
                                <span className="session-date">
                                  {s.date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                                <span className="session-type">
                                  {s.sessionType === 'regular' ? 'Clase' : s.sessionType === 'exam' ? 'Examen' : 'Cancelada'}
                                </span>
                                {displayInfo.canEdit ? (
                                  <div className="attendance-buttons">
                                    <button
                                      className={`attendance-btn attended ${status === 'attended' ? 'active' : ''}`}
                                      onClick={() => handleAttendanceToggle(s.id, 'attended')}
                                    >
                                      ✔️ Asistí
                                    </button>
                                    <button
                                      className={`attendance-btn absent ${status === 'absent' ? 'active' : ''}`}
                                      onClick={() => handleAttendanceToggle(s.id, 'absent')}
                                    >
                                      ❌ Falté
                                    </button>
                                    {status === 'pending' && (
                                      <button
                                        className={`attendance-btn pending active`}
                                        onClick={() => handleAttendanceToggle(s.id, null)}
                                      >
                                        ⏳ Pendiente
                                      </button>
                                    )}
                                  </div>
                                ) : (
                                  <div className={`session-info ${status}`}>
                                    {displayInfo.icon} {displayInfo.text}
                                  </div>
                                )}
                                {displayInfo.canEdit && (
                                  <input
                                    type="text"
                                    className="notes-input"
                                    value={s.notes || ''}
                                    placeholder="Notas..."
                                    onChange={e => handleNotesChange(s.id, e.target.value)}
                                  />
                                )}
                                {!displayInfo.canEdit && s.notes && (
                                  <div className="notes-display" style={{ 
                                    fontStyle: 'italic', 
                                    color: '#6b7280',
                                    padding: '0.5rem',
                                    background: '#f9fafb',
                                    borderRadius: '6px'
                                  }}>
                                    {s.notes}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
