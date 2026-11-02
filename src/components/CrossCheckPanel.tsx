"use client";

import React, { useState } from "react";
import { CrossCheckRuleResult, UserRole } from "@/types";
import { 
  AlertOctagon, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Lock, 
  Unlock, 
  Check, 
  ShieldAlert,
  HelpCircle,
  FileSpreadsheet
} from "lucide-react";

interface CrossCheckPanelProps {
  crossChecks: CrossCheckRuleResult[];
  userRole: UserRole;
  onResolveCheck: (ruleId: string, resolutionNote: string, correctedValue?: string | number) => void;
  onQuickResolveWeight: (preferredDoc: "packing_list" | "commercial_invoice") => void;
  unconfirmedCount: number;
  onOpenExport: () => void;
}

export const CrossCheckPanel: React.FC<CrossCheckPanelProps> = ({
  crossChecks,
  userRole,
  onResolveCheck,
  onQuickResolveWeight,
  unconfirmedCount,
  onOpenExport,
}) => {
  const [overrideModalRule, setOverrideModalRule] = useState<CrossCheckRuleResult | null>(null);
  const [overrideNote, setOverrideNote] = useState<string>("");

  const errorCount = crossChecks.filter((c) => c.status === "error" && !c.isResolved).length;
  const isExportBlocked = errorCount > 0 || unconfirmedCount > 0;

  const handleConfirmOverride = () => {
    if (!overrideModalRule) return;
    onResolveCheck(
      overrideModalRule.ruleId,
      overrideNote || `Overridden by ${userRole === "documentation_manager" ? "Documentation Manager" : "Executive"}`
    );
    setOverrideModalRule(null);
    setOverrideNote("");
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
      {/* Panel Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              3-Way Document Cross-Check Engine
            </h3>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
              Nhava Sheva Port Rules
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-verifying Commercial Invoice, Packing List, and Bill of Lading
          </p>
        </div>

        {/* Export Gate Status Badge */}
        <div className="flex items-center space-x-2">
          {isExportBlocked ? (
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>Export Locked ({errorCount + (unconfirmedCount > 0 ? 1 : 0)} Blockers)</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <Unlock className="w-3.5 h-3.5" />
              <span>Cross-Checks Cleared</span>
            </div>
          )}

          <button
            onClick={onOpenExport}
            disabled={isExportBlocked}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all shadow-sm ${
              isExportBlocked
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Customs CSV</span>
          </button>
        </div>
      </div>

      {/* Cross-Check List */}
      <div className="p-4 space-y-3 overflow-y-auto flex-1">
        {crossChecks.map((rule) => {
          const isError = rule.status === "error" && !rule.isResolved;
          const isWarning = rule.status === "warning" && !rule.isResolved;
          const isMatch = rule.isResolved || rule.status === "match";

          return (
            <div
              key={rule.ruleId}
              className={`p-3.5 rounded-lg border transition-all text-xs ${
                isError
                  ? "border-rose-200 bg-rose-50/70"
                  : isWarning
                  ? "border-amber-200 bg-amber-50/70"
                  : "border-slate-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2.5">
                  {isError ? (
                    <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  ) : isWarning ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  )}

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{rule.ruleName}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${
                          isError
                            ? "bg-rose-100 text-rose-700 font-bold"
                            : isWarning
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isError ? "MISMATCH DETECTED" : isWarning ? "ATTENTION" : "VERIFIED MATCH"}
                      </span>
                    </div>

                    <p className="text-slate-600 text-[11px] mt-1">{rule.description}</p>
                  </div>
                </div>

                {/* Status action buttons */}
                {isError && (
                  <div className="flex items-center space-x-2">
                    {rule.ruleId === "RULE_WT_INV_PL" && (
                      <button
                        onClick={() => onQuickResolveWeight("packing_list")}
                        className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] transition-colors shadow-sm flex items-center space-x-1"
                        title="Update Invoice Gross Weight to 3,165 kg to match Packing List & B/L"
                      >
                        <Check className="w-3 h-3" />
                        <span>Accept PL Weight (3,165 kg)</span>
                      </button>
                    )}

                    <button
                      onClick={() => setOverrideModalRule(rule)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium text-[11px] transition-colors shadow-sm"
                    >
                      {userRole === "documentation_manager" ? "Manager Sign-Off" : "Resolve Note"}
                    </button>
                  </div>
                )}

                {isMatch && rule.isResolved && rule.resolvedBy && (
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Resolved by {rule.resolvedBy}
                  </span>
                )}
              </div>

              {/* Data comparison pills */}
              <div className="mt-3 grid grid-cols-2 gap-3 pt-2.5 border-t border-slate-200/80 text-[11px]">
                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">
                    {rule.sourceDocA.replace("_", " ")}:
                  </span>
                  <span className={`font-mono font-semibold ${isError ? "text-rose-700" : "text-slate-800"}`}>
                    {rule.valueA}
                  </span>
                </div>

                <div className="bg-white p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 block uppercase font-medium">
                    {rule.sourceDocB.replace("_", " ")}:
                  </span>
                  <span className={`font-mono font-semibold ${isError ? "text-rose-700" : "text-slate-800"}`}>
                    {rule.valueB}
                  </span>
                </div>
              </div>

              {rule.difference && (
                <div className="mt-2 text-[10px] text-rose-700 font-semibold flex items-center space-x-1">
                  <span>Delta:</span>
                  <span className="font-mono bg-rose-100 px-1.5 py-0.5 rounded">{rule.difference}</span>
                  <span className="text-slate-500 font-normal">
                    (Exceeds customs tolerance of {rule.toleranceApplied})
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Override Modal */}
      {overrideModalRule && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full border border-slate-300 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold">Cross-Check Sign-off & Audit</h4>
              </div>
              <button
                onClick={() => setOverrideModalRule(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <p className="text-slate-700">
                You are approving the discrepancy for:{" "}
                <span className="font-bold text-slate-900">{overrideModalRule.ruleName}</span>
              </p>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Resolution Justification (Logged to Audit Trail):
                </label>
                <textarea
                  value={overrideNote}
                  onChange={(e) => setOverrideNote(e.target.value)}
                  placeholder="e.g. Confirmed with shipping line; weight difference is due to pallet packaging tare. Approved for filing."
                  rows={3}
                  className="w-full text-xs p-2.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="bg-amber-50 p-2.5 rounded border border-amber-200 text-amber-800 text-[11px]">
                Note: In accordance with Company A customs compliance at Nhava Sheva, all overrides are permanently logged with your user identity ({userRole}).
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => setOverrideModalRule(null)}
                  className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmOverride}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium shadow-sm"
                >
                  Confirm & Clear Blocker
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
