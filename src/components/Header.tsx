"use client";

import React from "react";
import { UserRole } from "@/types";
import { 
  Anchor, 
  ShieldCheck, 
  UserCheck, 
  BarChart3, 
  FileSpreadsheet, 
  RefreshCw, 
  Layers,
  HelpCircle
} from "lucide-react";

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: "shipments" | "analytics" | "roi_calculator";
  onTabChange: (tab: "shipments" | "analytics" | "roi_calculator") => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
  onResetData,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
      {/* Top micro bar for compliance and environment */}
      <div className="bg-slate-950 px-4 py-1 text-xs border-b border-slate-800/80 flex items-center justify-between text-slate-400">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1.5 text-emerald-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium">Nhava Sheva (INNSA) Port EDI Gateway Active</span>
          </span>
          <span className="hidden md:inline text-slate-500">|</span>
          <span className="hidden md:flex items-center space-x-1 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>DPDP Act 2023 Compliant (India Sovereign Data Boundary)</span>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-slate-400 hidden sm:inline">Role:</span>
          <div className="inline-flex rounded-md p-0.5 bg-slate-800 border border-slate-700">
            <button
              onClick={() => onRoleChange("documentation_executive")}
              className={`px-2.5 py-0.5 text-xs rounded font-medium transition-all ${
                currentRole === "documentation_executive"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Doc Executive (Pooja)
            </button>
            <button
              onClick={() => onRoleChange("documentation_manager")}
              className={`px-2.5 py-0.5 text-xs rounded font-medium transition-all ${
                currentRole === "documentation_manager"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              Doc Manager (Kavita)
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <Anchor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">PortCheck AI</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Company A
                </span>
              </div>
              <p className="text-xs text-slate-400">Customs Broker & Document Cross-Check System</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 pl-6">
            <button
              onClick={() => onTabChange("shipments")}
              className={`flex items-center space-x-1.5 px-3 py-2 text-sm rounded-md font-medium transition-colors ${
                activeTab === "shipments"
                  ? "bg-slate-800 text-blue-400 border border-slate-700"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Shipments & Extraction</span>
            </button>

            <button
              onClick={() => onTabChange("analytics")}
              className={`flex items-center space-x-1.5 px-3 py-2 text-sm rounded-md font-medium transition-colors ${
                activeTab === "analytics"
                  ? "bg-slate-800 text-blue-400 border border-slate-700"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Field & Supplier Accuracy</span>
            </button>

            <button
              onClick={() => onTabChange("roi_calculator")}
              className={`flex items-center space-x-1.5 px-3 py-2 text-sm rounded-md font-medium transition-colors ${
                activeTab === "roi_calculator"
                  ? "bg-slate-800 text-blue-400 border border-slate-700"
                  : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>₹70.29L ROI Model</span>
            </button>
          </nav>
        </div>

        {/* Right action bar */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onResetData}
            title="Reset to fresh assessment sample data (including China weight mismatch)"
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2.5 py-1.5 rounded-md transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Demo Data</span>
          </button>
        </div>
      </div>
    </header>
  );
};
