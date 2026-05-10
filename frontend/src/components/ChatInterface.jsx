import { useState, useRef, useEffect } from 'react'

const API = 'http://localhost:8000'

const SUGGESTIONS = [
  'Kritik stoklar neler?',
  '128 nolu sipariş nerede?',
  'Bekleyen siparişleri listele',
  'Domates tedarikçisine mail yaz',
]

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Merhaba. Stok, sipariş ve kargo konularında size yardımcı olabilirim.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setLoading(true)
    try {
      const res = await fetch(`${API}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', text: data.response }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Bağlantı hatası. Backend çalışıyor mu?' }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const showSuggestions = messages.length <= 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '420px' }}>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        {messages.map((m, i) => (
          <div key={i} className="fade-up" style={{
            display: 'flex',
            gap: '10px',
            justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
            animationDelay: '0s',
          }}>
            {m.role === 'assistant' && (
              <div style={{
                width: '24px', height: '24px', borderRadius: '6px',
                background: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: '2px',
              }}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <circle cx="5" cy="5" r="3.5" stroke="#000" strokeWidth="1.2"/>
                  <path d="M5 3v2l1.5 1" stroke="#000" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
            )}
            <div style={{
              maxWidth: '75%',
              padding: '10px 14px',
              background: m.role === 'user' ? 'var(--accent)' : 'var(--surface2)',
              border: `1px solid ${m.role === 'user' ? 'transparent' : 'var(--border)'}`,
              borderRadius: m.role === 'user' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 300,
              lineHeight: 1.7,
              color: m.role === 'user' ? '#000' : 'var(--text-2)',
            }}>
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <div style={{
              width: '24px', height: '24px', borderRadius: '6px',
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <circle cx="5" cy="5" r="3.5" stroke="#000" strokeWidth="1.2"/>
                <path d="M5 3v2l1.5 1" stroke="#000" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{
              padding: '10px 14px',
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: '12px 12px 12px 4px',
              display: 'flex', gap: '5px', alignItems: 'center',
            }}>
              {[0,1,2].map(j => (
                <span key={j} style={{
                  width: '5px', height: '5px', borderRadius: '50%',
                  background: 'var(--text-3)',
                  display: 'block',
                  animation: `pulse 1.2s ease ${j * 0.2}s infinite`,
                }}/>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {showSuggestions && !loading && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '6px',
            marginTop: '4px', paddingLeft: '34px',
          }}>
            {SUGGESTIONS.map((s, i) => (
              <button key={i} onClick={() => send(s)} style={{
                padding: '5px 10px',
                background: 'transparent',
                border: '1px solid var(--border2)',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: 'var(--text-3)',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)' }}
                onMouseLeave={e => { e.target.style.borderColor = 'var(--border2)'; e.target.style.color = 'var(--text-3)' }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 4px 0 16px',
        gap: '8px',
        height: '52px',
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          disabled={loading}
          placeholder="Bir şeyler sorun..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            fontWeight: 300,
            color: 'var(--text-1)',
            letterSpacing: '0.01em',
          }}
        />
        <button
          onClick={() => send()}
          disabled={loading || !input.trim()}
          style={{
            width: '36px', height: '36px',
            borderRadius: '8px',
            border: 'none',
            background: loading || !input.trim() ? 'var(--surface2)' : 'var(--accent)',
            color: loading || !input.trim() ? 'var(--text-3)' : '#000',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
            flexShrink: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
