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
  Eye,
  RefreshCw,
  Lock,
  Layers,
  HelpCircle,
  Compass,
} from 'lucide-react';
import {
  getPairingStatus,
  startMobileCheck,
  submitMobileEnvironmentCheck,
} from '../api/client';
import {
  PairingStatusResponse,
  EnvironmentCheckStatus,
} from '../types/proctoring';

interface Props {
  initialToken?: string;
  onDone?: () => void;
}

export const MobileEnvironmentCheckPage: React.FC<Props> = ({ initialToken, onDone }) => {
  const [pairingToken, setPairingToken] = useState<string>(() => {
    if (initialToken) return initialToken;
    const params = new URLSearchParams(window.location.search);
    return params.get('pairing_token') || params.get('token') || '';
  });

  const [pairingData, setPairingData] = useState<PairingStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Mobile Guided Flow Steps: 'consent' | 'camera_scan' | 'confirm_submit' | 'completed'
  const [step, setStep] = useState<'consent' | 'camera_scan' | 'confirm_submit' | 'completed'>('consent');

  // Media Stream
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<'prompt' | 'granted' | 'denied' | 'stopped'>('prompt');
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Checklist states
  const [deskCleared, setDeskCleared] = useState<boolean>(true);
  const [roomSweepDone, setRoomSweepDone] = useState<boolean>(false);
  const [lightingAssessment, setLightingAssessment] = useState<'adequate' | 'low' | 'uncertain'>('adequate');
  const [checkStatusChoice, setCheckStatusChoice] = useState<EnvironmentCheckStatus>('completed');
  const [candidateNotes, setCandidateNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load pairing status
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
          setStep('completed');
        } else {
          // Transition backend state to in_progress upon scan
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

  // Attach camera stream to video element
  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.play().catch(() => {});
    }
  }, [mediaStream, step]);

  // Request Mobile Camera
  const handleRequestCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        setMediaStream(stream);
        setCameraState('granted');
        setCheckStatusChoice('completed');
      } else {
        setCameraState('denied');
        setCheckStatusChoice('camera_unavailable');
      }
    } catch {
      setCameraState('denied');
      setCheckStatusChoice('camera_unavailable');
    }
  };

  // Stop camera tracks safely
  const handleStopCamera = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
      setCameraState('stopped');
    }
  };

  // Submit Environment Verification
  const handleSubmitCheck = async () => {
    if (!pairingToken) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    const cameraStatus = cameraState === 'granted' ? 'available' : cameraState === 'denied' ? 'unavailable' : 'declined';

    const payload = {
      pairing_token: pairingToken,
      check_status: checkStatusChoice,
      lighting_status: lightingAssessment,
      camera_status: cameraStatus as 'available' | 'unavailable' | 'declined',
      desk_cleared_confirmed: deskCleared,
      room_sweep_completed: roomSweepDone,
      candidate_notes: candidateNotes || undefined,
      observations: {
        camera_state: cameraState,
        desk_cleared: deskCleared,
        room_sweep: roomSweepDone,
        device_user_agent: navigator.userAgent.slice(0, 100),
      },
    };

    const res = await submitMobileEnvironmentCheck(payload);
    setIsSubmitting(false);

    if (res.data) {
      handleStopCamera();
      setStep('completed');
    } else {
      setErrorMsg(res.error || 'Failed to submit environment check. Please retry.');
    }
  };

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-6 text-center">
        <RefreshCw className="w-8 h-8 text-teal-600 animate-spin mb-4" />
        <h2 className="text-base font-bold text-slate-900">Verifying Mobile Pairing Token...</h2>
        <p className="text-xs text-slate-500 mt-1">Connecting to FairProctor-AI assessment server</p>
      </div>
    );
  }

  // Error / Expired Screen
  if (errorMsg && step !== 'confirm_submit') {
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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow">
            <Smartphone className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-tight text-slate-900">FairProctor Mobile Check</h1>
            <p className="text-[10px] text-teal-600 font-mono">
              Code: <strong>{pairingData?.pairing_code || 'PAIRING'}</strong>
            </p>
          </div>
        </div>

        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          IM-102 Protected
        </span>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 flex flex-col justify-between space-y-4">
        {/* Step 1: Consent & Privacy Notice */}
        {step === 'consent' && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center pt-2 pb-1 space-y-1">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-200">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Room & Desk Check</h2>
              <p className="text-xs text-slate-500">
                Quick 60-second readiness scan before your exam.
              </p>
            </div>

            {/* Privacy Safeguards Card */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-teal-800 text-xs">
                <Lock className="w-3.5 h-3.5 text-teal-600" />
                <span>Fairness Guarantee (Policy IM-102)</span>
              </div>
              <ul className="space-y-1 text-slate-600 text-[11px] list-disc list-inside">
                <li>Processed on-device; zero cloud video storage.</li>
                <li>Zero biometric or facial recognition tracking.</li>
                <li><strong className="text-slate-800">Shared room safe:</strong> Background people do not penalize scores.</li>
              </ul>
            </div>

            {/* Candidate Confirmation Checklist */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-2.5">
              <span className="text-xs font-semibold text-slate-900 block">Readiness</span>

              <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deskCleared}
                  onChange={(e) => setDeskCleared(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="leading-tight">Desk clear of unauthorized notes and devices.</span>
              </label>

              <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={true}
                  readOnly
                  className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="leading-tight">Consent to verify under Policy IM-102.</span>
              </label>
            </div>

            <div className="pt-2 space-y-2">
              <button
                onClick={() => {
                  handleRequestCamera();
                  setStep('camera_scan');
                }}
                disabled={!deskCleared}
                className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all ${
                  deskCleared
                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Start Camera Scan</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setCheckStatusChoice('declined');
                  setStep('confirm_submit');
                }}
                className="w-full py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                Skip Camera (Limited Mode)
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Camera Room & Desk Scan */}
        {step === 'camera_scan' && (
          <div className="space-y-3.5 animate-fade-in">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Room & Desk Sweep</h2>
              <p className="text-[11px] text-slate-500">Pan camera slowly across your workspace.</p>
            </div>

            {/* Video Viewport */}
            <div className="relative aspect-[4/3] rounded-2xl bg-slate-100 overflow-hidden border border-slate-200 shadow-inner flex items-center justify-center">
              {cameraState === 'granted' && (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              )}

              {cameraState !== 'granted' && (
                <div className="p-4 text-center space-y-2">
                  <VideoOff className="w-7 h-7 text-amber-500 mx-auto" />
                  <p className="text-xs text-slate-800 font-semibold">Camera Access Unavailable</p>
                  <p className="text-[11px] text-slate-500 max-w-xs">
                    Allow camera access in your mobile browser or skip to continue.
                  </p>
                  <button
                    onClick={handleRequestCamera}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 text-white text-[11px] font-medium"
                  >
                    Enable Camera
                  </button>
                </div>
              )}

              {/* Viewfinder Target Overlay */}
              {cameraState === 'granted' && (
                <div className="absolute inset-4 pointer-events-none border border-teal-500/40 rounded-xl flex items-center justify-center">
                  <span className="text-[10px] font-semibold text-teal-800 bg-white/90 px-2 py-0.5 rounded-full border border-teal-500/30">
                    Live Stream &middot; On-Device
                  </span>
                </div>
              )}
            </div>

            {/* Guidance Pills */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-start gap-2">
                <Compass className="w-3.5 h-3.5 text-teal-600 mt-0.5 flex-shrink-0" />
                <div className="leading-tight">
                  <strong className="text-slate-900 block text-[11px]">360° Sweep</strong>
                  <span className="text-slate-500 text-[10px]">Roommates protected</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-start gap-2">
                <Sun className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="leading-tight">
                  <strong className="text-slate-900 block text-[11px]">Lighting</strong>
                  <span className="text-slate-500 text-[10px]">Face illuminated</span>
                </div>
              </div>
            </div>

            {/* Room Sweep Confirmation Toggle */}
            <label className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between text-xs cursor-pointer">
              <span className="font-medium text-slate-800">I have completed the room &amp; desk sweep</span>
              <input
                type="checkbox"
                checked={roomSweepDone}
                onChange={(e) => setRoomSweepDone(e.target.checked)}
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
            </label>

            <div className="pt-2 flex gap-2">
              <button
                onClick={() => setStep('consent')}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => {
                  setCheckStatusChoice(roomSweepDone ? 'completed' : 'partially_completed');
                  setStep('confirm_submit');
                }}
                className="flex-2 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Continue to Summary</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm & Submit */}
        {step === 'confirm_submit' && (
          <div className="space-y-3.5 animate-fade-in">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Review & Submit</h2>
              <p className="text-[11px] text-slate-500">Confirm environment status before desktop exam.</p>
            </div>

            {/* Summary Details */}
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm text-xs space-y-2">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                <span className="text-slate-500">Desk Surface:</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Cleared
                </span>
              </div>

              <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                <span className="text-slate-500">Room Sweep:</span>
                <span className="font-semibold text-slate-800">
                  {roomSweepDone ? 'Completed' : 'Skipped'}
                </span>
              </div>

              <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                <span className="text-slate-500">Camera Status:</span>
                <span className="font-semibold text-slate-800">
                  {cameraState === 'granted' ? 'Verified' : 'Unavailable'}
                </span>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 text-[11px]">Room Lighting:</label>
                <select
                  value={lightingAssessment}
                  onChange={(e) => setLightingAssessment(e.target.value as any)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                >
                  <option value="adequate">Adequate / Well Lit</option>
                  <option value="low">Low Light (Protected under IM-102)</option>
                  <option value="uncertain">Variable</option>
                </select>
              </div>

              <div>
                <label className="text-slate-600 block mb-1 text-[11px]">Notes (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. Shared room with family"
                  value={candidateNotes}
                  onChange={(e) => setCandidateNotes(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleSubmitCheck}
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Submit Check</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setStep('camera_scan')}
                disabled={isSubmitting}
                className="w-full py-1.5 rounded-xl text-xs text-slate-500 hover:text-slate-800 transition-colors"
              >
                Back to Camera
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Completed Status */}
        {step === 'completed' && (
          <div className="space-y-4 text-center py-6 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-6 h-6" />
            </div>

            <div className="space-y-0.5">
              <h2 className="text-base font-bold text-slate-900">Check Complete</h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Status saved. Return to your desktop exam screen.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm text-xs space-y-1.5 text-left max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Pairing Code:</span>
                <span className="font-mono font-bold text-teal-600">{pairingData?.pairing_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-semibold text-emerald-600">VERIFIED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Camera:</span>
                <span className="font-medium text-slate-700">Released</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs max-w-sm mx-auto text-left">
              <strong>Next:</strong> Your desktop will proceed to camera permissions and exam start.
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  handleStopCamera();
                  if (onDone) onDone();
                }}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors shadow-sm"
              >
                Close Check
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Accessible Mobile Footer */}
      <footer className="border-t border-slate-200 py-3 px-4 text-center text-[10px] text-slate-500 bg-white">
        FairProctor-AI &middot; Policy IM-102 Non-Penalizing Proctoring
      </footer>
    </div>
  );
};
