import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../App'

export default function CustomerForm() {
  const { setCustomer, customer, showCustomerModal, setShowCustomerModal } = useApp()
  const [tab, setTab] = useState('buscar')
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ nombre: '', telefono: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Buscar en Supabase solo cuando el usuario escribe
  useEffect(() => {
    if (search.length < 2) { setResults([]); return }
    setSearching(true)
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from('customers')
        .select('id, nombre, telefono')
        .or(`nombre.ilike.%${search}%,telefono.ilike.%${search}%`)
        .limit(10)
        .order('nombre')
      setResults(data || [])
      setSearching(false)
    }, 300)
    return () => clearTimeout(timeout)
  }, [search])

  // Limpiar al abrir
  useEffect(() => {
    if (showCustomerModal) {
      setSearch('')
      setResults([])
      setNewCustomer({ nombre: '', telefono: '' })
      setError('')
      setTab('buscar')
    }
  }, [showCustomerModal])

  const handleSelect = (cust) => {
    setCustomer(cust)
    setShowCustomerModal(false)
  }

  const handleCreate = async () => {
    if (!newCustomer.nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    setLoading(true)
    setError('')
    const { data, error: err } = await supabase
      .from('customers')
      .insert({ nombre: newCustomer.nombre.trim(), telefono: newCustomer.telefono.trim() || null })
      .select()
      .single()
    setLoading(false)
    if (err) { setError('Error al crear cliente'); return }
    setCustomer(data)
    setShowCustomerModal(false)
  }

  if (!showCustomerModal) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[9999] flex items-end justify-center"
      onClick={() => setShowCustomerModal(false)}
    >
      <div
        className="bg-white rounded-t-3xl w-full max-w-lg"
        style={{ maxHeight: '85vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center">
          <h2 className="font-semibold text-xl">
            {customer ? `Cliente: ${customer.nombre}` : 'Seleccionar cliente'}
          </h2>
          <button
            onClick={() => setShowCustomerModal(false)}
            className="text-2xl text-slate-300 leading-none"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mx-6 mb-4 bg-slate-100 rounded-2xl p-1">
          <button
            onClick={() => setTab('buscar')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === 'buscar' ? 'bg-white shadow text-primary' : 'text-slate-500'
            }`}
          >
            Buscar cliente
          </button>
          <button
            onClick={() => setTab('nuevo')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === 'nuevo' ? 'bg-white shadow text-primary' : 'text-slate-500'
            }`}
          >
            Nuevo cliente
          </button>
        </div>

        <div className="px-6 pb-10">
          {tab === 'buscar' ? (
            <div>
              <input
                type="text"
                placeholder="Nombre o teléfono..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
                className="w-full rounded-2xl bg-slate-100 px-5 py-4 text-base mb-3"
              />

              {searching && (
                <p className="text-slate-400 text-sm text-center py-4">Buscando...</p>
              )}

              <div className="space-y-2">
                {results.map(c => (
                  <div
                    key={c.id}
                    onClick={() => handleSelect(c)}
                    className={`flex justify-between items-center px-5 py-4 rounded-2xl cursor-pointer border transition-all ${
                      customer?.id === c.id
                        ? 'border-primary bg-blue-50'
                        : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                    }`}
                  >
                    <div>
                      <p className="font-medium">{c.nombre}</p>
                      <p className="text-sm text-slate-400">{c.telefono || 'Sin teléfono'}</p>
                    </div>
                    {customer?.id === c.id
                      ? <span className="text-primary font-bold">✓</span>
                      : <span className="text-slate-300 text-sm">Seleccionar →</span>
                    }
                  </div>
                ))}
                {search.length >= 2 && !searching && results.length === 0 && (
                  <p className="text-slate-400 text-sm text-center py-6">
                    No se encontraron clientes
                  </p>
                )}
                {search.length < 2 && (
                  <p className="text-slate-400 text-sm text-center py-6">
                    Escribe al menos 2 letras para buscar
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nombre completo"
                value={newCustomer.nombre}
                onChange={e => setNewCustomer({ ...newCustomer, nombre: e.target.value })}
                className="w-full rounded-2xl bg-slate-100 px-5 py-4 text-base"
              />
              <input
                type="tel"
                placeholder="Teléfono (opcional)"
                value={newCustomer.telefono}
                onChange={e => setNewCustomer({ ...newCustomer, telefono: e.target.value })}
                className="w-full rounded-2xl bg-slate-100 px-5 py-4 text-base"
              />
              {error && (
                <p className="text-red-500 text-sm px-1">{error}</p>
              )}
              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full btn-primary py-4 text-base"
              >
                {loading ? 'Guardando...' : 'Crear y seleccionar'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
