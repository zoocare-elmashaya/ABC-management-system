import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faClock, faHourglassHalf, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
export default function AlertBox({ className }) {
    const itemClasses = "flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-gray-600 hover:bg-primary hover:text-white transition-all duration-200 border-b border-slate-100 last:border-0";
    return (
        <div className={`z-50 top-[-1px] flex flex-col items-center justify-center border border-slate-200 rounded-xl shadow-2xl absolute w-56 h-fit bg-white ${className} transition-all duration-300 ease-in-out right-0 top-12 overflow-hidden`}>
            <div className="w-full bg-slate-50 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Filter Due Records
            </div>
            <Link href="/alert/month" className={itemClasses}>
                <FontAwesomeIcon icon={faCalendarDays} className="w-4 text-blue-400 group-hover:text-white" />
                Next 30 Days
            </Link>
            <Link href="/alert/2weeks" className={itemClasses}>
                <FontAwesomeIcon icon={faClock} className="w-4 text-purple-400 group-hover:text-white" />
                Next 14 Days
            </Link>
            <Link href="/alert/7days" className={itemClasses}>
                <FontAwesomeIcon icon={faHourglassHalf} className="w-4 text-orange-400 group-hover:text-white" />
                Next 7 Days
            </Link>
            <Link href="/alert/3days" className={itemClasses}>
                <FontAwesomeIcon icon={faTriangleExclamation} className="w-4 text-red-500 group-hover:text-white" />
                Next 3 Days
            </Link>
        </div>
    );
}