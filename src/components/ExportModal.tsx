"use client";

import React, { useState } from "react";
import { Shipment } from "@/types";
import { generateCustomsFilingCSV, downloadCustomsCSV } from "@/lib/exportEngine";
import { 
  FileSpreadsheet, 
  Download, 
  Copy, 
  Check, 
  AlertOctagon, 
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: Shipment;
  onMarkExported: (shipmentId: string) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  shipment,
  onMarkExported,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const unresolvedErrors = shipment.crossChecks.filter((c) => c.status === "error" && !c.isResolved);
  const isBlocked = unresolvedErrors.length > 0;

  const csvData = generateCustomsFilingCSV(shipment);
  const csvLines = csvData.split("\r\n").slice(0, 5); // preview first 5 lines

  const handleDownload = () => {
    downloadCustomsCSV(shipment);
    onMarkExported(shipment.id);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(csvData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-300 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold">Customs Filing Export (ICEGATE / Visual Impex EDI)</h3>
              <p className="text-[11px] text-slate-400">
                Job ID: {shipment.id} • Bill of Entry: {shipment.billOfEntryDraftNo} • Port: {shipment.portOfDischarge}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Status Check */}
          {isBlocked ? (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-start space-x-3">
              <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-xs block mb-1">Export Blocked by PortCheck Guardrail</span>
                <p className="text-[11px]">
                  There are {unresolvedErrors.length} unresolved cross-check discrepancy error(s).
                  To prevent amended Bill of Entry penalties (₹9,000 demurrage at Nhava Sheva),
                  you must resolve the weight or math discrepancies before exporting.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 flex items-center space-x-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-xs block">Cleared for Indian Customs Filing</span>
                <p className="text-[11px]">
                  All 3 documents reconciled. Weights, quantities, container numbers and totals verified.
                </p>
              </div>
            </div>
          )}

          {/* Export Layout Preview */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-semibold text-slate-700">Filing Software CSV Layout Preview:</span>
              <button
                onClick={handleCopy}
                disabled={isBlocked}
                className="text-[11px] text-slate-600 hover:text-blue-600 flex items-center space-x-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Raw CSV"}</span>
              </button>
            </div>

            <div className="bg-slate-900 text-slate-200 p-3 rounded font-mono text-[10px] overflow-x-auto whitespace-pre leading-relaxed border border-slate-700 max-h-48">
              {csvLines.join("\n")}
              {csvData.split("\r\n").length > 5 && "\n... (remaining line items formatted)"}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-[11px] text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">Included Customs Datagroups:</p>
            <p>• Header: Custom station INNSA1, Importer KYC, Exporter, Incoterm CIF, Currency</p>
            <p>• Cargo: Matched Gross Weight, 200 Cartons, Container MSCU7829104, B/L MEDUIN782910</p>
            <p>• Line Items: 8-digit HSN 94054090, 2,400 PCS, Unit Price $6.80, Assessable Value $16,320.00</p>
          </div>

          {/* Footer actions */}
          <div className="flex justify-between items-center pt-3 border-t border-slate-200">
            <span className="text-[10px] text-slate-400">
              Compatible with Softlink, Visual Impex & ICEGATE 2.0 flat-file upload.
            </span>

            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-medium"
              >
                Close
              </button>
              <button
                onClick={handleDownload}
                disabled={isBlocked}
                className={`px-4 py-1.5 rounded text-white font-semibold flex items-center space-x-1.5 transition-all shadow-sm ${
                  isBlocked
                    ? "bg-slate-300 cursor-not-allowed text-slate-500"
                    : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                }`}
              >
                <Download className="w-4 h-4" />
                <span>Download ICEGATE CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
