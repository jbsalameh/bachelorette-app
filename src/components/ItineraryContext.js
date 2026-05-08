"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const ItineraryContext = createContext(null);

// ── Map Supabase row → app event ──────────────────────────────────────────
function fromDb(row) {
  return {
    id: row.id,
    day: row.day,
    time: row.time,
    title: row.title,
    desc: row.description || '',
    mapQuery: row.map_query || '',
    phone: row.phone || '',
  };
}

function toDb(event) {
  return {
    day: event.day,
    time: event.time,
    title: event.title,
    description: event.desc || '',
    map_query: event.mapQuery || '',
    phone: event.phone || '',
  };
}

// ── Seed data (used when DB is empty or Supabase is not configured) ────────
const SEED_EVENTS = [
  { id: 1,  day: 'Thursday, June 11', time: '13:00', title: 'Land at PMO & Drop Bags 🛬',           desc: 'Transfer ~35 min to old town. Pickup transfer or rental car.',                              mapQuery: 'Palermo Airport PMO',                         phone: '' },
  { id: 2,  day: 'Thursday, June 11', time: '14:30', title: 'Quick Lunch 🍕',                        desc: 'Retrobottega di Prezzemolo & Vitale near Quattro Canti. Arancine + Sicilian white.',       mapQuery: 'Retrobottega di Prezzemolo Vitale Palermo',    phone: '' },
  { id: 3,  day: 'Thursday, June 11', time: '16:00', title: 'Easy Walking Tour 📸',                  desc: 'Quattro Canti → Cattedrale di Palermo (rooftop golden hour) → Teatro Massimo → Mercato del Capo.', mapQuery: 'Cattedrale di Palermo',                phone: '' },
  { id: 4,  day: 'Thursday, June 11', time: '19:00', title: 'Sunset Aperitivo 🍹',                   desc: "Politeama Roof. Small terrace, views over the city's domes. Book ahead.",                  mapQuery: 'Politeama Roof Palermo',                      phone: '+39 091 123 4567' },
  { id: 5,  day: 'Thursday, June 11', time: '21:00', title: 'Dinner at Taverna Calderai 🍝',         desc: 'Medieval vaulted-stone interior, candlelit. Book the second seating.',                    mapQuery: 'Taverna Calderai Palermo',                    phone: '+39 091 334 600' },
  { id: 6,  day: 'Thursday, June 11', time: '23:30', title: 'Nightcap at Igiea Terrazza Bar 🥂',     desc: 'Old-money glam terrace over the marina. Early-ish bed.',                                  mapQuery: 'Villa Igiea Palermo',                         phone: '' },
  { id: 7,  day: 'Friday, June 12',   time: '09:30', title: 'Train to Cefalù 🚂',                    desc: '~1 hr from Palermo Centrale. Enjoy the coastal views!',                                  mapQuery: 'Palermo Centrale',                            phone: '' },
  { id: 8,  day: 'Friday, June 12',   time: '12:30', title: 'Lido Maljk Beach Club 🏖️',              desc: 'Lunch on the sand and pool time. Book sunbeds ahead.',                                   mapQuery: 'Lido Maljk Cefalu',                           phone: '+39 092 123 4567' },
  { id: 9,  day: 'Friday, June 12',   time: '21:30', title: 'OVER Rooftop Bachelorette Dinner 🍣',   desc: 'Italian + sushi fusion, sophisticated cocktails. THE bachelorette dinner! ✨',             mapQuery: 'OVER Rooftop Via Nicolo Gallo Palermo',       phone: '+39 091 987 6543' },
  { id: 10, day: 'Friday, June 12',   time: '23:59', title: 'DJ Night in Mondello 🪩',               desc: 'Anima Mondello / Bagno Galatea open-air on the sand.',                                   mapQuery: 'Anima Mondello',                              phone: '' },
  { id: 11, day: 'Saturday, June 13', time: '13:00', title: 'Favignana Boat Tour ⛵',                desc: 'Private gozzo from Trapani port. Crystal-clear water awaits! 🌊',                        mapQuery: 'Liberty Lines Trapani',                       phone: '' },
  { id: 12, day: 'Sunday, June 14',   time: '08:00', title: 'Mondello Sunrise 🌅',                   desc: 'Empty beach photos and coffee at Bar Galatea.',                                          mapQuery: 'Bar Galatea Mondello',                        phone: '' },
];

// ── Provider ───────────────────────────────────────────────────────────────
export function ItineraryProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSynced, setIsSynced] = useState(false); // true when backed by Supabase

  useEffect(() => {
    if (isSupabaseConfigured) {
      loadFromSupabase();
    } else {
      loadFromLocalStorage();
    }
  }, []);

  // ── Supabase path ────────────────────────────────────────────────────────
  async function loadFromSupabase() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('time');

      if (error) throw error;

      if (data && data.length > 0) {
        setEvents(data.map(fromDb));
      } else {
        // Seed the database on first run
        const toInsert = SEED_EVENTS.map(({ id, ...ev }) => toDb(ev));
        const { data: inserted } = await supabase.from('events').insert(toInsert).select();
        if (inserted) setEvents(inserted.map(fromDb));
      }

      setIsSynced(true);
      setIsLoaded(true);

      // Realtime subscription
      const channel = supabase
        .channel('events-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, async () => {
          const { data: fresh } = await supabase.from('events').select('*').order('time');
          if (fresh) setEvents(fresh.map(fromDb));
        })
        .subscribe();

      return () => supabase.removeChannel(channel);
    } catch (err) {
      console.warn('Supabase unavailable, falling back to localStorage:', err.message);
      loadFromLocalStorage();
    }
  }

  // ── localStorage fallback ────────────────────────────────────────────────
  function loadFromLocalStorage() {
    const saved = localStorage.getItem('bachelorette_events');
    setEvents(saved ? JSON.parse(saved) : SEED_EVENTS);
    if (!saved) localStorage.setItem('bachelorette_events', JSON.stringify(SEED_EVENTS));
    setIsLoaded(true);
  }

  function saveLocal(updated) {
    setEvents(updated);
    if (!isSupabaseConfigured) {
      localStorage.setItem('bachelorette_events', JSON.stringify(updated));
    }
  }

  // ── CRUD ─────────────────────────────────────────────────────────────────
  const addEvent = async (eventData) => {
    if (isSupabaseConfigured) {
      const { data } = await supabase.from('events').insert(toDb(eventData)).select().single();
      if (data) setEvents(prev => [...prev, fromDb(data)]);
    } else {
      const newId = events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1;
      saveLocal([...events, { id: newId, ...eventData }]);
    }
  };

  const updateEvent = async (id, fields) => {
    if (isSupabaseConfigured) {
      const dbFields = {};
      if (fields.time  !== undefined) dbFields.time        = fields.time;
      if (fields.title !== undefined) dbFields.title       = fields.title;
      if (fields.desc  !== undefined) dbFields.description = fields.desc;
      if (fields.mapQuery !== undefined) dbFields.map_query = fields.mapQuery;
      if (fields.phone !== undefined) dbFields.phone       = fields.phone;
      await supabase.from('events').update(dbFields).eq('id', id);
    }
    setEvents(prev => {
      const updated = prev.map(ev => ev.id === id ? { ...ev, ...fields } : ev);
      if (!isSupabaseConfigured) localStorage.setItem('bachelorette_events', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteEvent = async (id) => {
    if (isSupabaseConfigured) {
      await supabase.from('events').delete().eq('id', id);
    }
    setEvents(prev => {
      const updated = prev.filter(ev => ev.id !== id);
      if (!isSupabaseConfigured) localStorage.setItem('bachelorette_events', JSON.stringify(updated));
      return updated;
    });
  };

  const replaceDayEvents = async (day, newEventsForDay) => {
    if (isSupabaseConfigured) {
      await supabase.from('events').delete().eq('day', day);
      const toInsert = newEventsForDay.map(ev => ({ ...toDb({ ...ev, day }) }));
      const { data } = await supabase.from('events').insert(toInsert).select();
      if (data) {
        setEvents(prev => [...prev.filter(ev => ev.day !== day), ...data.map(fromDb)]);
      }
    } else {
      const filtered = events.filter(ev => ev.day !== day);
      const startId = filtered.length > 0 ? Math.max(...filtered.map(e => e.id)) + 1 : 1;
      const mapped = newEventsForDay.map((ev, i) => ({ ...ev, day, id: startId + i }));
      saveLocal([...filtered, ...mapped]);
    }
  };

  return (
    <ItineraryContext.Provider value={{ events, isLoaded, isSynced, addEvent, updateEvent, deleteEvent, replaceDayEvents }}>
      {children}
    </ItineraryContext.Provider>
  );
}

export function useItinerary() {
  const ctx = useContext(ItineraryContext);
  if (!ctx) throw new Error('useItinerary must be used within ItineraryProvider');
  return ctx;
}
