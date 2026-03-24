import { useApp } from '../App'
import { useState } from 'react'

export default function ProductList() {
  const { products, selectedCategory, addToCart, cart } = useApp()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('nombre')

  const filteredProducts = products
    .filter(p => selectedCategory === 'all' || p.category_id === selectedCategory)
    .filter(p => p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()))

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'precio') return a.precio_venta - b.precio_venta
    if (sortBy === 'stock') return a.stock - b.stock
    return a.nombre.localeCompare(b.nombre)
  })

  return (
    <div>
      {/* Barra de búsqueda y ordenamiento */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="bg-slate-100 rounded-2xl px-5 py-3 flex-1"
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="bg-slate-100 rounded-2xl px-5 py-3"
        >
          <option value="nombre">Ordenar por nombre</option>
          <option value="precio">Ordenar por precio</option>
          <option value="stock">Ordenar por stock</option>
        </select>
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {sortedProducts.map(product => {
          const inCart = cart.some(item => item.id === product.id)
          const stockLow = (product.stock || 0) <= (product.stock_min || 5)

          return (
            <div key={product.id} className="card p-4 flex flex-col">
              {product.imagen && (
                <img
                  src={product.imagen}
                  alt={product.nombre}
                  className="w-full h-32 object-cover rounded mb-3"
                />
              )}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-base leading-tight pr-2">
                    {product.nombre || 'Sin nombre'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {product.categories?.name || 'Sin categoría'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    ${(product.precio_venta || 0).toLocaleString('es-CO')}
                  </p>
                  <p className={`text-xs mt-1 ${
                    stockLow ? 'text-red-500' : 'text-emerald-500'
                  }`}>
                    Stock: {product.stock || 0} {product.unidad || 'und'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => addToCart(product)}
                disabled={(product.stock || 0) === 0}
                className={`btn-primary mt-auto text-sm py-3 ${
                  product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {product.stock === 0
                  ? 'Agotado'
                  : inCart
                    ? '✔️ En carrito'
                    : '➕ Agregar al carrito'}
              </button>
            </div>
          )
        })}

        {sortedProducts.length === 0 && (
          <div className="col-span-full text-center py-20 text-slate-400">
            No hay productos en esta categoría
          </div>
        )}
      </div>
    </div>
  )
}
