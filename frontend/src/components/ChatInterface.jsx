import { useState, useRef, useEffect } from 'react'

const API = 'http://localhost:8000'

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Stok, sipariş veya kargo hakkında soru sorabilirsiniz.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const msg = input.trim()
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '420px' }}>
      {/* Header */}
      <div style={{
        padding: '20px 32px',
        borderBottom: '1px solid var(--gray-200)',
        display: 'flex',
        alignItems: 'baseline',
        gap: '16px',
      }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '20px',
          fontWeight: 300,
          letterSpacing: '0.05em',
        }}>
          Ajan
        </span>
        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: '9px',
          letterSpacing: '0.2em',
          color: loading ? 'var(--black)' : 'var(--gray-400)',
          textTransform: 'uppercase',
          transition: 'color 0.3s',
        }}>
          {loading ? 'Düşünüyor...' : 'Hazır'}
        </span>
        <div style={{
          width: '5px', height: '5px',
          borderRadius: '50%',
          background: loading ? 'var(--black)' : 'var(--gray-200)',
          transition: 'background 0.3s',
          animation: loading ? 'pulse-border 1s infinite' : 'none',
          marginLeft: 'auto',
        }} />
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>
        {messages.map((m, i) => (
          <div
            key={i}
            className="animate-fade-up"
            style={{
              display: 'flex',
              justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              animationDelay: '0s',
              opacity: 0,
              animationFillMode: 'forwards',
            }}
          >
            {m.role === 'assistant' && (
              <span style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '9px',
                letterSpacing: '0.15em',
                color: 'var(--gray-400)',
                textTransform: 'uppercase',
                marginRight: '12px',
                paddingTop: '3px',
                flexShrink: 0,
              }}>
                Ajan
              </span>
            )}
            <div style={{
              maxWidth: '60%',
              padding: '12px 16px',
              background: m.role === 'user' ? 'var(--black)' : 'var(--gray-100)',
              color: m.role === 'user' ? 'var(--white)' : 'var(--black)',
              fontFamily: "'DM Mono', monospace",
              fontSize: '12px',
              fontWeight: 300,
              lineHeight: 1.7,
              letterSpacing: '0.01em',
            }}>
              {m.text}
            </div>
            {m.role === 'user' && (
              <span style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: '9px',
                letterSpacing: '0.15em',
                color: 'var(--gray-400)',
                textTransform: 'uppercase',
                marginLeft: '12px',
                paddingTop: '3px',
                flexShrink: 0,
              }}>
                Siz
              </span>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: '9px',
              letterSpacing: '0.15em',
              color: 'var(--gray-400)',
              textTransform: 'uppercase',
            }}>Ajan</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[0,1,2].map(j => (
                <div key={j} style={{
                  width: '4px', height: '4px',
                  background: 'var(--gray-400)',
                  borderRadius: '50%',
                  animation: `fadeUp 0.8s ease ${j * 0.15}s infinite alternate`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        borderTop: '1px solid var(--black)',
        display: 'flex',
        alignItems: 'stretch',
      }}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          disabled={loading}
          placeholder="Mesajınızı yazın..."
          style={{
            flex: 1,
            padding: '20px 32px',
            border: 'none',
            outline: 'none',
            fontFamily: "'DM Mono', monospace",
            fontSize: '12px',
            fontWeight: 300,
            color: 'var(--black)',
            background: 'var(--white)',
            letterSpacing: '0.01em',
          }}
        />
        <button
          onClick={send}
          disabled={loading || !input.trim()}
          style={{
            padding: '0 32px',
            background: loading || !input.trim() ? 'var(--gray-200)' : 'var(--black)',
            color: loading || !input.trim() ? 'var(--gray-400)' : 'var(--white)',
            border: 'none',
            borderLeft: '1px solid var(--black)',
            fontFamily: "'DM Mono', monospace",
            fontSize: '9px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s, color 0.2s',
          }}
        >
          Gönder
        </button>
      </div>
    </div>
  )
}
