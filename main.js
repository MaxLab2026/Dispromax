const supabaseUrl = "https://cosxgumrxgihkeszvgwu.supabase.co";
const supabaseKey = "sb_publishable_B58gh4o9vrHK58hNramtGw_yRck0jwX";

import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(supabaseUrl, supabaseKey);

const app = document.getElementById("app");

let carrito = [];

async function cargarProductos() {
  const { data } = await supabase.from("products").select("*");

  app.innerHTML = `
    <h1>Distribuidora</h1>
    <h2>Productos</h2>
    ${data
      .map(
        (p) => `
      <button onclick="agregar('${p.id}', '${p.name}', ${p.price}, ${p.stock})">
        ${p.name} - $${p.price}
      </button>
    `
      )
      .join("")}
    <h2>Carrito</h2>
    <div id="carrito"></div>
    <h3 id="total"></h3>
    <button onclick="guardarPedido()">Guardar Pedido</button>
  `;
}

window.agregar = (id, name, price, stock) => {
  const existe = carrito.find((i) => i.id === id);

  if (existe) {
    existe.cantidad++;
  } else {
    carrito.push({ id, name, price, stock, cantidad: 1 });
  }

  renderCarrito();
};

function renderCarrito() {
  const div = document.getElementById("carrito");

  div.innerHTML = carrito
    .map((i) => `${i.name} x${i.cantidad}`)
    .join("<br>");

  const total = carrito.reduce((acc, i) => acc + i.price * i.cantidad, 0);

  document.getElementById("total").innerText = "Total: $" + total;
}

window.guardarPedido = async () => {
  const total = carrito.reduce((acc, i) => acc + i.price * i.cantidad, 0);

  const { data: order } = await supabase
    .from("orders")
    .insert([{ total, status: "CONFIRMADO" }])
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
  cargarProductos();
};

cargarProductos();
