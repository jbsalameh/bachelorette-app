"use client";

import { useState } from 'react';

const initialExpenses = [
  { id: 1, desc: "Airbnb (4 nights)", amount: 1500, paidBy: "Maid of Honor", date: "Jan 15" },
  { id: 2, desc: "Boat Tour Deposit", amount: 200, paidBy: "Bride", date: "Feb 10" },
  { id: 3, desc: "OVER Rooftop Deposit", amount: 110, paidBy: "Bridesmaid 1", date: "Mar 05" },
];

export default function Finances() {
  const [expenses, setExpenses] = useState(initialExpenses);
  const [showAdd, setShowAdd] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newPayer, setNewPayer] = useState('Maid of Honor');

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handleAdd = () => {
    if (newDesc && newAmount) {
      const newExp = {
        id: Date.now(),
        desc: newDesc,
        amount: parseFloat(newAmount),
        paidBy: newPayer,
        date: "Today"
      };
      setExpenses([newExp, ...expenses]);
      setNewDesc('');
      setNewAmount('');
      setShowAdd(false);
    }
  };

  return (
    <div>
      <h1 className="title-large serif mb-3 text-center">Finances</h1>
      
      <div className="glass-panel mb-4 text-center" style={{ background: 'linear-gradient(135deg, var(--ocean-blue), var(--primary-blue))', color: 'white' }}>
        <h3 className="serif mb-1" style={{ opacity: 0.9 }}>Total Trip Cost</h3>
        <div style={{ fontSize: '3rem', fontWeight: '800', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
          €{totalSpent}
        </div>
        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Split between 11 people: ~€{(totalSpent / 11).toFixed(2)} / ea</p>
      </div>

      <div className="glass-panel mb-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(0,0,0,0.05)', paddingBottom: '10px', marginBottom: '15px' }}>
          <h2 className="serif" style={{ color: 'var(--primary-blue)', margin: 0 }}>Expenses 💸</h2>
          <button 
            onClick={() => setShowAdd(!showAdd)}
            style={{ background: 'var(--sunset-orange)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', fontSize: '18px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(255, 143, 171, 0.4)' }}
          >
            {showAdd ? '×' : '+'}
          </button>
        </div>

        {showAdd && (
          <div style={{ background: 'rgba(0,0,0,0.02)', padding: '15px', borderRadius: '12px', marginBottom: '15px' }}>
            <input className="input-field" placeholder="What was it?" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input className="input-field" type="number" placeholder="Amount (€)" value={newAmount} onChange={e => setNewAmount(e.target.value)} style={{ flex: 1 }} />
              <select className="input-field" value={newPayer} onChange={e => setNewPayer(e.target.value)} style={{ flex: 1 }}>
                <option>Maid of Honor</option>
                <option>Bride</option>
                <option>Bestie 1</option>
                <option>Bestie 2</option>
              </select>
            </div>
            <button className="btn-primary" onClick={handleAdd} style={{ padding: '10px' }}>Add Expense</button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {expenses.map((exp) => (
            <div key={exp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px 16px', borderRadius: '12px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
              <div>
                <div style={{ fontWeight: '800', color: 'var(--primary-blue)' }}>{exp.desc}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Paid by {exp.paidBy} • {exp.date}</div>
              </div>
              <div style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--ocean-blue)' }}>
                €{exp.amount}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
