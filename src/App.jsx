// src/App.jsx
import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from './lib/supabase'
import CategoryFilter from './components/CategoryFilter'
import ProductList from './components/ProductList'
import Cart from './components/Cart'
import CustomerForm from './components/CustomerForm'
import Dashboard from './components/Dashboard'
import { generatePDF } from './lib/pdf.js'

const AppContext = createContext()
export const useApp = () => useContext(AppContext)

function App() {
  const [view, setView] = useState('pos')
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [cart, setCart] = useState([])
  const [customer, setCustomer] = useState(null)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [discount, setDiscount] = useState({ type: 'percent', value: 0 })

  // Persistencia del carrito y cliente
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart')
      const savedCustomer = localStorage.getItem('customer')
      if (savedCart) setCart(JSON.parse(savedCart))
      if (savedCustomer) setCustomer(JSON.parse(savedCustomer))
    } catch (e) {
      localStorage.removeItem('cart')
      localStorage.removeItem('customer')
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    if (customer) localStorage.setItem('customer', JSON.stringify(customer))
    else localStorage.removeItem('customer')
  }, [customer])

  // Cargar categorías y productos
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const { data: cats } = await supabase
          .from('categories')
          .select('*')
          .order('name')

        const { data: prods } = await supabase
          .from('products')
          .select('*, categories(name)')
          .order('nombre')

        setCategories([{ id: 'all', name: 'Todos' }, ...(cats || [])])
        setProducts(prods || [])
      } catch (err) {
        console.error('Error cargando datos:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Funciones del carrito
  const addToCart = (product) => {
    const existing = cart.find(item => item.product_id === product.id)
    const newQty = existing ? existing.cantidad + 1 : 1

    if (newQty > product.stock) return

    if (existing) {
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, cantidad: newQty, subtotal: newQty * product.precio_venta }
          : item
      ))
    } else {
      setCart([...cart, {
        product_id: product.id,
        nombre: product.nombre,
        precio_unitario: product.precio_venta,
        cantidad: 1,
        subtotal: product.precio_venta,
        stock: product.stock,
      }])
    }
  }

  const updateCartQty = (productId, newQty) => {
    if (newQty < 1) return removeFromCart(productId)
    const product = products.find(p => p.id === productId)
    if (product && newQty > product.stock) return
    setCart(cart.map(item =>
      item.product_id === productId
        ? { ...item, cantidad: newQty, subtotal: newQty * item.precio_unitario }
        : item
    ))
  }

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product_id !== productId))
  }

  const clearCart = () => {
    setCart([])
    setCustomer(null)
    setDiscount({ type: 'percent', value: 0 })
    localStorage.removeItem('cart')
    localStorage.removeItem('customer')
  }

  // Totales
  const cartTotal = cart.reduce((acc, item) => acc + item.subtotal, 0)
  let finalTotal = cartTotal
  if (discount.type === 'percent') finalTotal = cartTotal * (1 - discount.value / 100)
  else if (discount.type === 'fixed') finalTotal = Math.max(0, cartTotal - discount.value)

  // Crear pedido con pago inicial
  const createOrder = async (initialPayment = 0, paymentMethod = 'efectivo') => {
    if (cart.length === 0) return { error: 'El carrito está vacío' }
    if (!customer) return { error: 'Selecciona un cliente' }

    setLoading(true)
    try {
      // Calcular estado según pago inicial
      const estado = initialPayment <= 0
        ? 'pendiente'
        : initialPayment >= finalTotal
          ? 'pagado'
          : 'parcial'

      // Crear orden
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({ cliente_id: customer.id, total: finalTotal, estado })
        .select()
        .single()

      if (orderErr) throw orderErr

      // Insertar items
      await supabase.from('order_items').insert(
        cart.map(item => ({
          order_id: order.id,
          product_id: item.product_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          subtotal: item.subtotal,
        }))
      )

      // Registrar pago inicial si hay monto
      if (initialPayment > 0) {
        await supabase.from('payments').insert({
          order_id: order.id,
          monto: initialPayment,
          metodo: paymentMethod,
          fecha_pago: new Date().toISOString(),
        })
      }

      // Actualizar stock
      for (const item of cart) {
        const product = products.find(p => p.id === item.product_id)
        if (product) {
          await supabase
            .from('products')
            .update({ stock: product.stock - item.cantidad })
            .eq('id', item.product_id)
        }
      }

      setCurrentOrder(order)

      // WhatsApp solo si tiene teléfono
      if (customer.telefono) {
        const phone = customer.telefono.replace(/\D/g, '')
        const message = `Pedido #${order.id}\nCliente: ${customer.nombre}\nTotal: $${finalTotal.toLocaleString('es-CO')}\nPagado: $${initialPayment.toLocaleString('es-CO')}\nSaldo: $${(finalTotal - initialPayment).toLocaleString('es-CO')}\nProductos:\n${cart.map(i => `${i.cantidad} × ${i.nombre}`).join('\n')}`
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')
      }

      clearCart()
      return { success: true, order }
    } catch (err) {
      return { error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const contextValue = {
    categories,
    products,
    selectedCategory,
    setSelectedCategory,
    cart,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    customer,
    setCustomer,
    cartTotal,
    finalTotal,
    discount,
    setDiscount,
    createOrder,
    loading,
    showCustomerModal,
    setShowCustomerModal,
    view,
    setView,
    generatePDF,
    currentOrder,
    setCurrentOrder,
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-slate-100">

        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

            {/* Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <img src="/logo.png" alt="Dispromax" className="w-9 h-9 rounded-2xl" />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-primary tracking-tight leading-none">
                  Dispromax
                </h1>
                <p className="text-xs text-slate-400">Gestión de pedidos</p>
              </div>
            </div>

            {/* Nav */}
            <div className="flex gap-1 bg-slate-100 rounded-2xl p-1">
              <button
                onClick={() => setView('pos')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  view === 'pos' ? 'bg-white shadow text-primary' : 'text-slate-500'
                }`}
              >
                📦 Pedido
              </button>
              <button
                onClick={() => setView('dashboard')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  view === 'dashboard' ? 'bg-white shadow text-primary' : 'text-slate-500'
                }`}
              >
                📊 Dashboard
              </button>
            </div>

            {/* Cliente activo */}
            <button
              onClick={() => setShowCustomerModal(true)}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-2xl transition-all flex-shrink-0 ${
                customer
                  ? 'bg-primary/10 text-primary'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              👤
              <span className="hidden sm:inline truncate max-w-[120px]">
                {customer ? customer.nombre : 'Cliente'}
              </span>
              {cart.length > 0 && (
                <span className="bg-primary text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.reduce((s, i) => s + i.cantidad, 0)}
                </span>
              )}
            </button>

          </div>
        </header>

        {/* Contenido */}
        <div className="max-w-screen-2xl mx-auto">
          {view === 'pos' ? (
            <div className="flex flex-col lg:flex-row h-[calc(100vh-57px)]">

              {/* Catálogo */}
              <div className="flex-1 flex flex-col border-r overflow-hidden">
                <CategoryFilter />
                <div className="flex-1 overflow-auto p-4">
                  {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-3xl h-40 animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <ProductList />
                  )}
                </div>
              </div>

              {/* Carrito */}
              <div className="w-full lg:w-96 flex flex-col bg-white border-t lg:border-t-0">
                <Cart />
              </div>

            </div>
          ) : (
            <Dashboard />
          )}
        </div>

        <CustomerForm />
      </div>
    </AppContext.Provider>
  )
}

export default App
