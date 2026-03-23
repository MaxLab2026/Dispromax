// 🔥 NIVEL PRO - APP DISTRIBUIDORA (UX + CLIENTES + CATEGORÍAS)

const supabaseUrl = "https://cosxgumrxgihkeszvgwu.supabase.co";
const supabaseKey = "sb_publishable_B58gh4o9vrHK58hNramtGw_yRck0jwX";

import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(supabaseUrl, supabaseKey);

const app = document.getElementById("app");

let carrito = [];
let productos = [];
let clientes = [];
let clienteSeleccionado = null;

function layout(content) {
  app.innerHTML = `
    <div style="font-family:sans-serif;padding:15px;max-width:500px;margin:auto;">
      <h2 style="text-align:center;">Distribuidora</h2>
      ${content}
    </div>
  `;
}

async function init() {
  const { data: prod } = await supabase.from("products").select("*");
  const { data: cli } = await supabase.from("customers").select("*");

  productos = prod || [];
  clientes = cli || [];

  render();
}

function render() {
  layout(`
    ${renderClientes()}
    ${renderProductos()}
    ${renderCarrito()}
  `);
}

function renderClientes() {
  return `
    <h3>Cliente</h3>
    <select onchange="seleccionarCliente(this.value)" style="width:100%;padding:10px;margin-bottom:10px;">
      <option value="">Seleccionar cliente</option>
      ${clientes
        .map(
          (c) => `<option value="${c.id}">${c.name}</option>`
        )
        .join("")}
    </select>
  `;
}

window.seleccionarCliente = (id) => {
  clienteSeleccionado = id;
};

function renderProductos() {
  return `
    <h3>Productos</h3>
    <input placeholder="Buscar..." oninput="buscar(this.value)" style="width:100%;padding:10px;margin-bottom:10px;" />
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
      ${productos
        .map(
          (p) => `
        <div onclick="agregar('${p.id}')"
          style="border-radius:10px;padding:12px;background:#f5f5f5;">
          <strong>${p.name}</strong><br>
          <span>$${p.price}</span>
        </div>
      `
        )
        .join("")}
    </div>
  `;
}

window.buscar = (texto) => {
  const filtrados = productos.filter((p) =>
    p.name.toLowerCase().includes(texto.toLowerCase())
  );

  document.querySelector("div[style*='grid']").innerHTML = filtrados
    .map(
      (p) => `
    <div onclick="agregar('${p.id}')"
      style="border-radius:10px;padding:12px;background:#f5f5f5;">
      <strong>${p.name}</strong><br>
      <span>$${p.price}</span>
    </div>
  `
    )
    .join("");
};

window.agregar = (id) => {
  const p = productos.find((x) => x.id === id);

  const existe = carrito.find((i) => i.id === id);

  if (existe) {
    existe.cantidad++;
  } else {
    carrito.push({ ...p, cantidad: 1 });
  }

  render();
};

function renderCarrito() {
  const total = carrito.reduce((acc, i) => acc + i.price * i.cantidad, 0);

  return `
    <h3>Carrito</h3>
    ${carrito
      .map(
        (i, index) => `
      <div style="display:flex;justify-content:space-between;background:#eee;padding:8px;margin:5px 0;border-radius:8px;">
        <div>
          ${i.name}<br>
          <small>x${i.cantidad}</small>
        </div>
        <div>
          $${i.price * i.cantidad}
          <button onclick="eliminar(${index})">❌</button>
        </div>
      </div>
    `
      )
      .join("")}

    <h2>Total: $${total}</h2>

    <button onclick="guardarPedido()"
      style="width:100%;padding:15px;background:black;color:white;border:none;border-radius:10px;">
      Guardar Pedido
    </button>
  `;
}

window.eliminar = (index) => {
  carrito.splice(index, 1);
  render();
};

window.guardarPedido = async () => {
  if (!clienteSeleccionado)
    return alert("Selecciona un cliente");

  if (carrito.length === 0)
    return alert("Carrito vacío");

  const total = carrito.reduce((acc, i) => acc + i.price * i.cantidad, 0);

  const { data: order } = await supabase
    .from("orders")
    .insert([
      {
        customer_id: clienteSeleccionado,
        total,
        status: "CONFIRMADO",
      },
    ])
    .select()
    .single();

  const items = carrito.map((i) => ({
    order_id: order.id,
    product_id: i.id,
    quantity: i.cantidad,
    price: i.price,
  }));

  await supabase.from("order_items").insert(items);

  for (const i of carrito) {
    await supabase
      .from("products")
      .update({ stock: i.stock - i.cantidad })
      .eq("id", i.id);
  }

  alert("Pedido guardado");

  carrito = [];
  render();
};

init();
