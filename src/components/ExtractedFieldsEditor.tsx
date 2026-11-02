"use client";

import React, { useState } from "react";
import { DocumentData, ExtractedField, UserRole } from "@/types";
import { 
  Check, 
  Edit2, 
  AlertCircle, 
  CheckCircle, 
  Eye, 
  HelpCircle,
  FileQuestion,
  History,
  Sparkles
} from "lucide-react";

interface ExtractedFieldsEditorProps {
  documentData?: DocumentData;
  userRole: UserRole;
  onUpdateField: (fieldKey: string, newValue: string | number, reason?: string) => void;
  onConfirmField: (fieldKey: string) => void;
  onFlagUnreadable: (fieldKey: string) => void;
  onHighlightField: (fieldKey: string | null) => void;
  onOpenAuditHistory: () => void;
}

export const ExtractedFieldsEditor: React.FC<ExtractedFieldsEditorProps> = ({
  documentData,
  userRole,
  onUpdateField,
  onConfirmField,
  onFlagUnreadable,
  onHighlightField,
  onOpenAuditHistory,
}) => {
  const [editingFieldKey, setEditingFieldKey] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>("");
  const [editReason, setEditReason] = useState<string>("");

  if (!documentData) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>No document selected for field inspection.</p>
      </div>
    );
  }

  const fields = documentData.extractedFields;
  const lineItems = documentData.lineItems || [];

  // Count unconfirmed low-confidence fields
  let lowConfidenceUnconfirmed = 0;
  Object.values(fields).forEach((f) => {
    if (f && f.confidence < 0.85 && !f.isConfirmed) {
      lowConfidenceUnconfirmed++;
    }
  });

  lineItems.forEach((item) => {
    Object.values(item).forEach((f) => {
      if (typeof f === "object" && "confidence" in f && (f as ExtractedField).confidence < 0.85 && !(f as ExtractedField).isConfirmed) {
        lowConfidenceUnconfirmed++;
      }
    });
  });

  const startEdit = (key: string, currentVal: string | number) => {
    setEditingFieldKey(key);
    setTempValue(String(currentVal));
    setEditReason("");
  };

  const saveEdit = (key: string) => {
    const isNum = !isNaN(Number(tempValue)) && tempValue.trim() !== "";
    const parsed = isNum ? Number(tempValue) : tempValue;
    onUpdateField(key, parsed, editReason || "Human operator correction");
    setEditingFieldKey(null);
  };

  const cancelEdit = () => {
    setEditingFieldKey(null);
    setTempValue("");
  };

  const renderFieldRow = (fieldKey: string, field?: ExtractedField<any>) => {
    if (!field) return null;

    const isEditing = editingFieldKey === fieldKey;
    const isLowConfidence = field.confidence < 0.85;
    const needsReview = isLowConfidence && !field.isConfirmed;

    const getConfidenceBadge = (confidence: number) => {
      const pct = Math.round(confidence * 100);
      if (confidence >= 0.9) {
        return (
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            {pct}% AI
          </span>
        );
      }
      if (confidence >= 0.85) {
        return (
          <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
            {pct}% AI
          </span>
        );
      }
      return (
        <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 flex items-center space-x-1">
          <AlertCircle className="w-2.5 h-2.5 inline" />
          <span>{pct}% AI (Low)</span>
        </span>
      );
    };

    return (
      <div
        key={fieldKey}
        onMouseEnter={() => onHighlightField(fieldKey)}
        onMouseLeave={() => onHighlightField(null)}
        className={`p-3 rounded-lg border transition-all text-xs ${
          needsReview
            ? "border-amber-300 bg-amber-50/50 shadow-xs"
            : field.isEdited
            ? "border-blue-200 bg-blue-50/30"
            : "border-slate-200 bg-white hover:border-slate-300"
        }`}
      >
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-slate-700">{field.label}</span>
            {field.isEdited && (
              <span className="text-[9px] font-semibold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">
                Edited
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {getConfidenceBadge(field.confidence)}
            {field.isConfirmed && !needsReview && (
              <span className="text-[10px] font-medium text-emerald-600 flex items-center space-x-0.5">
                <CheckCircle className="w-3 h-3" />
                <span>Confirmed</span>
              </span>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="space-y-2 mt-2 pt-2 border-t border-slate-200">
            <div>
              <label className="text-[10px] text-slate-500 block mb-0.5">Edit Value:</label>
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-full text-xs p-1.5 border border-slate-300 rounded font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
                autoFocus
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-0.5">Audit Note / Reason:</label>
              <input
                type="text"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="e.g. Corrected from B/L page 1"
                className="w-full text-xs p-1.5 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
              />
            </div>

            <div className="flex justify-end space-x-1.5 pt-1">
              <button
                onClick={cancelEdit}
                className="px-2.5 py-1 text-[11px] text-slate-600 border border-slate-300 rounded hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={() => saveEdit(fieldKey)}
                className="px-2.5 py-1 text-[11px] bg-blue-600 hover:bg-blue-500 text-white rounded font-medium shadow-xs"
              >
                Save Correction
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-1">
            <div className="font-mono text-slate-900 font-semibold truncate pr-2">
              {String(field.value)}
            </div>

            <div className="flex items-center space-x-1.5 shrink-0">
              {needsReview && (
                <button
                  onClick={() => onConfirmField(fieldKey)}
                  className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] transition-colors shadow-xs flex items-center space-x-1"
                  title="Accept AI extracted value"
                >
                  <Check className="w-3 h-3" />
                  <span>Confirm</span>
                </button>
              )}

              <button
                onClick={() => startEdit(fieldKey, field.value)}
                className="p-1 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded transition-colors"
                title="Edit field manually"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onFlagUnreadable(fieldKey)}
                className="p-1 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded transition-colors"
                title="Flag as unreadable scan"
              >
                <FileQuestion className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {field.notes && (
          <p className="text-[10px] text-amber-800 bg-amber-100/70 p-1.5 rounded mt-2 border border-amber-200">
            {field.notes}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
      {/* Editor Header */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              AI Field Extraction & Verification
            </h3>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {documentData.type.replace("_", " ")}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Hover over fields to inspect in source document. Confirm low-confidence values.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {lowConfidenceUnconfirmed > 0 ? (
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md animate-pulse">
              ⚠ {lowConfidenceUnconfirmed} Field(s) Need Human Confirmation
            </span>
          ) : (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
              ✓ All Fields Confirmed
            </span>
          )}

          <button
            onClick={onOpenAuditHistory}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
            title="View Edit History & Audit Log"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Fields List */}
      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        {/* Core Logistics & Weight */}
        <div>
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Cargo Weights & Packages
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {renderFieldRow("grossWeightKg", fields.grossWeightKg)}
            {renderFieldRow("netWeightKg", fields.netWeightKg)}
            {renderFieldRow("totalPackages", fields.totalPackages)}
            {renderFieldRow("packageType", fields.packageType)}
          </div>
        </div>

        {/* Commercial & Parties */}
        <div>
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Commercial & Customs Metadata
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {renderFieldRow("documentNumber", fields.documentNumber)}
            {renderFieldRow("documentDate", fields.documentDate)}
            {renderFieldRow("exporterName", fields.exporterName)}
            {renderFieldRow("importerName", fields.importerName)}
            {renderFieldRow("incoterm", fields.incoterm)}
            {renderFieldRow("currency", fields.currency)}
            {renderFieldRow("containerNumber", fields.containerNumber)}
            {renderFieldRow("invoiceTotal", fields.invoiceTotal)}
          </div>
        </div>

        {/* Line Items (Invoice) */}
        {lineItems.length > 0 && (
          <div>
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Invoice Line Items & HSN Classification
            </h4>
            <div className="space-y-3">
              {lineItems.map((item, idx) => (
                <div key={item.id} className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
                  <div className="font-semibold text-slate-800 mb-2">
                    Line Item #{idx + 1}: {item.itemDescription.value}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {renderFieldRow(`item_${idx}_hsn`, item.hsnCode)}
                    {renderFieldRow(`item_${idx}_qty`, item.quantity)}
                    {renderFieldRow(`item_${idx}_price`, item.unitPrice)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
