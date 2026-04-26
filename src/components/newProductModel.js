"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faSyringe, faSave } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import supabase from "@/lib/supabaseClient";
export default function NewVaccineModal({ isOpen, onClose, onSuccess }) {
    const [name, setName] = useState("");
    const [type, setType] = useState("Vaccine");
    const [isSaving, setIsSaving] = useState(false);
    if (!isOpen) return null;
    const isFormInvalid = !name.trim();
    const handleSave = async (e) => {
        e.preventDefault();
        if (isFormInvalid) return;
        setIsSaving(true);
        const { error } = await supabase
            .from("products")
            .insert([{ name, type }]);
        if (error) {
            alert("Error: " + error.message);
        } else {
            setName("");
            setType("Vaccine");
            onSuccess();
            onClose();
        }
        setIsSaving(false);
    };
    const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1";
    const inputClass = "w-full border-2 border-slate-100 bg-slate-50 p-3 rounded-xl focus:border-primary focus:bg-white outline-none transition-all text-sm font-medium text-secondary";
    return (
        <div className="fixed inset-0 z-[999] flex justify-end">
            <div className="absolute inset-0 bg-secondary/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative w-full lg:w-1/3 h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-primary/20">
                            <FontAwesomeIcon icon={faSyringe} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-secondary uppercase italic tracking-tight">New Product</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all">
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-10">
                    <form id="productForm" onSubmit={handleSave} className="space-y-8">
                        <div>
                            <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-4">Product Details</h3>
                            <div className="space-y-6">
                                <div>
                                    <label className={labelClass}>Product Name</label>
                                    <input type="text" className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. DHPP Booster"/>
                                </div>
                                <div>
                                    <label className={labelClass}>Category Type</label>
                                    <select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}>
                                        <option value="Vaccine">Vaccine</option>
                                        <option value="Rabies">Rabies</option>
                                        <option value="Deworming">Deworming</option>
                                        <option value="Ectoparasites">Ectoparasites</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="px-10 py-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-3 rounded-xl font-black text-xs text-slate-400 uppercase hover:text-secondary transition-colors">Discard</button>
                    <button form="productForm" type="submit" disabled={isSaving || isFormInvalid} className={`px-10 py-3 rounded-xl font-black text-sm transition-all shadow-xl flex items-center gap-3 italic ${isSaving || isFormInvalid ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" : "bg-secondary text-white hover:bg-primary shadow-secondary/20 active:scale-95"}`}>
                        <FontAwesomeIcon icon={faSave} className={isSaving ? "animate-pulse" : ""} />
                        {isSaving ? "SAVING..." : "SAVE PRODUCT"}
                    </button>
                </div>
            </div>
        </div>
    );
}