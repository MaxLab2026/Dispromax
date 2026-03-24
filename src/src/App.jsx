import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from './lib/supabase'
import CategoryFilter from './components/CategoryFilter'
import ProductList from './components/ProductList'
import Cart from './components/Cart'
import CustomerForm from './components/CustomerForm'
import Dashboard from './components/Dashboard'
import { generatePDF } from './lib/pdf'

const AppContext = createContext()

export const useApp = () => useContext(AppContext)

function App() {
  const [view, setView] = useState('pos') // 'pos' o 'dashboard'
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [cart, setCart] = useState([])
  const [customer, setCustomer] = useState(null)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [currentOrder, setCurrentOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [discount, setDiscount] = useState({ type: 'percent', value: 0 })

  // Cargar categorías y productos al iniciar
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
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
      setLoading(false)
    }
    fetchData()
  }, [])

  const addToCart = (product) => {
    const existing = cart.find(item => item.product_id === product.id)
    const newQty = existing ? existing.cantidad + 1 : 1

    if (newQty > product.stock) {
      alert(`❌ Stock insuficiente. Solo quedan ${product.stock} unidades.`)
      return
    }

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
        subtotal: product.precio_venta
      }])
    }
  }

  const updateCartQty = (productId, newQty) => {
    if (newQty < 1) return removeFromCart(productId)
    
    const product = products.find(p => p.id === productId)
    if (newQty > product.stock) {
      alert('❌ Stock insuficiente')
      return
    }

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
  }

  const cartTotal = cart.reduce((acc, item) => acc + item.subtotal, 0)
  let finalTotal = cartTotal
  if (discount.type === 'percent') finalTotal = cartTotal * (1 - discount.value / 100)
  else if (discount.type === 'fixed') finalTotal = Math.max(0, cartTotal - discount.value)

  const createOrder = async () => {
    if (cart.length === 0) return alert('❌ El carrito está vacío')
    if (!customer) {
      alert('❌ Selecciona un cliente')
      setShowCustomerModal(true)
      return
    }

    setLoading(true)
    try {
      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          customer_id: customer.id,
          total: finalTotal,
          estado: 'pendiente'
        })
        .select()
        .single()

      if (error) throw error

      const itemsToInsert = cart.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.subtotal
      }))

      await supabase.from('order_items').insert(itemsToInsert)

      alert(`✅ Pedido #${order.id} creado correctamente`)

      const message = `Pedido #${order.id}\nCliente: ${customer.nombre}\nTotal: $${finalTotal.toLocaleString('es-CO')}\nProductos:\n${cart.map(i => `${i.cantidad} × ${i.nombre}`).join('\n')}`
      const phone = customer.telefono.replace(/\D/g, '')
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')

      clearCart()
    } catch (err) {
      alert('Error al crear el pedido: ' + err.message)
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
    generatePDF
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-slate-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Dispromax" className="w-10 h-10 rounded-2xl" />
              <div>
                <h1 className="text-2xl font-bold text-primary tracking-tight">Dispromax</h1>
                <p className="text-xs text-slate-400 -mt-1">Gestión de pedidos</p>
              </div>
            </div>

            <div className="flex gap-2 bg-slate-100 rounded-3xl p-1">
              <button
                onClick={() => setView('pos')}
                className={`px-8 py-2 rounded-3xl text-sm font-medium transition-all ${view === 'pos' ? 'bg-white shadow text-primary' : 'text-slate-500'}`}
              >
                📦 Nuevo Pedido
              </button>
              <button
                onClick={() => setView('dashboard')}
                className={`px-8 py-2 rounded-3xl text-sm font-medium transition-all ${view === 'dashboard' ? 'bg-white shadow text-primary' : 'text-slate-500'}`}
              >
                📊 Dashboard
              </button>
            </div>

            <button
              onClick={() => setShowCustomerModal(true)}
              className="flex items-center gap-2 text-sm font-medium"
            >
              👤 {customer ? customer.nombre : 'Seleccionar cliente'}
            </button>
          </div>
        </header>

        <div className="max-w-screen-2xl mx-auto">
          {view === 'pos' && (
            <div className="flex flex-col lg:flex-row h-[calc(100vh-73px)]">
              <div className="flex-1 flex flex-col border-r">
                <CategoryFilter />
                <div className="flex-1 overflow-auto p-6">
                  <ProductList />
                </div>
              </div>
              <div className="w-full lg:w-96 bg-white border-l flex flex-col">
                <Cart />
              </div>
            </div>
          )}

          {view === 'dashboard' && <Dashboard />}
        </div>

        {showCustomerModal && <CustomerForm />}
      </div>
    </AppContext.Provider>
  )
}

export default App
