"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function NewFIRPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    victim_name: "",
    victim_age: "",
    victim_gender: "Male",
    victim_contact: "",
    victim_address: "",
    crime_id: "1",
    location_state: "",
    location_city: "",
    location_pincode: "",
    description: "",
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchAPI("/fir/", {
        method: "POST",
        body: JSON.stringify({
          victim_name: formData.victim_name,
          victim_age: parseInt(formData.victim_age),
          victim_gender: formData.victim_gender,
          victim_contact: formData.victim_contact,
          victim_address: formData.victim_address,
          crime_id: parseInt(formData.crime_id),
          location_state: formData.location_state,
          location_city: formData.location_city,
          location_pincode: formData.location_pincode,
          description: formData.description,
          date: formData.date
        })
      });
      alert("FIR Registered successfully! Officer automatically assigned.");
      router.push("/fir");
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Register New FIR</h1>
        <p className="text-slate-400 mt-1">Provide incident details below. System will auto-assign IDs and available officers.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg text-white">1. Victim Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="victim_name">Full Name</Label>
              <Input id="victim_name" name="victim_name" required value={formData.victim_name} onChange={handleChange} className="bg-slate-950 border-slate-800" placeholder="e.g. John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="victim_age">Age</Label>
              <Input id="victim_age" name="victim_age" type="number" required value={formData.victim_age} onChange={handleChange} className="bg-slate-950 border-slate-800" placeholder="e.g. 35" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="victim_gender">Gender</Label>
              <select 
                id="victim_gender" 
                name="victim_gender" 
                value={formData.victim_gender} 
                onChange={handleChange}
                className="w-full flex h-10 rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="victim_contact">Contact Number</Label>
              <Input id="victim_contact" name="victim_contact" value={formData.victim_contact} onChange={handleChange} className="bg-slate-950 border-slate-800" placeholder="e.g. +1 555-0100" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="victim_address">Home Address</Label>
              <Input id="victim_address" name="victim_address" value={formData.victim_address} onChange={handleChange} className="bg-slate-950 border-slate-800" placeholder="e.g. 123 Maple Street" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg text-white">2. Incident Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="crime_id">Crime Category</Label>
                <select 
                  id="crime_id" 
                  name="crime_id" 
                  required
                  value={formData.crime_id} 
                  onChange={handleChange}
                  className="w-full flex h-10 rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  <option value="1">Theft</option>
                  <option value="2">Assault</option>
                  <option value="3">Fraud</option>
                  <option value="4">Cybercrime</option>
                  <option value="5">Homicide</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date of Incident</Label>
                <Input id="date" name="date" type="date" required value={formData.date} onChange={handleChange} className="bg-slate-950 border-slate-800" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description</Label>
              <textarea 
                id="description" 
                name="description" 
                required 
                value={formData.description} 
                onChange={handleChange} 
                className="w-full flex min-h-[120px] rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-50 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary" 
                placeholder="Provide a comprehensive narrative of the incident..."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-lg text-white">3. Location of Incident</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location_city">City</Label>
              <Input id="location_city" name="location_city" required value={formData.location_city} onChange={handleChange} className="bg-slate-950 border-slate-800" placeholder="e.g. New York" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location_state">State</Label>
              <Input id="location_state" name="location_state" required value={formData.location_state} onChange={handleChange} className="bg-slate-950 border-slate-800" placeholder="e.g. NY" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location_pincode">ZIP / Pincode</Label>
              <Input id="location_pincode" name="location_pincode" required value={formData.location_pincode} onChange={handleChange} className="bg-slate-950 border-slate-800" placeholder="e.g. 10001" />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg font-bold">
            {loading ? "Processing..." : "Submit & Auto-Assign FIR"}
          </Button>
        </div>
      </form>
    </div>
  );
}
