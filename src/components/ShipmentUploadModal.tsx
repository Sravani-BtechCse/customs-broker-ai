"use client";

import React, { useState } from "react";
import { Shipment, DocumentType } from "@/types";
import { 
  Upload, 
  FileText, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  FolderPlus,
  ShieldCheck
} from "lucide-react";

interface ShipmentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShipmentCreated: (newShipment: Shipment) => void;
}

export const ShipmentUploadModal: React.FC<ShipmentUploadModalProps> = ({
  isOpen,
  onClose,
  onShipmentCreated,
}) => {
  const [supplierName, setSupplierName] = useState("Company B (China)");
  const [consigneeName, setConsigneeName] = useState("BrightLite Electricals India Pvt Ltd");
  const [filesUploaded, setFilesUploaded] = useState<{
    invoice: boolean;
    packingList: boolean;
    billOfLading: boolean;
  }>({
    invoice: false,
    packingList: false,
    billOfLading: false,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");

  if (!isOpen) return null;

  const handleSimulateLoadSampleDocs = () => {
    setFilesUploaded({
      invoice: true,
      packingList: true,
      billOfLading: true,
    });
  };

  const handleStartExtraction = async () => {
    setIsProcessing(true);

    setProcessingStep("1/3 Pre-processing documents & bilingual OCR de-skewing...");
    await new Promise((r) => setTimeout(r, 800));

    setProcessingStep("2/3 Extracting parties, HSN line items & packaging weights...");
    await new Promise((r) => setTimeout(r, 900));

    setProcessingStep("3/3 Running 3-way discrepancy cross-checks (INNSA rules)...");
    await new Promise((r) => setTimeout(r, 700));

    // Construct new shipment with fresh ID
    const newId = `SHP-${Math.floor(24820 + Math.random() * 90)}`;
    const newShipment: Shipment = {
      id: newId,
      billOfEntryDraftNo: `BE-2026/04${Math.floor(1000 + Math.random() * 9000)}`,
      supplierName: supplierName || "Company B (China)",
      supplierCountry: "China",
      consigneeName: consigneeName || "BrightLite Electricals India Pvt Ltd",
      portOfDischarge: "Nhava Sheva (INNSA)",
      status: "cross_check_failed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedExecutive: "Pooja Sharma (Doc Exec)",
      documents: {
        invoice: {
          id: `DOC-INV-${newId}`,
          type: "commercial_invoice",
          fileName: `INV_${newId}_CompanyB.pdf`,
          uploadedAt: new Date().toISOString(),
          fileSize: "1.2 MB",
          pageCount: 1,
          extractedFields: {
            exporterName: {
              id: "f_new_exp",
              fieldKey: "exporterName",
              label: "Exporter / Supplier",
              value: supplierName,
              confidence: 0.98,
              isConfirmed: true,
              isEdited: false,
              documentSource: "commercial_invoice",
              pageNumber: 1,
            },
            exporterAddress: {
              id: "f_new_exp_addr",
              fieldKey: "exporterAddress",
              label: "Exporter Address",
              value: "Bao'an, Shenzhen, China",
              confidence: 0.94,
              isConfirmed: true,
              isEdited: false,
              documentSource: "commercial_invoice",
              pageNumber: 1,
            },
            importerName: {
              id: "f_new_imp",
              fieldKey: "importerName",
              label: "Importer / Consignee",
              value: consigneeName,
              confidence: 0.99,
              isConfirmed: true,
              isEdited: false,
              documentSource: "commercial_invoice",
              pageNumber: 1,
            },
            importerAddress: {
              id: "f_new_imp_addr",
              fieldKey: "importerAddress",
              label: "Importer Address",
              value: "Plot 18, TTC Industrial Area, Turbhe, Navi Mumbai",
              confidence: 0.95,
              isConfirmed: true,
              isEdited: false,
              documentSource: "commercial_invoice",
              pageNumber: 1,
            },
            documentNumber: {
              id: "f_new_invno",
              fieldKey: "documentNumber",
              label: "Invoice Number",
              value: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              confidence: 0.99,
              isConfirmed: true,
              isEdited: false,
              documentSource: "commercial_invoice",
              pageNumber: 1,
            },
            documentDate: {
              id: "f_new_invdate",
              fieldKey: "documentDate",
              label: "Invoice Date",
              value: "2026-11-01",
              confidence: 0.96,
              isConfirmed: true,
              isEdited: false,
              documentSource: "commercial_invoice",
              pageNumber: 1,
            },
            currency: {
              id: "f_new_curr",
              fieldKey: "currency",
              label: "Currency",
              value: "USD",
              confidence: 0.99,
              isConfirmed: true,
              isEdited: false,
              documentSource: "commercial_invoice",
              pageNumber: 1,
            },
            incoterm: {
              id: "f_new_inco",
              fieldKey: "incoterm",
              label: "Incoterm",
              value: "CIF",
              confidence: 0.94,
              isConfirmed: true,
              isEdited: false,
              documentSource: "commercial_invoice",
              pageNumber: 1,
            },
            grossWeightKg: {
              id: "f_new_gw",
              fieldKey: "grossWeightKg",
              label: "Gross Weight (kg)",
              value: 3120, // Has mismatch
              confidence: 0.81,
              isConfirmed: false,
              isEdited: false,
              documentSource: "commercial_invoice",
              pageNumber: 1,
              notes: "Low confidence scan near weight total",
            },
            totalPackages: {
              id: "f_new_pkg",
              fieldKey: "totalPackages",
              label: "Total Packages",
              value: 200,
              confidence: 0.98,
              isConfirmed: true,
              isEdited: false,
              documentSource: "commercial_invoice",
              pageNumber: 1,
            },
            packageType: {
              id: "f_new_pkgtype",
              fieldKey: "packageType",
              label: "Package Type",
              value: "Cartons",
              confidence: 0.97,
              isConfirmed: true,
              isEdited: false,
              documentSource: "commercial_invoice",
              pageNumber: 1,
            },
            invoiceTotal: {
              id: "f_new_tot",
              fieldKey: "invoiceTotal",
              label: "Grand Total",
              value: 16320.0,
              confidence: 0.99,
              isConfirmed: true,
              isEdited: false,
              documentSource: "commercial_invoice",
              pageNumber: 1,
            },
          },
          lineItems: [
            {
              id: `item_${newId}_1`,
              itemDescription: {
                id: "li_desc_new",
                fieldKey: "itemDescription",
                label: "Item Description",
                value: "LED panel light 40W 600x600 Cool White",
                confidence: 0.97,
                isConfirmed: true,
                isEdited: false,
                documentSource: "commercial_invoice",
                pageNumber: 1,
              },
              hsnCode: {
                id: "li_hsn_new",
                fieldKey: "hsnCode",
                label: "HSN Code",
                value: "94054090",
                confidence: 0.74,
                isConfirmed: false,
                isEdited: false,
                documentSource: "commercial_invoice",
                pageNumber: 1,
                notes: "Uncertain classification: 94054090 vs 94051090",
              },
              quantity: {
                id: "li_qty_new",
                fieldKey: "quantity",
                label: "Quantity",
                value: 2400,
                confidence: 0.99,
                isConfirmed: true,
                isEdited: false,
                documentSource: "commercial_invoice",
                pageNumber: 1,
              },
              unit: {
                id: "li_unit_new",
                fieldKey: "unit",
                label: "Unit",
                value: "PCS",
                confidence: 0.98,
                isConfirmed: true,
                isEdited: false,
                documentSource: "commercial_invoice",
                pageNumber: 1,
              },
              unitPrice: {
                id: "li_price_new",
                fieldKey: "unitPrice",
                label: "Unit Price",
                value: 6.8,
                confidence: 0.98,
                isConfirmed: true,
                isEdited: false,
                documentSource: "commercial_invoice",
                pageNumber: 1,
              },
              totalAmount: {
                id: "li_total_new",
                fieldKey: "totalAmount",
                label: "Total Amount",
                value: 16320.0,
                confidence: 0.99,
                isConfirmed: true,
                isEdited: false,
                documentSource: "commercial_invoice",
                pageNumber: 1,
              },
            },
          ],
        },
        packingList: {
          id: `DOC-PL-${newId}`,
          type: "packing_list",
          fileName: `PL_${newId}_CompanyB.pdf`,
          uploadedAt: new Date().toISOString(),
          fileSize: "950 KB",
          pageCount: 1,
          extractedFields: {
            exporterName: {
              id: "f_pl_new_exp",
              fieldKey: "exporterName",
              label: "Exporter",
              value: supplierName,
              confidence: 0.98,
              isConfirmed: true,
              isEdited: false,
              documentSource: "packing_list",
              pageNumber: 1,
            },
            importerName: {
              id: "f_pl_new_imp",
              fieldKey: "importerName",
              label: "Importer",
              value: consigneeName,
              confidence: 0.99,
              isConfirmed: true,
              isEdited: false,
              documentSource: "packing_list",
              pageNumber: 1,
            },
            documentNumber: {
              id: "f_pl_new_no",
              fieldKey: "documentNumber",
              label: "Packing List Ref",
              value: `PL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              confidence: 0.98,
              isConfirmed: true,
              isEdited: false,
              documentSource: "packing_list",
              pageNumber: 1,
            },
            documentDate: {
              id: "f_pl_new_date",
              fieldKey: "documentDate",
              label: "Date",
              value: "2026-11-01",
              confidence: 0.96,
              isConfirmed: true,
              isEdited: false,
              documentSource: "packing_list",
              pageNumber: 1,
            },
            containerNumber: {
              id: "f_pl_new_cntr",
              fieldKey: "containerNumber",
              label: "Container Number",
              value: "MSCU7829104",
              confidence: 0.98,
              isConfirmed: true,
              isEdited: false,
              documentSource: "packing_list",
              pageNumber: 1,
            },
            totalPackages: {
              id: "f_pl_new_pkg",
              fieldKey: "totalPackages",
              label: "Total Packages",
              value: 200,
              confidence: 0.99,
              isConfirmed: true,
              isEdited: false,
              documentSource: "packing_list",
              pageNumber: 1,
            },
            packageType: {
              id: "f_pl_new_pkgtype",
              fieldKey: "packageType",
              label: "Package Type",
              value: "Cartons",
              confidence: 0.98,
              isConfirmed: true,
              isEdited: false,
              documentSource: "packing_list",
              pageNumber: 1,
            },
            grossWeightKg: {
              id: "f_pl_new_gw",
              fieldKey: "grossWeightKg",
              label: "Gross Weight (kg)",
              value: 3165,
              confidence: 0.99,
              isConfirmed: true,
              isEdited: false,
              documentSource: "packing_list",
              pageNumber: 1,
            },
            netWeightKg: {
              id: "f_pl_new_nw",
              fieldKey: "netWeightKg",
              label: "Net Weight (kg)",
              value: 2880,
              confidence: 0.98,
              isConfirmed: true,
              isEdited: false,
              documentSource: "packing_list",
              pageNumber: 1,
            },
            volumeCbm: {
              id: "f_pl_new_cbm",
              fieldKey: "volumeCbm",
              label: "Measurement (CBM)",
              value: 14.8,
              confidence: 0.94,
              isConfirmed: true,
              isEdited: false,
              documentSource: "packing_list",
              pageNumber: 1,
            },
          },
        },
        billOfLading: {
          id: `DOC-BL-${newId}`,
          type: "bill_of_lading",
          fileName: `BL_${newId}_MSC.pdf`,
          uploadedAt: new Date().toISOString(),
          fileSize: "1.3 MB",
          pageCount: 1,
          extractedFields: {
            exporterName: {
              id: "f_bl_new_exp",
              fieldKey: "exporterName",
              label: "Shipper",
              value: supplierName,
              confidence: 0.97,
              isConfirmed: true,
              isEdited: false,
              documentSource: "bill_of_lading",
              pageNumber: 1,
            },
            importerName: {
              id: "f_bl_new_imp",
              fieldKey: "importerName",
              label: "Consignee",
              value: consigneeName,
              confidence: 0.98,
              isConfirmed: true,
              isEdited: false,
              documentSource: "bill_of_lading",
              pageNumber: 1,
            },
            documentNumber: {
              id: "f_bl_new_no",
              fieldKey: "documentNumber",
              label: "B/L Number",
              value: `MEDUIN${Math.floor(100000 + Math.random() * 900000)}`,
              confidence: 0.99,
              isConfirmed: true,
              isEdited: false,
              documentSource: "bill_of_lading",
              pageNumber: 1,
            },
            documentDate: {
              id: "f_bl_new_date",
              fieldKey: "documentDate",
              label: "B/L Date",
              value: "2026-11-02",
              confidence: 0.96,
              isConfirmed: true,
              isEdited: false,
              documentSource: "bill_of_lading",
              pageNumber: 1,
            },
            containerNumber: {
              id: "f_bl_new_cntr",
              fieldKey: "containerNumber",
              label: "Container Number",
              value: "MSCU7829104",
              confidence: 0.99,
              isConfirmed: true,
              isEdited: false,
              documentSource: "bill_of_lading",
              pageNumber: 1,
            },
            totalPackages: {
              id: "f_bl_new_pkg",
              fieldKey: "totalPackages",
              label: "Total Packages",
              value: 200,
              confidence: 0.98,
              isConfirmed: true,
              isEdited: false,
              documentSource: "bill_of_lading",
              pageNumber: 1,
            },
            packageType: {
              id: "f_bl_new_pkgtype",
              fieldKey: "packageType",
              label: "Package Type",
              value: "Cartons",
              confidence: 0.97,
              isConfirmed: true,
              isEdited: false,
              documentSource: "bill_of_lading",
              pageNumber: 1,
            },
            grossWeightKg: {
              id: "f_bl_new_gw",
              fieldKey: "grossWeightKg",
              label: "Gross Weight (kg)",
              value: 3165,
              confidence: 0.99,
              isConfirmed: true,
              isEdited: false,
              documentSource: "bill_of_lading",
              pageNumber: 1,
            },
          },
        },
      },
      crossChecks: [],
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          shipmentId: newId,
          timestamp: new Date().toISOString(),
          userRole: "documentation_executive",
          userName: "System (Vision AI)",
          action: "ai_extraction",
          notes: "Multi-document batch processed. Cross-check failure detected between Invoice and Packing List.",
        },
      ],
    };

    setIsProcessing(false);
    onShipmentCreated(newShipment);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-300 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <FolderPlus className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold">New Nhava Sheva Shipment Ingestion</h3>
              <p className="text-[11px] text-slate-400">
                Upload Commercial Invoice, Packing List, and Bill of Lading
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Preset Sample Data Quick Loader */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-blue-900 text-xs block">
                  Reviewer Quick-Start: Pre-Packaged Nhava Sheva Documents
                </span>
                <p className="text-[11px] text-blue-700 mt-0.5">
                  Loads the exact assessment China shipment (LED panels, 2,400 pcs, with the 45 kg weight discrepancy).
                </p>
              </div>
              <button
                type="button"
                onClick={handleSimulateLoadSampleDocs}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium text-xs transition-colors shadow-xs shrink-0 ml-3"
              >
                1-Click Load 3 Documents
              </button>
            </div>
          </div>

          {/* Form details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Supplier / Exporter:</label>
              <input
                type="text"
                value={supplierName}
                onChange={(e) => setSupplierName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Consignee (Importer):</label>
              <input
                type="text"
                value={consigneeName}
                onChange={(e) => setConsigneeName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* 3 Upload Dropzones */}
          <div className="space-y-2.5">
            <label className="font-semibold text-slate-700 block">
              Required Clearance Documents (3/3):
            </label>

            {/* Doc 1: Invoice */}
            <div
              onClick={() => setFilesUploaded((prev) => ({ ...prev, invoice: !prev.invoice }))}
              className={`p-3 rounded-lg border-2 border-dashed flex items-center justify-between cursor-pointer transition-all ${
                filesUploaded.invoice
                  ? "border-emerald-400 bg-emerald-50/50"
                  : "border-slate-300 hover:border-blue-400 bg-slate-50"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <FileText className={`w-5 h-5 ${filesUploaded.invoice ? "text-emerald-600" : "text-slate-400"}`} />
                <div>
                  <span className="font-semibold text-slate-800">1. Commercial Invoice (INV)</span>
                  <p className="text-[10px] text-slate-500">
                    {filesUploaded.invoice ? "INV_China_Lighting_B2026.pdf (1.2 MB)" : "Click to select or drop PDF/scan"}
                  </p>
                </div>
              </div>
              {filesUploaded.invoice ? (
                <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                  <Check className="w-4 h-4" />
                  <span>Ready</span>
                </span>
              ) : (
                <span className="text-slate-400 text-[11px]">Pending</span>
              )}
            </div>

            {/* Doc 2: Packing List */}
            <div
              onClick={() => setFilesUploaded((prev) => ({ ...prev, packingList: !prev.packingList }))}
              className={`p-3 rounded-lg border-2 border-dashed flex items-center justify-between cursor-pointer transition-all ${
                filesUploaded.packingList
                  ? "border-emerald-400 bg-emerald-50/50"
                  : "border-slate-300 hover:border-blue-400 bg-slate-50"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <FileText className={`w-5 h-5 ${filesUploaded.packingList ? "text-emerald-600" : "text-slate-400"}`} />
                <div>
                  <span className="font-semibold text-slate-800">2. Packing List (PL)</span>
                  <p className="text-[10px] text-slate-500">
                    {filesUploaded.packingList ? "PL_China_Lighting_200Cartons.pdf (980 KB)" : "Click to select or drop PDF/scan"}
                  </p>
                </div>
              </div>
              {filesUploaded.packingList ? (
                <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                  <Check className="w-4 h-4" />
                  <span>Ready</span>
                </span>
              ) : (
                <span className="text-slate-400 text-[11px]">Pending</span>
              )}
            </div>

            {/* Doc 3: Bill of Lading */}
            <div
              onClick={() => setFilesUploaded((prev) => ({ ...prev, billOfLading: !prev.billOfLading }))}
              className={`p-3 rounded-lg border-2 border-dashed flex items-center justify-between cursor-pointer transition-all ${
                filesUploaded.billOfLading
                  ? "border-emerald-400 bg-emerald-50/50"
                  : "border-slate-300 hover:border-blue-400 bg-slate-50"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <FileText className={`w-5 h-5 ${filesUploaded.billOfLading ? "text-emerald-600" : "text-slate-400"}`} />
                <div>
                  <span className="font-semibold text-slate-800">3. Bill of Lading (B/L)</span>
                  <p className="text-[10px] text-slate-500">
                    {filesUploaded.billOfLading ? "BL_MSC_Lauren_INNSA.pdf (1.4 MB)" : "Click to select or drop PDF/scan"}
                  </p>
                </div>
              </div>
              {filesUploaded.billOfLading ? (
                <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                  <Check className="w-4 h-4" />
                  <span>Ready</span>
                </span>
              ) : (
                <span className="text-slate-400 text-[11px]">Pending</span>
              )}
            </div>
          </div>

          {/* AI Progress Tracker */}
          {isProcessing && (
            <div className="p-3 bg-slate-900 text-white rounded-lg space-y-2">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                <span className="font-semibold text-xs">{processingStep}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-blue-500 h-1.5 rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex justify-between items-center pt-3 border-t border-slate-200">
            <span className="text-[11px] text-slate-400 flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>DPDP 2023 Compliant Ingestion</span>
            </span>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-3.5 py-1.5 border border-slate-300 rounded text-slate-700 hover:bg-slate-100 font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartExtraction}
                disabled={isProcessing || (!filesUploaded.invoice && !filesUploaded.packingList)}
                className={`px-4 py-1.5 rounded text-white font-semibold flex items-center space-x-1.5 transition-all shadow-sm ${
                  isProcessing || (!filesUploaded.invoice && !filesUploaded.packingList)
                    ? "bg-slate-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Run AI Extraction & Cross-Checks</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
