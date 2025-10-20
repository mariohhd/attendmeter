import React from 'react'

export default function Meter({ percentage, label = 'Asistencia válida' }) {
  // Colores mejorados con gradientes
  const fillColor =
    percentage >= 85 ? '#10b981'
    : percentage >= 75 ? '#22c55e'
    : percentage >= 65 ? '#f59e0b'
    : percentage >= 50 ? '#f97316'
    : '#ef4444';

  // Medidas mejoradas para conexión natural
  const height = 160;
  const radius = 56;
  const tubeWidth = 28;
  const fillHeight = Math.round((height - radius/2) * (percentage / 100));
  const centerX = 48;
  const ballCenterY = height + 12; // Posicionada para tocar el tubo naturalmente

  // Líneas de medida con etiquetas
  const marks = [
    { y: 25, label: '100' },
    { y: 50, label: '75' },
    { y: 75, label: '50' },
    { y: 100, label: '25' },
    { y: 125, label: '0' }
  ];

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      margin: '1.5rem 0',
      padding: '1rem',
      background: 'linear-gradient(145deg, #f8fafc, #e2e8f0)',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <div style={{ 
        fontWeight: '600', 
        marginBottom: 12,
        color: '#374151',
        fontSize: '0.95rem',
        letterSpacing: '0.025em'
      }}>{label}</div>
      
      <svg width={130} height={height + radius + 24} style={{ display: 'block', filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))' }}>
        {/* Definir gradientes */}
        <defs>
          <linearGradient id={`fillGradient-${percentage}`} x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" style={{ stopColor: fillColor, stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: fillColor, stopOpacity: 0.8 }} />
          </linearGradient>
          <linearGradient id="tubeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#f8fafc', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#ffffff', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#f1f5f9', stopOpacity: 1 }} />
          </linearGradient>
          <filter id="innerShadow">
            <feOffset dx="0" dy="2"/>
            <feGaussianBlur stdDeviation="2" result="offset-blur"/>
            <feFlood floodColor="#000000" floodOpacity="0.1"/>
            <feComposite in2="offset-blur" operator="in"/>
          </filter>
        </defs>

        {/* Sombra del tubo */}
        <rect x={centerX + 2} y={14} width={tubeWidth} height={height} rx={tubeWidth/2} fill="rgba(0, 0, 0, 0.1)" />
        {/* Tubo exterior con gradiente */}
        <rect x={centerX} y={12} width={tubeWidth} height={height} rx={tubeWidth/2} 
          fill="url(#tubeGradient)" stroke="#374151" strokeWidth={3} />
        
        {/* Relleno con gradiente y animación suave - extremo inferior recto */}
        <rect x={centerX + 2.5} y={height - radius/2 - fillHeight + 12} width={tubeWidth - 5} height={fillHeight} 
          rx="0" fill={`url(#fillGradient-${percentage})`} 
          style={{ transition: 'height 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }} />
        
        {/* Sombra de la bola */}
        <circle cx={centerX + tubeWidth/2 + 2} cy={ballCenterY + 2} r={radius/2} fill="rgba(0, 0, 0, 0.15)" />
        {/* Bola base con gradiente - conectada naturalmente */}
        <circle cx={centerX + tubeWidth/2} cy={ballCenterY} r={radius/2} 
          fill="url(#tubeGradient)" stroke="#374151" strokeWidth={3} />
        {/* Bola relleno con gradiente */}
        <circle cx={centerX + tubeWidth/2} cy={ballCenterY} r={radius/2 - 6} 
          fill={`url(#fillGradient-${percentage})`} 
          style={{ transition: 'fill 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }} />
        
        {/* Porcentaje en la base */}
        <text x={centerX + tubeWidth/2} y={ballCenterY + 6} textAnchor="middle" 
          fontSize="1.1rem" fontWeight="700" fill="#ffffff" 
          style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>
          {percentage}%
        </text>
        
        {/* Líneas de medida mejoradas */}
        {marks.map((mark, i) => (
          <g key={i}>
            <line x1={centerX + tubeWidth + 8} y1={mark.y + 12} 
              x2={centerX + tubeWidth + 24} y2={mark.y + 12} 
              stroke="#64748b" strokeWidth={2} strokeLinecap="round" />
            <text x={centerX + tubeWidth + 28} y={mark.y + 16} 
              fontSize="0.75rem" fill="#64748b" fontWeight="500">
              {mark.label}
            </text>
          </g>
        ))}
      </svg>
      
      {/* Indicador de estado */}
      <div style={{
        marginTop: '0.5rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '600',
        background: percentage >= 65 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        color: percentage >= 65 ? '#10b981' : '#ef4444',
        border: `1px solid ${percentage >= 65 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
      }}>
        {percentage >= 85 ? '¡No te pierdes una!' : 
         percentage >= 75 ? '¡Sigue así!' : 
         percentage >= 65 ? 'Estás en el límite' : 
         percentage >= 50 ? '¡Cuidado! Tienes que asistir más a clase' : 'No faltes más o irás a extraordinaria'}
      </div>
    </div>
  )
}
