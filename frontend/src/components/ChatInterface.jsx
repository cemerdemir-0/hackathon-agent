import { useState, useRef, useEffect } from 'react'

const API = 'http://localhost:8000'

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Merhaba! Stok, sipariş veya kargo hakkında soru sorabilirsiniz.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

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
    }
  }

  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-lg font-semibold mb-3">Ajan ile Konuş</h2>
      <div className="h-64 overflow-y-auto space-y-2 mb-3 border rounded p-3 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
              m.role === 'user'
                ? 'bg-blue-600 text-white'
                : 'bg-white border text-gray-800'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border text-gray-400 px-3 py-2 rounded-lg text-sm">
              Düşünüyor...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Mesajınızı yazın..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          Gönder
        </button>
      </div>
    </div>
  )
}
