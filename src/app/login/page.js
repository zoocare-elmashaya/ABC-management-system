"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const router = useRouter();

    // Initialize Supabase Browser Client
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    // Optional: If user is already logged in, kick them to home immediately
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                router.push("/");
            }
        };
        checkUser();
    }, [router, supabase]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setErrorMsg(error.message);
                setLoading(false);
            } else {
                // 1. Force a refresh to sync cookies with the server/middleware
                router.refresh();
                
                // 2. Redirect to the dashboard/home
                // The middleware will now see the cookie and allow entry
                router.push("/");
            }
        } catch (err) {
            setErrorMsg("An unexpected error occurred.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <form 
                onSubmit={handleLogin} 
                className="bg-white p-10 rounded-[2.5rem] shadow-xl w-full max-w-md border border-slate-100"
            >
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black text-secondary italic uppercase mb-2">
                        ABC System
                    </h1>
                    <p className="text-slate-400 font-medium">Veterinary Clinic Management</p>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold border border-red-100 text-center">
                        {errorMsg}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="relative">
                        <input 
                            type="email" 
                            placeholder="Email Address" 
                            required
                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-secondary transition-colors text-slate-700" 
                            onChange={(e) => setEmail(e.target.value)} 
                        />
                    </div>
                    
                    <div className="relative">
                        <input 
                            type="password" 
                            placeholder="Password" 
                            required
                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-secondary transition-colors text-slate-700" 
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                    </div>

                    <button 
                        disabled={loading} 
                        type="submit"
                        className="w-full bg-secondary text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-slate-200"
                    >
                        {loading ? "Authenticating..." : "Enter App"}
                    </button>
                </div>
                
                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-400 uppercase tracking-tighter font-bold">
                        Secure Access • Mansoura Clinic Node
                    </p>
                </div>
            </form>
        </div>
    );
}