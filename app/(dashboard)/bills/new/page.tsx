'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Medicine = { id: number; medicine_name: string; price: number; medicine_Amount: number }
type CartItem = { medicine: Medicine; quantity: number }

export default function NewBillPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Medicine search
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Medicine[]>([])
  const [searching, setSearching] = useState(false)

  // Cart
  const [cart, setCart] = useState<CartItem[]>([])

  // Payment
  const [paymentType, setPaymentType] = useState<'cash_payment' | 'crad_payment'>('cash_payment')
  const [cardNumber, setCardNumber] = useState('')

  const total = cart.reduce((sum, item) => sum + item.medicine.price * item.quantity, 0)

  const handleSearch = async (q: string) => {
    setSearchQuery(q)
    if (q.length < 2) { setSearchResults([]); setSearching(false); return }
    setSearching(true)
    try {
      const res = await fetch(`/api/medicine/filter?medicine_name=${encodeURIComponent(q)}&page=1`)
      const data = await res.json()
      if (!res.ok) { console.error('Search error:', data); setSearchResults([]); return }
      setSearchResults(Array.isArray(data) ? data.slice(0, 6) : [])
    } catch (err) {
      console.error('Medicine search failed:', err)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const addToCart = (med: Medicine) => {
    setSearchQuery(''); setSearchResults([])
    setCart(prev => {
      const existing = prev.find(i => i.medicine.id === med.id)
      if (existing) return prev.map(i => i.medicine.id === med.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { medicine: med, quantity: 1 }]
    })
  }

  const updateQty = (id: number, qty: number) => {
    if (qty <= 0) { setCart(prev => prev.filter(i => i.medicine.id !== id)); return }
    setCart(prev => prev.map(i => i.medicine.id === id ? { ...i, quantity: qty } : i))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (cart.length === 0) { setError('Add at least one medicine to the cart'); return }
    if (paymentType === 'crad_payment' && cardNumber.length !== 11) { setError('Card number must be exactly 11 digits'); return }
    setError('')

    startTransition(async () => {
      try {
        const payload = {
          product_: cart.map(i => ({ medicine_id: i.medicine.id, quantity: i.quantity })),
          quantity_: cart[0].quantity,
          user_sell_: 1, // backend will override with session
          payment_type: paymentType,
          ...(paymentType === 'crad_payment' ? { custumer_payment_card: cardNumber } : {}),
        }

        const res = await fetch('/api/bills', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error ?? 'Failed to create bill'); return }
        setSuccess(`Bill #${data.bill?.id ?? ''} created successfully!`)
        setTimeout(() => router.push('/bills'), 1800)
      } catch {
        setError('Network error, please try again')
      }
    })
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">New Bill</h1>
          <p className="page-subtitle">Add medicines and create a sale</p>
        </div>
        <button onClick={() => router.back()} className="btn-secondary">← Back</button>
      </div>

      {success && (
        <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', fontWeight: '600', color: 'var(--emerald)' }}>
          ✅ {success}
        </div>
      )}
      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', fontSize: '13px', color: 'var(--red)' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' }}>
          {/* Left: Medicine Search + Cart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Search */}
            <div className="glass" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>🔍 Search Medicines</h2>
              <div style={{ position: 'relative' }}>
                <input className="input" placeholder="Type medicine name to search..." value={searchQuery}
                  onChange={e => handleSearch(e.target.value)} />
                {(searching || (searchResults.length > 0) || (searchQuery.length >= 2 && !searching && searchResults.length === 0)) && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20,
                    background: '#161d2e', border: '1px solid var(--border)', borderRadius: '10px',
                    marginTop: '6px', overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
                  }}>
                    {searching && <div style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>Searching...</div>}
                    {!searching && searchResults.length === 0 && searchQuery.length >= 2 && (
                      <div style={{ padding: '14px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>No medicines found</div>
                    )}
                    {searchResults.map(med => (
                      <div key={med.id} onClick={() => addToCart(med)} style={{
                        padding: '12px 16px', cursor: 'pointer', transition: 'background 0.15s',
                        borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                        <div>
                          <p style={{ fontWeight: '600', fontSize: '14px' }}>{med.medicine_name}</p>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Stock: {med.medicine_Amount}</p>
                        </div>
                        <span style={{ fontWeight: '700', color: 'var(--emerald)', fontSize: '14px' }}>{med.price.toLocaleString()} IQD</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Cart */}
            <div className="glass" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>🛒 Cart {cart.length > 0 && <span className="badge badge-teal" style={{ marginLeft: '8px', fontSize: '11px' }}>{cart.length}</span>}</h2>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '14px' }}>
                  <div style={{ fontSize: '36px', marginBottom: '10px' }}>🛒</div>
                  Search and click a medicine to add it here
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {cart.map(item => (
                    <div key={item.medicine.id} style={{
                      display: 'flex', alignItems: 'center', gap: '14px',
                      background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px 14px',
                      border: '1px solid var(--border)',
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: '600', fontSize: '14px' }}>{item.medicine.medicine_name}</p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.medicine.price.toLocaleString()} IQD each</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button type="button" onClick={() => updateQty(item.medicine.id, item.quantity - 1)}
                          className="btn-ghost" style={{ padding: '4px 10px', fontSize: '16px' }}>−</button>
                        <span style={{ minWidth: '30px', textAlign: 'center', fontWeight: '700' }}>{item.quantity}</span>
                        <button type="button" onClick={() => updateQty(item.medicine.id, item.quantity + 1)}
                          className="btn-ghost" style={{ padding: '4px 10px', fontSize: '16px' }}>+</button>
                      </div>
                      <span style={{ fontWeight: '700', color: 'var(--emerald)', minWidth: '90px', textAlign: 'right', fontSize: '14px' }}>
                        {(item.medicine.price * item.quantity).toLocaleString()} IQD
                      </span>
                      <button type="button" onClick={() => updateQty(item.medicine.id, 0)}
                        className="btn-danger" style={{ padding: '5px 9px', fontSize: '12px' }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Summary + Payment */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '24px' }}>
            {/* Payment Type */}
            <div className="glass" style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px' }}>💳 Payment</h2>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {[
                  { value: 'cash_payment', label: '💵 Cash' },
                  { value: 'crad_payment', label: '💳 Card' },
                ].map(opt => (
                  <button type="button" key={opt.value}
                    onClick={() => setPaymentType(opt.value as any)}
                    style={{
                      flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                      fontFamily: 'Inter, sans-serif', fontWeight: '600', fontSize: '13px',
                      transition: 'all 0.2s',
                      background: paymentType === opt.value ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                      color: paymentType === opt.value ? '#fff' : 'var(--text-secondary)',
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
              {paymentType === 'crad_payment' && (
                <div>
                  <label className="label">Card Number (11 digits)</label>
                  <input className="input" placeholder="e.g. 12345678901" value={cardNumber}
                    onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    maxLength={11} />
                  {cardNumber && cardNumber.length !== 11 && (
                    <p style={{ fontSize: '12px', color: 'var(--amber)', marginTop: '4px' }}>Must be exactly 11 digits</p>
                  )}
                </div>
              )}
            </div>

            {/* Total */}
            <div className="glass" style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>🧾 Summary</h2>
              {cart.map(item => (
                <div key={item.medicine.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  <span>{item.medicine.medicine_name} ×{item.quantity}</span>
                  <span>{(item.medicine.price * item.quantity).toLocaleString()} IQD</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', marginTop: '12px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '700', fontSize: '15px' }}>Total</span>
                <span style={{ fontWeight: '800', fontSize: '22px', color: 'var(--emerald)' }}>{total.toLocaleString()} IQD</span>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={isPending || cart.length === 0}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: '15px' }}>
              {isPending ? '⏳ Creating Bill...' : `✓ Create Bill — ${total.toLocaleString()} IQD`}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
