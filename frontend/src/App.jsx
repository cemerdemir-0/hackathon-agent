import Dashboard from './components/Dashboard'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-700 text-white px-6 py-4 shadow">
        <h1 className="text-xl font-bold">Nöbetçi Ajan — KOBİ Operasyon Merkezi</h1>
      </header>
      <main className="p-6">
        <Dashboard />
      </main>
    </div>
  )
}
