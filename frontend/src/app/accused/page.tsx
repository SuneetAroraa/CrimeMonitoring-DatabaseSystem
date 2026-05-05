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

export default function AccusedPage() {
  const [accused, setAccused] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const [role, setRole] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    setRole(Cookies.get("role"));
  }, []);

  const loadData = () => {
    setLoading(true);
    fetchAPI("/accused/")
      .then((res) => {
        setAccused(res.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "At Large": return <Badge variant="destructive">At Large</Badge>;
      case "In Custody": return <Badge variant="default" className="bg-green-600">In Custody</Badge>;
      case "On Bail": return <Badge variant="secondary" className="bg-yellow-600 text-white">On Bail</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-8 space-y-6">
      {showModal && (
        <QuickAddModal 
          type="accused" 
          onClose={() => setShowModal(false)} 
          onSuccess={loadData} 
        />
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Accused Registry</h1>
          <p className="text-slate-400 mt-1">Manage accused individuals and their case links.</p>
        </div>
        {(role === "Officer" || role === "Admin" || role === "Detective") && (
          <Button onClick={() => setShowModal(true)} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" /> Add Accused
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
            ) : accused.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-slate-500">No accused records found.</TableCell>
              </TableRow>
            ) : (
              accused.map((a: any) => (
                <TableRow 
                  key={a.accused_id} 
                  className="border-slate-800 hover:bg-slate-800/50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/accused/${a.accused_id}`)}
                >
                  <TableCell className="font-medium text-red-500">#{a.accused_id}</TableCell>
                  <TableCell className="font-medium text-white">{a.accused_name}</TableCell>
                  <TableCell className="text-slate-300">{a.age} / {a.gender}</TableCell>
                  <TableCell className="text-slate-400">{a.nationality}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="border-slate-700 bg-slate-950">{a.linked_firs_count}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{getStatusBadge(a.status)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
