// src/components/Cart.jsx
import { useState } from 'react'
import { useApp } from '../App'

export default function Cart() {
  const {
    cart, customer, finalTotal, cartTotal, discount, setDiscount,
    updateCartQty, removeFromCart, createOrder, setShowCustomerModal
  } = useApp()

  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [initialPayment, setInitialPayment] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('efectivo')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const handleOpenPayment = () => {
    if (cart.length === 0) return
    if (!customer) {
      setShowCustomerModal(true)
      return
    }
    setInitialPayment('')
    setError('')
    setShowPaymentModal(true)
  }

  const handleCreateOrder = async () => {
    const monto = parseFloat(initialPayment) || 0
    if (monto < 0 || monto > finalTotal) {
      setError('El monto no puede superar el total')
      return
    }
    setCreating(true)
    setError('')
    const result = await createOrder(monto, paymentMethod)
    setCreating(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setShowPaymentModal(false)
    setInitialPayment('')
  }

  const saldo = finalTotal - (parseFloat(initialPayment) || 0)

  return (
    <div className="flex flex-col h-full">

      {/* Header del carrito */}
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <h2 className="font-semibold text-lg">
          Carrito
          {cart.length > 0 && (
            <span className="ml-2 text-sm text-slate-400 font-normal">
              {cart.reduce((s, i) => s + i.cantidad, 0)} items
            </span>
          )}
        </h2>
        {customer && (
          <span className="text-sm text-primary font-medium truncate max-w-[140px]">
            👤 {customer.nombre}
          </span>
        )}
      </div>

      {/* Items del carrito */}
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-300 py-16">
            <p className="text-5xl mb-3">🛒</p>
            <p className="text-sm">El carrito está vacío</p>
            <p className="text-xs mt-1">Agrega productos desde el catálogo</p>
          </div>
        ) : (
          cart.map(item => (
            <div
              key={item.product_id}
              className="bg-slate-50 rounded-2xl px-4 py-3 flex items-center gap-3"
            >
              {/* Nombre y precio unitario */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.nombre}</p>
                <p className="text-xs text-slate-400">
                  ${item.precio_unitario.toLocaleString('es-CO')} c/u
                </p>
              </div>

              {/* Control cantidad */}
              <div className="flex items-center gap-1 bg-white rounded-xl border px-1 py-1">
                <button
                  onClick={() => updateCartQty(item.product_id, item.cantidad - 1)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 font-bold transition-all active:scale-90"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-bold text-primary">
                  {item.cantidad}
                </span>
                <button
                  onClick={() => updateCartQty(item.product_id, item.cantidad + 1)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 font-bold transition-all active:scale-90"
                >
                  +
                </button>
              </div>

              {/* Subtotal */}
              <p className="text-sm font-bold text-primary w-20 text-right flex-shrink-0">
                ${item.subtotal.toLocaleString('es-CO')}
              </p>

              {/* Eliminar */}
              <button
                onClick={() => removeFromCart(item.product_id)}
                className="text-slate-300 hover:text-red-400 transition-colors text-lg leading-none flex-shrink-0"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {/* Descuento y totales */}
      {cart.length > 0 && (
        <div className="border-t px-4 py-4 space-y-3">

          {/* Descuento */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">Descuento</span>
            <div className="flex gap-1">
              {[0, 5, 10, 15, 20].map(val => (
                <button
                  key={val}
                  onClick={() => setDiscount({ type: 'percent', value: val })}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all ${
                    discount.type === 'percent' && discount.value === val
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="space-y-1">
            {discount.value > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="text-slate-400">${cartTotal.toLocaleString('es-CO')}</span>
              </div>
            )}
            {discount.value > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-emerald-500">Descuento {discount.value}%</span>
                <span className="text-emerald-500">
                  -${(cartTotal - finalTotal).toLocaleString('es-CO')}
                </span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">${finalTotal.toLocaleString('es-CO')}</span>
            </div>
          </div>

          {/* Botón crear pedido */}
          <button
            onClick={handleOpenPayment}
            disabled={cart.length === 0}
            className="w-full btn-primary py-4 text-base font-semibold active:scale-95 transition-all"
          >
            Crear pedido
          </button>
        </div>
      )}

      {/* Modal de pago — bottom sheet */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 bg-black/60 z-[9999] flex items-end justify-center"
          onClick={() => !creating && setShowPaymentModal(false)}
        >
          <div
            className="bg-white rounded-t-3xl w-full max-w-lg pb-10"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-slate-200 rounded-full" />
            </div>

            <div className="px-6 pb-2">
              <h2 className="text-xl font-semibold mb-1">Registrar pago</h2>
              <p className="text-slate-400 text-sm mb-5">
                Cliente: {customer?.nombre}
              </p>

              {/* Resumen */}
              <div className="bg-slate-50 rounded-2xl px-4 py-3 mb-5 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Total del pedido</span>
                  <span className="font-bold">${finalTotal.toLocaleString('es-CO')}</span>
                </div>
                {parseFloat(initialPayment) > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-500">Pago inicial</span>
                      <span className="text-emerald-500 font-bold">
                        ${parseFloat(initialPayment).toLocaleString('es-CO')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-1 mt-1">
                      <span className={saldo > 0 ? 'text-amber-500' : 'text-emerald-500'}>
                        {saldo > 0 ? 'Saldo pendiente' : 'Pagado completo'}
                      </span>
                      <span className={`font-bold ${saldo > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
                        ${saldo.toLocaleString('es-CO')}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Monto */}
              <div className="mb-4">
                <label className="text-xs text-slate-400 mb-1 block">
                  Monto recibido
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={initialPayment}
                  onChange={e => {
                    setInitialPayment(e.target.value)
                    setError('')
                  }}
                  className="w-full rounded-2xl bg-slate-100 px-5 py-4 text-xl font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  autoFocus
                />
              </div>

              {/* Método de pago */}
              <div className="mb-4">
                <label className="text-xs text-slate-400 mb-2 block">
                  Método de pago
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'efectivo', label: '💵 Efectivo' },
                    { value: 'transferencia', label: '🏦 Transferencia' },
                    { value: 'tarjeta', label: '💳 Tarjeta' },
                  ].map(m => (
                    <button
                      key={m.value}
                      onClick={() => setPaymentMethod(m.value)}
                      className={`py-3 rounded-2xl text-sm font-medium transition-all border ${
                        paymentMethod === m.value
                          ? 'bg-primary text-white border-primary'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="text-red-500 text-sm mb-3">{error}</p>
              )}

              {/* Botones */}
              <div className="flex gap-3">
                <button
                  onClick={handleCreateOrder}
                  disabled={creating}
                  className="flex-1 btn-primary py-4 text-base font-semibold active:scale-95 transition-all disabled:opacity-50"
                >
                  {creating ? 'Guardando...' : 'Confirmar pedido'}
                </button>
                <button
                  onClick={() => !creating && setShowPaymentModal(false)}
                  disabled={creating}
                  className="flex-1 btn-secondary py-4 text-base disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>

              {/* Sin pago */}
              <button
                onClick={() => {
                  setInitialPayment('0')
                  setTimeout(() => handleCreateOrder(), 0)
                }}
                disabled={creating}
                className="w-full mt-3 text-sm text-slate-400 py-2 hover:text-slate-600 transition-colors disabled:opacity-50"
              >
                Crear sin pago por ahora →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
