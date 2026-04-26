"use client";
import { useState, useEffect } from "react";
import supabase from "@/lib/supabaseClient";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus, faTrashCan, faSyringe, faLayerGroup, faSpinner } from "@fortawesome/free-solid-svg-icons";
import NewProductModal from "@/components/newProductModel";
export default function Products() {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const ITEMS_PER_PAGE = 20;
    useEffect(() => {
        fetchProducts(0);
    }, []);
    const fetchProducts = async (pageNum) => {
        if (pageNum === 0) setLoading(true);
        else setLoadingMore(true);
        const from = pageNum * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;
        const { data, error } = await supabase
            .from("products")
            .select("*")
            .order("name", { ascending: true })
            .range(from, to);
        if (error) {
            console.error("Error fetching products:", error.message);
        } else if (data) {
            setProducts(prev => pageNum === 0 ? data : [...prev, ...data]);
            if (data.length < ITEMS_PER_PAGE) {
                setHasMore(false);
            }
        }
        setLoading(false);
        setLoadingMore(false);
    };
    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchProducts(nextPage);
    };
    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this product?")) return;
        const { error } = await supabase
            .from("products")
            .delete()
            .eq("id", id);
        if (error) {
            alert("Error deleting product: " + error.message);
        } else {
            setProducts(products.filter((product) => product.id !== id));
        }
    };
    const getTypeStyles = (type) => {
        switch (type?.toLowerCase()) {
            case 'vaccine': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'rabies': return 'bg-red-100 text-red-700 border-red-200';
            case 'deworming': return 'bg-green-100 text-green-700 border-green-200';
            case 'ectoparasites': return 'bg-purple-100 text-purple-700 border-purple-200';
            default: return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    return (
        <main className="relative w-full min-h-screen bg-slate-50 py-8 px-[3%]">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                            {products.length} Items Loaded
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-secondary uppercase tracking-tight italic">
                        Products <span className="text-primary text-xl md:text-2xl">Directory</span>
                    </h1>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95 hover:cursor-pointer">
                    <FontAwesomeIcon icon={faSquarePlus} />
                    <span className="hidden sm:inline">NEW PRODUCT</span>
                </button>
            </div>
            {loading ? (
                <div className="w-full py-20 text-center font-bold text-slate-400 animate-pulse uppercase tracking-widest flex flex-col items-center gap-4">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-2xl" />
                    Loading Inventory...
                </div>
            ) : (
                <>
                    <div className="hidden md:block w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-secondary text-white uppercase text-xs font-black tracking-widest">
                                    <th className="px-8 py-5"><FontAwesomeIcon icon={faSyringe} className="mr-2 opacity-60" /> Product Name</th>
                                    <th className="px-8 py-5"><FontAwesomeIcon icon={faLayerGroup} className="mr-2 opacity-60" /> Category</th>
                                    <th className="px-8 py-5 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {products.map((product) => (
                                    <tr key={product.id} className="group hover:bg-primary/5 transition-colors">
                                        <td className="px-8 py-5">
                                            <span className="text-lg font-bold text-gray-800 group-hover:text-primary transition-colors">
                                                {product.name}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase border ${getTypeStyles(product.type)}`}>
                                                {product.type}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button onClick={() => handleDelete(product.id)} className="rounded-lg bg-white border border-red-100 p-2.5 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm hover:cursor-pointer">
                                                <FontAwesomeIcon icon={faTrashCan} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="md:hidden flex flex-col gap-4">
                        {products.map((product) => (
                            <div key={product.id} className="bg-white p-6 rounded-2xl shadow-md border border-slate-200 relative">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800 mb-1">{product.name}</h3>
                                        <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase border ${getTypeStyles(product.type)}`}>
                                            {product.type}
                                        </span>
                                    </div>
                                    <button onClick={() => handleDelete(product.id)} className="rounded-lg bg-red-50 p-3 text-red-500 active:bg-red-500 active:text-white transition-colors">
                                        <FontAwesomeIcon icon={faTrashCan} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-12 mb-20 flex flex-col items-center gap-4">
                        {hasMore ? (
                            <button onClick={handleLoadMore} disabled={loadingMore} className="bg-white text-secondary border-2 border-secondary/10 px-10 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-secondary hover:text-white transition-all shadow-lg disabled:opacity-50">
                                {loadingMore ? (
                                    <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                                ) : null}
                                {loadingMore ? "Loading..." : "Show More Products"}
                            </button>
                        ) : (
                            products.length > 0 && (
                                <p className="text-slate-300 font-black uppercase tracking-[0.3em] text-[9px] italic">
                                    Full 
                                    Directory Displayed
                                </p>
                            )
                        )}
                    </div>
                    {products.length === 0 && (
                        <div className="mt-10 py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                            <p className="text-slate-400 italic font-bold uppercase tracking-widest text-xs">
                                Your medical stock is empty.
                            </p>
                        </div>
                    )}
                </>
            )}
            <NewProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}onSuccess={() => {setPage(0); setHasMore(true); fetchProducts(0);}}/>
        </main>
    );
}