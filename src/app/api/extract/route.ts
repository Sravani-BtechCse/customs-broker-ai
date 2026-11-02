import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { documentType, fileName, textContent } = body;

    // Simulate AI processing delay (realistic for vision model)
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Provide realistic extracted data based on document type
    if (documentType === "commercial_invoice") {
      return NextResponse.json({
        success: true,
        data: {
          exporterName: { value: "Company B (Shenzhen Bright Lighting Co.)", confidence: 0.98 },
          exporterAddress: { value: "Building 4, Hi-Tech Industrial Park, Bao'an, Shenzhen, China", confidence: 0.93 },
          importerName: { value: "BrightLite Electricals India Pvt Ltd", confidence: 0.99 },
          importerAddress: { value: "Plot 18, TTC Industrial Area, Turbhe, Navi Mumbai 400705", confidence: 0.95 },
          documentNumber: { value: "B2026-8819", confidence: 0.99 },
          documentDate: { value: "2026-10-24", confidence: 0.97 },
          incoterm: { value: "CIF", confidence: 0.94 },
          currency: { value: "USD", confidence: 0.99 },
          portOfLoading: { value: "Shenzhen Port (CNSZX)", confidence: 0.95 },
          portOfDischarge: { value: "Nhava Sheva (INNSA)", confidence: 0.99 },
          grossWeightKg: { value: 3120, confidence: 0.81, notes: "Low confidence: slight scan smudge on last digit" },
          totalPackages: { value: 200, confidence: 0.97 },
          packageType: { value: "Cartons", confidence: 0.96 },
          invoiceTotal: { value: 16320.0, confidence: 0.99 },
          lineItems: [
            {
              itemDescription: { value: "LED panel light 40W 600x600 Cool White", confidence: 0.97 },
              hsnCode: { value: "94054090", confidence: 0.74, notes: "Low confidence: check tariff heading (94054090 vs 94051090)" },
              quantity: { value: 2400, confidence: 0.99 },
              unit: { value: "PCS", confidence: 0.98 },
              unitPrice: { value: 6.8, confidence: 0.98 },
              totalAmount: { value: 16320.0, confidence: 0.99 },
            },
          ],
        },
      });
    }

    if (documentType === "packing_list") {
      return NextResponse.json({
        success: true,
        data: {
          exporterName: { value: "Company B (Shenzhen Bright Lighting Co.)", confidence: 0.98 },
          importerName: { value: "BrightLite Electricals India Pvt Ltd", confidence: 0.99 },
          documentNumber: { value: "PL-B2026-8819", confidence: 0.98 },
          documentDate: { value: "2026-10-24", confidence: 0.96 },
          containerNumber: { value: "MSCU7829104", confidence: 0.97 },
          sealNumber: { value: "SL882901", confidence: 0.95 },
          totalPackages: { value: 200, confidence: 0.99 },
          packageType: { value: "Cartons", confidence: 0.98 },
          grossWeightKg: { value: 3165, confidence: 0.99 },
          netWeightKg: { value: 2880, confidence: 0.98 },
          volumeCbm: { value: 14.8, confidence: 0.94 },
        },
      });
    }

    if (documentType === "bill_of_lading") {
      return NextResponse.json({
        success: true,
        data: {
          exporterName: { value: "Company B (Shenzhen Bright Lighting Co.)", confidence: 0.97 },
          importerName: { value: "BrightLite Electricals India Pvt Ltd", confidence: 0.98 },
          documentNumber: { value: "MEDUIN782910", confidence: 0.99 },
          documentDate: { value: "2026-10-26", confidence: 0.96 },
          vesselName: { value: "MSC LAUREN", confidence: 0.96 },
          voyageNumber: { value: "V-2640W", confidence: 0.96 },
          portOfLoading: { value: "Shenzhen Port (CNSZX)", confidence: 0.97 },
          portOfDischarge: { value: "Nhava Sheva (INNSA)", confidence: 0.99 },
          containerNumber: { value: "MSCU7829104", confidence: 0.99 },
          totalPackages: { value: 200, confidence: 0.98 },
          packageType: { value: "Cartons", confidence: 0.97 },
          grossWeightKg: { value: 3165, confidence: 0.99 },
        },
      });
    }

    return NextResponse.json({ error: "Unknown document type" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to extract fields" }, { status: 500 });
  }
}
