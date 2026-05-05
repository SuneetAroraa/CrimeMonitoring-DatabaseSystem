"use client";

import { useState } from "react";
import { fetchAPI } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Edit, Plus, Link as LinkIcon, ChevronDown, ChevronUp, X } from "lucide-react";

export function EvidenceSection({ firId, evidenceData, suspectsData, onUpdate, role }: any) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Add Evidence State
  const [evidenceType, setEvidenceType] = useState("Physical");
  const [description, setDescription] = useState("");
  const [dateCollected, setDateCollected] = useState("");
  const [collectedBy, setCollectedBy] = useState("");

  // Edit Evidence State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDesc, setEditDesc] = useState("");

  // Link Suspect State
  const [linkingId, setLinkingId] = useState<number | null>(null);
  const [selectedSuspectId, setSelectedSuspectId] = useState("");

  const handleAddEvidence = async () => {
    try {
      await fetchAPI(`/fir/${firId}/evidence`, {
        method: "POST",
        body: JSON.stringify({
          evidence_type: evidenceType,
          description,
          date_collected: dateCollected || null,
          collected_by: collectedBy || null
        })
      });
      setShowAddForm(false);
      setDescription("");
      setDateCollected("");
      setCollectedBy("");
      onUpdate();
    } catch (e: any) {
      alert("Failed to add evidence: " + e.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this evidence?")) return;
    try {
      await fetchAPI(`/evidence/${id}`, { method: "DELETE" });
      onUpdate();
    } catch (e: any) {
      alert("Delete failed: " + e.message);
    }
  };

  const handleEditSave = async (id: number) => {
    try {
      await fetchAPI(`/evidence/${id}`, {
        method: "PUT",
        body: JSON.stringify({ description: editDesc })
      });
      setEditingId(null);
      onUpdate();
    } catch (e: any) {
      alert("Edit failed: " + e.message);
    }
  };

  const handleLinkSuspect = async (evidenceId: number) => {
    if (!selectedSuspectId) return;
    try {
      await fetchAPI(`/evidence/${evidenceId}/suspect/${selectedSuspectId}`, { method: "POST" });
      setLinkingId(null);
      setSelectedSuspectId("");
      onUpdate();
    } catch (e: any) {
      alert("Link failed: " + e.message);
    }
  };

  const getSuspectName = (id: number) => {
    const s = suspectsData.find((s: any) => s.suspect_id === id);
    return s ? s.suspect_name : "Unknown";
  };

  return (
    <Card className="bg-slate-900 border-slate-800 md:col-span-2 mt-6">
      <CardHeader className="cursor-pointer flex flex-row items-center justify-between" onClick={() => setIsExpanded(!isExpanded)}>
        <CardTitle className="text-lg text-white">Evidence Log ({evidenceData?.length || 0})</CardTitle>
        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
          {isExpanded ? <ChevronUp /> : <ChevronDown />}
        </Button>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-6">
          {(role === "Officer" || role === "Detective" || role === "Admin") && (
            <div className="flex justify-end">
              <Button onClick={() => setShowAddForm(!showAddForm)} className="gap-2 bg-primary text-white">
                <Plus className="h-4 w-4" /> {showAddForm ? "Cancel" : "Add Evidence"}
              </Button>
            </div>
          )}

          {showAddForm && (
            <div className="bg-slate-950 p-4 rounded-md border border-slate-800 space-y-4">
              <h3 className="font-medium text-white">New Evidence Entry</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Evidence Type</label>
                  <select 
                    className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none"
                    value={evidenceType}
                    onChange={(e) => setEvidenceType(e.target.value)}
                  >
                    <option value="Physical">Physical</option>
                    <option value="Digital">Digital</option>
                    <option value="Documentary">Documentary</option>
                    <option value="Testimonial">Testimonial</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Date Collected</label>
                  <Input 
                    type="date"
                    className="bg-slate-900 border-slate-800 text-sm"
                    value={dateCollected}
                    onChange={(e) => setDateCollected(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Collected By (Officer Name)</label>
                  <Input 
                    placeholder="Officer Name"
                    className="bg-slate-900 border-slate-800 text-sm"
                    value={collectedBy}
                    onChange={(e) => setCollectedBy(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">Description / Notes</label>
                  <textarea 
                    className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-sm text-white focus:outline-none min-h-[80px]"
                    placeholder="Describe the evidence..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <Button onClick={handleAddEvidence} className="bg-primary hover:bg-primary/90 text-white w-full md:w-auto">
                Save Evidence
              </Button>
            </div>
          )}

          {evidenceData?.length > 0 ? (
            <div className="rounded-md border border-slate-800 overflow-hidden bg-slate-950 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-800">
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date / By</TableHead>
                    <TableHead>Linked Suspect</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evidenceData.map((ev: any) => (
                    <TableRow key={ev.evidence_id} className="border-slate-800">
                      <TableCell className="font-medium text-slate-300">{ev.evidence_type}</TableCell>
                      <TableCell className="max-w-xs">
                        {editingId === ev.evidence_id ? (
                          <div className="flex gap-2">
                            <Input 
                              value={editDesc} 
                              onChange={(e) => setEditDesc(e.target.value)} 
                              className="h-8 bg-slate-900 border-slate-700 text-xs"
                            />
                            <Button size="sm" onClick={() => handleEditSave(ev.evidence_id)} className="h-8 px-2 text-xs">Save</Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8 px-2 text-xs">Cancel</Button>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400 line-clamp-2" title={ev.description}>{ev.description}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {ev.date_collected || "N/A"}<br/>
                        <span className="text-slate-500">{ev.collected_by || "Unknown"}</span>
                      </TableCell>
                      <TableCell>
                        {ev.linked_suspect_id ? (
                          <span className="text-xs font-medium text-orange-400">{getSuspectName(ev.linked_suspect_id)}</span>
                        ) : (
                          linkingId === ev.evidence_id ? (
                            <div className="flex gap-2 items-center">
                              <select 
                                className="bg-slate-900 border border-slate-700 text-xs rounded p-1 w-24"
                                value={selectedSuspectId}
                                onChange={(e) => setSelectedSuspectId(e.target.value)}
                              >
                                <option value="">Select...</option>
                                {suspectsData.map((s: any) => (
                                  <option key={s.suspect_id} value={s.suspect_id}>{s.suspect_name}</option>
                                ))}
                              </select>
                              <Button size="sm" onClick={() => handleLinkSuspect(ev.evidence_id)} className="h-6 px-2 text-[10px]">Link</Button>
                              <Button size="sm" variant="ghost" onClick={() => setLinkingId(null)} className="h-6 px-1"><X className="h-3 w-3" /></Button>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-500 italic">None</span>
                          )
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {(role === "Officer" || role === "Detective" || role === "Admin") && (
                          <div className="flex justify-end gap-1">
                            {!ev.linked_suspect_id && (
                              <Button variant="ghost" size="icon" onClick={() => setLinkingId(ev.evidence_id)} className="h-7 w-7 text-blue-400 hover:text-blue-300" title="Link to Suspect">
                                <LinkIcon className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => {setEditingId(ev.evidence_id); setEditDesc(ev.description);}} className="h-7 w-7 text-slate-400 hover:text-white" title="Edit">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(ev.evidence_id)} className="h-7 w-7 text-red-500 hover:text-red-400 hover:bg-red-500/10" title="Delete">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 text-sm">No evidence logged yet.</div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
