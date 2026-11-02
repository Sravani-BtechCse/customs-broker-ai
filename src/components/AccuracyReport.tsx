"use client";

import React from "react";
import { AccuracyMetric, SupplierAccuracyMetric } from "@/types";
import { 
  BarChart3, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  FileCheck,
  Building,
  Target
} from "lucide-react";

interface AccuracyReportProps {
  fieldMetrics: AccuracyMetric[];
  supplierMetrics: SupplierAccuracyMetric[];
}

export const AccuracyReport: React.FC<AccuracyReportProps> = ({
  fieldMetrics,
  supplierMetrics,
}) => {
  const overallAccuracy = (
    fieldMetrics.reduce((acc, curr) => acc + curr.accuracyRate, 0) / fieldMetrics.length
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Target Metric Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-6 rounded-lg text-white shadow-md border border-blue-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold">Client Target Verification (Company A, Navi Mumbai)</h2>
            </div>
            <p className="text-xs text-blue-200 mt-1 max-w-2xl">
              Target benchmark: &gt;95.0% field accuracy across 200 shipments. Current operational aggregate is{" "}
              <span className="font-bold text-emerald-400">{overallAccuracy}%</span>. Model drift and supplier-specific formatting are tracked continuously.
            </p>
          </div>

          <div className="flex items-center space-x-4 bg-slate-800/80 p-3 rounded-lg border border-slate-700">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Aggregate Accuracy</span>
              <span className="text-2xl font-bold text-emerald-400 font-mono">{overallAccuracy}%</span>
            </div>
            <div className="h-8 w-px bg-slate-700"></div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">SLA Status</span>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                Target Exceeded
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Field-Level Accuracy Breakdown */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900">Field-Level OCR & Extraction Accuracy</h3>
            </div>
            <span className="text-xs text-slate-500">Based on 1,470 fields</span>
          </div>

          <div className="space-y-4">
            {fieldMetrics.map((item) => {
              const isBelowTarget = item.accuracyRate < 95.0;

              return (
                <div key={item.fieldKey} className="text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-700">{item.fieldLabel}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500 text-[11px]">
                        {item.humanCorrections} corrections / {item.totalExtractions}
                      </span>
                      <span
                        className={`font-mono font-bold ${
                          isBelowTarget ? "text-amber-600" : "text-emerald-600"
                        }`}
                      >
                        {item.accuracyRate}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isBelowTarget ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${item.accuracyRate}%` }}
                    ></div>
                  </div>

                  {isBelowTarget && (
                    <p className="text-[10px] text-amber-700 mt-0.5">
                      ⚠ High human correction frequency. Recommend custom prompt rules for gross vs tare weights.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Supplier-Specific Quality & Drift */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Building className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-sm text-slate-900">Supplier Document Quality & Error Profiling</h3>
            </div>
            <span className="text-xs text-slate-500">4 overseas partners</span>
          </div>

          <div className="space-y-3">
            {supplierMetrics.map((sup) => (
              <div
                key={sup.supplierName}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/60 text-xs"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="font-bold text-slate-900">{sup.supplierName}</span>
                    <span className="text-slate-500 text-[11px] ml-2 font-medium">({sup.country})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {sup.shipmentCount} shipments
                    </span>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                        sup.accuracyRate >= 95
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {sup.accuracyRate}%
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-700">Observed friction points: </span>
                  {sup.commonErrors.join(" • ")}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 text-xs">
            <span className="font-bold block mb-0.5">Customs Broker Operational Insight:</span>
            Suppliers in China have high rate of weight discrepancies between Commercial Invoice and Packing List. The 3-way cross-check engine automatically intercepts these before customs assessment at Nhava Sheva.
          </div>
        </div>
      </div>
    </div>
  );
};
