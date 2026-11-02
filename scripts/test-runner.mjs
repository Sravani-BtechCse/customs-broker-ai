import assert from "node:assert/strict";
import test from "node:test";

// Simulate runCrossChecks logic
function runCrossChecks(documents) {
  const results = [];
  const { invoice, packingList, billOfLading } = documents;

  // 1. Math check
  if (invoice?.lineItems && invoice.lineItems.length > 0 && invoice.extractedFields.invoiceTotal) {
    const declaredTotal = invoice.extractedFields.invoiceTotal.value;
    const computedSum = invoice.lineItems.reduce((acc, item) => {
      const lineAmt = item.totalAmount.value || item.quantity.value * item.unitPrice.value;
      return acc + lineAmt;
    }, 0);
    const diff = Math.abs(declaredTotal - computedSum);
    results.push({
      ruleId: "RULE_INV_MATH",
      status: diff < 0.05 ? "match" : "error",
      isResolved: diff < 0.05,
    });
  }

  // 2. Gross weight check (Invoice vs Packing List)
  if (invoice?.extractedFields.grossWeightKg && packingList?.extractedFields.grossWeightKg) {
    const invGross = Number(invoice.extractedFields.grossWeightKg.value);
    const plGross = Number(packingList.extractedFields.grossWeightKg.value);
    const diff = Math.abs(invGross - plGross);
    results.push({
      ruleId: "RULE_WT_INV_PL",
      status: diff === 0 ? "match" : "error",
      isResolved: diff === 0,
      difference: diff,
    });
  }

  return results;
}

function canExportShipment(crossChecks, unconfirmedLowConfidenceCount) {
  const blockingReasons = [];
  const unresolvedErrors = crossChecks.filter((c) => c.status === "error" && !c.isResolved);
  if (unresolvedErrors.length > 0) {
    blockingReasons.push(`${unresolvedErrors.length} critical cross-check error(s) must be resolved.`);
  }
  if (unconfirmedLowConfidenceCount > 0) {
    blockingReasons.push(`${unconfirmedLowConfidenceCount} low-confidence field(s) require verification.`);
  }
  return {
    allowed: blockingReasons.length === 0,
    blockingReasons,
  };
}

test("Discrepancy Engine: Catches 45kg Gross Weight Mismatch in SHP-24811", () => {
  const mockDocuments = {
    invoice: {
      extractedFields: {
        grossWeightKg: { value: 3120, confidence: 0.81 },
        invoiceTotal: { value: 16320.0, confidence: 0.99 },
      },
      lineItems: [
        {
          quantity: { value: 2400 },
          unitPrice: { value: 6.8 },
          totalAmount: { value: 16320.0 },
        },
      ],
    },
    packingList: {
      extractedFields: {
        grossWeightKg: { value: 3165, confidence: 0.99 },
      },
    },
  };

  const results = runCrossChecks(mockDocuments);
  const weightRule = results.find((r) => r.ruleId === "RULE_WT_INV_PL");

  assert.ok(weightRule, "Weight rule must be evaluated");
  assert.equal(weightRule.status, "error", "Weight mismatch must be flagged as error");
  assert.equal(weightRule.difference, 45, "Difference must accurately compute 45 kg");
  assert.equal(weightRule.isResolved, false, "Must not be auto-resolved");

  // Export gate check
  const gateCheck = canExportShipment(results, 1);
  assert.equal(gateCheck.allowed, false, "Export must be blocked when errors exist");
  assert.equal(gateCheck.blockingReasons.length, 2, "Must report both cross-check error and unconfirmed field");
});

test("Export Gatekeeper: Allows Export once Human Resolves Weight & Confirms Field", () => {
  const mockDocuments = {
    invoice: {
      extractedFields: {
        grossWeightKg: { value: 3165, confidence: 0.81 }, // Human updated to 3165 kg
        invoiceTotal: { value: 16320.0, confidence: 0.99 },
      },
      lineItems: [
        {
          quantity: { value: 2400 },
          unitPrice: { value: 6.8 },
          totalAmount: { value: 16320.0 },
        },
      ],
    },
    packingList: {
      extractedFields: {
        grossWeightKg: { value: 3165, confidence: 0.99 },
      },
    },
  };

  const results = runCrossChecks(mockDocuments);
  const weightRule = results.find((r) => r.ruleId === "RULE_WT_INV_PL");

  assert.equal(weightRule.status, "match", "Matching weight must evaluate to match");
  assert.equal(weightRule.isResolved, true, "Matching weight must be resolved");

  // Zero unconfirmed fields
  const gateCheck = canExportShipment(results, 0);
  assert.equal(gateCheck.allowed, true, "Export must be permitted when all rules pass");
  assert.equal(gateCheck.blockingReasons.length, 0);
});

test("Arithmetic Check: Flags Invoice Line Sum Mismatch", () => {
  const mockDocuments = {
    invoice: {
      extractedFields: {
        invoiceTotal: { value: 20000.0, confidence: 0.99 }, // Deliberate mismatch
      },
      lineItems: [
        {
          quantity: { value: 2400 },
          unitPrice: { value: 6.8 },
          totalAmount: { value: 16320.0 },
        },
      ],
    },
  };

  const results = runCrossChecks(mockDocuments);
  const mathRule = results.find((r) => r.ruleId === "RULE_INV_MATH");

  assert.ok(mathRule);
  assert.equal(mathRule.status, "error", "Math discrepancy must trigger error");
});
