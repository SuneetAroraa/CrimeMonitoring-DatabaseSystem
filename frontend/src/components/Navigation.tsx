"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { ShieldAlert, LayoutDashboard, FileText, Users, LogOut, FileSearch } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const role = Cookies.get("role");

  if (pathname === "/login") return null;

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    router.push("/login");
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/50 sticky top-0 z-50 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-primary font-bold text-lg tracking-tight">
            <ShieldAlert className="h-6 w-6" />
            <span>CMS Central</span>
          </Link>
          <nav className="flex items-center gap-1">
            <Link href="/dashboard">
              <Button variant={pathname === "/dashboard" ? "secondary" : "ghost"} size="sm" className="gap-2">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Button>
            </Link>
            <Link href="/fir">
              <Button variant={pathname.startsWith("/fir") ? "secondary" : "ghost"} size="sm" className="gap-2">
                <FileText className="h-4 w-4" /> FIR Register
              </Button>
            </Link>
            <Link href="/officers">
              <Button variant={pathname === "/officers" ? "secondary" : "ghost"} size="sm" className="gap-2">
                <Users className="h-4 w-4" /> Officers
              </Button>
            </Link>
            <Link href="/accused">
              <Button variant={pathname.startsWith("/accused") ? "secondary" : "ghost"} size="sm" className="gap-2">
                <ShieldAlert className="h-4 w-4" /> Accused
              </Button>
            </Link>
            <Link href="/suspects">
              <Button variant={pathname.startsWith("/suspects") ? "secondary" : "ghost"} size="sm" className="gap-2">
                <FileSearch className="h-4 w-4" /> Suspects
              </Button>
            </Link>
            {role === "Admin" && (
              <Link href="/audit-log">
                <Button variant={pathname === "/audit-log" ? "secondary" : "ghost"} size="sm" className="gap-2">
                  <FileSearch className="h-4 w-4" /> Audit Log
                </Button>
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {role && (
            <div className="text-xs font-semibold px-2 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full">
              {role.toUpperCase()}
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-400 hover:text-white">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
