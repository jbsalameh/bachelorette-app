"use client";

import { useChat } from 'ai/react';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function Chat() {
  const [processedTools, setProcessedTools] = useState(new Set());
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    
    // Check for tool invocations
    messages.forEach(m => {
      if (m.toolInvocations) {
        m.toolInvocations.forEach(toolInvocation => {
          if (toolInvocation.toolName === 'addItineraryEvent' && !processedTools.has(toolInvocation.toolCallId)) {
            // Process this tool call locally
            const { day, time, title, desc } = toolInvocation.args;
            
            // Get existing events
            let existingEvents = [];
            const saved = localStorage.getItem('bachelorette_events');
            if (saved) {
              existingEvents = JSON.parse(saved);
            }
            
            // Generate new ID
            const newId = existingEvents.length > 0 ? Math.max(...existingEvents.map(e => e.id)) + 1 : 1;
            
            // Save to localStorage
            const newEvents = [...existingEvents, { id: newId, day, time, title, desc }];
            localStorage.setItem('bachelorette_events', JSON.stringify(newEvents));
            
            // Mark as processed
            setProcessedTools(prev => new Set(prev).add(toolInvocation.toolCallId));
          }
        });
      }
    });
  }, [messages, processedTools]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
        <Link href="/" style={{ textDecoration: 'none', marginRight: '15px', fontSize: '20px' }}>
          ⬅️
        </Link>
        <h1 className="title-large serif" style={{ margin: 0, fontSize: '2rem' }}>AI Planner ✨</h1>
      </div>
      
      <div className="glass-panel" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px', padding: '20px' }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 'auto', marginBottom: 'auto' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🍋</div>
            <h3 className="serif" style={{ color: 'var(--primary-blue)' }}>Ask me anything!</h3>
            <p>I can help with packing lists, Palermo recommendations, or even schedule a new event for us!</p>
          </div>
        ) : (
          messages.map(m => (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ 
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                background: m.role === 'user' ? 'var(--ocean-blue)' : 'white',
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
              
              {/* Render Tool Invocations */}
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
                  ✅ Added "{toolInvocation.args.title}" to the itinerary for {toolInvocation.args.day}!
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

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
        <input
          className="input-field"
          style={{ margin: 0, flex: 1, background: 'white' }}
          value={input}
          placeholder="Ask about Sicily or add an event..."
          onChange={handleInputChange}
          disabled={isLoading}
        />
        <button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          style={{ 
            background: 'linear-gradient(135deg, var(--lemon-yellow), var(--sunset-orange))', 
            border: 'none', 
            borderRadius: '12px', 
            width: '50px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '20px', 
            cursor: (isLoading || !input.trim()) ? 'not-allowed' : 'pointer',
            opacity: (isLoading || !input.trim()) ? 0.6 : 1
          }}
        >
          ↗️
        </button>
      </form>
    </div>
  );
}
