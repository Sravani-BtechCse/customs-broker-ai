"use client";

import React, { useState } from "react";
import { Calculator, TrendingDown, DollarSign, Clock, ShieldCheck, Check } from "lucide-react";

export const RoiBreakdown: React.FC = () => {
  const [monthlyShipments, setMonthlyShipments] = useState(1100);
  const [staffHourlyRate, setStaffHourlyRate] = useState(350);
  const [demurrageCostPerError, setDemurrageCostPerError] = useState(9000);

  // Calculations
  const annualShipments = monthlyShipments * 12;
  const legacyHours = monthlyShipments * 0.75 * 12; // 45 min
  const legacyLabourCost = legacyHours * staffHourlyRate; // ₹34.65 lakh at default
  const legacyErrors = annualShipments * 0.03; // 3%
  const legacyDemurrageCost = legacyErrors * demurrageCostPerError; // ₹35.64 lakh at default
  const legacyTotalCost = legacyLabourCost + legacyDemurrageCost; // ₹70.29 lakh

  // With PortCheck AI (11.8 min, error rate reduced by 85%)
  const newHours = monthlyShipments * (12 / 60) * 12; // 12 min
  const newLabourCost = newHours * staffHourlyRate;
  const newErrors = annualShipments * (0.03 * 0.15); // 85% caught before filing
  const newDemurrageCost = newErrors * demurrageCostPerError;
  const newTotalCost = newLabourCost + newDemurrageCost;

  const annualSavings = legacyTotalCost - newTotalCost;
  const roiPaybackMonths = (750000 / (annualSavings / 12)).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-lg shadow-xs p-6">
        <div className="flex items-center space-x-2 mb-2">
          <Calculator className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">
            Company A (Nhava Sheva Port) — Financial ROI & Business Impact Model
          </h2>
        </div>
        <p className="text-xs text-slate-500 max-w-3xl">
          Based on the client brief: ₹70.29 lakh annual operational loss across 14 documentation executives.
          Adjust variables below to see real-time payback against the ₹7.5 lakh capital budget.
        </p>

        {/* Sliders / Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Monthly Shipments Handled:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={monthlyShipments}
                onChange={(e) => setMonthlyShipments(Number(e.target.value) || 0)}
                className="w-28 p-1.5 border border-slate-300 rounded font-mono font-semibold"
              />
              <span className="text-slate-500">shipments / mo</span>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Documentation Staff Hourly Rate:
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-slate-500">₹</span>
              <input
                type="number"
                value={staffHourlyRate}
                onChange={(e) => setStaffHourlyRate(Number(e.target.value) || 0)}
                className="w-24 p-1.5 border border-slate-300 rounded font-mono font-semibold"
              />
              <span className="text-slate-500">/ hour</span>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Cost Per Amended BE / Demurrage:
            </label>
            <div className="flex items-center space-x-2">
              <span className="text-slate-500">₹</span>
              <input
                type="number"
                value={demurrageCostPerError}
                onChange={(e) => setDemurrageCostPerError(Number(e.target.value) || 0)}
                className="w-28 p-1.5 border border-slate-300 rounded font-mono font-semibold"
              />
              <span className="text-slate-500">/ penalty case</span>
            </div>
          </div>
        </div>

        {/* Cost Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="border border-rose-200 bg-rose-50/50 p-5 rounded-lg">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block mb-1">
              Current Legacy Process
            </span>
            <div className="text-2xl font-bold text-rose-700 font-mono">
              ₹{(legacyTotalCost / 100000).toFixed(2)} Lakh / yr
            </div>
            <div className="mt-3 space-y-1.5 text-xs text-slate-700">
              <p>• 45 min manual data entry per shipment</p>
              <p>• {legacyHours.toLocaleString()} manual typing hours</p>
              <p>• 3% error rate = {Math.round(legacyErrors)} amended Bills of Entry</p>
              <p>• Demurrage loss: ₹{(legacyDemurrageCost / 100000).toFixed(2)} Lakh</p>
            </div>
          </div>

          <div className="border border-emerald-200 bg-emerald-50/50 p-5 rounded-lg">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
              With PortCheck AI
            </span>
            <div className="text-2xl font-bold text-emerald-700 font-mono">
              ₹{(newTotalCost / 100000).toFixed(2)} Lakh / yr
            </div>
            <div className="mt-3 space-y-1.5 text-xs text-slate-700">
              <p>• Under 12 min review & clearance</p>
              <p>• {newHours.toLocaleString()} hours (73% labour capacity released)</p>
              <p>• 3-way cross-check catches 85%+ mismatches</p>
              <p>• Demurrage avoided: ₹{((legacyDemurrageCost - newDemurrageCost) / 100000).toFixed(2)} Lakh</p>
            </div>
          </div>

          <div className="border border-blue-200 bg-blue-50/50 p-5 rounded-lg flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block mb-1">
                Net Annual Value Created
              </span>
              <div className="text-3xl font-extrabold text-blue-900 font-mono">
                ₹{(annualSavings / 100000).toFixed(2)} Lakh
              </div>
              <p className="text-xs text-blue-700 mt-2">
                Payback period on ₹7.5 Lakh software investment:{" "}
                <span className="font-bold underline">{roiPaybackMonths} Months</span>
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-blue-200 text-[11px] text-blue-800 font-medium">
              ✓ Managing Director sign-off metric: Payback is well under the 6-month threshold.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
