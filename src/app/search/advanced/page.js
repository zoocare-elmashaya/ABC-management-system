import { createClient } from "@/lib/supabaseServer";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faUndo, faFilter, faPaw, faUser, faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
function calculateAge(birthDate) {
    if (!birthDate) return "N/A";
    const today = new Date();
    const birth = new Date(birthDate);
    const diffTime = today - birth;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 30) return `${diffDays} D`;
    let years = today.getFullYear() - birth.getFullYear();
    let months = (today.getMonth() + 12 * years) - birth.getMonth();
    if (months < 12) return `${months} M`;
    if (today.getMonth() < birth.getMonth() || 
       (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
        years--;
    }
    return `${years} Y`;
}
export default async function AdvancedSearch({ searchParams }) {
    const params = await searchParams;
    const supabase = await createClient();
    const {
        ownerName = "",
        phone = "",
        petName = "",
        gender = "All",
        species = "All",
        type = "All",
        dateFrom = "",
        dateTo = "",
        dueFrom = "",
        dueTo = ""
    } = params;
    let query = supabase
        .from("records")
        .select(`
            *,
            owners!inner(name, phone),
            animals!inner(name, gender, species, birth_date),
            products!inner(name, type)
        `);
    if (ownerName) query = query.ilike("owners.name", `%${ownerName}%`);
    if (phone) query = query.ilike("owners.phone", `%${phone}%`);
    if (petName) query = query.ilike("animals.name", `%${petName}%`);
    if (gender !== "All") query = query.eq("animals.gender", gender);
    if (species !== "All") query = query.eq("animals.species", species);
    if (type !== "All") query = query.eq("products.type", type);
    if (dateFrom) query = query.gte("date", dateFrom);
    if (dateTo) query = query.lte("date", dateTo);
    if (dueFrom) query = query.gte("due_date", dueFrom);
    if (dueTo) query = query.lte("due_date", dueTo);
    const { data: filteredResults, error } = await query
        .order("date", { ascending: false })
        .limit(100);
    if (error) console.error("Database Intelligence Error:", error.message);
    const labelStyle = "text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1 flex items-center gap-2 italic";
    const inputStyle = "w-full border-2 border-slate-100 bg-slate-50 p-2.5 rounded-xl focus:border-primary focus:bg-white outline-none transition-all text-sm font-bold text-secondary";

    return (
        <main className="w-full min-h-screen bg-slate-50 py-6 md:py-10 px-[4%]">
            <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-secondary uppercase tracking-tight italic">
                        Advanced <span className="text-primary">Search</span>
                    </h1>
                    <p className="text-slate-500 font-medium italic text-sm md:text-base">Advanced clinical database filtration</p>
                </div>
                <div className="bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-sm text-left sm:text-right w-full sm:w-auto">
                    <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Records Identified</span>
                    <span className="text-3xl font-black text-primary italic leading-none">{(filteredResults || []).length}</span>
                </div>
            </header>
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden mb-10">
                <form className="p-6 md:p-8" method="GET">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                        <div className="space-y-4">
                            <div>
                                <label className={labelStyle}><FontAwesomeIcon icon={faUser} className="text-primary" /> Owner Name</label>
                                <input name="ownerName" defaultValue={ownerName} placeholder="Client name..." className={inputStyle} />
                            </div>
                            <div>
                                <label className={labelStyle}><FontAwesomeIcon icon={faPaw} className="text-primary" /> Pet Name</label>
                                <input name="petName" defaultValue={petName} placeholder="Animal name..." className={inputStyle} />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className={labelStyle}>Species</label>
                                    <select name="species" defaultValue={species} className={inputStyle}>
                                        <option value="All">All</option>
                                        <option value="canine">Canine</option>
                                        <option value="feline">Feline</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelStyle}>Gender</label>
                                    <select name="gender" defaultValue={gender} className={inputStyle}>
                                        <option value="All">All</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className={labelStyle}>Record Category</label>
                                <select name="type" defaultValue={type} className={inputStyle}>
                                    <option value="All">All Categories</option>
                                    <option value="Vaccine">Vaccine</option>
                                    <option value="Rabies">Rabies</option>
                                    <option value="Deworming">Deworming</option>
                                    <option value="Ectoparasites">Ectoparasites</option>
                                </select>
                            </div>
                        </div>
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                            <h4 className="text-[10px] font-black text-primary flex items-center gap-2 mb-2 uppercase tracking-widest border-b border-slate-200 pb-2 italic">
                                <FontAwesomeIcon icon={faCalendarAlt} /> Applied Range
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className={labelStyle}>From</label><input type="date" name="dateFrom" defaultValue={dateFrom} className={inputStyle} /></div>
                                <div><label className={labelStyle}>To</label><input type="date" name="dateTo" defaultValue={dateTo} className={inputStyle} /></div>
                            </div>
                        </div>
                        <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 space-y-4">
                            <h4 className="text-[10px] font-black text-primary flex items-center gap-2 mb-2 uppercase tracking-widest border-b border-primary/10 pb-2 italic">
                                <FontAwesomeIcon icon={faFilter} /> Due Range
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                                <div><label className={labelStyle}>From</label><input type="date" name="dueFrom" defaultValue={dueFrom} className={inputStyle} /></div>
                                <div><label className={labelStyle}>To</label><input type="date" name="dueTo" defaultValue={dueTo} className={inputStyle} /></div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <Link href="/search/advanced" className="text-xs font-black text-slate-300 hover:text-red-500 transition-colors uppercase tracking-widest flex items-center gap-2 order-2 sm:order-1 italic">
                            <FontAwesomeIcon icon={faUndo} /> Wipe Filters
                        </Link>
                        <button type="submit" className="w-full sm:w-auto bg-secondary text-white px-14 py-4 rounded-2xl font-black text-sm hover:bg-primary transition-all shadow-xl shadow-secondary/20 flex items-center justify-center gap-3 italic tracking-tighter order-1 sm:order-2 uppercase">
                            <FontAwesomeIcon icon={faSearch} /> Execute Advanced Search
                        </button>
                    </div>
                </form>
            </div>
            <div className="hidden md:block bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-secondary text-white text-[10px] font-black uppercase tracking-[0.2em] italic">
                        <tr>
                            <th className="px-8 py-6">Date/Due</th>
                            <th className="px-8 py-6">Owner Information</th>
                            <th className="px-8 py-6">Pet Information</th>
                            <th className="px-8 py-6 text-right">Product</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredResults?.map((rec, i) => (
                            <tr key={i} className="group hover:bg-primary/5 transition-all">
                                <td className="px-8 py-6">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-mono font-black text-secondary">{rec.date}</span>
                                        <span className="text-[10px] font-black text-primary uppercase italic">Due: {rec.due_date || "NONE"}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <Link href={`/owners/${rec.owners?.phone}`} className="flex flex-col">
                                        <span className="font-black text-secondary uppercase italic group-hover:text-primary transition-colors leading-tight">{rec.owners?.name}</span>
                                        <span className="text-xs text-slate-400 font-mono font-bold">{rec.owners?.phone}</span>
                                    </Link>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                                            <FontAwesomeIcon icon={faPaw} className="text-xs" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-black text-secondary uppercase italic leading-none mb-1">{rec.animals?.name}</span>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                {rec.animals?.species} • {rec.animals?.gender?.charAt(0)} • {calculateAge(rec.animals?.birth_date)}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <span className="inline-block bg-slate-50 text-secondary px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-slate-100 group-hover:bg-secondary group-hover:text-white transition-all italic shadow-sm">
                                        {rec.products?.name || "No Product"}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="md:hidden space-y-4">
                {filteredResults?.map((rec, i) => (
                    <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="flex justify-between items-start mb-5">
                            <div className="flex flex-col">
                                <span className="text-xs font-mono font-black text-slate-300 uppercase leading-none">DATE: {rec.date}</span>
                                <span className="text-[10px] font-black text-primary uppercase italic mt-1">DUE: {rec.due_date || "PERMANENT"}</span>
                            </div>
                            <span className="bg-secondary text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase italic">
                                {rec.products?.type || "General"}
                            </span>
                        </div>
                        <Link href={`/owners/${rec.owners?.phone}`} className="block bg-slate-50 p-4 rounded-2xl mb-5 border border-slate-100">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Owner Information</p>
                                    <h3 className="font-black text-secondary uppercase italic">{rec.owners?.name}</h3>
                                </div>
                                <span className="text-xs font-mono text-primary font-black">{rec.owners?.phone}</span>
                            </div>
                        </Link>
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shadow-inner">
                                <FontAwesomeIcon icon={faPaw} className="text-lg" />
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Pet Information</p>
                                <h4 className="font-black text-secondary uppercase italic text-lg leading-tight">{rec.animals?.name}</h4>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter mt-1">
                                    {rec.animals?.species} • {rec.animals?.gender?.charAt(0)} • {calculateAge(rec.animals?.birth_date)}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}