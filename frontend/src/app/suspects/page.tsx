"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Cookies from "js-cookie";
import { QuickAddModal } from "@/components/QuickAddModal";

export default function SuspectsPage() {
  const [suspects, setSuspects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const [role, setRole] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    setRole(Cookies.get("role"));
  }, []);

  const loadData = () => {
    setLoading(true);
    fetchAPI("/suspects/")
      .then((res) => {
        setSuspects(res.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Under Surveillance": return <Badge variant="secondary" className="bg-orange-600 text-white">Under Surveillance</Badge>;
      case "Cleared": return <Badge variant="default" className="bg-green-600">Cleared</Badge>;
      case "Absconding": return <Badge variant="destructive">Absconding</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {showModal && (
        <QuickAddModal 
          type="suspect" 
          onClose={() => setShowModal(false)} 
          onSuccess={loadData} 
        />
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Suspects Registry</h1>
          <p className="text-slate-400 mt-1">Manage individuals under suspicion and their related cases.</p>
        </div>
        {(role === "Officer" || role === "Admin" || role === "Detective") && (
          <Button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" /> Add Suspect
          </Button>
        )}
      </div>
      
      <div className="rounded-md border border-slate-800 bg-slate-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-950">
            <TableRow className="border-slate-800">
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Age / Gender</TableHead>
              <TableHead>Nationality</TableHead>
              <TableHead className="text-center">Linked FIRs</TableHead>
              <TableHead className="text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">Loading...</TableCell>
              </TableRow>
            ) : suspects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">No suspect records found.</TableCell>
              </TableRow>
            ) : (
              suspects.map((s: any) => (
                <TableRow 
                  key={s.suspect_id} 
                  className="border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/suspects/${s.suspect_id}`)}
                >
                  <TableCell className="font-medium text-orange-500">#{s.suspect_id}</TableCell>
                  <TableCell className="font-medium text-white">{s.suspect_name}</TableCell>
                  <TableCell className="text-slate-300">{s.age} / {s.gender}</TableCell>
                  <TableCell className="text-slate-400">{s.nationality}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="border-slate-700 bg-slate-950">{s.linked_firs_count}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{getStatusBadge(s.status)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
