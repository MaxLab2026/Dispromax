// src/components/CategoryFilter.jsx
import { useApp } from '../App'

export default function CategoryFilter() {
  const { categories, selectedCategory, setSelectedCategory, products } = useApp()

  // Contar productos por categoría
  const countByCategory = (catId) =>
    products.filter(p => p.category_id === catId).length

  return (
    <div className="px-6 pt-6 pb-4 border-b bg-white sticky top-0 z-40">
      <h2 className="text-xs uppercase tracking-widest text-slate-400 mb-3">Categorías</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {/* Botón Todos */}
        <button
          onClick={() => setSelectedCategory('all')}
          aria-pressed={selectedCategory === 'all'}
          className={`px-6 py-3 whitespace-nowrap rounded-3xl text-sm font-medium transition-all flex-shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-primary text-white shadow-lg'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {selectedCategory === 'all' && '✔️ '}
          Todos ({products.length})
        </button>

        {categories?.length > 0 ? (
          categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              aria-pressed={selectedCategory === cat.id}
              className={`px-6 py-3 whitespace-nowrap rounded-3xl text-sm font-medium transition-all flex-shrink-0 ${
                selectedCategory === cat.id 
                  ? 'bg-primary text-white shadow-lg'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {selectedCategory === cat.id && '✔️ '}
              {cat.name || cat.nombre || 'Sin nombre'} ({countByCategory(cat.id)})
            </button>
          ))
        ) : (
          <span className="text-slate-400 text-sm">No hay categorías</span>
        )}
      </div>
    </div>
  )
}
