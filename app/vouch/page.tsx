'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabaseUrl = 'https://ytrtivbepvpjbgdtuqrt.supabase.co';
const supabaseKey = 'sb_publishable_qWOJctjWQouOqSzjek73pw_FYz7MbyS';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

export default function VouchPage() {
  const [rating, setRating] = useState(5);
  const [orderCode, setOrderCode] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [vouchGame, setVouchGame] = useState('');
  const [vouchFeedback, setVouchFeedback] = useState('');
  const [orderPreviewText, setOrderPreviewText] = useState('');
  const [orderPreviewColor, setOrderPreviewColor] = useState('');
  const [verifiedOrderData, setVerifiedOrderData] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSetRating = (val: number) => {
    setRating(val);
  };

  const handleFetchOrderByCode = async (val: string) => {
    const code = val.trim().toUpperCase();
    setOrderCode(code);

    if (!code) {
      setOrderPreviewText('');
      setVerifiedOrderData(null);
      return;
    }

    try {
      const { data: orderData, error: orderError } = await supabaseClient
        .from('orders')
        .select('*')
        .eq('order_id', code)
        .single();

      if (orderError || !orderData) {
        setOrderPreviewColor('#ff5f56');
        setOrderPreviewText('❌ No order found with this code.');
        setVerifiedOrderData(null);
        return;
      }

      const orderStatus = String(orderData.status || "").trim().toLowerCase();
      if (orderStatus !== 'completed') {
        setOrderPreviewColor('#ff5f56');
        setOrderPreviewText(`❌ Transaction is not yet completed (Status: ${orderData.status}). Must be 'Completed'.`);
        setVerifiedOrderData(null);
        return;
      }

      const { data: itemData } = await supabaseClient
        .from('accounts')
        .select('*')
        .eq('id', orderData.item_id)
        .single();

      setVerifiedOrderData({ order: orderData, item: itemData || {} });
      setOrderPreviewColor('#00e676');
      setOrderPreviewText(`✅ Verified & Completed! Item ID: ${orderData.item_id} (₱${orderData.price})`);

      if (orderData.game) {
        setVouchGame(orderData.game);
      }
    } catch {
      setOrderPreviewText('');
      setVerifiedOrderData(null);
    }
  };

  const handleSubmitVouch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedOrderData) {
      alert("Please enter a valid and 'Completed' Order Code.");
      return;
    }

    setIsLoading(true);

    try {
      const item = verifiedOrderData.item || {};
      const order = verifiedOrderData.order || {};

      const newVouch = {
        customer_name: customerName.trim(),
        game: vouchGame,
        item_id: order.item_id || item.id || null,
        order_code: order.order_id || orderCode.trim(),
        rating: rating,
        feedback: vouchFeedback.trim(),
        image_url: item.image_url || item.imageUrl || null,
        price: order.price || item.price || 0,
        money: item.money || null,
        money_per_second: item.moneyPerSecond || null,
        speed: item.speed || null,
        steals: item.steals || null,
        rebirth: item.rebirth || null,
        admin_panel: item.adminpanel || null,
        level: item.level || null,
        bounty: item.bounty || null,
        fruit: item.fruit || null,
        fighting_style: item.fightingStyle || null,
        race: item.race || null,
        mc_access: item.mcAccess || null,
        mc_platform: item.mcPlatform || null,
        mc_rank: item.mcRank || item.mcRank || null,
        mc_capes: item.mcCapes || null,
        status: 'Pending',
        date_added: new Date().toISOString().split('T')[0]
      };

      const { error } = await supabaseClient.from('vouches').insert([newVouch]);
      if (error) throw error;

      setIsSubmitted(true);
    } catch (err: any) {
      alert("Error submitting vouch: " + err.message);
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#050706] text-[#eef4f0] flex justify-center items-center p-5 font-sans">
      <div className="bg-[#0a0f0d] border border-[#17221c] rounded-2xl max-w-[480px] w-full p-8 shadow-2xl text-center backdrop-blur-md">
        {!isSubmitted ? (
          <div>
            <h1 className="text-[#00e676] text-xl font-black mb-1.5 uppercase tracking-wide">Submit Your Vouch</h1>
            <p className="text-[#7c8f85] text-xs mb-6 font-medium">Enter your Order Code to submit a verified review.</p>

            <form onSubmit={handleSubmitVouch}>
              <div className="mb-4 text-left">
                <label className="block mb-1.5 text-[9px] text-[#7c8f85] font-black uppercase tracking-wider">Order Code (e.g. ORD-XXXXXX)</label>
                <input 
                  type="text" 
                  value={orderCode}
                  onChange={(e) => handleFetchOrderByCode(e.target.value)}
                  className="w-full p-3 bg-[#050706] border border-[#22332a] rounded-[10px] text-white text-xs outline-none focus:border-[#00d564]"
                  placeholder="Enter your Order Code here" 
                  required 
                />
                {orderPreviewText && (
                  <div className="bg-[#111814] border border-[#22332a] rounded-[10px] p-3 mt-2 text-xs text-left" style={{ color: orderPreviewColor }}>
                    {orderPreviewText}
                  </div>
                )}
              </div>

              <div className="mb-4 text-left">
                <label className="block mb-1.5 text-[9px] text-[#7c8f85] font-black uppercase tracking-wider">Your Name (or Facebook Name)</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-3 bg-[#050706] border border-[#22332a] rounded-[10px] text-white text-xs outline-none focus:border-[#00d564]"
                  placeholder="e.g. John Doe" 
                  required 
                />
              </div>

              <div className="mb-4 text-left">
                <label className="block mb-1.5 text-[9px] text-[#7c8f85] font-black uppercase tracking-wider">Game or Item Purchased</label>
                <select 
                  value={vouchGame}
                  onChange={(e) => setVouchGame(e.target.value)}
                  className="w-full p-3 bg-[#050706] border border-[#22332a] rounded-[10px] text-white text-xs outline-none focus:border-[#00d564]"
                  required
                >
                  <option value="" disabled>Select game category</option>
                  <option value="Steal An Egg">Steal An Egg</option>
                  <option value="Steal A Brainrot">Steal A Brainrot</option>
                  <option value="Blox Fruits">Blox Fruits</option>
                  <option value="Minecraft">Minecraft</option>
                  <option value="Digital Goods">Digital Goods / Accounts</option>
                  <option value="General Shop / Items">General Shop / Items</option>
                </select>
              </div>

              <div className="mb-4 text-left">
                <label className="block mb-1.5 text-[9px] text-[#7c8f85] font-black uppercase tracking-wider">Rating</label>
                <div className="flex gap-1.5 text-2xl cursor-pointer mt-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                      key={star} 
                      onClick={() => handleSetRating(star)}
                      className={star <= rating ? 'text-[#ffbd2e]' : 'text-[#22332a]'}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4 text-left">
                <label className="block mb-1.5 text-[9px] text-[#7c8f85] font-black uppercase tracking-wider">Feedback / Message</label>
                <textarea 
                  value={vouchFeedback}
                  onChange={(e) => setVouchFeedback(e.target.value)}
                  className="w-full p-3 bg-[#050706] border border-[#22332a] rounded-[10px] text-white text-xs outline-none focus:border-[#00d564] resize-vertical min-h-[90px]"
                  placeholder="Super fast transaction and 100% legit!" 
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full p-3.5 bg-[#00d564] text-black font-black text-xs rounded-[10px] cursor-pointer uppercase transition hover:bg-[#00e676] shadow-lg mt-3"
              >
                {isLoading ? "Verifying..." : "Verify & Submit Vouch"}
              </button>
            </form>
          </div>
        ) : (
          <div className="py-6">
            <h3 className="text-[#00e676] text-lg font-black mb-2">Thank you for your Vouch! 🎉</h3>
            <p className="text-[#7c8f85] text-xs mb-5">Your verified review has been successfully submitted.</p>
            <Link href="/" className="block w-full p-3.5 bg-[#00d564] text-black font-black text-xs rounded-[10px] text-center uppercase no-underline">
              Back to Marketplace
            </Link>
          </div>
        )}

        <div className="mt-5">
          <Link href="/" className="text-[#7c8f85] text-xs font-bold no-underline hover:text-white transition">
            ← Back to Marketplace
          </Link>
        </div>
      </div>
    </main>
  );
}
