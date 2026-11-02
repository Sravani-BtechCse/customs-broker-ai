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
  HelpCircle,
  LogOut,
  User
} from "lucide-react";

interface HeaderProps {
  currentRole: UserRole;
  currentUserName: string;
  onRoleChange: (role: UserRole) => void;
  activeTab: "shipments" | "analytics" | "roi_calculator";
  onTabChange: (tab: "shipments" | "analytics" | "roi_calculator") => void;
  onResetData: () => void;
  onSignOut: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  currentUserName,
  onRoleChange,
  activeTab,
  onTabChange,
  onResetData,
  onSignOut,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-lg">
      {/* Top micro bar for compliance and environment */}
      <div className="bg-slate-950 px-4 py-1.5 text-xs border-b border-slate-800/80 flex items-center justify-between text-slate-400">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1.5 text-emerald-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold tracking-wide text-[11px]">Nhava Sheva (INNSA) Port Gateway</span>
          </span>
          <span className="text-slate-600 hidden md:inline">•</span>
          <span className="hidden md:flex items-center space-x-1 text-slate-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>DPDP Act 2023 Compliant • Indian Sovereign Data Boundary</span>
          </span>
        </div>

        {/* User Badge & Switcher */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-[11px]">
            <span className="text-slate-400 hidden sm:inline">Active User:</span>
            <div className="inline-flex rounded-lg p-0.5 bg-slate-800/90 border border-slate-700">
              <button
                onClick={() => onRoleChange("documentation_executive")}
                className={`px-2.5 py-1 text-[11px] rounded-md font-medium transition-all ${
                  currentRole === "documentation_executive"
                    ? "bg-indigo-600 text-white shadow-xs font-semibold"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Pooja (Exec)
              </button>
              <button
                onClick={() => onRoleChange("documentation_manager")}
                className={`px-2.5 py-1 text-[11px] rounded-md font-medium transition-all ${
                  currentRole === "documentation_manager"
                    ? "bg-purple-600 text-white shadow-xs font-semibold"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Kavita (Mgr)
              </button>
            </div>
          </div>

          <button
            onClick={onSignOut}
            title="Sign out of customs workstation"
            className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors pl-2 border-l border-slate-800"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white">
              <Anchor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight text-white">PortCheck AI</span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Company A
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Customs Broker & Document Cross-Check System</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1.5 pl-4">
            <button
              onClick={() => onTabChange("shipments")}
              className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs rounded-lg font-medium transition-all ${
                activeTab === "shipments"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Shipments & Extraction</span>
            </button>

            <button
              onClick={() => onTabChange("analytics")}
              className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs rounded-lg font-medium transition-all ${
                activeTab === "analytics"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Field & Supplier Accuracy</span>
            </button>

            <button
              onClick={() => onTabChange("roi_calculator")}
              className={`flex items-center space-x-1.5 px-3.5 py-2 text-xs rounded-lg font-medium transition-all ${
                activeTab === "roi_calculator"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>₹70.29L Financial Model</span>
            </button>
          </nav>
        </div>

        {/* Right action bar */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onResetData}
            title="Reset to fresh assessment sample data (including China weight mismatch)"
            className="flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 border border-slate-700 px-3 py-1.5 rounded-lg transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline font-medium">Reset Demo Data</span>
          </button>
        </div>
      </div>
    </header>
  );
};
