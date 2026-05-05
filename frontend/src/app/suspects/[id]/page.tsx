"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Trash2, Link as LinkIcon, UserX, X } from "lucide-react";
import Link from "next/link";
import Cookies from "js-cookie";

export default function SuspectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Status changing state
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Link FIR modal states
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [availableFirs, setAvailableFirs] = useState<any[]>([]);
  const [loadingFirs, setLoadingFirs] = useState(false);
  const [selectedFir, setSelectedFir] = useState<number | null>(null);
  const [reasonForSuspicion, setReasonForSuspicion] = useState("");

  const role = Cookies.get("role");
  const suspectId = params.id;

  async function loadSuspect() {
    try {
      const result = await fetchAPI(`/suspects/${suspectId}`);
      setData(result.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSuspect();
  }, [suspectId]);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this suspect record?")) return;
    try {
      await fetchAPI(`/suspects/${suspectId}`, { method: "DELETE" });
      router.push("/suspects");
    } catch (e: any) {
      alert(`Delete Failed: ${e.message}`);
    }
  };

  const handleUnlink = async (firSuspectsId: number) => {
    if (!confirm("Are you sure you want to unlink this FIR?")) return;
    try {
      await fetchAPI(`/suspects/unlink-fir/${firSuspectsId}`, { method: "DELETE" });
      await loadSuspect();
    } catch (e: any) {
      alert(`Unlink Failed: ${e.message}`);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    try {
      await fetchAPI(`/suspects/${suspectId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      await loadSuspect();
    } catch (e: any) {
      alert(`Status Update Failed: ${e.message}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const openLinkModal = async () => {
    setShowLinkModal(true);
    setLoadingFirs(true);
    try {
      const firData = await fetchAPI("/fir/");
      setAvailableFirs(firData || []);
    } catch (e) {
      console.error("Failed to load FIRs", e);
    } finally {
      setLoadingFirs(false);
    }
  };

  const submitLink = async () => {
    if (!selectedFir) return;
    try {
      await fetchAPI("/suspects/link-fir", {
        method: "POST",
        body: JSON.stringify({
          fir_id: selectedFir,
          suspect_id: parseInt(suspectId as string),
          reason_for_suspicion: reasonForSuspicion || null
        })
      });
      setShowLinkModal(false);
      setSelectedFir(null);
      setReasonForSuspicion("");
      await loadSuspect();
    } catch (e: any) {
      alert(`Linking failed: ${e.message}`);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading suspect details...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Suspect not found.</div>;

  const { linked_firs, ...suspect } = data;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Under Surveillance": return <Badge variant="secondary" className="bg-orange-600 text-white">Under Surveillance</Badge>;
      case "Cleared": return <Badge variant="default" className="bg-green-600">Cleared</Badge>;
      case "Absconding": return <Badge variant="destructive">Absconding</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto relative">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/suspects">
            <Button variant="ghost" size="icon" className="hover:bg-slate-800 text-slate-400 hover:text-white rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              {suspect.suspect_name}
              {getStatusBadge(suspect.status)}
            </h1>
            <p className="text-slate-400 mt-1">Suspect ID: #{suspect.suspect_id}</p>
          </div>
        </div>
        <div className="flex gap-3">
          {(role === "Admin" || role === "Officer") && (
            <Button variant="destructive" onClick={handleDelete} className="gap-2">
              <UserX className="h-4 w-4" /> Delete Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="bg-slate-900 border-slate-800 md:col-span-1 h-fit">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg text-white">Profile Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm pt-2">
            <div>
              <span className="text-slate-500 block mb-1">Current Status</span>
              {(role === "Admin" || role === "Officer" || role === "Detective") ? (
                <select 
                  className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-2 text-white focus:outline-none focus:border-primary disabled:opacity-50"
                  value={suspect.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                >
                  <option value="Under Surveillance">Under Surveillance</option>
                  <option value="Cleared">Cleared</option>
                  <option value="Absconding">Absconding</option>
                </select>
              ) : (
                <span className="font-medium text-white">{suspect.status}</span>
              )}
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Age / Gender</span>
              <span className="font-medium text-white">{suspect.age} / {suspect.gender}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Nationality</span>
              <span className="font-medium text-white">{suspect.nationality}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Contact No</span>
              <span className="font-medium text-white">{suspect.contact_no || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Address</span>
              <span className="font-medium text-white">{suspect.address || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Profile Created</span>
              <span className="font-medium text-white">{new Date(suspect.created_at).toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>

        {/* Linked FIRs Card */}
        <Card className="bg-slate-900 border-slate-800 md:col-span-2 h-fit">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg text-white">Linked FIRs ({linked_firs.length})</CardTitle>
            {(role === "Officer" || role === "Detective" || role === "Admin") && (
              <Button onClick={openLinkModal} variant="outline" className="border-slate-700 bg-slate-950 gap-2 h-8 text-xs hover:text-white">
                <LinkIcon className="h-3 w-3" /> Link New FIR
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {linked_firs.length === 0 ? (
              <p className="text-slate-500 italic text-sm">This individual is not linked to any active FIRs.</p>
            ) : (
              <div className="rounded-md border border-slate-800 bg-slate-950 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead>FIR ID</TableHead>
                      <TableHead>Crime</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {linked_firs.map((link: any) => (
                      <TableRow key={link.fir_suspects_id} className="border-slate-800 hover:bg-slate-900/50">
                        <TableCell>
                          <Link href={`/fir/${link.fir_id}`} className="text-primary hover:underline">
                            #{link.fir_id}
                          </Link>
                        </TableCell>
                        <TableCell className="text-white">{link.crime_name}</TableCell>
                        <TableCell className="text-slate-400 text-xs">{link.reason_for_suspicion || 'Unspecified'}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">{link.case_status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {(role === "Officer" || role === "Detective" || role === "Admin") && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                              onClick={() => handleUnlink(link.fir_suspects_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Custom Modal for Linking FIR */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-lg max-w-3xl w-full flex flex-col max-h-[85vh] shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-950">
              <h2 className="text-lg font-semibold text-white">Link FIR to Suspect</h2>
              <Button variant="ghost" size="icon" onClick={() => {setShowLinkModal(false); setSelectedFir(null);}} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1 bg-slate-950/50">
              <p className="text-sm text-slate-400 mb-4">Select an FIR from the register below to link this suspect to the case.</p>
              
              <div className="rounded-md border border-slate-800 overflow-hidden bg-slate-900 max-h-[40vh] overflow-y-auto">
                <Table>
                  <TableHeader className="bg-slate-950 sticky top-0 z-10">
                    <TableRow className="border-slate-800">
                      <TableHead>FIR ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Crime</TableHead>
                      <TableHead>City</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingFirs ? (
                      <TableRow><TableCell colSpan={4} className="text-center h-20 text-slate-500">Loading FIRs...</TableCell></TableRow>
                    ) : (
                      availableFirs.map(fir => (
                        <TableRow 
                          key={fir.fir_id} 
                          className={`border-slate-800 cursor-pointer transition-colors ${selectedFir === fir.fir_id ? 'bg-primary/20' : 'hover:bg-slate-800/50'}`}
                          onClick={() => setSelectedFir(fir.fir_id)}
                        >
                          <TableCell className="font-medium">#{fir.fir_id}</TableCell>
                          <TableCell>{fir.fir_date}</TableCell>
                          <TableCell>{fir.crime_name}</TableCell>
                          <TableCell>{fir.city}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {selectedFir && (
                <div className="mt-6 space-y-3 animate-in slide-in-from-bottom-2">
                  <h3 className="text-sm font-medium text-white border-t border-slate-800 pt-4">Reason for Suspicion (Optional)</h3>
                  <Input 
                    placeholder="e.g. Witness matching description, Motive identified..." 
                    className="bg-slate-900 border-slate-700"
                    value={reasonForSuspicion}
                    onChange={(e) => setReasonForSuspicion(e.target.value)}
                  />
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => {setShowLinkModal(false); setSelectedFir(null);}}>Cancel</Button>
              <Button onClick={submitLink} disabled={!selectedFir} className="bg-primary text-white hover:bg-primary/90">
                Confirm Link
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
