import { Shipment } from "@/types";

export function generateCustomsFilingCSV(shipment: Shipment): string {
  const inv = shipment.documents.invoice?.extractedFields;
  const pl = shipment.documents.packingList?.extractedFields;
  const bl = shipment.documents.billOfLading?.extractedFields;
  const items = shipment.documents.invoice?.lineItems || [];

  const headers = [
    "JOB_NO",
    "BE_TYPE",
    "CUSTOM_STATION_CODE",
    "IMPORTER_NAME",
    "SUPPLIER_NAME",
    "SUPPLIER_COUNTRY",
    "INVOICE_NO",
    "INVOICE_DATE",
    "INCOTERM",
    "CURRENCY",
    "INVOICE_TOTAL",
    "BL_NO",
    "BL_DATE",
    "CONTAINER_NO",
    "TOTAL_PACKAGES",
    "PACKAGE_TYPE",
    "GROSS_WEIGHT_KG",
    "ITEM_SNO",
    "ITEM_DESCRIPTION",
    "HSN_CODE",
    "QTY",
    "UNIT_OF_MEASURE",
    "UNIT_PRICE",
    "LINE_TOTAL",
  ];

  const rows: string[][] = [];

  const jobNo = shipment.id;
  const beType = "HOME_CONSUMPTION";
  const customStation = "INNSA1 (Nhava Sheva Sea Port)";
  const importerName = inv?.importerName?.value || pl?.importerName?.value || shipment.consigneeName;
  const supplierName = inv?.exporterName?.value || shipment.supplierName;
  const supplierCountry = shipment.supplierCountry;
  const invNo = inv?.documentNumber?.value || "N/A";
  const invDate = inv?.documentDate?.value || "N/A";
  const incoterm = inv?.incoterm?.value || "CIF";
  const currency = inv?.currency?.value || "USD";
  const invTotal = inv?.invoiceTotal?.value?.toString() || "0";
  const blNo = bl?.documentNumber?.value || "N/A";
  const blDate = bl?.documentDate?.value || "N/A";
  const containerNo = bl?.containerNumber?.value || pl?.containerNumber?.value || "N/A";
  const totalPackages = (pl?.totalPackages?.value || bl?.totalPackages?.value || inv?.totalPackages?.value || 0).toString();
  const packageType = pl?.packageType?.value || bl?.packageType?.value || "Cartons";
  // The gross weight resolved
  const grossWeight = (pl?.grossWeightKg?.value || bl?.grossWeightKg?.value || inv?.grossWeightKg?.value || 0).toString();

  if (items.length === 0) {
    rows.push([
      jobNo,
      beType,
      customStation,
      `"${importerName}"`,
      `"${supplierName}"`,
      supplierCountry,
      invNo,
      invDate,
      incoterm,
      currency,
      invTotal,
      blNo,
      blDate,
      containerNo,
      totalPackages,
      packageType,
      grossWeight,
      "1",
      `"General Consignment"`,
      "99999999",
      "1",
      "NOS",
      invTotal,
      invTotal,
    ]);
  } else {
    items.forEach((item, index) => {
      rows.push([
        jobNo,
        beType,
        customStation,
        `"${importerName}"`,
        `"${supplierName}"`,
        supplierCountry,
        invNo,
        invDate,
        incoterm,
        currency,
        invTotal,
        blNo,
        blDate,
        containerNo,
        totalPackages,
        packageType,
        grossWeight,
        (index + 1).toString(),
        `"${item.itemDescription.value.replace(/"/g, '""')}"`,
        item.hsnCode.value,
        item.quantity.value.toString(),
        item.unit.value,
        item.unitPrice.value.toString(),
        item.totalAmount.value.toString(),
      ]);
    });
  }

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  return csvContent;
}

export function downloadCustomsCSV(shipment: Shipment): void {
  const csvData = generateCustomsFilingCSV(shipment);
  const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `ICEGATE_BOE_${shipment.id}_INNSA.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
