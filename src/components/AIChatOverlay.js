"use client";

import { useState, useRef, useEffect } from 'react';
import { useItinerary } from './ItineraryContext';

export default function AIChatOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { events, addEvent, updateEvent, deleteEvent, replaceDayEvents } = useItinerary();

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  // ── Apply tool calls to itinerary ────────────────────────────────────────
  const applyTools = (toolCalls = []) => {
    toolCalls.forEach(tc => {
      const a = tc.args;
      try {
        if (tc.toolName === 'addItineraryEvent')
          addEvent({ day: a.day, time: a.time, title: a.title, desc: a.desc, mapQuery: a.mapQuery || '', phone: a.phone || '' });
        else if (tc.toolName === 'updateItineraryEvent')
          updateEvent(a.id, { time: a.time, title: a.title, desc: a.desc, mapQuery: a.mapQuery, phone: a.phone });
        else if (tc.toolName === 'deleteItineraryEvent')
          deleteEvent(a.id);
        else if (tc.toolName === 'replaceItineraryDay')
          replaceDayEvents(a.day, a.events);
      } catch (e) {
        console.error('Tool apply error', e);
      }
    });
  };

  // ── Send message ─────────────────────────────────────────────────────────
  const send = async () => {
    const text = chatInput.trim();
    if (!text || isLoading) return;

    const userMsg = { id: Date.now().toString(), role: 'user', content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setChatInput('');
    setIsLoading(true);

    try {
      // Strip extra fields — AI SDK only accepts { role, content }
      const cleanMessages = updatedMessages.map(({ role, content }) => ({ role, content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: cleanMessages, currentEvents: events }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      applyTools(data.toolCalls);

      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', content: data.text, toolCalls: data.toolCalls || [] },
      ]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        { id: Date.now().toString(), role: 'assistant', content: `⚠️ Error: ${err.message}`, toolCalls: [] },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendPrompt = (prompt) => {
    const userMsg = { id: Date.now().toString(), role: 'user', content: prompt };
    setMessages(prev => {
      const updated = [...prev, userMsg];
      const clean = updated.map(({ role, content }) => ({ role, content }));
      setIsLoading(true);
      fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: clean, currentEvents: events }),
      })
        .then(r => r.json())
        .then(data => {
          applyTools(data.toolCalls);
          setMessages(m => [...m, { id: (Date.now() + 1).toString(), role: 'assistant', content: data.text, toolCalls: data.toolCalls || [] }]);
        })
        .catch(err => {
          setMessages(m => [...m, { id: (Date.now() + 1).toString(), role: 'assistant', content: `⚠️ Error: ${err.message}`, toolCalls: [] }]);
        })
        .finally(() => { setIsLoading(false); });
      return updated;
    });
  };

  const toolLabel = (tc) => {
    if (tc.toolName === 'addItineraryEvent')    return `✅ Added "${tc.args?.title}"`;
    if (tc.toolName === 'updateItineraryEvent') return `✅ Updated event`;
    if (tc.toolName === 'deleteItineraryEvent') return `🗑️ Removed event`;
    if (tc.toolName === 'replaceItineraryDay')  return `🔄 Replaced ${tc.args?.day}`;
    return '';
  };

  return (
    <>
      {/* FAB */}
      <button
        className="fab"
        onClick={() => setIsOpen(true)}
        style={{ display: isOpen ? 'none' : 'flex' }}
        aria-label="Open AI Planner"
      >
        💬
      </button>

      {/* Drawer */}
      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="chat-drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-handle" onClick={() => setIsOpen(false)} style={{ cursor: 'pointer' }} />

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 20px 14px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <h2 className="serif" style={{ margin: 0, fontSize: '1.4rem', color: 'var(--navy)' }}>AI Planner ✨</h2>
                <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '2px' }}>Powered by Gemini</div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: 'var(--muted)', padding: '4px 8px' }}>✕</button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', margin: 'auto', padding: '20px 10px' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🍋</div>
                  <h3 className="serif" style={{ color: 'var(--navy)', marginBottom: '8px' }}>Ciao Bella!</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '20px', lineHeight: 1.5 }}>
                    Ask me anything — packing tips, restaurant picks, or I'll update the itinerary for you!
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                      ['What should I pack for the boat tour? 👙', 'Pack for Favignana 👙'],
                      ['Suggest a fun dinner in Palermo for Thursday 🍽️', 'Dinner Spots 🍽️'],
                      ['Add a morning coffee run on Friday ☕', 'Add Coffee Run ☕'],
                    ].map(([prompt, label]) => (
                      <button
                        key={label}
                        className="chip"
                        onClick={() => sendPrompt(prompt)}
                        style={{ width: '100%', justifyContent: 'center', padding: '12px 16px', fontSize: '0.9rem' }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map(m => (
                  <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{
                      alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                      background: m.role === 'user' ? 'linear-gradient(135deg, var(--ocean), var(--navy))' : 'white',
                      color: m.role === 'user' ? 'white' : 'var(--text)',
                      padding: '11px 15px',
                      borderRadius: '16px',
                      borderBottomRightRadius: m.role === 'user' ? '4px' : '16px',
                      borderBottomLeftRadius: m.role === 'user' ? '16px' : '4px',
                      maxWidth: '85%',
                      fontSize: '0.92rem',
                      lineHeight: 1.55,
                      boxShadow: 'var(--shadow-sm)',
                    }}>
                      <div style={{ fontSize: '0.72rem', opacity: 0.65, marginBottom: '5px', fontWeight: '700' }}>
                        {m.role === 'user' ? 'You' : 'Bella ✨'}
                      </div>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                    </div>

                    {/* Tool call badges */}
                    {(m.toolCalls || []).map((tc, i) => (
                      <div key={i} style={{
                        alignSelf: 'flex-start', background: '#FEFCE8', color: '#854D0E',
                        border: '1px solid #FDE68A', padding: '8px 14px',
                        borderRadius: '12px', fontSize: '0.83rem', fontWeight: '700',
                      }}>
                        {toolLabel(tc)}
                      </div>
                    ))}
                  </div>
                ))
              )}

              {isLoading && (
                <div style={{
                  alignSelf: 'flex-start', background: 'white', padding: '11px 16px',
                  borderRadius: '16px', borderBottomLeftRadius: '4px',
                  color: 'var(--muted)', fontSize: '0.85rem', boxShadow: 'var(--shadow-sm)',
                }}>
                  ✨ Thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input bar */}
            <div style={{ padding: '12px 14px', background: 'white', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                ref={inputRef}
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Message Bella..."
                disabled={isLoading}
                autoComplete="off"
                style={{
                  flex: 1, padding: '12px 16px',
                  border: '2px solid var(--border)', borderRadius: '12px',
                  fontFamily: 'Inter, sans-serif', fontSize: '0.95rem',
                  background: 'var(--cream)', color: 'var(--text)', outline: 'none',
                }}
                onFocus={e => (e.target.style.borderColor = 'var(--ocean)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
              <button
                onClick={send}
                disabled={isLoading || !chatInput.trim()}
                style={{
                  width: '46px', height: '46px', flexShrink: 0,
                  background: chatInput.trim() && !isLoading ? 'linear-gradient(135deg, var(--coral), #BE123C)' : '#E2E8F0',
                  color: chatInput.trim() && !isLoading ? 'white' : '#94A3B8',
                  border: 'none', borderRadius: '12px', fontSize: '20px',
                  cursor: chatInput.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s',
                }}
              >
                ↗
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
