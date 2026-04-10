import React, { useEffect, useState, useCallback } from 'react'
import Navbar from '../components/Navbar.jsx'
import { AttackAreaChart, AttackTypeBarChart, AttackPieChart } from '../components/Chart.jsx'
import { ShieldAlert, Shield, Activity, Zap, Clock, TrendingUp } from 'lucide-react'

// Generates fake traffic-over-time data for the area chart
function buildTimelineData(logs) {
  const buckets = {}
  const now = Date.now()
  for (let i = 11; i >= 0; i--) {
    const t = new Date(now - i * 5 * 60 * 1000)
    const key = `${t.getHours()}:${String(t.getMinutes()).padStart(2, '0')}`
    buckets[key] = 0
  }
  logs.forEach((log) => {
    const t = new Date(log.timestamp)
    const key = `${t.getHours()}:${String(t.getMinutes()).padStart(2, '0')}`
    if (key in buckets) buckets[key]++
  })
  return Object.entries(buckets).map(([time, attacks]) => ({ time, attacks }))
}

function buildTypeData(metrics) {
  return [
    { type: 'SQLi', count: metrics.sql_injection || 0 },
    { type: 'XSS', count: metrics.xss || 0 },
    { type: 'Other', count: Math.max(0, (metrics.total_attacks || 0) - (metrics.sql_injection || 0) - (metrics.xss || 0)) },
  ]
}

function buildPieData(metrics) {
  return [
    { name: 'SQL Injection', value: metrics.sql_injection || 0 },
    { name: 'XSS', value: metrics.xss || 0 },
    { name: 'Other', value: Math.max(0, (metrics.total_attacks || 0) - (metrics.sql_injection || 0) - (metrics.xss || 0)) },
  ].filter((d) => d.value > 0)
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState({ total_attacks: 0, sql_injection: 0, xss: 0 })
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)

  const token = localStorage.getItem('aegis_token')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const headers = { Authorization: `Bearer ${token}` }
      const [mRes, aRes] = await Promise.all([
        fetch('/api/metrics/', { headers }),
        fetch('/api/alerts/', { headers }),
      ])
      if (mRes.ok) setMetrics(await mRes.json())
      if (aRes.ok) {
        const data = await aRes.json()
        setLogs(data.data || [])
      }
      setLastUpdated(new Date())
    } catch (_) {}
    setLoading(false)
  }, [token])

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 30000)
    return () => clearInterval(id)
  }, [fetchData])

  const timelineData = buildTimelineData(logs)
  const typeData = buildTypeData(metrics)
  const pieData = buildPieData(metrics)

  const recentLogs = logs.slice(-5).reverse()

  return (
    <>
      <Navbar title="Dashboard" onRefresh={fetchData} loading={loading} />
      <div className="page-body">
        {/* Stats */}
        <div className="stats-grid">
          <StatCard
            icon={<ShieldAlert size={20} color="var(--accent-red)" />}
            value={metrics.total_attacks}
            label="Total Attacks"
            bg="var(--accent-red-dim)"
            border="rgba(255,56,96,0.25)"
            color="var(--accent-red)"
          />
          <StatCard
            icon={<Zap size={20} color="var(--accent-orange)" />}
            value={metrics.sql_injection}
            label="SQL Injections"
            bg="rgba(255,145,0,0.1)"
            border="rgba(255,145,0,0.25)"
            color="var(--accent-orange)"
          />
          <StatCard
            icon={<Activity size={20} color="var(--accent-purple)" />}
            value={metrics.xss}
            label="XSS Attempts"
            bg="var(--accent-purple-dim)"
            border="rgba(155,89,255,0.25)"
            color="var(--accent-purple)"
          />
          <StatCard
            icon={<Shield size={20} color="var(--accent-green)" />}
            value="Active"
            label="WAF Status"
            bg="var(--accent-green-dim)"
            border="rgba(0,230,118,0.25)"
            color="var(--accent-green)"
          />
        </div>

        {/* Charts row */}
        <div className="charts-grid">
          <div className="card">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={13} />
              Attack Timeline (last 60 min)
            </div>
            <AttackAreaChart data={timelineData} />
          </div>
          <div className="card">
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Activity size={13} />
              Attack Type Distribution
            </div>
            {pieData.length > 0 ? (
              <AttackPieChart data={pieData} />
            ) : (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <Shield size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
                <p style={{ fontSize: 13 }}>No attacks detected yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Attack type bar chart */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={13} />
            Attacks by Type
          </div>
          <AttackTypeBarChart data={typeData} />
        </div>

        {/* Recent events */}
        <div className="card">
          <div className="section-header">
            <div className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={13} />
              Recent Events
            </div>
            {lastUpdated && (
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
          {recentLogs.length === 0 ? (
            <div className="empty-state">
              <Shield size={32} />
              <p>No recent events — system is clean 🛡️</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Timestamp</th>
                  <th>Payload Preview</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log, i) => (
                  <tr key={i}>
                    <td>
                      <span className={`badge ${log.attack_type === 'SQLi' ? 'badge-red' : log.attack_type === 'XSS' ? 'badge-orange' : 'badge-purple'}`}>
                        {log.attack_type || 'Unknown'}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <span className="mono" style={{ color: 'var(--text-muted)', fontSize: 11 }}>
                        {JSON.stringify(log.payload || {}).slice(0, 80)}…
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}

function StatCard({ icon, value, label, bg, border, color }) {
  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: bg,
        border: `1px solid ${border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div className="stat-value" style={{ color }}>{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  )
}
