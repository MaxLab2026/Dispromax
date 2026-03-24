// src/components/CustomerForm.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../App'

export default function CustomerForm() {
  const { setCustomer, showCustomerModal, setShowCustomerModal } = useApp()
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [newCustomer, setNewCustomer] = useState({ nombre: '', telefono: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!showCustomerModal) return
    const loadCustomers = async () => {
      const { data, error } = await supabase.from('customers').select('*').order('nombre')
      if (error) {
        console.error(error)
        setCustomers([])
      } else {
        setCustomers(data || [])
      }
    }
    loadCustomers()
  }, [showCustomerModal])

  const filteredCustomers = customers.filter(c => 
    (c.nombre?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (c.telefono || '').includes(search)
  )

  const handleSelect = (cust) => {
    setCustomer(cust)
    setShowCustomerModal(false)
  }

  const handleCreateNew = async (e) => {
    e.preventDefault()
    if (!newCustomer.nombre) {
      alert('El nombre es obligatorio')
      return
    }
    setLoading(true)
    const cleanPhone = newCustomer.telefono.trim() || null
    const { data, error } = await supabase
      .from('customers')
      .insert({ nombre: newCustomer.nombre, telefono: cleanPhone })
      .select()
      .single()
    
    if (error) {
      alert('Error al crear cliente')
      console.error(error)
    } else {
      setCustomer(data)
      setShowCustomerModal(false)
    }
    setLoading(false)
  }

  if (!showCustomerModal) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-5 border-b flex justify-between items-center">
          <h2 className="font-semibold text-2xl">Cliente</h2>
          <button onClick={() => setShowCustomerModal(false)} className="text-3xl leading-none text-slate-300">×</button>
        </div>
        
        <div className="p-6">
          {/* Buscador */}
          <input
            type="text"
            placeholder="Buscar cliente por nombre o teléfono..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-3xl bg-slate-100 px-6 py-4 text-lg mb-6"
          />

          {/* Lista clientes */}
          <div className="max-h-64 overflow-auto space-y-2 mb-8">
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map(c => (
                <div
                  key={c.id}
                  onClick={() => handleSelect(c)}
                  className="flex justify-between items-center px-6 py-4 hover:bg-slate-50 rounded-3xl cursor-pointer border border-transparent hover:border-slate-200"
                >
                  <div>
                    <p className="font-medium">{c.nombre || 'Sin nombre'}</p>
                    <p className="text-sm text-slate-400">{c.telefono || 'Sin teléfono'}</p>
                  </div>
                  <span className="text-primary">Seleccionar →</span>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-sm">No hay clientes registrados</p>
            )}
          </div>

          {/* Crear nuevo */}
          <div className="border-t pt-6">
            <h3 className="text-sm uppercase mb-4 text-slate-400">Crear cliente rápido</h3>
            <form onSubmit={handleCreateNew} className="space-y-4">
              <input
                type="text"
                placeholder="Nombre completo"
                value={newCustomer.nombre}
                onChange={e => setNewCustomer({...newCustomer, nombre: e.target.value})}
                className="w-full rounded-3xl px-6 py-4 border border-slate-200"
                required
              />
              <input
                type="tel"
                placeholder="Teléfono (Opcional)"
                value={newCustomer.telefono}
                onChange={e => setNewCustomer({...newCustomer, telefono: e.target.value})}
                className="w-full rounded-3xl px-6 py-4 border border-slate-200"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4"
              >
                {loading ? 'Guardando...' : 'Crear y seleccionar cliente'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
