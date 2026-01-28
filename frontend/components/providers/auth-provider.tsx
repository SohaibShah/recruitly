"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { useRouter } from "next/navigation"
import { sup } from "framer-motion/client"
import { sign } from "crypto"

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const AuthContext = createContext<any>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        // Check if there's an active session
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user ?? null)
            setLoading(false)
        }

        getSession()

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null)
                if (!session) router.push("/login")
            }
        )

        return () => subscription.unsubscribe()
    }, [router])

    const signInWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({ provider: "google" })
    }

    const signOut = async () => {
        await supabase.auth.signOut()
    }

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)