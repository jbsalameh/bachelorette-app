"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { useItinerary } from '../../components/ItineraryContext';

// ── Helpers ────────────────────────────────────────────────────────────────
const DAY_DATES = {
  'Thursday, June 11':  [2026, 5, 11],
  'Friday, June 12':    [2026, 5, 12],
  'Saturday, June 13':  [2026, 5, 13],
  'Sunday, June 14':    [2026, 5, 14],
};

function eventDateTime(ev) {
  const d = DAY_DATES[ev.day];
  if (!d) return null;
  const [h, m] = ev.time.split(':').map(Number);
  return new Date(d[0], d[1], d[2], h, m);
}

const CAT_STYLE = {
  '🛬': { bg: '#EFF6FF', color: '#1D4ED8' },
  '🍕': { bg: '#FFF7ED', color: '#C2410C' },
  '🍝': { bg: '#FFF7ED', color: '#C2410C' },
  '🍣': { bg: '#FFF7ED', color: '#C2410C' },
  '📸': { bg: '#FAF5FF', color: '#7C3AED' },
  '🍹': { bg: '#F0FDF4', color: '#166534' },
  '🥂': { bg: '#FDF2F8', color: '#9D174D' },
  '🚂': { bg: '#EFF6FF', color: '#1D4ED8' },
  '🏖️': { bg: '#FEFCE8', color: '#854D0E' },
  '🪩': { bg: '#FDF2F8', color: '#9D174D' },
  '⛵': { bg: '#ECFDF5', color: '#065F46' },
  '🌅': { bg: '#FFF7ED', color: '#9A3412' },
};
function getEmoji(title) { return title.match(/\p{Emoji_Presentation}/u)?.[0] || '📍'; }
function getStyle(emoji) { return CAT_STYLE[emoji] || { bg: '#F8FAFC', color: '#334155' }; }

// ── Component ──────────────────────────────────────────────────────────────
export default function Itinerary() {
  const { events, isLoaded, isSynced, updateEvent, deleteEvent, addEvent } = useItinerary();

  const DAYS = ['Thursday, June 11', 'Friday, June 12', 'Saturday, June 13', 'Sunday, June 14'];
  const autoSelected = useRef(false);
  const [activeDay, setActiveDay] = useState(DAYS[0]);
  const [expandedId, setExpandedId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ time: '', title: '', desc: '', mapQuery: '', phone: '' });
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [newForm, setNewForm] = useState({ time: '12:00', title: '', desc: '' });

  // ── Next Up calculation ──────────────────────────────────────────────────
  const nextEvent = useMemo(() => {
    const now = new Date();
    return events
      .map(ev => ({ ...ev, _dt: eventDateTime(ev) }))
      .filter(ev => ev._dt && ev._dt > now)
      .sort((a, b) => a._dt - b._dt)[0] || null;
  }, [events]);

  // Auto-select the day of the next upcoming event on first load
  useEffect(() => {
    if (!autoSelected.current && nextEvent) {
      setActiveDay(nextEvent.day);
      autoSelected.current = true;
    }
  }, [nextEvent]);

  const activeEvents = events
    .filter(e => e.day === activeDay)
    .sort((a, b) => a.time.localeCompare(b.time));

  const startEdit = (ev, e) => {
    e.stopPropagation();
    setEditId(ev.id);
    setEditForm({ time: ev.time, title: ev.title, desc: ev.desc, mapQuery: ev.mapQuery || '', phone: ev.phone || '' });
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

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div>

      {/* ── NEXT UP HERO ─────────────────────────────────────────────── */}
      {nextEvent && (
        <div
          style={{
            background: 'linear-gradient(135deg, var(--navy) 0%, #1E3A6E 60%, #2563EB 100%)',
            borderRadius: '24px',
            padding: '22px',
            marginBottom: '20px',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
          }}
          onClick={() => { setActiveDay(nextEvent.day); setExpandedId(nextEvent.id); }}
        >
          <div style={{ position: 'absolute', right: -12, bottom: -18, fontSize: '90px', opacity: 0.12 }}>🍋</div>
          <div style={{ fontSize: '0.7rem', fontWeight: '800', letterSpacing: '2px', opacity: 0.7, textTransform: 'uppercase', marginBottom: '10px' }}>
            ⏭ Next Up
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', width: '52px', height: '52px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0 }}>
              {getEmoji(nextEvent.title)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {nextEvent.title}
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
                {nextEvent.day.split(',')[0]} · {nextEvent.time}
              </div>
            </div>
            <div style={{ fontSize: '22px', opacity: 0.6 }}>›</div>
          </div>
        </div>
      )}

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '2rem', fontWeight: '900', color: 'var(--navy)', lineHeight: 1 }}>
          The Plan
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isSynced && (
            <span className="live-badge">
              <span className="live-dot" />
              Live
            </span>
          )}
        </div>
      </div>

      {/* ── Day Tabs ─────────────────────────────────────────────────── */}
      <div className="tabs-container mb-3">
        {DAYS.map(day => {
          const [weekday, , num] = day.split(' ');
          return (
            <div
              key={day}
              className={`pill-tab ${activeDay === day ? 'active' : ''}`}
              onClick={() => { setActiveDay(day); setExpandedId(null); setEditId(null); }}
            >
              {weekday.slice(0, 3)} {num}
            </div>
          );
        })}
      </div>

      {/* ── Day header + Add button ────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingLeft: '4px' }}>
        <div>
          <div style={{ fontFamily: 'Playfair Display, serif', fontWeight: '700', color: 'var(--navy)', fontSize: '1rem' }}>{activeDay}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '2px' }}>{activeEvents.length} events</div>
        </div>
        <button
          onClick={() => setShowAddSheet(true)}
          style={{ background: 'linear-gradient(135deg, var(--coral), #BE123C)', color: 'white', border: 'none', borderRadius: '50px', padding: '9px 18px', fontFamily: 'Inter, sans-serif', fontWeight: '800', fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(244,63,94,0.30)', whiteSpace: 'nowrap' }}
        >
          + Event
        </button>
      </div>

      {/* ── Events list ───────────────────────────────────────────────── */}
      {!isLoaded ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px', opacity: 0.5 }}>🍋</div>
          <p>Loading itinerary...</p>
        </div>
      ) : activeEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '24px', color: 'var(--muted)' }}>
          <div style={{ fontSize: '50px', marginBottom: '14px' }}>🌴</div>
          <p style={{ lineHeight: 1.6 }}>Nothing planned yet.<br /><b>Tap + Event</b> or ask the AI Planner!</p>
        </div>
      ) : (
        <div style={{ position: 'relative', paddingLeft: '22px' }}>
          {/* Timeline spine */}
          <div style={{ position: 'absolute', left: '9px', top: '22px', bottom: '22px', width: '2px', background: 'linear-gradient(to bottom, var(--lemon), var(--coral))', borderRadius: '2px' }} />

          {activeEvents.map(ev => {
            const isExpanded = expandedId === ev.id;
            const isEditing = editId === ev.id;
            const emoji = getEmoji(ev.title);
            const st = getStyle(emoji);

            return (
              <div key={ev.id} style={{ position: 'relative', marginBottom: '10px' }}>
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute', left: '-24px', top: '20px',
                  width: '14px', height: '14px', borderRadius: '50%',
                  background: isExpanded ? 'var(--coral)' : 'var(--lemon)',
                  border: '3px solid white',
                  boxShadow: `0 0 0 2px ${isExpanded ? 'var(--coral)' : 'var(--lemon)'}`,
                  transition: 'all 0.2s', zIndex: 1,
                }} />

                <div
                  style={{
                    background: 'white',
                    borderRadius: '18px',
                    padding: '14px 16px',
                    boxShadow: isExpanded ? '0 6px 24px rgba(244,63,94,0.12)' : 'var(--shadow-sm)',
                    border: `2px solid ${isExpanded ? 'var(--coral)' : 'transparent'}`,
                    cursor: isEditing ? 'default' : 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => !isEditing && setExpandedId(isExpanded ? null : ev.id)}
                >
                  {isEditing ? (
                    <div onClick={e => e.stopPropagation()}>
                      <input className="input-field" type="time" value={editForm.time} onChange={e => setEditForm({ ...editForm, time: e.target.value })} />
                      <input className="input-field" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} placeholder="Event title (with emoji 🎉)" />
                      <textarea className="input-field" value={editForm.desc} onChange={e => setEditForm({ ...editForm, desc: e.target.value })} rows="2" placeholder="Description" style={{ resize: 'none' }} />
                      <input className="input-field" value={editForm.mapQuery} onChange={e => setEditForm({ ...editForm, mapQuery: e.target.value })} placeholder="📍 Location (e.g. Taverna Calderai Palermo)" />
                      <input className="input-field" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} placeholder="📞 Phone / reservation number" />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button className="btn-primary" style={{ margin: 0, padding: '11px', flex: 1, fontSize: '0.9rem' }} onClick={() => saveEdit(ev.id)}>Save ✓</button>
                        <button className="btn-secondary" style={{ margin: 0, padding: '11px', fontSize: '0.9rem' }} onClick={() => setEditId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Collapsed row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: st.bg, color: st.color, width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                          {emoji}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: '700', color: 'var(--navy)', fontSize: '0.97rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {ev.title}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--coral)', fontWeight: '700', marginTop: '2px' }}>
                            🕐 {ev.time}
                          </div>
                        </div>
                        <div style={{ color: 'var(--muted)', fontSize: '20px', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>›</div>
                      </div>

                      {/* Expanded */}
                      {isExpanded && (
                        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--border)' }}>
                          <p style={{ color: 'var(--text)', fontSize: '0.93rem', lineHeight: 1.65, marginBottom: '14px' }}>
                            {ev.desc || 'No description.'}
                          </p>

                          {/* Embedded mini-map */}
                          {ev.mapQuery && (
                            <div style={{ borderRadius: '14px', overflow: 'hidden', height: '160px', marginBottom: '14px', boxShadow: 'var(--shadow-sm)' }}>
                              <iframe
                                width="100%" height="100%"
                                style={{ border: 0, display: 'block' }}
                                loading="lazy"
                                allowFullScreen
                                src={`https://maps.google.com/maps?q=${encodeURIComponent(ev.mapQuery)}&t=m&z=15&output=embed&iwloc=near`}
                              />
                            </div>
                          )}

                          {/* Action chips */}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {ev.mapQuery && (
                              <a
                                href={`https://maps.google.com/?q=${encodeURIComponent(ev.mapQuery)}`}
                                target="_blank" rel="noopener noreferrer"
                                className="chip"
                                style={{ background: '#EFF6FF', color: '#1D4ED8', border: '1.5px solid #BFDBFE', textDecoration: 'none' }}
                                onClick={e => e.stopPropagation()}
                              >
                                📍 Open in Maps
                              </a>
                            )}
                            {ev.phone && (
                              <a
                                href={`tel:${ev.phone}`}
                                className="chip"
                                style={{ background: '#F0FDF4', color: '#166534', border: '1.5px solid #BBF7D0', textDecoration: 'none' }}
                                onClick={e => e.stopPropagation()}
                              >
                                📞 {ev.phone}
                              </a>
                            )}
                            <button
                              className="chip"
                              style={{ background: '#F8FAFC', color: 'var(--muted)', border: '1.5px solid var(--border)', cursor: 'pointer' }}
                              onClick={e => startEdit(ev, e)}
                            >
                              ✏️ Edit
                            </button>
                            <button
                              className="chip"
                              style={{ background: '#FFF1F2', color: '#BE123C', border: '1.5px solid #FECDD3', cursor: 'pointer' }}
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

      {/* ── Add Event Bottom Sheet ─────────────────────────────────────── */}
      {showAddSheet && (
        <div className="modal-overlay" onClick={() => setShowAddSheet(false)}>
          <div className="bottom-sheet" onClick={e => e.stopPropagation()}>
            <div className="drawer-handle" />
            <h2 className="serif mb-3" style={{ color: 'var(--navy)', marginTop: '8px' }}>
              Add Event — {activeDay.split(',')[0]}
            </h2>
            <input className="input-field" type="time" value={newForm.time} onChange={e => setNewForm({ ...newForm, time: e.target.value })} />
            <input className="input-field" placeholder="Event title (include an emoji 🍕)" value={newForm.title} onChange={e => setNewForm({ ...newForm, title: e.target.value })} />
            <textarea className="input-field" placeholder="Description (optional)" value={newForm.desc} onChange={e => setNewForm({ ...newForm, desc: e.target.value })} rows="3" style={{ resize: 'none' }} />
            <button className="btn-primary" onClick={handleAddEvent}>Add to Itinerary ✨</button>
            <button style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--muted)', padding: '14px', fontFamily: 'Inter, sans-serif', fontWeight: '700', cursor: 'pointer', marginTop: '4px' }} onClick={() => setShowAddSheet(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
