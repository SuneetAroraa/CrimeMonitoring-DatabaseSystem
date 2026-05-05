"use client";

import { useEffect, useState } from "react";
import { fetchAPI } from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAPI("/audit/").then(setLogs).catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <div className="p-8 text-center text-red-500">Access Denied: {error}</div>;
  }

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          System Audit Log
          <Badge variant="destructive" className="uppercase text-xs font-bold tracking-wider">Admin Only</Badge>
        </h1>
        <p className="text-slate-400 mt-1">Immutable record of critical database operations.</p>
      </div>

      <div className="rounded-md border border-slate-800 bg-slate-900 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-950">
            <TableRow className="border-slate-800">
              <TableHead className="w-[100px]">Log ID</TableHead>
              <TableHead>Timestamp</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="w-1/3">Diff (Old → New)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log: any) => (
              <TableRow key={log.log_id} className="border-slate-800 align-top">
                <TableCell className="font-medium text-slate-400">#{log.log_id}</TableCell>
                <TableCell className="whitespace-nowrap">{new Date(log.changed_at).toLocaleString()}</TableCell>
                <TableCell className="font-mono text-xs">{log.table_name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={log.operation === 'UPDATE' ? 'border-yellow-500/50 text-yellow-500' : 'border-green-500/50 text-green-500'}>
                    {log.operation}
                  </Badge>
                </TableCell>
                <TableCell>{log.changed_by}</TableCell>
                <TableCell>
                  <div className="text-xs font-mono space-y-2 max-w-sm overflow-auto">
                    {log.old_data && (
                      <div className="bg-red-500/10 border border-red-500/20 p-2 rounded text-red-200">
                        {JSON.stringify(log.old_data, null, 2)}
                      </div>
                    )}
                    {log.new_data && (
                      <div className="bg-green-500/10 border border-green-500/20 p-2 rounded text-green-200">
                        {JSON.stringify(log.new_data, null, 2)}
                      </div>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {logs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500">No audit logs found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
