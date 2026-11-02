"use client";

import React from "react";
import { AuditLogEntry, UserRole } from "@/types";
import { History, ShieldCheck, UserCheck, Bot, FileText, ArrowRight } from "lucide-react";

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipmentId: string;
  auditLogs: AuditLogEntry[];
}

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({
  isOpen,
  onClose,
  shipmentId,
  auditLogs,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-300 overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-sm font-bold">Audit Trail & Edit History</h3>
              <p className="text-[11px] text-slate-400">
                Shipment {shipmentId} • DPDP Act 2023 Tamper-Evident Activity Log
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
          {auditLogs.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              <p>No audit activity recorded yet.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 ml-3 space-y-4 pl-4">
              {auditLogs.map((log) => {
                const isAi = log.userName.includes("AI");

                return (
                  <div key={log.id} className="relative group">
                    {/* Circle Node */}
                    <div
                      className={`absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full border-2 bg-white ${
                        isAi
                          ? "border-blue-500 bg-blue-100"
                          : log.action === "cross_check_override"
                          ? "border-purple-500 bg-purple-100"
                          : "border-emerald-500 bg-emerald-100"
                      }`}
                    ></div>

                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-1.5 font-semibold text-slate-800">
                          {isAi ? <Bot className="w-3.5 h-3.5 text-blue-600" /> : <UserCheck className="w-3.5 h-3.5 text-purple-600" />}
                          <span>{log.userName}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({log.userRole.replace("_", " ")})
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>

                      {log.fieldLabel && (
                        <div className="mt-1 text-slate-700">
                          <span className="font-semibold text-slate-900">{log.fieldLabel}: </span>
                          {log.oldValue !== undefined && (
                            <span className="line-through text-slate-400 font-mono mr-1">
                              {String(log.oldValue)}
                            </span>
                          )}
                          {log.newValue !== undefined && (
                            <span className="text-blue-700 font-semibold font-mono">
                              &rarr; {String(log.newValue)}
                            </span>
                          )}
                        </div>
                      )}

                      {log.notes && (
                        <p className="mt-1 text-[11px] text-slate-600 bg-white p-1.5 rounded border border-slate-200">
                          {log.notes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-medium"
          >
            Close History
          </button>
        </div>
      </div>
    </div>
  );
};
