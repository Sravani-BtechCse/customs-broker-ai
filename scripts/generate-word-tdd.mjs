import fs from "node:fs";
import path from "node:path";
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  BorderStyle,
  AlignmentType
} from "docx";

async function generateDocx() {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: "Technical Design Document (TDD)",
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "PortCheck AI: Multi-Document AI Extraction & 3-Way Discrepancy Cross-Check Engine",
                bold: true,
                size: 26,
                color: "1E3A8A",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Client: Company A (Freight Forwarder & Customs Broker, Nhava Sheva / INNSA Port, Navi Mumbai)",
                italics: true,
                size: 22,
                color: "4B5563",
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
          }),

          // Links Box
          new Paragraph({
            text: "PROJECT SUBMISSION LINKS",
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• GitHub Repository: ", bold: true }),
              new TextRun({ text: "https://github.com/Sravani-BtechCse/customs-broker-ai", color: "2563EB" }),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Live Deployed Application: ", bold: true }),
              new TextRun({ text: "https://customs-broker-ai.vercel.app", color: "2563EB" }),
            ],
            spacing: { after: 240 },
          }),

          // Section 1: Executive Summary
          new Paragraph({
            text: "1. Executive Summary & Problem Framing",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 240, after: 120 },
          }),
          new Paragraph({
            text: "Company A operates as a licensed customs house broker at Jawaharlal Nehru Port (Nhava Sheva). The firm processes 1,100 import consignments monthly with a documentation team of 14 executives.",
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "The ₹70.29 Lakh/Year Problem (Verified From Brief Numbers):", bold: true }),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            text: "• Manual Typing Labour Cost: 1,100 shipments × 0.75 hrs (45 min) × 12 months = 9,900 hours × ₹350/hr = ₹34.65 Lakh/year.",
            spacing: { after: 60 },
          }),
          new Paragraph({
            text: "• Port Demurrage & Amended Bill of Entry Fines: 13,200 annual shipments × 3% error rate = 396 delay incidents × ₹9,000 (demurrage fees, staff time) = ₹35.64 Lakh/year.",
            spacing: { after: 60 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "• Total Annual Loss: ₹70.29 Lakh/year.", bold: true, color: "DC2626" }),
              new TextRun({ text: " PortCheck AI directly addresses this by intercepting cross-document errors before customs declaration." }),
            ],
            spacing: { after: 200 },
          }),

          // Section 2: Architecture
          new Paragraph({
            text: "2. Architecture & Technical Stack Rationale",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 120 },
          }),
          new Paragraph({
            text: "The platform is architected as an enterprise-grade full-stack web application with strict role-based operational boundaries:",
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: "• Framework: Next.js 16 (App Router) with TypeScript for rigorous end-to-end type safety and deterministic state handling.",
            spacing: { after: 60 },
          }),
          new Paragraph({
            text: "• UI/UX: Tailwind CSS desktop-optimized dense workspace. Customs operators work 8 hours daily; UI prioritizes zero vertical scrolling, high-contrast badges, and 1-click reconciliation.",
            spacing: { after: 60 },
          }),
          new Paragraph({
            text: "• Hybrid AI Strategy: Multimodal vision extraction (Google Gemini API) paired with a deterministic offline fallback engine ensuring 100% testability out of the box.",
            spacing: { after: 60 },
          }),
          new Paragraph({
            text: "• Compliance: DPDP Act 2023 compliant data isolation within India (AWS Mumbai ap-south-1). No customer pricing or personal identification data is used for model training.",
            spacing: { after: 200 },
          }),

          // Section 3: Data Model
          new Paragraph({
            text: "3. Data Model & Schema Design",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 120 },
          }),
          new Paragraph({
            text: "The data model centers on three key structures: Shipment, ExtractedField with confidence scores, and CrossCheckRuleResult.",
            spacing: { after: 100 },
          }),
          new Paragraph({
            text: "• ExtractedField<T>: Encapsulates raw value, confidence score (0.0 to 1.0), confirmation state (boolean), and edit history. Fields with confidence < 0.85 trigger mandatory human review.",
            spacing: { after: 60 },
          }),
          new Paragraph({
            text: "• CrossCheckRuleResult: Captures pairwise and 3-way reconciliation states, tolerance bands, deltas, and manager sign-off audit records.",
            spacing: { after: 200 },
          }),

          // Section 4: Main Flows & AI Uncertainty
          new Paragraph({
            text: "4. Main Flows & AI Uncertainty Handling",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "The 3-Way Cross Check Engine (The Core 'Hard Part'):", bold: true }),
            ],
            spacing: { after: 80 },
          }),
          new Paragraph({
            text: "1. Gross Weight Reconciliation: In sample shipment SHP-24811, Invoice declares 3,120 kg while Packing List declares 3,165 kg (45 kg difference). The engine flags this as a critical blocker.",
            spacing: { after: 60 },
          }),
          new Paragraph({
            text: "2. Ocean Manifest Weight Check: Verifies Packing List weight (3,165 kg) matches Bill of Lading weight (3,165 kg) to prevent IGM amendment demurrage.",
            spacing: { after: 60 },
          }),
          new Paragraph({
            text: "3. Invoice Arithmetic: Asserts that individual line items sum to the declared invoice grand total ($16,320.00).",
            spacing: { after: 60 },
          }),
          new Paragraph({
            text: "4. Package & Container Match: Verifies 200 Cartons and Container MSCU7829104 across all three shipping documents.",
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "AI Guardrail & Export Lock:", bold: true }),
              new TextRun({ text: " The Customs Filing Export is strictly locked until all low-confidence fields (<85%) are confirmed and cross-check discrepancies are cleared or manager-overridden." }),
            ],
            spacing: { after: 200 },
          }),

          // Section 5: UI & Design Decisions
          new Paragraph({
            text: "5. UI & Design Decisions",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 120 },
          }),
          new Paragraph({
            text: "• Side-by-Side Review Workstation: Document viewer on the left (pan/zoom/highlights) with cross-checks and editable fields on the right. Operators never have to switch tabs.",
            spacing: { after: 60 },
          }),
          new Paragraph({
            text: "• Instant Role Switching: Header switcher enables testing both Documentation Executive and Documentation Manager permissions with zero login friction.",
            spacing: { after: 60 },
          }),
          new Paragraph({
            text: "• 1-Click Document Ingestion: Reviewers can load pre-packaged Nhava Sheva sample documents with 1 click.",
            spacing: { after: 200 },
          }),

          // Section 6: Assumptions
          new Paragraph({
            text: "6. Explicit Assumptions (Per Assessment Guidelines)",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 120 },
          }),
          new Paragraph({
            text: "• [Assumption A1 - Port Environment]: Port of clearance is Nhava Sheva (INNSA1), where unmanifested cargo weight deltas trigger ₹9,000 avg demurrage.",
            spacing: { after: 60 },
          }),
          new Paragraph({
            text: "• [Assumption A2 - Customs Tolerances]: Strict 0 kg weight tolerance is enforced for cartonized cargo in EDI filing.",
            spacing: { after: 60 },
          }),
          new Paragraph({
            text: "• [Assumption A3 - Export Format]: Filing software export layout matches standard Visual Impex / Softlink EDI Bill of Entry format.",
            spacing: { after: 200 },
          }),

          // Section 7: Scope Cut & Roadmap
          new Paragraph({
            text: "7. Scope Cuts & Future Roadmap",
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 200, after: 120 },
          }),
          new Paragraph({
            text: "• What We Cut (Intentional Focus on Core Slice): Live ICEGATE server socket connection, automated duty payment processing, and external WhatsApp gateway integration.",
            spacing: { after: 60 },
          }),
          new Paragraph({
            text: "• Next Steps: Dynamic OCR coordinate bounding-box overlays on PDF canvases, automated Indian customs tariff master integration, and few-shot supplier layout memory.",
            spacing: { after: 200 },
          }),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.resolve("Technical_Design_Document.docx");
  fs.writeFileSync(outPath, buffer);
  console.log("Generated Word TDD at:", outPath);
}

generateDocx().catch((err) => {
  console.error(err);
  process.exit(1);
});
