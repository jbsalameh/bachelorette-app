export default function MapPage() {
  return (
    <div>
      <h1 className="title-large serif mb-3 text-center">Locations</h1>
      
      <div className="glass-panel mb-4 text-center">
        <h3 className="serif mb-2" style={{ color: 'var(--primary-blue)' }}>Key Spots 🗺️</h3>
        <p className="subtitle" style={{ fontSize: '0.9rem', marginBottom: '15px' }}>Tap any location to open in Maps</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <a href="#" style={{ textDecoration: 'none', background: 'white', padding: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '24px', marginRight: '15px' }}>📍</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '800', color: 'var(--primary-blue)' }}>Palermo Airport (PMO)</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Punta Raisi, Sicily</div>
            </div>
          </a>

          <a href="#" style={{ textDecoration: 'none', background: 'white', padding: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '24px', marginRight: '15px' }}>🏨</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '800', color: 'var(--primary-blue)' }}>Airbnb / Hotel</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Old Town, Palermo</div>
            </div>
          </a>

          <a href="#" style={{ textDecoration: 'none', background: 'white', padding: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '24px', marginRight: '15px' }}>🍽️</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '800', color: 'var(--primary-blue)' }}>OVER Rooftop</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Via Nicolò Gallo</div>
            </div>
          </a>

          <a href="#" style={{ textDecoration: 'none', background: 'white', padding: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '24px', marginRight: '15px' }}>⛵</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '800', color: 'var(--primary-blue)' }}>Trapani Port</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Liberty Lines Terminal</div>
            </div>
          </a>
        </div>
      </div>
      
      <div className="glass-panel" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--sky-blue), var(--ocean-blue))', color: 'white' }}>
        <div className="text-center">
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>🗺️</div>
          <h3 className="serif">Interactive Map</h3>
          <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>Coming soon in V2</p>
        </div>
      </div>
    </div>
  );
}
