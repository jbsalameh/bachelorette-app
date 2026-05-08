import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <div className="text-center mb-4" style={{ marginTop: '20px' }}>
        <h2 className="subtitle mb-1">🍋 Palermo, Sicily 🍋</h2>
        <h1 className="title-large serif mb-2">The <br/><span className="highlight">Bachelorette</span></h1>
        <p className="subtitle" style={{ fontSize: '1rem', color: 'var(--text-main)' }}>June 11 – 14, 2026</p>
      </div>

      <div className="glass-panel mb-4 text-center">
        <h3 className="serif mb-2" style={{ color: 'var(--primary-blue)', fontSize: '1.5rem' }}>Countdown to Takeoff ✈️</h3>
        <div style={{ display: 'flex', justifyContent: 'space-around', margin: '20px 0' }}>
          <div style={{ background: 'white', padding: '15px 25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--sunset-orange)' }}>763</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Days</div>
          </div>
          <div style={{ background: 'white', padding: '15px 25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--ocean-blue)' }}>12</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Hours</div>
          </div>
        </div>
      </div>

      <div className="glass-panel mb-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(0,0,0,0.05)', paddingBottom: '10px' }}>
          <h3 className="serif" style={{ color: 'var(--primary-blue)', margin: 0 }}>Next Up</h3>
          <span className="tag">Day 1</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
          <div style={{ width: '50px', height: '50px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--sky-blue), var(--ocean-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px', fontSize: '24px', boxShadow: '0 4px 10px rgba(0,119,182,0.3)' }}>
            🧳
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--primary-blue)' }}>Arrival & Old Town</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>Thu, June 11 @ 13:00</div>
          </div>
        </div>
        <Link href="/itinerary" style={{ textDecoration: 'none' }}>
          <button className="btn-primary">View Full Itinerary</button>
        </Link>
      </div>
      
      <div className="glass-panel text-center">
        <h3 className="serif mb-2" style={{ color: 'var(--primary-blue)' }}>Ask the AI Planner ✨</h3>
        <p className="subtitle" style={{ fontSize: '0.9rem', marginBottom: '15px', textTransform: 'none' }}>Need packing tips or local recommendations?</p>
        <Link href="/chat" style={{ textDecoration: 'none' }}>
          <button className="btn-secondary" style={{ width: '100%' }}>Chat with AI Planner</button>
        </Link>
      </div>
    </div>
  );
}
