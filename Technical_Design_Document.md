# Technical Design Document (TDD)
## PortCheck AI: Multi-Document Extraction & 3-Way Discrepancy Cross-Check Engine
**Target Client:** Company A (Freight Forwarder & Customs House Broker at Nhava Sheva / INNSA Port, Navi Mumbai)  
**Author:** Software Engineering Candidate  
**Submission Date:** November 2026  

---

### Project Links
- **GitHub Repository:** [https://github.com/Sravani-BtechCse/customs-broker-ai](https://github.com/Sravani-BtechCse/customs-broker-ai)
- **Live Deployed Application:** [https://customs-broker-ai.vercel.app](https://customs-broker-ai.vercel.app)

---

## 1. Executive Summary & Problem Framing

Company A handles 1,100 import consignments per month at Jawaharlal Nehru Port (Nhava Sheva). Today, a 14-person documentation team manually re-types unstructured data from Commercial Invoices, Packing Lists, and ocean Bills of Lading (B/L) into customs filing spreadsheets. 

### The Financial & Operational Problem (From Brief)
1. **Direct Data Entry Labour Waste:**  
   $$\text{1,100 shipments/mo} \times 0.75\text{ hr} \times 12\text{ mo} = 9,900\text{ hours/year} \times ₹350/\text{hr} = ₹34.65\text{ Lakh/year}$$
2. **Customs Amendment Demurrage Losses:**  
   $13,200\text{ annual shipments} \times 3\% = 396\text{ delayed shipments}$. Each error triggers an amended Bill of Entry (BE) or container dwell-time demurrage at Nhava Sheva averaging $₹9,000$, costing $₹35.64\text{ Lakh/year}$.
3. **Total Annual Loss:** **$₹70.29\text{ Lakh/year}$**.
4. **Core Technical Challenge:** Intercepting mismatches (specifically gross/net weights, line totals, package counts, and container IDs) across three heterogeneous documents *before* filing on the customs EDI gateway.

---

## 2. Architecture & Tech Stack Rationale

```
+-----------------------------------------------------------------------------------+
|                                 USER WORKSPACE                                    |
|   +------------------------------------+   +----------------------------------+   |
|   |   Documentation Executive          |   |   Documentation Manager          |   |
|   |   (Field verify, edit, drop docs)  |   |   (Overrides, analytics, export) |   |
|   +-----------------+------------------+   +-----------------+----------------+   |
+---------------------|----------------------------------------|--------------------+
                      v                                        v
+-----------------------------------------------------------------------------------+
|                           FRONTEND & DESKTOP WORKSTATION                          |
|  - Next.js 16 (App Router) + TypeScript + Tailwind CSS                            |
|  - High-Density Split Workspace:                                                  |
|      * Left: Interactive Document Viewer (Simulated OCR overlays, zoom, pan)       |
|      * Right Top: 3-Way Cross-Check Discrepancy Matrix (Export Gatekeeper)        |
|      * Right Bottom: Field Confidence Editor (<85% highlight, inline edit, audit) |
+-----------------------------------------------------------------------------------+
                                      |
                                      v
+-----------------------------------------------------------------------------------+
|                            APPLICATION API & ENGINE                               |
|   +---------------------------+   +--------------------------+                    |
|   |  3-Way Cross-Check Engine |   |  Vision AI Extraction    |                    |
|   |  (INNSA tolerance rules)  |   |  (Gemini API + Fallback) |                    |
|   +---------------------------+   +--------------------------+                    |
|   +---------------------------+   +--------------------------+                    |
|   |  Export Engine            |   |  Audit & Accuracy Store  |                    |
|   |  (ICEGATE / Visual Impex) |   |  (DPDP Act 2023 Compliant|                    |
|   +---------------------------+   +--------------------------+                    |
+-----------------------------------------------------------------------------------+
```

### Why This Stack?

1. **Next.js 16 (App Router) with TypeScript:**
   - Single-repo architecture combining responsive server-side rendering, strict client-side state transitions, and serverless API endpoints.
   - Zero runtime database spin-up barriers for evaluators: operates with instant seed data in local and serverless edge deployments.
2. **Tailwind CSS & High-Density Design System:**
   - Customs documentation executives spend 8 hours a day staring at dense shipping paperwork. A "consumer-style" spaced-out UI causes endless scrolling and fatigue. We opted for a high-density, Linear/Flexport-inspired layout with clear typographic hierarchy, high-contrast badges, and instant keyboard focus.
3. **Multi-Tier AI Strategy (Google Gemini Vision API + Deterministic Fallback):**
   - Extracts parties, line items, 8-digit HSN codes, container numbers, and weights with floating-point confidence scores ($0.0 \to 1.0$).
   - Built-in zero-config fallback guarantees that evaluators can run and test all 6-8 core screens without an external API key.
4. **DPDP Act 2023 & Confidentiality Compliance:**
   - Client commercial terms and importer contact data are strictly processed inside sovereign boundaries (India region: `ap-south-1`). AI prompts use non-training privacy agreements.

---

## 3. Data Model

### Core Entities

```typescript
// Shipment Record
interface Shipment {
  id: string;                      // e.g. "SHP-24811"
  billOfEntryDraftNo: string;     // e.g. "BE-2026/048821"
  supplierName: string;            // e.g. "Company B (China)"
  supplierCountry: string;
  consigneeName: string;           // e.g. "BrightLite Electricals India Pvt Ltd"
  portOfDischarge: string;         // "Nhava Sheva (INNSA)"
  status: ShipmentStatus;          // 'draft' | 'cross_check_failed' | 'ready_for_export' | 'exported'
  documents: {
    invoice?: DocumentData;
    packingList?: DocumentData;
    billOfLading?: DocumentData;
  };
  crossChecks: CrossCheckRuleResult[];
  auditLogs: AuditLogEntry[];
}

// Extracted Field with Confidence Scoring
interface ExtractedField<T> {
  id: string;
  fieldKey: string;
  label: string;
  value: T;
  originalAiValue?: T;
  confidence: number;              // 0.0 to 1.0 (e.g. 0.81 = Low Confidence)
  isConfirmed: boolean;            // Requires human operator sign-off
  isEdited: boolean;
  documentSource: DocumentType;
  notes?: string;
}

// 3-Way Cross Check Rule Result
interface CrossCheckRuleResult {
  ruleId: string;                  // e.g. "RULE_WT_INV_PL"
  ruleName: string;
  status: 'match' | 'warning' | 'error';
  sourceDocA: DocumentType;
  sourceDocB: DocumentType;
  valueA: string | number;
  valueB: string | number;
  difference?: string | number;   // e.g. "45 kg difference"
  toleranceApplied: string;        // "0 kg (strict customs tolerance)"
  isResolved: boolean;
  resolvedBy?: string;
}
```

---

## 4. Main Flows & AI Mechanism

### Flow 1: Multi-Document Ingestion & Skew-Corrected OCR
1. User drops in Commercial Invoice, Packing List, and Bill of Lading (or clicks the 1-click sample loader).
2. The vision model normalizes bilingual formatting, rotated mobile snapshots, and skewed scans.
3. Fields are extracted into standardized schema with attached confidence scores.

### Flow 2: 3-Way Discrepancy Cross-Check Engine (The "Hard Part")
The system automatically executes 6 reconciliation rules:
- **Rule 1 (Gross Weight: Invoice vs Packing List):**  
  In sample shipment `SHP-24811`, Invoice declares **3,120 kg** while Packing List declares **3,165 kg** (a 45 kg delta).
- **Rule 2 (Gross Weight: Packing List vs Bill of Lading):**  
  Cross-checks ocean manifest weight (3,165 kg) against packing list to prevent Import General Manifest (IGM) amendment fines.
- **Rule 3 (Invoice Math Check):**  
  $\sum (\text{Line Item Qty} \times \text{Unit Price}) = \text{Declared Invoice Grand Total}$.
- **Rule 4 (Package Count Check):**  
  200 Cartons on Packing List vs 200 Cartons on Ocean Bill of Lading.
- **Rule 5 (Container & Seal Number):**  
  ISO 6346 container match (`MSCU7829104`).
- **Rule 6 (Consignee KYC Identity):**  
  Ensures importer name matches exactly for KYC compliance.

### Flow 3: AI Uncertainty & Export Locking Gatekeeper
When the AI is unsure:
1. Fields with **confidence $< 85\%$** are highlighted in amber with a "Review Required" badge.
2. Unresolved cross-check errors **strictly lock the Export button**.
3. A Documentation Executive or Manager must either:
   - Accept the Packing List weight with 1-click (`Accept PL Weight: 3,165 kg`), or
   - Provide a logged Manager Sign-Off note.
4. Once cleared, the **ICEGATE / Visual Impex CSV** export unlocks instantly.

---

## 5. Key Screens & UI/UX Decisions

| Screen | Design Rationale |
| :--- | :--- |
| **1. Port Dashboard** | High-level KPI cards (Processing time: 11.8 min vs 45 min, Demurrage saved: ₹3.42L, Discrepancies caught: 38). Status filters allow instant identification of blocked shipments. |
| **2. Side-by-Side Review Workstation** | **Used all day by executives:** Document on the left (pan, zoom, realistic invoice styling), Cross-checks and field editor on the right. Hovering a field spotlights it on the document. |
| **3. Discrepancy Panel** | Clear red/green mismatch pills showing document deltas. Action buttons right next to the error to resolve in 1 click. |
| **4. Accuracy & Drift Analytics** | Verifies the client's $>95\%$ SLA target. Displays field-level accuracy and error trends per overseas supplier (e.g. Chinese weight confusion vs German comma decimals). |
| **5. ROI Financial Calculator** | Directly embeds Company A's ₹70.29 Lakh financial formula with interactive sliders to prove the 1.3-month payback on the ₹7.5 Lakh software investment. |
| **6. Customs EDI Exporter** | Flat-file CSV generator matching Indian Customs Bill of Entry import specs (INNSA1 station code). |

---

## 6. Assumptions (Labeled Per Assessment Rules)

1. **[Assumption A1 - Port Specifics]:** Port of Discharge is assumed to be **Nhava Sheva (INNSA1 / Jawaharlal Nehru Port)**, where IGM amendments attract strict ₹9,000 demurrage and delay penalties.
2. **[Assumption A2 - Customs Tolerances]:** Gross cargo weight tolerance between shipping documents is assumed to be **0 kg** for bulk/carton goods under Indian Customs EDI rules, requiring exact reconciliation.
3. **[Assumption A3 - Currency & Pricing]:** All client pricing and commercial terms are assumed confidential under DPDP Act 2023, mandating local or sovereign cloud storage.
4. **[Assumption A4 - Filing Software Format]:** Assumed filing layout matches standard Visual Impex / Softlink flat-file EDI CSV format for Bill of Entry Home Consumption.

---

## 7. What Was Cut vs What We Would Do Next

### Intentionally Cut for the 6-to-8 Screen Core Build:
- Direct API integration with the live ICEGATE customs server (explicitly out of scope per brief).
- Automated HSN customs duty calculation and IGST payment gateway (out of scope).
- Automated WhatsApp notifications to importers for document clarifications (mocked via internal audit trail).

### What We Would Do Next (Production Roadmap):
1. **Dynamic Bounding-Box Overlay:** Direct PDF canvas coordinate mapping to highlight OCR bounding boxes on vector PDFs.
2. **Customs Tariff Master Lookup:** Integration with the CBIC 8-digit tariff schedule for real-time duty estimation.
3. **LLM Few-Shot Supplier Memory:** Self-improving extraction templates that adapt to recurring quirks of specific suppliers (e.g. Company B's carton numbering).
