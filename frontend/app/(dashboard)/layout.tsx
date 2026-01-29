"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { ModeToggleButton } from "@/components/mode-toggle-button";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  LogOut, 
  Loader2 
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // 1. The Protection Logic (Moved here!)
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // 2. Show a loading spinner while checking auth
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // 3. Prevent flash of content if redirected
  if (!user) return null;

  return (
    // CHANGE: 'bg-slate-50' -> 'bg-muted/40' (Standard dashboard background)
    <div className="flex h-screen bg-muted/40">
      
      {/* Sidebar */}
      {/* CHANGE: 'bg-white' -> 'bg-background', 'border-slate-200' -> 'border-border' */}
      <aside className="hidden w-64 flex-col border-r border-border bg-background md:flex">
        <div className="p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-primary">Recruitly</h2>
          {/* Optional: Add Theme Toggle in Sidebar */}
        </div>
        
        <nav className="flex-1 space-y-2 px-4">
          <Link href="/dashboard">
            <Button 
                // Logic to highlight active tab
                variant={pathname === "/dashboard" ? "secondary" : "ghost"} 
                className="w-full justify-start gap-3"
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Button>
          </Link>
          <Link href="/dashboard/candidates">
             <Button 
                variant={pathname.includes("/candidates") ? "secondary" : "ghost"} 
                className="w-full justify-start gap-3"
            >
              <FileText className="w-5 h-5" />
              Candidates
            </Button>
          </Link>
          <Link href="/dashboard/settings">
             <Button 
                variant={pathname.includes("/settings") ? "secondary" : "ghost"} 
                className="w-full justify-start gap-3"
            >
              <Settings className="w-5 h-5" />
              Settings
            </Button>
          </Link>
        </nav>

        {/* User Footer */}
        <div className="border-t border-border p-4">
          <div className="mb-4 flex items-center gap-3 px-2">
            {/* Avatar Placeholder */}
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                {user.email?.[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
                <p className="truncate text-sm font-medium text-foreground">{user.email}</p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive border-border"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header (Mobile-friendly + Theme Toggle) */}
        <header className="flex h-14 items-center gap-4 border-b border-border bg-background px-6 lg:h-[60px]">
            <div className="flex-1">
                <h1 className="text-lg font-semibold text-foreground">Overview</h1>
            </div>
            <ModeToggleButton />
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-6 text-foreground">
            {children}
        </div>
      </main>
    </div>
  );
}