"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import supabase from "@/lib/supabaseClient"; 
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserEdit, faSave, faArrowLeft, faTrash, faPaw, faSyringe} from "@fortawesome/free-solid-svg-icons";
export default function EditOwnerPage() {
    const { ownerId } = useParams(); 
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [owner, setOwner] = useState({ name: "", phone: "" });
    const [ownerAnimals, setOwnerAnimals] = useState([]);
    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: ownerData, error: ownerError } = await supabase
                .from('owners')
                .select('*')
                .eq('phone', ownerId)
                .single();
            if (ownerError || !ownerData) {
                alert("Owner not found");
                return router.push("/owners");
            }
            setOwner(ownerData);
            const { data: animalData, error: animalError } = await supabase
                .from('animals')
                .select(`*,records!animal_id (id,date,products (name))`)
                .eq('owner_id', ownerId);
            if (animalError) {
                console.error("Error fetching pets:", animalError.message);
            } else if (animalData) {
                setOwnerAnimals(animalData);
            }
        } catch (err) {
            console.error("Unexpected error:", err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, [ownerId]);
    const handleDeleteOwner = async () => {
        const confirmDelete = confirm(
            `⚠️ DANGER: Delete ${owner.name}?\n\nThis will permanently erase the owner, all pets, and all records history. This cannot be undone.`
        );
        if (!confirmDelete) return;
        try {
            setLoading(true);
            const { error } = await supabase.from('owners').delete().eq('phone', ownerId);
            if (error) throw error;
            router.push("/owners");
        } catch (error) {
            alert("Error: " + error.message);
            setLoading(false);
        }
    };
    const handleDeleteAnimal = async (animalId, animalName) => {
        if (!confirm(`Delete ${animalName} and all its records history?`)) return;
        try {
            await supabase.from('records').delete().eq('animal_id', animalId);
            const { error } = await supabase.from('animals').delete().eq('id', animalId);
            if (error) throw error;
            fetchData(); 
        } catch (error) {
            alert("Error: " + error.message);
        }
    };
    const handleDeleteRecord = async (recordId) => {
        if (!confirm("Delete this specific record ?")) return;
        try {
            const { error } = await supabase.from('records').delete().eq('id', recordId);
            if (error) throw error;
            fetchData();
        } catch (error) {
            alert("Error: " + error.message);
        }
    };
    const handleSaveOwner = async (e) => {
        e.preventDefault();
        const { error } = await supabase
            .from('owners')
            .update({ name: owner.name, phone: owner.phone })
            .eq('phone', ownerId);
        if (error) alert("Update failed: " + error.message);
        else router.push(`/owners/${owner.phone}`);
    };
    if (loading) return <div className="p-20 text-center font-black uppercase text-slate-400 italic tracking-widest">Syncing Records...</div>;
    const inputClass = "w-full border-2 border-slate-100 bg-slate-50 p-4 rounded-2xl focus:border-primary focus:bg-white outline-none transition-all font-bold text-secondary";
    const labelClass = "text-[11px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-2";
    return (
        <main className="min-h-screen bg-slate-50 py-12 px-[5%]">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-secondary font-bold text-sm transition-colors">
                            <FontAwesomeIcon icon={faArrowLeft} /> Back
                        </button>
                        <button onClick={handleDeleteOwner} className="text-red-400 hover:text-red-600 font-black text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2">
                            <FontAwesomeIcon icon={faTrash} /> Delete Account
                        </button>
                    </div>
                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                        <div className="bg-secondary p-8 text-white">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl backdrop-blur-md">
                                    <FontAwesomeIcon icon={faUserEdit} />
                                </div>
                                <h1 className="text-2xl font-black italic uppercase tracking-tight">Edit Owner</h1>
                            </div>
                        </div>

                        <form onSubmit={handleSaveOwner} className="p-10 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClass}>Owner Name</label>
                                    <input required type="text" value={owner.name} onChange={(e) => setOwner({...owner, name: e.target.value})} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Phone</label>
                                    <input required type="text" value={owner.phone} onChange={(e) => setOwner({...owner, phone: e.target.value})} className={`${inputClass} border-amber-100 text-amber-700`} />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-primary text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center justify-center gap-3 italic">
                                <FontAwesomeIcon icon={faSave} /> Save Profile
                            </button>
                        </form>
                    </div>
                </div>
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary flex items-center gap-2 mb-4 ml-2">
                        <FontAwesomeIcon icon={faPaw} className="text-primary" /> Pets Information
                    </h3>
                    {ownerAnimals.length > 0 ? (
                        ownerAnimals.map(animal => (
                            <div key={animal.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm relative group">
                                <button onClick={() => handleDeleteAnimal(animal.id, animal.name)} className="absolute -top-2 -right-2 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-lg shadow-red-200 z-10 hover:scale-110 transition-transform"title={`Delete ${animal.name}`}>
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-50">
                                    <p className="font-black text-secondary uppercase italic">{animal.name}</p>
                                    <span className="text-[9px] bg-primary/10 text-primary px-2 py-1 rounded-full font-black uppercase">
                                        {animal.species || 'Pet'}
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {animal.records && animal.records.length > 0 ? (
                                        animal.records.map(record => (
                                            <div key={record.id} className="text-[10px] bg-slate-50 p-3 rounded-xl flex justify-between items-center border border-slate-100 hover:bg-white transition-colors group/record">
                                                <div className="flex flex-col flex-1">
                                                    <span className="font-bold text-slate-700 uppercase flex items-center gap-1">
                                                        <FontAwesomeIcon icon={faSyringe} className="text-[8px] text-slate-300"/>
                                                        {record.products?.name || "Treatment"}
                                                    </span>
                                                    <span className="font-mono text-[8px] text-slate-400 mt-0.5">{record.date}</span>
                                                </div>
                                                <button onClick={() => handleDeleteRecord(record.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2 ml-2" title="Delete this record">
                                                    <FontAwesomeIcon icon={faTrash} />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-[10px] text-slate-300 italic text-center py-4">No history found</p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-slate-200/30 rounded-[2rem] p-10 text-center border-2 border-dashed border-slate-200">
                            <p className="text-slate-400 font-bold text-xs uppercase italic">No Patients Registered</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}