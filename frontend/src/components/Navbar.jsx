import React from 'react'
import { Bell, RefreshCw } from 'lucide-react'

export default function Navbar({ title, onRefresh, loading }) {
  return (
    <div className="topbar">
      <h1 className="topbar-title">{title}</h1>
      <div className="topbar-right">
        <div className="live-indicator">
          <span className="pulse-dot green" />
          Live
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="btn btn-ghost"
            style={{ padding: '7px 12px', fontSize: 12 }}
            title="Refresh data"
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 0.7s linear infinite' : 'none' }} />
            Refresh
          </button>
        )}
        <div style={{
          position: 'relative',
          width: 34,
          height: 34,
          borderRadius: '50%',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all var(--transition-med)',
        }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-cyan)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-card)' }}
        >
          <Bell size={15} color="var(--text-secondary)" />
        </div>
      </div>
    </div>
  )
}
