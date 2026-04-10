import React, { useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import { Bug, Send, CheckCircle, AlertTriangle, Code } from 'lucide-react'

const EXAMPLE_PAYLOADS = [
  { label: 'SQL Injection', value: "' OR 1=1 --", type: 'SQLi' },
  { label: 'UNION Attack', value: "admin' UNION SELECT * FROM users --", type: 'SQLi' },
  { label: 'XSS Script Tag', value: '<script>alert("xss")</script>', type: 'XSS' },
  { label: 'XSS Event', value: '<img src=x onerror=alert(1)>', type: 'XSS' },
]

export default function HoneypotView() {
  const [payload, setPayload] = useState('')
  const [field, setField] = useState('username')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async () => {
    if (!payload.trim()) return
    setLoading(true)
    setResult(null)
    setError('')
    try {
      const body = { [field]: payload, attack_type: 'Unknown' }
      const res = await fetch('/api/honeypot/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      setResult({ ok: res.ok, data, status: res.status })
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  const handleExample = (ex) => {
    setPayload(ex.value)
    setField('username')
  }

  return (
    <>
      <Navbar title="Honeypot Simulator" />
      <div className="page-body">
        {/* Header */}
        <div className="section-header">
          <div className="section-title">
            <Bug size={20} color="var(--accent-orange)" />
            <span>Honeypot <span className="section-title-accent">Simulator</span></span>
          </div>
        </div>

        {/* Info banner */}
        <div style={{
          background: 'rgba(155,89,255,0.08)',
          border: '1px solid rgba(155,89,255,0.25)',
          borderRadius: 10,
          padding: '12px 18px',
          marginBottom: 24,
          fontSize: 13,
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <AlertTriangle size={16} color="var(--accent-purple)" />
          The honeypot endpoint accepts and logs any payload, simulating a vulnerable system to lure and study attackers.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          {/* Left — composer */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Craft Payload</div>

            <div style={{ marginBottom: 16 }}>
              <label className="form-label" htmlFor="hp-field">Field Name</label>
              <input
                id="hp-field"
                type="text"
                className="input"
                value={field}
                onChange={(e) => setField(e.target.value)}
                placeholder="username"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="form-label" htmlFor="hp-payload">Payload</label>
              <textarea
                id="hp-payload"
                className="input"
                style={{ minHeight: 120, resize: 'vertical', fontFamily: 'var(--font-mono)', fontSize: 13 }}
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                placeholder="Enter a payload to send to the honeypot…"
              />
            </div>

            <button
              id="hp-send"
              onClick={handleSend}
              disabled={loading || !payload.trim()}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {loading ? (
                <><div className="spinner" style={{ width: 16, height: 16 }} /> Sending…</>
              ) : (
                <><Send size={14} /> Send to Honeypot</>
              )}
            </button>

            {/* Result */}
            {error && (
              <div className="error-msg" style={{ marginTop: 16 }}>
                {error}
              </div>
            )}

            {result && (
              <div style={{
                marginTop: 16,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-card)',
                borderRadius: 10,
                padding: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <CheckCircle size={16} color="var(--accent-green)" />
                  <span style={{ fontSize: 13, color: 'var(--accent-green)', fontWeight: 600 }}>
                    Response {result.status}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Code size={12} color="var(--text-muted)" />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>JSON Response</span>
                </div>
                <pre style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  color: 'var(--accent-cyan)',
                  background: 'var(--bg-base)',
                  borderRadius: 8,
                  padding: 12,
                  overflow: 'auto',
                  border: '1px solid var(--border-subtle)',
                }}>
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* Right — example payloads */}
          <div>
            <div className="card">
              <div className="card-title" style={{ marginBottom: 14 }}>Example Payloads</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {EXAMPLE_PAYLOADS.map((ex) => (
                  <button
                    key={ex.label}
                    onClick={() => handleExample(ex)}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-card)',
                      borderRadius: 8,
                      padding: '10px 14px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all var(--transition-med)',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-cyan)'; e.currentTarget.style.background = 'var(--accent-cyan-dim)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-card)'; e.currentTarget.style.background = 'var(--bg-surface)' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{ex.label}</span>
                      <span className={`badge ${ex.type === 'SQLi' ? 'badge-red' : 'badge-orange'}`} style={{ fontSize: 10 }}>{ex.type}</span>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                      {ex.value}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* WAF note */}
            <div className="card" style={{ marginTop: 16 }}>
              <div className="card-title" style={{ marginBottom: 8 }}>How it works</div>
              <ol style={{ paddingLeft: 18, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <li>WAF middleware scans the request body</li>
                <li>Malicious patterns trigger honeypot capture</li>
                <li>Payload is logged for analysis</li>
                <li>A fake success response is returned</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
