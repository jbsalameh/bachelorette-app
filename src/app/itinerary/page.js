"use client";

import { useState } from 'react';
import { useItinerary } from '../components/ItineraryContext';

export default function Itinerary() {
  const { events, updateEvent, deleteEvent } = useItinerary();
  
  const days = ['Thursday, June 11', 'Friday, June 12', 'Saturday, June 13', 'Sunday, June 14'];
  const [activeDay, setActiveDay] = useState(days[0]);
  
  // Expanded card state (holds event id)
  const [expandedId, setExpandedId] = useState(null);
  
  // Edit form state
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ time: '', title: '', desc: '' });

  const activeEvents = events.filter(e => e.day === activeDay).sort((a, b) => a.time.localeCompare(b.time));

  const startEdit = (ev, e) => {
    e.stopPropagation();
    setEditId(ev.id);
    setEditForm({ time: ev.time, title: ev.title, desc: ev.desc });
  };

  const saveEdit = (id) => {
    updateEvent(id, editForm);
    setEditId(null);
  };

  return (
    <div>
      <h1 className="title-large serif mb-3 text-center">The Plan</h1>
      
      {/* Day Tabs */}
      <div className="tabs-container mb-3" style={{ padding: '0 10px 15px' }}>
        {days.map(day => {
          const shortName = day.split(',')[0].substring(0, 3) + ' ' + day.split(' ')[2];
          return (
            <div 
              key={day}
              className={`pill-tab ${activeDay === day ? 'active' : ''}`}
              onClick={() => { setActiveDay(day); setExpandedId(null); setEditId(null); }}
            >
              {shortName}
            </div>
          );
        })}
      </div>

      <div className="glass-panel" style={{ minHeight: '50vh', padding: '16px' }}>
        <h2 className="serif mb-3" style={{ color: 'var(--primary-blue)', paddingLeft: '8px' }}>{activeDay}</h2>
        
        {activeEvents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🌴</div>
            <p>No plans yet for today.<br/>Ask the AI Planner to schedule something!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeEvents.map(ev => {
              const isExpanded = expandedId === ev.id;
              const isEditing = editId === ev.id;

              return (
                <div 
                  key={ev.id} 
                  className="card" 
                  style={{ cursor: isEditing ? 'default' : 'pointer', margin: 0, transition: 'all 0.2s', background: isExpanded ? 'white' : 'rgba(255,255,255,0.7)', border: isExpanded ? '2px solid var(--ocean-blue)' : '1px solid rgba(0,0,0,0.05)' }}
                  onClick={() => !isEditing && setExpandedId(isExpanded ? null : ev.id)}
                >
                  {isEditing ? (
                    <div onClick={e => e.stopPropagation()}>
                      <input className="input-field" type="time" value={editForm.time} onChange={e => setEditForm({...editForm, time: e.target.value})} />
                      <input className="input-field" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} placeholder="Title" />
                      <textarea className="input-field" value={editForm.desc} onChange={e => setEditForm({...editForm, desc: e.target.value})} rows="3" placeholder="Description" />
                      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button className="btn-primary" style={{ margin: 0, padding: '10px', flex: 1 }} onClick={() => saveEdit(ev.id)}>Save</button>
                        <button className="btn-secondary" style={{ margin: 0, padding: '10px' }} onClick={() => setEditId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Collapsed Header */}
                      <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                        <div style={{ width: '55px', fontWeight: '800', color: 'var(--sunset-orange)' }}>
                          {ev.time}
                        </div>
                        <div style={{ flex: 1, fontWeight: '800', color: 'var(--primary-blue)', paddingRight: '10px' }}>
                          {ev.title}
                        </div>
                        <div style={{ color: 'var(--text-muted)', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>
                          ›
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.05)', animation: 'slideUp 0.2s ease-out forwards' }}>
                          <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '16px' }}>
                            {ev.desc}
                          </p>
                          
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {ev.mapQuery && (
                              <a href={`https://maps.google.com/?q=${encodeURIComponent(ev.mapQuery)}`} target="_blank" rel="noopener noreferrer" className="chip" onClick={e => e.stopPropagation()}>
                                📍 Map
                              </a>
                            )}
                            {ev.phone && (
                              <a href={`tel:${ev.phone}`} className="chip" onClick={e => e.stopPropagation()}>
                                📞 Reserve
                              </a>
                            )}
                            <button className="chip" style={{ background: 'transparent', border: '1px solid var(--text-muted)', color: 'var(--text-muted)' }} onClick={(e) => startEdit(ev, e)}>
                              ✏️ Edit
                            </button>
                            <button className="chip" style={{ background: '#FFF0F5', borderColor: '#FF8FAB', color: '#D81159' }} onClick={(e) => { e.stopPropagation(); deleteEvent(ev.id); }}>
                              🗑️
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      
    </div>
  );
}
