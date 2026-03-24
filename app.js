import { supabase } from './supabase.js'

export async function rProductos() {
  console.log("Cargando productos desde Supabase...")
  const { data, error } = await supabase.from('products').select('*')
  if (error) {
    console.error("Error:", error)
    return
  }
  const cont = document.getElementById('prod-list')
  cont.innerHTML = data.map(p => `
    <div class="prod-card">
      <div class="prod-nombre">${p.nombre}</div>
      <div class="prod-precio">Venta: $${p.precio_venta}</div>
      <div class="prod-stock">Stock: ${p.stock}</div>
    </div>
  `).join('')
}
