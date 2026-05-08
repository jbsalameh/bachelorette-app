"use client";

import { useState, useEffect, useRef } from 'react';
import { useChat } from '@ai-sdk/react';
import { useItinerary } from './ItineraryContext';

export default function AIChatOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [processedTools, setProcessedTools] = useState(new Set());
  const { events, addEvent, updateEvent, deleteEvent, replaceDayEvents } = useItinerary();
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: '/api/chat',
    body: { currentEvents: events } // send context to API
  });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Process Tool Invocations
  useEffect(() => {
    messages.forEach(m => {
      if (m.toolInvocations) {
        m.toolInvocations.forEach(toolInvocation => {
          if (!processedTools.has(toolInvocation.toolCallId)) {
            const args = toolInvocation.args;
            
            try {
              if (toolInvocation.toolName === 'addItineraryEvent') {
                addEvent({ day: args.day, time: args.time, title: args.title, desc: args.desc, mapQuery: args.title });
              } else if (toolInvocation.toolName === 'updateItineraryEvent') {
                updateEvent(args.id, { time: args.time, title: args.title, desc: args.desc });
              } else if (toolInvocation.toolName === 'deleteItineraryEvent') {
                deleteEvent(args.id);
              } else if (toolInvocation.toolName === 'replaceItineraryDay') {
                replaceDayEvents(args.day, args.events);
              }
            } catch(e) {
              console.error("Tool execution error", e);
            }
            
            setProcessedTools(prev => new Set(prev).add(toolInvocation.toolCallId));
          }
        });
      }
    });
  }, [messages, processedTools, addEvent, updateEvent, deleteEvent, replaceDayEvents]);

  const sendStarterPrompt = (prompt) => {
    append({ role: 'user', content: prompt });
  };

  return (
    <>
      <button 
        className="fab" 
        onClick={() => setIsOpen(true)}
        style={{ display: isOpen ? 'none' : 'flex' }}
      >
        💬
      </button>

      {isOpen && (
        <div className="modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="chat-drawer" onClick={e => e.stopPropagation()}>
            <div className="drawer-handle" onClick={() => setIsOpen(false)}></div>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 20px 10px', borderBottom: '1px solid var(--glass-border)' }}>
              <h2 className="serif" style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary-blue)' }}>AI Planner ✨</h2>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', padding: '20px' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>🍋</div>
                  <h3 className="serif" style={{ color: 'var(--primary-blue)' }}>Ciao Bella!</h3>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>I can help you pack, find restaurants, or edit the itinerary.</p>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
                    <button className="chip" onClick={() => sendStarterPrompt("What should I pack for the Favignana boat tour? 👙")}>
                      Pack for Favignana 👙
                    </button>
                    <button className="chip" onClick={() => sendStarterPrompt("Suggest a fun dinner spot in Palermo for Thursday 🍽️")}>
                      Palermo Dinner Spots 🍽️
                    </button>
                    <button className="chip" onClick={() => sendStarterPrompt("Add a morning coffee run on Friday ☕")}>
                      Add Coffee Run ☕
                    </button>
                  </div>
                </div>
              ) : (
                messages.map(m => (
                  <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ 
                      alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                      background: m.role === 'user' ? 'linear-gradient(135deg, var(--ocean-blue), var(--primary-blue))' : 'white',
                      color: m.role === 'user' ? 'white' : 'var(--text-main)',
                      padding: '12px 16px',
                      borderRadius: '16px',
                      borderBottomRightRadius: m.role === 'user' ? '4px' : '16px',
                      borderBottomLeftRadius: m.role === 'user' ? '16px' : '4px',
                      maxWidth: '85%',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '4px', fontWeight: 'bold' }}>
                        {m.role === 'user' ? 'You' : 'Planner ✨'}
                      </div>
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                        {m.content}
                      </div>
                    </div>
                    
                    {m.toolInvocations?.map(toolInvocation => (
                      <div key={toolInvocation.toolCallId} style={{ 
                        alignSelf: 'flex-start', 
                        background: 'var(--lemon-yellow)', 
                        color: 'var(--primary-blue)',
                        padding: '10px 14px', 
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        marginTop: '5px'
                      }}>
                        {toolInvocation.toolName === 'addItineraryEvent' && `✅ Added "${toolInvocation.args.title}"`}
                        {toolInvocation.toolName === 'updateItineraryEvent' && `✅ Updated event "${toolInvocation.args.title || toolInvocation.args.id}"`}
                        {toolInvocation.toolName === 'deleteItineraryEvent' && `🗑️ Removed event`}
                        {toolInvocation.toolName === 'replaceItineraryDay' && `🔄 Replaced itinerary for ${toolInvocation.args.day}`}
                      </div>
                    ))}
                  </div>
                ))
              )}
              {isLoading && (
                <div style={{ alignSelf: 'flex-start', background: 'white', padding: '12px 16px', borderRadius: '16px', borderBottomLeftRadius: '4px', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                  Thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', padding: '15px 20px', background: 'white', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
              <input
                className="input-field"
                style={{ margin: 0, flex: 1, background: 'var(--bg-color)' }}
                value={input}
                placeholder="Message AI Planner..."
                onChange={handleInputChange}
                disabled={isLoading}
              />
              <button 
                type="submit" 
                disabled={isLoading || !(input || '').trim()}
                style={{ 
                  background: 'linear-gradient(135deg, var(--sunset-orange), #FF5A82)', 
                  color: 'white',
                  border: 'none', 
                  borderRadius: '12px', 
                  width: '50px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '20px', 
                  cursor: (isLoading || !(input || '').trim()) ? 'not-allowed' : 'pointer',
                  opacity: (isLoading || !(input || '').trim()) ? 0.6 : 1,
                  transition: 'transform 0.1s'
                }}
              >
                ↗️
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
