'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabaseUrl = 'https://ytrtivbepvpjbgdtuqrt.supabase.co';
const supabaseKey = 'sb_publishable_qWOJctjWQouOqSzjek73pw_FYz7MbyS';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

export default function Home() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<any[]>([]);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [currentTypeFilter, setCurrentTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vouches, setVouches] = useState<any[]>([]);
  const [announcement, setAnnouncement] = useState('');
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [shopStatus, setShopStatus] = useState('online');

  // Modals
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [dashboardModalOpen, setDashboardModalOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Chat Widget
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [convId, setConvId] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('custom_current_user');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    const savedConv = localStorage.getItem('chat_conv_id');
    if (savedConv) setConvId(savedConv);

    fetchData();
    checkShopStatus();
    checkAnnouncement();
  }, []);

  async function fetchData() {
    const { data: accData } = await supabaseClient.from('accounts').select('*');
    if (accData) {
      const available = accData.filter(a => String(a.status).toLowerCase() === 'available');
      setAccounts(available);
      setFilteredAccounts(available);
    }

    const { data: vouchData } = await supabaseClient
      .from('vouches')
      .select('*')
      .eq('status', 'Approved')
      .order('date_added', { ascending: false })
      .limit(4);
    if (vouchData) setVouches(vouchData);
  }

  async function checkShopStatus() {
    const { data } = await supabaseClient.from('settings').select('value').eq('key', 'shop_status').single();
    if (data) setShopStatus(data.value);
  }

  async function checkAnnouncement() {
    const { data } = await supabaseClient.from('settings').select('value').eq('key', 'site_announcement').single();
    if (data && data.value) {
      setAnnouncement(data.value);
      setShowAnnouncement(true);
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterItems(currentCategory, currentTypeFilter, query);
  };

  const filterItems = (category: string, type: string, query: string) => {
    let temp = [...accounts];
    if (category !== 'all') {
      temp = temp.filter(a => String(a.game).trim().toLowerCase() === category.toLowerCase());
    }
    if (type !== 'all') {
      temp = temp.filter(a => String(a.listing_type || 'Account').toLowerCase() === type.toLowerCase());
    }
    if (query.trim() !== '') {
      const q = query.toLowerCase();
      temp = temp.filter(a => JSON.stringify(a).toLowerCase().includes(q));
    }
    setFilteredAccounts(temp);
  };

  return (
    <main className="min-h-screen bg-[#050706] text-[#eef4f0] font-sans pb-16">
      {/* Top Controls */}
      <div className="fixed top-5 right-5 z-40 flex items-center gap-2">
        <button 
          onClick={() => currentUser ? setDashboardModalOpen(true) : setAuthModalOpen(true)}
          className="bg-[#0a0f0d] border border-[#22332a] text-white px-3.5 py-2 rounded-full text-xs font-bold shadow-lg hover:border-[#00d564] transition"
        >
          👤 {currentUser ? 'Dashboard' : 'Login'}
        </button>
      </div>

      {/* Announcement Modal */}
      {showAnnouncement && (
        <div className="fixed inset-0 bg-black/85 flex justify-center items-center z-50 p-5 backdrop-blur-sm">
          <div className="bg-[#111814] border-2 border-[#00d564] rounded-2xl max-w-[440px] w-full p-8 text-center relative shadow-2xl">
            <button onClick={() => setShowAnnouncement(false)} className="absolute right-4 top-4 bg-[#0a0f0d] border border-[#22332a] text-white w-8 h-8 rounded-full font-bold">×</button>
            <div className="text-3xl mb-3">📢</div>
            <div className="text-[#00e676] text-lg font-black mb-2 uppercase">Official Announcement</div>
            <p className="text-xs text-white leading-relaxed mb-6">{announcement}</p>
            <button onClick={() => setShowAnnouncement(false)} className="w-full bg-[#00d564] text-black font-black py-3 rounded-xl text-xs uppercase">Got It / Close</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="max-w-[1180px] mx-auto px-5 pt-10 text-center">
        <h1 className="text-4xl font-black mb-2">DIGITAL & GAMING <span className="text-[#00e676]">MARKETPLACE</span></h1>
        <p className="text-[#7c8f85] text-sm">Find available Roblox, Minecraft, and Digital Accounts quickly and easily.</p>
        
        <div className="flex justify-center items-center gap-2.5 mt-4">
          <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase ${shopStatus === 'online' ? 'bg-[rgba(0,213,100,0.12)] text-[#00e676]' : 'bg-red-500/10 text-red-400'}`}>
            ● {shopStatus === 'online' ? 'Online & Ready' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="max-w-[880px] mx-auto px-5 mt-8">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search account, item, game, netflix, tiktok, price..."
            className="w-full h-13 px-4 bg-[#0a0f0d] border border-[#22332a] rounded-xl text-xs text-white outline-none focus:border-[#00d564]"
          />
        </div>

        {/* Category Buttons */}
        <div className="flex gap-2 mt-4 flex-wrap justify-center">
          {['all', 'steal an egg', 'steal a brainrot', 'blox fruits', 'minecraft', 'digital goods'].map(cat => (
            <button 
              key={cat}
              onClick={() => { setCurrentCategory(cat); filterItems(cat, currentTypeFilter, searchQuery); }}
              className={`px-3 py-2 rounded-lg text-[10px] font-extrabold uppercase transition border ${currentCategory === cat ? 'bg-[#00d564] border-[#00d564] text-black' : 'bg-[#0a0f0d] border-[#17221c] text-[#7c8f85]'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Account Grid */}
      <div className="max-w-[1180px] mx-auto px-5 mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredAccounts.map(acc => (
          <div key={acc.id} className="bg-[#0a0f0d] border border-[#17221c] rounded-2xl p-5 flex flex-col justify-between shadow-lg">
            <div>
              <span className="text-[9px] bg-[#111814] border border-[#17221c] px-2.5 py-1 rounded-full text-[#7c8f85] font-bold uppercase">{acc.game}</span>
              <div className="text-lg font-black text-white mt-3 mb-2">{acc.id}</div>
              <div className="text-[11px] text-[#7c8f85] mb-4">{acc.account || acc.dgPlatform || 'Verified Item'}</div>
            </div>
            <div>
              <div className="flex justify-between items-center bg-[#111814] p-3 rounded-xl border border-[#17221c] mb-3">
                <span className="text-[9px] font-bold text-[#7c8f85] uppercase">Price</span>
                <span className="text-lg font-black text-[#00e676]">₱{acc.price}</span>
              </div>
              <button 
                onClick={() => { setSelectedItem(acc); setCheckoutModalOpen(true); }}
                className="w-full bg-[#00d564] text-black font-black py-3 rounded-xl text-xs uppercase hover:bg-[#00e676] transition shadow-md"
              >
                🛒 Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Vouches Section */}
      <div className="max-w-[1180px] mx-auto px-5 mt-16">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-black border-l-4 border-[#00d564] pl-3 uppercase">Customer Vouches & Reviews</h2>
          <div className="flex gap-2">
            <Link href="/reviews" className="bg-[#111814] border border-[#17221c] text-white px-3 py-2 rounded-lg text-[10px] font-extrabold no-underline">📁 View All</Link>
            <Link href="/vouch" className="bg-[#0a0f0d] border border-[#17221c] text-[#00e676] px-3 py-2 rounded-lg text-[10px] font-extrabold no-underline">✍️ Write Vouch</Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {vouches.map((v, idx) => (
            <div key={idx} className="bg-[#0a0f0d] border border-[#17221c] rounded-xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-xs text-white">{v.customer_name}</span>
                  <span className="text-[#ffbd2e] text-xs">{'★'.repeat(v.rating)}</span>
                </div>
                <p className="text-[11px] text-[#7c8f85] italic mb-3">"{v.feedback}"</p>
              </div>
              <span className="text-[9px] text-[#00d564] font-bold uppercase">{v.game}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Checkout Modal */}
      {checkoutModalOpen && selectedItem && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-5 backdrop-blur-sm">
          <div className="bg-[#111814] border border-[#22332a] rounded-2xl max-w-[480px] w-full p-6 relative">
            <button onClick={() => setCheckoutModalOpen(false)} className="absolute right-4 top-4 text-white font-bold">×</button>
            <h3 className="text-[#00e676] text-base font-black uppercase mb-1">Complete Your Order</h3>
            <p className="text-xs text-[#7c8f85] mb-4">Item ID: <b>{selectedItem.id}</b> | Price: <b className="text-[#00e676]">₱{selectedItem.price}</b></p>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              const code = "ORD-" + Math.random().toString(36).substring(2, 8).toUpperCase();
              await supabaseClient.from('orders').insert([{
                order_id: code,
                customer_name: (e.target as any).buyerName.value,
                contact_info: (e.target as any).contact.value,
                item_id: selectedItem.id,
                game: selectedItem.game,
                price: `₱${selectedItem.price}`,
                payment_method: (e.target as any).paymentMethod.value,
                status: 'Processing',
                date_added: new Date().toISOString().split('T')[0]
              }]);
              alert(`Order placed successfully! Order Code: ${code}`);
              setCheckoutModalOpen(false);
            }}>
              <div className="mb-3">
                <label className="block text-[10px] text-[#7c8f85] font-bold uppercase mb-1">Your Name</label>
                <input name="buyerName" className="w-full p-3 bg-[#050706] border border-[#22332a] rounded-xl text-xs text-white" required />
              </div>
              <div className="mb-3">
                <label className="block text-[10px] text-[#7c8f85] font-bold uppercase mb-1">Contact Info (FB Link / Email)</label>
                <input name="contact" className="w-full p-3 bg-[#050706] border border-[#22332a] rounded-xl text-xs text-white" required />
              </div>
              <div className="mb-4">
                <label className="block text-[10px] text-[#7c8f85] font-bold uppercase mb-1">Payment Method</label>
                <select name="paymentMethod" className="w-full p-3 bg-[#050706] border border-[#22332a] rounded-xl text-xs text-white">
                  <option value="GCash">GCash</option>
                  <option value="MariBank">MariBank</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-[#00d564] text-black font-black py-3 rounded-xl text-xs uppercase">Submit Order</button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
