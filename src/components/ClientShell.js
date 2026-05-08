"use client";

import { ItineraryProvider } from './ItineraryContext';
import AIChatOverlay from './AIChatOverlay';

export default function ClientShell({ children }) {
  return (
    <ItineraryProvider>
      {children}
      <AIChatOverlay />
    </ItineraryProvider>
  );
}
