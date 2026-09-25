'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabaseUrl = 'https://ytrtivbepvpjbgdtuqrt.supabase.co';
const supabaseKey = 'sb_publishable_qWOJctjWQouOqSzjek73pw_FYz7MbyS';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [vouches, setVouches] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalItems: 0, pendingOrders: 0, totalSales: 0, openChats: 0 });

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        loadAdminData();
      }
    }
    checkSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setIsAuthenticated(true);
      loadAdminData();
    } catch (err: any) {
      alert("Login Error: " + err.message);
    }
  };

  const loadAdminData = async () => {
    // Load Orders
    const { data: ordData } = await supabaseClient.from('orders').select('*').order('date_added', { ascending: false });
    if (ordData) setOrders(ordData);

    // Load Inventory
    const { data: invData } = await supabaseClient.from('accounts').select('*').order('id', { ascending: false });
    if (invData) {
      setInventory(invData);
      setStats(prev => ({ ...prev, totalItems: invData.filter(i => String(i.status).toLowerCase() === 'available').length }));
    }

    // Load Vouches
    const { data: vData } = await supabaseClient.from('vouches').select('*').order('date_added', { ascending: false });
    if (vData) setVouches(vData);
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#050706] text-[#eef4f0] flex justify-center items-center p-5 font-sans">
        <div className="bg-[#111814] border-2 border-[#00d564] rounded-2xl p-8 max-w-[420px] w-full text-center shadow-2xl">
          <h2 className="text-[#00e676] text-xl font-black mb-2 uppercase">Admin Login</h2>
          <p className="text-[#7c8f85] text-xs mb-6">I-type ang iyong Supabase admin account credentials</p>
          <form onSubmit={handleLogin}>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-3 bg-[#050706] border border-[#22332a] rounded-[10px] text-white text-xs mb-3 outline-none focus:border-[#00d564]"
              placeholder="Admin Email" 
              required 
            />
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-3 bg-[#050706] border border-[#22332a] rounded-[10px] text-white text-xs mb-5 outline-none focus:border-[#00d564]"
              placeholder="Password" 
              required 
            />
            <button type="submit" className="w-full p-3 bg-[#00d564] text-black font-black text-xs rounded-[10px] uppercase cursor-pointer">Log In</button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#050706] text-[#eef4f0] p-8 font-sans">
      <div className="max-w-[1240px] mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-[#17221c] pb-5 flex-wrap gap-4">
          <h1 className="text-white text-2xl font-black uppercase">Admin <span className="text-[#00e676]">Panel</span></h1>
          <div className="flex gap-2.5">
            <Link href="/admin-chat" className="bg-[#00d564] text-black font-black px-4 py-2.5 rounded-[10px] text-xs no-underline">💬 Live Chat Dashboard</Link>
            <Link href="/" className="bg-[#111814] border border-[#22332a] text-white font-bold px-4 py-2.5 rounded-[10px] text-xs no-underline">View Marketplace</Link>
          </div>
        </div>

        {/* Inventory Table Preview */}
        <div className="bg-[#0a0f0d] border border-[#17221c] rounded-2xl p-6 mb-6">
          <div className="text-xs font-black uppercase text-white mb-4 border-l-4 border-[#00d564] pl-3">Manage Inventory ({inventory.length} Items)</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#111814] text-[#7c8f85] uppercase text-[10px]">
                  <th className="p-3">ID</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((item, idx) => (
                  <tr key={idx} className="border-b border-[#17221c] hover:bg-[rgba(0,213,100,0.02)]">
                    <td className="p-3 font-bold text-white">{item.id}</td>
                    <td className="p-3">{item.game}</td>
                    <td className="p-3 text-[#00e676]">₱{item.price}</td>
                    <td className="p-3"><span className="bg-[rgba(0,213,100,0.12)] text-[#00e676] px-2 py-1 rounded-full text-[9px] font-black uppercase">{item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
