"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const ItineraryContext = createContext(null);

const initialEvents = [
  { id: 1, day: "Thursday, June 11", time: "13:00", title: "Land at PMO & Drop Bags 🛬", desc: "Transfer ~35 min to old town.", mapQuery: "Palermo Airport PMO" },
  { id: 2, day: "Thursday, June 11", time: "14:30", title: "Quick Lunch 🍕", desc: "Retrobottega di Prezzemolo & Vitale near Quattro Canti. Arancine + Sicilian white.", mapQuery: "Retrobottega di Prezzemolo & Vitale Palermo" },
  { id: 3, day: "Thursday, June 11", time: "16:00", title: "Easy Walking Tour 📸", desc: "Quattro Canti → Cattedrale di Palermo (rooftop golden hour) → Teatro Massimo → Mercato del Capo.", mapQuery: "Cattedrale di Palermo" },
  { id: 4, day: "Thursday, June 11", time: "19:00", title: "Sunset Aperitivo 🍹", desc: "Politeama Roof. Views over the city's domes.", mapQuery: "Politeama Roof Palermo", phone: "+39 091 123 4567" },
  { id: 5, day: "Thursday, June 11", time: "21:00", title: "Dinner at Taverna Calderai 🍝", desc: "Medieval vaulted-stone interior, candlelit.", mapQuery: "Taverna Calderai Palermo", phone: "+39 091 334 600" },
  { id: 6, day: "Thursday, June 11", time: "23:30", title: "Nightcap at Igiea Terrazza Bar 🥂", desc: "Old-money glam terrace over the marina. Early-ish bed.", mapQuery: "Villa Igiea Palermo" },
  { id: 7, day: "Friday, June 12", time: "09:30", title: "Train to Cefalù 🚂", desc: "~1 hr from Palermo Centrale.", mapQuery: "Palermo Centrale" },
  { id: 8, day: "Friday, June 12", time: "12:30", title: "Lido Maljk Beach Club 🏖️", desc: "Lunch on the sand and pool time.", mapQuery: "Lido Maljk Cefalu", phone: "+39 092 123 4567" },
  { id: 9, day: "Friday, June 12", time: "21:30", title: "OVER Rooftop Bachelorette Dinner 🍣", desc: "Italian + sushi fusion, sophisticated cocktails.", mapQuery: "OVER Rooftop Via Nicolo Gallo Palermo", phone: "+39 091 987 6543" },
  { id: 10, day: "Friday, June 12", time: "00:00", title: "DJ Night in Mondello 🪩", desc: "Anima Mondello / Bagno Galatea open-air on the sand.", mapQuery: "Anima Mondello" },
  { id: 11, day: "Saturday, June 13", time: "13:00", title: "Favignana Boat Tour ⛵", desc: "Private gozzo from Trapani port.", mapQuery: "Liberty Lines Trapani" },
  { id: 12, day: "Sunday, June 14", time: "08:00", title: "Mondello Sunrise 🌅", desc: "Empty beach photos and coffee at Bar Galatea.", mapQuery: "Bar Galatea Mondello" }
];

export function ItineraryProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('bachelorette_events');
    if (saved) {
      setEvents(JSON.parse(saved));
    } else {
      setEvents(initialEvents);
      localStorage.setItem('bachelorette_events', JSON.stringify(initialEvents));
    }
    setIsLoaded(true);
  }, []);

  const saveEvents = (newEvents) => {
    setEvents(newEvents);
    localStorage.setItem('bachelorette_events', JSON.stringify(newEvents));
  };

  const addEvent = (eventData) => {
    setEvents(currentEvents => {
      const newId = currentEvents.length > 0 ? Math.max(...currentEvents.map(e => e.id)) + 1 : 1;
      const newEvent = { id: newId, ...eventData };
      const updated = [...currentEvents, newEvent];
      localStorage.setItem('bachelorette_events', JSON.stringify(updated));
      return updated;
    });
  };

  const updateEvent = (id, fields) => {
    setEvents(currentEvents => {
      const updated = currentEvents.map(ev => ev.id === id ? { ...ev, ...fields } : ev);
      localStorage.setItem('bachelorette_events', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteEvent = (id) => {
    setEvents(currentEvents => {
      const updated = currentEvents.filter(ev => ev.id !== id);
      localStorage.setItem('bachelorette_events', JSON.stringify(updated));
      return updated;
    });
  };

  const replaceDayEvents = (day, newEventsForDay) => {
    setEvents(currentEvents => {
      const filtered = currentEvents.filter(ev => ev.day !== day);
      const startId = filtered.length > 0 ? Math.max(...filtered.map(e => e.id)) + 1 : 1;
      const mappedNew = newEventsForDay.map((ev, idx) => ({ ...ev, day, id: startId + idx }));
      const updated = [...filtered, ...mappedNew];
      localStorage.setItem('bachelorette_events', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <ItineraryContext.Provider value={{ events, isLoaded, addEvent, updateEvent, deleteEvent, replaceDayEvents }}>
      {children}
    </ItineraryContext.Provider>
  );
}

export function useItinerary() {
  const context = useContext(ItineraryContext);
  if (!context) {
    throw new Error('useItinerary must be used within an ItineraryProvider');
  }
  return context;
}
