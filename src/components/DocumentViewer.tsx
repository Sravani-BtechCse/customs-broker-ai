"use client";

import React, { useState } from "react";
import { DocumentData, DocumentType } from "@/types";
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  FileText, 
  Maximize2, 
  Search,
  CheckCircle2,
  AlertTriangle,
  Stamp
} from "lucide-react";

interface DocumentViewerProps {
  documents: {
    invoice?: DocumentData;
    packingList?: DocumentData;
    billOfLading?: DocumentData;
  };
  activeDocType: DocumentType;
  onDocTypeChange: (type: DocumentType) => void;
  highlightedFieldKey?: string | null;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documents,
  activeDocType,
  onDocTypeChange,
  highlightedFieldKey,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const activeDoc = documents[
    activeDocType === "commercial_invoice"
      ? "invoice"
      : activeDocType === "packing_list"
      ? "packingList"
      : "billOfLading"
  ];

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 160));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 75));
  const handleResetZoom = () => setZoomLevel(100);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-700/80 rounded-lg overflow-hidden shadow-lg">
      {/* Top Bar: Document selector tabs */}
      <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-1.5 overflow-x-auto">
          <button
            onClick={() => onDocTypeChange("commercial_invoice")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5 transition-all ${
              activeDocType === "commercial_invoice"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Commercial Invoice</span>
            {documents.invoice && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            )}
          </button>

          <button
            onClick={() => onDocTypeChange("packing_list")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5 transition-all ${
              activeDocType === "packing_list"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Packing List</span>
            {documents.packingList && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            )}
          </button>

          <button
            onClick={() => onDocTypeChange("bill_of_lading")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5 transition-all ${
              activeDocType === "bill_of_lading"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Bill of Lading (B/L)</span>
            {documents.billOfLading && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            )}
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 pl-2">
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline mr-1">
            {zoomLevel}%
          </span>
          <button
            onClick={handleZoomOut}
            title="Zoom out"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomIn}
            title="Zoom in"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetZoom}
            title="Reset Zoom"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Document Display Canvas */}
      <div className="flex-1 overflow-auto p-4 bg-slate-900/90 flex justify-center items-start">
        {activeDoc ? (
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
            className="transition-transform duration-150 ease-out w-full max-w-2xl bg-white text-slate-900 rounded shadow-2xl p-8 border border-slate-300 min-h-[750px] font-sans text-xs relative select-text"
          >
            {/* Visual Paper Watermark / Header */}
            <div className="border-b-2 border-slate-900 pb-4 mb-5">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                    {activeDocType === "commercial_invoice" && "COMMERCIAL INVOICE"}
                    {activeDocType === "packing_list" && "EXPORT PACKING LIST"}
                    {activeDocType === "bill_of_lading" && "COMBINED TRANSPORT BILL OF LADING"}
                  </h2>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Original for Customs Clearance • Nhava Sheva (INNSA) Port
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-800">
                    Doc Ref: {activeDoc.extractedFields.documentNumber?.value || "N/A"}
                  </span>
                  <p className="text-[10px] text-slate-500">
                    Date: {activeDoc.extractedFields.documentDate?.value || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Document Content Rendering */}
            <div className="grid grid-cols-2 gap-4 border border-slate-300 p-3 rounded mb-5 bg-slate-50/50">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                  Shipper / Exporter:
                </span>
                <p className="font-semibold text-slate-900">
                  {activeDoc.extractedFields.exporterName?.value || "Company B"}
                </p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  {activeDoc.extractedFields.exporterAddress?.value || "China"}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                  Consignee / Importer:
                </span>
                <p className="font-semibold text-slate-900">
                  {activeDoc.extractedFields.importerName?.value || "BrightLite Electricals India"}
                </p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  {activeDoc.extractedFields.importerAddress?.value || "Navi Mumbai, India"}
                </p>
              </div>
            </div>

            {/* Logistics Strip */}
            <div className="grid grid-cols-4 gap-2 border border-slate-200 p-2.5 rounded mb-5 bg-white text-[11px]">
              <div>
                <span className="text-[9px] uppercase text-slate-400 block font-semibold">Port of Loading:</span>
                <span className="font-medium text-slate-800">
                  {activeDoc.extractedFields.portOfLoading?.value || "Shenzhen (CNSZX)"}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase text-slate-400 block font-semibold">Port of Discharge:</span>
                <span className="font-medium text-slate-800">
                  {activeDoc.extractedFields.portOfDischarge?.value || "Nhava Sheva (INNSA)"}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase text-slate-400 block font-semibold">Incoterm / Terms:</span>
                <span className="font-medium text-slate-800">
                  {activeDoc.extractedFields.incoterm?.value || "CIF"}
                </span>
              </div>
              <div>
                <span className="text-[9px] uppercase text-slate-400 block font-semibold">Container / Seal:</span>
                <span className="font-mono font-medium text-slate-800">
                  {activeDoc.extractedFields.containerNumber?.value || "MSCU7829104"}
                </span>
              </div>
            </div>

            {/* Line Items Table (For Invoice) */}
            {activeDocType === "commercial_invoice" && activeDoc.lineItems && (
              <div className="border border-slate-300 rounded overflow-hidden mb-5">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-semibold text-slate-700">
                      <th className="py-2 px-3">Item Description</th>
                      <th className="py-2 px-3">HSN Code</th>
                      <th className="py-2 px-3 text-right">Qty</th>
                      <th className="py-2 px-3 text-right">Unit Price</th>
                      <th className="py-2 px-3 text-right">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeDoc.lineItems.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="py-2 px-3 font-medium text-slate-800">
                          {item.itemDescription.value}
                        </td>
                        <td className={`py-2 px-3 font-mono ${
                          highlightedFieldKey === "hsnCode" ? "bg-amber-100 font-bold" : ""
                        }`}>
                          {item.hsnCode.value}
                        </td>
                        <td className="py-2 px-3 text-right">{item.quantity.value.toLocaleString()} {item.unit.value}</td>
                        <td className="py-2 px-3 text-right font-mono">${item.unitPrice.value.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold">${item.totalAmount.value.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Packaging and Weights Box (Highlighting Gross Weight) */}
            <div className={`border p-4 rounded-lg mb-6 transition-all ${
              highlightedFieldKey === "grossWeightKg"
                ? "border-amber-400 bg-amber-50/60 ring-2 ring-amber-300"
                : "border-slate-300 bg-slate-50"
            }`}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Declared Cargo Measurements & Packaging
                </span>
                {highlightedFieldKey === "grossWeightKg" && (
                  <span className="text-[10px] bg-amber-200 text-amber-900 font-semibold px-2 py-0.5 rounded">
                    Field Highlighted
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Total Packages:</span>
                  <span className="font-semibold text-slate-900">
                    {activeDoc.extractedFields.totalPackages?.value || 200} {activeDoc.extractedFields.packageType?.value || "Cartons"}
                  </span>
                </div>

                <div className={`${
                  activeDocType === "commercial_invoice" && activeDoc.extractedFields.grossWeightKg?.value === 3120
                    ? "bg-amber-100/90 -m-1 p-1 rounded border border-amber-300"
                    : ""
                }`}>
                  <span className="text-slate-600 block text-[10px] font-semibold">
                    Gross Weight:
                  </span>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {activeDoc.extractedFields.grossWeightKg?.value?.toLocaleString() || "0"} KGS
                  </span>
                  {activeDocType === "commercial_invoice" && activeDoc.extractedFields.grossWeightKg?.value === 3120 && (
                    <span className="block text-[9px] text-amber-800 font-semibold mt-0.5">
                      ⚠ Invoice says 3,120 kg (Packing List has 3,165 kg)
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-slate-500 block text-[10px]">Net Weight / Volume:</span>
                  <span className="font-semibold text-slate-900">
                    {activeDoc.extractedFields.netWeightKg?.value ? `${activeDoc.extractedFields.netWeightKg.value} KGS` : "2,880 KGS"}
                    {activeDoc.extractedFields.volumeCbm?.value ? ` • ${activeDoc.extractedFields.volumeCbm.value} CBM` : " • 14.8 CBM"}
                  </span>
                </div>
              </div>
            </div>

            {/* Stamp & Verification Block */}
            <div className="mt-8 pt-4 border-t border-slate-300 flex justify-between items-end text-slate-500 text-[10px]">
              <div>
                <p>Nhava Sheva Customs House Broker License: CHB/MUM/2021/008</p>
                <p>Company A Documentation Hub, Sector 17, Vashi, Navi Mumbai</p>
              </div>

              <div className="border border-dashed border-slate-400 p-2.5 rounded bg-slate-50 text-center w-40">
                <Stamp className="w-5 h-5 mx-auto text-blue-600 opacity-80" />
                <span className="font-mono text-[9px] block text-blue-900 font-bold uppercase mt-1">
                  CARRIER VERIFIED
                </span>
                <span className="text-[8px] text-slate-500">EDI Manifest Verified</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-80 text-slate-400">
            <FileText className="w-12 h-12 stroke-1 mb-2 text-slate-500" />
            <p className="text-sm">No document loaded for {activeDocType.replace("_", " ")}</p>
          </div>
        )}
      </div>
    </div>
  );
};
