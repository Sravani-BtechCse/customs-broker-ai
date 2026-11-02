import { DocumentData, CrossCheckRuleResult } from "@/types";

export function runCrossChecks(documents: {
  invoice?: DocumentData;
  packingList?: DocumentData;
  billOfLading?: DocumentData;
}): CrossCheckRuleResult[] {
  const results: CrossCheckRuleResult[] = [];
  const { invoice, packingList, billOfLading } = documents;

  // 1. Cross-Check: Invoice Total vs Line Item Sum
  if (invoice?.lineItems && invoice.lineItems.length > 0 && invoice.extractedFields.invoiceTotal) {
    const declaredTotal = invoice.extractedFields.invoiceTotal.value;
    const computedSum = invoice.lineItems.reduce((acc, item) => {
      const lineAmt = item.totalAmount.value || item.quantity.value * item.unitPrice.value;
      return acc + lineAmt;
    }, 0);
    const roundedDeclared = Math.round(declaredTotal * 100) / 100;
    const roundedComputed = Math.round(computedSum * 100) / 100;
    const diff = Math.abs(roundedDeclared - roundedComputed);

    const isMatch = diff < 0.05; // 5 cent tolerance
    results.push({
      ruleId: "RULE_INV_MATH",
      ruleName: "Invoice Line Item Sum vs Grand Total",
      description: "Verifies that the arithmetic sum of individual line item amounts equals the declared invoice grand total.",
      status: isMatch ? "match" : "error",
      sourceDocA: "commercial_invoice",
      sourceDocB: "commercial_invoice",
      valueA: `${invoice.extractedFields.currency?.value || "$"} ${roundedDeclared.toLocaleString()}`,
      valueB: `${invoice.extractedFields.currency?.value || "$"} ${roundedComputed.toLocaleString()}`,
      difference: diff > 0 ? `${diff.toFixed(2)}` : undefined,
      toleranceApplied: "±0.05 currency units",
      isResolved: isMatch,
    });
  }

  // 2. Cross-Check: Gross Weight (Invoice vs Packing List)
  if (invoice?.extractedFields.grossWeightKg && packingList?.extractedFields.grossWeightKg) {
    const invGross = Number(invoice.extractedFields.grossWeightKg.value);
    const plGross = Number(packingList.extractedFields.grossWeightKg.value);
    const diff = Math.abs(invGross - plGross);
    const isMatch = diff === 0;

    results.push({
      ruleId: "RULE_WT_INV_PL",
      ruleName: "Gross Weight: Invoice vs Packing List",
      description: "Mismatches in cargo gross weight between Invoice and Packing List trigger customs physical inspection at Nhava Sheva.",
      status: isMatch ? "match" : "error",
      sourceDocA: "commercial_invoice",
      sourceDocB: "packing_list",
      valueA: `${invGross.toLocaleString()} kg`,
      valueB: `${plGross.toLocaleString()} kg`,
      difference: diff > 0 ? `${diff.toLocaleString()} kg difference` : undefined,
      toleranceApplied: "0 kg (strict customs tolerance)",
      isResolved: isMatch,
    });
  }

  // 3. Cross-Check: Gross Weight (Packing List vs Bill of Lading)
  if (packingList?.extractedFields.grossWeightKg && billOfLading?.extractedFields.grossWeightKg) {
    const plGross = Number(packingList.extractedFields.grossWeightKg.value);
    const blGross = Number(billOfLading.extractedFields.grossWeightKg.value);
    const diff = Math.abs(plGross - blGross);
    const isMatch = diff === 0;

    results.push({
      ruleId: "RULE_WT_PL_BL",
      ruleName: "Gross Weight: Packing List vs Bill of Lading",
      description: "Shipping Line IGM filing is generated from Bill of Lading. Discrepancy against Packing List causes IGM amendment penalty.",
      status: isMatch ? "match" : "error",
      sourceDocA: "packing_list",
      sourceDocB: "bill_of_lading",
      valueA: `${plGross.toLocaleString()} kg`,
      valueB: `${blGross.toLocaleString()} kg`,
      difference: diff > 0 ? `${diff.toLocaleString()} kg difference` : undefined,
      toleranceApplied: "0 kg",
      isResolved: isMatch,
    });
  }

  // 4. Cross-Check: Total Packages (Packing List vs Bill of Lading)
  if (packingList?.extractedFields.totalPackages && billOfLading?.extractedFields.totalPackages) {
    const plPackages = Number(packingList.extractedFields.totalPackages.value);
    const blPackages = Number(billOfLading.extractedFields.totalPackages.value);
    const diff = Math.abs(plPackages - blPackages);
    const isMatch = diff === 0;

    results.push({
      ruleId: "RULE_PKG_PL_BL",
      ruleName: "Package Count: Packing List vs Bill of Lading",
      description: "Package count declared on Bill of Entry must match the ocean manifest package count.",
      status: isMatch ? "match" : "error",
      sourceDocA: "packing_list",
      sourceDocB: "bill_of_lading",
      valueA: `${plPackages} ${packingList.extractedFields.packageType?.value || "Packages"}`,
      valueB: `${blPackages} ${billOfLading.extractedFields.packageType?.value || "Packages"}`,
      difference: diff > 0 ? `${diff} packages mismatch` : undefined,
      toleranceApplied: "0 packages",
      isResolved: isMatch,
    });
  }

  // 5. Cross-Check: Container Number (Packing List vs Bill of Lading)
  if (packingList?.extractedFields.containerNumber && billOfLading?.extractedFields.containerNumber) {
    const plContainer = (packingList.extractedFields.containerNumber.value || "").trim().toUpperCase();
    const blContainer = (billOfLading.extractedFields.containerNumber.value || "").trim().toUpperCase();
    const isMatch = plContainer === blContainer && plContainer.length > 0;

    results.push({
      ruleId: "RULE_CONTAINER_MATCH",
      ruleName: "Container Identifier Consistency",
      description: "Matches 11-character ISO 6346 container identification between documentation and shipping line master manifest.",
      status: isMatch ? "match" : "warning",
      sourceDocA: "packing_list",
      sourceDocB: "bill_of_lading",
      valueA: plContainer || "Not specified",
      valueB: blContainer || "Not specified",
      isResolved: isMatch,
    });
  }

  // 6. Cross-Check: Importer / Consignee Name (Invoice vs Bill of Lading)
  if (invoice?.extractedFields.importerName && billOfLading?.extractedFields.importerName) {
    const invImporter = (invoice.extractedFields.importerName.value || "").toLowerCase().trim();
    const blImporter = (billOfLading.extractedFields.importerName.value || "").toLowerCase().trim();
    
    // Simple similarity check
    const isMatch = invImporter.includes(blImporter.slice(0, 10)) || blImporter.includes(invImporter.slice(0, 10));

    results.push({
      ruleId: "RULE_IMPORTER_IDENTITY",
      ruleName: "Consignee / Importer Entity Verification",
      description: "Verifies the buyer entity on invoice matches the consignee entity on the ocean manifest for DPDP Act & customs KYC.",
      status: isMatch ? "match" : "warning",
      sourceDocA: "commercial_invoice",
      sourceDocB: "bill_of_lading",
      valueA: invoice.extractedFields.importerName.value,
      valueB: billOfLading.extractedFields.importerName.value,
      isResolved: isMatch,
    });
  }

  return results;
}

export function canExportShipment(
  crossChecks: CrossCheckRuleResult[],
  unconfirmedLowConfidenceCount: number
): { allowed: boolean; blockingReasons: string[] } {
  const blockingReasons: string[] = [];

  const unresolvedErrors = crossChecks.filter((c) => c.status === "error" && !c.isResolved);
  if (unresolvedErrors.length > 0) {
    blockingReasons.push(
      `${unresolvedErrors.length} critical cross-check error(s) must be resolved or manager-overridden.`
    );
  }

  if (unconfirmedLowConfidenceCount > 0) {
    blockingReasons.push(
      `${unconfirmedLowConfidenceCount} low-confidence AI extraction field(s) require human verification.`
    );
  }

  return {
    allowed: blockingReasons.length === 0,
    blockingReasons,
  };
}
