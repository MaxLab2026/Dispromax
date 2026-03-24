// src/components/ProductList.jsx
import { useApp } from '../App'

export default function ProductList() {
  const { products, selectedCategory, addToCart } = useApp()

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category_id === selectedCategory)

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {filteredProducts.map(product => (
        <div key={product.id} className="card p-4 flex flex-col">
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
                (product.stock || 0) <= (product.stock_min || 5) 
                  ? 'text-red-500' 
                  : 'text-emerald-500'
              }`}>
                Stock: {product.stock || 0} {product.unidad || 'und'}
              </p>
            </div>
          </div>

          <button
            onClick={() => addToCart(product)}
            className="btn-primary mt-auto text-sm py-3"
          >
            ➕ Agregar al carrito
          </button>
        </div>
      ))}

      {filteredProducts.length === 0 && (
        <div className="col-span-full text-center py-20 text-slate-400">
          No hay productos en esta categoría
        </div>
      )}
    </div>
  )
}
