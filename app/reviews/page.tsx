'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabaseUrl = 'https://ytrtivbepvpjbgdtuqrt.supabase.co';
const supabaseKey = 'sb_publishable_qWOJctjWQouOqSzjek73pw_FYz7MbyS';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      const { data } = await supabaseClient
        .from('vouches')
        .select('*')
        .eq('status', 'Approved')
        .order('date_added', { ascending: false });

      if (data) setReviews(data);
      setLoading(false);
    }
    fetchReviews();
  }, []);

  const formatPrice = (price: any) => {
    let value = String(price || "").replace(/₱/g, "").replace(/,/g, "");
    const num = parseFloat(value.replace(/[^0-9.-]/g, ""));
    return isNaN(num) ? "₱0" : "₱" + num.toLocaleString("en-PH");
  };

  return (
    <main className="min-h-screen bg-[#050706] text-[#eef4f0] p-9 font-sans">
      <div className="max-w-[1140px] mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-[#00e676] text-xs font-extrabold no-underline mb-6 transition hover:opacity-80">
          ← Back to Marketplace
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-white text-2xl font-black mb-2 uppercase tracking-tight">All Customer <span className="text-[#00e676]">Reviews</span></h1>
          <p className="text-[#7c8f85] text-xs font-medium">All approved vouches from our customers along with the purchased item details.</p>
        </div>

        {loading ? (
          <div className="text-[#7c8f85] text-xs text-center py-10">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-[#7c8f85] text-xs text-center py-10">No published reviews or vouches yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {reviews.map((v, i) => (
              <div key={i} className="bg-[#0a0f0d] border border-[#17221c] rounded-2xl p-5 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="bg-[#050706] border border-[#22332a] rounded-xl p-3.5 mb-4">
                    {v.image_url && (
                      <img src={v.image_url} alt="Item" className="w-full h-[150px] object-cover rounded-[9px] mb-3 bg-[#111814] border border-[#17221c]" />
                    )}
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-[9px] text-[#7c8f85] font-black uppercase bg-[#111814] px-2.5 py-1 rounded-full border border-[#22332a]">{v.game || 'General'}</span>
                      <span className="text-[8px] text-[#e89a24] font-black bg-[rgba(232,154,36,0.1)] px-2.5 py-1 rounded-full border border-[rgba(232,154,36,0.25)] uppercase">Sold Out</span>
                    </div>
                    <div className="text-[8px] text-[#7c8f85] uppercase font-extrabold tracking-wider mt-1">Item / Account ID</div>
                    <div className="text-[15px] font-black text-white mb-2.5">{v.item_id || v.order_code || 'N/A'}</div>

                    {v.money && <div className="flex justify-between text-[11px] py-1 border-b border-[#17221c]"><span className="text-[#7c8f85]">Money</span><span className="text-[#ddd] font-bold">{v.money}</span></div>}
                    {v.level && <div className="flex justify-between text-[11px] py-1 border-b border-[#17221c]"><span className="text-[#7c8f85]">Level</span><span className="text-[#ddd] font-bold">{v.level}</span></div>}
                    {v.bounty && <div className="flex justify-between text-[11px] py-1 border-b border-[#17221c]"><span className="text-[#7c8f85]">Bounty</span><span className="text-[#ddd] font-bold">{v.bounty}</span></div>}
                    {v.fruit && <div className="flex justify-between text-[11px] py-1 border-b border-[#17221c]"><span className="text-[#7c8f85]">Fruit</span><span className="text-[#ddd] font-bold">{v.fruit}</span></div>}

                    <div className="flex justify-between items-center bg-[#111814] border border-[#22332a] p-2.5 rounded-[9px] mt-3">
                      <span className="text-[9px] text-[#7c8f85] font-extrabold uppercase">Sold Price</span>
                      <span className="text-[15px] text-[#00e676] font-black">{formatPrice(v.price)}</span>
                    </div>
                    <div className="text-center bg-[rgba(0,213,100,0.12)] border border-[rgba(0,213,100,0.2)] text-[#00e676] text-[9px] font-black p-2 rounded-[9px] mt-2.5 uppercase tracking-wider">
                      🔒 Transaction Completed
                    </div>
                  </div>
                </div>

                <div className="bg-[#111814] border border-[#22332a] rounded-xl p-3.5 mt-auto">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-white">{v.customer_name}</span>
                    <span className="text-[#ffbd2e] text-xs">{'★'.repeat(Number(v.rating) || 5)}</span>
                  </div>
                  <div className="text-[11px] text-[#ccc] leading-relaxed italic break-words">"{v.feedback}"</div>
                  <div className="text-[9px] text-[#7c8f85] text-right mt-2 font-semibold">{v.date_added || ''}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
