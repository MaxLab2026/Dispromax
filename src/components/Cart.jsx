// src/components/Cart.jsx
import { useApp } from '../App'

export default function Cart() {
  const { 
  cart, 
  updateCartQty, 
  removeFromCart, 
  cartTotal, 
  finalTotal, 
  discount, 
  setDiscount, 
  customer, 
  createOrder,
  loading,
  currentOrder,
  setCurrentOrder,
  generatePDF,
  clearCart
} = useApp()
const handleDiscountChange = (e) => {
    const value = parseFloat(e.target.value) || 0
    setDiscount(prev => ({ ...prev, value }))
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b flex items-center justify-between bg-white sticky top-0">
        <h2 className="font-semibold text-xl">Carrito ({cart.length})</h2>
        <button
          onClick={() => { if (confirm('¿Vaciar carrito?')) clearCart() }}
          className="text-red-500 text-sm font-medium"
        >
          Vaciar
        </button>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4 space-y-4">
        {cart.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-300 text-center">
            <div>
              <p className="text-6xl mb-3">🛒</p>
              <p className="font-medium">Tu carrito está vacío</p>
              <p className="text-sm">Agrega productos desde la lista</p>
            </div>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.product_id} className="flex gap-4 bg-slate-50 rounded-3xl p-4">
              <div className="flex-1">
                <p className="font-medium">{item.nombre}</p>
                <p className="text-xs text-slate-400">${item.precio_unitario} c/u</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateCartQty(item.product_id, item.cantidad - 1)}
                  className="w-8 h-8 rounded-2xl bg-white shadow flex items-center justify-center text-xl leading-none"
                >
                  ➖
                </button>
                <span className="font-mono w-8 text-center">{item.cantidad}</span>
                <button
                  onClick={() => updateCartQty(item.product_id, item.cantidad + 1)}
                  className="w-8 h-8 rounded-2xl bg-white shadow flex items-center justify-center text-xl leading-none"
                >
                  ➕
                </button>
              </div>
              <div className="text-right">
                <p className="font-semibold">${item.subtotal.toLocaleString('es-CO')}</p>
                <button onClick={() => removeFromCart(item.product_id)} className="text-xs text-red-400">Eliminar</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Descuento */}
      <div className="p-6 border-t bg-white">
        <div className="flex gap-3">
          <select 
            value={discount.type}
            onChange={e => setDiscount({ ...discount, type: e.target.value })}
            className="bg-slate-100 rounded-2xl px-4 text-sm"
          >
            <option value="percent">% Descuento</option>
            <option value="fixed">$ Fijo</option>
          </select>
          <input
            type="number"
            value={discount.value}
            onChange={handleDiscountChange}
            placeholder="0"
            className="flex-1 bg-slate-100 rounded-2xl px-4 py-3 text-right font-medium"
          />
        </div>
      </div>

      {/* Totales */}
      <div className="px-6 py-6 border-t bg-white">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">Subtotal</span>
          <span>${cartTotal.toLocaleString('es-CO')}</span>
        </div>
        <div className="flex justify-between font-semibold text-xl">
          <span>Total</span>
          <span className="text-primary">${finalTotal.toLocaleString('es-CO')}</span>
        </div>
      </div>

      {/* Acciones */}
      <div className="p-6 border-t bg-white space-y-3">
        {!customer && (
          <button
            onClick={() => { /* modal se abre desde header */ }}
            className="w-full btn-secondary"
          >
            👤 Seleccionar cliente
          </button>
        )}
        
        <button
          onClick={createOrder}
          disabled={cart.length === 0 || loading}
          className="w-full btn-primary text-lg flex items-center justify-center gap-2"
        >
          {loading ? 'Procesando...' : '✅ Crear Pedido'}
        </button>
        
        {currentOrder && (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={() => generatePDF('orden', currentOrder, customer, cart)}
              className="bg-emerald-100 text-emerald-700 py-3 rounded-2xl"
            >
              Orden
            </button>
            <button
              onClick={() => generatePDF('factura', currentOrder, customer, cart)}
              className="bg-emerald-100 text-emerald-700 py-3 rounded-2xl"
            >
              Factura
            </button>
            <button
              onClick={() => generatePDF('nota', currentOrder, customer, cart)}
              className="bg-emerald-100 text-emerald-700 py-3 rounded-2xl"
            >
              Nota entrega
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
