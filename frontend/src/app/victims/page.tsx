"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function VictimsPage() {
  const [victims, setVictims] = useState([]);

  useEffect(() => {
    fetchAPI("/victims/").then(setVictims).catch(console.error);
  }, []);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-white">Victims Directory</h1>
      <div className="rounded-md border border-slate-800 bg-slate-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-950">
            <TableRow className="border-slate-800">
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Age / Gender</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {victims.map((v: any) => (
              <TableRow key={v.victim_id} className="border-slate-800">
                <TableCell className="font-medium">#{v.victim_id}</TableCell>
                <TableCell>{v.name}</TableCell>
                <TableCell>{v.age} / {v.gender}</TableCell>
                <TableCell>{v.contact}</TableCell>
                <TableCell>{v.address}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
