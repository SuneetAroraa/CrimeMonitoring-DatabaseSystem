"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function OfficersPage() {
  const [officers, setOfficers] = useState([]);

  useEffect(() => {
    fetchAPI("/officers/").then(setOfficers).catch(console.error);
  }, []);

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight text-white">Officer Directory</h1>
      <div className="rounded-md border border-slate-800 bg-slate-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-950">
            <TableRow className="border-slate-800">
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Rank</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Station</TableHead>
              <TableHead className="text-right">Active Caseload</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {officers.map((o: any) => (
              <TableRow key={o.officer_id} className="border-slate-800">
                <TableCell className="font-medium">#{o.officer_id}</TableCell>
                <TableCell>{o.name}</TableCell>
                <TableCell>{o.rank}</TableCell>
                <TableCell>{o.department}</TableCell>
                <TableCell>{o.station}</TableCell>
                <TableCell className="text-right font-bold text-primary">{o.active_cases}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
