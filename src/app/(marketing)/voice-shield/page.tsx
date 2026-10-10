import { Metadata } from "next";
import Link from "next/link";
import SafeImage from "@/components/ui/safe-image";
import BackButton from "@/components/navigation/back-button";
import AudioThreatSimulator from "@/components/voice-shield/audio-threat-simulator";
import {
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Activity,
  Lock,
  Zap,
  PhoneCall,
  Server,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertOctagon,
  Building2,
  HeartPulse,
  Briefcase,
  Headphones,
  Scale,
  Sparkles,
  Terminal,
  FileCheck,
  Radio,
  Clock,
  Key
} from "lucide-react";

export const metadata: Metadata = {
  title: "Voice Shield — Real-Time AI Voice Biometrics & Deepfake Defense | Logic Intelligence Technologies",
  description:
    "Voice Shield by Logic Intelligence Technologies is an enterprise audio firewall protecting telephony, SIP trunking, and call centers from synthetic voice clones, AI impersonation, and deepfake wire fraud.",
  alternates: {
    canonical: "/voice-shield",
  },
  openGraph: {
    title: "Voice Shield — Real-Time AI Voice Biometrics & Deepfake Defense",
    description:
      "Enterprise audio security firewall detecting AI voice clones and synthetic speech under 15ms. Zero-retention DPDP 2023 & HIPAA compliant architecture.",
    images: [{ url: "/images/products/voice-shield.svg", width: 1200, height: 630, alt: "Voice Shield AI Audio Firewall" }],
  },
  keywords: [
    "Voice Shield",
    "AI voice biometrics",
    "deepfake voice detection",
    "audio firewall",
    "synthetic voice defense",
    "SIP deepfake defense",
    "call center voice authentication",
    "voice fraud prevention",
    "Logic Intelligence Technologies voice shield",
  ],
};

const USE_CASES = [
  {
    icon: Building2,
    badge: "FINANCIAL SERVICES",
    title: "Banking Wire Fraud & VIP Impersonation Prevention",
    description:
      "Prevent catastrophic unauthorized wire transfers, treasury withdrawals, and account takeovers initiated through synthetic AI voice clones replicating C-level executives or high-net-worth account holders.",
    capabilities: [
      "Real-time acoustic analysis of inbound phone requests for funds release",
      "Immediate detection of zero-shot voice cloning algorithms (e.g. ElevenLabs, XTTS)",
      "Zero disruption to legitimate clients during routine telephone banking",
      "Cryptographic verification token attached to the core banking ledger"
    ],
    impact: "100% intercept rate on synthetic executive impersonation attempts in pilot test environments."
  },
  {
    icon: HeartPulse,
    badge: "HEALTHCARE & CLINICAL",
    title: "LIT Healthcare Patient & Prescription Authorization",
    description:
      "Tightly coupled with LIT Healthcare's hospital operations platform, Voice Shield verifies physician voice signatures for telephonic drug orders and validates patient identity during remote telemedicine triage.",
    capabilities: [
      "In-band verification for scheduled narcotic and controlled substance prescriptions",
      "Zero raw patient audio stored, guaranteeing strict HIPAA and DPDP Act 2023 compliance",
      "Real-time doctor voice biometric authentication over hospital PBX and mobile extensions",
      "Automated timestamped clinical audit trail for medical malpractice protection"
    ],
    impact: "Eliminates fraudulent pharmaceutical orders and unauthorized medical record phone inquiries."
  },
  {
    icon: Briefcase,
    badge: "EXECUTIVE & ENTERPRISE",
    title: "C-Suite & High-Profile Defense",
    description:
      "Defend corporate boardrooms and executive communications against targeted vishing attacks designed to manipulate staff, trigger urgent mergers disclosures, or extract internal credentials.",
    capabilities: [
      "Enrolled executive voice prints protected by non-invertible cryptographic hashes",
      "Background continuous acoustic surveillance without requiring special passcodes",
      "Immediate automated disconnection and SecOps escalation upon spoof detection",
      "Enterprise SIEM integration via encrypted Webhooks and Syslog"
    ],
    impact: "Zero false accepts on enrolled executive voice profiles across simulated attack scenarios."
  },
  {
    icon: Headphones,
    badge: "CONTACT CENTERS & BPO",
    title: "High-Volume Call Center Continuous Authentication",
    description:
      "Replace frustrating knowledge-based authentication questions (Mothers maiden name, childhood pets) with passive, frictionless voice biometrics operating seamlessly in the first 3 seconds of conversation.",
    capabilities: [
      "Reduces Average Handling Time (AHT) by 35–50 seconds per customer interaction",
      "Detects audio playback, pre-recorded snippets, and dynamic soundboard attacks",
      "Seamless inline integration with Asterisk, FreeSWITCH, Cisco, Avaya, and Twilio SIP",
      "Scales horizontally to 10,000+ concurrent inbound telephony channels"
    ],
    impact: "Dramatic drop in call center operational overhead and complete eradication of social engineering takeovers."
  },
  {
    icon: Scale,
    badge: "LEGAL & REGULATORY",
    title: "Forensic Chain-of-Custody & Evidentiary Verification",
    description:
      "Provide cryptographic attestation that recorded legal depositions, recorded corporate disclosures, or arbitrated phone negotiations are authentic and free from post-hoc AI speech manipulation.",
    capabilities: [
      "Sub-frame spectral phase verification identifying spliced or regenerated syllables",
      "Tamper-evident mathematical proof certificates exportable for court admissibility",
      "Deterministic non-stochastic acoustic evaluation verified against public baselines",
      "Deterministic chain of custody preserved through cryptographic SHA-256 state trees"
    ],
    impact: "Legally defensible audio verification that withstands rigorous expert forensic cross-examination."
  }
];

const SPECS = [
  { label: "Inspection Latency", value: "<15 ms", detail: "Fast-path neural acoustic inference on incoming PCM frames" },
  { label: "Detection Accuracy", value: "99.4%", detail: "Equal Error Rate (EER) of 0.6% on deepfake benchmark datasets" },
  { label: "Telephony Protocols", value: "SIP / SRTP / WebRTC", detail: "Inline proxy or parallel mirrored trunk architecture" },
  { label: "Audio Sampling Rates", value: "8kHz – 48kHz", detail: "Supports Narrowband G.711 to High-Definition Opus codec" },
  { label: "Data Retention", value: "Zero Persistent Disk", detail: "Raw audio stream discarded from ephemeral RAM within 100ms" },
  { label: "Regulatory Compliance", value: "DPDP 2023 & HIPAA", detail: "Non-reversible biometric mathematical vectors with no PII" }
];

export default function VoiceShieldPage() {
  return (
    <div className="relative min-h-screen bg-[#07090D] text-slate-100 pt-32 pb-24 overflow-hidden selection:bg-primary selection:text-slate-950">
      <BackButton fallbackHref="/products" label="Back to Products" />

      {/* Atmospheric lighting */}
      <div className="pointer-events-none absolute top-12 left-1/2 -translate-x-1/2 w-[850px] h-[380px] bg-[radial-gradient(ellipse_at_top,_rgba(0,210,196,0.14),_transparent_70%)] blur-[130px]" />
      <div className="pointer-events-none absolute top-[40%] right-0 w-[550px] h-[450px] bg-[radial-gradient(ellipse_at_center,_rgba(56,189,248,0.08),_transparent_70%)] blur-[150px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-28">
        
        {/* ========================================================= */}
        {/* SECTION 1: INTRODUCTION & HERO */}
        {/* ========================================================= */}
        <section id="introduction" className="space-y-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono font-bold tracking-widest uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Real-Time Audio Defense Platform</span>
            </div>

            <h1 className="text-[clamp(2.5rem,5.5vw,4.75rem)] font-extrabold tracking-tight text-white uppercase leading-[1.05]">
              Voice <span className="bg-gradient-to-r from-primary via-[#6DE6E0] to-[#38BDF8] bg-clip-text text-transparent">Shield</span>
            </h1>

            <p className="text-lg sm:text-2xl font-light text-slate-200 tracking-tight">
              Real-Time AI Voice Biometrics, Deepfake Defense &amp; Acoustic Threat Firewall
            </p>

            <p className="text-base sm:text-lg text-slate-400 leading-relaxed font-light max-w-3xl mx-auto">
              Defend your enterprise contact centers, executive telephony, and sensitive transactional workflows against generative AI voice clones, conversational deepfakes, and automated vishing syndicates. Sub-15ms fast path verification engineered natively for modern SIP and WebRTC infrastructure.
            </p>

            {/* Telemetry Hero Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10131A] border border-white/10 text-xs font-mono text-slate-300">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span>&lt;15ms Latency Fast-Path</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10131A] border border-white/10 text-xs font-mono text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>99.4% Deepfake Detection</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10131A] border border-white/10 text-xs font-mono text-slate-300">
                <Lock className="w-3.5 h-3.5 text-sky-400" />
                <span>DPDP 2023 &amp; HIPAA Zero-Retention</span>
              </div>
            </div>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/book-consultation"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-primary text-slate-950 font-bold text-sm tracking-wide hover:bg-[#6DE6E0] transition-all shadow-lg shadow-primary/20 hover:scale-[1.02]"
              >
                <span>Request Audio Security Audit</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/free-demo"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[#10131A] text-slate-200 border border-white/10 font-bold text-sm tracking-wide hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <span>Schedule Live Telephony Demo</span>
              </Link>
            </div>
          </div>

          {/* Interactive Threat Simulator Console */}
          <div className="pt-8">
            <AudioThreatSimulator />
          </div>
        </section>


        {/* ========================================================= */}
        {/* SECTION 2: ABOUT VOICE SHIELD & ARCHITECTURE */}
        {/* ========================================================= */}
        <section id="about" className="space-y-12 pt-12 border-t border-white/10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-400 text-xs font-mono uppercase tracking-wider mb-4">
              <Cpu className="w-3.5 h-3.5" />
              <span>Deep Technical Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              About Voice Shield
            </h2>
            <p className="text-base sm:text-lg text-slate-400 mt-4 leading-relaxed font-light">
              Modern generative AI has commoditized real-time voice cloning. With fewer than three seconds of reference audio, attackers can accurately mimic any human voice. Voice Shield was engineered from the ground up to solve the latency and accuracy bottlenecks of traditional AI defense systems.
            </p>
          </div>

          {/* 3 Pillars of Defense */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-white/10 bg-[#0F1420]/80 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Sub-15ms Fast Path</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Large language models introduce 800ms to 2.5s of latency, creating unacceptable call pauses. Voice Shield bypasses LLM inference entirely using high-throughput Rust and PyTorch acoustic micro-encoders operating directly on raw PCM audio packets in under 15ms.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-[#0F1420]/80 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Spectral Phase Verification</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Synthetic vocoders (HiFi-GAN, WaveNet, StyleTTS) inherently discard or distort phase consistency in high frequencies. Voice Shield calculates instantaneous spectral phase variance and glottal aerodynamic turbulence to mathematically separate biological speech from synthetic models.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-[#0F1420]/80 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Zero-Retention Privacy</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Compliant with India’s Digital Personal Data Protection (DPDP) Act 2023, HIPAA, and GDPR. Audio streams are buffered strictly in volatile system RAM and purged immediately upon scoring. No customer voice recordings are ever persisted to disk.
              </p>
            </div>
          </div>

          {/* Architecture Pipeline Diagram */}
          <div className="rounded-2xl border border-white/10 bg-[#06080D] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <span className="text-xs font-mono text-primary font-bold uppercase tracking-wider">
                  Signal Flow Topology
                </span>
                <h4 className="text-xl font-bold text-white mt-1">
                  SIP / WebRTC Inline Middleware Integration
                </h4>
              </div>
              <span className="text-xs font-mono text-slate-400 px-3 py-1 rounded bg-white/5 border border-white/10">
                DEPLOYMENT: PROXY OR MIRROR
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="text-primary font-bold">01 // INBOUND SIGNAL</div>
                <div className="text-slate-200 font-semibold text-sm">SIP / RTP Stream</div>
                <p className="text-slate-400 text-[11px] font-sans">
                  Inbound call enters PBX / VoIP provider (Twilio, Asterisk, Cisco) and is mirrored or proxied.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="text-sky-400 font-bold">02 // FAST-PATH ENCODER</div>
                <div className="text-slate-200 font-semibold text-sm">Phase Decomposition</div>
                <p className="text-slate-400 text-[11px] font-sans">
                  Audio sliced into 20ms frames; vocoder artifact analysis and micro-laryngeal jitter assessed in &lt;15ms.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="text-amber-400 font-bold">03 // DECISION MATRIX</div>
                <div className="text-slate-200 font-semibold text-sm">Biometric Liveness</div>
                <p className="text-slate-400 text-[11px] font-sans">
                  Spoof confidence calculated against enrolled caller profile or baseline organic human liveness scale.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="text-emerald-400 font-bold">04 // GATEWAY VERDICT</div>
                <div className="text-slate-200 font-semibold text-sm">Pass or Terminate</div>
                <p className="text-slate-400 text-[11px] font-sans">
                  Clean calls continue seamlessly; deepfakes are immediately disconnected with alerts dispatched to SecOps.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* ========================================================= */}
        {/* SECTION 3: ENTERPRISE USE CASES */}
        {/* ========================================================= */}
        <section id="usecases" className="space-y-12 pt-12 border-t border-white/10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono uppercase tracking-wider mb-4">
              <Layers className="w-3.5 h-3.5" />
              <span>Real-World Implementations</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Enterprise Use Cases
            </h2>
            <p className="text-base sm:text-lg text-slate-400 mt-4 leading-relaxed font-light">
              Explore how organizations across banking, healthcare, executive leadership, and customer support deploy Voice Shield to secure high-consequence telephone and voice communications.
            </p>
          </div>

          <div className="space-y-6">
            {USE_CASES.map((uc, index) => {
              const Icon = uc.icon;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-[#0B0F17] p-6 sm:p-8 space-y-6 hover:border-white/20 transition-all group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-primary group-hover:scale-110 group-hover:border-primary/40 transition-all">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className="text-[11px] font-mono font-bold tracking-widest text-primary uppercase">
                          {uc.badge}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-bold text-white mt-0.5">
                          {uc.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                    {uc.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {uc.capabilities.map((cap, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4">
                    <div className="text-xs font-mono text-slate-400">
                      MEASURED SYSTEM IMPACT:
                    </div>
                    <div className="text-xs font-mono font-bold text-primary">
                      {uc.impact}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>


        {/* ========================================================= */}
        {/* SECTION 4: TECHNICAL SPECIFICATIONS & BENCHMARKS */}
        {/* ========================================================= */}
        <section id="specifications" className="space-y-8 pt-12 border-t border-white/10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono uppercase tracking-wider mb-4">
              <Terminal className="w-3.5 h-3.5" />
              <span>Verified Specifications</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Engineering Benchmarks &amp; System Specs
            </h2>
            <p className="text-base text-slate-400 mt-2 font-light">
              Deterministic, rigorously evaluated performance metrics for production telephony environments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SPECS.map((s, idx) => (
              <div key={idx} className="p-5 rounded-xl border border-white/10 bg-[#0F1420]/60 space-y-2">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  {s.label}
                </div>
                <div className="text-2xl font-bold text-white tracking-tight font-mono">
                  {s.value}
                </div>
                <p className="text-xs text-slate-400 font-light leading-relaxed">
                  {s.detail}
                </p>
              </div>
            ))}
          </div>
        </section>


        {/* ========================================================= */}
        {/* SECTION 5: CALL TO ACTION & CONSULTATION */}
        {/* ========================================================= */}
        <section className="pt-12 border-t border-white/10">
          <div className="rounded-3xl border border-primary/30 bg-gradient-to-b from-[#0F1626] to-[#070A10] p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-2xl">
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/10 blur-[120px]" />

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-mono font-bold tracking-widest uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Get Ahead of Voice Cloning Threats</span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
              Protect Your Telephony Infrastructure Today
            </h2>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-light">
              Connect with Logic Intelligence Technologies to scope a Voice Shield inline gateway pilot, conduct a voice threat vulnerability assessment, or integrate biometric defenses with your PBX.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/book-consultation"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-slate-950 font-bold text-sm tracking-wide hover:bg-[#6DE6E0] transition-all shadow-lg shadow-primary/25 hover:scale-[1.02]"
              >
                <span>Book Technical Scoping Session</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-[#151922] text-slate-200 border border-white/10 font-bold text-sm tracking-wide hover:bg-white/10 hover:border-white/20 transition-all"
              >
                <span>Contact Engineering Team</span>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
