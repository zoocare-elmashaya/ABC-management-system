'use client'
import { useEffect } from 'react'
import supabase from '@/lib/supabaseClient'
export default function ClientAuthReset({ children }) {
    useEffect(() => {
        const reset = async () => {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
            await supabase.auth.signOut()
        }
        }
        reset()
    }, [])
    return children
}