"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { fetchAPI } from "@/lib/api";

interface QuickAddModalProps {
  type: "accused" | "suspect";
  onClose: () => void;
  onSuccess: () => void;
}

export function QuickAddModal({ type, onClose, onSuccess }: QuickAddModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    gender: "Male",
    age: "",
    address: "",
    contact_no: "",
    nationality: "Indian",
    status: type === "accused" ? "At Large" : "Under Surveillance",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = type === "accused" ? "/accused/" : "/suspects/";
      const payload = type === "accused" ? {
        accused_name: formData.name,
        gender: formData.gender,
        age: parseInt(formData.age),
        address: formData.address,
        contact_no: formData.contact_no,
        nationality: formData.nationality,
        status: formData.status
      } : {
        suspect_name: formData.name,
        gender: formData.gender,
        age: parseInt(formData.age),
        address: formData.address,
        contact_no: formData.contact_no,
        nationality: formData.nationality,
        status: formData.status
      };

      await fetchAPI(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create record");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">
            Add New {type === "accused" ? "Accused" : "Suspect"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label className="text-slate-400 text-xs font-bold uppercase">Full Name</Label>
              <Input 
                required 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-slate-950 border-slate-800 focus:ring-primary" 
                placeholder="Enter full name..."
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-400 text-xs font-bold uppercase">Age</Label>
              <Input 
                required 
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                className="bg-slate-950 border-slate-800" 
                placeholder="Age"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-400 text-xs font-bold uppercase">Gender</Label>
              <select 
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full h-10 bg-slate-950 border border-slate-800 rounded-md px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-400 text-xs font-bold uppercase">Contact Number</Label>
            <Input 
              value={formData.contact_no}
              onChange={(e) => setFormData({...formData, contact_no: e.target.value})}
              className="bg-slate-950 border-slate-800" 
              placeholder="+91 XXXXX XXXXX"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-400 text-xs font-bold uppercase">Address</Label>
            <Input 
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="bg-slate-950 border-slate-800" 
              placeholder="Residential address..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-400 text-xs font-bold uppercase">Status</Label>
            <select 
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
              className="w-full h-10 bg-slate-950 border border-slate-800 rounded-md px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {type === "accused" ? (
                <>
                  <option value="At Large">At Large</option>
                  <option value="In Custody">In Custody</option>
                  <option value="On Bail">On Bail</option>
                </>
              ) : (
                <>
                  <option value="Under Surveillance">Under Surveillance</option>
                  <option value="Cleared">Cleared</option>
                  <option value="Absconding">Absconding</option>
                </>
              )}
            </select>
          </div>

          {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-slate-800 text-slate-400 hover:text-white">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold">
              {loading ? "Processing..." : "Create Record"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
