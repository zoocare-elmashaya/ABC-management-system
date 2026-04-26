import Image from "next/image";
export default function Loading() {
    return (
        <main className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50">
            <div className="absolute w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="relative flex flex-col items-center">
                <div className="relative flex items-center justify-center">
                    <div className="absolute w-24 h-24 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
                    <div className="w-16 h-16 bg-secondary text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-secondary/40 relative z-10 animate-bounce">
                        <Image src="/icon.png" alt="System Logo" width={32} height={32} className="w-8 h-8 object-contain" priority/>                    
                    </div>
                </div>
                <div className="mt-8 flex flex-col items-center">
                    <h2 className="text-xl font-black text-secondary uppercase tracking-[0.3em] italic animate-pulse">
                        Loading
                    </h2>
                    <div className="flex gap-1 mt-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                    </div>
                </div>
            </div>
        </main>
    );
}