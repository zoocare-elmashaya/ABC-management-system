"use client";
import { useEffect, useState } from "react";
import supabase from "../lib/supabaseClient"; 
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faPhone, faChevronRight, faSpinner } from "@fortawesome/free-solid-svg-icons";
export default function SearchBox({ searchnumber }) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasQueried, setHasQueried] = useState(false);
    useEffect(() => {
        const fetchResults = async () => {
            if (!searchnumber || searchnumber.length < 2) {
                setResults([]);
                setHasQueried(false);
                return;
            };
            setLoading(true);
            const { data, error } = await supabase
                .from("owners")
                .select("name, phone")
                .ilike("phone", `%${searchnumber}%`)
                .limit(6);
            if (!error) {
                setResults(data || []);
            }
            setHasQueried(true);
            setLoading(false);
        };
        const debounce = setTimeout(fetchResults, 300);
        return () => clearTimeout(debounce);
    }, [searchnumber]);
    if (loading) return (
        <div className="p-6 text-center animate-pulse">
            <FontAwesomeIcon icon={faSpinner} className="animate-spin text-primary text-sm mb-2" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Scanning Database...</p>
        </div>
    );
    if (hasQueried && results.length === 0) return (
        <div className="p-6 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">No client phone number matched</p>
        </div>
    );
    if (results.length === 0) return null;
    return (
        <div className="flex flex-col max-h-[400px] overflow-y-auto">
            <div className="bg-slate-50/50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic">Quick Matches</span>
                <span className="text-[9px] font-black text-primary uppercase">{results.length} results</span>
            </div>
            {results.map((owner) => (
                <Link key={owner.phone} href={`/owners/${owner.phone}`} className="flex items-center justify-between p-4 hover:bg-primary/5 transition-all group border-b border-slate-50 last:border-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:rotate-3 transition-all shadow-sm">
                            <FontAwesomeIcon icon={faUser} className="text-xs" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-secondary uppercase italic leading-none mb-1 group-hover:text-primary transition-colors">
                                {owner.name}
                            </p>
                            <p className="text-[11px] font-mono font-bold text-slate-400 flex items-center gap-1.5">
                                <FontAwesomeIcon icon={faPhone} className="text-[9px] text-primary/50" /> 
                                {owner.phone}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[8px] font-black text-slate-200 uppercase opacity-0 group-hover:opacity-100 transition-opacity tracking-widest">View Profile</span>
                        <FontAwesomeIcon icon={faChevronRight} className="text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all text-xs" />
                    </div>
                </Link>
            ))}
        </div>
    );
}