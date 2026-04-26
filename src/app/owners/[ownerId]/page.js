import { createClient } from "@/lib/supabaseServer";
import AnimalManager from "@/components/animalManager";
import OwnerNav from "@/components/ownerNav";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle, faPhone } from "@fortawesome/free-solid-svg-icons";
export default async function Owner({ params }) {
    const { ownerId } = await params;
    const supabase = await createClient();
    const { data: owner } = await supabase
        .from("owners")
        .select("*")
        .eq("phone", ownerId)
        .single();
    const { data: ownerAnimals } = await supabase
        .from("animals")
        .select("*")
        .eq("owner_id", ownerId);
    const { data: ownerRecords } = await supabase
        .from("records")
        .select(`
            *,
            products(name, type),
            animals!inner(owner_id)
        `)
        .eq("animals.owner_id", ownerId);
    const { data: products } = await supabase
        .from("products")
        .select("*");
    return (
        <main className="w-full min-h-screen bg-slate-50 py-6 md:py-10 px-[4%] md:px-[5%]">
            <OwnerNav ownerId={ownerId}/>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 md:mb-10 mt-6 md:mt-8 border-b border-slate-200 pb-8 gap-6">
                <div className="flex items-center gap-4 md:gap-5 w-full">
                    <div className="shrink-0 w-14 h-14 md:w-16 md:h-16 bg-white rounded-2xl shadow-xl shadow-slate-200 flex items-center justify-center text-primary text-2xl md:text-3xl border border-slate-100">
                        <FontAwesomeIcon icon={faUserCircle} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="px-3 py-0.5 bg-primary/10 text-primary text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full whitespace-nowrap">
                                Client Profile
                            </div>
                        </div>
                        <h1 className="text-2xl md:text-4xl font-black text-secondary uppercase tracking-tight italic truncate">
                            {owner?.name || "Unknown Owner"}
                        </h1>
                    </div>
                </div>
                <div className="flex flex-col items-start lg:items-end gap-2 w-full lg:w-auto">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Contact Information</p>
                    <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm w-full lg:w-auto justify-center lg:justify-start">
                        <FontAwesomeIcon icon={faPhone} className="text-primary text-sm" />
                        <span className="text-base md:text-lg font-mono font-bold text-secondary">
                            {owner?.phone || ownerId}
                        </span>
                    </div>
                </div>
            </div>
            <div className="relative mt-4">
                <div className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
                    <div className="p-1 md:p-0">
                        <AnimalManager animals={ownerAnimals || []} records={ownerRecords || []} products={products || []}/>
                    </div>
                </div>
            </div>
        </main>
    );
}