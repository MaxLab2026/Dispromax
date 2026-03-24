import jsPDF from 'jspdf'
import { supabase } from '../lib/supabase'

// Datos de tu empresa
const COMPANY = {
  name: 'Dispromax',
  address: 'Barranquilla, Atlántico, Colombia',
  phone: '+57 300 1234567',
  email: 'info@dispromax.com'
}

// Función auxiliar para convertir imagen a Base64
const getBase64Image = async (path) => {
  const response = await fetch(path) // ejemplo: '/logo.png' en carpeta public
  const blob = await response.blob()
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}

export const generatePDF = async (type, order, customer, items) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const margin = 15
  let y = margin

  // 🔵 Logo
  const logoBase64 = await getBase64Image('/logo.png') // tu logo en public
  doc.addImage(logoBase64, 'PNG', 10, 5, 25, 25) // posición y tamaño

  // 🔵 Encabezado corporativo
  doc.setFillColor(30, 64, 175)
  doc.rect(0, 0, 210, 35, 'F')
  doc.setFontSize(22)
  doc.setTextColor(255, 255, 255)
  doc.text(COMPANY.name, margin + 35, 20)
  doc.setFontSize(10)
  doc.text(`${COMPANY.address} • ${COMPANY.phone}`, margin + 35, 27)
  doc.text(`${COMPANY.email}`, margin + 35, 32)

  y = 50

  // 📄 Título
  doc.setFontSize(18)
  doc.setTextColor(30, 64, 175)
  if (type === 'orden') doc.text('ORDEN DE PEDIDO', margin, y)
  else if (type === 'factura') doc.text('FACTURA', margin, y)
  else if (type === 'nota') doc.text('NOTA DE ENTREGA', margin, y)
  y += 12

  // 👤 Datos del cliente y pedido
  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.text(`Pedido #${order.id}`, margin, y)
  y += 6
  doc.text(`Fecha: ${new Date(order.created_at).toLocaleDateString('es-CO')}`, margin, y)
  y += 6
  doc.text(`Cliente: ${customer.nombre}`, margin, y)
  y += 6
  if (customer.telefono) doc.text(`Teléfono: ${customer.telefono}`, margin, y)
  y += 12

  // 🛒 Tabla de productos
  doc.setFillColor(240, 240, 240)
  doc.rect(margin, y, 180, 8, 'F')
  doc.setFontSize(10)
  doc.text('Producto', margin + 5, y + 6)
  doc.text('Cant.', margin + 85, y + 6)
  doc.text('Precio', margin + 115, y + 6)
  doc.text('Subtotal', margin + 155, y + 6)
  y += 12

  let total = 0
  items.forEach(item => {
    doc.text(item.products?.nombre || item.nombre || 'Producto', margin + 5, y)
    doc.text(item.cantidad.toString(), margin + 88, y, { align: 'right' })
    doc.text(`$${item.precio_unitario.toLocaleString('es-CO')}`, margin + 115, y, { align: 'right' })
    const subtotal = item.cantidad * item.precio_unitario
    doc.text(`$${subtotal.toLocaleString('es-CO')}`, margin + 180, y, { align: 'right' })
    total += subtotal
    y += 8
  })

  y += 8
  doc.setFontSize(12)
  doc.setTextColor(30, 64, 175)
  doc.text('TOTAL', margin + 115, y)
  doc.text(`$${total.toLocaleString('es-CO')}`, margin + 180, y, { align: 'right' })
  y += 12

  // 💵 Pagos
  const { data: pagos } = await supabase
    .from('payments')
    .select('*')
    .eq('order_id', order.id)

  const totalPagado = pagos?.reduce((acc, p) => acc + p.monto, 0) || 0
  const saldoPendiente = total - totalPagado

  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.text(`Pagado: $${totalPagado.toLocaleString('es-CO')}`, margin + 115, y)
  y += 6
  doc.text(`Saldo pendiente: $${saldoPendiente.toLocaleString('es-CO')}`, margin + 115, y)
  y += 10

  if (saldoPendiente === 0) {
    doc.setTextColor(0, 150, 0)
    doc.setFontSize(14)
    doc.text('✅ PAGADO', margin, y)
    y += 10
  }

  if (pagos?.length) {
    doc.setFontSize(10)
    doc.setTextColor(80, 80, 80)
    doc.text('Detalle de pagos:', margin, y)
    y += 6
    pagos.forEach(p => {
      doc.text(
        `${new Date(p.fecha_pago).toLocaleDateString('es-CO')} • $${p.monto.toLocaleString('es-CO')} (${p.metodo})`,
        margin,
        y
      )
      y += 6
    })
  }

  // 📌 Footer
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text('Gracias por su compra • Dispromax', margin, 270)
  doc.text('Condiciones: No se aceptan devoluciones sin comprobante.', margin, 276)

  const filename = type === 'orden' ? `orden-${order.id}.pdf` : 
                   type === 'factura' ? `factura-${order.id}.pdf` : 
                   `nota-entrega-${order.id}.pdf`

  doc.save(filename)
}
