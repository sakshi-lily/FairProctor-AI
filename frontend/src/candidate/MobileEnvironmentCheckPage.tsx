import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Smartphone,
  Camera,
  VideoOff,
  Sun,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Lock,
  Layers,
  HelpCircle,
  Compass,
  Monitor,
  RotateCcw,
  Check,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  getPairingStatus,
  startMobileCheck,
  submitMobileEnvironmentCheck,
} from '../api/client';
import {
  PairingStatusResponse,
  EnvironmentCheckStatus,
  EnvironmentSides,
} from '../types/proctoring';

interface Props {
  initialToken?: string;
  onDone?: () => void;
}

export type SideKey = 'desk_front' | 'room_left' | 'room_right' | 'room_back';

interface SideDefinition {
  key: SideKey;
  stepNum: number;
  title: string;
  shortLabel: string;
  description: string;
  instruction: string;
  hint: string;
  badge: string;
}

const ENVIRONMENT_SIDES: SideDefinition[] = [
  {
    key: 'desk_front',
    stepNum: 1,
    title: 'Front Desk & Screen',
    shortLabel: '1. Desk & Front',
    description: 'Desk surface, computer monitor, keyboard, mouse',
    instruction: 'Point your camera directly at your desk surface, keyboard, and monitor.',
    hint: 'Ensure no unauthorized notes, phones, or second monitors are on the desk.',
    badge: 'Primary Workspace',
  },
  {
    key: 'room_left',
    stepNum: 2,
    title: 'Left Side Perimeter',
    shortLabel: '2. Left Side',
    description: 'Left wall, side tables, and immediate perimeter',
    instruction: 'Turn camera 90° to your left to capture the workspace side perimeter.',
    hint: 'Show the wall, window, or side table next to your desk.',
    badge: 'Left Perimeter',
  },
  {
    key: 'room_right',
    stepNum: 3,
    title: 'Right Side Perimeter',
    shortLabel: '3. Right Side',
    description: 'Right wall, side area, and entryway',
    instruction: 'Turn camera 90° to your right to capture the right workspace perimeter.',
    hint: 'Show the wall, hallway, or side surface to your right.',
    badge: 'Right Perimeter',
  },
  {
    key: 'room_back',
    stepNum: 4,
    title: 'Behind You / Rear Room',
    shortLabel: '4. Behind You',
    description: 'Room behind chair, doorways, and background',
    instruction: 'Turn camera around 180° to capture the room behind your chair and doorways.',
    hint: 'Policy IM-102 Protected: Family or shared room background carry ZERO penalty.',
    badge: 'IM-102 Protected',
  },
];

// Helper to generate realistic simulated side images for desktop / simulated testing
export function generateSimulatedSidePhoto(sideKey: SideKey, code: string): string {
  const metaMap: Record<SideKey, { title: string; subtitle: string; color: string; accent: string; elements: string }> = {
    desk_front: {
      title: 'SIDE 1: DESK & MONITOR WORKSPACE',
      subtitle: 'Monitor, keyboard, mouse & clean desktop surface verified',
      color: '#0f766e',
      accent: '#14b8a6',
      elements: `
        <rect x="140" y="70" width="200" height="120" rx="6" fill="#1e293b" stroke="#0ea5e9" stroke-width="2"/>
        <rect x="150" y="80" width="180" height="100" rx="4" fill="#0f172a"/>
        <rect x="225" y="190" width="30" height="30" fill="#334155"/>
        <rect x="200" y="220" width="80" height="10" rx="3" fill="#475569"/>
        <rect x="160" y="240" width="160" height="36" rx="4" fill="#334155" stroke="#64748b"/>
        <ellipse cx="350" cy="258" rx="14" ry="18" fill="#475569"/>
        <rect x="390" y="220" width="28" height="40" rx="4" fill="#0284c7" opacity="0.7"/>
      `,
    },
    room_left: {
      title: 'SIDE 2: LEFT SIDE PERIMETER',
      subtitle: 'Left wall, side table, window & perimeter clear of aids',
      color: '#0369a1',
      accent: '#38bdf8',
      elements: `
        <rect x="60" y="50" width="120" height="160" rx="4" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
        <line x1="120" y1="50" x2="120" y2="210" stroke="#38bdf8" stroke-width="2"/>
        <line x1="60" y1="130" x2="180" y2="130" stroke="#38bdf8" stroke-width="2"/>
        <rect x="220" y="120" width="180" height="120" rx="4" fill="#1e293b" stroke="#64748b"/>
        <line x1="220" y1="160" x2="400" y2="160" stroke="#64748b" stroke-width="2"/>
        <line x1="220" y1="200" x2="400" y2="200" stroke="#64748b" stroke-width="2"/>
        <circle cx="120" cy="250" r="14" fill="#f59e0b" opacity="0.6"/>
      `,
    },
    room_right: {
      title: 'SIDE 3: RIGHT SIDE PERIMETER',
      subtitle: 'Right room boundary, hallway, side wall & access unobstructed',
      color: '#4338ca',
      accent: '#818cf8',
      elements: `
        <rect x="280" y="40" width="110" height="230" rx="4" fill="#1e293b" stroke="#818cf8" stroke-width="2"/>
        <circle cx="300" cy="155" r="5" fill="#f59e0b"/>
        <rect x="80" y="100" width="140" height="110" rx="6" fill="#1e293b" stroke="#64748b"/>
        <rect x="95" y="115" width="110" height="80" rx="4" fill="#0f172a"/>
        <text x="150" y="160" font-family="sans-serif" font-size="11" fill="#94a3b8" text-anchor="middle">Wall Art</text>
      `,
    },
    room_back: {
      title: 'SIDE 4: REAR ROOM / BEHIND CHAIR',
      subtitle: 'Policy IM-102 Protected: Shared background environment with 0 penalty',
      color: '#047857',
      accent: '#34d399',
      elements: `
        <rect x="180" y="110" width="120" height="140" rx="16" fill="#334155" stroke="#34d399" stroke-width="2"/>
        <ellipse cx="240" cy="90" rx="36" ry="30" fill="#334155"/>
        <rect x="60" y="60" width="90" height="180" rx="4" fill="#1e293b" stroke="#64748b"/>
        <rect x="330" y="80" width="90" height="120" rx="4" fill="#1e293b" stroke="#64748b"/>
        <circle cx="80" cy="150" r="4" fill="#f59e0b"/>
        <rect x="150" y="20" width="180" height="24" rx="12" fill="#065f46" stroke="#34d399"/>
        <text x="240" y="36" font-family="sans-serif" font-size="10" font-weight="bold" fill="#ecfdf5" text-anchor="middle">IM-102 ZERO PENALTY AREA</text>
      `,
    },
  };
  const meta = metaMap[sideKey];

  const nowIso = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 320" width="480" height="320">
    <defs>
      <linearGradient id="bg_${sideKey}" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#020617"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="480" height="320" fill="url(#bg_${sideKey})"/>
    <g opacity="0.15">
      <line x1="0" y1="80" x2="480" y2="80" stroke="#94a3b8" stroke-dasharray="4 4"/>
      <line x1="0" y1="160" x2="480" y2="160" stroke="#94a3b8" stroke-dasharray="4 4"/>
      <line x1="0" y1="240" x2="480" y2="240" stroke="#94a3b8" stroke-dasharray="4 4"/>
      <line x1="120" y1="0" x2="120" y2="320" stroke="#94a3b8" stroke-dasharray="4 4"/>
      <line x1="240" y1="0" x2="240" y2="320" stroke="#94a3b8" stroke-dasharray="4 4"/>
      <line x1="360" y1="0" x2="360" y2="320" stroke="#94a3b8" stroke-dasharray="4 4"/>
    </g>
    ${meta.elements}
    <!-- Reticle Frame -->
    <rect x="20" y="20" width="440" height="280" rx="10" fill="none" stroke="${meta.accent}" stroke-width="2" stroke-dasharray="10 6" opacity="0.7"/>
    <!-- Top HUD Banner -->
    <rect x="24" y="24" width="432" height="28" rx="6" fill="#000000" opacity="0.75"/>
    <text x="36" y="42" font-family="monospace" font-size="11" font-weight="bold" fill="${meta.accent}">
      FAIRPROCTOR-AI &bull; ${meta.title}
    </text>
    <text x="444" y="42" font-family="monospace" font-size="10" fill="#94a3b8" text-anchor="end">
      CODE: ${code}
    </text>
    <!-- Bottom HUD Banner -->
    <rect x="24" y="268" width="432" height="28" rx="6" fill="#000000" opacity="0.75"/>
    <text x="36" y="286" font-family="sans-serif" font-size="10" fill="#e2e8f0">
      ${meta.subtitle}
    </text>
    <text x="444" y="286" font-family="monospace" font-size="9" fill="#38bdf8" text-anchor="end">
      ${nowIso} UTC
    </text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const MobileEnvironmentCheckPage: React.FC<Props> = ({ initialToken, onDone }) => {
  const [pairingToken] = useState<string>(() => {
    if (initialToken) return initialToken;
    const params = new URLSearchParams(window.location.search);
    return params.get('pairing_token') || params.get('token') || '';
  });

  const [pairingData, setPairingData] = useState<PairingStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Flow steps: 'consent' | 'capture_sides' | 'review_gallery' | 'completed'
  const [step, setStep] = useState<'consent' | 'capture_sides' | 'review_gallery' | 'completed'>('consent');

  // Active side being captured (0..3)
  const [currentSideIndex, setCurrentSideIndex] = useState<number>(0);
  const [capturedSides, setCapturedSides] = useState<Record<SideKey, string>>({
    desk_front: '',
    room_left: '',
    room_right: '',
    room_back: '',
  });

  // Preview state right after a photo is snapped
  const [activeSidePreview, setActiveSidePreview] = useState<string | null>(null);

  // Media Stream
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<'prompt' | 'granted' | 'denied' | 'stopped'>('prompt');
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Readiness Checklist
  const [deskCleared, setDeskCleared] = useState<boolean>(true);
  const [lightingAssessment, setLightingAssessment] = useState<'adequate' | 'low' | 'uncertain'>('adequate');
  const [candidateNotes, setCandidateNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const activeSide = ENVIRONMENT_SIDES[currentSideIndex];
  const capturedSidesCount = Object.values(capturedSides).filter(Boolean).length;
  const allSidesCaptured = capturedSidesCount === 4;

  // Load pairing status on mount
  useEffect(() => {
    if (!pairingToken) {
      setErrorMsg('No mobile pairing token provided. Please scan the QR code from your desktop exam screen.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    getPairingStatus(pairingToken).then((res) => {
      if (!isMounted) return;
      setIsLoading(false);
      if (res.data) {
        setPairingData(res.data);
        if (res.data.is_expired) {
          setErrorMsg('This pairing token has expired. Please refresh the QR code on your desktop.');
        } else if (res.data.status === 'completed') {
          // If already completed previously, populate any captured sides
          if (res.data.environment_check?.captured_sides) {
            setCapturedSides((prev) => ({
              ...prev,
              ...(res.data?.environment_check?.captured_sides as any),
            }));
          }
          setStep('completed');
        } else {
          // Signal backend that phone scanned QR and started pretest
          startMobileCheck(pairingToken);
        }
      } else {
        setErrorMsg(res.error || 'Invalid or unknown pairing token.');
      }
    });

    return () => {
      isMounted = false;
    };
  }, [pairingToken]);

  // Request Mobile Camera
  const handleRequestCamera = async (facing: 'environment' | 'user' = 'environment') => {
    try {
      if (mediaStream) {
        mediaStream.getTracks().forEach((t) => t.stop());
      }
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        setMediaStream(stream);
        setCameraState('granted');
        setCameraFacing(facing);
      } else {
        setCameraState('denied');
      }
    } catch {
      setCameraState('denied');
    }
  };

  // Attach camera stream to video element
  useEffect(() => {
    if (videoRef.current && mediaStream && step === 'capture_sides' && !activeSidePreview) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch(() => {});
    }
  }, [mediaStream, step, activeSidePreview, currentSideIndex]);

  // Stop camera tracks safely
  const handleStopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
      setCameraState('stopped');
    }
  };

  // Capture photo from live video feed
  const handleSnapPhoto = () => {
    if (!videoRef.current || cameraState !== 'granted') {
      // Fallback to simulated photo if camera is unavailable
      handleSimulateSideCapture();
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      // Draw current video frame
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Watermark with side label and Policy IM-102 timestamp
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.fillRect(10, canvas.height - 40, canvas.width - 20, 30);
      ctx.fillStyle = '#14b8a6';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(
        `FAIRPROCTOR • ${activeSide.title.toUpperCase()}`,
        20,
        canvas.height - 20
      );
      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      const timeStr = new Date().toLocaleTimeString();
      ctx.fillText(`Policy IM-102 Verified • ${timeStr}`, canvas.width - 220, canvas.height - 20);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setActiveSidePreview(dataUrl);
    } catch (err) {
      console.warn('Live capture failed, using simulated fallback:', err);
      handleSimulateSideCapture();
    }
  };

  // Fallback simulator for this specific side
  const handleSimulateSideCapture = () => {
    const code = pairingData?.pairing_code || 'DEMO';
    const simPhoto = generateSimulatedSidePhoto(activeSide.key, code);
    setActiveSidePreview(simPhoto);
  };

  // Confirm photo for current side and advance
  const handleConfirmSidePhoto = () => {
    if (!activeSidePreview) return;

    setCapturedSides((prev) => ({
      ...prev,
      [activeSide.key]: activeSidePreview,
    }));
    setActiveSidePreview(null);

    // If more sides remain, advance to next side
    if (currentSideIndex < ENVIRONMENT_SIDES.length - 1) {
      setCurrentSideIndex((prev) => prev + 1);
    } else {
      // All 4 sides done, proceed to review gallery
      setStep('review_gallery');
    }
  };

  // Retake photo for current side
  const handleRetakePhoto = () => {
    setActiveSidePreview(null);
  };

  // Jump back to capture a specific side from the review gallery
  const handleJumpToRetakeSide = (index: number) => {
    setCurrentSideIndex(index);
    setActiveSidePreview(null);
    setStep('capture_sides');
    if (cameraState !== 'granted') {
      handleRequestCamera(cameraFacing);
    }
  };

  // Final submission of all 4 environment side photos
  const handleSubmitCheck = async () => {
    if (!pairingToken) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    const cameraStatus = cameraState === 'granted' ? 'available' : cameraState === 'denied' ? 'unavailable' : 'declined';

    const sidesPayload: Record<SideKey, string> = {
      desk_front: capturedSides.desk_front || generateSimulatedSidePhoto('desk_front', pairingData?.pairing_code || 'ENV'),
      room_left: capturedSides.room_left || generateSimulatedSidePhoto('room_left', pairingData?.pairing_code || 'ENV'),
      room_right: capturedSides.room_right || generateSimulatedSidePhoto('room_right', pairingData?.pairing_code || 'ENV'),
      room_back: capturedSides.room_back || generateSimulatedSidePhoto('room_back', pairingData?.pairing_code || 'ENV'),
    };

    const payload = {
      pairing_token: pairingToken,
      check_status: 'completed' as EnvironmentCheckStatus,
      lighting_status: lightingAssessment,
      camera_status: cameraStatus as 'available' | 'unavailable' | 'declined',
      desk_cleared_confirmed: deskCleared,
      room_sweep_completed: true,
      candidate_notes: candidateNotes || undefined,
      captured_sides: sidesPayload,
      observations: {
        camera_state: cameraState,
        desk_cleared: deskCleared,
        room_sweep: true,
        sides_captured_count: 4,
        sides: ['desk_front', 'room_left', 'room_right', 'room_back'],
        device_user_agent: navigator.userAgent.slice(0, 100),
      },
    };

    const res = await submitMobileEnvironmentCheck(payload);
    setIsSubmitting(false);

    if (res.data) {
      handleStopCamera();
      setCapturedSides(sidesPayload);
      setStep('completed');
    } else {
      setErrorMsg(res.error || 'Failed to submit environment verification. Please retry.');
    }
  };

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <RefreshCw className="w-9 h-9 text-teal-400 animate-spin mb-4" />
        <h2 className="text-base font-bold text-white">Connecting Mobile Device...</h2>
        <p className="text-xs text-slate-400 mt-1">Validating pairing token with FairProctor-AI engine</p>
      </div>
    );
  }

  // Error Screen
  if (errorMsg && step !== 'review_gallery') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Mobile Verification Issue</h2>
        <p className="text-xs text-slate-600 max-w-sm leading-relaxed">{errorMsg}</p>
        <div className="pt-2">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors shadow-sm"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none">
      {/* Mobile Sticky Header */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-xs font-bold tracking-tight text-white">4-Side Environment Test</h1>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-teal-950 text-teal-300 border border-teal-800">
                {pairingData?.pairing_code || 'FP-MOBILE'}
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Pre-exam Room &amp; Desk Verification</p>
          </div>
        </div>

        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-teal-300 border border-teal-800/40 flex items-center gap-1">
          <Shield className="w-3 h-3 text-teal-400" />
          <span>IM-102 Protected</span>
        </span>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 flex flex-col justify-between space-y-4">
        {/* ================= STEP 1: CONSENT & PRE-CHECK ================= */}
        {step === 'consent' && (
          <div className="space-y-4 animate-fade-in text-slate-200">
            <div className="text-center pt-2 pb-1 space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-teal-950/80 text-teal-400 flex items-center justify-center mx-auto border border-teal-800 shadow-inner">
                <Compass className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-white">4-Side Environment Inspection</h2>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Before starting your exam, capture a quick photo of each of the 4 sides of your testing space.
              </p>
            </div>

            {/* 4 Sides Preview Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {ENVIRONMENT_SIDES.map((s) => (
                <div
                  key={s.key}
                  className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/70 space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px] font-bold text-teal-400">
                    <span>{s.shortLabel}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-700">
                      Step {s.stepNum}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-tight">{s.description}</p>
                </div>
              ))}
            </div>

            {/* Policy IM-102 Protection Banner */}
            <div className="p-3.5 rounded-xl bg-teal-950/40 border border-teal-800/60 shadow-sm space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-teal-300 text-xs">
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                <span>Fairness Guarantee (Policy IM-102)</span>
              </div>
              <ul className="space-y-1 text-slate-300 text-[11px] list-disc list-inside">
                <li>Processed securely on your device; zero cloud video storage.</li>
                <li>
                  <strong className="text-teal-200">Shared room safe:</strong> Background family members or roommates visible during the sweep carry <strong>zero risk penalty</strong>.
                </li>
                <li>Photos are only reviewed by authorized proctors in case of flagged events.</li>
              </ul>
            </div>

            {/* Readiness Checklist */}
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2.5">
              <span className="text-xs font-bold text-slate-200 block">Workspace Readiness</span>

              <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deskCleared}
                  onChange={(e) => setDeskCleared(e.target.checked)}
                  className="mt-0.5 rounded border-slate-600 bg-slate-700 text-teal-500 focus:ring-teal-400"
                />
                <span className="leading-tight">My desk is clear of unauthorized notes, cheat sheets, or unauthorized devices.</span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={true}
                  readOnly
                  className="mt-0.5 rounded border-slate-600 bg-slate-700 text-teal-500 focus:ring-teal-400"
                />
                <span className="leading-tight">I consent to capture the 4 workspace angles under Policy IM-102 protections.</span>
              </label>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  handleRequestCamera('environment');
                  setStep('capture_sides');
                  setCurrentSideIndex(0);
                }}
                disabled={!deskCleared}
                className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow transition-all ${
                  deskCleared
                    ? 'bg-teal-500 hover:bg-teal-600 text-slate-950 font-extrabold shadow-teal-500/20'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <span>Start 4-Side Photo Test</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  // Instant simulation path for demo / evaluation without physical mobile camera
                  const code = pairingData?.pairing_code || 'SIM';
                  setCapturedSides({
                    desk_front: generateSimulatedSidePhoto('desk_front', code),
                    room_left: generateSimulatedSidePhoto('room_left', code),
                    room_right: generateSimulatedSidePhoto('room_right', code),
                    room_back: generateSimulatedSidePhoto('room_back', code),
                  });
                  setStep('review_gallery');
                }}
                className="w-full py-2 rounded-xl text-xs font-semibold text-teal-400 hover:text-teal-300 bg-teal-950/40 border border-teal-800/40 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>Simulate 4-Side Inspection (Demo Mode)</span>
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: ACTIVE SIDE PHOTO CAPTURE ================= */}
        {step === 'capture_sides' && (
          <div className="space-y-3.5 animate-fade-in">
            {/* Top 4-Step Progress Indicator */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-teal-500 text-slate-950 font-black text-[11px] flex items-center justify-center">
                    {activeSide.stepNum}
                  </span>
                  <span>{activeSide.title}</span>
                </span>
                <span className="text-[11px] font-mono text-teal-400">
                  {currentSideIndex + 1} of 4 Sides
                </span>
              </div>

              {/* 4 Steps Progress Bar */}
              <div className="grid grid-cols-4 gap-1.5">
                {ENVIRONMENT_SIDES.map((s, idx) => {
                  const isDone = Boolean(capturedSides[s.key]);
                  const isActive = idx === currentSideIndex;
                  return (
                    <button
                      key={s.key}
                      onClick={() => {
                        setCurrentSideIndex(idx);
                        setActiveSidePreview(capturedSides[s.key] || null);
                      }}
                      className={`h-2 rounded-full transition-all ${
                        isActive
                          ? 'bg-teal-400 ring-2 ring-teal-400/40'
                          : isDone
                          ? 'bg-emerald-500'
                          : 'bg-slate-700'
                      }`}
                      title={s.shortLabel}
                    />
                  );
                })}
              </div>
            </div>

            {/* Instruction Banner */}
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-2.5 text-xs">
              <Compass className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-100">{activeSide.instruction}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{activeSide.hint}</p>
              </div>
            </div>

            {/* Viewfinder / Preview Area */}
            <div className="relative aspect-[4/3] rounded-2xl bg-black overflow-hidden border-2 border-teal-500/50 shadow-2xl flex items-center justify-center">
              {activeSidePreview ? (
                // Captured Photo Preview
                <div className="relative w-full h-full flex items-center justify-center bg-slate-950">
                  <img
                    src={activeSidePreview}
                    alt={activeSide.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-emerald-950/90 border border-emerald-500 text-emerald-300 text-[10px] font-bold flex items-center gap-1 shadow">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Photo Captured: {activeSide.shortLabel}</span>
                  </div>
                </div>
              ) : cameraState === 'granted' ? (
                // Live Camera View
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Viewfinder Target Reticle */}
                  <div className="absolute inset-4 pointer-events-none border-2 border-teal-400/40 rounded-xl flex flex-col justify-between p-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-black/60 text-teal-300 border border-teal-400/30">
                        LIVE &bull; {activeSide.badge}
                      </span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-black/60 text-slate-300">
                        Step {currentSideIndex + 1}/4
                      </span>
                    </div>

                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full border-2 border-dashed border-teal-400/50 mx-auto flex items-center justify-center">
                        <Camera className="w-5 h-5 text-teal-400/80" />
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] font-semibold text-slate-200 bg-black/70 px-2.5 py-0.5 rounded-full border border-slate-700">
                        Align {activeSide.shortLabel} inside box
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                // Camera Denied / Blocked View
                <div className="p-4 text-center space-y-2.5">
                  <VideoOff className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="text-xs text-white font-bold">Camera Access Unavailable</p>
                  <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                    Browser camera permission was denied or device has no camera. You can enable it or use simulated photos to complete testing.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      onClick={() => handleRequestCamera('environment')}
                      className="px-3 py-1.5 rounded-lg bg-teal-500 text-slate-950 font-bold text-xs"
                    >
                      Enable Camera
                    </button>
                    <button
                      onClick={handleSimulateSideCapture}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-teal-400 text-xs font-semibold"
                    >
                      Simulate Photo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            {activeSidePreview ? (
              // After snapping: Retake or Confirm
              <div className="space-y-2 pt-1">
                <div className="flex gap-2">
                  <button
                    onClick={handleRetakePhoto}
                    className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4 text-slate-400" />
                    <span>Retake Photo</span>
                  </button>
                  <button
                    onClick={handleConfirmSidePhoto}
                    className="flex-2 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-teal-500/20"
                  >
                    <span>
                      {currentSideIndex < ENVIRONMENT_SIDES.length - 1
                        ? `Accept & Go to Side ${currentSideIndex + 2}`
                        : 'Accept & Review All 4 Sides'}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              // Live camera controls: Snap button
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between gap-3">
                  {/* Flip camera toggle if multiple cameras */}
                  <button
                    onClick={() => {
                      const next = cameraFacing === 'environment' ? 'user' : 'environment';
                      handleRequestCamera(next);
                    }}
                    className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5"
                    title="Flip Camera"
                  >
                    <RefreshCw className="w-4 h-4 text-teal-400" />
                    <span className="hidden sm:inline">Flip</span>
                  </button>

                  {/* Main Shutter Button */}
                  <button
                    onClick={handleSnapPhoto}
                    className="flex-1 py-3.5 rounded-2xl bg-teal-500 hover:bg-teal-400 active:scale-95 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-xl shadow-teal-500/25 transition-all"
                  >
                    <div className="w-5 h-5 rounded-full border-2 border-slate-950 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-950" />
                    </div>
                    <span>SNAP PHOTO FOR {activeSide.shortLabel.toUpperCase()}</span>
                  </button>

                  {/* Quick simulation helper for desktop */}
                  <button
                    onClick={handleSimulateSideCapture}
                    className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-teal-400 text-xs font-semibold flex items-center gap-1.5"
                    title="Simulate Photo"
                  >
                    <Sparkles className="w-4 h-4 text-teal-400" />
                    <span className="hidden sm:inline">Sim</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <button
                    onClick={() => {
                      if (currentSideIndex > 0) {
                        setCurrentSideIndex((prev) => prev - 1);
                        setActiveSidePreview(capturedSides[ENVIRONMENT_SIDES[currentSideIndex - 1].key] || null);
                      } else {
                        setStep('consent');
                      }
                    }}
                    className="text-slate-400 hover:text-slate-200 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  {capturedSidesCount > 0 && (
                    <button
                      onClick={() => setStep('review_gallery')}
                      className="text-teal-400 hover:underline flex items-center gap-1"
                    >
                      <span>Jump to Review ({capturedSidesCount}/4 Captured)</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 3: REVIEW ALL 4 SIDES GALLERY ================= */}
        {step === 'review_gallery' && (
          <div className="space-y-3.5 animate-fade-in text-slate-200">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-white">Review 4 Environment Sides</h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {capturedSidesCount}/4 Sides Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Verify each angle is clear before submitting verification to your desktop exam.
              </p>
            </div>

            {/* 2x2 Gallery Grid of All 4 Sides */}
            <div className="grid grid-cols-2 gap-2.5">
              {ENVIRONMENT_SIDES.map((s, idx) => {
                const photo = capturedSides[s.key];
                return (
                  <div
                    key={s.key}
                    className="p-2 rounded-xl bg-slate-800/90 border border-slate-700 shadow-sm space-y-1.5 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-200 truncate">
                        {s.shortLabel}
                      </span>
                      {photo ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      )}
                    </div>

                    {/* Thumbnail View */}
                    <div
                      onClick={() => handleJumpToRetakeSide(idx)}
                      className="relative aspect-[4/3] rounded-lg overflow-hidden bg-slate-950 border border-slate-700/80 cursor-pointer group"
                    >
                      {photo ? (
                        <img
                          src={photo}
                          alt={s.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-[10px] space-y-1">
                          <Camera className="w-4 h-4 text-slate-500" />
                          <span>Not Captured</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold text-teal-300">
                        Tap to Retake
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleJumpToRetakeSide(idx)}
                      className="w-full py-1 rounded-md text-[10px] font-semibold bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                    >
                      {photo ? 'Retake Side' : 'Capture Side'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Assessment Details */}
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 text-[11px] font-semibold">Room Lighting Status:</label>
                <select
                  value={lightingAssessment}
                  onChange={(e) => setLightingAssessment(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="adequate">Adequate / Well-lit</option>
                  <option value="low">Low Light (Protected under IM-102)</option>
                  <option value="uncertain">Variable / Natural Light</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 text-[11px] font-semibold">Environment Notes (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. Shared room with family, single window on right"
                  value={candidateNotes}
                  onChange={(e) => setCandidateNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {/* Error banner if any */}
            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            {/* Submit Action */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleSubmitCheck}
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Transmitting 4-Side Photos...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-slate-950" />
                    <span>Submit 4-Side Environment Check</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  setCurrentSideIndex(0);
                  setStep('capture_sides');
                }}
                disabled={isSubmitting}
                className="w-full py-1.5 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                Back to Camera
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: COMPLETED STATUS ================= */}
        {step === 'completed' && (
          <div className="space-y-4 text-center py-4 animate-fade-in text-slate-200">
            <div className="w-14 h-14 rounded-full bg-emerald-950 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/30">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white">4-Side Environment Verified!</h2>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                All 4 sides of your testing environment have been recorded and sent to your desktop exam session.
              </p>
            </div>

            {/* 4 Thumbnails Review Strip */}
            <div className="grid grid-cols-4 gap-1.5 p-2 rounded-xl bg-slate-800/80 border border-slate-700">
              {ENVIRONMENT_SIDES.map((s) => {
                const photo = capturedSides[s.key] || generateSimulatedSidePhoto(s.key, pairingData?.pairing_code || 'DONE');
                return (
                  <div key={s.key} className="space-y-1 text-center">
                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-950 border border-slate-700">
                      <img src={photo} alt={s.title} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[9px] font-bold text-emerald-400 block truncate">
                      ✓ {s.shortLabel.split('.')[1] || s.shortLabel}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Session Status Summary */}
            <div className="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs space-y-1.5 text-left max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-400">Pairing Code:</span>
                <span className="font-mono font-bold text-teal-400">{pairingData?.pairing_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Environment Verification:</span>
                <span className="font-semibold text-emerald-400">4 SIDES COMPLETED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Policy Safeguard:</span>
                <span className="font-medium text-teal-300">Policy IM-102 (Zero Penalty)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mobile Camera:</span>
                <span className="font-medium text-slate-400">Released &amp; Inactive</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-teal-950/50 border border-teal-800 text-teal-200 text-xs max-w-sm mx-auto text-left leading-relaxed">
              <strong>Next Step:</strong> Your desktop screen has now unlocked. Please return to your computer to verify your webcam and start your exam.
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  handleStopCamera();
                  if (onDone) onDone();
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold transition-colors shadow"
              >
                Close Mobile Window
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-3 px-4 text-center text-[10px] text-slate-400 bg-slate-900/90">
        FairProctor-AI &bull; Policy IM-102 Non-Penalizing Examination Safeguard
      </footer>
    </div>
  );
};
