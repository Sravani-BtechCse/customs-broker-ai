"use client";

import React, { useState } from "react";
import { 
  Shipment, 
  UserRole, 
  DocumentType, 
  AccuracyMetric, 
  SupplierAccuracyMetric 
} from "@/types";
import { 
  INITIAL_SHIPMENTS, 
  FIELD_ACCURACY_METRICS, 
  SUPPLIER_ACCURACY_METRICS 
} from "@/lib/sampleData";
import { runCrossChecks } from "@/lib/crossCheckEngine";
import { Header } from "@/components/Header";
import { SignInScreen } from "@/components/SignInScreen";
import { ShipmentList } from "@/components/ShipmentList";
import { DocumentViewer } from "@/components/DocumentViewer";
import { CrossCheckPanel } from "@/components/CrossCheckPanel";
import { ExtractedFieldsEditor } from "@/components/ExtractedFieldsEditor";
import { AccuracyReport } from "@/components/AccuracyReport";
import { RoiBreakdown } from "@/components/RoiBreakdown";
import { ShipmentUploadModal } from "@/components/ShipmentUploadModal";
import { ExportModal } from "@/components/ExportModal";
import { AuditTrailModal } from "@/components/AuditTrailModal";
import { 
  ArrowLeft, 
  FileSpreadsheet, 
  AlertOctagon, 
  CheckCircle2, 
  FileText, 
  ShieldCheck,
  Check,
  Layers,
  Sparkles
} from "lucide-react";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentRole, setCurrentRole] = useState<UserRole>("documentation_executive");
  const [currentUserName, setCurrentUserName] = useState<string>("Pooja Sharma (Doc Exec)");

  const [shipments, setShipments] = useState<Shipment[]>(INITIAL_SHIPMENTS);
  const [selectedShipmentId, setSelectedShipmentId] = useState<string>("SHP-24811");
  const [activeView, setActiveView] = useState<"list" | "review">("list");
  const [activeTab, setActiveTab] = useState<"shipments" | "analytics" | "roi_calculator">("shipments");
  const [activeDocType, setActiveDocType] = useState<DocumentType>("commercial_invoice");
  const [highlightedFieldKey, setHighlightedFieldKey] = useState<string | null>(null);
  const [mobilePane, setMobilePane] = useState<"document" | "crosschecks">("document");

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAuditOpen, setIsAuditOpen] = useState(false);

  const selectedShipment = shipments.find((s) => s.id === selectedShipmentId) || shipments[0];

  // Helper to update selected shipment in state
  const updateCurrentShipment = (updater: (prev: Shipment) => Shipment) => {
    setShipments((prevList) =>
      prevList.map((s) => (s.id === selectedShipment.id ? updater(s) : s))
    );
  };

  // Quick weight resolution (e.g. from the 45kg mismatch in SHP-24811)
  const handleQuickResolveWeight = (preferredDoc: "packing_list" | "commercial_invoice") => {
    updateCurrentShipment((prev) => {
      const targetWeight =
        preferredDoc === "packing_list"
          ? prev.documents.packingList?.extractedFields?.grossWeightKg?.value || 3165
          : prev.documents.invoice?.extractedFields?.grossWeightKg?.value || 3120;

      const updatedDocs = { ...prev.documents };
      if (updatedDocs.invoice?.extractedFields?.grossWeightKg) {
        updatedDocs.invoice = {
          ...updatedDocs.invoice,
          extractedFields: {
            ...updatedDocs.invoice.extractedFields,
            grossWeightKg: {
              ...updatedDocs.invoice.extractedFields.grossWeightKg,
              value: Number(targetWeight),
              isConfirmed: true,
              isEdited: true,
              notes: "Updated to match Packing List & ocean B/L weight for Nhava Sheva filing.",
            },
          },
        };
      }

      const newCrossChecks = runCrossChecks(updatedDocs);
      const isStillFailing = newCrossChecks.some((c) => c.status === "error" && !c.isResolved);

      const newAuditLog = {
        id: `log_${Date.now()}`,
        shipmentId: prev.id,
        timestamp: new Date().toISOString(),
        userRole: currentRole,
        userName: currentUserName,
        action: "field_edit" as const,
        fieldLabel: "Gross Weight (kg)",
        oldValue: 3120,
        newValue: targetWeight,
        notes: `Reconciled Invoice Gross Weight to ${targetWeight} kg based on verified Packing List & B/L.`,
      };

      return {
        ...prev,
        documents: updatedDocs,
        crossChecks: newCrossChecks,
        status: isStillFailing ? "cross_check_failed" : "ready_for_export",
        auditLogs: [newAuditLog, ...prev.auditLogs],
        updatedAt: new Date().toISOString(),
      };
    });
  };

  // Manual resolution of cross-check
  const handleResolveCrossCheck = (ruleId: string, note: string) => {
    updateCurrentShipment((prev) => {
      const updatedRules = prev.crossChecks.map((rule) => {
        if (rule.ruleId === ruleId) {
          return {
            ...rule,
            isResolved: true,
            resolvedBy: currentRole === "documentation_manager" ? "Doc Manager (Override)" : "Doc Executive",
            resolutionNote: note,
          };
        }
        return rule;
      });

      const isStillFailing = updatedRules.some((c) => c.status === "error" && !c.isResolved);

      const newAuditLog = {
        id: `log_${Date.now()}`,
        shipmentId: prev.id,
        timestamp: new Date().toISOString(),
        userRole: currentRole,
        userName: currentUserName,
        action: "cross_check_override" as const,
        notes: `Rule [${ruleId}] cleared: ${note}`,
      };

      return {
        ...prev,
        crossChecks: updatedRules,
        status: isStillFailing ? "cross_check_failed" : "ready_for_export",
        auditLogs: [newAuditLog, ...prev.auditLogs],
        updatedAt: new Date().toISOString(),
      };
    });
  };

  // Field Edit Handler
  const handleUpdateField = (fieldKey: string, newValue: string | number, reason?: string) => {
    updateCurrentShipment((prev) => {
      const updatedDocs = { ...prev.documents };
      const docKey =
        activeDocType === "commercial_invoice"
          ? "invoice"
          : activeDocType === "packing_list"
          ? "packingList"
          : "billOfLading";

      const currentDoc = updatedDocs[docKey];
      if (!currentDoc) return prev;

      let oldVal: any = undefined;
      let label = fieldKey;

      if (fieldKey.startsWith("item_")) {
        const parts = fieldKey.split("_");
        const idx = Number(parts[1]);
        const subKey = parts[2] as "hsn" | "qty" | "price";

        if (currentDoc.lineItems && currentDoc.lineItems[idx]) {
          const item = currentDoc.lineItems[idx];
          if (subKey === "hsn") {
            oldVal = item.hsnCode.value;
            label = "HSN Code";
            item.hsnCode = { ...item.hsnCode, value: String(newValue), isConfirmed: true, isEdited: true };
          } else if (subKey === "qty") {
            oldVal = item.quantity.value;
            label = "Quantity";
            item.quantity = { ...item.quantity, value: Number(newValue), isConfirmed: true, isEdited: true };
          } else if (subKey === "price") {
            oldVal = item.unitPrice.value;
            label = "Unit Price";
            item.unitPrice = { ...item.unitPrice, value: Number(newValue), isConfirmed: true, isEdited: true };
          }
        }
      } else {
        const f = (currentDoc.extractedFields as any)[fieldKey];
        if (f) {
          oldVal = f.value;
          label = f.label;
          (currentDoc.extractedFields as any)[fieldKey] = {
            ...f,
            value: newValue,
            isConfirmed: true,
            isEdited: true,
          };
        }
      }

      const newCrossChecks = runCrossChecks(updatedDocs);
      const isStillFailing = newCrossChecks.some((c) => c.status === "error" && !c.isResolved);

      const newAuditLog = {
        id: `log_${Date.now()}`,
        shipmentId: prev.id,
        timestamp: new Date().toISOString(),
        userRole: currentRole,
        userName: currentUserName,
        action: "field_edit" as const,
        fieldLabel: label,
        oldValue: oldVal,
        newValue: newValue,
        notes: reason || "Manual correction via side-by-side review",
      };

      return {
        ...prev,
        documents: updatedDocs,
        crossChecks: newCrossChecks,
        status: isStillFailing ? "cross_check_failed" : "ready_for_export",
        auditLogs: [newAuditLog, ...prev.auditLogs],
        updatedAt: new Date().toISOString(),
      };
    });
  };

  // Field Confirm Handler
  const handleConfirmField = (fieldKey: string) => {
    updateCurrentShipment((prev) => {
      const updatedDocs = { ...prev.documents };
      const docKey =
        activeDocType === "commercial_invoice"
          ? "invoice"
          : activeDocType === "packing_list"
          ? "packingList"
          : "billOfLading";

      const currentDoc = updatedDocs[docKey];
      if (!currentDoc) return prev;

      if (fieldKey.startsWith("item_")) {
        const parts = fieldKey.split("_");
        const idx = Number(parts[1]);
        const subKey = parts[2];
        if (currentDoc.lineItems && currentDoc.lineItems[idx]) {
          const item = currentDoc.lineItems[idx];
          if (subKey === "hsn") item.hsnCode.isConfirmed = true;
        }
      } else {
        const f = (currentDoc.extractedFields as any)[fieldKey];
        if (f) {
          (currentDoc.extractedFields as any)[fieldKey] = {
            ...f,
            isConfirmed: true,
          };
        }
      }

      return {
        ...prev,
        documents: updatedDocs,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  // Reset data handler
  const handleResetData = () => {
    setShipments(JSON.parse(JSON.stringify(INITIAL_SHIPMENTS)));
    setSelectedShipmentId("SHP-24811");
  };

  // Mark exported handler
  const handleMarkExported = (shipmentId: string) => {
    updateCurrentShipment((prev) => ({
      ...prev,
      status: "exported",
      auditLogs: [
        {
          id: `log_${Date.now()}`,
          shipmentId: prev.id,
          timestamp: new Date().toISOString(),
          userRole: currentRole,
          userName: currentUserName,
          action: "export_generated" as const,
          notes: "ICEGATE Bill of Entry CSV exported successfully for customs clearance.",
        },
        ...prev.auditLogs,
      ],
    }));
  };

  // Unconfirmed count
  const currentDoc =
    selectedShipment?.documents[
      activeDocType === "commercial_invoice"
        ? "invoice"
        : activeDocType === "packing_list"
        ? "packingList"
        : "billOfLading"
    ];

  let unconfirmedCount = 0;
  if (currentDoc?.extractedFields) {
    Object.values(currentDoc.extractedFields).forEach((f) => {
      if (f && f.confidence < 0.85 && !f.isConfirmed) unconfirmedCount++;
    });
  }
  if (currentDoc?.lineItems) {
    currentDoc.lineItems.forEach((item) => {
      if (item.hsnCode.confidence < 0.85 && !item.hsnCode.isConfirmed) unconfirmedCount++;
    });
  }

  // Cross check error count
  const hasUnresolvedErrors = selectedShipment.crossChecks.some(
    (c) => c.status === "error" && !c.isResolved
  );

  // If not signed in, show Sign In Screen
  if (!isAuthenticated) {
    return (
      <SignInScreen
        onSignIn={(role, userName) => {
          setCurrentRole(role);
          setCurrentUserName(userName);
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Application Bar */}
      <Header
        currentRole={currentRole}
        currentUserName={currentUserName}
        onRoleChange={(role) => {
          setCurrentRole(role);
          setCurrentUserName(
            role === "documentation_executive"
              ? "Pooja Sharma (Doc Exec)"
              : "Kavita Rao (Doc Manager)"
          );
        }}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === "shipments") setActiveView("list");
        }}
        onResetData={handleResetData}
        onSignOut={() => setIsAuthenticated(false)}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === "analytics" && (
          <AccuracyReport
            fieldMetrics={FIELD_ACCURACY_METRICS}
            supplierMetrics={SUPPLIER_ACCURACY_METRICS}
          />
        )}

        {activeTab === "roi_calculator" && <RoiBreakdown />}

        {activeTab === "shipments" && activeView === "list" && (
          <ShipmentList
            shipments={shipments}
            onSelectShipment={(id) => {
              setSelectedShipmentId(id);
              setActiveView("review");
            }}
            onOpenNewShipmentModal={() => setIsUploadOpen(true)}
            userRole={currentRole}
          />
        )}

        {activeTab === "shipments" && activeView === "review" && (
          <div className="space-y-4">
            {/* 4-Step Visual Workflow Stepper */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {/* Step 1 */}
                <div className="flex items-center space-x-2 p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                    ✓
                  </div>
                  <div>
                    <span className="font-bold block text-[11px]">1. Ingest Documents</span>
                    <span className="text-[10px] text-emerald-700">3/3 Docs Attached</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-center space-x-2 p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                    ✓
                  </div>
                  <div>
                    <span className="font-bold block text-[11px]">2. Vision AI OCR</span>
                    <span className="text-[10px] text-emerald-700">Confidence: 96.4%</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div
                  className={`flex items-center space-x-2 p-2 rounded-lg border ${
                    hasUnresolvedErrors
                      ? "bg-rose-50 text-rose-800 border-rose-200 animate-pulse"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full text-white flex items-center justify-center font-bold text-[10px] ${
                      hasUnresolvedErrors ? "bg-rose-600" : "bg-emerald-600"
                    }`}
                  >
                    {hasUnresolvedErrors ? "!" : "✓"}
                  </div>
                  <div>
                    <span className="font-bold block text-[11px]">3. 3-Way Cross-Check</span>
                    <span className="text-[10px]">
                      {hasUnresolvedErrors ? "45 kg Delta Detected" : "Reconciliation Cleared"}
                    </span>
                  </div>
                </div>

                {/* Step 4 */}
                <div
                  className={`flex items-center space-x-2 p-2 rounded-lg border ${
                    hasUnresolvedErrors
                      ? "bg-slate-100 text-slate-500 border-slate-200"
                      : "bg-emerald-50 text-emerald-800 border-emerald-200"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full text-white flex items-center justify-center font-bold text-[10px] ${
                      hasUnresolvedErrors ? "bg-slate-400" : "bg-emerald-600"
                    }`}
                  >
                    {hasUnresolvedErrors ? "4" : "✓"}
                  </div>
                  <div>
                    <span className="font-bold block text-[11px]">4. ICEGATE Export</span>
                    <span className="text-[10px]">
                      {hasUnresolvedErrors ? "Locked by Gatekeeper" : "Ready for Download"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Screen Header & Breadcrumbs */}
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setActiveView("list")}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 transition-colors flex items-center space-x-1.5 text-xs font-bold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>All Shipments</span>
                </button>

                <div className="h-4 w-px bg-slate-300"></div>

                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-base text-slate-900 font-mono">
                      {selectedShipment.id}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      ({selectedShipment.billOfEntryDraftNo})
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {selectedShipment.supplierName}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Consignee: {selectedShipment.consigneeName} • Port of Discharge: {selectedShipment.portOfDischarge}
                  </p>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={() => setIsAuditOpen(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Audit History ({selectedShipment.auditLogs.length})
                </button>

                <button
                  onClick={() => setIsExportOpen(true)}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Customs Filing CSV</span>
                </button>
              </div>
            </div>

            {/* View Switcher for Split/Mobile Windows */}
            <div className="flex lg:hidden rounded-lg bg-slate-200 p-1 mb-1">
              <button
                onClick={() => setMobilePane("document")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                  mobilePane === "document"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Inspect Document (Paper)
              </button>
              <button
                onClick={() => setMobilePane("crosschecks")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                  mobilePane === "crosschecks"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Cross-Checks & Fields ({hasUnresolvedErrors ? "⚠ 1 Mismatch" : "Cleared"})
              </button>
            </div>

            {/* Core Side-by-Side Review Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-250px)] min-h-[640px]">
              {/* Left Column (50% on desktop): High-Fidelity Document Viewer */}
              <div className={`${mobilePane === "document" ? "flex" : "hidden"} lg:flex lg:col-span-6 h-full flex flex-col`}>
                <DocumentViewer
                  documents={selectedShipment.documents}
                  activeDocType={activeDocType}
                  onDocTypeChange={setActiveDocType}
                  highlightedFieldKey={highlightedFieldKey}
                />
              </div>

              {/* Right Column (50% on desktop): Cross-Checks (Top) + Field Editor (Bottom) */}
              <div className={`${mobilePane === "crosschecks" ? "flex" : "hidden"} lg:flex lg:col-span-6 h-full flex flex-col space-y-4 overflow-hidden`}>
                {/* Cross-Checks Engine (Top 44%) */}
                <div className="h-[44%] min-h-[260px]">
                  <CrossCheckPanel
                    crossChecks={selectedShipment.crossChecks}
                    userRole={currentRole}
                    onResolveCheck={handleResolveCrossCheck}
                    onQuickResolveWeight={handleQuickResolveWeight}
                    unconfirmedCount={unconfirmedCount}
                    onOpenExport={() => setIsExportOpen(true)}
                  />
                </div>

                {/* Field Extraction & Confidence Editor (Bottom 56%) */}
                <div className="flex-1 overflow-hidden">
                  <ExtractedFieldsEditor
                    documentData={currentDoc}
                    userRole={currentRole}
                    onUpdateField={handleUpdateField}
                    onConfirmField={handleConfirmField}
                    onFlagUnreadable={(f) => handleUpdateField(f, "[UNREADABLE SCAN]", "Marked unreadable by human operator")}
                    onHighlightField={setHighlightedFieldKey}
                    onOpenAuditHistory={() => setIsAuditOpen(true)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Upload New Shipment Modal */}
      <ShipmentUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onShipmentCreated={(newShipment) => {
          newShipment.crossChecks = runCrossChecks(newShipment.documents);
          setShipments((prev) => [newShipment, ...prev]);
          setSelectedShipmentId(newShipment.id);
          setActiveView("review");
        }}
      />

      {/* Customs Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        shipment={selectedShipment}
        onMarkExported={handleMarkExported}
      />

      {/* Audit History Modal */}
      <AuditTrailModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        shipmentId={selectedShipment.id}
        auditLogs={selectedShipment.auditLogs}
      />
    </div>
  );
}
