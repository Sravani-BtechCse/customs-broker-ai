export type UserRole = "documentation_executive" | "documentation_manager";

export type DocumentType = "commercial_invoice" | "packing_list" | "bill_of_lading";

export type ShipmentStatus =
  | "draft"
  | "ai_processing"
  | "review_required"
  | "cross_check_failed"
  | "ready_for_export"
  | "exported";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface ExtractedField<T = string | number> {
  id: string;
  fieldKey: string;
  label: string;
  value: T;
  originalAiValue?: T;
  confidence: number; // 0.0 to 1.0
  isConfirmed: boolean;
  isEdited: boolean;
  documentSource: DocumentType;
  pageNumber: number;
  boundingBox?: { x: number; y: number; width: number; height: number }; // Percentage 0-100
  notes?: string;
}

export interface LineItem {
  id: string;
  itemDescription: ExtractedField<string>;
  hsnCode: ExtractedField<string>;
  quantity: ExtractedField<number>;
  unit: ExtractedField<string>;
  unitPrice: ExtractedField<number>;
  totalAmount: ExtractedField<number>;
}

export interface DocumentData {
  id: string;
  type: DocumentType;
  fileName: string;
  uploadedAt: string;
  fileSize: string;
  pageCount: number;
  extractedFields: {
    // Header & Parties
    exporterName: ExtractedField<string>;
    exporterAddress?: ExtractedField<string>;
    importerName: ExtractedField<string>;
    importerAddress?: ExtractedField<string>;
    documentNumber: ExtractedField<string>; // Invoice # or B/L #
    documentDate: ExtractedField<string>;
    
    // Trade terms & logistics
    incoterm?: ExtractedField<string>; // CIF, FOB, etc.
    currency?: ExtractedField<string>;
    portOfLoading?: ExtractedField<string>;
    portOfDischarge?: ExtractedField<string>; // e.g., Nhava Sheva (INNSA)
    vesselName?: ExtractedField<string>;
    voyageNumber?: ExtractedField<string>;
    
    // Cargo & Quantities
    containerNumber?: ExtractedField<string>;
    sealNumber?: ExtractedField<string>;
    totalPackages?: ExtractedField<number>;
    packageType?: ExtractedField<string>; // Cartons, Pallets, Drums
    grossWeightKg: ExtractedField<number>;
    netWeightKg?: ExtractedField<number>;
    volumeCbm?: ExtractedField<number>;
    
    // Financials
    invoiceTotal?: ExtractedField<number>;
  };
  lineItems?: LineItem[];
  rawTextSnippet?: string;
}

export type CrossCheckSeverity = "error" | "warning" | "match";

export interface CrossCheckRuleResult {
  ruleId: string;
  ruleName: string;
  description: string;
  status: CrossCheckSeverity;
  sourceDocA: DocumentType;
  sourceDocB: DocumentType;
  valueA: string | number;
  valueB: string | number;
  difference?: string | number;
  toleranceApplied?: string;
  isResolved: boolean;
  resolvedBy?: string;
  resolutionNote?: string;
}

export interface AuditLogEntry {
  id: string;
  shipmentId: string;
  timestamp: string;
  userRole: UserRole;
  userName: string;
  action: "ai_extraction" | "field_edit" | "field_confirmed" | "cross_check_override" | "export_generated";
  fieldLabel?: string;
  oldValue?: string | number;
  newValue?: string | number;
  confidence?: number;
  notes?: string;
}

export interface Shipment {
  id: string; // e.g. "SHP-24811"
  billOfEntryDraftNo: string;
  supplierName: string;
  supplierCountry: string;
  consigneeName: string;
  portOfDischarge: string; // "Nhava Sheva (INNSA)"
  status: ShipmentStatus;
  createdAt: string;
  updatedAt: string;
  documents: {
    invoice?: DocumentData;
    packingList?: DocumentData;
    billOfLading?: DocumentData;
  };
  crossChecks: CrossCheckRuleResult[];
  auditLogs: AuditLogEntry[];
  assignedExecutive: string;
  managerSignOff?: {
    approvedBy: string;
    approvedAt: string;
    overrideJustification?: string;
  };
}

export interface AccuracyMetric {
  fieldKey: string;
  fieldLabel: string;
  totalExtractions: number;
  acceptedWithoutEdit: number;
  humanCorrections: number;
  accuracyRate: number; // percentage
}

export interface SupplierAccuracyMetric {
  supplierName: string;
  country: string;
  shipmentCount: number;
  accuracyRate: number;
  commonErrors: string[];
}
