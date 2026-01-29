"use client"

import { createClient } from "@supabase/supabase-js"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"


const AuthCallbackPage = () => {
    const router = useRouter()

    useEffect(() => {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )

        const handleAuth = async () => {
            const { data: { session }, error } = await supabase.auth.getSession()

            if (error) {
                console.error("Auth error:", error)
                router.push("/login?error=auth-failed")
            } else if (session) {
                router.push("/dashboard")
            } else {
                const { data: { subscription } } = supabase.auth.onAuthStateChange(
                    (_event, session) => {
                        if (session) 
                            router.push("/dashboard")
                    }
                )

                return () => subscription.unsubscribe()
            }
        }
        
        handleAuth()
    }, [router])
    
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-muted/40 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
                Finalizing secure login...
            </p>
        </div>
    )
}

export default AuthCallbackPage 