"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

// ── Tricount debt-simplification algorithm ──────────────────────────────────
function calculateSettlements(members, expenses) {
  const balances = {};
  members.forEach(m => (balances[m] = 0));

  expenses.forEach(exp => {
    if (!balances[exp.paid_by]) balances[exp.paid_by] = 0;
    balances[exp.paid_by] += exp.amount;
    const share = exp.amount / (exp.split_with?.length || 1);
    (exp.split_with || []).forEach(person => {
      if (!balances[person]) balances[person] = 0;
      balances[person] -= share;
    });
  });

  let debtors = Object.entries(balances)
    .filter(([, v]) => v < -0.01)
    .map(([name, amount]) => ({ name, amount: -amount }))
    .sort((a, b) => b.amount - a.amount);
  let creditors = Object.entries(balances)
    .filter(([, v]) => v > 0.01)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount);

  const txns = [];
  let d = 0, c = 0;
  while (d < debtors.length && c < creditors.length) {
    const amount = Math.min(debtors[d].amount, creditors[c].amount);
    if (amount > 0.01) txns.push({ from: debtors[d].name, to: creditors[c].name, amount: amount.toFixed(2) });
    debtors[d].amount -= amount;
    creditors[c].amount -= amount;
    if (debtors[d].amount < 0.01) d++;
    if (creditors[c].amount < 0.01) c++;
  }
  return txns;
}

export default function Finances() {
  const [activeTab, setActiveTab] = useState('Expenses');
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [myName, setMyName] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [expForm, setExpForm] = useState({ description: '', amount: '', paid_by: '', cat: '🍽️', split_with: [] });
  const [syncing, setSyncing] = useState(false);

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    const my = localStorage.getItem('bachelorette_my_name') || '';
    setMyName(my);

    const fetchData = async () => {
      const [{ data: mData }, { data: eData }] = await Promise.all([
        supabase.from('members').select('name').order('created_at'),
        supabase.from('expenses').select('*').order('created_at', { ascending: false })
      ]);
      if (mData) setMembers(mData.map(r => r.name));
      if (eData) setExpenses(eData);
      setIsLoaded(true);
    };
    fetchData();

    // ── Realtime subscriptions ─────────────────────────────────────────────
    const memberSub = supabase
      .channel('members-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => {
        supabase.from('members').select('name').order('created_at')
          .then(({ data }) => { if (data) setMembers(data.map(r => r.name)); });
      })
      .subscribe();

    const expenseSub = supabase
      .channel('expenses-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, () => {
        supabase.from('expenses').select('*').order('created_at', { ascending: false })
          .then(({ data }) => { if (data) setExpenses(data); });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(memberSub);
      supabase.removeChannel(expenseSub);
    };
  }, []);

  // ── Members CRUD ──────────────────────────────────────────────────────────
  const handleAddMember = async () => {
    if (!newMemberName.trim() || members.includes(newMemberName.trim())) return;
    setSyncing(true);
    await supabase.from('members').insert({ name: newMemberName.trim() });
    if (!myName) {
      setMyName(newMemberName.trim());
      localStorage.setItem('bachelorette_my_name', newMemberName.trim());
    }
    setNewMemberName('');
    setShowAddMember(false);
    setSyncing(false);
  };

  const handleDeleteMember = async (name) => {
    await supabase.from('members').delete().eq('name', name);
  };

  const selectMyName = (name) => {
    setMyName(name);
    localStorage.setItem('bachelorette_my_name', name);
  };

  // ── Expenses CRUD ─────────────────────────────────────────────────────────
  const handleAddExpense = async () => {
    if (!expForm.description || !expForm.amount || !expForm.paid_by) return;
    setSyncing(true);
    const splitWith = expForm.split_with.length > 0 ? expForm.split_with : members;
    await supabase.from('expenses').insert({
      description: expForm.description,
      amount: parseFloat(expForm.amount),
      paid_by: expForm.paid_by,
      cat: expForm.cat,
      split_with: splitWith,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    });
    setExpForm({ description: '', amount: '', paid_by: myName || members[0] || '', cat: '🍽️', split_with: [] });
    setShowAddExpense(false);
    setSyncing(false);
  };

  const handleDeleteExpense = async (id) => {
    await supabase.from('expenses').delete().eq('id', id);
  };

  if (!isLoaded) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '40px', marginBottom: '15px', animation: 'pulse 1.5s infinite' }}>💸</div>
        <p style={{ fontWeight: '600' }}>Connecting to shared database...</p>
      </div>
    );
  }

  const totalSpent = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const settlements = calculateSettlements(members, expenses);

  let myShare = 0, myPaid = 0;
  expenses.forEach(e => {
    if (e.paid_by === myName) myPaid += Number(e.amount);
    if ((e.split_with || []).includes(myName)) myShare += Number(e.amount) / (e.split_with?.length || 1);
  });
  const myNet = myPaid - myShare;

  return (
    <div>
      <h1 className="title-large serif mb-3 text-center">Finances</h1>

      {/* Tabs */}
      <div className="tabs-container mb-3" style={{ justifyContent: 'center' }}>
        {['Members', 'Expenses', 'Settle Up'].map(tab => (
          <div key={tab} className={`pill-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </div>
        ))}
      </div>

      {/* ── EXPENSES TAB ──────────────────────────────────────────────────── */}
      {activeTab === 'Expenses' && (
        <>
          {/* Summary card */}
          <div className="glass-panel text-center mb-4" style={{ background: 'linear-gradient(135deg, var(--ocean-blue), var(--primary-blue))', color: 'white', padding: '24px' }}>
            <h3 className="serif mb-1" style={{ opacity: 0.9 }}>Total Trip Cost</h3>
            <div style={{ fontSize: '2.8rem', fontWeight: '800', marginBottom: '12px' }}>€{totalSpent.toFixed(2)}</div>
            {myName && members.includes(myName) ? (
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '14px', fontSize: '0.9rem' }}>
                <div>My share: <b>€{myShare.toFixed(2)}</b></div>
                <div style={{ color: myNet < 0 ? '#FF8FAB' : '#FDE74C', fontWeight: '800', marginTop: '6px', fontSize: '1.05rem' }}>
                  {myNet < 0 ? `I owe €${Math.abs(myNet).toFixed(2)}` : myNet > 0 ? `I'm owed €${myNet.toFixed(2)}` : `All settled! 🎉`}
                </div>
              </div>
            ) : (
              <button className="chip" style={{ background: 'white', color: 'var(--primary-blue)', border: 'none' }} onClick={() => setActiveTab('Members')}>
                Tap to select your name →
              </button>
            )}
          </div>

          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', paddingLeft: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4CAF50', boxShadow: '0 0 0 3px rgba(76,175,80,0.2)', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>Live — syncs across all devices</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <button
              onClick={() => { setExpForm({ ...expForm, paid_by: myName || members[0] || '', split_with: [...members] }); setShowAddExpense(true); }}
              style={{ background: 'linear-gradient(135deg, var(--sunset-orange), #FF5A82)', color: 'white', border: 'none', borderRadius: '50px', padding: '10px 22px', fontWeight: '800', fontSize: '0.95rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,90,130,0.3)' }}
            >
              + Add Expense
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {expenses.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>No expenses logged yet.</p>
            ) : expenses.map(e => (
              <div key={e.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ fontSize: '22px', width: '44px', height: '44px', background: 'var(--bg-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {e.cat}
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', color: 'var(--primary-blue)', fontSize: '1rem' }}>{e.description}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      Paid by <b>{e.paid_by}</b> · {e.date} · split {e.split_with?.length || 0} ways
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ fontWeight: '800', fontSize: '1.15rem', color: 'var(--ocean-blue)' }}>€{Number(e.amount).toFixed(2)}</div>
                  <button onClick={() => handleDeleteExpense(e.id)} style={{ background: 'none', border: 'none', color: '#FF8FAB', fontSize: '16px', cursor: 'pointer', padding: '4px' }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── MEMBERS TAB ───────────────────────────────────────────────────── */}
      {activeTab === 'Members' && (
        <div className="glass-panel">
          <h2 className="serif mb-1" style={{ color: 'var(--primary-blue)' }}>Who's on the trip?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>Tap your name to set it as "you".</p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
            {members.map(m => (
              <div
                key={m}
                className={`chip ${myName === m ? 'active' : ''}`}
                onClick={() => selectMyName(m)}
                style={{ cursor: 'pointer', gap: '6px' }}
              >
                {myName === m && '👤 '}{m}
                <span
                  onClick={e => { e.stopPropagation(); handleDeleteMember(m); }}
                  style={{ marginLeft: '4px', opacity: 0.6, fontWeight: '900' }}
                >×</span>
              </div>
            ))}
            {members.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No members yet.</p>}
          </div>

          {showAddMember ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                className="input-field"
                autoFocus
                value={newMemberName}
                onChange={e => setNewMemberName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddMember()}
                placeholder="Name"
                style={{ margin: 0, flex: 1 }}
              />
              <button className="btn-primary" style={{ margin: 0, width: 'auto', padding: '0 20px', fontSize: '0.95rem' }} onClick={handleAddMember} disabled={syncing}>
                {syncing ? '...' : 'Add'}
              </button>
            </div>
          ) : (
            <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setShowAddMember(true)}>+ Add Person</button>
          )}
        </div>
      )}

      {/* ── SETTLE UP TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'Settle Up' && (
        <div className="glass-panel">
          <h2 className="serif mb-3 text-center" style={{ color: 'var(--primary-blue)' }}>Settle Up 💸</h2>
          {settlements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '50px', marginBottom: '15px' }}>🎉</div>
              <h3 style={{ color: 'var(--ocean-blue)' }}>All settled!</h3>
              <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Everyone's even — enjoy Sicily! 🍋</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {settlements.map((s, i) => (
                <div key={i} className="settle-row">
                  <div>
                    <div style={{ fontWeight: '800', color: 'var(--primary-blue)', fontSize: '1.1rem' }}>{s.from}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>sends to <b>{s.to}</b></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--sunset-orange)' }}>€{s.amount}</div>
                    <a
                      href={`sms:?body=Hey ${s.to}! I owe you €${s.amount} for the Palermo trip 🍋`}
                      className="chip"
                      style={{ background: 'var(--lemon-yellow)', color: 'var(--primary-blue)', border: 'none', textDecoration: 'none', fontWeight: '800' }}
                    >
                      💸 Send
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── ADD EXPENSE SHEET ─────────────────────────────────────────────── */}
      {showAddExpense && (
        <div className="modal-overlay" onClick={() => setShowAddExpense(false)}>
          <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
            <div className="drawer-handle" style={{ margin: '0 auto 20px' }} />
            <h2 className="serif mb-3" style={{ color: 'var(--primary-blue)' }}>Add Expense</h2>

            <input className="input-field" placeholder="What was it? (e.g. Aperitivo 🍹)" value={expForm.description} onChange={e => setExpForm({ ...expForm, description: e.target.value })} />

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontWeight: '800', color: 'var(--text-muted)', pointerEvents: 'none' }}>€</span>
                <input className="input-field" type="number" placeholder="0.00" value={expForm.amount} onChange={e => setExpForm({ ...expForm, amount: e.target.value })} style={{ paddingLeft: '30px' }} />
              </div>
              <select className="input-field" value={expForm.cat} onChange={e => setExpForm({ ...expForm, cat: e.target.value })} style={{ width: 'auto' }}>
                <option value="🍽️">🍽️ Food</option>
                <option value="🚗">🚗 Transport</option>
                <option value="🏖️">🏖️ Activity</option>
                <option value="🏠">🏠 House</option>
                <option value="🎉">🎉 Fun</option>
                <option value="🛍️">🛍️ Other</option>
              </select>
            </div>

            <label style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Who paid?</label>
            <select className="input-field" value={expForm.paid_by} onChange={e => setExpForm({ ...expForm, paid_by: e.target.value })}>
              <option value="" disabled>Select person</option>
              {members.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <label style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Split with</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
              {members.map(m => {
                const inSplit = expForm.split_with.includes(m);
                return (
                  <div
                    key={m}
                    className={`chip ${inSplit ? 'active' : ''}`}
                    onClick={() => setExpForm({ ...expForm, split_with: inSplit ? expForm.split_with.filter(x => x !== m) : [...expForm.split_with, m] })}
                    style={{ cursor: 'pointer' }}
                  >
                    {m}
                  </div>
                );
              })}
            </div>

            <button className="btn-primary" onClick={handleAddExpense} disabled={syncing}>
              {syncing ? 'Saving...' : 'Save Expense ✨'}
            </button>
            <button style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: '14px', fontWeight: '700', cursor: 'pointer', marginTop: '8px' }} onClick={() => setShowAddExpense(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
