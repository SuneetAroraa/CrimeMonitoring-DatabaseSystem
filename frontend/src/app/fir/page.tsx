"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { fetchAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from "lucide-react";

import { useRouter } from "next/navigation";

export default function FIRListPage() {
  const router = useRouter();
  const [firs, setFirs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [showClosed, setShowClosed] = useState(false);
  const [role, setRole] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    setRole(Cookies.get("role"));
  }, []);

  useEffect(() => {
    async function loadFIRs() {
      try {
        const queryParams = new URLSearchParams();
        if (statusFilter) queryParams.append("status", statusFilter);
        if (search) queryParams.append("city", search);
        
        const data = await fetchAPI(`/fir/?${queryParams.toString()}`);
        setFirs(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadFIRs();
  }, [statusFilter, search]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open": return <Badge variant="destructive">Open</Badge>;
      case "Under Investigation": return <Badge variant="secondary" className="bg-yellow-600 hover:bg-yellow-700 text-white border-transparent">Under Investigation</Badge>;
      case "Closed": return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Closed</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">FIR Registry</h1>
          <p className="text-slate-400 mt-1">First Information Reports</p>
        </div>
        {(role === "Officer" || role === "Admin" || role === "Detective") && (
          <Link href="/fir/new">
            <Button className="gap-2 bg-primary hover:bg-primary/90 text-white font-semibold">
              <Plus className="h-4 w-4" /> Register New FIR
            </Button>
          </Link>
        )}
      </div>

      <div className="flex gap-4 items-center mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search by city..." 
            className="pl-9 bg-slate-900 border-slate-800"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select 
          className="flex h-9 w-[180px] items-center justify-between rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Under Investigation">Under Investigation</option>
          <option value="Closed">Closed</option>
        </select>
        
        <Button 
          variant="outline" 
          className="border-slate-800 bg-slate-900 text-slate-300 h-9"
          onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
        >
          Sort by Date: {sortOrder === "desc" ? "Newest First" : "Oldest First"}
        </Button>

        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
          <input 
            type="checkbox" 
            checked={showClosed} 
            onChange={(e) => setShowClosed(e.target.checked)}
            className="rounded border-slate-700 bg-slate-900 text-primary"
          />
          Show Closed Cases
        </label>
      </div>

      <div className="rounded-md border border-slate-800 bg-slate-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-950">
            <TableRow className="border-slate-800 hover:bg-transparent">
              <TableHead className="font-semibold">FIR ID</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold">Crime Type</TableHead>
              <TableHead className="font-semibold">Officer</TableHead>
              <TableHead className="font-semibold">City</TableHead>
              <TableHead className="font-semibold text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">Loading...</TableCell>
              </TableRow>
            ) : firs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">No FIRs found.</TableCell>
              </TableRow>
            ) : (
              firs
                .filter(fir => showClosed ? true : fir.case_status !== "Closed")
                .sort((a, b) => {
                  const tA = new Date(a.fir_date).getTime();
                  const tB = new Date(b.fir_date).getTime();
                  return sortOrder === "desc" ? tB - tA : tA - tB;
                })
                .map((fir) => (
                <TableRow 
                  key={fir.fir_id} 
                  className="border-slate-800 hover:bg-slate-800/50 cursor-pointer"
                  onClick={() => router.push(`/fir/${fir.fir_id}`)}
                >
                  <TableCell className="font-medium text-primary">
                      #{fir.fir_id}
                  </TableCell>
                  <TableCell>{fir.fir_date}</TableCell>
                  <TableCell>{fir.crime_name}</TableCell>
                  <TableCell>{fir.officer_name || "Unassigned"}</TableCell>
                  <TableCell>{fir.city}</TableCell>
                  <TableCell className="text-right">{getStatusBadge(fir.case_status)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
