// app.js
import { supabase } from './supabase.js'

/* ============================
   PRODUCTOS
============================ */
export async function rProductos() {
  console.log("Cargando productos desde Supabase...")
  const { data, error } = await supabase.from('products').select('*')
  if (error) {
    console.error("Error al traer productos:", error)
    return
  }
  const cont = document.getElementById('prod-list')
  if (!cont) return
  cont.innerHTML = data.map(p => `
    <div class="prod-card">
      <div class="prod-img">${p.foto_url ? `<img src="${p.foto_url}"/>` : '📦'}</div>
      <div class="prod-info">
        <div class="prod-nombre">${p.nombre}</div>
        <div class="prod-codigo">${p.codigo || ''}</div>
        <div class="prod-precios">
          <span class="prod-precio">Compra: $${p.precio_compra}</span>
          <span class="prod-precio">Venta: $${p.precio_venta}</span>
        </div>
        <div class="prod-stock">Stock: ${p.stock}</div>
      </div>
    </div>
  `).join('')
}

/* ============================
   CLIENTES
============================ */
export async function rClientes() {
  console.log("Cargando clientes desde Supabase...")
  const { data, error } = await supabase.from('customers').select('*')
  if (error) {
    console.error("Error al traer clientes:", error)
    return
  }
  const cont = document.getElementById('cli-list')
  if (!cont) return
  cont.innerHTML = data.map(c => `
    <div class="row">
      <div class="row-top">
        <div>
          <div class="row-name">${c.nombre}</div>
          <div class="row-meta">${c.telefono || ''} - ${c.direccion || ''}</div>
        </div>
      </div>
    </div>
  `).join('')
}

/* ============================
   GUARDAR PRODUCTO
============================ */
export async function guardarProducto() {
  const nuevo = {
    codigo: document.getElementById('mp-codigo').value,
    nombre: document.getElementById('mp-nombre').value,
    precio_compra: parseFloat(document.getElementById('mp-pcompra').value),
    precio_venta: parseFloat(document.getElementById('mp-pventa').value),
    stock: parseInt(document.getElementById('mp-stock').value),
    proveedor: document.getElementById('mp-prov').value,
    descripcion: document.getElementById('mp-desc').value
  }

  const { error } = await supabase.from('products').insert([nuevo])
  if (error) {
    console.error("Error al guardar producto:", error)
    alert("Error al guardar producto")
    return
  }
  alert("Producto guardado correctamente")
  rProductos()
}

/* ============================
   GUARDAR CLIENTE
============================ */
export async function guardarCliente() {
  const nuevo = {
    nombre: document.getElementById('mc-nombre').value,
    telefono: document.getElementById('mc-tel').value,
    direccion: document.getElementById('mc-dir').value,
    notas: document.getElementById('mc-notas').value
  }

  const { error } = await supabase.from('customers').insert([nuevo])
  if (error) {
    console.error("Error al guardar cliente:", error)
    alert("Error al guardar cliente")
    return
  }
  alert("Cliente guardado correctamente")
  rClientes()
}

/* ============================
   CONFIRMAR PEDIDO
============================ */
export async function confirmarPedido() {
  const pedido = {
    cliente: document.getElementById('ped-cliente').value,
    fecha_entrega: document.getElementById('ped-fentrega').value,
    notas: document.getElementById('cart-notas').value,
    total: document.getElementById('cart-total').innerText.replace('$','')
  }

  const { error } = await supabase.from('orders').insert([pedido])
  if (error) {
    console.error("Error al guardar pedido:", error)
    alert("Error al guardar pedido")
    return
  }
  alert("Pedido confirmado correctamente")
}
