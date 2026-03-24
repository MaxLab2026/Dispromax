import jsPDF from 'jspdf'

const COMPANY = {
  name: 'Dispromax S.A.S.',
  address: 'Barranquilla, Atlántico, Colombia',
  phone: '+57 300 1234567',
  email: 'info@dispromax.com',
  nit: '900.123.456-7'
}

export const generatePDF = async (type, order, customer, items) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const margin = 15
  let y = margin

  // Header
  doc.setFillColor(30, 64, 175)
  doc.rect(0, 0, 210, 35, 'F')

  doc.setFontSize(28)
  doc.setTextColor(255, 255, 255)
  doc.text('DISPROMAX', margin + 35, 22)

  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.text(`${COMPANY.address} • ${COMPANY.phone}`, margin + 35, 30)

  y = 50

  // Título
  doc.setFontSize(18)
  doc.setTextColor(30, 64, 175)
  if (type === 'orden') doc.text('ORDEN DE PEDIDO', margin, y)
  else if (type === 'factura') doc.text('FACTURA ELECTRÓNICA', margin, y)
  else if (type === 'nota') doc.text('NOTA DE ENTREGA', margin, y)

  y += 10

  // Datos del pedido
  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.text(`Pedido #${order.id}`, margin, y)
  y += 6
  doc.text(`Fecha: ${new Date(order.created_at).toLocaleDateString('es-CO')}`, margin, y)
  y += 6
  doc.text(`Cliente: ${customer.nombre} • ${customer.telefono}`, margin, y)
  y += 12

  // Tabla de productos
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
    doc.text(item.cantidad.toString(), margin + 88, y)
    doc.text(`$${item.precio_unitario.toLocaleString('es-CO')}`, margin + 115, y)
    const subtotal = item.cantidad * item.precio_unitario
    doc.text(`$${subtotal.toLocaleString('es-CO')}`, margin + 155, y)
    total += subtotal
    y += 8
  })

  y += 8
  doc.setFontSize(12)
  doc.setTextColor(30, 64, 175)
  doc.text('TOTAL', margin + 115, y)
  doc.text(`$${total.toLocaleString('es-CO')}`, margin + 155, y)

  // Footer
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text('Gracias por su compra • Dispromax', margin, 270)

  const filename = type === 'orden' ? `orden-${order.id}.pdf` : 
                   type === 'factura' ? `factura-${order.id}.pdf` : 
                   `nota-entrega-${order.id}.pdf`

  doc.save(filename)
}
