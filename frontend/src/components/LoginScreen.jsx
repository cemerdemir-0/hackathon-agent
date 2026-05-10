import { useState } from 'react'

export default function LoginScreen({ onLogin }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      if (user === 'admin' && pass === 'admin') {
        onLogin()
      } else {
        setError('Kullanıcı adı veya şifre hatalı')
        setLoading(false)
      }
    }, 600)
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        opacity: 0.4,
        pointerEvents: 'none',
      }}/>

      <div className="fade-up" style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '380px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '48px', height: '48px',
            background: 'var(--accent)',
            borderRadius: '12px',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '16px',
          }}>
            <svg width="22" height="22" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5" stroke="#000" strokeWidth="1.5"/>
              <path d="M7 4v3l2 1.5" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 700,
            fontSize: '22px',
            color: 'var(--text-1)',
            letterSpacing: '-0.02em',
          }}>
            Nöbetçi Ajan
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-3)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginTop: '4px',
          }}>
            KOBİ Operasyon Paneli
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border2)',
          borderRadius: '14px',
          padding: '32px',
        }}>
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontWeight: 600,
            fontSize: '16px',
            color: 'var(--text-1)',
            marginBottom: '4px',
          }}>
            Giriş Yap
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            color: 'var(--text-3)',
            marginBottom: '28px',
          }}>
            Devam etmek için kimlik doğrulayın
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Field
              label="Kullanıcı Adı"
              type="text"
              value={user}
              onChange={e => { setUser(e.target.value); setError('') }}
              placeholder="admin"
              autoFocus
            />
            <Field
              label="Şifre"
              type="password"
              value={pass}
              onChange={e => { setPass(e.target.value); setError('') }}
              placeholder="••••••"
            />

            {error && (
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--danger)',
                padding: '8px 12px',
                background: 'rgba(224,90,78,0.08)',
                border: '1px solid rgba(224,90,78,0.2)',
                borderRadius: '6px',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !user || !pass}
              style={{
                marginTop: '6px',
                padding: '11px',
                background: loading ? 'rgba(232,169,77,0.4)' : 'var(--accent)',
                border: 'none',
                borderRadius: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                fontWeight: 500,
                color: '#000',
                cursor: loading || !user || !pass ? 'not-allowed' : 'pointer',
                letterSpacing: '0.03em',
                transition: 'all 0.2s',
                opacity: !user || !pass ? 0.5 : 1,
              }}
            >
              {loading ? 'Doğrulanıyor...' : 'Giriş Yap →'}
            </button>
          </form>
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: '20px',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--text-3)',
          letterSpacing: '0.05em',
        }}>
          Nöbetçi Ajan v1.0 · Hackathon Demo
        </div>
      </div>
    </div>
  )
}

function Field({ label, type, value, onChange, placeholder, autoFocus }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '10px',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--text-3)',
      }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        style={{
          background: 'var(--surface2)',
          border: '1px solid var(--border2)',
          borderRadius: '8px',
          padding: '10px 14px',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          color: 'var(--text-1)',
          outline: 'none',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border2)'}
      />
    </div>
  )
}
