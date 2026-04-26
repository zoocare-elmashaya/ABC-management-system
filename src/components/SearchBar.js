"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faXmark } from "@fortawesome/free-solid-svg-icons";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import SearchBox from "./SearchBox";
export default function SearchBar() {
    const [searchnumber, setSearchnumber] = useState("");
    const [focused, setFocused] = useState(false);
    const router = useRouter();
    const inputRef = useRef(null);
    const containerRef = useRef(null);
    const handleSearch = (e) => {
        e.preventDefault();
        const query = searchnumber.trim();
        if (!query) return;
        setFocused(false);
        inputRef.current?.blur();
        router.push(`/search?query=${encodeURIComponent(query)}`);
    };
    const clearSearch = () => {
        setSearchnumber("");
        inputRef.current?.focus();
    };
    const handleBlur = (e) => {
        if (!containerRef.current?.contains(e.relatedTarget)) {
            setFocused(false);
        }
    };

    return (
        <form ref={containerRef} className="relative w-full max-w-2xl mx-auto group" onSubmit={handleSearch}onBlur={handleBlur}>
            <div className={`flex items-center w-full h-12 bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden ${focused ? "border-primary shadow-lg shadow-primary/10 ring-4 ring-primary/5" : "border-slate-200 shadow-sm"}`}>
                <div className="pl-4 text-slate-400">
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm" />
                </div>
                <input ref={inputRef}type="text" inputMode="numeric" placeholder="Search by phone number..." value={searchnumber} onFocus={() => setFocused(true)} onChange={(e) => setSearchnumber(e.target.value.replace(/\D/g, ""))} className="flex-1 bg-transparent h-full outline-none px-4 text-gray-700 font-medium placeholder:text-slate-400 placeholder:font-normal" aria-expanded={focused && searchnumber.length > 0}/>
                {searchnumber.length > 0 && (
                    <button type="button" onClick={clearSearch} className="p-2 text-slate-300 hover:text-slate-500 transition-colors" aria-label="Clear search">
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                )}
                <button type="submit" disabled={searchnumber.length === 0} className={`h-full px-6 font-bold text-sm transition-colors ${searchnumber.length > 0 ? "bg-primary text-white hover:bg-secondary cursor-pointer" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}>
                    SEARCH
                </button>
            </div>
            {focused && searchnumber.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                        <SearchBox searchnumber={searchnumber} />
                    </div>
                </div>
            )}
        </form>
    );
}