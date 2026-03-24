import { useApp } from '../App'

export default function CategoryFilter() {
  const { categories, selectedCategory, setSelectedCategory } = useApp()

  return (
    <div className="px-6 pt-6 pb-4 border-b bg-white sticky top-0 z-40">
      <h2 className="text-xs uppercase tracking-widest text-slate-400 mb-3">Categorías</h2>
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-6 py-3 whitespace-nowrap rounded-3xl text-sm font-medium transition-all flex-shrink-0 ${
              selectedCategory === cat.id 
                ? 'bg-primary text-white shadow-lg' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  )
}
