import React, { useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import { Settings as SettingsIcon, Shield, Bell, Database, Palette, Info } from 'lucide-react'

function Section({ title, icon: Icon, children }) {
  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 14, borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'var(--accent-cyan-dim)',
          border: '1px solid rgba(0,245,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Icon size={15} color="var(--accent-cyan)" />
        </div>
        <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{title}</span>
      </div>
      {children}
    </div>
  )
}

function SettingRow({ label, description, children }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 0',
      borderBottom: '1px solid rgba(0,245,255,0.04)',
      gap: 16,
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{label}</div>
        {description && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{description}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange, id }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 42,
        height: 24,
        borderRadius: 12,
        background: checked ? 'var(--accent-cyan)' : 'var(--bg-surface)',
        border: `1px solid ${checked ? 'var(--accent-cyan)' : 'var(--border-card)'}`,
        position: 'relative',
        cursor: 'pointer',
        transition: 'all var(--transition-med)',
        boxShadow: checked ? '0 0 12px rgba(0,245,255,0.4)' : 'none',
      }}
    >
      <span style={{
        position: 'absolute',
        width: 16,
        height: 16,
        borderRadius: '50%',
        background: '#fff',
        top: 3,
        left: checked ? 21 : 3,
        transition: 'left var(--transition-med)',
      }} />
    </button>
  )
}

export default function Settings() {
  const [wafEnabled, setWafEnabled] = useState(true)
  const [alertNotifs, setAlertNotifs] = useState(true)
  const [autoBlock, setAutoBlock] = useState(false)
  const [logRetention, setLogRetention] = useState('30')
  const [theme, setTheme] = useState('cyberpunk')

  return (
    <>
      <Navbar title="Settings" />
      <div className="page-body">
        <div className="section-header">
          <div className="section-title">
            <SettingsIcon size={20} color="var(--accent-cyan)" />
            <span>System <span className="section-title-accent">Settings</span></span>
          </div>
        </div>

        {/* WAF Settings */}
        <Section title="WAF Configuration" icon={Shield}>
          <SettingRow label="WAF Enabled" description="Enable or disable the Web Application Firewall.">
            <Toggle id="toggle-waf" checked={wafEnabled} onChange={setWafEnabled} />
          </SettingRow>
          <SettingRow label="Auto-Block Attacks" description="Automatically block detected attack IPs (requires Redis).">
            <Toggle id="toggle-autoblock" checked={autoBlock} onChange={setAutoBlock} />
          </SettingRow>
          <SettingRow label="Detection Mode" description="Current detection engine.">
            <span className="badge badge-cyan">Rule-Based</span>
          </SettingRow>
          <SettingRow label="Confidence Threshold" description="Minimum confidence score to trigger an alert.">
            <input
              id="confidence-threshold"
              type="range"
              min="0"
              max="100"
              defaultValue="60"
              style={{ width: 120, accentColor: 'var(--accent-cyan)' }}
            />
          </SettingRow>
        </Section>

        {/* Notifications */}
        <Section title="Alerts & Notifications" icon={Bell}>
          <SettingRow label="Attack Notifications" description="Show browser notifications when attacks are detected.">
            <Toggle id="toggle-notifs" checked={alertNotifs} onChange={setAlertNotifs} />
          </SettingRow>
          <SettingRow label="Alert Severity Filter" description="Minimum severity to trigger a notification.">
            <select
              id="severity-filter"
              className="input"
              style={{ width: 120, padding: '6px 10px' }}
            >
              <option>All</option>
              <option>Medium+</option>
              <option>High only</option>
            </select>
          </SettingRow>
        </Section>

        {/* Data */}
        <Section title="Data & Retention" icon={Database}>
          <SettingRow label="Log Retention (days)" description="How long to keep attack logs in storage.">
            <input
              id="log-retention"
              type="number"
              className="input"
              style={{ width: 90, textAlign: 'center' }}
              value={logRetention}
              onChange={(e) => setLogRetention(e.target.value)}
              min="1"
              max="365"
            />
          </SettingRow>
          <SettingRow label="Export Logs" description="Download all attack logs as JSON.">
            <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 14px' }}>
              Export JSON
            </button>
          </SettingRow>
        </Section>

        {/* Appearance */}
        <Section title="Appearance" icon={Palette}>
          <SettingRow label="Theme" description="UI color theme.">
            <select
              id="theme-select"
              className="input"
              style={{ width: 140, padding: '6px 10px' }}
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="cyberpunk">Cyberpunk Dark</option>
              <option value="dark">Minimal Dark</option>
              <option value="ocean">Ocean Blue</option>
            </select>
          </SettingRow>
        </Section>

        {/* About */}
        <Section title="About" icon={Info}>
          <SettingRow label="Version" description="">
            <span className="badge badge-purple">v0.1.0</span>
          </SettingRow>
          <SettingRow label="Backend" description="">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>FastAPI + Uvicorn</span>
          </SettingRow>
          <SettingRow label="Frontend" description="">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)' }}>React + Vite</span>
          </SettingRow>
        </Section>
      </div>
    </>
  )
}
