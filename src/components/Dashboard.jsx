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
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  // Modal de pagos
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('efectivo')

  // Expandir historial de pagos
  const [expandedOrderId, setExpandedOrderId] = useState(null)

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
        ),
        payments (monto, fecha_pago, metodo)
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
      result = result.filter(o => {
        const totalPagado = o.payments?.reduce((acc, p) => acc + p.monto, 0) || 0
        const saldoPendiente = (o.total || 0) - totalPagado
        const estado = saldoPendiente === 0 ? 'pagado' :
                       saldoPendiente < (o.total || 0) ? 'parcial' : 'pendiente'
        return estado === statusFilter
      })
    }
    if (searchTerm) {
      result = result.filter(o =>
        (o.customers?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.toString().includes(searchTerm)
      )
    }

    setFilteredOrders(result)
  }, [orders, dateFrom, dateTo, statusFilter, searchTerm])

  // Estadísticas dinámicas
  const totalVentas = filteredOrders.reduce((acc, o) => {
    const totalPagado = o.payments?.reduce((sum, p) => sum + p.monto, 0) || 0
    return acc + totalPagado
  }, 0)
  const totalPedidos = filteredOrders.length
  const pendientes = filteredOrders.filter(o => {
    const totalPagado = o.payments?.reduce((sum, p) => sum + p.monto, 0) || 0
    return totalPagado === 0
  }).length
  const pagados = filteredOrders.filter(o => {
    const totalPagado = o.payments?.reduce((sum, p) => sum + p.monto, 0) || 0
    return totalPagado >= (o.total || 0)
  }).length

  // Registrar pago
  const handleAddPayment = async () => {
    if (!currentOrder) return
    if (paymentAmount <= 0) {
      alert('Monto inválido')
      return
    }

    await supabase.from('payments').insert({
      order_id: currentOrder.id,
      monto: paymentAmount,
      metodo: paymentMethod
    })

    setShowPaymentModal(false)
    setPaymentAmount(0)
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
        <input
          type="text"
          placeholder="Buscar por cliente o pedido..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="bg-slate-100 rounded-2xl px-5 py-3 flex-1"
        />
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
                <th className="text-right px-8 py-5">Pagado</th>
                <th className="text-right px-8 py-5">Saldo</th>
                <th className="px-8 py-5">Estado</th>
                <th className="px-8 py-5 w-40">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => {
                const totalPagado = order.payments?.reduce((acc, p) => acc + p.monto, 0) || 0
                const saldoPendiente = (order.total || 0) - totalPagado
                const estado = saldoPendiente === 0 ? 'pagado' :
                               saldoPendiente < (order.total || 0) ? 'parcial' : 'pendiente'

                return (
                  <>
                    <tr key={order.id} className="border-t hover:bg-slate-50">
                      <td className="px-8 py-5 font-medium">#{order.id}</td>
                      <td className="px-8 py-5">{order.customers?.nombre || '
