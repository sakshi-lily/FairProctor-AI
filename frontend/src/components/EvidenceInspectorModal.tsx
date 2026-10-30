import React, { useState } from 'react';
import {
  X,
  Shield,
  Clock,
  Layers,
  AlertCircle,
  FileText,
  Code,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  BarChart2,
  Camera,
  Download,
} from 'lucide-react';
import { EvidenceItem } from '../types/proctoring';

interface Props {
  evidence: EvidenceItem | null;
  onClose: () => void;
  allEvidence?: EvidenceItem[];
  onSelectEvidence?: (evidence: EvidenceItem) => void;
}

// Transparent vector illustration cutout of a candidate holding a mobile phone (Static Image Evidence)
const CandidateImageEvidenceCutout: React.FC<{
  timestampBadge: string;
  detectionLabel: string;
  isDetected?: boolean;
}> = ({ timestampBadge, detectionLabel, isDetected = true }) => {
  return (
    <div className="relative w-full h-full min-h-[300px] bg-gradient-to-b from-slate-100 to-slate-200/90 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200/80 shadow-inner select-none">
      {/* Background Room / Exam Desk Context */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
        viewBox="0 0 400 340"
        preserveAspectRatio="xMidYMid slice"
      >
        <rect x="0" y="0" width="400" height="340" fill="#F1F5F9" />
        <circle cx="200" cy="120" r="160" fill="#FFFFFF" opacity="0.6" />
        <line x1="330" y1="0" x2="330" y2="280" stroke="#E2E8F0" strokeWidth="2" />
        <rect x="0" y="270" width="400" height="70" fill="#E2E8F0" opacity="0.5" />
      </svg>

      {/* Main Transparent Vector Character Cutout (Flat Silhouette / Vector Art - No Photo Faces) */}
      <svg
        className="relative z-10 w-full h-full max-h-[330px]"
        viewBox="0 0 400 340"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="imgHairGrad" x1="200" y1="40" x2="200" y2="200" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E293B" />
            <stop offset="1" stopColor="#0F172A" />
          </linearGradient>

          <linearGradient id="imgSkinGrad" x1="160" y1="80" x2="240" y2="240" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F8D3C0" />
            <stop offset="1" stopColor="#E2A98C" />
          </linearGradient>

          <linearGradient id="imgClothGrad" x1="200" y1="180" x2="200" y2="340" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F1EDE4" />
            <stop offset="1" stopColor="#D5CBB9" />
          </linearGradient>

          <linearGradient id="imgPhoneGrad" x1="180" y1="165" x2="240" y2="255" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E293B" />
            <stop offset="1" stopColor="#090D16" />
          </linearGradient>

          <filter id="imgShadowRed" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#E11D48" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Ergonomic Office Chair Headrest & Back */}
        <ellipse cx="200" cy="115" rx="78" ry="85" fill="#334155" opacity="0.85" />
        <path d="M135 150 Q200 135 265 150 L275 290 L125 290 Z" fill="#1E293B" opacity="0.9" />

        {/* Candidate Upper Torso / Shoulders */}
        <path
          d="M100 320 C100 245 138 215 168 205 L200 220 L232 205 C262 215 300 245 300 320 Z"
          fill="url(#imgClothGrad)"
        />

        {/* Neck */}
        <path d="M185 160 L185 210 L215 210 L215 160 Z" fill="url(#imgSkinGrad)" opacity="0.95" />

        {/* Hair Strands */}
        <path
          d="M142 105 C135 145 140 225 150 245 C158 248 168 240 162 215 C158 190 152 145 160 115 Z"
          fill="url(#imgHairGrad)"
        />
        <path
          d="M258 105 C265 145 260 225 250 245 C242 248 232 240 238 215 C242 190 248 145 240 115 Z"
          fill="url(#imgHairGrad)"
        />

        {/* Head & Face Contour (Angled Downward Toward Object) */}
        <ellipse cx="200" cy="120" rx="46" ry="54" fill="url(#imgSkinGrad)" />

        {/* Minimalist Facial Silhouette */}
        <path d="M174 108 Q186 104 195 109" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M205 109 Q214 104 226 108" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M178 116 Q186 122 193 118" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
        <path d="M207 118 Q214 122 222 116" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
        <path d="M200 118 L198 132 L204 133" stroke="#D09276" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M192 144 Q200 146 208 144" stroke="#B87358" strokeWidth="2" strokeLinecap="round" />

        {/* Main Hair Silhouette */}
        <path
          d="M152 110 C146 65 170 42 200 42 C230 42 254 65 248 110 C242 90 234 78 220 74 C205 70 195 70 180 74 C166 78 158 90 152 110 Z"
          fill="url(#imgHairGrad)"
        />
        <path
          d="M154 95 C150 130 152 170 158 190 C162 175 164 150 162 120 Z"
          fill="url(#imgHairGrad)"
        />
        <path
          d="M246 95 C250 130 248 170 242 190 C238 175 236 150 238 120 Z"
          fill="url(#imgHairGrad)"
        />

        {/* Arms & Hands Holding the Device */}
        <path d="M142 250 Q168 220 192 205 L198 228 Q174 246 156 270 Z" fill="url(#imgClothGrad)" />
        <path d="M258 250 Q232 220 208 205 L202 228 Q226 246 244 270 Z" fill="url(#imgClothGrad)" />

        <ellipse cx="184" cy="226" rx="8" ry="14" fill="url(#imgSkinGrad)" />
        <ellipse cx="184" cy="214" rx="7" ry="12" fill="url(#imgSkinGrad)" />

        {/* Handheld Device */}
        <g transform="rotate(-6 210 215)">
          <rect x="188" y="166" width="46" height="88" rx="7" fill="url(#imgPhoneGrad)" stroke="#334155" strokeWidth="1.5" />
          <rect x="191" y="171" width="40" height="78" rx="4" fill="#0F172A" />
          <path d="M192 172 L230 172 L206 248 L192 248 Z" fill="#38BDF8" opacity="0.08" />
          <circle cx="211" cy="176" r="2.2" fill="#334155" />
        </g>

        <ellipse cx="230" cy="228" rx="9" ry="14" fill="url(#imgSkinGrad)" />
        <ellipse cx="232" cy="216" rx="8" ry="12" fill="url(#imgSkinGrad)" />

        {/* Exam Desk Foreground */}
        <rect x="0" y="305" width="400" height="35" fill="#E2E8F0" />
        <line x1="0" y1="305" x2="400" y2="305" stroke="#CBD5E1" strokeWidth="1.5" />

        {/* Red AI Detection Bounding Box Around Object */}
        {isDetected && (
          <g>
            <rect
              x="170"
              y="152"
              width="82"
              height="106"
              rx="6"
              fill="#EF4444"
              fillOpacity="0.08"
              stroke="#EF4444"
              strokeWidth="2.5"
            />

            {/* Corner Crosshairs */}
            <path d="M170 164 L170 152 L182 152" stroke="#EF4444" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M240 152 L252 152 L252 164" stroke="#EF4444" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M170 246 L170 258 L182 258" stroke="#EF4444" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M240 258 L252 258 L252 246" stroke="#EF4444" strokeWidth="3" fill="none" strokeLinecap="round" />

            {/* Red Detection Label */}
            <g filter="url(#imgShadowRed)">
              <rect x="180" y="141" width="134" height="22" rx="4" fill="#E11D48" />
              <text
                x="247"
                y="156"
                fill="#FFFFFF"
                fontSize="10"
                fontFamily="sans-serif"
                fontWeight="700"
                textAnchor="middle"
                letterSpacing="0.2"
              >
                {detectionLabel}
              </text>
            </g>
          </g>
        )}
      </svg>

      {/* Timestamp Badge (Top-Left Pill, e.g. 319s) */}
      <div className="absolute top-3.5 left-3.5 z-20 bg-slate-900/85 backdrop-blur-xs text-white text-xs font-mono font-bold px-2.5 py-1 rounded-md shadow-sm border border-slate-700/50">
        {timestampBadge}
      </div>
    </div>
  );
};

export const EvidenceInspectorModal: React.FC<Props> = ({
  evidence,
  onClose,
  allEvidence = [],
  onSelectEvidence,
}) => {
  const [copied, setCopied] = useState(false);

  if (!evidence) return null;

  // Extract navigation between evidence items
  const currentEvidenceIndex = allEvidence.findIndex(
    (item) => item.timestamp_or_interval === evidence.timestamp_or_interval && item.source === evidence.source
  );
  const hasPrevious = currentEvidenceIndex > 0;
  const hasNext = currentEvidenceIndex >= 0 && currentEvidenceIndex < allEvidence.length - 1;

  const handlePrevEvidence = () => {
    if (hasPrevious && onSelectEvidence) {
      onSelectEvidence(allEvidence[currentEvidenceIndex - 1]);
    }
  };

  const handleNextEvidence = () => {
    if (hasNext && onSelectEvidence) {
      onSelectEvidence(allEvidence[currentEvidenceIndex + 1]);
    }
  };

  // Dynamic raw signal data
  const rawSignalData = evidence.observed_value || {
    device_type: 'mobile_phone',
    consecutive_frames: 24,
    start_time_sec: 315,
    end_time_sec: 345,
    confidence: 0.92,
  };

  const handleCopyRawData = () => {
    navigator.clipboard.writeText(JSON.stringify(rawSignalData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Derive compact image metadata
  const captureTime =
    rawSignalData.capture_time_sec
      ? `${rawSignalData.capture_time_sec}s`
      : rawSignalData.start_time_sec
      ? `${rawSignalData.start_time_sec + 4}s`
      : evidence.timestamp_or_interval.match(/\d+s?/)?.[0] || '319s';

  const detectionName =
    rawSignalData.device_type === 'mobile_phone'
      ? 'Mobile Phone'
      : rawSignalData.device_type
      ? String(rawSignalData.device_type).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : evidence.observation_type
      ? String(evidence.observation_type).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Mobile Phone';

  const confidenceValue =
    typeof rawSignalData.confidence === 'number'
      ? rawSignalData.confidence
      : typeof evidence.contribution_score === 'number'
      ? 0.92
      : 0.92;

  const confidencePct = Math.round(confidenceValue <= 1 ? confidenceValue * 100 : confidenceValue);

  // Dynamic source label (reflects actual backend data without hardcoding)
  const sourceLabel = evidence.source || 'video_cv';
  const sourceSubtitle = sourceLabel.includes('image') ? 'Image Capture' : 'Sensor Snapshot';

  // Highlight key terms in explanation
  const renderHighlightedExplanation = (text: string) => {
    const defaultText =
      "Visual model v2.0.0 confirmed a handheld phone in the candidate's primary visual field over 24 consecutive frames.";
    const targetText = text || defaultText;

    if (targetText.toLowerCase().includes('handheld phone')) {
      const parts = targetText.split(/handheld phone/i);
      return (
        <span>
          {parts[0]}
          <span className="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">
            handheld phone
          </span>
          {parts[1]}
        </span>
      );
    }

    if (targetText.toLowerCase().includes('phone')) {
      const parts = targetText.split(/phone/i);
      return (
        <span>
          {parts[0]}
          <span className="bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded font-bold">
            phone
          </span>
          {parts[1]}
        </span>
      );
    }

    return <span>{targetText}</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Top Title & Close) */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/70 flex items-center justify-center text-teal-600 shadow-2xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Evidence Details
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Telemetry signal, AI analysis and explanation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Close modal (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body (2 Columns) */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Single Static Image Evidence Preview & Metadata (5 Cols) */}
            <div className="lg:col-span-5 space-y-3 flex flex-col">
              {/* Captured Evidence Frame Image */}
              <div className="relative h-[320px] sm:h-[340px] w-full rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs group bg-slate-950 flex items-center justify-center">
                {evidence.captured_frame ? (
                  <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                    <img
                      src={evidence.captured_frame}
                      alt="Captured Proctoring Evidence Frame"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <a
                        href={evidence.captured_frame}
                        download={`fairproctor_evidence_${captureTime.replace(/\s+/g, '_')}.jpg`}
                        className="px-2.5 py-1 rounded-lg bg-slate-900/85 hover:bg-slate-900 text-white text-[10px] font-semibold border border-slate-700/80 backdrop-blur-xs flex items-center gap-1 shadow-xs transition-colors"
                        title="Download captured evidence frame"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="w-3 h-3 text-teal-400" />
                        <span>Download Frame</span>
                      </a>
                    </div>
                    {/* Live Snapshot Badge */}
                    <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-900/85 border border-slate-700/80 text-[10px] font-mono text-teal-400 backdrop-blur-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                      <span>HD Frame Verified</span>
                    </div>
                  </div>
                ) : (
                  <CandidateImageEvidenceCutout
                    timestampBadge={captureTime}
                    detectionLabel={`${detectionName} Detected`}
                    isDetected={true}
                  />
                )}
              </div>

              {/* Detected Objects Bounding Box Tag Ribbon */}
              {evidence.bounding_boxes && evidence.bounding_boxes.length > 0 && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-wrap gap-1.5 items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                    Detected:
                  </span>
                  {evidence.bounding_boxes.map((b, bi) => (
                    <span
                      key={bi}
                      className="px-2 py-0.5 rounded-md text-[10px] font-semibold border"
                      style={{
                        borderColor: b.color || '#10b981',
                        color: b.color || '#10b981',
                        backgroundColor: `${b.color || '#10b981'}15`,
                      }}
                    >
                      {b.label}
                    </span>
                  ))}
                </div>
              )}

              {/* Compact Image Evidence Information */}
              <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Evidence Type */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Evidence Type
                    </span>
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <Camera className="w-3.5 h-3.5 text-teal-600" />
                      <span>Image Capture</span>
                    </span>
                  </div>

                  {/* Capture Time */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Capture Time
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-teal-600" />
                      <span>{captureTime}</span>
                    </span>
                  </div>

                  {/* Detection */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Detection
                    </span>
                    <span className="text-xs font-bold text-rose-600 flex items-center gap-1.5 mt-0.5 truncate">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                      <span className="truncate">{detectionName}</span>
                    </span>
                  </div>

                  {/* Confidence */}
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Confidence
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                      <span>{confidencePct}%</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Evidence Summary & Explanations (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Row of 4 Summary Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* 1. TIMING */}
                <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-teal-600 mb-1">
                    <div className="w-5 h-5 rounded-full bg-teal-50 flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Timing
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block font-mono">
                      {evidence.timestamp_or_interval || 't = 315s - 345s'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      (30 seconds)
                    </span>
                  </div>
                </div>

                {/* 2. SOURCE */}
                <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-blue-600 mb-1">
                    <div className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Source
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block font-mono">
                      {sourceLabel}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {sourceSubtitle}
                    </span>
                  </div>
                </div>

                {/* 3. SEVERITY */}
                <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-rose-600 mb-1">
                    <div className="w-5 h-5 rounded-full bg-rose-50 flex items-center justify-center">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Severity
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-rose-600 block">
                      {evidence.severity || 'HIGH'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Policy Violation
                    </span>
                  </div>
                </div>

                {/* 4. WEIGHT */}
                <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-teal-600 mb-1">
                    <div className="w-5 h-5 rounded-full bg-teal-50 flex items-center justify-center">
                      <BarChart2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Weight
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {Math.round((evidence.contribution_score || 0.62) * 100)}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Contribution to score
                    </span>
                  </div>
                </div>
              </div>

              {/* AI ANALYSIS & EXPLANATION */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-teal-700">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    AI Analysis &amp; Explanation
                  </h3>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                  {renderHighlightedExplanation(evidence.explanation)}
                </div>
              </div>

              {/* POLICY RULE */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-teal-700">
                  <Shield className="w-4 h-4 text-teal-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Policy Rule
                  </h3>
                </div>
                <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-100 text-xs space-y-1">
                  <h4 className="font-bold text-slate-900 text-xs">
                    Standard Exam Security Policy
                  </h4>
                  <p className="font-semibold text-slate-700 text-[11px]">
                    Unauthorized Electronic Devices
                  </p>
                  <p className="text-slate-500 text-[11px] leading-normal pt-0.5">
                    Use of mobile phones or any external electronic device during the exam is not allowed.
                  </p>
                </div>
              </div>

              {/* RAW SIGNAL DATA */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-blue-700">
                  <Code className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Raw Signal Data
                  </h3>
                </div>
                <div className="relative rounded-2xl bg-slate-50/90 border border-slate-200/90 p-3.5">
                  <button
                    type="button"
                    onClick={handleCopyRawData}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition-colors shadow-2xs"
                    title="Copy JSON raw data"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <pre className="font-mono text-[11px] text-slate-700 overflow-x-auto leading-relaxed">
                    {JSON.stringify(rawSignalData, null, 2)}
                  </pre>
                </div>
              </div>

              {/* SENSOR LIMITATION */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900 text-xs mb-0.5">
                    Sensor Limitation
                  </h4>
                  <p className="text-amber-800 text-[11px] leading-relaxed">
                    {evidence.data_quality_limitations ||
                      'Candidate hand partially occludes bottom edge of screen, which may affect full device visibility.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (Progress & Actions) */}
        <div className="px-6 py-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
          {/* Left: Event Confidence Progress Bar */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">
              Event Confidence
            </span>
            <div className="w-36 sm:w-48 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${confidencePct}%` }}
              />
            </div>
            <span className="text-xs font-extrabold text-slate-900 font-mono">
              {confidencePct}%
            </span>
          </div>

          {/* Right: Previous, Next, and Close Buttons */}
          <div className="flex items-center gap-2.5 self-end sm:self-auto">
            <button
              type="button"
              onClick={handlePrevEvidence}
              disabled={!hasPrevious}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1 shadow-2xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous Evidence</span>
            </button>

            <button
              type="button"
              onClick={handleNextEvidence}
              disabled={!hasNext}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-1 shadow-2xs"
            >
              <span>Next Evidence</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Prominent Pink Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white transition-colors shadow-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
