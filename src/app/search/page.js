import { createClient } from "@/lib/supabaseServer";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faPhone, faArrowRight, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
export default async function Search({ searchParams }) {
    const { query } = await searchParams;
    const supabase = await createClient();
    const searchword = (query || "").trim();
    let filteredOwners = [];
    if (searchword) {
        const { data, error } = await supabase
            .from("owners")
            .select("*")
            .or(`name.ilike.%${searchword}%,phone.ilike.%${searchword}%`)
            .limit(50); // Safety limit
        if (!error && data) {
            filteredOwners = data;
        } else if (error) {
            console.error("Search Error:", error.message);
        }
    }
    return (
        <main className="w-full min-h-screen bg-slate-50 py-6 md:py-10 px-[5%]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-slate-200 pb-6 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-secondary uppercase tracking-tight italic">
                        Search <span className="text-primary">Results</span>
                    </h1>
                    <p className="text-gray-500 font-medium text-sm md:text-base">
                        {searchword ? (
                            <>Showing results for <span className="text-primary font-bold font-mono">"{searchword}"</span></>
                        ) : (
                            "Please enter a name or phone in the search bar"
                        )}
                    </p>
                </div>
                <div className="text-[10px] md:text-sm font-black text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm italic">
                    {filteredOwners.length} Owners Found
                </div>
            </div>
            <div className="hidden md:block bg-white rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-secondary text-white text-xs font-black uppercase tracking-widest italic border-b border-slate-200">
                            <th className="px-8 py-5">Owner Identity</th>
                            <th className="px-8 py-5">Contact Information</th>
                            <th className="px-8 py-5 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredOwners.length > 0 ? (
                            filteredOwners.map((owner) => (
                                <tr key={owner.phone} className="group hover:bg-primary/5 transition-all duration-200">
                                    <td className="px-8 py-6">
                                        <Link href={`/owners/${owner.phone}`} className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                                                <FontAwesomeIcon icon={faUser} />
                                            </div>
                                            <span className="text-xl font-black text-secondary uppercase italic group-hover:text-primary transition-colors">
                                                {owner.name}
                                            </span>
                                        </Link>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2 text-lg font-mono font-bold text-gray-500">
                                            <FontAwesomeIcon icon={faPhone} className="text-xs text-primary" />
                                            {owner.phone}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <Link href={`/owners/${owner.phone}`} className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-300 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                            <FontAwesomeIcon icon={faArrowRight} />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="px-8 py-20 text-center">
                                    <FontAwesomeIcon icon={faMagnifyingGlass} className="text-4xl text-slate-200 mb-4" />
                                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs italic">No matching owners found</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="md:hidden flex flex-col gap-4">
                {filteredOwners.length > 0 ? (
                    filteredOwners.map((owner) => (
                        <Link key={owner.phone} href={`/owners/${owner.phone}`} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between active:scale-95 transition-transform">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                    <FontAwesomeIcon icon={faUser} />
                                </div>
                                <div>
                                    <h3 className="font-black text-secondary uppercase italic">{owner.name}</h3>
                                    <p className="text-sm font-mono font-bold text-primary flex items-center gap-1">
                                        {owner.phone}
                                    </p>
                                </div>
                            </div>
                            <div className="text-primary opacity-30">
                                <FontAwesomeIcon icon={faArrowRight} />
                            </div>
                        </Link>
                    ))
                ) : (
                    <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="text-4xl text-slate-200 mb-3" />
                        <p className="text-slate-400 font-black uppercase italic text-[10px] tracking-widest">
                            {searchword ? "Database returned 0 matches." : "Awaiting input..."}
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}