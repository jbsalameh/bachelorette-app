"use client";

import { useState, useEffect } from 'react';

// Tricount Algorithm
function calculateSettlements(members, expenses) {
  const balances = {};
  members.forEach(m => balances[m] = 0);

  // Calculate net balances
  expenses.forEach(exp => {
    if (!balances[exp.paidBy]) balances[exp.paidBy] = 0;
    balances[exp.paidBy] += exp.amount; // Creditor (+)

    const share = exp.amount / exp.splitWith.length;
    exp.splitWith.forEach(person => {
      if (!balances[person]) balances[person] = 0;
      balances[person] -= share; // Debtor (-)
    });
  });

  // Simplify debts
  let debtors = Object.keys(balances).filter(m => balances[m] < -0.01).map(m => ({ name: m, amount: -balances[m] })).sort((a, b) => b.amount - a.amount);
  let creditors = Object.keys(balances).filter(m => balances[m] > 0.01).map(m => ({ name: m, amount: balances[m] })).sort((a, b) => b.amount - a.amount);

  const transactions = [];
  
  let d = 0;
  let c = 0;
  
  while (d < debtors.length && c < creditors.length) {
    const debtor = debtors[d];
    const creditor = creditors[c];
    
    const amount = Math.min(debtor.amount, creditor.amount);
    
    if (amount > 0.01) {
      transactions.push({ from: debtor.name, to: creditor.name, amount: amount.toFixed(2) });
    }
    
    debtor.amount -= amount;
    creditor.amount -= amount;
    
    if (debtor.amount < 0.01) d++;
    if (creditor.amount < 0.01) c++;
  }

  return transactions;
}

export default function Finances() {
  const [activeTab, setActiveTab] = useState('Expenses');
  
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [myName, setMyName] = useState('');
  
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Modals
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  
  // Forms
  const [newMemberName, setNewMemberName] = useState('');
  const [expForm, setExpForm] = useState({ desc: '', amount: '', paidBy: '', cat: '🍽️', splitWith: [] });

  useEffect(() => {
    const m = JSON.parse(localStorage.getItem('bachelorette_members') || '["Bride", "Maid of Honor", "Sofia"]');
    const e = JSON.parse(localStorage.getItem('bachelorette_expenses') || '[]');
    const my = localStorage.getItem('bachelorette_my_name') || '';
    
    setMembers(m);
    setExpenses(e);
    setMyName(my);
    setIsLoaded(true);
  }, []);

  const saveMembers = (newM) => { setMembers(newM); localStorage.setItem('bachelorette_members', JSON.stringify(newM)); };
  const saveExpenses = (newE) => { setExpenses(newE); localStorage.setItem('bachelorette_expenses', JSON.stringify(newE)); };
  
  const handleAddMember = () => {
    if (newMemberName && !members.includes(newMemberName)) {
      saveMembers([...members, newMemberName]);
      setNewMemberName('');
      setShowAddMember(false);
      // Auto set my name if first
      if (!myName) {
        setMyName(newMemberName);
        localStorage.setItem('bachelorette_my_name', newMemberName);
      }
    }
  };

  const handleDeleteMember = (name) => {
    saveMembers(members.filter(m => m !== name));
    saveExpenses(expenses.map(e => ({...e, splitWith: e.splitWith.filter(m => m !== name)})));
  };

  const handleAddExpense = () => {
    if (expForm.desc && expForm.amount && expForm.paidBy) {
      const splitWith = expForm.splitWith.length > 0 ? expForm.splitWith : members; // default all
      const newExp = {
        id: Date.now(),
        desc: expForm.desc,
        amount: parseFloat(expForm.amount),
        paidBy: expForm.paidBy,
        cat: expForm.cat,
        splitWith,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
      saveExpenses([newExp, ...expenses]);
      setShowAddExpense(false);
      setExpForm({ desc: '', amount: '', paidBy: myName || members[0], cat: '🍽️', splitWith: [] });
    }
  };

  const handleDeleteExpense = (id) => {
    saveExpenses(expenses.filter(e => e.id !== id));
  };

  if (!isLoaded) return <div></div>;

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const settlements = calculateSettlements(members, expenses);
  
  // Calculate my stats
  let mySpend = 0; // what I paid
  let myShare = 0; // what I owe
  expenses.forEach(e => {
    if (e.paidBy === myName) mySpend += e.amount;
    if (e.splitWith.includes(myName)) myShare += (e.amount / e.splitWith.length);
  });
  const myNet = mySpend - myShare;

  return (
    <div>
      <h1 className="title-large serif mb-3 text-center">Finances</h1>
      
      {/* Top Tabs */}
      <div className="tabs-container mb-3" style={{ justifyContent: 'center' }}>
        {['Members', 'Expenses', 'Settle Up'].map(tab => (
          <div key={tab} className={`pill-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </div>
        ))}
      </div>

      {activeTab === 'Expenses' && (
        <>
          <div className="glass-panel text-center mb-4" style={{ background: 'linear-gradient(135deg, var(--ocean-blue), var(--primary-blue))', color: 'white', padding: '20px' }}>
            <h3 className="serif mb-1" style={{ opacity: 0.9 }}>Total Trip Cost</h3>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '10px' }}>€{totalSpent.toFixed(2)}</div>
            {myName && members.includes(myName) ? (
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '12px', fontSize: '0.9rem' }}>
                <div>My Share: <b>€{myShare.toFixed(2)}</b></div>
                <div style={{ color: myNet < 0 ? '#FF8FAB' : '#FDE74C', fontWeight: '800', marginTop: '4px' }}>
                  {myNet < 0 ? `I owe €${Math.abs(myNet).toFixed(2)}` : `I am owed €${myNet.toFixed(2)}`}
                </div>
              </div>
            ) : (
              <button className="chip" style={{ background: 'white', color: 'var(--primary-blue)' }} onClick={() => setActiveTab('Members')}>
                Select your name
              </button>
            )}
          </div>

          <div className="mb-4" style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn-primary" style={{ width: 'auto', padding: '10px 20px', margin: 0, fontSize: '1rem', background: 'var(--sunset-orange)' }} onClick={() => {
              setExpForm({ ...expForm, paidBy: myName || members[0] || '', splitWith: members });
              setShowAddExpense(true);
            }}>
              + Add Expense
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {expenses.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>No expenses yet.</p>
            ) : expenses.map(e => (
              <div key={e.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ fontSize: '24px', width: '45px', height: '45px', background: 'var(--bg-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {e.cat}
                  </div>
                  <div>
                    <div style={{ fontWeight: '800', color: 'var(--primary-blue)', fontSize: '1.05rem' }}>{e.desc}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Paid by {e.paidBy} • {e.date}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--ocean-blue)' }}>€{e.amount}</div>
                  <button onClick={() => handleDeleteExpense(e.id)} style={{ background: 'none', border: 'none', color: '#FF8FAB', fontSize: '18px' }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'Members' && (
        <div className="glass-panel">
          <h2 className="serif mb-3" style={{ color: 'var(--primary-blue)' }}>Who's coming?</h2>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
            {members.map(m => (
              <div key={m} className={`chip ${myName === m ? 'active' : ''}`} onClick={() => { setMyName(m); localStorage.setItem('bachelorette_my_name', m); }}>
                {m} {myName === m && '(You)'}
                <span onClick={(e) => { e.stopPropagation(); handleDeleteMember(m); }} style={{ marginLeft: '8px', color: myName === m ? 'white' : 'var(--sunset-orange)' }}>×</span>
              </div>
            ))}
          </div>
          
          {showAddMember ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <input className="input-field" autoFocus value={newMemberName} onChange={e => setNewMemberName(e.target.value)} placeholder="Name" style={{ margin: 0 }} />
              <button className="btn-primary" style={{ margin: 0, width: 'auto', padding: '0 20px' }} onClick={handleAddMember}>Add</button>
            </div>
          ) : (
            <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setShowAddMember(true)}>+ Add Person</button>
          )}
        </div>
      )}

      {activeTab === 'Settle Up' && (
        <div className="glass-panel">
          <h2 className="serif mb-3" style={{ color: 'var(--primary-blue)', textAlign: 'center' }}>Time to Settle Up 💸</h2>
          
          {settlements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎉</div>
              <h3 style={{ color: 'var(--ocean-blue)' }}>All settled!</h3>
              <p style={{ color: 'var(--text-muted)' }}>No one owes anything.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {settlements.map((s, i) => (
                <div key={i} className="settle-row">
                  <div>
                    <div style={{ fontWeight: '800', color: 'var(--primary-blue)', fontSize: '1.1rem' }}>{s.from}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>sends to <b>{s.to}</b></div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--sunset-orange)' }}>€{s.amount}</div>
                    <a 
                      href={`sms:?body=Hey! I owe you €${s.amount} for the Palermo trip!`} 
                      className="chip" 
                      style={{ background: 'var(--lemon-yellow)', color: 'var(--primary-blue)', textDecoration: 'none' }}
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

      {/* Add Expense Modal Bottom Sheet */}
      {showAddExpense && (
        <div className="modal-overlay" onClick={() => setShowAddExpense(false)}>
          <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
            <h2 className="serif mb-3" style={{ color: 'var(--primary-blue)' }}>Add Expense</h2>
            
            <input className="input-field" placeholder="What was it? (e.g. Aperitivo)" value={expForm.desc} onChange={e => setExpForm({...expForm, desc: e.target.value})} />
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <input className="input-field" type="number" placeholder="€ Amount" value={expForm.amount} onChange={e => setExpForm({...expForm, amount: e.target.value})} />
              <select className="input-field" value={expForm.cat} onChange={e => setExpForm({...expForm, cat: e.target.value})}>
                <option value="🍽️">🍽️ Food</option>
                <option value="🚗">🚗 Transport</option>
                <option value="🏖️">🏖️ Activity</option>
                <option value="🏠">🏠 House</option>
                <option value="🛍️">🛍️ Other</option>
              </select>
            </div>

            <select className="input-field" value={expForm.paidBy} onChange={e => setExpForm({...expForm, paidBy: e.target.value})}>
              <option value="" disabled>Who paid?</option>
              {members.map(m => <option key={m} value={m}>{m}</option>)}
            </select>

            <button className="btn-primary" style={{ marginTop: '20px' }} onClick={handleAddExpense}>Save Expense</button>
            <button className="btn-secondary" style={{ width: '100%', marginTop: '10px', border: 'none', background: 'transparent' }} onClick={() => setShowAddExpense(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
