import React from 'react'
import { ShieldAlert, Clock, Globe } from 'lucide-react'

const TYPE_STYLES = {
  SQLi: { badge: 'badge-red', label: 'SQL Injection' },
  XSS: { badge: 'badge-orange', label: 'XSS' },
  Unknown: { badge: 'badge-purple', label: 'Unknown' },
}

export default function AttackCard({ log, index }) {
  const style = TYPE_STYLES[log.attack_type] || TYPE_STYLES.Unknown

  return (
    <div
      className="card fade-in"
      style={{
        animationDelay: `${index * 60}ms`,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 16,
        padding: '16px 20px',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: 'var(--accent-red-dim)',
        border: '1px solid rgba(255,56,96,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <ShieldAlert size={18} color="var(--accent-red)" />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span className={`badge ${style.badge}`}>{style.label}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={10} />
            {new Date(log.timestamp).toLocaleTimeString()}
          </span>
        </div>

        {log.payload?.ip && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
            <Globe size={11} />
            {log.payload.ip}
          </div>
        )}

        <div
          className="mono"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 6,
            padding: '6px 10px',
            fontSize: 11,
            color: 'var(--text-secondary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '100%',
          }}
        >
          {JSON.stringify(log.payload || {}).slice(0, 120)}
        </div>
      </div>
    </div>
  )
}
