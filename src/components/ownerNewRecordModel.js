"use client";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faSyringe, faSave, faPaw, faCheckCircle, faInfoCircle, faSpinner, faCalendarPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import supabase from "../lib/supabaseClient";
const getTodayStr = () => new Date().toISOString().split('T')[0];
const INITIAL_FORM_STATE = {
    animalName: "",
    animalType: "canine",
    animalSex: "male",
    animalAgeValue: "", 
    animalAgeUnit: "months",
    recordDate: getTodayStr(),
    recordEntries: [
        { productType: "Vaccine", productName: "", scheduleValue: "", scheduleUnit: "months", id: Date.now() }
    ]
};
export default function NewRecordModal({ isOpen, onClose, ownerId }) {
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [isNewAnimal, setIsNewAnimal] = useState(true);
    const [productsData, setProductsData] = useState([]); 
    const [isSaving, setIsSaving] = useState(false);
    const calculateAgeFromBirthDate = (birthDateString) => {
        if (!birthDateString) return { value: "", unit: "months" };
        const birthDate = new Date(birthDateString);
        const now = new Date();
        const diffTime = Math.abs(now - birthDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 365) return { value: Math.floor(diffDays / 365), unit: "years" };
        if (diffDays >= 30) return { value: Math.floor(diffDays / 30), unit: "months" };
        return { value: diffDays, unit: "days" };
    };
    const calculateDueDate = (value, unit, startDate) => {
        const num = parseInt(value);
        if (isNaN(num) || num <= 0) return null;
        const baseDate = startDate ? new Date(startDate) : new Date();
        const date = new Date(baseDate); 
        if (unit === "days") date.setDate(date.getDate() + num);
        else if (unit === "months") date.setMonth(date.getMonth() + num);
        else if (unit === "years") date.setFullYear(date.getFullYear() + num);
        try { return date.toISOString().split('T')[0]; } catch (e) { return null; }
    };
    const calculateBirthDate = (value, unit) => {
        const date = new Date();
        const num = parseInt(value);
        if (isNaN(num) || num === 0) return null;
        if (unit === "days") date.setDate(date.getDate() - num);
        else if (unit === "months") date.setMonth(date.getMonth() - num);
        else if (unit === "years") date.setFullYear(date.getFullYear() - num);
        return date.toISOString().split('T')[0];
    };
    const addEntry = () => {
        setFormData(prev => ({
            ...prev,
            recordEntries: [...prev.recordEntries, { 
                productType: "Vaccine", productName: "", scheduleValue: "", scheduleUnit: "months", id: Date.now() 
            }]
        }));
    };
    const removeEntry = (id) => {
        if (formData.recordEntries.length === 1) return;
        setFormData(prev => ({ 
            ...prev, 
            recordEntries: prev.recordEntries.filter(e => e.id !== id) 
        }));
    };
    const updateEntry = (id, field, value) => {
        setFormData(prev => ({
            ...prev,
            recordEntries: prev.recordEntries.map(e => e.id === id ? { ...e, [field]: value } : e)
        }));
    };
    useEffect(() => {
        const fetchProducts = async () => {
            const { data } = await supabase.from("products").select("*");
            if (data) setProductsData(data);
        };
        fetchProducts();
    }, []);
    useEffect(() => {
        const name = formData.animalName.trim();
        if (!isOpen || !ownerId || !name) {
            setIsNewAnimal(true);
            setFormData(prev => ({
                ...prev,
                animalAgeValue: ""
            }));
            return;
        }
        const lookupAnimal = async () => {
            const { data: animal } = await supabase.from("animals")
                .select("*")
                .eq("owner_id", ownerId)
                .ilike("name", name)
                .maybeSingle();
            if (animal) {
                setIsNewAnimal(false);
                const age = calculateAgeFromBirthDate(animal.birth_date);
                setFormData(prev => ({ 
                    ...prev, 
                    animalType: animal.species, 
                    animalSex: animal.gender, 
                    animalAgeValue: age.value, 
                    animalAgeUnit: age.unit 
                }));
            } else {
                setIsNewAnimal(true);
            }
        };
        const debounce = setTimeout(lookupAnimal, 400);
        return () => clearTimeout(debounce);
    }, [formData.animalName, isOpen, ownerId]);
    const handleSave = async (e) => {
        e.preventDefault();
        if (!ownerId) return alert("Missing Owner Context");
        setIsSaving(true);
        const finalRecordDate = formData.recordDate || getTodayStr();
        const finalAnimalName = formData.animalName.trim() || "Unknown";
        try {
            let animalId;
            const { data: existingAnimal } = await supabase.from("animals")
                .select("id")
                .eq("owner_id", ownerId)
                .ilike("name", finalAnimalName)
                .maybeSingle();
            if (existingAnimal) {
                animalId = existingAnimal.id;
            } else {
                const { data: newAnimal, error: animalErr } = await supabase.from("animals").insert([{
                    name: finalAnimalName, 
                    species: formData.animalType, 
                    gender: formData.animalSex, 
                    owner_id: ownerId,
                    birth_date: calculateBirthDate(formData.animalAgeValue, formData.animalAgeUnit)
                }]).select().single();
                if (animalErr || !newAnimal) throw new Error("Failed to register animal.");
                animalId = newAnimal.id;
            }
            const recordsToInsert = formData.recordEntries.map(entry => {
                const selectedProd = productsData.find(p => p.name === entry.productName);
                if (!selectedProd) throw new Error(`Please select a product for all treatments.`);
                return {
                    owner_id: ownerId, 
                    animal_id: animalId, 
                    product_id: selectedProd.id,
                    date: finalRecordDate, 
                    due_date: calculateDueDate(entry.scheduleValue, entry.scheduleUnit, finalRecordDate), 
                    send: false
                };
            });
            const { error: recordError } = await supabase.from("records").insert(recordsToInsert);
            if (recordError) throw recordError;
            
            setFormData(INITIAL_FORM_STATE);
            onClose();
        } catch (err) { 
            alert(err.message); 
        } finally { 
            setIsSaving(false); 
        }
    };
    if (!isOpen) return null;
    const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1";
    const inputClass = "w-full border-2 border-slate-100 bg-slate-50 p-3 rounded-xl focus:border-primary focus:bg-white focus:text-secondary outline-none transition-all text-sm font-medium";
    const disabledClass = "opacity-70 bg-slate-100 cursor-not-allowed border-slate-200 shadow-inner";
    return (
        <div className="fixed inset-0 z-[999] flex justify-end">
            <div className="absolute inset-0 bg-secondary/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full lg:w-3/4 h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-primary/20">
                            <FontAwesomeIcon icon={isSaving ? faSpinner : faSyringe} className={isSaving ? "animate-spin" : ""} />
                        </div>
                        <h2 className="text-2xl font-black text-secondary uppercase italic">Clinic Session</h2>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:text-red-500 transition-all"><FontAwesomeIcon icon={faXmark} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-10 bg-slate-50/30">
                    <form onSubmit={handleSave} className="max-w-3xl mx-auto space-y-10 pb-20">
                        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                                <FontAwesomeIcon icon={faPaw} /> Pet Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
                                <div className="md:col-span-2 relative">
                                    <label className={labelClass}>Pet Name</label>
                                    <div className="relative">
                                        <input type="text" placeholder="Leave blank for 'Unknown'" value={formData.animalName} className={inputClass} onChange={(e) => setFormData({...formData, animalName: e.target.value})} />
                                        {formData.animalName.trim().length > 0 && (
                                            <div className={`absolute right-4 top-3.5 text-[10px] font-black uppercase flex items-center gap-1 ${!isNewAnimal ? 'text-green-500' : 'text-orange-500'}`}>
                                                <FontAwesomeIcon icon={!isNewAnimal ? faCheckCircle : faInfoCircle} />
                                                {!isNewAnimal ? 'Found' : 'New'}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="md:col-span-1">
                                    <label className={labelClass}>Species</label>
                                    <select disabled={!isNewAnimal} className={`${inputClass} ${!isNewAnimal ? disabledClass : ''}`} value={formData.animalType} onChange={(e) => setFormData({...formData, animalType: e.target.value})}>
                                        <option value="canine">Canine</option>
                                        <option value="feline">Feline</option>
                                    </select>
                                </div>
                                <div className="md:col-span-1">
                                    <label className={labelClass}>Sex</label>
                                    <select disabled={!isNewAnimal} className={`${inputClass} ${!isNewAnimal ? disabledClass : ''}`} value={formData.animalSex} onChange={(e) => setFormData({...formData, animalSex: e.target.value})}>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2 flex gap-2">
                                    <div className="flex-1">
                                        <label className={labelClass}>Age</label>
                                        <input type="number" disabled={!isNewAnimal || !formData.animalName.trim()}  className={`${inputClass} ${(!isNewAnimal || !formData.animalName.trim()) ? disabledClass : ''}`} value={formData.animalAgeValue} onChange={(e) => setFormData({...formData, animalAgeValue: e.target.value})} />
                                    </div>
                                    <div className="w-24">
                                        <label className={labelClass}>Unit</label>
                                        <select disabled={!isNewAnimal || !formData.animalName.trim()} className={`${inputClass} ${(!isNewAnimal || !formData.animalName.trim()) ? disabledClass : ''}`} value={formData.animalAgeUnit} onChange={(e) => setFormData({...formData, animalAgeUnit: e.target.value})}>
                                            <option value="days">Days</option>
                                            <option value="months">Months</option>
                                            <option value="years">Years</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            {!formData.animalName.trim() && (
                                <p className="text-[9px] font-bold text-slate-400 italic ml-1">
                                    * Registering as "Unknown" bypasses age profile details.
                                </p>
                            )}
                        </section>
                        <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <FontAwesomeIcon icon={faCalendarPlus} className="text-primary" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-secondary">Visit Date</span>
                            </div>
                            <input type="date" value={formData.recordDate} className="bg-slate-100 border-none rounded-xl px-4 py-2 font-bold text-sm focus:ring-2 ring-primary outline-none" onChange={(e) => setFormData({...formData, recordDate: e.target.value})} />
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-secondary flex items-center gap-2">
                                    <FontAwesomeIcon icon={faSyringe} /> Applied Products
                                </h3>
                                <button type="button" onClick={addEntry} className="bg-secondary text-white text-[9px] font-black uppercase px-4 py-2 rounded-xl hover:bg-primary transition-all shadow-lg">+ Add Product</button>
                            </div>
                            {formData.recordEntries.map((entry) => (
                                <div key={entry.id} className="bg-secondary p-8 rounded-[2.5rem] shadow-xl text-white relative group animate-in zoom-in-95">
                                    {formData.recordEntries.length > 1 && (
                                        <button type="button" onClick={() => removeEntry(entry.id)} className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"><FontAwesomeIcon icon={faTrash} /></button>
                                    )}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className={`${labelClass} text-white/40`}>Type</label>
                                            <select className="w-full bg-white/10 border-white/10 border-2 p-3 rounded-xl text-sm" value={entry.productType} onChange={(e) => updateEntry(entry.id, 'productType', e.target.value)}>
                                                <option value="Vaccine">Vaccine</option>
                                                <option value="Rabies">Rabies</option>
                                                <option value="Deworming">Deworming</option>
                                                <option value="Ectoparasites">Ectoparasites</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className={`${labelClass} text-white/40`}>Product</label>
                                            <select required className="w-full bg-white/10 border-white/10 border-2 p-3 rounded-xl text-sm" value={entry.productName} onChange={(e) => updateEntry(entry.id, 'productName', e.target.value)}>
                                                <option value="">Select...</option>
                                                {productsData.filter(p => p.type === entry.productType).map((v, i) => <option key={i} value={v.name} className="text-secondary">{v.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="pt-6 border-t border-white/10 flex flex-wrap items-end gap-4">
                                        <div className="flex-1 min-w-[120px]">
                                            <label className={`${labelClass} text-white/40`}>Next Visit In...</label>
                                            <input type="number" className="w-full bg-white/10 border-white/10 border-2 p-3 rounded-xl text-sm" value={entry.scheduleValue} onChange={(e) => updateEntry(entry.id, 'scheduleValue', e.target.value)} />
                                        </div>
                                        <div className="w-28">
                                            <label className={`${labelClass} text-white/40`}>Unit</label>
                                            <select className="w-full bg-white/10 border-white/10 border-2 p-3 rounded-xl text-sm" value={entry.scheduleUnit} onChange={(e) => updateEntry(entry.id, 'scheduleUnit', e.target.value)}>
                                                <option value="days">Days</option>
                                                <option value="months">Months</option>
                                                <option value="years">Years</option>
                                            </select>
                                        </div>
                                        <div className="flex-1 bg-primary/20 border border-primary/30 p-3 rounded-2xl text-center min-w-[150px]">
                                            <p className="text-[7px] font-black uppercase text-primary tracking-widest">Due Date</p>
                                            <p className="text-xs font-black italic">{calculateDueDate(entry.scheduleValue, entry.scheduleUnit, formData.recordDate) || 'Set Interval'}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 flex justify-end gap-6 items-center">
                            <button type="button" onClick={onClose} className="font-black text-[11px] text-slate-400 uppercase tracking-widest">Discard</button>
                            <button type="submit" disabled={isSaving} className="bg-primary text-white px-12 py-5 rounded-2xl font-black text-sm hover:brightness-110 transition-all shadow-2xl flex items-center gap-3 italic tracking-widest">
                                <FontAwesomeIcon icon={isSaving ? faSpinner : faSave} className={isSaving ? "animate-spin" : ""} />
                                {isSaving ? "SAVING RECORD..." : "SAVE RECORD"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}