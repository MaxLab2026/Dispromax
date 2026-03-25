import { useApp } from '../App'
import { useState } from 'react'

export default function ProductList() {
  const { products, selectedCategory, addToCart, updateCartQty, removeFromCart, cart } = useApp()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProducts = products
    .filter(p => selectedCategory === 'all' || p.category_id === selectedCategory)
    .filter(p => p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div>
      {/* Barra de búsqueda */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="bg-slate-100 rounded-2xl px-5 py-3 w-full"
        />
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredProducts.map(product => {
          const cartItem = cart.find(item => item.product_id === product.id)
          const cartQty = cartItem?.cantidad || 0
          const stockLow = (product.stock || 0) <= (product.stock_min || 5)
          const outOfStock = (product.stock || 0) === 0

          return (
            <div key={product.id} className="bg-white rounded-3xl p-4 shadow flex flex-col">
              
              {/* Nombre y categoría */}
              <div className="flex-1 mb-3">
                <h3 className="font-semibold text-base leading-tight">
                  {product.nombre || 'Sin nombre'}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  {product.categories?.name || 'Sin categoría'}
                </p>
              </div>

              {/* Precio y stock */}
              <div className="flex justify-between items-end mb-4">
                <p className="text-2xl font-bold text-primary">
                  ${(product.precio_venta || 0).toLocaleString('es-CO')}
                </p>
                <p className={`text-xs ${stockLow ? 'text-red-500' : 'text-emerald-500'}`}>
                  {outOfStock ? 'Agotado' : `Stock: ${product.stock} ${product.unidad || 'und'}`}
                </p>
              </div>

              {/* Botón o control de cantidad */}
              {outOfStock ? (
                <button disabled className="btn-primary mt-auto text-sm py-3 opacity-50 cursor-not-allowed">
                  Agotado
                </button>
              ) : cartQty > 0 ? (
                <div className="flex items-center justify-between bg-slate-100 rounded-2xl px-2 py-2 mt-auto">
                  <button
                    onClick={() => updateCartQty(product.id, cartQty - 1)}
                    className="w-9 h-9 rounded-xl bg-white shadow text-xl font-bold text-slate-600 flex items-center justify-center active:scale-95 transition-all"
                  >
                    −
                  </button>
                  <span className="font-bold text-lg text-primary w-8 text-center">
                    {cartQty}
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    className="w-9 h-9 rounded-xl bg-primary shadow text-xl font-bold text-white flex items-center justify-center active:scale-95 transition-all"
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addToCart(product)}
                  className="btn-primary mt-auto text-sm py-3 active:scale-95 transition-all"
                >
                  Agregar
                </button>
              )}

            </div>
          )
        })}

        {filteredProducts.length === 0 && (
          <div className="col-span-full text-center py-20 text-slate-400">
            No hay productos en esta categoría
          </div>
        )}
      </div>
    </div>
  )
}
