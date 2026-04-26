"use client";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus, faPhone, faPaw, faSyringe, faCalendarAlt, faPaperPlane, faUser, faSpinner } from "@fortawesome/free-solid-svg-icons";
import NewRecordModal from "@/components/newRecordModel";
export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 20;
  useEffect(() => {
    fetchRecentActivity(0);
  }, []);
  const fetchRecentActivity = async (pageNum) => {
    // Show full spinner only on initial load
    if (pageNum === 0) setLoading(true);
    else setLoadingMore(true);
    const from = pageNum * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;
    try {
      const { data, error } = await supabase
        .from("records")
        .select(`
          *,
          animals!animal_id (name),
          owners!owner_id (name, phone),
          products!product_id (name)
        `)
        .order("id", { ascending: false })
        .range(from, to);
      if (error) {
        console.error("Error fetching activity:", error.message);
      } else if (data) {
        const formattedData = data.map(record => ({
          ...record,
          animalName: record.animals?.name || "Unknown Pet",
          ownerName: record.owners?.name || "Unknown Owner",
          ownerPhone: record.owners?.phone || "N/A",
          productName: record.products?.name || "Unknown Product",
        }));
        setRecords(prev => pageNum === 0 ? formattedData : [...prev, ...formattedData]);
        if (data.length < ITEMS_PER_PAGE) {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchRecentActivity(nextPage);
  };
  const handleToggleSend = async (recordId, currentStatus) => {
    const updatedRecords = records.map((rec) =>
      rec.id === recordId ? { ...rec, send: !currentStatus } : rec
    );
    setRecords(updatedRecords);
    const { error } = await supabase
      .from("records")
      .update({ send: !currentStatus })
      .eq("id", recordId);
    if (error) {
      console.error("Error updating status:", error.message);
      // Re-fetch only the first page to reset state on error
      setPage(0);
      setHasMore(true);
      fetchRecentActivity(0);
    }
  };
  return (
    <main className="w-full min-h-screen bg-slate-50 py-8 px-[2%]">
      <div className="flex justify-between items-center mb-8 px-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-secondary uppercase tracking-tight italic">
            Recent <span className="text-primary">Activity</span>
          </h1>
          <p className="text-gray-500 font-medium hidden sm:block">Zoo Care ABC Management System</p>
        </div>
        <button 
          onClick={() => setIsOpen(true)} 
          className="flex items-center gap-2 bg-primary text-white px-4 md:px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 hover:scale-105 transition-transform active:scale-95"
        >
          <FontAwesomeIcon icon={faSquarePlus} className="text-xl" />
          <span className="hidden sm:inline">ADD RECORD</span>
        </button>
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-300">
          <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl mb-4" />
          <p className="font-black uppercase tracking-widest text-[10px]">Syncing Database...</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-white rounded-2xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-secondary text-white uppercase text-xs font-black tracking-widest italic">
                  <th className="px-6 py-5"><FontAwesomeIcon icon={faPhone} className="mr-2 opacity-70" /> Phone</th>
                  <th className="px-6 py-5">Owner</th>
                  <th className="px-6 py-5"><FontAwesomeIcon icon={faPaw} className="mr-2 opacity-70" /> Pet</th>
                  <th className="px-6 py-5"><FontAwesomeIcon icon={faSyringe} className="mr-2 opacity-70" /> Product</th>
                  <th className="px-6 py-5"><FontAwesomeIcon icon={faCalendarAlt} className="mr-2 opacity-70" /> Date</th>
                  <th className="px-6 py-5 text-center"><FontAwesomeIcon icon={faPaperPlane} className="mr-2 opacity-70" /> Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.length > 0 ? (
                  records.map((record) => (
                    <tr key={record.id} className="group hover:bg-primary/5 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <Link href={`/owners/${record.ownerPhone}`} className="font-bold text-primary hover:underline underline-offset-4 font-mono">
                          {record.ownerPhone}
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-black text-secondary uppercase italic text-sm">{record.ownerName}</td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-black uppercase border border-slate-200 group-hover:bg-white group-hover:border-primary/30 transition-colors">
                          {record.animalName}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-600">{record.productName}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-gray-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 italic font-bold">
                          {record.date}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center">
                          <label className="relative flex items-center cursor-pointer">
                            <input type="checkbox" checked={record.send || false} className="sr-only peer" onChange={() => handleToggleSend(record.id, record.send)}/>
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                            <span className={`ml-3 text-[10px] font-black uppercase transition-colors inline-block w-14 text-left ${record.send ? 'text-primary' : 'text-slate-400'}`}>
                              {record.send ? 'Sent' : 'Pending'}
                            </span>
                          </label>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">No records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="md:hidden space-y-4">
            {records.map((record) => (
              <div key={record.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <Link href={`/owners/${record.ownerPhone}`} className="text-primary font-black text-lg font-mono">
                      {record.ownerPhone}
                    </Link>
                    <span className="text-secondary font-black uppercase italic text-sm flex items-center gap-2">
                      <FontAwesomeIcon icon={faUser} className="text-[10px] opacity-40"/> {record.ownerName}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-mono text-gray-400 italic mb-2 font-bold">{record.date}</span>
                    <label className="relative flex items-center cursor-pointer scale-90 origin-right">
                      <input type="checkbox" checked={record.send || false}  className="sr-only peer" onChange={() => handleToggleSend(record.id, record.send)}/>
                      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                      <span className={`ml-2 text-[10px] font-black uppercase inline-block w-14 text-left ${record.send ? 'text-primary' : 'text-slate-400'}`}>
                        {record.send ? 'Sent' : 'Pending'}
                      </span>
                    </label>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faPaw} className="text-primary text-xs" />
                    <span className="text-xs font-black uppercase text-slate-600">{record.animalName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faSyringe} className="text-slate-300 text-xs" />
                    <span className="text-xs font-bold text-gray-500 italic">{record.productName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 mb-20 flex flex-col items-center gap-4">
            {hasMore ? (
              <button onClick={handleLoadMore} disabled={loadingMore} className="group flex items-center gap-3 bg-white text-secondary border-2 border-secondary/10 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-secondary hover:text-white transition-all shadow-lg shadow-slate-200 disabled:opacity-50">
                {loadingMore ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                ) : (
                  "Load More Activity"
                )}
              </button>
            ) : (
              <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-[9px] italic">
                End of Records
              </p>
            )}
            <div className="text-gray-400 text-[10px] font-black uppercase tracking-widest italic">
              Showing {records.length} records
            </div>
          </div>
        </>
      )}
      <NewRecordModal isOpen={isOpen} onClose={() => {setIsOpen(false); setPage(0); setHasMore(true); fetchRecentActivity(0);}} />
    </main>
  );
}