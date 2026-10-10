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
  Key,
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
    badgeColor: "bg-[#E7F3FF] text-[#1565C0] border-[#BFDBFE]",
    iconColor: "text-[#1565C0] bg-[#E7F3FF] border-[#BFDBFE]",
    title: "Banking Wire Fraud & VIP Impersonation Prevention",
    description:
      "Prevent catastrophic unauthorized wire transfers, treasury withdrawals, and account takeovers initiated through synthetic AI voice clones replicating C-level executives or high-net-worth account holders.",
    capabilities: [
      "Real-time acoustic analysis of inbound phone requests for funds release",
      "Immediate detection of zero-shot voice cloning algorithms (e.g. ElevenLabs, XTTS)",
      "Zero disruption to legitimate clients during routine telephone banking",
      "Cryptographic verification token attached to the core banking ledger",
    ],
    impact: "100% intercept rate on synthetic executive impersonation attempts in pilot test environments.",
  },
  {
    icon: HeartPulse,
    badge: "HEALTHCARE & CLINICAL",
    badgeColor: "bg-[#FCEAF3] text-[#BE185D] border-[#FBCFE8]",
    iconColor: "text-[#BE185D] bg-[#FCEAF3] border-[#FBCFE8]",
    title: "LIT Healthcare Patient & Prescription Authorization",
    description:
      "Tightly coupled with LIT Healthcare's hospital operations platform, Voice Shield verifies physician voice signatures for telephonic drug orders and validates patient identity during remote telemedicine triage.",
    capabilities: [
      "In-band verification for scheduled narcotic and controlled substance prescriptions",
      "Zero raw patient audio stored, guaranteeing strict HIPAA and DPDP Act 2023 compliance",
      "Real-time doctor voice biometric authentication over hospital PBX and mobile extensions",
      "Automated timestamped clinical audit trail for medical malpractice protection",
    ],
    impact: "Eliminates fraudulent pharmaceutical orders and unauthorized medical record phone inquiries.",
  },
  {
    icon: Briefcase,
    badge: "EXECUTIVE & ENTERPRISE",
    badgeColor: "bg-[#F1ECFF] text-[#7C3AED] border-[#DDD6FE]",
    iconColor: "text-[#7C3AED] bg-[#F1ECFF] border-[#DDD6FE]",
    title: "C-Suite & High-Profile Defense",
    description:
      "Defend corporate boardrooms and executive communications against targeted vishing attacks designed to manipulate staff, trigger urgent mergers disclosures, or extract internal credentials.",
    capabilities: [
      "Enrolled executive voice prints protected by non-invertible cryptographic hashes",
      "Background continuous acoustic surveillance without requiring special passcodes",
      "Immediate automated disconnection and SecOps escalation upon spoof detection",
      "Enterprise SIEM integration via encrypted Webhooks and Syslog",
    ],
    impact: "Zero false accepts on enrolled executive voice profiles across simulated attack scenarios.",
  },
  {
    icon: Headphones,
    badge: "CONTACT CENTERS & BPO",
    badgeColor: "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]",
    iconColor: "text-[#059669] bg-[#ECFDF5] border-[#A7F3D0]",
    title: "High-Volume Call Center Continuous Authentication",
    description:
      "Replace frustrating knowledge-based authentication questions (Mother's maiden name, childhood pets) with passive, frictionless voice biometrics operating seamlessly in the first 3 seconds of conversation.",
    capabilities: [
      "Reduces Average Handling Time (AHT) by 35–50 seconds per customer interaction",
      "Detects audio playback, pre-recorded snippets, and dynamic soundboard attacks",
      "Seamless inline integration with Asterisk, FreeSWITCH, Cisco, Avaya, and Twilio SIP",
      "Scales horizontally to 10,000+ concurrent inbound telephony channels",
    ],
    impact: "Dramatic drop in call center operational overhead and complete eradication of social engineering takeovers.",
  },
  {
    icon: Scale,
    badge: "LEGAL & REGULATORY",
    badgeColor: "bg-[#FFF4D9] text-[#B45309] border-[#FDE68A]",
    iconColor: "text-[#B45309] bg-[#FFF4D9] border-[#FDE68A]",
    title: "Forensic Chain-of-Custody & Evidentiary Verification",
    description:
      "Provide cryptographic attestation that recorded legal depositions, recorded corporate disclosures, or arbitrated phone negotiations are authentic and free from post-hoc AI speech manipulation.",
    capabilities: [
      "Sub-frame spectral phase verification identifying spliced or regenerated syllables",
      "Tamper-evident mathematical proof certificates exportable for court admissibility",
      "Deterministic non-stochastic acoustic evaluation verified against public baselines",
      "Deterministic chain of custody preserved through cryptographic SHA-256 state trees",
    ],
    impact: "Legally defensible audio verification that withstands rigorous expert forensic cross-examination.",
  },
];

const SPECS = [
  { label: "Inspection Latency", value: "<15 ms", detail: "Fast-path neural acoustic inference on incoming PCM frames" },
  { label: "Detection Accuracy", value: "99.4%", detail: "Equal Error Rate (EER) of 0.6% on deepfake benchmark datasets" },
  { label: "Telephony Protocols", value: "SIP / SRTP / WebRTC", detail: "Inline proxy or parallel mirrored trunk architecture" },
  { label: "Audio Sampling Rates", value: "8kHz – 48kHz", detail: "Supports Narrowband G.711 to High-Definition Opus codec" },
  { label: "Data Retention", value: "Zero Persistent Disk", detail: "Raw audio stream discarded from ephemeral RAM within 100ms" },
  { label: "Regulatory Compliance", value: "DPDP 2023 & HIPAA", detail: "Non-reversible biometric mathematical vectors with no PII" },
];

export default function VoiceShieldPage() {
  return (
    <div className="min-h-screen bg-[var(--lit-cloud,#F7F9FC)] text-[var(--lit-ink,#121826)] selection:bg-[#E7F3FF] selection:text-[#1565C0] pt-28 sm:pt-36 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <BackButton fallbackHref="/products" label="Back to Products" inline />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16 sm:space-y-20">
        {/* ========================================================= */}
        {/* SECTION 1: INTRODUCTION & HERO */}
        {/* ========================================================= */}
        <section id="introduction" className="space-y-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#1FA9A2]/25 bg-[#1FA9A2]/10 text-[#0E7A74] text-xs font-mono font-semibold tracking-wider uppercase shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Real-Time Audio Defense Platform</span>
            </div>

            <h1 className="text-[clamp(2.5rem,5.5vw,4.75rem)] font-bold tracking-tight text-[var(--lit-navy,#0B2545)] uppercase leading-[1.05]">
              Voice Shield
            </h1>

            <p className="text-lg sm:text-2xl font-serif italic text-[var(--lit-blue,#1565C0)] font-normal">
              Real-Time AI Voice Biometrics, Deepfake Defense &amp; Acoustic Threat Firewall
            </p>

            <p className="text-base sm:text-lg text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal max-w-3xl mx-auto">
              Defend your enterprise contact centers, executive telephony, and sensitive transactional workflows against generative AI voice clones, conversational deepfakes, and automated vishing syndicates. Sub-15ms fast path verification engineered natively for modern SIP and WebRTC infrastructure.
            </p>

            {/* Telemetry Hero Badges */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#DFE7EF] text-xs font-mono text-[var(--lit-navy,#0B2545)] shadow-2xs">
                <Zap className="w-3.5 h-3.5 text-[#1FA9A2]" />
                <span>&lt;15ms Latency Fast-Path</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#DFE7EF] text-xs font-mono text-[var(--lit-navy,#0B2545)] shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                <span>99.4% Deepfake Detection</span>
              </div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-[#DFE7EF] text-xs font-mono text-[var(--lit-navy,#0B2545)] shadow-2xs">
                <Lock className="w-3.5 h-3.5 text-[#1565C0]" />
                <span>DPDP 2023 &amp; HIPAA Zero-Retention</span>
              </div>
            </div>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/book-consultation"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[var(--lit-navy,#0B2545)] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#1565C0] transition-all shadow-sm min-h-[48px]"
              >
                <span>Request Audio Security Audit</span>
                <ArrowRight className="w-4 h-4 text-[#45D9D2]" />
              </Link>
              <Link
                href="/free-demo"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[var(--lit-navy,#0B2545)] border border-[#DFE7EF] font-semibold text-xs uppercase tracking-wider hover:bg-[#F7F9FC] transition-all shadow-2xs min-h-[48px]"
              >
                <span>Schedule Live Telephony Demo</span>
              </Link>
            </div>
          </div>

          {/* Interactive Threat Simulator Console */}
          <div className="pt-4">
            <AudioThreatSimulator />
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: ABOUT VOICE SHIELD & ARCHITECTURE */}
        {/* ========================================================= */}
        <section id="about" className="space-y-10 pt-10 border-t border-[#DFE7EF]">
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#1565C0]/25 bg-[#E7F3FF] text-[#1565C0] text-xs font-mono font-semibold uppercase tracking-wider shadow-2xs">
              <Cpu className="w-3.5 h-3.5" />
              <span>Deep Technical Architecture</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--lit-navy,#0B2545)] tracking-tight">
              About Voice Shield
            </h2>
            <p className="text-base sm:text-lg text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">
              Modern generative AI has commoditized real-time voice cloning. With fewer than three seconds of reference audio, attackers can accurately mimic any human voice. Voice Shield was engineered from the ground up to solve the latency and accuracy bottlenecks of traditional AI defense systems.
            </p>
          </div>

          {/* 3 Pillars of Defense */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-7 sm:p-8 rounded-3xl border border-[#DFE7EF] bg-white space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#1FA9A2]/10 border border-[#1FA9A2]/25 flex items-center justify-center text-[#0E7A74]">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--lit-navy,#0B2545)]">Sub-15ms Fast Path</h3>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">
                Large language models introduce 800ms to 2.5s of latency, creating unacceptable call pauses. Voice Shield bypasses LLM inference entirely using high-throughput Rust and PyTorch acoustic micro-encoders operating directly on raw PCM audio packets in under 15ms.
              </p>
            </div>

            <div className="p-7 sm:p-8 rounded-3xl border border-[#DFE7EF] bg-white space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#E7F3FF] border border-[#BFDBFE] flex items-center justify-center text-[#1565C0]">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--lit-navy,#0B2545)]">Spectral Phase Verification</h3>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">
                Synthetic vocoders (HiFi-GAN, WaveNet, StyleTTS) inherently discard or distort phase consistency in high frequencies. Voice Shield calculates instantaneous spectral phase variance and glottal aerodynamic turbulence to mathematically separate biological speech from synthetic models.
              </p>
            </div>

            <div className="p-7 sm:p-8 rounded-3xl border border-[#DFE7EF] bg-white space-y-4 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669]">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[var(--lit-navy,#0B2545)]">Zero-Retention Privacy</h3>
              <p className="text-sm text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">
                Compliant with India&apos;s Digital Personal Data Protection (DPDP) Act 2023, HIPAA, and GDPR. Audio streams are buffered strictly in volatile system RAM and purged immediately upon scoring. No customer voice recordings are ever persisted to disk.
              </p>
            </div>
          </div>

          {/* Architecture Pipeline Diagram */}
          <div className="rounded-3xl border border-[#DFE7EF] bg-white p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#DFE7EF] pb-4">
              <div>
                <span className="text-xs font-mono text-[#0E7A74] font-bold uppercase tracking-wider">
                  Signal Flow Topology
                </span>
                <h4 className="text-xl font-bold text-[var(--lit-navy,#0B2545)] mt-1">
                  SIP / WebRTC Inline Middleware Integration
                </h4>
              </div>
              <span className="text-xs font-mono text-[var(--lit-text-muted,#52677C)] px-3 py-1 rounded-full bg-[#F7F9FC] border border-[#DFE7EF]">
                DEPLOYMENT: PROXY OR MIRROR
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-5 rounded-2xl bg-[#F7F9FC] border border-[#DFE7EF] space-y-2">
                <div className="text-[#0E7A74] font-bold">01 // INBOUND SIGNAL</div>
                <div className="text-[var(--lit-navy,#0B2545)] font-semibold text-sm">SIP / RTP Stream</div>
                <p className="text-[var(--lit-text-muted,#52677C)] text-xs font-sans">
                  Inbound call enters PBX / VoIP provider (Twilio, Asterisk, Cisco) and is mirrored or proxied.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F7F9FC] border border-[#DFE7EF] space-y-2">
                <div className="text-[#1565C0] font-bold">02 // FAST-PATH ENCODER</div>
                <div className="text-[var(--lit-navy,#0B2545)] font-semibold text-sm">Phase Decomposition</div>
                <p className="text-[var(--lit-text-muted,#52677C)] text-xs font-sans">
                  Audio sliced into 20ms frames; vocoder artifact analysis and micro-laryngeal jitter assessed in &lt;15ms.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F7F9FC] border border-[#DFE7EF] space-y-2">
                <div className="text-[#B45309] font-bold">03 // DECISION MATRIX</div>
                <div className="text-[var(--lit-navy,#0B2545)] font-semibold text-sm">Biometric Liveness</div>
                <p className="text-[var(--lit-text-muted,#52677C)] text-xs font-sans">
                  Spoof confidence calculated against enrolled caller profile or baseline organic human liveness scale.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#F7F9FC] border border-[#DFE7EF] space-y-2">
                <div className="text-[#059669] font-bold">04 // GATEWAY VERDICT</div>
                <div className="text-[var(--lit-navy,#0B2545)] font-semibold text-sm">Pass or Terminate</div>
                <p className="text-[var(--lit-text-muted,#52677C)] text-xs font-sans">
                  Clean calls continue seamlessly; deepfakes are immediately disconnected with alerts dispatched to SecOps.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: ENTERPRISE USE CASES */}
        {/* ========================================================= */}
        <section id="usecases" className="space-y-10 pt-10 border-t border-[#DFE7EF]">
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#059669]/25 bg-[#ECFDF5] text-[#059669] text-xs font-mono font-semibold uppercase tracking-wider shadow-2xs">
              <Layers className="w-3.5 h-3.5" />
              <span>Real-World Implementations</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--lit-navy,#0B2545)] tracking-tight">
              Enterprise Use Cases
            </h2>
            <p className="text-base sm:text-lg text-[var(--lit-text-muted,#52677C)] leading-relaxed font-normal">
              Explore how organizations across banking, healthcare, executive leadership, and customer support deploy Voice Shield to secure high-consequence telephone and voice communications.
            </p>
          </div>

          <div className="space-y-6">
            {USE_CASES.map((uc, index) => {
              const Icon = uc.icon;
              return (
                <div
                  key={index}
                  className="rounded-3xl border border-[#DFE7EF] bg-white p-6 sm:p-8 space-y-6 shadow-xs hover:border-[#1FA9A2]/40 transition-all duration-200"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-3.5 rounded-2xl border ${uc.iconColor} shrink-0`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border mb-1 ${uc.badgeColor}`}>
                          {uc.badge}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-bold text-[var(--lit-navy,#0B2545)]">
                          {uc.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-[var(--lit-text-muted,#52677C)] text-sm sm:text-base leading-relaxed font-normal">
                    {uc.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    {uc.capabilities.map((cap, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--lit-navy,#0B2545)] font-normal">
                        <CheckCircle2 className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F7F9FC] border border-[#DFE7EF] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="text-xs font-mono text-[var(--lit-text-muted,#52677C)] uppercase font-semibold">
                      MEASURED SYSTEM IMPACT:
                    </div>
                    <div className="text-xs font-mono font-bold text-[#0E7A74]">
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
        <section id="specifications" className="space-y-8 pt-10 border-t border-[#DFE7EF]">
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[#1FA9A2]/25 bg-[#1FA9A2]/10 text-[#0E7A74] text-xs font-mono font-semibold uppercase tracking-wider shadow-2xs">
              <Terminal className="w-3.5 h-3.5" />
              <span>Verified Specifications</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--lit-navy,#0B2545)] tracking-tight">
              Engineering Benchmarks &amp; System Specs
            </h2>
            <p className="text-sm sm:text-base text-[var(--lit-text-muted,#52677C)] font-normal">
              Deterministic, rigorously evaluated performance metrics for production telephony environments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SPECS.map((s, idx) => (
              <div key={idx} className="p-6 rounded-2xl border border-[#DFE7EF] bg-white space-y-2 shadow-xs">
                <div className="text-xs font-mono text-[var(--lit-text-muted,#52677C)] uppercase tracking-wider font-semibold">
                  {s.label}
                </div>
                <div className="text-2xl font-bold text-[var(--lit-navy,#0B2545)] tracking-tight font-mono">
                  {s.value}
                </div>
                <p className="text-xs text-[var(--lit-text-muted,#52677C)] font-normal leading-relaxed">
                  {s.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 5: CALL TO ACTION & CONSULTATION */}
        {/* ========================================================= */}
        <section className="pt-10 border-t border-[#DFE7EF]">
          <div className="rounded-3xl bg-[var(--lit-navy,#0B2545)] text-white p-8 sm:p-14 text-center space-y-6 relative overflow-hidden shadow-md">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 text-[#45D9D2] text-xs font-mono font-semibold tracking-wider uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Get Ahead of Voice Cloning Threats</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Protect Your Telephony Infrastructure Today
            </h2>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-light">
              Connect with Logic Intelligence Technologies to scope a Voice Shield inline gateway pilot, conduct a voice threat vulnerability assessment, or integrate biometric defenses with your PBX.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/book-consultation"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#1FA9A2] text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-[#45D9D2] transition-colors duration-200 min-h-[48px] shadow-sm"
              >
                <span>Book Technical Scoping Session</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/10 text-white border border-white/20 font-mono text-xs uppercase tracking-wider hover:bg-white/20 transition-colors duration-200 min-h-[48px]"
              >
                <span>Contact Engineering Team</span>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center items-center gap-3 pt-6 border-t border-white/10 text-[11px] font-mono text-slate-400 uppercase">
              <span>Logic Intelligence Technologies</span>
              <span>·</span>
              <span>Sub-15ms Telephony Firewall</span>
              <span>·</span>
              <span>DPDP 2023 &amp; HIPAA Compliant</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
