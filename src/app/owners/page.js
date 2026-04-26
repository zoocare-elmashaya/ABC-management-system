"use client";
import { useState, useEffect, useCallback } from "react";
import supabase from "@/lib/supabaseClient"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faSearch, faChevronRight, faPhone, faSpinner } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
export default function OwnersListPage() {
    const [owners, setOwners] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 20;
    const fetchOwners = useCallback(async (pageNum, search = "") => {
        if (pageNum === 0) setLoading(true);
        else setLoadingMore(true);
        const from = pageNum * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;
        try {
            let query = supabase
                .from("owners")
                .select("name, phone")
                .order("name", { ascending: true })
                .range(from, to);
            if (search) {
                query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
            }
            const { data, error } = await query;
            if (error) {
                console.error("Error fetching owners:", error.message);
            } else if (data) {
                setOwners(prev => pageNum === 0 ? data : [...prev, ...data]);
                if (data.length < ITEMS_PER_PAGE) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }
            }
        } catch (err) {
            console.error("Unexpected error:", err);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            setPage(0);
            fetchOwners(0, searchTerm);
        }, 500); // Wait 500ms after user stops typing to search
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, fetchOwners]);
    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchOwners(nextPage, searchTerm);
    };
    return (
        <main className="w-full min-h-screen bg-slate-50 py-6 md:py-10 px-[4%] md:px-[5%]">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-end mb-8 md:mb-10 border-b border-slate-200 pb-8 gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            {searchTerm ? "Results Found" : `${owners.length} Registered`}
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-secondary uppercase tracking-tight italic">
                        Owners <span className="text-primary text-xl md:text-2xl">Directory</span>
                    </h1>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
                    <div className="relative w-full sm:w-80">
                        <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
                        <input 
                            type="text" 
                            placeholder="Search name or phone..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="w-full bg-white border border-slate-200 py-3 pl-12 pr-4 rounded-2xl text-xs font-bold focus:outline-none focus:border-primary transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl mb-4" />
                    <p className="font-black uppercase tracking-widest text-[10px]">Syncing Owners...</p>
                </div>
            ) : (
                <div className="bg-transparent md:bg-white md:rounded-[2.5rem] md:shadow-xl md:shadow-slate-200/40 md:border md:border-slate-100 overflow-hidden">
                    <table className="hidden md:table w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                                <th className="px-10 py-6">Owner Name</th>
                                <th className="px-10 py-6">Phone Number</th>
                                <th className="px-10 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {owners.map((owner) => (
                                <tr key={owner.phone} className="group hover:bg-primary/5 transition-all duration-300">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                                <FontAwesomeIcon icon={faUsers} className="text-xs" />
                                            </div>
                                            <p className="font-black text-secondary uppercase italic tracking-tight">
                                                {owner.name}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-2 text-slate-500 font-mono font-bold text-sm">
                                            <FontAwesomeIcon icon={faPhone} className="text-[10px] text-slate-300" />
                                            {owner.phone}
                                        </div>
                                    </td>
                                    <td className="px-10 py-6 text-right">
                                        <Link href={`/owners/${owner.phone}`} className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-slate-300 hover:bg-primary hover:text-white transition-all shadow-sm hover:scale-110">
                                            <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="flex flex-col gap-3 md:hidden">
                        {owners.map((owner) => (
                            <Link key={owner.phone} href={`/owners/${owner.phone}`} className="bg-white p-5 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-primary border border-slate-100">
                                        <FontAwesomeIcon icon={faUsers} className="text-sm" />
                                    </div>
                                    <div>
                                        <p className="font-black text-secondary uppercase italic tracking-tight leading-none mb-2 text-sm">
                                            {owner.name}
                                        </p>
                                        <p className="text-slate-400 font-mono font-bold text-[10px]">
                                            {owner.phone}
                                        </p>
                                    </div>
                                </div>
                                <FontAwesomeIcon icon={faChevronRight} className="text-slate-200 text-xs" />
                            </Link>
                        ))}
                    </div>
                    <div className="py-12 flex flex-col items-center gap-4">
                        {hasMore ? (
                            <button onClick={handleLoadMore}disabled={loadingMore} className="bg-white text-secondary border-2 border-secondary/10 px-10 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-secondary hover:text-white transition-all shadow-lg disabled:opacity-50">
                                {loadingMore ? <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" /> : null}
                                {loadingMore ? "Searching..." : "Load More Clients"}
                            </button>
                        ) : owners.length > 0 ? (
                            <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-[9px] italic">
                                End of Directory
                            </p>
                        ) : null}
                    </div>
                    {owners.length === 0 && (
                        <div className="py-20 text-center">
                            <div className="text-slate-200 mb-4 text-5xl">
                                <FontAwesomeIcon icon={faSearch} />
                            </div>
                            <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest italic">
                                {searchTerm ? "No matching clients found" : "Database is empty"}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}