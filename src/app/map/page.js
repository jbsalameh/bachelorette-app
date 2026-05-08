"use client";

import { useState } from 'react';

const mapLocations = [
  { day: 'Thursday, June 11', cat: 'Transport', emoji: '✈️', name: 'Palermo Airport (PMO)', area: 'Punta Raisi', query: 'Palermo Airport PMO' },
  { day: 'Thursday, June 11', cat: 'Restaurants', emoji: '🍽️', name: 'Retrobottega', area: 'Quattro Canti', query: 'Retrobottega di Prezzemolo & Vitale Palermo' },
  { day: 'Thursday, June 11', cat: 'Nightlife', emoji: '🍹', name: 'Politeama Roof', area: 'Piazza Ruggero Settimo', query: 'Politeama Roof Palermo' },
  { day: 'Thursday, June 11', cat: 'Restaurants', emoji: '🍝', name: 'Taverna Calderai', area: 'Via dell\'Orologio', query: 'Taverna Calderai Palermo' },
  { day: 'Friday, June 12', cat: 'Transport', emoji: '🚂', name: 'Palermo Centrale', area: 'City Center', query: 'Palermo Centrale' },
  { day: 'Friday, June 12', cat: 'Beaches', emoji: '🏖️', name: 'Lido Maljk', area: 'Cefalù', query: 'Lido Maljk Cefalu' },
  { day: 'Friday, June 12', cat: 'Restaurants', emoji: '🍣', name: 'OVER Rooftop', area: 'Via Nicolò Gallo', query: 'OVER Rooftop Palermo' },
  { day: 'Friday, June 12', cat: 'Nightlife', emoji: '🪩', name: 'Anima Mondello', area: 'Mondello', query: 'Anima Mondello' },
  { day: 'Saturday, June 13', cat: 'Beaches', emoji: '⛵', name: 'Trapani Port (Liberty Lines)', area: 'Trapani', query: 'Liberty Lines Trapani' },
  { day: 'Sunday, June 14', cat: 'Beaches', emoji: '🌅', name: 'Bar Galatea', area: 'Mondello', query: 'Bar Galatea Mondello' },
];

export default function MapPage() {
  const [filter, setFilter] = useState('All');
  
  const categories = ['All', 'Restaurants', 'Beaches', 'Nightlife', 'Transport'];

  const filtered = filter === 'All' 
    ? mapLocations 
    : mapLocations.filter(loc => loc.cat === filter);

  // Group by day
  const grouped = filtered.reduce((acc, loc) => {
    if (!acc[loc.day]) acc[loc.day] = [];
    acc[loc.day].push(loc);
    return acc;
  }, {});

  return (
    <div>
      <h1 className="title-large serif mb-3 text-center">Locations</h1>
      
      {/* Category Filter */}
      <div className="tabs-container">
        {categories.map(cat => (
          <div 
            key={cat} 
            className={`pill-tab ${filter === cat ? 'active' : ''}`}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </div>
        ))}
      </div>
      
      {/* Visual Map Anchor (Non-interactive embed for aesthetics) */}
      <div style={{ borderRadius: '20px', overflow: 'hidden', height: '180px', marginBottom: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <iframe 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          loading="lazy" 
          allowFullScreen 
          src="https://maps.google.com/maps?q=Palermo+Sicily&t=m&z=12&output=embed&iwloc=near"
        ></iframe>
      </div>

      {Object.entries(grouped).map(([day, locs]) => (
        <div key={day} className="mb-4">
          <h3 className="serif" style={{ color: 'var(--primary-blue)', marginBottom: '12px', fontSize: '1.1rem', paddingLeft: '8px' }}>
            {day.split(',')[0].toUpperCase()}
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {locs.map((loc, i) => (
              <a 
                key={i} 
                href={`https://maps.google.com/?q=${encodeURIComponent(loc.query)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="card" 
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', margin: 0 }}
              >
                <div style={{ fontSize: '28px', marginRight: '16px', background: 'var(--bg-color)', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
                  {loc.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '800', color: 'var(--primary-blue)', fontSize: '1.05rem' }}>{loc.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{loc.area}</div>
                </div>
                <div style={{ color: 'var(--ocean-blue)', fontWeight: '800', fontSize: '0.8rem', background: 'var(--bg-color)', padding: '6px 12px', borderRadius: '20px' }}>
                  Open ↗
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
      
      {Object.keys(grouped).length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
          No locations found for this category.
        </div>
      )}
    </div>
  );
}
