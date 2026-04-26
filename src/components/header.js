"use client";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faMagnifyingGlass, faSyringe, faUsers } from "@fortawesome/free-solid-svg-icons";
import SearchBar from "./SearchBar";
import { useState } from "react";
import AlertBox from "./alertBox";

export default function Header() {
    const [alertShown, setAlertShown] = useState(false);
    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 px-[4%] py-3 flex flex-col gap-3 md:gap-4">
            <div className="flex items-center justify-between w-full relative">
                <nav className="flex gap-1.5 md:gap-2">
                    <Link href="/products" className="flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-100 text-secondary hover:bg-primary hover:text-white rounded-xl font-bold transition-all duration-200 text-sm">
                        <FontAwesomeIcon icon={faSyringe} />
                        <span className="hidden sm:inline">Products</span>
                    </Link>
                    <Link href="/owners" className="flex items-center gap-2 px-3 md:px-4 py-2 bg-slate-100 text-secondary hover:bg-primary hover:text-white rounded-xl font-bold transition-all duration-200 text-sm">
                        <FontAwesomeIcon icon={faUsers} className="text-xs" />
                        <span className="hidden sm:inline">Owners</span>
                    </Link>
                </nav>
                <div className="absolute left-1/2 -translate-x-1/2">
                    <Link href="/">
                        <Image 
                            src="/logo.webp" 
                            alt="logo" 
                            width={100} 
                            height={34} 
                            className="rounded-lg hover:opacity-80 transition-opacity w-[80px] md:w-[120px] h-auto"
                        />
                    </Link>
                </div>
                <div className="flex gap-2 md:gap-3 items-center">
                    <Link href="/search/advanced" className="group w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:border-primary hover:text-primary rounded-xl transition-all shadow-sm" title="Advanced Search">
                        <FontAwesomeIcon icon={faMagnifyingGlass} className="text-sm md:text-base group-hover:scale-110 transition-transform" />
                    </Link>
                    <div onMouseEnter={() => setAlertShown(true)} onMouseLeave={() => setAlertShown(false)} onClick={() => setAlertShown(!alertShown)} className="relative">
                        <button className="relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center bg-white border border-slate-200 text-slate-400 hover:border-primary hover:text-primary rounded-xl transition-all shadow-sm">
                            <FontAwesomeIcon icon={faBell} className="text-base md:text-lg" />
                            <span className="absolute top-1.5 right-1.5 md:top-2 md:right-2 w-2 h-2 md:w-2.5 md:h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                        </button>
                        <div className={`absolute top-full right-0 mt-2 transition-all duration-200 origin-top-right z-[60] ${alertShown ? "scale-100 opacity-100 visible" : "scale-95 opacity-0 invisible"}`}>
                            <div className="w-[85vw] sm:w-80 max-w-sm">
                                <AlertBox />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="w-full max-w-3xl mx-auto">
                <SearchBar />
            </div>
        </header>
    );
}