"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus , faPenToSquare } from "@fortawesome/free-solid-svg-icons"
import NewRecordModal from "./newRecordModel";
import Link from "next/link";
export default function OwnerNav({ownerId}) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <nav className="flex justify-center items-center mt-5">
            <Link href={`/owners/${ownerId}/edit`}  className="absolute flex justify-center items-center w-10 aspect-square bg-primary text-neutralhigh rounded-md right-5"><FontAwesomeIcon icon={faPenToSquare} /></Link>
            <button onClick={()=> setIsOpen(true)} className="absolute w-10 aspect-square bg-primary text-neutralhigh rounded-md right-20"><FontAwesomeIcon icon={faSquarePlus} /></button>
            <NewRecordModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </nav>
    );
}