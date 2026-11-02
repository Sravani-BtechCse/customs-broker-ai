"use client";

import React, { useState } from "react";
import { Shipment, ShipmentStatus, UserRole } from "@/types";
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileSpreadsheet, 
  ShieldCheck, 
  Building2, 
  TrendingUp,
  AlertOctagon,
  FileText
} from "lucide-react";

interface ShipmentListProps {
  shipments: Shipment[];
  onSelectShipment: (id: string) => void;
  onOpenNewShipmentModal: () => void;
  userRole: UserRole;
}

export const ShipmentList: React.FC<ShipmentListProps> = ({
  shipments,
  onSelectShipment,
  onOpenNewShipmentModal,
  userRole,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");

  const filteredShipments = shipments.filter((s) => {
    const matchesSearch =
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.consigneeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.billOfEntryDraftNo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || s.status === statusFilter;

    const matchesSupplier =
      supplierFilter === "all" || s.supplierName.includes(supplierFilter);

    return matchesSearch && matchesStatus && matchesSupplier;
  });

  return (
    <div className="space-y-6">
      {/* Top Enterprise Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Shipments</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">{shipments.length}</span>
            <span className="text-xs text-slate-500">at Nhava Sheva Port</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-medium flex items-center space-x-1">
            <span>• 100% digital ingestion</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Processing Time</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">11.8 min</span>
            <span className="text-xs line-through text-slate-400">45.0 min</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>73.7% faster data entry</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Discrepancies Caught</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">38</span>
            <span className="text-xs text-slate-500">mismatches pre-filing</span>
          </div>
          <div className="mt-2 text-[11px] text-rose-600 font-semibold">
            1 active mismatch blocking export
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Demurrage Saved</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-slate-900">₹3,42,000</span>
            <span className="text-xs text-slate-500">this month</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            Based on ₹9,000 avg penalty / delay
          </div>
        </div>
      </div>

      {/* Action and Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Shipment ID, Supplier, Consignee..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-md py-1.5 px-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="cross_check_failed">Cross-Check Failed</option>
            <option value="review_required">Needs Review</option>
            <option value="ready_for_export">Ready for Export</option>
            <option value="draft">Draft Folder</option>
          </select>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
          <button
            onClick={onOpenNewShipmentModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-all shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Drop In Documents (New Shipment)</span>
          </button>
        </div>
      </div>

      {/* Shipment Records Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Shipment / BE Ref</th>
                <th className="py-3 px-4">Supplier & Country</th>
                <th className="py-3 px-4">Importer (Consignee)</th>
                <th className="py-3 px-4">Port of Discharge</th>
                <th className="py-3 px-4">Cargo & Weight</th>
                <th className="py-3 px-4">Cross-Check Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredShipments.map((s) => {
                const hasWeightMismatch = s.crossChecks.some(
                  (c) => c.ruleId === "RULE_WT_INV_PL" && c.status === "error" && !c.isResolved
                );
                const hasBlockers = s.crossChecks.some((c) => c.status === "error" && !c.isResolved);

                return (
                  <tr
                    key={s.id}
                    onClick={() => onSelectShipment(s.id)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 font-mono text-sm">{s.id}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{s.billOfEntryDraftNo}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{s.supplierName}</div>
                      <div className="text-slate-500 text-[11px]">{s.supplierCountry}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{s.consigneeName}</div>
                      <div className="text-[10px] text-slate-500">MIDC Navi Mumbai</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800">{s.portOfDischarge}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {s.documents.invoice?.extractedFields?.grossWeightKg?.value ? (
                        <div>
                          <span className="font-semibold text-slate-800">
                            {s.documents.invoice.extractedFields.grossWeightKg.value.toLocaleString()} kg
                          </span>
                          <span className="text-slate-500 block text-[10px]">
                            {s.documents.invoice.extractedFields.totalPackages?.value || 200} pkgs
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Awaiting docs</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {hasWeightMismatch ? (
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold text-[11px]">
                          <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />
                          <span>Weight Mismatch (45 kg)</span>
                        </div>
                      ) : s.status === "ready_for_export" ? (
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Cleared for Customs</span>
                        </div>
                      ) : s.status === "draft" ? (
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 font-medium text-[11px]">
                          <span>Draft (No Docs)</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Under Review</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectShipment(s.id);
                        }}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-medium text-xs transition-colors shadow-2xs"
                      >
                        <span>Review</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
