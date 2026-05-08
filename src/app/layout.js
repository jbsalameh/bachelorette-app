export const metadata = {
  title: 'Palermo Bachelorette 🍋',
  description: 'June 11-14, 2026 — Sicily here we come!',
}

import './globals.css';
import ClientShell from '../components/ClientShell';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientShell>
          <main className="app-container">
            {children}
          </main>
        </ClientShell>
      </body>
    </html>
  )
}
