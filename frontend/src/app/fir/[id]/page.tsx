"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { fetchAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileDown, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { EvidenceSection } from "@/components/EvidenceSection";

export default function FIRDetail() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const role = Cookies.get("role");

  const firId = params.id;

  const loadFIR = async () => {
    try {
      const result = await fetchAPI(`/fir/${firId}`);
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFIR();
  }, [firId]);

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      await fetchAPI(`/fir/${firId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      // reload
      const result = await fetchAPI(`/fir/${firId}`);
      setData(result);
    } catch (e) {
      console.error(e);
      alert("Failed to update status");
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const blob = await fetchAPI(`/reports/fir/${firId}/pdf`);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FIR_${firId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error(e);
      alert("Failed to download PDF");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading case details...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">FIR not found.</div>;

  const { fir_details: fir, evidence, suspects, accused } = data;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Open": return <Badge variant="destructive" className="px-3 py-1">Open</Badge>;
      case "Under Investigation": return <Badge variant="secondary" className="bg-yellow-600 hover:bg-yellow-700 text-white border-transparent px-3 py-1">Under Investigation</Badge>;
      case "Closed": return <Badge variant="default" className="bg-green-600 hover:bg-green-700 px-3 py-1">Closed</Badge>;
      default: return <Badge variant="outline" className="px-3 py-1">{status}</Badge>;
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/fir">
            <Button variant="outline" className="gap-2 border-slate-700 bg-slate-900 hover:bg-slate-800 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Back to list
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleDownloadPDF} className="gap-2 border-slate-700 bg-slate-900 hover:bg-slate-800 hover:text-white">
            <FileDown className="h-4 w-4" /> Export PDF
          </Button>
          {(role === "Detective" || role === "Admin") && fir.case_status !== 'Closed' && (
            <Button 
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleStatusUpdate(fir.case_status === 'Open' ? 'Under Investigation' : 'Closed')}
            >
              <CheckCircle className="h-4 w-4" /> 
              {fir.case_status === 'Open' ? 'Mark Under Investigation' : 'Close Case'}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* FIR Information */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg text-white">FIR Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-slate-500 block mb-1">FIR ID</span>
              <span className="font-medium text-white text-xl">#{fir.fir_id}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Date of Incident</span>
              <span className="font-medium text-white">{fir.fir_date}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Status</span>
              {getStatusBadge(fir.case_status)}
            </div>
          </CardContent>
        </Card>

        {/* Victim Details */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg text-white">Victim Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-slate-500 block mb-1">Name</span>
              <span className="font-medium text-white">{fir.victim_name}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Contact Info</span>
              <span className="font-medium text-white">{fir.victim_contact || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Address</span>
              <span className="font-medium text-white block truncate">{fir.city}, {fir.state} - {fir.pincode} (Incident area)</span>
            </div>
          </CardContent>
        </Card>

        {/* Crime Details */}
        <Card className="bg-slate-900 border-slate-800 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg text-white">Crime Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-slate-500 block mb-1">Crime Type</span>
              <Badge variant="outline" className="border-red-500 text-red-500 bg-red-500/10 text-sm">{fir.crime_name}</Badge>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Description</span>
              <p className="text-slate-300 whitespace-pre-wrap bg-slate-950 p-4 rounded-md border border-slate-800">{fir.complaint_description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Officer Assigned */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg text-white">Officer Assigned</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fir.officer_id ? (
              <>
                <div>
                  <span className="text-slate-500 block mb-1">Officer Name</span>
                  <span className="font-medium text-white">{fir.officer_name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-1">Rank / Badge</span>
                  <span className="font-medium text-white">{fir.officer_rank || 'N/A'} - {fir.officer_station}</span>
                </div>
              </>
            ) : (
              <p className="text-slate-500 italic">No officer currently assigned to this case.</p>
            )}
          </CardContent>
        </Card>

        {/* Location Details */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg text-white">Location Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-slate-500 block mb-1">City</span>
              <span className="font-medium text-white">{fir.city}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Area / Address</span>
              <span className="font-medium text-white">{fir.state} - {fir.pincode}</span>
            </div>
          </CardContent>
        </Card>

        {/* Suspects */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center">
              Suspects <Badge variant="outline" className="ml-2">{suspects?.length || 0}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {suspects?.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {suspects.map((s: any) => (
                  <div key={s.suspect_id} className="p-3 border border-slate-800 bg-slate-950 rounded-md">
                    <Link href={`/suspects/${s.suspect_id}`} className="font-semibold text-primary hover:underline block mb-1">
                      {s.suspect_name}
                    </Link>
                    <div className="text-xs text-slate-400 space-y-1">
                      <p>Status: <span className="text-slate-200">{s.status}</span></p>
                      <p>Gender/Age: <span className="text-slate-200">{s.gender} / {s.age}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic">No suspects recorded for this FIR.</p>
            )}
          </CardContent>
        </Card>

        {/* Accused */}
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg text-white flex items-center">
              Accused <Badge variant="outline" className="ml-2">{accused?.length || 0}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {accused?.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {accused.map((a: any) => (
                  <div key={a.accused_id} className="p-3 border border-slate-800 bg-slate-950 rounded-md">
                    <Link href={`/accused/${a.accused_id}`} className="font-semibold text-red-400 hover:underline block mb-1">
                      {a.accused_name}
                    </Link>
                    <div className="text-xs text-slate-400 space-y-1">
                      <p>Status: <span className="text-slate-200">{a.status}</span></p>
                      <p>Gender/Age: <span className="text-slate-200">{a.gender} / {a.age}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 italic">No accused recorded for this FIR.</p>
            )}
          </CardContent>
        </Card>

      </div>
      
      <EvidenceSection 
        firId={firId} 
        evidenceData={evidence} 
        suspectsData={suspects} 
        onUpdate={loadFIR} 
        role={role} 
      />

    </div>
  );
}
