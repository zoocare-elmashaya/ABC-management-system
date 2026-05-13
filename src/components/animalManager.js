'use client'
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDog, faCat, faMars, faVenus, faNotesMedical, faCalendarCheck, faStethoscope, faPaw } from "@fortawesome/free-solid-svg-icons";
export default function AnimalManager({ animals, records }) {
    const [selectedAnimalId, setSelectedAnimalId] = useState(animals[0]?.id || null);
    const selectedAnimal = animals.find(a => a.id === selectedAnimalId);
    const getAge = (birthDate) => {
        if (!birthDate) return "N/A";
        const birth = new Date(birthDate);
        const now = new Date();
        let years = now.getFullYear() - birth.getFullYear();
        let months = now.getMonth() - birth.getMonth();
        let days = now.getDate() - birth.getDate();
        if (days < 0) {
            months -= 1;
        }
        if (months < 0) {
            years -= 1;
            months += 12;
        }
        if (years >= 1) {
            return `${years} Year${years === 1 ? '' : 's'}`;
        } else if (months >= 1) {
            return `${months} Month${months === 1 ? '' : 's'}`;
        } else {
            const diffTime = now - birth;
            const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const displayDays = totalDays < 0 ? 0 : totalDays;
            return `${displayDays} Day${displayDays === 1 ? '' : 's'}`;
        }
    };
    const animalABCHistory = records
        .filter(r => r.animal_id === selectedAnimalId)
        .map(rec => {
            return {
                ...rec,
                name: rec.products?.name || "Unknown Product",
                type: rec.products?.type || "Other",
                date: rec.date,
                due: rec.due_date
            };
        }).reverse();
    const getRecordsByType = (type) => 
        animalABCHistory.filter(r => r.type?.toLowerCase() === type.toLowerCase());
    const labelClass = "text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block";

    return (
        <div className="space-y-8 md:space-y-10 p-2 md:p-5">
            <section>
                <label className={`${labelClass} ml-2`}>Select Pet</label>
                <div className="flex gap-3 overflow-x-auto pb-4 px-2 -mx-2 snap-x no-scrollbar">
                    {animals.map((animal) => (
                        <button key={animal.id} onClick={() => setSelectedAnimalId(animal.id)} className={`flex items-center gap-3 md:gap-4 px-5 py-3 md:px-6 md:py-4 rounded-2xl border-2 transition-all duration-300 snap-start shrink-0 ${selectedAnimalId === animal.id ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-slate-100 bg-white hover:border-slate-300 shadow-sm'}`}>
                            <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-lg md:text-xl ${selectedAnimalId === animal.id ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                                <FontAwesomeIcon icon={animal.species?.toLowerCase() === 'canine' ? faDog : faCat} />
                            </div>
                            <div className="text-left">
                                <p className={`text-sm md:text-base font-black uppercase tracking-tight italic ${selectedAnimalId === animal.id ? 'text-secondary' : 'text-slate-600'}`}>
                                    {animal.name}
                                </p>
                                <div className="flex gap-2 items-center opacity-60">
                                    <FontAwesomeIcon icon={animal.gender?.toLowerCase() === 'male' ? faMars : faVenus} className="text-[9px]" />
                                    <span className="text-[9px] font-bold uppercase">{getAge(animal.birth_date)}</span>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </section>
            {selectedAnimal && (
                <div className="space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                        {[
                            { label: 'Species', val: selectedAnimal.species, icon: faPaw },
                            { label: 'Gender', val: selectedAnimal.gender, icon: selectedAnimal.gender?.toLowerCase() === 'male' ? faMars : faVenus },
                            { label: 'Age', val: getAge(selectedAnimal.birth_date), icon: faCalendarCheck },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                                <p className={labelClass}>{stat.label}</p>
                                <div className="flex items-center gap-2 md:gap-3">
                                    <FontAwesomeIcon icon={stat.icon} className="text-primary text-xs md:text-base" />
                                    <span className="font-bold text-secondary text-xs md:text-sm uppercase italic truncate">{stat.val}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <section className="space-y-6">
                        <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
                            <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center text-white text-sm">
                                <FontAwesomeIcon icon={faNotesMedical} />
                            </div>
                            <h3 className="text-lg md:text-xl font-black text-secondary uppercase italic tracking-tight">ABC Records</h3>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
                            {['Vaccine', 'Rabies', 'Deworming', 'Ectoparasites'].map((category) => {
                                const filteredRecords = getRecordsByType(category);
                                return (
                                    <div key={category} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                                        <div className="bg-slate-50 px-5 py-3 md:px-6 md:py-4 border-b border-slate-100 flex justify-between items-center">
                                            <span className="font-black text-secondary uppercase tracking-widest text-[10px] md:text-xs italic">{category}</span>
                                            <span className="bg-white px-2 py-1 rounded-full text-[9px] font-black text-slate-400 border border-slate-200">
                                                {filteredRecords.length} Items
                                            </span>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left min-w-[300px]">
                                                <thead>
                                                    <tr className="text-[8px] md:text-[9px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50">
                                                        <th className="px-4 md:px-6 py-3 md:py-4">Product</th>
                                                        <th className="px-4 md:px-6 py-3 md:py-4 text-center">Date</th>
                                                        <th className="px-4 md:px-6 py-3 md:py-4 text-center">Due</th>
                                                        <th className="px-4 md:px-6 py-3 md:py-4 text-right">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {filteredRecords.length > 0 ? (
                                                        filteredRecords.map((rec, index) => (
                                                            <tr key={index} className="hover:bg-slate-50/50 transition-colors group">
                                                                <td className="px-4 md:px-6 py-3 md:py-4 font-bold text-secondary text-xs md:text-sm">
                                                                    {rec.name}
                                                                </td>
                                                                <td className="px-4 md:px-6 py-3 md:py-4 text-center text-[10px] text-slate-500 font-mono">
                                                                    {rec.date}
                                                                </td>
                                                                <td className="px-4 md:px-6 py-3 md:py-4 text-center text-[10px] text-red-500 font-mono">
                                                                    {rec.due}
                                                                </td>
                                                                <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                                                                    <div className={`inline-block w-2.5 h-2.5 rounded-full border-2 ${rec.send ? 'bg-primary border-primary/20' : 'bg-white border-slate-200'}`}></div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="3" className="px-6 py-8 text-center text-slate-300 text-[10px] font-black uppercase tracking-widest">
                                                                No {category} Records
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}