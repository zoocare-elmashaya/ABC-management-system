"use client";
import { useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faSyringe, faSave, faUserPlus, faPaw, faCheckCircle, faInfoCircle, faSpinner, faCalendarPlus } from "@fortawesome/free-solid-svg-icons";
import supabase from "../lib/supabaseClient";

const INITIAL_FORM_STATE = {
    ownerPhone: "",
    ownerName: "",
    animalName: "",
    animalType: "canine",
    animalSex: "male",
    animalAgeValue: "", 
    animalAgeUnit: "months",
    productType: "Vaccine",
    productName: "",
    scheduleValue: "",
    scheduleUnit: "months"
};

export default function NewRecordModal({ isOpen, onClose }) {
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);
    const [isNewOwner, setIsNewOwner] = useState(false);
    const [isNewAnimal, setIsNewAnimal] = useState(false);
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
    const calculateDueDate = (value, unit) => {
        const num = parseInt(value);
        if (isNaN(num) || num <= 0) return null;
        
        const date = new Date();
        if (unit === "days") date.setDate(date.getDate() + num);
        else if (unit === "months") date.setMonth(date.getMonth() + num);
        else if (unit === "years") date.setFullYear(date.getFullYear() + num);
        
        return date.toISOString().split('T')[0];
    };
    const calculateBirthDate = (value, unit) => {
        const date = new Date();
        const num = parseInt(value);
        if (isNaN(num)) return new Date().toISOString().split('T')[0];
        if (unit === "days") date.setDate(date.getDate() - num);
        else if (unit === "months") date.setMonth(date.getMonth() - num);
        else if (unit === "years") date.setFullYear(date.getFullYear() - num);
        return date.toISOString().split('T')[0];
    };
    useEffect(() => {
        const fetchProducts = async () => {
            const { data } = await supabase.from("products").select("*");
            if (data) setProductsData(data);
        };
        fetchProducts();
    }, []);
    useEffect(() => {
        if (!isOpen || formData.ownerPhone.length < 6) return;
        const lookupPatient = async () => {
            const { data: owner } = await supabase
                .from("owners")
                .select("*")
                .eq("phone", formData.ownerPhone)
                .maybeSingle();
            if (owner) {
                setIsNewOwner(false);
                setFormData(prev => ({ ...prev, ownerName: owner.name }));
                if (formData.animalName.trim().length > 1) {
                    const { data: animal } = await supabase
                        .from("animals")
                        .select("*")
                        .eq("owner_id", owner.phone)
                        .ilike("name", formData.animalName.trim())
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
                }
            } else {
                setIsNewOwner(true);
                setIsNewAnimal(true);
            }
        };
        const debounce = setTimeout(lookupPatient, 400);
        return () => clearTimeout(debounce);
    }, [formData.ownerPhone, formData.animalName, isOpen]);
    const filteredProducts = useMemo(() => 
        productsData.filter(p => p.type === formData.productType), 
    [formData.productType, productsData]);
    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (isNewOwner) {
                const { error: ownerErr } = await supabase.from("owners").upsert([
                    { phone: formData.ownerPhone, name: formData.ownerName }
                ]);
                if (ownerErr) throw new Error("Owner Save Failed: " + ownerErr.message);
            }
            let animalId;
            if (isNewAnimal) {
                const { data: newAnimal, error: animalErr } = await supabase.from("animals").insert([
                    {
                        name: formData.animalName,
                        species: formData.animalType,
                        gender: formData.animalSex,
                        owner_id: formData.ownerPhone,
                        birth_date: calculateBirthDate(formData.animalAgeValue, formData.animalAgeUnit)
                    }
                ]).select().single();
                
                if (animalErr || !newAnimal) throw new Error("Failed to create new animal record.");
                animalId = newAnimal.id;
            } else {
                const { data: existingAnimal } = await supabase.from("animals")
                    .select("id")
                    .eq("owner_id", formData.ownerPhone)
                    .ilike("name", formData.animalName)
                    .maybeSingle();

                if (!existingAnimal) throw new Error("Animal not found.");
                animalId = existingAnimal.id;
            }
            const selectedProd = productsData.find(p => p.name === formData.productName);
            if (!selectedProd) throw new Error("Please select a product.");

            const { error: recordError } = await supabase.from("records").insert([{
                owner_id: formData.ownerPhone,
                animal_id: animalId,
                product_id: selectedProd.id,
                date: new Date().toISOString().split('T')[0],
                due_date: calculateDueDate(formData.scheduleValue, formData.scheduleUnit),
                send: false
            }]);
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
    const dueDateResult = calculateDueDate(formData.scheduleValue, formData.scheduleUnit);

    return (
        <div className="fixed inset-0 z-[999] flex justify-end">
            <div className="absolute inset-0 bg-secondary/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full lg:w-3/4 h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-primary/20">
                            <FontAwesomeIcon icon={isSaving ? faSpinner : faSyringe} className={isSaving ? "animate-spin" : ""} />
                        </div>
                        <h2 className="text-2xl font-black text-secondary uppercase italic">New Entry</h2>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:text-red-500 transition-all"><FontAwesomeIcon icon={faXmark} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-10 bg-slate-50/30">
                    <form onSubmit={handleSave} className="max-w-3xl mx-auto space-y-10">
                        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2"><FontAwesomeIcon icon={faUserPlus} /> Owner Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={labelClass}>Phone Number</label>
                                    <div className="relative">
                                        <input required type="text" value={formData.ownerPhone} className={inputClass} onChange={(e) => setFormData({...formData, ownerPhone: e.target.value})} />
                                        {formData.ownerPhone.length > 5 ? !isNewOwner ? (
                                            <div className="absolute right-4 top-3.5 text-green-500 text-[10px] font-black uppercase flex items-center gap-1"><FontAwesomeIcon icon={faCheckCircle} /> Found</div>
                                        ):(<div className="absolute right-4 top-3.5 text-orange-500 text-[10px] font-black uppercase flex items-center gap-1"><FontAwesomeIcon icon={faInfoCircle} /> New Number</div>):("")}
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Owner Name</label>
                                    <input required type="text" value={formData.ownerName} disabled={!isNewOwner} className={`${inputClass} ${!isNewOwner ? disabledClass : ''}`} onChange={(e) => setFormData({...formData, ownerName: e.target.value})} />
                                </div>
                            </div>
                        </section>
                        <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2"><FontAwesomeIcon icon={faPaw} /> Pet Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
                                <div className="md:col-span-2 relative">
                                    <label className={labelClass}>Pet Name</label>
                                    <div className="relative">
                                        <input required type="text" value={formData.animalName} className={inputClass} onChange={(e) => setFormData({...formData, animalName: e.target.value})} />
                                        {formData.animalName.length > 1 ? !isNewAnimal ? (
                                            <div className="absolute right-4 top-3.5 text-green-500 text-[10px] font-black uppercase flex items-center gap-1"><FontAwesomeIcon icon={faCheckCircle} /> Known Pet</div>
                                        ):(<div className="absolute right-4 top-3.5 text-orange-500 text-[10px] font-black uppercase flex items-center gap-1"><FontAwesomeIcon icon={faInfoCircle} /> New Pet</div>):("")}
                                    </div>
                                </div>
                                <div className="md:col-span-1"><label className={labelClass}>Species</label><select disabled={!isNewAnimal} className={`${inputClass} ${!isNewAnimal ? disabledClass : ''}`} value={formData.animalType} onChange={(e) => setFormData({...formData, animalType: e.target.value})}><option value="canine">Canine</option><option value="feline">Feline</option></select></div>
                                <div className="md:col-span-1"><label className={labelClass}>Sex</label><select disabled={!isNewAnimal} className={`${inputClass} ${!isNewAnimal ? disabledClass : ''}`} value={formData.animalSex} onChange={(e) => setFormData({...formData, animalSex: e.target.value})}><option value="male">Male</option><option value="female">Female</option></select></div>
                                <div className="md:col-span-2 flex gap-2">
                                    <div className="flex-1"><label className={labelClass}>Age</label><input required={isNewAnimal} disabled={!isNewAnimal} type="number" className={`${inputClass} ${!isNewAnimal ? disabledClass : ''}`} value={formData.animalAgeValue} onChange={(e) => setFormData({...formData, animalAgeValue: e.target.value})} /></div>
                                    <div className="w-24"><label className={labelClass}>Unit</label><select disabled={!isNewAnimal} className={`${inputClass} ${!isNewAnimal ? disabledClass : ''}`} value={formData.animalAgeUnit} onChange={(e) => setFormData({...formData, animalAgeUnit: e.target.value})}><option value="days">Days</option><option value="months">Months</option><option value="years">Years</option></select></div>
                                </div>
                            </div>
                        </section>

                        {/* Product & Schedule Section */}
                        <section className="bg-secondary p-8 rounded-[2rem] shadow-xl text-white space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className={`${labelClass} text-white/50`}>Application Type</label>
                                    <select className={`${inputClass} bg-white/10 border-white/10 text-white focus:text-secondary`} value={formData.productType} onChange={(e) => setFormData({...formData, productType: e.target.value})}>
                                        <option value="Vaccine">Vaccine</option>
                                        <option value="Rabies">Rabies</option>
                                        <option value="Deworming">Deworming</option>
                                        <option value="Ectoparasites">Ectoparasites</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={`${labelClass} text-white/50`}>Product</label>
                                    <select required className={`${inputClass} bg-white/10 border-white/10 text-white focus:text-secondary`} value={formData.productName} onChange={(e) => setFormData({...formData, productName: e.target.value})}>
                                        <option value="">Select...</option>
                                        {filteredProducts.map((v, i) => <option key={i} value={v.name}>{v.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-white/10">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                                    <FontAwesomeIcon icon={faCalendarPlus} /> Set Follow-up (Next Visit)
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                    <div>
                                        <label className={`${labelClass} text-white/50`}>Interval Value</label>
                                        <input type="number" placeholder="e.g. 1" className={`${inputClass} bg-white/10 border-white/10 text-white focus:text-secondary`}value={formData.scheduleValue}onChange={(e) => setFormData({...formData, scheduleValue: e.target.value})}/>
                                    </div>
                                    <div>
                                        <label className={`${labelClass} text-white/50`}>Time Unit</label>
                                        <select className={`${inputClass} bg-white/10 border-white/10 text-white focus:text-secondary`}value={formData.scheduleUnit}onChange={(e) => setFormData({...formData, scheduleUnit: e.target.value})}>
                                            <option value="days">Days</option>
                                            <option value="months">Months</option>
                                            <option value="years">Years</option>
                                        </select>
                                    </div>
                                    <div className="md:pb-1">
                                        {dueDateResult ? (
                                            <div className="bg-primary text-white p-3 rounded-xl shadow-lg border border-white/20 animate-pulse">
                                                <p className="text-[8px] font-black uppercase tracking-tighter opacity-70">Calculated Due Date</p>
                                                <p className="text-sm font-black italic">{dueDateResult}</p>
                                            </div>
                                        ) : (
                                            <p className="text-[10px] text-white/30 italic pb-2">Enter value for due date...</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                        <div className="pt-6 flex justify-end gap-6 items-center">
                            <button type="button" onClick={onClose} disabled={isSaving} className="font-black text-[11px] text-slate-400 uppercase tracking-widest hover:text-secondary">Discard</button>
                            <button type="submit" disabled={isSaving} className="bg-primary text-white px-12 py-5 rounded-2xl font-black text-sm hover:brightness-110 transition-all shadow-2xl flex items-center gap-3 italic tracking-widest">
                                <FontAwesomeIcon icon={isSaving ? faSpinner : faSave} className={isSaving ? "animate-spin" : ""} />
                                {isSaving ? "SAVING..." : "SAVE RECORD"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}