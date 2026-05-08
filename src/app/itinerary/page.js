"use client";

import { useState } from 'react';

const initialEvents = [
  { id: 1, day: "Thursday, June 11", time: "13:00", title: "Land at PMO & Drop Bags 🛬", desc: "Transfer ~35 min to old town." },
  { id: 2, day: "Thursday, June 11", time: "14:30", title: "Quick Lunch 🍕", desc: "Retrobottega di Prezzemolo & Vitale near Quattro Canti. Arancine + Sicilian white." },
  { id: 3, day: "Thursday, June 11", time: "16:00", title: "Easy Walking Tour 📸", desc: "Quattro Canti → Cattedrale di Palermo (rooftop golden hour) → Teatro Massimo → Mercato del Capo." },
  { id: 4, day: "Thursday, June 11", time: "19:00", title: "Sunset Aperitivo 🍹", desc: "Politeama Roof. Views over the city's domes." },
  { id: 5, day: "Thursday, June 11", time: "21:00", title: "Dinner at Taverna Calderai 🍝", desc: "Medieval vaulted-stone interior, candlelit." },
  { id: 6, day: "Thursday, June 11", time: "23:30", title: "Nightcap at Igiea Terrazza Bar 🥂", desc: "Old-money glam terrace over the marina. Early-ish bed." },
  { id: 7, day: "Friday, June 12", time: "09:30", title: "Train to Cefalù 🚂", desc: "~1 hr from Palermo Centrale." },
  { id: 8, day: "Friday, June 12", time: "12:30", title: "Lido Maljk Beach Club 🏖️", desc: "Lunch on the sand and pool time." },
  { id: 9, day: "Friday, June 12", time: "21:30", title: "OVER Rooftop Bachelorette Dinner 🍣", desc: "Italian + sushi fusion, sophisticated cocktails." },
  { id: 10, day: "Friday, June 12", time: "00:00", title: "DJ Night in Mondello 🪩", desc: "Anima Mondello / Bagno Galatea open-air on the sand." },
];

export default function Itinerary() {
  const [events, setEvents] = useState(initialEvents);
  const [isEditing, setIsEditing] = useState(false);

  const groupedEvents = events.reduce((acc, event) => {
    if (!acc[event.day]) acc[event.day] = [];
    acc[event.day].push(event);
    return acc;
  }, {});

  const handleEdit = (id, field, value) => {
    setEvents(events.map(ev => ev.id === id ? { ...ev, [field]: value } : ev));
  };

  const handleDelete = (id) => {
    setEvents(events.filter(ev => ev.id !== id));
  };

  const handleAddEvent = (day) => {
    const newId = Math.max(...events.map(e => e.id), 0) + 1;
    setEvents([...events, { id: newId, day, time: "12:00", title: "New Event", desc: "" }]);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="title-large serif" style={{ margin: 0 }}>The Plan</h1>
        <button 
          className="btn-secondary" 
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Save Plan ✅" : "Edit Plan ✏️"}
        </button>
      </div>
      
      {Object.entries(groupedEvents).map(([day, dayEvents]) => (
        <div key={day} className="glass-panel mb-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(0,0,0,0.05)', paddingBottom: '10px', marginBottom: '20px' }}>
            <h2 className="serif" style={{ color: 'var(--primary-blue)', margin: 0 }}>{day}</h2>
            {isEditing && (
              <button onClick={() => handleAddEvent(day)} style={{ background: 'var(--ocean-blue)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', fontSize: '18px', cursor: 'pointer' }}>+</button>
            )}
          </div>
          
          <div className="timeline">
            {dayEvents.sort((a, b) => a.time.localeCompare(b.time)).map((ev) => (
              <div key={ev.id} className="timeline-event">
                {isEditing ? (
                  <div>
                    <input className="input-field" value={ev.time} onChange={(e) => handleEdit(ev.id, 'time', e.target.value)} type="time" style={{ width: '120px', marginBottom: '8px' }} />
                    <input className="input-field" value={ev.title} onChange={(e) => handleEdit(ev.id, 'title', e.target.value)} placeholder="Event Title" />
                    <textarea className="input-field" value={ev.desc} onChange={(e) => handleEdit(ev.id, 'desc', e.target.value)} placeholder="Description" rows="2" />
                    <button onClick={() => handleDelete(ev.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>🗑️ Delete Event</button>
                  </div>
                ) : (
                  <>
                    <div className="event-time">{ev.time}</div>
                    <div className="event-title">{ev.title}</div>
                    <div className="event-desc">{ev.desc}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      
      <div style={{ textAlign: 'center', marginBottom: '40px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
        End of Itinerary
      </div>
    </div>
  );
}
