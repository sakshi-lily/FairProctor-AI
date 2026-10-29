import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Shield,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Wifi,
  WifiOff,
  Sun,
  Lock,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  ExternalLink,
  Info,
  Layers,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Smartphone,
  Maximize,
  Minimize,
  QrCode,
  RefreshCw,
  AlertCircle,
  Radio,
  Sliders,
} from 'lucide-react';
import { SYNTHETIC_EXAM_QUESTIONS } from './examQuestions';
import {
  startCandidateSession,
  recordCandidateEvent,
  recordCandidateAnswer,
  submitCandidateExam,
  checkBackendHealth,
  createPairingSession,
  getSessionPairingStatus,
  subscribeToEventStream,
  startMobileCheck,
  submitMobileEnvironmentCheck,
} from '../api/client';
import {
  SessionDetail,
  CandidateEventType,
  CreatePairingResponse,
  PairingStatusResponse,
} from '../types/proctoring';

type WizardScreen =
  | 'welcome'
  | 'readiness'
  | 'qr_pairing'
  | 'desktop_permissions'
  | 'network_check'
  | 'lighting_check'
  | 'privacy_consent'
  | 'exam_rules'
  | 'active_exam'
  | 'submission_confirm'
  | 'completion';

interface Props {
  onReturnToReviewer: (sessionId?: string) => void;
  onSessionCreated?: (sessionId: string) => void;
}

export const CandidatePortal: React.FC<Props> = ({ onReturnToReviewer, onSessionCreated }) => {
  const [currentScreen, setCurrentScreen] = useState<WizardScreen>(() => {
    const saved = sessionStorage.getItem('fairproctor_current_screen');
    return (saved as WizardScreen) || 'welcome';
  });

  // Pseudonymous candidate ID (randomized per attempt)
  const [candidateRef] = useState<string>(() => {
    const saved = sessionStorage.getItem('fairproctor_candidate_ref');
    if (saved) return saved;
    const ref = `cand_anon_${Math.floor(1000 + Math.random() * 9000)}`;
    sessionStorage.setItem('fairproctor_candidate_ref', ref);
    return ref;
  });
  const [examTitle] = useState<string>('CS 401 — Advanced Algorithms & Systems Examination');
  const [isSharedRoom, setIsSharedRoom] = useState<boolean>(true);

  // Active Session state
  const [activeSession, setActiveSession] = useState<SessionDetail | null>(() => {
    const saved = sessionStorage.getItem('fairproctor_active_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  useEffect(() => {
    if (activeSession) {
      sessionStorage.setItem('fairproctor_active_session', JSON.stringify(activeSession));
    }
  }, [activeSession]);

  useEffect(() => {
    sessionStorage.setItem('fairproctor_current_screen', currentScreen);
  }, [currentScreen]);

  // QR Pairing & Mobile Environment Check State
  const [pairingData, setPairingData] = useState<CreatePairingResponse | null>(null);
  const [pairingStatus, setPairingStatus] = useState<PairingStatusResponse | null>(null);
  const [pairingCountdown, setPairingCountdown] = useState<number>(300);
  const [isGeneratingPairing, setIsGeneratingPairing] = useState<boolean>(false);
  const [frontendOrigin, setFrontendOrigin] = useState<string>(() => window.location.origin);
  const [showOriginConfig, setShowOriginConfig] = useState<boolean>(false);
  const [isMobileCheckSkipped, setIsMobileCheckSkipped] = useState<boolean>(false);

  // Desktop Media Streams & Permissions
  const [desktopMediaStream, setDesktopMediaStream] = useState<MediaStream | null>(null);
  const [cameraPermissionState, setCameraPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [micPermissionState, setMicPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [micAudioLevel, setMicAudioLevel] = useState<number>(0);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const examVideoRef = useRef<HTMLVideoElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Network check
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [isMeasuringNetwork, setIsMeasuringNetwork] = useState<boolean>(false);

  // Active Exam State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(300);
  const [isExamRunning, setIsExamRunning] = useState<boolean>(false);
  const [startTimeMs, setStartTimeMs] = useState<number | null>(null);

  // Restricted Mode / Fullscreen Interruption State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [warningModalOpen, setWarningModalOpen] = useState<boolean>(false);
  const [warningType, setWarningType] = useState<'fullscreen_exit' | 'tab_switch' | null>(null);
  const [warningCount, setWarningCount] = useState<number>(0);

  // Simulated conditions state
  const [simulatedBackgroundPerson, setSimulatedBackgroundPerson] = useState<boolean>(false);
  const [simulatedPoorLighting, setSimulatedPoorLighting] = useState<boolean>(false);
  const [simulatedNetworkDegradation, setSimulatedNetworkDegradation] = useState<boolean>(false);
  const [simulatedCameraCut, setSimulatedCameraCut] = useState<boolean>(false);

  // Status feedback
  const [statusNotice, setStatusNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Ensure session exists on backend
  const ensureSessionStarted = async (): Promise<SessionDetail | null> => {
    if (activeSession) return activeSession;
    try {
      const res = await startCandidateSession({
        candidate_pseudonym: candidateRef,
        exam_title: examTitle,
        is_shared_room_declared: isSharedRoom,
        camera_permitted: cameraPermissionState === 'granted',
        notes: `Candidate declared shared room: ${isSharedRoom}.`,
      });
      if (res.data) {
        setActiveSession(res.data);
        if (onSessionCreated) onSessionCreated(res.data.session_id);
        return res.data;
      }
    } catch (err) {
      console.error('Failed to initialize session:', err);
    }
    return null;
  };

  // Generate or Regenerate QR Pairing Token
  const handleGeneratePairing = async (sessId?: string) => {
    const sid = sessId || activeSession?.session_id;
    if (!sid) return;

    setIsGeneratingPairing(true);
    try {
      const res = await createPairingSession(sid, frontendOrigin);
      if (res.data) {
        setPairingData(res.data);
        setPairingCountdown(res.data.ttl_seconds || 300);
      }
    } catch (err) {
      console.error('Failed to create pairing token:', err);
    } finally {
      setIsGeneratingPairing(false);
    }
  };

  // Auto-generate pairing if missing on qr_pairing screen
  useEffect(() => {
    if (currentScreen === 'qr_pairing' && activeSession && !pairingData && !isGeneratingPairing) {
      handleGeneratePairing(activeSession.session_id);
    }
  }, [currentScreen, activeSession, pairingData, isGeneratingPairing]);

  // Simulate mobile scan & completion directly from desktop for automated testing / demos
  const handleSimulateMobileCheck = async () => {
    if (!pairingData) return;
    try {
      await startMobileCheck(pairingData.pairing_token);
      const res = await submitMobileEnvironmentCheck({
        pairing_token: pairingData.pairing_token,
        check_status: 'completed',
        lighting_status: 'adequate',
        camera_status: 'available',
        desk_cleared_confirmed: true,
        room_sweep_completed: true,
        candidate_notes: 'Verified via desktop simulation trigger for testing',
      });
      if (res.data) {
        setPairingStatus(res.data);
      }
    } catch (err) {
      console.error('Failed to simulate mobile check:', err);
    }
  };

  // Pairing Countdown Timer
  useEffect(() => {
    if (currentScreen !== 'qr_pairing' || !pairingData) return;

    const timer = setInterval(() => {
      setPairingCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentScreen, pairingData]);

  // Poll pairing status & Listen to SSE on Desktop
  useEffect(() => {
    if (currentScreen !== 'qr_pairing' || !activeSession) return;

    const interval = setInterval(async () => {
      const res = await getSessionPairingStatus(activeSession.session_id);
      if (res.data) {
        setPairingStatus(res.data);
        if (res.data.status === 'completed') {
          clearInterval(interval);
        }
      }
    }, 2000);

    // Also listen to live SSE stream
    const unsubscribe = subscribeToEventStream((msg) => {
      if (msg.event === 'pairing_completed' && msg.data?.session_id === activeSession.session_id) {
        setPairingStatus((prev) => ({
          ...(prev || {
            session_id: activeSession.session_id,
            pairing_token: '',
            pairing_code: msg.data.pairing_code,
            is_expired: false,
            created_at: '',
            expires_at: '',
            updated_at: '',
          }),
          status: 'completed',
        }));
      } else if (msg.event === 'pairing_updated' && msg.data?.session_id === activeSession.session_id) {
        setPairingStatus((prev) => ({
          ...(prev || {
            session_id: activeSession.session_id,
            pairing_token: '',
            pairing_code: msg.data.pairing_code,
            is_expired: false,
            created_at: '',
            expires_at: '',
            updated_at: '',
          }),
          status: 'in_progress',
        }));
      }
    }, activeSession.session_id);

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [currentScreen, activeSession]);

  // Request Desktop Camera & Microphone Permissions (Standard getUserMedia)
  const handleRequestDesktopMedia = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setDesktopMediaStream(stream);
        setCameraPermissionState('granted');
        setMicPermissionState('granted');

        // Setup Web Audio Analyser for microphone meter
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const ctx = new AudioCtx();
            audioContextRef.current = ctx;
            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);
            analyserRef.current = analyser;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const updateLevel = () => {
              if (!analyserRef.current) return;
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const avg = sum / dataArray.length;
              setMicAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
              animFrameRef.current = requestAnimationFrame(updateLevel);
            };
            updateLevel();
          }
        } catch {
          // Audio analyzer is optional enhancement
        }

        if (activeSession) {
          recordCandidateEvent(activeSession.session_id, {
            event_type: 'CAMERA_PERMISSION_GRANTED',
            source: 'browser',
            is_simulated: false,
          });
          recordCandidateEvent(activeSession.session_id, {
            event_type: 'MICROPHONE_PERMISSION_GRANTED',
            source: 'browser',
            is_simulated: false,
          });
        }
      } else {
        setCameraPermissionState('denied');
        setMicPermissionState('denied');
      }
    } catch {
      // Graceful fallback to video-only if mic unavailable, or limited-evidence mode
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        setDesktopMediaStream(videoStream);
        setCameraPermissionState('granted');
        setMicPermissionState('denied');
      } catch {
        setCameraPermissionState('denied');
        setMicPermissionState('denied');
      }
    }
  };

  // Stop Desktop Media tracks safely
  const handleStopDesktopMedia = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }
    if (desktopMediaStream) {
      desktopMediaStream.getTracks().forEach((track) => track.stop());
      setDesktopMediaStream(null);
    }
    setCameraPermissionState('denied');
    setMicPermissionState('denied');
    setMicAudioLevel(0);
  };

  // Attach stream to video preview elements
  useEffect(() => {
    if (desktopMediaStream) {
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = desktopMediaStream;
      }
      if (examVideoRef.current) {
        examVideoRef.current.srcObject = desktopMediaStream;
      }
    }
  }, [desktopMediaStream, currentScreen]);

  // Measure Real Network Latency to backend
  const handleTestNetwork = async () => {
    setIsMeasuringNetwork(true);
    const t0 = performance.now();
    await checkBackendHealth();
    const t1 = performance.now();
    setPingMs(Math.round(t1 - t0));
    setIsMeasuringNetwork(false);
  };

  // Enter Fullscreen & Start Examination
  const handleEnterFullscreenAndStart = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch {
      console.warn('Browser fullscreen entry prevented or unsupported.');
    }

    setCurrentScreen('active_exam');
    setIsExamRunning(true);
    setSecondsRemaining(300);
    setStartTimeMs(Date.now());

    if (activeSession) {
      recordCandidateEvent(activeSession.session_id, {
        event_type: 'EXAM_FULLSCREEN_ENTERED',
        source: 'browser',
        metadata: { client_timestamp: new Date().toISOString() },
        is_simulated: false,
      });
    }
  };

  // Acknowledge Warning & Re-enter Fullscreen
  const handleAcknowledgeWarning = async () => {
    setWarningModalOpen(false);
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      }
    } catch {}

    if (activeSession) {
      await recordCandidateEvent(activeSession.session_id, {
        event_type: 'EXAM_WARNING_ACKNOWLEDGED',
        source: 'candidate',
        metadata: {
          warning_number: warningCount,
          interruption_type: warningType,
          acknowledged_at: new Date().toISOString(),
        },
        is_simulated: false,
      });
    }
    setWarningType(null);
  };

  // Timer countdown
  useEffect(() => {
    if (!isExamRunning || currentScreen !== 'active_exam') return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamRunning, currentScreen]);

  // Restricted Examination Mode: Fullscreen & Tab Focus Monitors with Debounce
  useEffect(() => {
    if (currentScreen !== 'active_exam' || !activeSession) return;

    let lastInterruptionTime = 0;
    const cooldownMs = 1500;

    const handleFullscreenChange = () => {
      const isFs = Boolean(document.fullscreenElement);
      setIsFullscreen(isFs);
      const now = Date.now();
      if (!isFs && now - lastInterruptionTime > cooldownMs) {
        lastInterruptionTime = now;
        setWarningType('fullscreen_exit');
        setWarningCount((prev) => prev + 1);
        setWarningModalOpen(true);
        recordCandidateEvent(activeSession.session_id, {
          event_type: 'EXAM_FULLSCREEN_EXITED',
          source: 'browser',
          metadata: { client_timestamp: new Date().toISOString() },
          is_simulated: false,
        });
      }
    };

    const handleVisibilityChange = () => {
      const now = Date.now();
      if (document.hidden && now - lastInterruptionTime > cooldownMs) {
        lastInterruptionTime = now;
        setWarningType('tab_switch');
        setWarningCount((prev) => prev + 1);
        setWarningModalOpen(true);
        recordCandidateEvent(activeSession.session_id, {
          event_type: 'EXAM_TAB_HIDDEN',
          source: 'browser',
          metadata: { hidden: true, client_timestamp: new Date().toISOString() },
          is_simulated: false,
        });
      } else if (!document.hidden) {
        recordCandidateEvent(activeSession.session_id, {
          event_type: 'EXAM_TAB_VISIBLE',
          source: 'browser',
          metadata: { hidden: false, client_timestamp: new Date().toISOString() },
          is_simulated: false,
        });
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentScreen, activeSession]);

  // Answer selection handler
  const handleSelectOption = async (optionKey: string) => {
    const q = SYNTHETIC_EXAM_QUESTIONS[currentQuestionIndex];
    setSelectedAnswers((prev) => ({ ...prev, [q.id]: optionKey }));

    if (activeSession) {
      await recordCandidateAnswer(activeSession.session_id, {
        question_id: q.id,
        question_text: q.text,
        selected_option: optionKey,
        time_spent_seconds: 15.0,
      });
    }
  };

  // Simulation Triggers
  const handleTriggerSimulatedBackgroundPerson = async () => {
    if (!activeSession) return;
    setSimulatedBackgroundPerson(true);
    await recordCandidateEvent(activeSession.session_id, {
      event_type: 'ENVIRONMENTAL_OBSERVATION',
      source: 'simulation',
      metadata: {
        condition_type: 'background_person',
        description: 'Roommate walked through camera background. IM-102 zero-penalty rule applied.',
      },
      is_simulated: true,
      evidence_reliability: 'simulated_demonstration',
    });
    setStatusNotice('Simulated: Background person in shared room (0 risk penalty assessed per Policy IM-102).');
  };

  const handleTriggerSimulatedLighting = async () => {
    if (!activeSession) return;
    setSimulatedPoorLighting((prev) => !prev);
    await recordCandidateEvent(activeSession.session_id, {
      event_type: 'ENVIRONMENTAL_OBSERVATION',
      source: 'simulation',
      metadata: {
        condition_type: 'poor_lighting',
        illuminance_lux: 12.0,
        description: 'Ambient room lighting dropped below 15 lux. Classified as technical adversity, not cheating.',
      },
      is_simulated: true,
      evidence_reliability: 'simulated_demonstration',
    });
    setStatusNotice('Simulated: Low ambient lighting logged. Protected under environmental safeguards.');
  };

  const handleTriggerSimulatedNetworkDegradation = async () => {
    if (!activeSession) return;
    const nextState = !simulatedNetworkDegradation;
    setSimulatedNetworkDegradation(nextState);
    const eventType: CandidateEventType = nextState ? 'NETWORK_DEGRADED' : 'NETWORK_RESTORED';
    await recordCandidateEvent(activeSession.session_id, {
      event_type: eventType,
      source: 'simulation',
      metadata: {
        packet_loss_rate: nextState ? 0.18 : 0.01,
        latency_ms: nextState ? 240.0 : 25.0,
      },
      is_simulated: true,
      evidence_reliability: 'simulated_demonstration',
    });
    setStatusNotice(nextState ? 'Simulated: Network degraded (Packet loss 18%).' : 'Simulated: Network connection restored.');
  };

  const handleTriggerSimulatedCameraCut = async () => {
    if (!activeSession) return;
    setSimulatedCameraCut(true);
    await recordCandidateEvent(activeSession.session_id, {
      event_type: 'CAMERA_UNAVAILABLE',
      source: 'simulation',
      metadata: { reason: 'simulated_temporary_sensor_drop', duration_sec: 5.0 },
      is_simulated: true,
      evidence_reliability: 'simulated_demonstration',
    });
    setStatusNotice('Simulated: Camera feed interrupted for 5 seconds. Handled as limited evidence, not cheating.');
    setTimeout(async () => {
      setSimulatedCameraCut(false);
      await recordCandidateEvent(activeSession.session_id, {
        event_type: 'CAMERA_RESTORED',
        source: 'simulation',
        metadata: { status: 'camera_resumed' },
        is_simulated: true,
      });
      setStatusNotice('Simulated: Camera feed restored.');
    }, 5000);
  };

  // Final Exam Submission
  const handleFinalSubmit = async () => {
    if (!activeSession) return;
    setIsSubmitting(true);
    try {
      const elapsed = startTimeMs ? (Date.now() - startTimeMs) / 1000 : 300;
      const formattedAnswers: Record<string, string> = {};
      Object.entries(selectedAnswers).forEach(([qid, opt]) => {
        formattedAnswers[qid] = opt;
      });

      const res = await submitCandidateExam(activeSession.session_id, {
        answers: formattedAnswers,
        total_time_spent_seconds: elapsed,
      });

      if (res.data) {
        setActiveSession(res.data);
      }
      setIsExamRunning(false);
      handleStopDesktopMedia();
      try {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      } catch {}
      setCurrentScreen('completion');
    } catch (err) {
      console.error('Failed to submit exam:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Time formatter
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const currentQ = SYNTHETIC_EXAM_QUESTIONS[currentQuestionIndex];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in relative">
      {/* Fullscreen Interruption Warning Modal (Restricted Mode) */}
      {warningModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-500 shadow-2xl p-6 space-y-4 text-center animate-scale-up">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 uppercase">
                Restricted Exam Mode Warning #{warningCount}
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {warningType === 'fullscreen_exit' ? 'Fullscreen Mode Interrupted' : 'Examination Focus Lost'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {warningType === 'fullscreen_exit'
                  ? 'You exited fullscreen mode. The examination policy requires continuous fullscreen focus.'
                  : 'You switched away from the examination tab. This event has been logged for review.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 text-left">
              <strong className="text-slate-800 dark:text-slate-200 block mb-0.5">Policy IM-102 Notice:</strong>
              This interruption does NOT automatically fail or disqualify you. Please return to fullscreen and resume
              your assessment.
            </div>

            <button
              onClick={handleAcknowledgeWarning}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Maximize className="w-4 h-4" />
              <span>Return to Fullscreen &amp; Acknowledge</span>
            </button>
          </div>
        </div>
      )}

      {/* Wizard Progress Ribbon */}
      {currentScreen !== 'active_exam' && currentScreen !== 'completion' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 overflow-x-auto pb-1 gap-2">
            {[
              { id: 'welcome', label: '1. Welcome' },
              { id: 'readiness', label: '2. Readiness' },
              { id: 'qr_pairing', label: '3. Mobile Scan' },
              { id: 'desktop_permissions', label: '4. Hardware' },
              { id: 'network_check', label: '5. Network' },
              { id: 'privacy_consent', label: '6. Privacy' },
              { id: 'exam_rules', label: '7. Rules & Lockdown' },
            ].map((step, idx) => (
              <span
                key={idx}
                className={`whitespace-nowrap px-2.5 py-1 rounded-lg ${
                  currentScreen === step.id
                    ? 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold border border-teal-300 dark:border-teal-800'
                    : ''
                }`}
              >
                {step.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* SCREEN 1: WELCOME SCREEN */}
      {currentScreen === 'welcome' && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-md shadow-teal-500/20">
            <Shield className="w-6 h-6 stroke-[2.5]" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                Candidate Assessment Portal
              </span>
              <span className="text-xs text-slate-400 font-mono">Reference: {candidateRef}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{examTitle}</h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Welcome to your examination environment check. FairProctor-AI is designed with fairness safeguards under{' '}
              <strong>Policy IM-102</strong>: candidates taking exams in shared rooms, low bandwidth, or poor lighting
              will not be penalized.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <div className="font-semibold text-slate-800 dark:text-slate-200">Pre-Assessment Setup:</div>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isSharedRoom}
                onChange={(e) => setIsSharedRoom(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-slate-700 dark:text-slate-300 text-xs leading-normal">
                <strong>Shared Room Environment (Policy IM-102 Protection Active):</strong> I am taking this exam in a
                shared dormitory, living room, or common area. Roommates or family members may periodically walk behind
                me.
              </span>
            </label>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Duration: 5 Minutes (5 Questions)</span>
            <button
              onClick={() => setCurrentScreen('readiness')}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Begin System Readiness Check</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 2: SYSTEM READINESS CHECK */}
      {currentScreen === 'readiness' && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">System Readiness Verification</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verifying that your desktop browser and hardware meet examination integrity requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Operating System</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-slate-500">{navigator.platform} &middot; Compatible</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Browser Environment</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-slate-500">{navigator.userAgent.slice(0, 45)}...</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Screen Resolution</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-slate-500">
                {window.screen.width} &times; {window.screen.height} &middot; Fullscreen Capable
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 dark:text-slate-200">JavaScript &amp; SSE</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-slate-500">EventSource Active &middot; Supported</p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setCurrentScreen('welcome')}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={async () => {
                const sess = await ensureSessionStarted();
                if (sess) {
                  await handleGeneratePairing(sess.session_id);
                }
                setCurrentScreen('qr_pairing');
              }}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Continue to Mobile Room Check</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 3: QR PAIRING & MOBILE ENVIRONMENT CHECK (NEW) */}
      {currentScreen === 'qr_pairing' && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mobile Environment Check</h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Scan this QR code with your smartphone camera to perform a 60-second environmental sweep.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                  pairingStatus?.status === 'completed'
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                    : pairingStatus?.status === 'in_progress'
                    ? 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300'
                    : pairingCountdown === 0
                    ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300'
                    : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300'
                }`}
              >
                {pairingStatus?.status === 'completed' ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Check Completed</span>
                  </>
                ) : pairingStatus?.status === 'in_progress' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-sky-600 animate-spin" />
                    <span>Phone Connected &middot; Scanning</span>
                  </>
                ) : pairingCountdown === 0 ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>QR Token Expired</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Waiting for Phone Scan</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* QR Display Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left QR Column */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              {pairingData && pairingCountdown > 0 ? (
                <div className="p-3 bg-white rounded-xl shadow-md border border-slate-200">
                  <QRCodeSVG value={pairingData.qr_payload_url} size={180} level="M" includeMargin={false} />
                </div>
              ) : (
                <div className="w-48 h-48 bg-slate-200 dark:bg-slate-700/60 rounded-xl flex flex-col items-center justify-center text-center p-4 text-xs text-slate-500 space-y-2">
                  <AlertTriangle className="w-8 h-8 text-rose-500" />
                  <span>Token Expired or Generating</span>
                </div>
              )}

              <div className="text-center space-y-1">
                <span className="text-[11px] text-slate-400">Short Pairing Code:</span>
                <div className="font-mono text-xl font-bold tracking-widest text-teal-600 dark:text-teal-400">
                  {pairingData?.pairing_code || 'FP-....'}
                </div>
                <div className="text-[11px] text-slate-500 font-mono flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Expires in: {formatTimer(pairingCountdown)}</span>
                </div>
              </div>

              {/* Regenerate Action */}
              <button
                onClick={() => handleGeneratePairing()}
                disabled={isGeneratingPairing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isGeneratingPairing ? 'animate-spin' : ''}`} />
                <span>Regenerate QR Code</span>
              </button>
            </div>

            {/* Right Instructions Column */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 text-xs text-teal-900 dark:text-teal-200 space-y-1.5">
                <div className="font-semibold flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Mobile Privacy &amp; Non-Penalization Guarantee:</span>
                </div>
                <p className="leading-relaxed text-[11px]">
                  The mobile check only records room lighting and desk clearance. Video remains local on your phone; no
                  recordings are saved. If roommates or household members walk behind you, Policy IM-102 protects you
                  with <strong>0 penalty points</strong>.
                </p>
              </div>

              {/* Quick Link for Testing / Evaluation */}
              {pairingData && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Testing on same machine / mobile tab:
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-1">
                    <a
                      href={pairingData.qr_payload_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-semibold hover:underline"
                    >
                      <span>Open Mobile Check in New Tab</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">&bull;</span>
                    <button
                      onClick={handleSimulateMobileCheck}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Simulate Mobile Scan &amp; Verify</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Host Origin Configuration for LAN Mobile Testing */}
              <div className="text-xs space-y-1.5">
                <button
                  onClick={() => setShowOriginConfig(!showOriginConfig)}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 inline-flex items-center gap-1"
                >
                  <Sliders className="w-3 h-3" />
                  <span>Phone Network / LAN IP settings ({frontendOrigin})</span>
                </button>

                {showOriginConfig && (
                  <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 space-y-2 border border-slate-200 dark:border-slate-700">
                    <label className="text-[11px] text-slate-600 dark:text-slate-400 block">
                      Frontend Origin for QR payload (use your PC's LAN IP e.g. http://192.168.1.50:5173 if phone is on
                      the same WiFi):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={frontendOrigin}
                        onChange={(e) => setFrontendOrigin(e.target.value)}
                        className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-1.5 text-xs font-mono"
                      />
                      <button
                        onClick={() => handleGeneratePairing()}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-medium"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => {
                setIsMobileCheckSkipped(true);
                setCurrentScreen('desktop_permissions');
              }}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline"
            >
              Skip Mobile Check (Continue in Limited-Evidence Mode)
            </button>

            <button
              onClick={() => setCurrentScreen('desktop_permissions')}
              className={`px-5 py-2.5 rounded-xl font-medium text-xs transition-colors flex items-center gap-1.5 shadow-sm ${
                pairingStatus?.status === 'completed' || isMobileCheckSkipped
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <span>Continue to Desktop Hardware Setup</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 4: DESKTOP CAMERA & MICROPHONE PERMISSIONS (ENHANCED) */}
      {currentScreen === 'desktop_permissions' && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Desktop Camera &amp; Microphone Check</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Grant standard browser permissions for camera and microphone monitoring during the examination.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Live Camera Preview */}
            <div className="relative aspect-video rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center">
              {cameraPermissionState === 'granted' ? (
                <video ref={videoPreviewRef} autoPlay playsInline muted className="w-full h-full object-cover" />
              ) : (
                <div className="p-6 text-center space-y-2">
                  <VideoOff className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">Desktop Video Feed Inactive</p>
                  <p className="text-[11px] text-slate-400">Click below to request camera and audio access.</p>
                </div>
              )}

              {/* Status indicator pill */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] text-white">
                <span
                  className={`w-2 h-2 rounded-full ${
                    cameraPermissionState === 'granted' ? 'bg-emerald-500' : 'bg-rose-500'
                  }`}
                />
                <span>{cameraPermissionState === 'granted' ? 'Camera Live' : 'Camera Disconnected'}</span>
              </div>
            </div>

            {/* Permissions & Audio Meter Controls */}
            <div className="space-y-4">
              {/* Permission Request Buttons */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Hardware Devices Authorization
                </span>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleRequestDesktopMedia}
                    className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Video className="w-4 h-4" />
                    <span>Grant Desktop Camera &amp; Microphone</span>
                  </button>

                  {desktopMediaStream && (
                    <button
                      onClick={handleStopDesktopMedia}
                      className="px-4 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs hover:bg-rose-50 transition-colors"
                    >
                      Stop Monitoring &amp; Release Devices
                    </button>
                  )}
                </div>
              </div>

              {/* Microphone Audio Level Indicator */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    {micPermissionState === 'granted' ? (
                      <Mic className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <MicOff className="w-3.5 h-3.5 text-slate-400" />
                    )}
                    <span>Microphone Input Level</span>
                  </span>
                  <span className="font-mono text-slate-500">{micPermissionState === 'granted' ? `${micAudioLevel}%` : 'Off'}</span>
                </div>

                <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-100 rounded-full"
                    style={{ width: `${micPermissionState === 'granted' ? micAudioLevel : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setCurrentScreen('qr_pairing')}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentScreen('network_check')}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Continue to Network Quality</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 5: NETWORK QUALITY CHECK */}
      {currentScreen === 'network_check' && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Network Bandwidth &amp; Latency</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Measuring connection quality to ensure continuous telemetry transmission.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                <Wifi className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs block">
                  Assessment Server Latency (Ping)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {pingMs !== null ? `${pingMs} ms round-trip` : 'Ready to test'}
                </span>
              </div>
            </div>

            <button
              onClick={handleTestNetwork}
              disabled={isMeasuringNetwork}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors"
            >
              {isMeasuringNetwork ? 'Measuring...' : 'Test Network Ping'}
            </button>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong>Policy IM-102 Bandwidth Safeguard: </strong>
            Temporary network drops or high latency will NOT trigger cheating flags. The assessment system buffers
            candidate answers and tolerates packet loss gracefully.
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setCurrentScreen('desktop_permissions')}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentScreen('privacy_consent')}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Continue to Privacy Notice</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 6: PRIVACY NOTICE & EXPLICIT CONSENT */}
      {currentScreen === 'privacy_consent' && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Privacy Notice &amp; Explicit Consent</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Please review data protection and integrity guidelines before beginning.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-3 leading-relaxed max-h-60 overflow-y-auto">
            <p>
              <strong>1. Local Media Processing:</strong> Webcam and microphone streams are processed within your
              browser to calculate review-priority heuristics. Video and audio recordings are NOT persisted to cloud disks.
            </p>
            <p>
              <strong>2. No Biometric Identification:</strong> FairProctor-AI does not identify you, create face
              templates, or store facial recognition vectors.
            </p>
            <p>
              <strong>3. Shared Room Protection (Policy IM-102):</strong> The presence of other people in your
              background, children, or household members walking past will NOT be treated as cheating.
            </p>
            <p>
              <strong>4. Decision-Support Only:</strong> Automated scores are provisional review-priority heuristics.
              Decisions are strictly reserved for human proctors.
            </p>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              defaultChecked
              className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span>
              I understand and explicitly consent to candidate telemetry capture under the provisions of Policy IM-102.
            </span>
          </label>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setCurrentScreen('network_check')}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentScreen('exam_rules')}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Accept Terms &amp; Proceed to Rules</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 7: EXAM RULES & RESTRICTED LOCKDOWN ENTRY (NEW) */}
      {currentScreen === 'exam_rules' && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800 uppercase">
              Restricted Examination Mode
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Exam Guidelines &amp; Fullscreen Lock</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Review examination restrictions before entering fullscreen mode.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
              <Maximize className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-slate-900 dark:text-white block mb-0.5">Mandatory Fullscreen Mode</strong>
                <span className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  The exam interface will request fullscreen mode upon start. Exiting fullscreen will trigger an
                  integrity warning modal.
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
              <Layers className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-slate-900 dark:text-white block mb-0.5">Tab Focus Monitoring</strong>
                <span className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Switching tabs or minimizing the browser will be logged as an interruption. You will be required to
                  re-focus before continuing.
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800/60 text-xs text-teal-900 dark:text-teal-200">
            <strong>Fairness Notice: </strong>
            Accidental tab clicks or notifications will not automatically fail your exam. An on-screen warning will
            prompt you to return to fullscreen.
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setCurrentScreen('privacy_consent')}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleEnterFullscreenAndStart}
              className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-lg shadow-teal-600/20"
            >
              <Maximize className="w-4 h-4" />
              <span>Enter Fullscreen &amp; Start Exam Now</span>
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 8: ACTIVE EXAMINATION INTERFACE */}
      {currentScreen === 'active_exam' && (
        <div className="space-y-4">
          {/* Top Exam Header with Fullscreen Indicator */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-mono text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>
              <div className="text-xs">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Question {currentQuestionIndex + 1} of {SYNTHETIC_EXAM_QUESTIONS.length}
                </span>
                <span className="text-slate-400">{answeredCount} of {SYNTHETIC_EXAM_QUESTIONS.length} Answered</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>RESTRICTED EXAM MODE ACTIVE</span>
              </span>

              <button
                onClick={() => setCurrentScreen('submission_confirm')}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors"
              >
                Submit Exam
              </button>
            </div>
          </div>

          {/* Status Feedback Notice */}
          {statusNotice && (
            <div className="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-xs text-sky-800 dark:text-sky-300 flex items-center justify-between animate-fade-in">
              <span>{statusNotice}</span>
              <button onClick={() => setStatusNotice(null)} className="text-slate-400 hover:text-slate-600 text-xs">
                &times;
              </button>
            </div>
          )}

          {/* Main Question + Video Preview Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Question Panel */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                {currentQ.category}
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">{currentQ.text}</h3>

              {/* Options */}
              <div className="space-y-2 pt-2">
                {currentQ.options.map((opt) => {
                  const isSelected = selectedAnswers[currentQ.id] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectOption(opt.key)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200 font-semibold ring-2 ring-teal-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isSelected
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className="flex-1">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Question Navigation */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400 disabled:opacity-40"
                >
                  Previous
                </button>
                <div className="flex gap-1">
                  {SYNTHETIC_EXAM_QUESTIONS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentQuestionIndex(i)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold ${
                        currentQuestionIndex === i
                          ? 'bg-teal-600 text-white'
                          : selectedAnswers[i + 1]
                          ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                          : 'border border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  disabled={currentQuestionIndex === SYNTHETIC_EXAM_QUESTIONS.length - 1}
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Candidate Desktop Video Preview & Demo Controls Drawer */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                  Proctoring Telemetry Preview
                </span>

                <div className="relative aspect-video rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  {cameraPermissionState === 'granted' && !simulatedCameraCut ? (
                    <video ref={examVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-3 text-xs text-slate-400 space-y-1">
                      <VideoOff className="w-6 h-6 mx-auto text-amber-500" />
                      <span>{simulatedCameraCut ? 'Camera Interrupted' : 'Video Unavailable'}</span>
                    </div>
                  )}

                  {/* Privacy pill */}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[9px] text-teal-300 font-mono">
                    Local Only &middot; IM-102
                  </div>
                </div>

                {/* Mic Level */}
                <div className="text-[11px] flex items-center justify-between text-slate-500">
                  <span>Microphone:</span>
                  <span className="font-semibold text-emerald-500">{micPermissionState === 'granted' ? 'Active' : 'Muted'}</span>
                </div>
              </div>

              {/* Demo Simulation Controls Drawer */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-amber-200 dark:border-amber-900/60 shadow-sm space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Demo Condition Simulator</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Trigger test conditions to demonstrate Policy IM-102 fairness safeguards in reviewer dashboard:
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={handleTriggerSimulatedBackgroundPerson}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 text-left"
                  >
                    <strong className="block text-slate-800 dark:text-slate-200 text-[11px]">Shared Room</strong>
                    <span className="text-[10px] text-slate-400">2nd Person in View</span>
                  </button>

                  <button
                    onClick={handleTriggerSimulatedLighting}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 text-left"
                  >
                    <strong className="block text-slate-800 dark:text-slate-200 text-[11px]">Low Lighting</strong>
                    <span className="text-[10px] text-slate-400">&lt;15 Lux Dimming</span>
                  </button>

                  <button
                    onClick={handleTriggerSimulatedNetworkDegradation}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 text-left"
                  >
                    <strong className="block text-slate-800 dark:text-slate-200 text-[11px]">Network Drop</strong>
                    <span className="text-[10px] text-slate-400">Packet Loss 18%</span>
                  </button>

                  <button
                    onClick={handleTriggerSimulatedCameraCut}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400 text-left"
                  >
                    <strong className="block text-slate-800 dark:text-slate-200 text-[11px]">Camera Cut</strong>
                    <span className="text-[10px] text-slate-400">5-sec Disconnect</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 9: SUBMISSION CONFIRMATION MODAL */}
      {currentScreen === 'submission_confirm' && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Confirm Examination Submission</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              You have answered {answeredCount} of {SYNTHETIC_EXAM_QUESTIONS.length} questions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 text-left">
            Once submitted, your responses and associated telemetry will be transferred to the integrity evaluation
            queue for human review.
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setCurrentScreen('active_exam')}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50"
            >
              Return to Exam
            </button>
            <button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm"
            >
              {isSubmitting ? 'Submitting...' : 'Yes, Submit Exam'}
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 10: COMPLETION SUMMARY */}
      {currentScreen === 'completion' && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Examination Submitted Successfully</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Your responses, mobile scan verification, and telemetry have been received by the assessment server.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 max-w-md mx-auto text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">Session Reference:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{activeSession?.session_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mobile Check:</span>
              <span className="font-semibold text-emerald-600">
                {pairingStatus?.status === 'completed' ? 'Verified ✓' : 'Skipped (Limited Evidence)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Shared Room Protection:</span>
              <span className="font-semibold text-teal-600">IM-102 Applied (0 Risk Penalty)</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => onReturnToReviewer(activeSession?.session_id)}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs transition-colors flex items-center gap-2 shadow-sm"
            >
              <span>Inspect Live Session in Reviewer Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setActiveSession(null);
                setSelectedAnswers({});
                setPairingData(null);
                setPairingStatus(null);
                setCurrentScreen('welcome');
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition-colors"
            >
              Start Another Mock Exam
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
