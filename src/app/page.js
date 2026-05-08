"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useItinerary } from '../components/ItineraryContext';

export default function Home() {
  const { events } = useItinerary();
  const [daysLeft, setDaysLeft] = useState(763);
  const [nextEvent, setNextEvent] = useState(null);

  useEffect(() => {
    // Calculate live countdown
    const targetDate = new Date('2026-06-11T13:00:00');
    const now = new Date();
    const diff = targetDate - now;
    if (diff > 0) {
      setDaysLeft(Math.floor(diff / (1000 * 60 * 60 * 24)));
    }

    // Find next event (just taking the first event for simplicity in this prototype, or mock it)
    if (events && events.length > 0) {
      setNextEvent(events[0]);
    }
  }, [events]);

  return (
    <div>
      <div className="text-center mb-4" style={{ marginTop: '20px' }}>
        <h2 className="subtitle mb-1">🍋 Palermo, Sicily 🍋</h2>
        <h1 className="title-large serif mb-2">The <br/><span className="highlight">Bachelorette</span></h1>
        <p className="subtitle" style={{ fontSize: '1rem', color: 'var(--text-main)' }}>June 11 – 14, 2026</p>
      </div>

      <div className="card mb-4 text-center">
        <h3 className="serif mb-2" style={{ color: 'var(--primary-blue)', fontSize: '1.5rem' }}>Countdown to Takeoff ✈️</h3>
        <div style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0' }}>
          <div style={{ background: 'var(--bg-color)', padding: '15px 25px', borderRadius: '16px' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--sunset-orange)' }}>{daysLeft}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Days</div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(0,0,0,0.05)', paddingBottom: '10px' }}>
          <h3 className="serif" style={{ color: 'var(--primary-blue)', margin: 0 }}>Next Up</h3>
          <span className="chip active">Day 1</span>
        </div>
        
        {nextEvent ? (
          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
            <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--sky-blue), var(--ocean-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px', fontSize: '24px', boxShadow: '0 4px 10px rgba(0,119,182,0.3)' }}>
              {nextEvent.title.includes('🛬') ? '🧳' : '📍'}
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--primary-blue)' }}>{nextEvent.title}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>{nextEvent.day} @ {nextEvent.time}</div>
            </div>
          </div>
        ) : (
          <p style={{ margin: '20px 0', color: 'var(--text-muted)' }}>No events scheduled.</p>
        )}
      </div>

      <div className="mb-4">
        <h3 className="serif mb-3" style={{ color: 'var(--primary-blue)', paddingLeft: '10px' }}>Quick Links</h3>
        <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', padding: '0 10px 10px', scrollbarWidth: 'none' }}>
          <Link href="/itinerary" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div className="card" style={{ width: '120px', textAlign: 'center', marginBottom: 0 }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📋</div>
              <div style={{ fontWeight: '800', color: 'var(--primary-blue)', fontSize: '0.9rem' }}>Itinerary</div>
            </div>
          </Link>
          <Link href="/map" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div className="card" style={{ width: '120px', textAlign: 'center', marginBottom: 0 }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🗺️</div>
              <div style={{ fontWeight: '800', color: 'var(--primary-blue)', fontSize: '0.9rem' }}>Locations</div>
            </div>
          </Link>
          <Link href="/finances" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div className="card" style={{ width: '120px', textAlign: 'center', marginBottom: 0 }}>
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💸</div>
              <div style={{ fontWeight: '800', color: 'var(--primary-blue)', fontSize: '0.9rem' }}>Finances</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
