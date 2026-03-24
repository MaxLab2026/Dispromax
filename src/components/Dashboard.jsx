// src/components/Dashboard.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../App'

export default function Dashboard() {
  const { generatePDF } = useApp()
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers(nombre, telefono),
        order_items (
          cantidad,
          precio_unitario,
          subtotal,
          products (nombre)
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error(error)
      setOrders([])
      setFilteredOrders([])
    } else {
      setOrders(data || [])
      setFilteredOrders(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    let result = orders

    if (dateFrom) {
      result = result.filter(o => o.created_at && new Date(o.created_at) >= new Date(dateFrom))
    }
    if (dateTo) {
      result = result.filter(o => o.created_at && new Date(o.created_at) <= new Date(dateTo))
    }
    if (statusFilter !== 'all') {
      result = result.filter(o => o.estado === statusFilter)
    }

    setFilteredOrders(result)
  }, [orders, dateFrom, dateTo, statusFilter])

  // Estadísticas
  const totalVentas = filteredOrders.reduce((acc, o) => acc + (o.estado !== 'pendiente' ? (o.total || 0) : 0), 0)
  const totalPedidos = filteredOrders.length
  const pendientes = filteredOrders.filter(o => o.estado === 'pendiente').length
  const pagados = filteredOrders.filter(o => o.estado === 'pagado').length

  const handleStatusChange = async (orderId, newStatus) => {
    await supabase
      .from('orders')
      .update({ estado: newStatus })
      .eq('id', orderId)
    fetchOrders()
  }

  return (
    <div className="p-8">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow">
          <p className="text-slate-400 text-sm">Total ventas</p>
          <p className="text-4xl font-bold text-primary">${totalVentas.toLocaleString('es-CO')}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow">
          <p className="text-slate-400 text-sm">Total pedidos</p>
          <p className="text-4xl font-bold">{totalPedidos}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow border border-orange-200">
          <p className="text-slate-400 text-sm">Pendientes</p>
          <p className="text-4xl font-bold text-orange-500">{pendientes}</p>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow border border-emerald-200">
          <p className="text-slate-400 text-sm">Pagados</p>
          <p className="text-4xl font-bold text-emerald-500">{pagados}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 bg-white rounded-3xl p-4 mb-8">
        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-slate-100 rounded-2xl px-5 py-3" />
        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-slate-100 rounded-2xl px-5 py-3" />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-100 rounded-2xl px-5 py-3">
          <option value="all">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="parcial">Parcial</option>
          <option value="pagado">Pagado</option>
        </select>
        <button onClick={fetchOrders} className="btn-primary px-8">Actualizar</button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-3xl overflow-hidden">
        {loading ? (
          <p className="p-8 text-slate-400">Cargando pedidos...</p>
        ) : filteredOrders.length > 0 ? (
          <table className="w-full">
            <thead className="bg-slate-50 text-xs uppercase">
              <tr>
                <th className="text-left px-8 py-5">Pedido</th>
                <th className="text-left px-8 py-5">Cliente</th>
                <th className="text-left px-8 py-5">Fecha</th>
                <th className="text-right px-8 py-5">Total</th>
                <th className="px-8 py-5">Estado</th>
                <th className="px-8 py-5 w-40">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} className="border-t hover:bg-slate-50">
                  <td className="px-8 py-5 font-medium">#{order.id}</td>
                  <td className="px-8 py-5">{order.customers?.nombre || 'Sin cliente'}</td>
                  <td className="px-8 py-5 text-slate-400 text-sm">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString('es-CO') : 'Sin fecha'}
                  </td>
                  <td className="px-8 py-5 text-right font-semibold">
                    ${(order.total || 0).toLocaleString('es-CO')}
                  </td>
                  <td className="px-8 py-5">
                    <select
                      value={order.estado}
                      onChange={e => handleStatusChange(order.id, e.target.value)}
                      className={`text-xs font-medium px-4 py-1 rounded-3xl ${
                        order.estado === 'pagado' ? 'bg-emerald-100 text-emerald-700' :
                        order.estado === 'parcial' ? 'bg-amber-100 text-amber-700' :
                        'bg-orange-100 text-orange-700'
                      }`}
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="parcial">Parcial</option>
                      <option value="pagado">Pagado</option>
                    </select>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex gap-2">
                      <button
                        onClick={() => generatePDF('factura', order, order.customers, order.order_items || [])}
                        className="text-xs bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-2xl"
                      >
                        PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
