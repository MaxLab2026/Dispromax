{showPaymentModal && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4">
    <div className="bg-white rounded-3xl max-w-md w-full p-6">
      <h2 className="text-xl font-semibold mb-4">Registrar pago inicial</h2>
      
      <p className="mb-2 text-slate-500">Total del pedido: ${finalTotal.toLocaleString('es-CO')}</p>
      
      <input
        type="number"
        placeholder="Monto recibido"
        value={initialPayment}
        onChange={e => setInitialPayment(parseFloat(e.target.value) || 0)}
        className="w-full rounded-2xl border px-4 py-3 mb-4"
      />
      
      {initialPayment > 0 && initialPayment < finalTotal && (
        <p className="text-sm text-amber-600 mb-2">
          Pago parcial: faltan ${(finalTotal - initialPayment).toLocaleString('es-CO')}
        </p>
      )}
      
      <select
        value={paymentMethod}
        onChange={e => setPaymentMethod(e.target.value)}
        className="w-full rounded-2xl border px-4 py-3 mb-4"
      >
        <option value="efectivo">Efectivo</option>
        <option value="transferencia">Transferencia</option>
        <option value="tarjeta">Tarjeta</option>
      </select>
      
      <div className="flex gap-3">
        <button
          onClick={() => {
            if (initialPayment < 0 || initialPayment > finalTotal) {
              alert('Monto inválido')
              return
            }
            handleCreateOrder()
          }}
          disabled={creating}
          className="flex-1 btn-primary py-3"
        >
          {creating ? 'Guardando...' : 'Confirmar pedido'}
        </button>
        <button
          onClick={() => setShowPaymentModal(false)}
          className="flex-1 btn-secondary py-3"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}
