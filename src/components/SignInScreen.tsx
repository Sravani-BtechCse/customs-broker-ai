"use client";

import React, { useState } from "react";
import { UserRole } from "@/types";
import { 
  Anchor, 
  ShieldCheck, 
  ArrowRight, 
  UserCheck, 
  Lock, 
  FileCheck2, 
  Sparkles,
  Building2,
  CheckCircle2
} from "lucide-react";

interface SignInScreenProps {
  onSignIn: (role: UserRole, userName: string) => void;
}

export const SignInScreen: React.FC<SignInScreenProps> = ({ onSignIn }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>("documentation_executive");
  const [email, setEmail] = useState("pooja.sharma@companya-logistics.in");

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    if (role === "documentation_executive") {
      setEmail("pooja.sharma@companya-logistics.in");
    } else {
      setEmail("kavita.rao@companya-logistics.in");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name =
      selectedRole === "documentation_executive"
        ? "Pooja Sharma (Doc Exec)"
        : "Kavita Rao (Doc Manager)";
    onSignIn(selectedRole, name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        {/* App Logo */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 shadow-xl shadow-indigo-500/25 mb-4 text-white">
          <Anchor className="w-7 h-7" />
        </div>
        
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          PortCheck AI
        </h1>
        <p className="text-xs text-indigo-300 font-medium mt-1">
          Company A • Nhava Sheva (INNSA) Port Customs Document Gateway
        </p>

        <div className="mt-2 inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>DPDP Act 2023 Compliant • Indian Sovereign Data Boundary</span>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
              Select Demo Role to Continue
            </h2>
            <p className="text-xs text-slate-400">
              Evaluator Quick-Access: choose a role to inspect executive or manager capabilities.
            </p>
          </div>

          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {/* Executive Option */}
            <div
              onClick={() => handleRoleSelect("documentation_executive")}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedRole === "documentation_executive"
                  ? "border-indigo-500 bg-indigo-950/40 shadow-lg shadow-indigo-500/10"
                  : "border-slate-800 bg-slate-950/50 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">Doc Executive</span>
                {selectedRole === "documentation_executive" && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                )}
              </div>
              <p className="text-xs font-semibold text-indigo-200">Pooja Sharma</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Ingest 3 documents, inspect OCR confidence, inline edit fields, confirm values.
              </p>
            </div>

            {/* Manager Option */}
            <div
              onClick={() => handleRoleSelect("documentation_manager")}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedRole === "documentation_manager"
                  ? "border-purple-500 bg-purple-950/40 shadow-lg shadow-purple-500/10"
                  : "border-slate-800 bg-slate-950/50 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white">Doc Manager</span>
                {selectedRole === "documentation_manager" && (
                  <CheckCircle2 className="w-4 h-4 text-purple-400" />
                )}
              </div>
              <p className="text-xs font-semibold text-purple-200">Kavita Rao</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Review cross-check errors, grant manager sign-off overrides, view supplier accuracy.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Authorized Enterprise Email:
              </label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Customs Agent Credentials:
              </label>
              <div className="relative">
                <input
                  type="password"
                  value="••••••••••••"
                  readOnly
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 focus:outline-hidden"
                />
                <Lock className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 mt-2"
            >
              <span>Enter Nhava Sheva Customs Workstation</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span>Assessment Evaluation Sandbox</span>
            <span className="font-mono text-slate-400">Build v2.4 • Client Company A</span>
          </div>
        </div>
      </div>
    </div>
  );
};
