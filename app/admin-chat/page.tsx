'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabaseUrl = 'https://ytrtivbepvpjbgdtuqrt.supabase.co';
const supabaseKey = 'sb_publishable_qWOJctjWQouOqSzjek73pw_FYz7MbyS';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    const { data } = await supabaseClient.from('conversations').select('*').order('updated_at', { ascending: false });
    if (data) setConversations(data);
  };

  const selectConversation = async (convId: string) => {
    setActiveConvId(convId);
    const { data } = await supabaseClient.from('messages').select('*').eq('conversation_id', convId).order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const sendAdminMessage = async () => {
    if (!replyText.trim() || !activeConvId) return;

    await supabaseClient.from('messages').insert([{
      conversation_id: activeConvId,
      sender: 'admin',
      message: replyText.trim()
    }]);

    await supabaseClient.from('conversations').update({
      last_message: 'Admin: ' + replyText.trim(),
      updated_at: new Date()
    }).eq('id', activeConvId);

    setReplyText('');
    selectConversation(activeConvId);
  };

  return (
    <main className="h-screen bg-[#050706] text-[#eef4f0] flex flex-col font-sans overflow-hidden">
      <div className="flex justify-between items-center px-6 py-4 bg-[#0a0f0d] border-b border-[#17221c]">
        <h2 className="text-[#00e676] text-lg font-black flex items-center gap-2">💬 Live Support Dashboard</h2>
        <Link href="/admin" className="bg-[#111814] border border-[#22332a] text-white text-xs font-black px-4 py-2.5 rounded-[10px] no-underline">
          ← Back to Admin Panel
        </Link>
      </div>

      <div className="flex flex-1 h-[calc(100vh-65px)] overflow-hidden">
        {/* Sidebar */}
        <div className="w-[340px] bg-[#0a0f0d] border-r border-[#17221c] flex flex-col">
          <div className="p-4 text-[10px] font-black text-[#7c8f85] uppercase border-b border-[#17221c] bg-[#111814]">Active Conversations ({conversations.length})</div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((c) => (
              <div 
                key={c.id} 
                onClick={() => selectConversation(c.id)} 
                className={`p-4 border-b border-[#17221c] cursor-pointer transition ${activeConvId === c.id ? 'bg-[rgba(0,213,100,0.12)] border-l-4 border-l-[#00d564]' : 'hover:bg-[#111814]'}`}
              >
                <div className="font-extrabold text-xs text-white mb-1">{c.customer_name || 'Customer'}</div>
                <div className="text-[11px] text-[#7c8f85] truncate">{c.last_message || 'No message'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Pane */}
        <div className="flex-1 flex flex-col bg-[#050706]">
          {activeConvId ? (
            <>
              <div className="p-4 bg-[#0a0f0d] border-b border-[#17221c] text-xs font-black text-white">
                Active Chat ID: <span className="text-[#00e676]">{activeConvId}</span>
              </div>
              <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-3">
                {messages.map((m, idx) => (
                  <div key={idx} className={`p-3 rounded-xl max-w-[65%] text-xs leading-relaxed ${m.sender === 'admin' ? 'self-end bg-[#00d564] text-black font-bold' : 'self-start bg-[#111814] text-white border border-[#22332a]'}`}>
                    <span className="text-[8px] block opacity-70 mb-1 uppercase font-black">{m.sender === 'admin' ? 'Admin' : 'Customer'}</span>
                    {m.message}
                  </div>
                ))}
              </div>
              <div className="p-4 bg-[#0a0f0d] border-t border-[#17221c] flex gap-3">
                <input 
                  type="text" 
                  value={replyText} 
                  onChange={(e) => setReplyText(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && sendAdminMessage()}
                  className="flex-1 p-3 bg-[#050706] border border-[#22332a] rounded-[10px] text-white text-xs outline-none focus:border-[#00d564]"
                  placeholder="Type reply or Order Code (e.g. ORD-XXXXXX)..." 
                />
                <button onClick={sendAdminMessage} className="bg-[#00d564] text-black font-black px-6 py-3 rounded-[10px] text-xs uppercase cursor-pointer">Send</button>
              </div>
            </>
          ) : (
            <div className="m-auto text-[#7c8f85] text-xs font-bold">Pumili ng conversation sa kaliwa para magsimula.</div>
          )}
        </div>
      </div>
    </main>
  );
}
