import React, { useEffect, useState, useCallback } from 'react'
import Navbar from '../components/Navbar.jsx'
import AttackCard from '../components/AttackCard.jsx'
import { ShieldAlert, Filter, Search } from 'lucide-react'

const FILTERS = ['All', 'SQLi', 'XSS', 'Unknown']

export default function Alerts() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const token = localStorage.getItem('aegis_token')

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/alerts/', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setLogs((data.data || []).reverse())
      }
    } catch (_) {}
    setLoading(false)
  }, [token])

  useEffect(() => {
    fetchLogs()
    const id = setInterval(fetchLogs, 20000)
    return () => clearInterval(id)
  }, [fetchLogs])

  const filtered = logs.filter((log) => {
    const matchType = filter === 'All' || log.attack_type === filter
    const matchSearch = !search || JSON.stringify(log).toLowerCase().includes(search.toLowerCase())
    return matchType && matchSearch
  })

  return (
    <>
      <Navbar title="Alerts & Events" onRefresh={fetchLogs} loading={loading} />
      <div className="page-body">
        {/* Header */}
        <div className="section-header">
          <div className="section-title">
            <ShieldAlert size={20} color="var(--accent-red)" />
            <span>Security <span className="section-title-accent">Alerts</span></span>
            <span className="badge badge-red">{filtered.length}</span>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search
              size={14}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
            />
            <input
              type="text"
              className="input"
              placeholder="Search payload, type, IP…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 36 }}
              id="alerts-search"
            />
          </div>

          {/* Filter tabs */}
          <div style={{
            display: 'flex',
            gap: 4,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-card)',
            borderRadius: 8,
            padding: 4,
          }}>
            {FILTERS.map((f) => (
              <button
                key={f}
                id={`filter-${f}`}
                onClick={() => setFilter(f)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: 'none',
                  background: filter === f ? 'var(--accent-cyan-dim)' : 'transparent',
                  color: filter === f ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  border: filter === f ? '1px solid rgba(0,245,255,0.25)' : '1px solid transparent',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Alert list */}
        {loading && logs.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div className="spinner" style={{ width: 32, height: 32 }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="card empty-state">
            <ShieldAlert size={40} style={{ margin: '0 auto 12px', display: 'block' }} />
            <p style={{ fontSize: 14, marginBottom: 4 }}>No alerts found</p>
            <p style={{ fontSize: 12 }}>
              {logs.length === 0 ? 'System is clean — no attacks detected yet.' : 'Try adjusting your filters.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((log, i) => (
              <AttackCard key={i} log={log} index={i} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
