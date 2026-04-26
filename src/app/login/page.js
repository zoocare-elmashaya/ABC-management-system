"use client";
import { useState } from "react";
import supabase from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) {
            alert(error.message);
        } else {
            router.push("/");
        }
        setLoading(false);
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <form onSubmit={handleLogin} className="bg-white p-10 rounded-[2.5rem] shadow-xl w-full max-w-md border border-slate-100">
                <h1 className="text-2xl font-black text-secondary italic uppercase mb-6 text-center">ABC System Login</h1>
                <div className="space-y-4">
                    <input type="email" placeholder="Email" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary" onChange={(e) => setEmail(e.target.value)} />
                    <input type="password" placeholder="Password" className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-primary" onChange={(e) => setPassword(e.target.value)} />
                    <button disabled={loading} className="w-full bg-secondary text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-primary transition-all">
                        {loading ? "Verifying..." : "Enter App"}
                    </button>
                </div>
            </form>
        </div>
    );
}