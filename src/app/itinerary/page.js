"use client";

import { useState } from 'react';
import { useItinerary } from '../../components/ItineraryContext';

// Category color mapping for event type badges
const categoryStyle = {
  '🛬': { bg: '#E8F4FD', color: '#0A2463' },
  '🍕': { bg: '#FFF3E0', color: '#E65100' },
  '🍝': { bg: '#FFF3E0', color: '#E65100' },
  '🍣': { bg: '#FFF3E0', color: '#E65100' },
  '📸': { bg: '#F3E5F5', color: '#6A1B9A' },
  '🍹': { bg: '#E8F5E9', color: '#1B5E20' },
  '🥂': { bg: '#FCE4EC', color: '#880E4F' },
  '🚂': { bg: '#E3F2FD', color: '#0D47A1' },
  '🏖️': { bg: '#FFF9C4', color: '#F57F17' },
  '🪩': { bg: '#FCE4EC', color: '#880E4F' },
  '⛵': { bg: '#E0F7FA', color: '#006064' },
  '🌅': { bg: '#FFF3E0', color: '#BF360C' },
};

function getEventEmoji(title) {
  const match = title.match(/[\u{1F300}-\u{1FFFF}]|[\u{2600}-\u{27BF}]/u);
  return match ? match[0] : '📍';
}

function getEventStyle(emoji) {
  return categoryStyle[emoji] || { bg: '#F5F5F5', color: '#333' };
}

export default function Itinerary() {
  const { events, updateEvent, deleteEvent, addEvent } = useItinerary();

  const days = ['Thursday, June 11', 'Friday, June 12', 'Saturday, June 13', 'Sunday, June 14'];
  const [activeDay, setActiveDay] = useState(days[0]);
  const [expandedId, setExpandedId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ time: '', title: '', desc: '' });
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [newForm, setNewForm] = useState({ time: '12:00', title: '', desc: '' });

  const activeEvents = events
    .filter(e => e.day === activeDay)
    .sort((a, b) => a.time.localeCompare(b.time));

  const startEdit = (ev, e) => {
    e.stopPropagation();
    setEditId(ev.id);
    setEditForm({ time: ev.time, title: ev.title, desc: ev.desc });
  };

  const saveEdit = (id) => {
    updateEvent(id, editForm);
    setEditId(null);
  };

  const handleAddEvent = () => {
    if (newForm.title.trim()) {
      addEvent({ day: activeDay, time: newForm.time, title: newForm.title, desc: newForm.desc });
      setNewForm({ time: '12:00', title: '', desc: '' });
      setShowAddSheet(false);
    }
  };

  const dayEmojis = { 'Thursday, June 11': '🛬', 'Friday, June 12': '🏖️', 'Saturday, June 13': '⛵', 'Sunday, June 14': '🌅' };

  return (
    <div>
      <h1 className="title-large serif mb-3 text-center">The Plan</h1>

      {/* Day Tabs */}
      <div className="tabs-container mb-3" style={{ padding: '0 0 10px' }}>
        {days.map(day => {
          const parts = day.split(' ');
          const label = `${dayEmojis[day]} ${parts[0].slice(0, 3)} ${parts[2]}`;
          return (
            <div
              key={day}
              className={`pill-tab ${activeDay === day ? 'active' : ''}`}
              onClick={() => { setActiveDay(day); setExpandedId(null); setEditId(null); }}
            >
              {label}
            </div>
          );
        })}
      </div>

      {/* Day summary strip */}
      <div className="glass-panel mb-3" style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div className="serif" style={{ color: 'var(--primary-blue)', fontSize: '1rem', fontWeight: '800' }}>{activeDay}</div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>{activeEvents.length} events planned</div>
        </div>
        <button
          onClick={() => setShowAddSheet(true)}
          style={{ background: 'linear-gradient(135deg, var(--sunset-orange), #FF5A82)', color: 'white', border: 'none', borderRadius: '50px', padding: '8px 18px', fontWeight: '800', fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,90,130,0.3)' }}
        >
          + Event
        </button>
      </div>

      {/* Events */}
      {activeEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', background: 'white', borderRadius: '24px' }}>
          <div style={{ fontSize: '50px', marginBottom: '15px' }}>🌴</div>
          <p style={{ lineHeight: 1.6 }}>No plans yet for this day.<br />Tap <b>+ Event</b> or ask the AI Planner!</p>
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '20px' }}>
          {/* Timeline line */}
          <div style={{ position: 'absolute', left: '8px', top: '20px', bottom: '20px', width: '2px', background: 'linear-gradient(to bottom, var(--lemon-yellow), var(--sunset-orange))', borderRadius: '2px' }} />

          {activeEvents.map(ev => {
            const isExpanded = expandedId === ev.id;
            const isEditing = editId === ev.id;
            const emoji = getEventEmoji(ev.title);
            const style = getEventStyle(emoji);

            return (
              <div key={ev.id} style={{ position: 'relative', marginBottom: '12px' }}>
                {/* Timeline dot */}
                <div style={{ position: 'absolute', left: '-24px', top: '18px', width: '14px', height: '14px', borderRadius: '50%', background: isExpanded ? 'var(--ocean-blue)' : 'var(--lemon-yellow)', border: '3px solid white', boxShadow: '0 0 0 2px ' + (isExpanded ? 'var(--ocean-blue)' : 'var(--accent-yellow)'), transition: 'all 0.2s', zIndex: 1 }} />

                <div
                  style={{
                    background: 'white',
                    borderRadius: '18px',
                    padding: '14px 16px',
                    boxShadow: isExpanded ? '0 8px 30px rgba(0,119,182,0.15)' : '0 2px 8px rgba(0,0,0,0.04)',
                    border: isExpanded ? '2px solid var(--ocean-blue)' : '1px solid rgba(0,0,0,0.04)',
                    cursor: isEditing ? 'default' : 'pointer',
                    transition: 'all 0.25s ease',
                  }}
                  onClick={() => !isEditing && setExpandedId(isExpanded ? null : ev.id)}
                >
                  {isEditing ? (
                    <div onClick={e => e.stopPropagation()}>
                      <input className="input-field" type="time" value={editForm.time} onChange={e => setEditForm({ ...editForm, time: e.target.value })} />
                      <input className="input-field" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} placeholder="Title" />
                      <textarea className="input-field" value={editForm.desc} onChange={e => setEditForm({ ...editForm, desc: e.target.value })} rows="3" placeholder="Description" style={{ resize: 'none' }} />
                      <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                        <button className="btn-primary" style={{ margin: 0, padding: '10px', flex: 1, fontSize: '0.95rem' }} onClick={() => saveEdit(ev.id)}>Save</button>
                        <button className="btn-secondary" style={{ margin: 0, padding: '10px' }} onClick={() => setEditId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Collapsed row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: style.bg, color: style.color, width: '42px', height: '42px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                          {emoji}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: '800', color: 'var(--primary-blue)', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {ev.title}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--sunset-orange)', fontWeight: '700', marginTop: '2px' }}>
                            🕐 {ev.time}
                          </div>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '20px', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
                          ›
                        </div>
                      </div>

                      {/* Expanded panel */}
                      {isExpanded && (
                        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                          {/* Description */}
                          <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '14px' }}>
                            {ev.desc || 'No description.'}
                          </p>

                          {/* Embedded mini-map */}
                          {ev.mapQuery && (
                            <div style={{ borderRadius: '14px', overflow: 'hidden', height: '160px', marginBottom: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                              <iframe
                                width="100%"
                                height="100%"
                                style={{ border: 0, display: 'block' }}
                                loading="lazy"
                                allowFullScreen
                                src={`https://maps.google.com/maps?q=${encodeURIComponent(ev.mapQuery)}&t=m&z=15&output=embed&iwloc=near`}
                              />
                            </div>
                          )}

                          {/* Action Chips */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {ev.mapQuery && (
                              <a
                                href={`https://maps.google.com/?q=${encodeURIComponent(ev.mapQuery)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="chip"
                                style={{ background: '#E8F4FD', color: '#0A2463', border: 'none', textDecoration: 'none' }}
                                onClick={e => e.stopPropagation()}
                              >
                                📍 Open in Maps
                              </a>
                            )}
                            {ev.phone && (
                              <a
                                href={`tel:${ev.phone}`}
                                className="chip"
                                style={{ background: '#E8F5E9', color: '#1B5E20', border: 'none', textDecoration: 'none' }}
                                onClick={e => e.stopPropagation()}
                              >
                                📞 {ev.phone}
                              </a>
                            )}
                            <button
                              className="chip"
                              style={{ background: 'rgba(0,0,0,0.04)', color: 'var(--text-muted)', border: '1px solid rgba(0,0,0,0.08)' }}
                              onClick={e => startEdit(ev, e)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="chip"
                              style={{ background: '#FFF0F5', color: '#D81159', border: '1px solid #FF8FAB' }}
                              onClick={e => { e.stopPropagation(); deleteEvent(ev.id); setExpandedId(null); }}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Event Bottom Sheet */}
      {showAddSheet && (
        <div className="modal-overlay" onClick={() => setShowAddSheet(false)}>
          <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
            <div className="drawer-handle" style={{ margin: '0 auto 20px' }} />
            <h2 className="serif mb-3" style={{ color: 'var(--primary-blue)' }}>Add Event to {activeDay.split(',')[0]}</h2>
            <input className="input-field" type="time" value={newForm.time} onChange={e => setNewForm({ ...newForm, time: e.target.value })} />
            <input className="input-field" placeholder="Event title (include an emoji! 🍕)" value={newForm.title} onChange={e => setNewForm({ ...newForm, title: e.target.value })} />
            <textarea className="input-field" placeholder="Description (optional)" value={newForm.desc} onChange={e => setNewForm({ ...newForm, desc: e.target.value })} rows="3" style={{ resize: 'none' }} />
            <button className="btn-primary" onClick={handleAddEvent}>Add to Itinerary ✨</button>
            <button className="btn-secondary" style={{ width: '100%', marginTop: '10px', border: 'none', background: 'transparent', color: 'var(--text-muted)' }} onClick={() => setShowAddSheet(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
