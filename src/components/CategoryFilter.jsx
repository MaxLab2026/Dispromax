import { useEffect, useRef } from 'react'
import { useApp } from '../App'

export default function CategoryFilter() {
  const { categories, selectedCategory, setSelectedCategory, products } = useApp()
  const activeRef = useRef(null)

  // Desplaza el botón activo a la vista automáticamente
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [selectedCategory])

  const countByCategory = (catId) =>
    products.filter(p => p.category_id === catId).length

  // Filtrar el botón "Todos" que viene en el array de categories desde App
  const realCategories = categories.filter(c => c.id !== 'all')

  return (
    <div className="px-4 py-3 border-b bg-white sticky top-0 z-40">
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">

        {/* Todos */}
        <button
          ref={selectedCategory === 'all' ? activeRef : null}
          onClick={() => setSelectedCategory('all')}
          className={`px-5 py-2.5 whitespace-nowrap rounded-2xl text-sm font-medium transition-all flex-shrink-0 ${
            selectedCategory === 'all'
              ? 'bg-primary text-white shadow-md'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          Todos
          <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
            selectedCategory === 'all'
              ? 'bg-white/20 text-white'
              : 'bg-slate-200 text-slate-500'
          }`}>
            {products.length}
          </span>
        </button>

        {realCategories.map(cat => {
          const count = countByCategory(cat.id)
          const isActive = selectedCategory === cat.id
          return (
            <button
              key={cat.id}
              ref={isActive ? activeRef : null}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2.5 whitespace-nowrap rounded-2xl text-sm font-medium transition-all flex-shrink-0 ${
                isActive
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {cat.name || cat.nombre || 'Sin nombre'}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          )
        })}

      </div>
    </div>
  )
}
