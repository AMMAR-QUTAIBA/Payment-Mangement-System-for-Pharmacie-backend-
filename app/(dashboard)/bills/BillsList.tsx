'use client'
import React, { useState } from 'react'
import Link from 'next/link'

type Product = { medicine_name: string; quantity: number; product_price: number }
type Bill = {
  id: number; date: number; payment_type: string; total_price: number;
  card_last4: string | null; user_sell: number; products: Product[]
}

function PrintBill({ bill }: { bill: Bill }) {
  const handlePrint = () => {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html><head><title>Bill #${bill.id}</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 400px; margin: 20px auto; color: #111; }
        h1 { text-align: center; border-bottom: 2px solid #111; padding-bottom: 12px; }
        .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #ccc; }
        .total { font-size: 18px; font-weight: bold; color: #000; margin-top: 12px; }
        .meta { color: #555; font-size: 13px; margin-bottom: 16px; }
        @media print { button { display: none; } }
      </style></head><body>
      <h1>💊 PharmaCare</h1>
      <p class="meta">Bill #${bill.id} · ${new Date(bill.date).toLocaleString()}</p>
      <p class="meta">Payment: ${bill.payment_type === 'crad_payment' ? 'Card' + (bill.card_last4 ? ` (*${bill.card_last4})` : '') : 'Cash'}</p>
      <div style="margin: 12px 0">
        <div style="display:flex;justify-content:space-between;font-weight:bold;margin-bottom:8px;">
          <span>Item</span><span>Qty</span><span>Price</span><span>Total</span>
        </div>
        ${bill.products.map(p => `
          <div class="row">
            <span>${p.medicine_name}</span>
            <span>${p.quantity}</span>
            <span>${p.product_price.toLocaleString()} IQD</span>
            <span>${(p.quantity * p.product_price).toLocaleString()} IQD</span>
          </div>`).join('')}
      </div>
      <div class="row total"><span>TOTAL</span><span>${bill.total_price.toLocaleString()} IQD</span></div>
      <p style="text-align:center;margin-top:20px;font-size:12px;color:#888">Thank you for your visit!</p>
      <button onclick="window.print()" style="display:block;margin:16px auto;padding:10px 24px;cursor:pointer">🖨️ Print</button>
      </body></html>
    `)
    win.document.close()
    win.focus()
  }

  return (
    <button onClick={handlePrint} className="btn-ghost" style={{ fontSize: '12px', padding: '5px 10px' }}>
      🖨️ Print
    </button>
  )
}

export default function BillsList({ bills: initialBills, page, pagesize }: { bills: Bill[]; page: number; pagesize: number }) {
  const [expanded, setExpanded] = useState<number | null>(null)
  const [billsList, setBillsList] = useState(initialBills)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState<number | null>(null)

  const handleDelete = async (billId: number) => {
    setDeleting(billId)
    try {
      const res = await fetch(`/api/bills/${billId}`, { method: 'DELETE' })
      if (res.ok) {
        setBillsList(prev => prev.filter(b => b.id !== billId))
      } else {
        const data = await res.json()
        alert(data.error ?? 'Failed to delete bill')
      }
    } catch {
      alert('Network error, please try again')
    } finally {
      setDeleting(null)
      setConfirmingDelete(null)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Bills</h1>
          <p className="page-subtitle">{billsList.length} records shown</p>
        </div>
        <Link href="/bills/new" className="btn-primary">+ New Bill</Link>
      </div>

      {billsList.length === 0 ? (
        <div className="glass" style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧾</div>
          <p>No bills yet. <Link href="/bills/new" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>Create one →</Link></p>
        </div>
      ) : (
        <div className="glass" style={{ padding: '24px' }}>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Bill #</th>
                  <th>Date</th>
                  <th>Payment</th>
                  <th>Total</th>
                  <th>Items</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {billsList.map(bill => (
                  <React.Fragment key={bill.id}>
                    <tr onClick={() => setExpanded(expanded === bill.id ? null : bill.id)}
                      style={{ cursor: 'pointer' }}>
                      <td><span style={{ fontWeight: '700', color: 'var(--accent)' }}>#{bill.id}</span></td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                        {new Date(bill.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td>
                        {bill.payment_type === 'crad_payment'
                          ? <span className="badge badge-teal">💳 Card {bill.card_last4 ? `(*${bill.card_last4})` : ''}</span>
                          : <span className="badge badge-gray">💵 Cash</span>}
                      </td>
                      <td><span style={{ fontWeight: '700', color: 'var(--emerald)' }}>{bill.total_price.toLocaleString()} IQD</span></td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{bill.products.length} item{bill.products.length !== 1 ? 's' : ''}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                          <PrintBill bill={bill} />
                          {confirmingDelete === bill.id ? (
                            <>
                              <button className="btn-ghost" style={{ fontSize: '11px', padding: '4px 10px', color: 'var(--red)', fontWeight: '700' }}
                                disabled={deleting === bill.id}
                                onClick={() => handleDelete(bill.id)}>
                                {deleting === bill.id ? '⏳ Deleting...' : '✓ Yes'}
                              </button>
                              <button className="btn-ghost" style={{ fontSize: '11px', padding: '4px 10px' }}
                                onClick={() => setConfirmingDelete(null)}>
                                ✕ No
                              </button>
                            </>
                          ) : (
                            <button className="btn-ghost" style={{ fontSize: '12px', padding: '5px 10px', color: 'var(--red)' }}
                              onClick={() => setConfirmingDelete(bill.id)}>
                              🗑️
                            </button>
                          )}
                          <button className="btn-ghost" style={{ fontSize: '12px', padding: '5px 10px' }}
                            onClick={() => setExpanded(expanded === bill.id ? null : bill.id)}>
                            {expanded === bill.id ? '▲' : '▼'}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {/* Expanded Products */}
                    {expanded === bill.id && (
                      <tr key={`${bill.id}-detail`}>
                        <td colSpan={6} style={{ padding: '0 16px 16px' }}>
                          <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                            <table style={{ margin: 0 }}>
                              <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                  <th style={{ fontSize: '10px' }}>Medicine</th>
                                  <th style={{ fontSize: '10px' }}>Unit Price</th>
                                  <th style={{ fontSize: '10px' }}>Qty</th>
                                  <th style={{ fontSize: '10px' }}>Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {bill.products.map((p, i) => (
                                  <tr key={i}>
                                    <td style={{ fontWeight: '600' }}>{p.medicine_name}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{p.product_price.toLocaleString()} IQD</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>×{p.quantity}</td>
                                    <td style={{ fontWeight: '700', color: 'var(--emerald)' }}>{(p.quantity * p.product_price).toLocaleString()} IQD</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
        {page > 1 && <Link href={`/bills?page=${page - 1}`} className="btn-secondary">← Prev</Link>}
        <span className="glass" style={{ padding: '10px 20px', borderRadius: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>Page {page}</span>
        {billsList.length === pagesize && <Link href={`/bills?page=${page + 1}`} className="btn-secondary">Next →</Link>}
      </div>
    </div>
  )
}
