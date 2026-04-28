import { createClient } from "@/lib/supabaseServer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import Link from "next/link";
import StatusToggle from "@/components/statusToggle";
function calculateAge(birthDate) {
    if (!birthDate) return "N/A";
    const today = new Date();
    const birth = new Date(birthDate);
    const diffTime = today - birth;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 30) return `${diffDays} Day${diffDays !== 1 ? 's' : ''}`;
    let years = today.getFullYear() - birth.getFullYear();
    let months = (today.getMonth() + 12 * years) - birth.getMonth();
    if (months < 12) return `${months} Month${months !== 1 ? 's' : ''}`;
    if (today.getMonth() < birth.getMonth() || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
        years--;
    }
    return `${years} Year${years !== 1 ? 's' : ''}`;
}
export default async function AlertPage({ params }) {
    const resolvedParams = await params;
    const range = resolvedParams.range;
    const supabase = await createClient();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let thresholdDate = new Date(today);
    let title = "";
    switch (range) {
        case "month":
            thresholdDate.setDate(today.getDate() + 31);
            title = "Next 30 Days";
            break;
        case "2weeks":
            thresholdDate.setDate(today.getDate() + 15);
            title = "Next 2 Weeks";
            break;
        case "7days":
            thresholdDate.setDate(today.getDate() + 8);
            title = "Next 7 Days";
            break;
        default:
            thresholdDate.setDate(today.getDate() + 4);
            title = "Next 3 Days";
    }
    const startDateStr = today.toISOString().split('T')[0];
    const endDateStr = thresholdDate.toISOString().split('T')[0];
    const getStatusConfig = (dueDateStr) => {
        const dueDate = new Date(dueDateStr);
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 16) return { label: "Upcoming", iconBg: "bg-blue-50", text: "text-blue-500", subText: "text-blue-400" };
        if (diffDays >= 9) return { label: "Scheduled", iconBg: "bg-purple-50", text: "text-purple-500", subText: "text-purple-400" };
        if (diffDays >= 5) return { label: "Due Soon", iconBg: "bg-orange-50", text: "text-orange-500", subText: "text-orange-400" };
        return { label: "Urgent", iconBg: "bg-red-50", text: "text-red-500", subText: "text-red-400" };
    };
    const { data: records, error } = await supabase
        .from("records")
        .select(`id,due_date,send,owners!inner(name, phone),animals!inner(name, birth_date,gender,species),products!inner(name, type)`)
        .eq("send", false)
        .gte("due_date", startDateStr)
        .lte("due_date", endDateStr)
        .order("due_date", { ascending: true });
    if (error) console.error("Alert Fetch Error:", error.message);
    const alertRecords = records || [];
    return (
        <main className="w-full min-h-screen bg-slate-50 py-10 px-[5%]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-slate-200 pb-8 gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full animate-pulse">
                            Unsent Records
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-secondary uppercase tracking-tight italic">
                        {title} <span className="text-primary text-xl md:text-2xl">Timeline</span>
                    </h1>
                </div>
                <div className="text-left md:text-right bg-white p-4 rounded-2xl border border-slate-100 shadow-sm md:bg-transparent md:border-none md:p-0 md:shadow-none w-full md:w-auto">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Pending</p>
                    <span className="text-3xl md:text-4xl font-black text-secondary">{alertRecords.length}</span>
                </div>
            </div>
            <div className="hidden md:block bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-200">
                            <th className="px-8 py-5">Due Date</th>
                            <th className="px-8 py-5">Pet & Owner</th>
                            <th className="px-8 py-5">Product Info</th>
                            <th className="px-8 py-5 text-center">Action</th>
                            <th className="px-8 py-5 text-center w-[160px]">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {alertRecords.length > 0 ? (
                            alertRecords.map((rec, i) => {
                                const status = getStatusConfig(rec.due_date);
                                const age = calculateAge(rec.animals?.birth_date);
                                const productTypeMap = {
                                Vaccine: "الفيروسات",
                                Deworming: "الديدان",
                                Rabies: "السعار",
                                Ectoparasites: "الحشرات",
                                };
                                const productType =                            productTypeMap[rec.products?.type] || rec.products?.type;
                                const dayInArabic = new Date(rec.due_date).toLocaleDateString("ar-EG", {
                                weekday: "long",
                                });
                                const animalType =
                                rec.animals?.species === "canine" ? "🐶" :
                                rec.animals?.species === "feline" ? "🐱" : "";
                                const animalGender =
                                rec.animals?.gender === "male" ? "💙" :
                                rec.animals?.gender === "female" ? "💜" : "";
                                const formattedDate = new Date(rec.due_date).toLocaleDateString("ar-EG");
                                let phone = rec.owners?.phone || "";
                                phone = phone.replace(/\D/g, "");
                                if (phone.startsWith("0")) {
                                phone = "20" + phone.slice(1);
                                }
                                const whatsappMessage = `مساء الخير 👋\nبنفكرك بمعاد تطعيم *${productType}* الخاص ب *${rec.animals?.name}* ${animalType} ${animalGender}\n📅 يوم ${dayInArabic} الموافق ${formattedDate}\n📍 عنوانا: زوو كير فرع المشايه, خلف فندق مارشال الجزيرة, شارع الامام الشافعي.\nفي انتظاركم ❤️`;
                                const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(`${whatsappMessage}`)}`;
                                return (
                                    <tr key={rec.id} className="group/row hover:bg-primary/5 transition-all duration-300">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl ${status.iconBg} ${status.text} flex items-center justify-center text-lg`}>
                                                    <FontAwesomeIcon icon={faClock} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-mono font-bold text-slate-700">{rec.due_date}</p>
                                                    <p className={`text-[10px] font-black ${status.subText} uppercase italic tracking-wider`}>{status.label}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-secondary text-lg leading-tight">
                                                    {rec.animals?.name} <span className="text-[10px] text-slate-300 font-black ml-1 uppercase">{age}</span>
                                                </span>
                                                <span className="text-xs text-slate-500 font-medium italic">
                                                    {rec.owners?.name} • {rec.owners?.phone}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-secondary uppercase tracking-tight">{rec.products?.name}</span>
                                                <span className="text-[10px] font-black text-primary uppercase italic">{rec.products?.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 shadow-lg shadow-green-500/20">
                                                <FontAwesomeIcon icon={faWhatsapp} className="text-[20px]" />
                                                WhatsApp
                                            </Link>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex justify-center">
                                                <StatusToggle recordId={rec.id} initialStatus={rec.send} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className="py-40 text-center text-slate-300">
                                    <FontAwesomeIcon icon={faCheckCircle} className="text-5xl mb-4 opacity-20" />
                                    <p className="font-black uppercase italic tracking-widest">No pending alerts</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="md:hidden flex flex-col gap-4">
                {alertRecords.map((rec) => {
                    const status = getStatusConfig(rec.due_date);
                    const productTypeMap = {
                        Vaccine: "الفيروسات",
                        Deworming: "الديدان",
                        Rabies: "السعار",
                        Ectoparasites: "الحشرات",
                        };
                        const productType =                            productTypeMap[rec.products?.type] || rec.products?.type;
                        const dayInArabic = new Date(rec.due_date).toLocaleDateString("ar-EG", {
                        weekday: "long",
                        });
                        const animalType =
                        rec.animals?.species === "canine" ? "🐶" :
                        rec.animals?.species === "feline" ? "🐱" : "";
                        const animalGender =
                        rec.animals?.gender === "male" ? "💙" :
                        rec.animals?.gender === "female" ? "💜" : "";
                        const formattedDate = new Date(rec.due_date).toLocaleDateString("ar-EG");
                        let phone = rec.owners?.phone || "";
                        phone = phone.replace(/\D/g, "");
                        if (phone.startsWith("0")) {
                        phone = "20" + phone.slice(1);
                        }
                        const rawName = rec.animals?.name;
                        const isNameKnown = rawName && rawName.toLowerCase() !== "unknown";
                        const animalDisplayName = isNameKnown ? ` *${rawName}*` : "";
                        const whatsappMessage = `مساء الخير 👋\nبنفكرك بمعاد تطعيم *${productType}* الخاص ب *${animalDisplayName}* ${animalType} ${animalGender}\n📅 يوم ${dayInArabic} الموافق ${formattedDate}\n📍 عنوانا: زوو كير فرع المشايه, خلف فندق مارشال الجزيرة, شارع الامام الشافعي.\nفي انتظاركم ❤️`;
                        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(`${whatsappMessage}`)}`;
                    return (
                        <div key={rec.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                            <div className={`px-4 py-2 flex justify-between items-center ${status.iconBg}`}>
                                <span className={`text-[10px] font-black uppercase ${status.text}`}>{status.label}</span>
                                <span className="text-xs font-mono font-bold text-slate-500">{rec.due_date}</span>
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-black text-secondary">{rec.animals?.name}</h3>
                                        <p className="text-xs text-slate-500 font-bold">{rec.owners?.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-primary uppercase italic">{rec.products?.type}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase">{rec.products?.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50 gap-4">
                                    <StatusToggle recordId={rec.id} initialStatus={rec.send} />
                                    <Link href={whatsappUrl} target="_blank" className="flex-1 flex items-center justify-center bg-[#25D366] text-white py-3 rounded-xl text-center text-[10px] font-black uppercase tracking-widest">
                                        <FontAwesomeIcon icon={faWhatsapp} className="text-[20px]" />
                                        WhatsApp
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </main>
    );
}