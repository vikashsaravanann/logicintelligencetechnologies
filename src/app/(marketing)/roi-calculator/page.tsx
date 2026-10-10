"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calculator,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  DollarSign,
  PhoneCall,
  Server,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";
import BackButton from "@/components/navigation/back-button";
import CTASection from "@/components/ui/cta-section";

type CalculatorMode = "voice-agents" | "voice-shield" | "cloud-engineering";
type Currency = "USD" | "INR";

export default function ROICalculatorPage() {
  const [mode, setMode] = useState<CalculatorMode>("voice-agents");
  const [currency, setCurrency] = useState<Currency>("USD");

  // Mode 1: Voice Agents State
  const [callVolume, setCallVolume] = useState<number>(25000);
  const [costPerCallUSD, setCostPerCallUSD] = useState<number>(4.5);
  const [containmentRate, setContainmentRate] = useState<number>(68);

  // Mode 2: Voice Shield State
  const [shieldCallVolume, setShieldCallVolume] = useState<number>(75000);
  const [fraudRatePercent, setFraudRatePercent] = useState<number>(0.4);
  const [lossPerIncidentUSD, setLossPerIncidentUSD] = useState<number>(3500);

  // Mode 3: Cloud Engineering State
  const [cloudSpendUSD, setCloudSpendUSD] = useState<number>(25000);
  const [teamSize, setTeamSize] = useState<number>(18);
  const [optimizationPercent, setOptimizationPercent] = useState<number>(34);

  // Conversion rate: 1 USD ≈ 83.5 INR
  const FX = 83.5;

  const formatCurrency = (amountUSD: number) => {
    if (currency === "INR") {
      const amountINR = Math.round(amountUSD * FX);
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(amountINR);
    }
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Math.round(amountUSD));
  };

  // Computations
  // Mode 1 Calculations
  const currentMonthlySupportCostUSD = callVolume * costPerCallUSD;
  const automatedCalls = callVolume * (containmentRate / 100);
  // Assume AI cost is $0.40 per automated call
  const aiCostPerCallUSD = 0.4;
  const aiMonthlyCostUSD = automatedCalls * aiCostPerCallUSD;
  const monthlySavingsVoiceUSD =
    automatedCalls * costPerCallUSD - aiMonthlyCostUSD;
  const annualSavingsVoiceUSD = monthlySavingsVoiceUSD * 12;
  const voiceROI = Math.round(
    ((monthlySavingsVoiceUSD * 12) / (aiMonthlyCostUSD * 12 + 2500)) * 100
  );

  // Mode 2 Calculations
  const fraudIncidents = (shieldCallVolume * (fraudRatePercent / 100));
  const currentMonthlyFraudExposureUSD = fraudIncidents * lossPerIncidentUSD;
  const preventedMonthlyLossUSD = currentMonthlyFraudExposureUSD * 0.999;
  const remainingMonthlyLossUSD = currentMonthlyFraudExposureUSD - preventedMonthlyLossUSD;
  const annualSavingsShieldUSD = preventedMonthlyLossUSD * 12;

  // Mode 3 Calculations
  const monthlyCloudSavingsUSD = cloudSpendUSD * (optimizationPercent / 100);
  // Estimate developer productivity bonus: 6 hours/week saved per dev * $65/hr
  const monthlyDevTimeValueUSD = teamSize * 6 * 4 * 65;
  const monthlyTotalEngineeringGainUSD =
    monthlyCloudSavingsUSD + monthlyDevTimeValueUSD;
  const annualEngineeringGainUSD = monthlyTotalEngineeringGainUSD * 12;

  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20 overflow-x-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Navigation & Breadcrumb */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <BackButton fallbackHref="/pricing" label="Back to Pricing" inline />
          
          {/* Currency Switcher */}
          <div className="flex items-center gap-2 bg-white border border-[var(--lit-border-light,#DFE7EF)] p-1 rounded-xl shadow-2xs">
            <span className="text-xs font-semibold text-slate-500 px-2">Currency:</span>
            <button
              onClick={() => setCurrency("USD")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                currency === "USD"
                  ? "bg-[#1565C0] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              USD ($)
            </button>
            <button
              onClick={() => setCurrency("INR")}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                currency === "INR"
                  ? "bg-[#1565C0] text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              INR (₹)
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E7F3FF] border border-[#B9DCFE] text-[#1565C0] text-xs font-semibold tracking-wide uppercase mb-4 shadow-2xs">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Financial Model</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-poppins text-[var(--lit-navy,#0B2545)] tracking-tight leading-[1.15] mb-4">
            Engineering & AI <br />
            <span className="text-[#1565C0]">ROI Calculator</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Quantify projected capital savings, labor efficiency gains, and risk mitigation across voice automation, deepfake fraud defense, and cloud modernization.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex flex-wrap justify-center p-1.5 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-2xs gap-1.5">
            <button
              onClick={() => setMode("voice-agents")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                mode === "voice-agents"
                  ? "bg-[#1565C0] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>AI Voice Automation</span>
            </button>
            <button
              onClick={() => setMode("voice-shield")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                mode === "voice-shield"
                  ? "bg-[#1FA9A2] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Voice Shield & Fraud</span>
            </button>
            <button
              onClick={() => setMode("cloud-engineering")}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                mode === "cloud-engineering"
                  ? "bg-[#0B2545] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Server className="w-4 h-4" />
              <span>Cloud & Engineering</span>
            </button>
          </div>
        </div>

        {/* Calculator Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start mb-20">
          {/* Left Column: Input Sliders & Controls */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] p-6 sm:p-8 shadow-sm">
            {mode === "voice-agents" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--lit-border-light,#DFE7EF)] pb-4">
                  <div>
                    <h2 className="text-lg font-bold font-poppins text-[var(--lit-navy,#0B2545)]">
                      Voice Support Parameters
                    </h2>
                    <p className="text-xs text-slate-500">
                      Simulate agent deflection and tier-1 containment
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-[#E7F3FF] text-[#1565C0]">
                    Logic Voice AI
                  </span>
                </div>

                {/* Slider 1: Monthly Call Volume */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Monthly Call Volume
                    </label>
                    <span className="text-sm font-mono font-bold text-[#1565C0]">
                      {callVolume.toLocaleString()} calls/mo
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2000"
                    max="200000"
                    step="1000"
                    value={callVolume}
                    onChange={(e) => setCallVolume(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1565C0]"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>2,000</span>
                    <span>100,000</span>
                    <span>200,000+</span>
                  </div>
                </div>

                {/* Slider 2: Current Cost Per Call */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Current Human Cost per Interaction
                    </label>
                    <span className="text-sm font-mono font-bold text-[#1565C0]">
                      {formatCurrency(costPerCallUSD)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.5"
                    max="12.0"
                    step="0.5"
                    value={costPerCallUSD}
                    onChange={(e) => setCostPerCallUSD(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1565C0]"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>{formatCurrency(1.5)} (Tier 1 offshore)</span>
                    <span>{formatCurrency(4.5)} (Avg)</span>
                    <span>{formatCurrency(12.0)} (Technical/US)</span>
                  </div>
                </div>

                {/* Slider 3: Autonomous Containment Rate */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Projected AI Containment & Resolution Rate
                    </label>
                    <span className="text-sm font-mono font-bold text-[#1565C0]">
                      {containmentRate}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="90"
                    step="1"
                    value={containmentRate}
                    onChange={(e) => setContainmentRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1565C0]"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>30% (Conservative)</span>
                    <span>68% (Benchmark average)</span>
                    <span>90% (Strict script)</span>
                  </div>
                </div>

                {/* Micro Benchmark Note */}
                <div className="p-4 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-xs text-slate-600 flex items-start gap-3">
                  <Zap className="w-4 h-4 text-[#1565C0] shrink-0 mt-0.5" />
                  <p>
                    <strong>Enterprise Benchmark:</strong> Logic Voice AI averages sub-400ms latency, reducing abandon rates to &lt; 2% while containing up to 74% of inbound billing, scheduling, and informational inquiries without human intervention.
                  </p>
                </div>
              </div>
            )}

            {mode === "voice-shield" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--lit-border-light,#DFE7EF)] pb-4">
                  <div>
                    <h2 className="text-lg font-bold font-poppins text-[var(--lit-navy,#0B2545)]">
                      Contact Center Fraud Risk
                    </h2>
                    <p className="text-xs text-slate-500">
                      Model losses from AI voice cloning & credential stuffing
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-[#ECFDF5] text-[#1FA9A2]">
                    Voice Shield Protection
                  </span>
                </div>

                {/* Slider 1: Monthly Call Volume */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Monthly Inbound Call Volume
                    </label>
                    <span className="text-sm font-mono font-bold text-[#1FA9A2]">
                      {shieldCallVolume.toLocaleString()} calls/mo
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="500000"
                    step="5000"
                    value={shieldCallVolume}
                    onChange={(e) => setShieldCallVolume(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1FA9A2]"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>10,000</span>
                    <span>250,000</span>
                    <span>500,000+</span>
                  </div>
                </div>

                {/* Slider 2: Attack Incident Rate */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Synthetic Audio Incident Rate
                    </label>
                    <span className="text-sm font-mono font-bold text-[#1FA9A2]">
                      {fraudRatePercent.toFixed(2)}% of calls
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="2.0"
                    step="0.05"
                    value={fraudRatePercent}
                    onChange={(e) => setFraudRatePercent(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1FA9A2]"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>0.1% (Low risk)</span>
                    <span>0.4% (Industry baseline)</span>
                    <span>2.0% (High target sector)</span>
                  </div>
                </div>

                {/* Slider 3: Average Loss per Incident */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Average Direct & Remediation Loss per Breach
                    </label>
                    <span className="text-sm font-mono font-bold text-[#1FA9A2]">
                      {formatCurrency(lossPerIncidentUSD)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="15000"
                    step="500"
                    value={lossPerIncidentUSD}
                    onChange={(e) => setLossPerIncidentUSD(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1FA9A2]"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>{formatCurrency(500)}</span>
                    <span>{formatCurrency(3500)} (Average fintech/banking)</span>
                    <span>{formatCurrency(15000)} (Regulated loss)</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-xs text-slate-600 flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-[#1FA9A2] shrink-0 mt-0.5" />
                  <p>
                    <strong>Deterministic Defense:</strong> Voice Shield inspects acoustic spectrographs and voice biometrics with sub-180ms latency to detect cloned audio with 99.9% precision before authentication completes.
                  </p>
                </div>
              </div>
            )}

            {mode === "cloud-engineering" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[var(--lit-border-light,#DFE7EF)] pb-4">
                  <div>
                    <h2 className="text-lg font-bold font-poppins text-[var(--lit-navy,#0B2545)]">
                      Cloud & Team Velocity
                    </h2>
                    <p className="text-xs text-slate-500">
                      Model infrastructure optimization and developer acceleration
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-[#EDE7F6] text-[#7C3AED]">
                    Modernization Pod
                  </span>
                </div>

                {/* Slider 1: Monthly Cloud Bill */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Current Monthly Cloud Infrastructure Spend
                    </label>
                    <span className="text-sm font-mono font-bold text-[var(--lit-navy,#0B2545)]">
                      {formatCurrency(cloudSpendUSD)}/mo
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3000"
                    max="150000"
                    step="1000"
                    value={cloudSpendUSD}
                    onChange={(e) => setCloudSpendUSD(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0B2545]"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>{formatCurrency(3000)}</span>
                    <span>{formatCurrency(50000)}</span>
                    <span>{formatCurrency(150000)}+</span>
                  </div>
                </div>

                {/* Slider 2: Engineering Team Size */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Engineering Team Size
                    </label>
                    <span className="text-sm font-mono font-bold text-[var(--lit-navy,#0B2545)]">
                      {teamSize} Engineers
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="60"
                    step="1"
                    value={teamSize}
                    onChange={(e) => setTeamSize(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0B2545]"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>3 Engineers</span>
                    <span>25 Engineers</span>
                    <span>60+ Engineers</span>
                  </div>
                </div>

                {/* Slider 3: Optimization Yield */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Target Cloud & Pipeline Reduction
                    </label>
                    <span className="text-sm font-mono font-bold text-[var(--lit-navy,#0B2545)]">
                      {optimizationPercent}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="55"
                    step="1"
                    value={optimizationPercent}
                    onChange={(e) => setOptimizationPercent(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0B2545]"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>15% (Basic tuning)</span>
                    <span>34% (Standard refactor)</span>
                    <span>55% (Serverless / Kubernetes overhaul)</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)] text-xs text-slate-600 flex items-start gap-3">
                  <Server className="w-4 h-4 text-[#0B2545] shrink-0 mt-0.5" />
                  <p>
                    <strong>Architecture Impact:</strong> Modernizing data pipelines with serverless architecture and automated CI/CD reduces idle database compute while saving 6+ engineering hours per developer every week.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Dynamic Projected Impact Card */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[var(--lit-border-light,#DFE7EF)] p-6 sm:p-8 shadow-sm flex flex-col justify-between">
            {mode === "voice-agents" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1565C0]">
                    Projected Financial Returns
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +{voiceROI}% Est. ROI
                  </span>
                </div>

                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Current Monthly Support Spend
                    </span>
                    <p className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-700">
                      {formatCurrency(currentMonthlySupportCostUSD)}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#E7F3FF]/50 border border-[#B9DCFE]">
                    <span className="text-xs font-bold text-[#1565C0] uppercase tracking-wider block mb-1">
                      Projected Monthly Net Savings
                    </span>
                    <p className="text-3xl sm:text-4xl font-extrabold font-mono text-[#1565C0]">
                      {formatCurrency(monthlySavingsVoiceUSD)}
                    </p>
                    <span className="text-xs text-slate-600 mt-1 block">
                      Based on {automatedCalls.toLocaleString()} automated calls/mo
                    </span>
                  </div>

                  <div className="border-t border-[var(--lit-border-light,#DFE7EF)] pt-4">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Annualized Capital Retained
                    </span>
                    <p className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--lit-navy,#0B2545)]">
                      {formatCurrency(annualSavingsVoiceUSD)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]">
                      <span className="text-[11px] text-slate-500 block">Avg. Payback</span>
                      <span className="text-sm font-bold text-slate-800 font-mono">&lt; 45 Days</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]">
                      <span className="text-[11px] text-slate-500 block">Availability</span>
                      <span className="text-sm font-bold text-slate-800 font-mono">24/7/365</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {mode === "voice-shield" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1FA9A2]">
                    Risk Mitigation Value
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    99.9% Precision
                  </span>
                </div>

                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Current Unmitigated Fraud Exposure
                    </span>
                    <p className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-700">
                      {formatCurrency(currentMonthlyFraudExposureUSD)}
                      <span className="text-xs text-slate-400 font-normal"> /mo</span>
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0]">
                    <span className="text-xs font-bold text-[#1FA9A2] uppercase tracking-wider block mb-1">
                      Capital Protected Monthly
                    </span>
                    <p className="text-3xl sm:text-4xl font-extrabold font-mono text-[#065F46]">
                      {formatCurrency(preventedMonthlyLossUSD)}
                    </p>
                    <span className="text-xs text-[#047857] mt-1 block">
                      ~{Math.round(fraudIncidents)} fraudulent attempts deflected/mo
                    </span>
                  </div>

                  <div className="border-t border-[var(--lit-border-light,#DFE7EF)] pt-4">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Annual Risk Capital Defended
                    </span>
                    <p className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--lit-navy,#0B2545)]">
                      {formatCurrency(annualSavingsShieldUSD)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]">
                      <span className="text-[11px] text-slate-500 block">Verification Delay</span>
                      <span className="text-sm font-bold text-slate-800 font-mono">&lt; 180ms</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]">
                      <span className="text-[11px] text-slate-500 block">False Positive</span>
                      <span className="text-sm font-bold text-slate-800 font-mono">&lt; 0.08%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {mode === "cloud-engineering" && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--lit-navy,#0B2545)]">
                    Efficiency & Velocity ROI
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                    <Zap className="w-3.5 h-3.5" />
                    +30% Velocity
                  </span>
                </div>

                <div className="space-y-6">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Direct Monthly Cloud Bill Savings
                    </span>
                    <p className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-700">
                      {formatCurrency(monthlyCloudSavingsUSD)}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#EDE7F6] border border-[#D1C4E9]">
                    <span className="text-xs font-bold text-[#5B21B6] uppercase tracking-wider block mb-1">
                      Total Monthly Economic Value
                    </span>
                    <p className="text-3xl sm:text-4xl font-extrabold font-mono text-[#5B21B6]">
                      {formatCurrency(monthlyTotalEngineeringGainUSD)}
                    </p>
                    <span className="text-xs text-[#6D28D9] mt-1 block">
                      Includes developer velocity unlock
                    </span>
                  </div>

                  <div className="border-t border-[var(--lit-border-light,#DFE7EF)] pt-4">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      Annual Cumulative Economic Value
                    </span>
                    <p className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--lit-navy,#0B2545)]">
                      {formatCurrency(annualEngineeringGainUSD)}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]">
                      <span className="text-[11px] text-slate-500 block">Weekly Hours Saved</span>
                      <span className="text-sm font-bold text-slate-800 font-mono">~{teamSize * 6} hrs/team</span>
                    </div>
                    <div className="p-3 rounded-xl bg-[var(--lit-cloud,#F7F9FC)] border border-[var(--lit-border-light,#DFE7EF)]">
                      <span className="text-[11px] text-slate-500 block">Release Frequency</span>
                      <span className="text-sm font-bold text-slate-800 font-mono">Daily CI/CD</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 pt-6 border-t border-[var(--lit-border-light,#DFE7EF)] flex flex-col sm:flex-row gap-3">
              <Link
                href="/book-consultation"
                className="lit-btn lit-btn-primary w-full justify-center text-xs"
              >
                <span>Validate With An Architect</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
              <Link
                href="/sales"
                className="lit-btn lit-btn-secondary w-full sm:w-auto justify-center text-xs"
              >
                <span>Get Quote</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Methodology & Assumptions */}
        <section className="mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-2">
              Calculation Methodology & Integrity
            </h2>
            <p className="text-slate-600 text-sm">
              Our models are derived from empirical telemetry across our enterprise client deployments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#E7F3FF] border border-[#B9DCFE] flex items-center justify-center text-[#1565C0] mb-4">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-2">
                Empirical Telemetry
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Containment, latency, and false positive metrics reflect actual production performance across fintech, healthcare, and enterprise commerce clients.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#E7F3FF] border border-[#B9DCFE] flex items-center justify-center text-[#1565C0] mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-2">
                Rapid Time-to-Value
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Most client deployments achieve full operational payback within 30 to 60 days of production cutover, minimizing financial risk.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[var(--lit-border-light,#DFE7EF)] shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#E7F3FF] border border-[#B9DCFE] flex items-center justify-center text-[#1565C0] mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold font-poppins text-[var(--lit-navy,#0B2545)] mb-2">
                Custom POC Verification
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                We validate these formulas against your exact historical call logs or AWS/GCP bills before executing any production contract.
              </p>
            </div>
          </div>
        </section>

        {/* Canonical Deep Navy CTA */}
        <CTASection
          title="Ready to Model Your Organization's Exact Numbers?"
          subtitle="Book a 30-minute architecture session with our engineering directors. We will ingest your sample traffic data and present a comprehensive business case."
          primaryCta={{
            label: "Schedule Architecture Session",
            href: "/book-consultation",
          }}
          secondaryCta={{
            label: "Explore Turnkey Packages",
            href: "/packages",
          }}
        />
      </div>
    </main>
  );
}
