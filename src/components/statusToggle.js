'use client';
import { useState } from 'react';
import supabase from '../lib/supabaseClient';
export default function StatusToggle({ recordId, initialStatus }) {
    const [isSent, setIsSent] = useState(initialStatus);
    const [loading, setLoading] = useState(false);
    const handleToggle = async () => {
        setLoading(true);
        const { error } = await supabase
            .from('records')
            .update({ send: !isSent })
            .eq('id', recordId);
        if (!error) {
            setIsSent(!isSent);
        }
        setLoading(false);
    };
    return (
        <label className={`relative flex items-center cursor-pointer ${loading ? 'opacity-50' : ''}`}>
            <input type="checkbox" checked={isSent} onChange={handleToggle}disabled={loading} className="sr-only peer"/>
            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            <span className={`ml-3 text-xs font-black uppercase inline-block min-w-[60px] ${isSent ? 'text-primary' : 'text-slate-400'}`}>
                {isSent ? 'Sent' : 'Pending'}
            </span>
        </label>
    );
}