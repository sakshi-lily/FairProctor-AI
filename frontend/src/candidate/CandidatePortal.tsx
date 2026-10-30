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
  Camera,
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

export interface LiveDetectionResult {
  facePresent: boolean;
  faceCount: number;
  faceConfidence: number;
  headPose: 'forward' | 'left' | 'right' | 'down';
  lightingLevel: number;
  lightingCategory: 'adequate' | 'low';
  boundingBox: { x: number; y: number; width: number; height: number } | null;
  secondaryBox: { x: number; y: number; width: number; height: number } | null;
  fps: number;
  hasSimulatedPerson: boolean;
  hasSimulatedLowLight: boolean;
}

export interface CameraErrorInfo {
  type: 'NotAllowedError' | 'NotFoundError' | 'NotReadableError' | 'OverconstrainedError' | 'InsecureContext' | 'Unknown';
  message: string;
  guidance: string;
}

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
  const desktopMediaStreamRef = useRef<MediaStream | null>(null);
  const [cameraPermissionState, setCameraPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [cameraErrorInfo, setCameraErrorInfo] = useState<CameraErrorInfo | null>(null);
  const [isRequestingMedia, setIsRequestingMedia] = useState<boolean>(false);
  const [micPermissionState, setMicPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [micAudioLevel, setMicAudioLevel] = useState<number>(0);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const examVideoRef = useRef<HTMLVideoElement | null>(null);
  const previewOverlayRef = useRef<HTMLCanvasElement | null>(null);
  const examOverlayRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cvAnimationIdRef = useRef<number | null>(null);
  const currentFpsRef = useRef<number>(20);

  // Live Computer Vision Detection & Proctoring State
  const [liveDetection, setLiveDetection] = useState<LiveDetectionResult>({
    facePresent: false,
    faceCount: 0,
    faceConfidence: 0,
    headPose: 'forward',
    lightingLevel: 45,
    lightingCategory: 'adequate',
    boundingBox: null,
    secondaryBox: null,
    fps: 0,
    hasSimulatedPerson: false,
    hasSimulatedLowLight: false,
  });
  const liveDetectionRef = useRef<LiveDetectionResult>(liveDetection);
  useEffect(() => {
    liveDetectionRef.current = liveDetection;
  }, [liveDetection]);

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
  const [candidateNotes, setCandidateNotes] = useState<Record<number, string>>({});

  // Restricted Mode / Fullscreen Interruption State
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [warningModalOpen, setWarningModalOpen] = useState<boolean>(false);
  const [warningType, setWarningType] = useState<'fullscreen_exit' | 'tab_switch' | null>(null);
  const [warningCount, setWarningCount] = useState<number>(0);
  const lastInterruptionTimeRef = useRef<number>(0);
  const isInitializingCameraRef = useRef<boolean>(false);

  // Keyboard controls, Consent & Authorized Snapshot
  const [shortcutNotice, setShortcutNotice] = useState<string | null>(null);
  const [hasProctoringConsent, setHasProctoringConsent] = useState<boolean>(true);
  const [authorizedSnapshot, setAuthorizedSnapshot] = useState<{ timestamp: string; dataUrl: string } | null>(null);

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

  // Check if a MediaStream has active, live video tracks
  const isStreamActive = (stream: MediaStream | null): boolean => {
    if (!stream || !stream.active) return false;
    const videoTracks = stream.getVideoTracks();
    return videoTracks.length > 0 && videoTracks.some((t) => t.readyState === 'live');
  };

  // Check if a MediaStream has active, live audio tracks
  const isAudioActive = (stream: MediaStream | null): boolean => {
    if (!stream || !stream.active) return false;
    const audioTracks = stream.getAudioTracks();
    return audioTracks.length > 0 && audioTracks.some((t) => t.readyState === 'live');
  };

  // Hardware Verification: Both camera and audio must be allowed and active to proceed
  const isCameraAllowed =
    cameraPermissionState === 'granted' &&
    desktopMediaStream !== null &&
    isStreamActive(desktopMediaStream);

  const isAudioAllowed =
    micPermissionState === 'granted' &&
    desktopMediaStream !== null &&
    isAudioActive(desktopMediaStream);

  const isHardwareReady = isCameraAllowed && isAudioAllowed;

  // Attach stream to video DOM element safely with muted property and play() Promise handling
  const attachStreamToVideo = (videoEl: HTMLVideoElement | null, stream: MediaStream | null) => {
    if (!videoEl || !stream) return;
    try {
      if (videoEl.srcObject !== stream) {
        videoEl.srcObject = stream;
      }
      videoEl.muted = true;
      videoEl.playsInline = true;
      videoEl.setAttribute('playsinline', 'true');
      videoEl.setAttribute('muted', 'true');
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // Benign autoplay rejection if element not yet interacted with
          console.warn('Video element play() deferred:', err);
        });
      }
    } catch (e) {
      console.warn('Failed to assign srcObject to video:', e);
    }
  };

  const handleVideoPreviewMount = (el: HTMLVideoElement | null) => {
    videoPreviewRef.current = el;
    if (el && desktopMediaStreamRef.current && isStreamActive(desktopMediaStreamRef.current)) {
      attachStreamToVideo(el, desktopMediaStreamRef.current);
    }
  };

  const handleExamVideoMount = (el: HTMLVideoElement | null) => {
    examVideoRef.current = el;
    if (el && desktopMediaStreamRef.current && isStreamActive(desktopMediaStreamRef.current)) {
      attachStreamToVideo(el, desktopMediaStreamRef.current);
    }
  };

  // Setup Web Audio Analyser for microphone meter if audio track is active
  const setupAudioAnalyser = (stream: MediaStream) => {
    if (stream.getAudioTracks().length === 0) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (audioContextRef.current) {
          audioContextRef.current.close().catch(() => {});
        }
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
  };

  // Comprehensive Camera & Mic Initialization with Diagnostics, Retry & Fallbacks
  const initializeCamera = async (forceRestart: boolean = false): Promise<MediaStream | null> => {
    // Prevent duplicate concurrent initialization
    if (isInitializingCameraRef.current) {
      return desktopMediaStreamRef.current;
    }

    // Reuse existing active stream if healthy and no forced restart requested
    if (!forceRestart && desktopMediaStreamRef.current && isStreamActive(desktopMediaStreamRef.current)) {
      setCameraPermissionState('granted');
      return desktopMediaStreamRef.current;
    }

    isInitializingCameraRef.current = true;
    setIsRequestingMedia(true);
    setCameraErrorInfo(null);

    // Stop prior tracks before requesting a fresh stream to prevent camera-in-use locks
    if (desktopMediaStreamRef.current) {
      desktopMediaStreamRef.current.getTracks().forEach((t) => t.stop());
      desktopMediaStreamRef.current = null;
    }
    setDesktopMediaStream(null);

    // Check Secure Context requirement (HTTPS or localhost)
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]';
    if (!window.isSecureContext && !isLocalhost) {
      const errInfo: CameraErrorInfo = {
        type: 'InsecureContext',
        message: 'Camera requires a secure HTTPS context.',
        guidance: 'Browsers block media device access over unencrypted HTTP. Please connect via HTTPS or localhost.',
      };
      setCameraErrorInfo(errInfo);
      setCameraPermissionState('denied');
      setIsRequestingMedia(false);
      isInitializingCameraRef.current = false;
      return null;
    }

    // Check mediaDevices support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const errInfo: CameraErrorInfo = {
        type: 'NotFoundError',
        message: 'WebRTC media devices API is unsupported in this browser.',
        guidance: 'Please update your browser to a modern version supporting navigator.mediaDevices.',
      };
      setCameraErrorInfo(errInfo);
      setCameraPermissionState('denied');
      setIsRequestingMedia(false);
      isInitializingCameraRef.current = false;
      return null;
    }

    let stream: MediaStream | null = null;

    // Attempt 1: Combined video + audio with optimal constraints
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      setMicPermissionState('granted');
    } catch (err1: any) {
      // Attempt 2: Basic video + audio
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setMicPermissionState('granted');
      } catch (err2: any) {
        // Attempt 3: Video-only fallback if microphone is blocked or missing
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
          setMicPermissionState('denied');
        } catch (err3: any) {
          const primaryErr = err3 || err2 || err1;
          const errorName = primaryErr?.name || 'UnknownError';
          let errInfo: CameraErrorInfo;

          if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
            errInfo = {
              type: 'NotAllowedError',
              message: 'Camera or microphone permission was denied or dismissed.',
              guidance: 'Click the camera/microphone icon in your browser address bar to allow device access, then click "Re-test Both Devices".',
            };
          } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
            errInfo = {
              type: 'NotFoundError',
              message: 'No video or audio input hardware detected.',
              guidance: 'Ensure your webcam and microphone are connected and recognized by your operating system, then click "Re-test Both Devices".',
            };
          } else if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
            errInfo = {
              type: 'NotReadableError',
              message: 'Camera or microphone is busy or in use by another application.',
              guidance: 'Close any application currently using your devices (Zoom, Teams, FaceTime, or other browser tabs), then retry.',
            };
          } else if (errorName === 'OverconstrainedError' || errorName === 'ConstraintNotSatisfiedError') {
            errInfo = {
              type: 'OverconstrainedError',
              message: 'Camera could not satisfy requested video constraints.',
              guidance: 'Default video resolution could not be fulfilled. Fallback to standard resolution will be attempted on retry.',
            };
          } else {
            errInfo = {
              type: 'Unknown',
              message: primaryErr?.message || 'Unable to start camera and microphone streams.',
              guidance: 'Please check browser device permissions and click "Re-test Both Devices".',
            };
          }

          setCameraErrorInfo(errInfo);
          setCameraPermissionState('denied');
          setIsRequestingMedia(false);
          isInitializingCameraRef.current = false;

          if (activeSession) {
            recordCandidateEvent(activeSession.session_id, {
              event_type: 'CAMERA_UNAVAILABLE',
              source: 'browser',
              metadata: {
                reason: errInfo.type,
                message: errInfo.message,
                client_timestamp: new Date().toISOString(),
                policy_note: 'IM-102 non-penalizing technical adversity',
              },
              is_simulated: false,
            });
          }
          return null;
        }
      }
    }

    if (stream) {
      desktopMediaStreamRef.current = stream;
      setDesktopMediaStream(stream);
      if (stream.getVideoTracks().length > 0) {
        setCameraPermissionState('granted');
      }
      if (stream.getAudioTracks().length > 0) {
        setMicPermissionState('granted');
      }
      setIsRequestingMedia(false);
      setCameraErrorInfo(null);
      isInitializingCameraRef.current = false;

      // Handle track unexpected termination (hardware disconnect or OS revocation)
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.onended = () => {
          console.warn('Camera video track ended unexpectedly');
          setCameraPermissionState('denied');
          setCameraErrorInfo({
            type: 'NotReadableError',
            message: 'Camera stream disconnected or was stopped by the operating system.',
            guidance: 'Click "Allow Camera" to re-establish your video feed.',
          });
        };
      }

      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.onended = () => {
          console.warn('Microphone audio track ended unexpectedly');
          setMicPermissionState('denied');
          setMicAudioLevel(0);
        };
      }

      // Setup Web Audio Analyser for microphone meter if audio track is active
      setupAudioAnalyser(stream);

      if (activeSession) {
        if (stream.getVideoTracks().length > 0) {
          recordCandidateEvent(activeSession.session_id, {
            event_type: 'CAMERA_PERMISSION_GRANTED',
            source: 'browser',
            is_simulated: false,
          });
        }
        if (stream.getAudioTracks().length > 0) {
          recordCandidateEvent(activeSession.session_id, {
            event_type: 'MICROPHONE_PERMISSION_GRANTED',
            source: 'browser',
            is_simulated: false,
          });
        }
      }

      return stream;
    }

    setIsRequestingMedia(false);
    isInitializingCameraRef.current = false;
    return null;
  };

  // User-facing camera permission trigger on Screen 4
  const handleRequestDesktopMedia = async () => {
    await initializeCamera(true);
  };

  // User-facing microphone-only permission trigger
  const handleRequestMicOnly = async () => {
    setIsRequestingMedia(true);
    setCameraErrorInfo(null);
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      const newAudioTrack = audioStream.getAudioTracks()[0];
      if (newAudioTrack) {
        newAudioTrack.onended = () => {
          console.warn('Microphone audio track ended unexpectedly');
          setMicPermissionState('denied');
          setMicAudioLevel(0);
        };

        let combinedStream: MediaStream;
        if (desktopMediaStreamRef.current && desktopMediaStreamRef.current.active) {
          desktopMediaStreamRef.current.getAudioTracks().forEach((t) => {
            t.stop();
            desktopMediaStreamRef.current?.removeTrack(t);
          });
          desktopMediaStreamRef.current.addTrack(newAudioTrack);
          combinedStream = desktopMediaStreamRef.current;
        } else {
          combinedStream = audioStream;
          desktopMediaStreamRef.current = combinedStream;
        }

        setDesktopMediaStream(new MediaStream(combinedStream.getTracks()));
        setMicPermissionState('granted');
        setupAudioAnalyser(combinedStream);

        if (activeSession) {
          recordCandidateEvent(activeSession.session_id, {
            event_type: 'MICROPHONE_PERMISSION_GRANTED',
            source: 'browser',
            is_simulated: false,
          });
        }
      }
    } catch (err: any) {
      setMicPermissionState('denied');
      setCameraErrorInfo({
        type: 'NotAllowedError',
        message: 'Microphone permission was denied or dismissed.',
        guidance: 'Please allow microphone access in your browser settings (look for the lock/mic icon in the address bar), then click "Allow Audio".',
      });
    } finally {
      setIsRequestingMedia(false);
    }
  };

  // User-facing camera-only permission trigger
  const handleRequestCameraOnly = async () => {
    setIsRequestingMedia(true);
    setCameraErrorInfo(null);
    try {
      const videoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });
      const newVideoTrack = videoStream.getVideoTracks()[0];
      if (newVideoTrack) {
        newVideoTrack.onended = () => {
          console.warn('Camera video track ended unexpectedly');
          setCameraPermissionState('denied');
          setCameraErrorInfo({
            type: 'NotReadableError',
            message: 'Camera stream disconnected or stopped.',
            guidance: 'Click "Allow Camera" to re-establish your video feed.',
          });
        };

        let combinedStream: MediaStream;
        if (desktopMediaStreamRef.current && desktopMediaStreamRef.current.active) {
          desktopMediaStreamRef.current.getVideoTracks().forEach((t) => {
            t.stop();
            desktopMediaStreamRef.current?.removeTrack(t);
          });
          desktopMediaStreamRef.current.addTrack(newVideoTrack);
          combinedStream = desktopMediaStreamRef.current;
        } else {
          combinedStream = videoStream;
          desktopMediaStreamRef.current = combinedStream;
        }

        setDesktopMediaStream(new MediaStream(combinedStream.getTracks()));
        setCameraPermissionState('granted');

        if (videoPreviewRef.current) {
          attachStreamToVideo(videoPreviewRef.current, combinedStream);
        }

        if (activeSession) {
          recordCandidateEvent(activeSession.session_id, {
            event_type: 'CAMERA_PERMISSION_GRANTED',
            source: 'browser',
            is_simulated: false,
          });
        }
      }
    } catch (err: any) {
      setCameraPermissionState('denied');
      setCameraErrorInfo({
        type: 'NotAllowedError',
        message: 'Camera permission was denied or dismissed.',
        guidance: 'Please allow camera access in your browser settings (look for the lock/camera icon in the address bar), then click "Allow Camera".',
      });
    } finally {
      setIsRequestingMedia(false);
    }
  };

  // Guarded transition from desktop_permissions to network_check
  const handleProceedToNetwork = () => {
    if (!isHardwareReady) {
      if (!isCameraAllowed && !isAudioAllowed) {
        setStatusNotice('Both Camera and Microphone permissions are required to proceed.');
      } else if (!isCameraAllowed) {
        setStatusNotice('Camera permission is required to proceed. Please enable your webcam.');
      } else {
        setStatusNotice('Microphone permission is required to proceed. Please enable your microphone.');
      }
      return;
    }
    setCurrentScreen('network_check');
  };

  // Stop Desktop Media tracks safely
  const handleStopDesktopMedia = () => {
    if (cvAnimationIdRef.current) {
      cancelAnimationFrame(cvAnimationIdRef.current);
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
    }
    if (desktopMediaStreamRef.current) {
      desktopMediaStreamRef.current.getTracks().forEach((track) => track.stop());
      desktopMediaStreamRef.current = null;
    }
    setDesktopMediaStream(null);
    setCameraPermissionState('denied');
    setMicPermissionState('denied');
    setMicAudioLevel(0);
  };

  // Teardown tracks when CandidatePortal unmounts
  useEffect(() => {
    return () => {
      if (cvAnimationIdRef.current) {
        cancelAnimationFrame(cvAnimationIdRef.current);
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
      if (desktopMediaStreamRef.current) {
        desktopMediaStreamRef.current.getTracks().forEach((track) => track.stop());
        desktopMediaStreamRef.current = null;
      }
    };
  }, []);

  // Ensure camera stream is attached to visible video elements whenever available
  useEffect(() => {
    if (desktopMediaStream && isStreamActive(desktopMediaStream)) {
      if (videoPreviewRef.current) {
        attachStreamToVideo(videoPreviewRef.current, desktopMediaStream);
      }
      if (examVideoRef.current) {
        attachStreamToVideo(examVideoRef.current, desktopMediaStream);
      }
    }
  }, [desktopMediaStream, currentScreen]);

  // Computer Vision Frame Analysis Engine
  const processVideoFrame = (videoEl: HTMLVideoElement): LiveDetectionResult | null => {
    if (!videoEl || videoEl.videoWidth === 0 || videoEl.videoHeight === 0 || videoEl.paused) {
      return null;
    }

    if (!offscreenCanvasRef.current) {
      const c = document.createElement('canvas');
      c.width = 160;
      c.height = 120;
      offscreenCanvasRef.current = c;
    }

    const offscreen = offscreenCanvasRef.current;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return null;

    if (simulatedCameraCut) {
      return {
        facePresent: false,
        faceCount: 0,
        faceConfidence: 0,
        headPose: 'forward',
        lightingLevel: 0,
        lightingCategory: 'low',
        boundingBox: null,
        secondaryBox: null,
        fps: currentFpsRef.current || 20,
        hasSimulatedPerson: false,
        hasSimulatedLowLight: false,
      };
    }

    try {
      offCtx.drawImage(videoEl, 0, 0, 160, 120);
      const imgData = offCtx.getImageData(0, 0, 160, 120);
      const data = imgData.data;
      const totalPixels = 160 * 120;

      let totalLuminance = 0;
      let skinCount = 0;
      let sumX = 0;
      let sumY = 0;
      let minX = 160;
      let maxX = 0;
      let minY = 120;
      let maxY = 0;

      let secondarySkinCount = 0;
      let secMinX = 160;
      let secMaxX = 0;
      let secMinY = 120;
      let secMaxY = 0;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Standard ITU-R BT.601 Luminance
        const y = 0.299 * r + 0.587 * g + 0.114 * b;
        totalLuminance += y;

        // YCbCr chrominance calculation
        const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
        const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

        // Inclusive skin chrominance boundary covering all human skin tones (Fitzpatrick I - VI)
        const isSkin =
          (cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173) ||
          (r > 70 && g > 35 && b > 20 && r > g && r > b && Math.abs(r - g) >= 12);

        if (isSkin) {
          const pxIndex = i / 4;
          const px = pxIndex % 160;
          const py = Math.floor(pxIndex / 160);

          if (px >= 25 && px <= 135) {
            skinCount++;
            sumX += px;
            sumY += py;
            if (px < minX) minX = px;
            if (px > maxX) maxX = px;
            if (py < minY) minY = py;
            if (py > maxY) maxY = py;
          } else {
            secondarySkinCount++;
            if (px < secMinX) secMinX = px;
            if (px > secMaxX) secMaxX = px;
            if (py < secMinY) secMinY = py;
            if (py > secMaxY) secMaxY = py;
          }
        }
      }

      const avgY = totalLuminance / totalPixels;
      let calculatedLux = Math.round((avgY / 255) * 80);
      if (simulatedPoorLighting) {
        calculatedLux = 11;
      }
      const lightingCategory = calculatedLux >= 18 ? 'adequate' : 'low';

      const facePresent = skinCount >= 140;
      let faceConfidence = 0;
      let primaryBox: { x: number; y: number; width: number; height: number } | null = null;
      let headPose: 'forward' | 'left' | 'right' | 'down' = 'forward';

      if (facePresent) {
        const cx = sumX / skinCount;
        const cy = sumY / skinCount;

        const boxW = Math.max(32, (maxX - minX) * 1.25);
        const boxH = Math.max(40, (maxY - minY) * 1.35);
        const boxX = Math.max(0, Math.min(160 - boxW, (minX + maxX) / 2 - boxW / 2));
        const boxY = Math.max(0, Math.min(120 - boxH, (minY + maxY) / 2 - boxH / 2));

        primaryBox = {
          x: boxX / 160,
          y: boxY / 120,
          width: boxW / 160,
          height: boxH / 120,
        };

        const baseConf = 80 + Math.min(18, Math.round((skinCount / 1200) * 15));
        faceConfidence = simulatedPoorLighting ? Math.max(40, baseConf - 35) : baseConf;

        const normCx = cx / 160;
        const normCy = cy / 120;
        if (normCx < 0.36) {
          headPose = 'right';
        } else if (normCx > 0.64) {
          headPose = 'left';
        } else if (normCy > 0.66) {
          headPose = 'down';
        } else {
          headPose = 'forward';
        }
      }

      let faceCount = facePresent ? 1 : 0;
      let secondaryBox: { x: number; y: number; width: number; height: number } | null = null;

      if (simulatedBackgroundPerson) {
        faceCount = 2;
        secondaryBox = {
          x: 0.70,
          y: 0.14,
          width: 0.22,
          height: 0.32,
        };
      } else if (facePresent && secondarySkinCount >= 160) {
        faceCount = 2;
        const secW = Math.max(24, (secMaxX - secMinX) * 1.2);
        const secH = Math.max(30, (secMaxY - secMinY) * 1.2);
        const secX = Math.max(0, Math.min(160 - secW, (secMinX + secMaxX) / 2 - secW / 2));
        const secY = Math.max(0, Math.min(120 - secH, (secMinY + secMaxY) / 2 - secH / 2));
        secondaryBox = {
          x: secX / 160,
          y: secY / 120,
          width: secW / 160,
          height: secH / 120,
        };
      }

      return {
        facePresent,
        faceCount,
        faceConfidence,
        headPose,
        lightingLevel: calculatedLux,
        lightingCategory,
        boundingBox: primaryBox,
        secondaryBox,
        fps: currentFpsRef.current || 20,
        hasSimulatedPerson: simulatedBackgroundPerson,
        hasSimulatedLowLight: simulatedPoorLighting,
      };
    } catch {
      return null;
    }
  };

  // Overlay HUD Renderer
  const drawOverlayHUD = (canvas: HTMLCanvasElement, res: LiveDetectionResult) => {
    const parent = canvas.parentElement;
    if (!parent) return;
    const width = parent.clientWidth || 320;
    const height = parent.clientHeight || 240;

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    if (res.facePresent && res.boundingBox) {
      const bx = res.boundingBox.x * width;
      const by = res.boundingBox.y * height;
      const bw = res.boundingBox.width * width;
      const bh = res.boundingBox.height * height;

      ctx.strokeStyle = res.headPose === 'forward' ? '#10b981' : '#0d9488';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, by, bw, bh);

      const cornerLen = Math.min(14, bw * 0.2);
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 3;

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(bx, by + cornerLen);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx + cornerLen, by);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(bx + bw - cornerLen, by);
      ctx.lineTo(bx + bw, by);
      ctx.lineTo(bx + bw, by + cornerLen);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(bx, by + bh - cornerLen);
      ctx.lineTo(bx, by + bh);
      ctx.lineTo(bx + cornerLen, by + bh);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(bx + bw - cornerLen, by + bh);
      ctx.lineTo(bx + bw, by + bh);
      ctx.lineTo(bx + bw, by + bh - cornerLen);
      ctx.stroke();

      // Center crosshair
      const cx = bx + bw / 2;
      const cy = by + bh / 2;
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy);
      ctx.lineTo(cx + 6, cy);
      ctx.moveTo(cx, cy - 6);
      ctx.lineTo(cx, cy + 6);
      ctx.stroke();

      // Top Floating Badge
      const badgeY = Math.max(18, by - 6);
      ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
      const label = `Candidate (Verified • ${Math.round(res.faceConfidence)}%)`;
      const textWidth = ctx.measureText(label).width;
      const badgeW = textWidth + 14;
      const badgeX = Math.max(4, Math.min(width - badgeW - 4, bx + (bw - badgeW) / 2));

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY - 14, badgeW, 16, 4);
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.fillText(label, badgeX + 7, badgeY - 3);

      // Bottom Pose Pill
      const poseY = Math.min(height - 8, by + bh + 16);
      const poseLabel = `Pose: ${res.headPose.toUpperCase()} • ${res.headPose === 'forward' ? 'FOCUSED' : 'DEFLECTED'}`;
      const poseTextWidth = ctx.measureText(poseLabel).width;
      const poseW = poseTextWidth + 12;
      const poseX = Math.max(4, Math.min(width - poseW - 4, bx + (bw - poseW) / 2));

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(poseX, poseY - 12, poseW, 14, 3);
      ctx.fill();

      ctx.fillStyle = res.headPose === 'forward' ? '#a7f3d0' : '#fde68a';
      ctx.fillText(poseLabel, poseX + 6, poseY - 2);
    }

    // Secondary Face (Shared Room / Background Person)
    if (res.faceCount >= 2 && res.secondaryBox) {
      const sx = res.secondaryBox.x * width;
      const sy = res.secondaryBox.y * height;
      const sw = res.secondaryBox.width * width;
      const sh = res.secondaryBox.height * height;

      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(sx, sy, sw, sh);
      ctx.setLineDash([]);

      const sLabel = 'Person 2 (Shared Room) • IM-102 0 Risk';
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      const sWidth = ctx.measureText(sLabel).width + 12;
      const sX = Math.max(4, Math.min(width - sWidth - 4, sx));
      const sY = Math.max(14, sy - 4);

      ctx.fillStyle = 'rgba(120, 53, 15, 0.9)';
      ctx.beginPath();
      ctx.roundRect(sX, sY - 12, sWidth, 14, 3);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#fef3c7';
      ctx.fillText(sLabel, sX + 6, sY - 2);
    }

    // Low Light alert tag if ambient lighting < 18 lux
    if (res.lightingCategory === 'low') {
      const luxLabel = `Low Ambient Light (${res.lightingLevel} Lux) • IM-102 Safeguarded`;
      ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
      const luxW = ctx.measureText(luxLabel).width + 12;
      ctx.fillStyle = 'rgba(180, 83, 9, 0.9)';
      ctx.beginPath();
      ctx.roundRect(6, height - 20, luxW, 15, 3);
      ctx.fill();
      ctx.fillStyle = '#fffbeb';
      ctx.fillText(luxLabel, 12, height - 9);
    }
  };

  // Computer Vision Real-Time Processing Loop
  useEffect(() => {
    let active = true;
    let lastTick = performance.now();
    let framesThisSec = 0;
    let lastFpsUpdate = performance.now();

    const tick = () => {
      if (!active) return;
      const now = performance.now();

      if (now - lastTick >= 50) {
        lastTick = now;
        framesThisSec++;
        if (now - lastFpsUpdate >= 1000) {
          currentFpsRef.current = Math.max(1, Math.round((framesThisSec * 1000) / (now - lastFpsUpdate)));
          framesThisSec = 0;
          lastFpsUpdate = now;
        }

        const activeVideo = currentScreen === 'desktop_permissions'
          ? videoPreviewRef.current
          : examVideoRef.current;

        if (activeVideo && isStreamActive(desktopMediaStreamRef.current)) {
          const result = processVideoFrame(activeVideo);
          if (result) {
            result.fps = currentFpsRef.current || 20;
            setLiveDetection(result);
            liveDetectionRef.current = result;

            if (currentScreen === 'desktop_permissions' && previewOverlayRef.current) {
              drawOverlayHUD(previewOverlayRef.current, result);
            } else if (currentScreen === 'active_exam' && examOverlayRef.current) {
              drawOverlayHUD(examOverlayRef.current, result);
            }
          }
        }
      }

      cvAnimationIdRef.current = requestAnimationFrame(tick);
    };

    if (currentScreen === 'desktop_permissions' || currentScreen === 'active_exam') {
      cvAnimationIdRef.current = requestAnimationFrame(tick);
    }

    return () => {
      active = false;
      if (cvAnimationIdRef.current) {
        cancelAnimationFrame(cvAnimationIdRef.current);
      }
    };
  }, [currentScreen, desktopMediaStream, simulatedBackgroundPerson, simulatedPoorLighting, simulatedCameraCut]);

  // Live Proctoring Telemetry Dispatch during Active Exam
  useEffect(() => {
    if (currentScreen !== 'active_exam' || !isExamRunning || !activeSession) return;

    const interval = setInterval(async () => {
      const elapsedSec = startTimeMs ? (Date.now() - startTimeMs) / 1000 : 0;
      const det = liveDetectionRef.current;

      try {
        await recordCandidateEvent(activeSession.session_id, {
          event_type: 'ENVIRONMENTAL_OBSERVATION',
          source: 'browser',
          metadata: {
            condition_type: 'live_frame_telemetry',
            frame_observation: {
              timestamp_sec: Math.round(elapsedSec * 10) / 10,
              face_present: det.facePresent ? 1 : 0,
              no_of_face: det.faceCount,
              face_conf: Math.round(det.faceConfidence),
              head_pose: det.headPose,
              phone_present: 0,
            },
            lighting_lux: det.lightingLevel,
            lighting_category: det.lightingCategory,
            detection_fps: det.fps || 20,
            policy_im102_applied: true,
          },
          is_simulated: simulatedBackgroundPerson || simulatedPoorLighting || simulatedCameraCut,
          evidence_reliability: 'high_browser_telemetry',
        });
      } catch (e) {
        console.warn('Periodic proctoring telemetry dispatch deferred:', e);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [currentScreen, isExamRunning, activeSession, startTimeMs, simulatedBackgroundPerson, simulatedPoorLighting, simulatedCameraCut]);

  // Auto-initialize camera if entering active_exam directly or on reload
  useEffect(() => {
    if (currentScreen === 'active_exam') {
      if (!desktopMediaStreamRef.current || !isStreamActive(desktopMediaStreamRef.current)) {
        initializeCamera().catch(() => {});
      }
    }
  }, [currentScreen]);

  // Auto-dismiss keyboard shortcut notice after 5 seconds
  useEffect(() => {
    if (!shortcutNotice) return;
    const timer = setTimeout(() => {
      setShortcutNotice(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [shortcutNotice]);

  // Measure Real Network Latency to backend
  const handleTestNetwork = async () => {
    setIsMeasuringNetwork(true);
    const t0 = performance.now();
    await checkBackendHealth();
    const t1 = performance.now();
    setPingMs(Math.round(t1 - t0));
    setIsMeasuringNetwork(false);
  };

  // Explicit Authorized Workflow: Capture Verification Snapshot under Candidate Consent
  const handleCaptureAuthorizedSnapshot = async () => {
    if (!examVideoRef.current || !desktopMediaStream || !isStreamActive(desktopMediaStream)) {
      setShortcutNotice('Cannot capture verification snapshot: camera stream is not active.');
      return;
    }
    try {
      const video = examVideoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setAuthorizedSnapshot({
          timestamp: new Date().toLocaleTimeString(),
          dataUrl,
        });
        setStatusNotice('Authorized proctoring snapshot captured with candidate consent (stored locally per Policy IM-102).');
        if (activeSession) {
          await recordCandidateEvent(activeSession.session_id, {
            event_type: 'ENVIRONMENTAL_OBSERVATION',
            source: 'candidate',
            metadata: {
              type: 'AUTHORIZED_PROCTORING_SNAPSHOT',
              timestamp: new Date().toISOString(),
              policy: 'IM-102',
              penalty_points: 0,
            },
            is_simulated: false,
          });
        }
      }
    } catch (e) {
      console.error('Failed to capture snapshot:', e);
    }
  };

  // Enter Fullscreen & Start Examination
  const handleEnterFullscreenAndStart = async () => {
    if (!isHardwareReady) {
      if (!isCameraAllowed && !isAudioAllowed) {
        setStatusNotice('Both camera and microphone access are required to begin the exam.');
      } else if (!isCameraAllowed) {
        setStatusNotice('Camera access is required to begin the exam. Please allow your webcam.');
      } else {
        setStatusNotice('Microphone access is required to begin the exam. Please allow your microphone.');
      }
      setCurrentScreen('desktop_permissions');
      return;
    }

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

    // Ensure camera is started upon entering the active exam
    if (!desktopMediaStreamRef.current || !isStreamActive(desktopMediaStreamRef.current)) {
      initializeCamera().catch((err) => {
        console.warn('Camera initialization during exam start encountered adversity:', err);
      });
    }

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

  // Restricted Examination Mode: Keyboard & Shortcut Controls
  useEffect(() => {
    if (currentScreen !== 'active_exam') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Check if user is focused on an editable element (typing answers or scratchpad)
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      // 2. Allow modifier keys themselves
      const isModifierOnly = ['Shift', 'Control', 'Alt', 'Meta'].includes(e.key);
      if (isModifierOnly) return;

      // 3. Intercept PrintScreen (Screen Capture shortcut)
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        setShortcutNotice('Screenshot shortcut (PrintScreen) intercepted. Screen capture is restricted during proctored exams under Policy IM-102.');
        if (activeSession) {
          recordCandidateEvent(activeSession.session_id, {
            event_type: 'EXAM_WARNING_ACKNOWLEDGED',
            source: 'browser',
            metadata: {
              interception: 'PrintScreen',
              client_timestamp: new Date().toISOString(),
              policy_note: 'IM-102 non-penalizing audit record',
            },
            is_simulated: false,
          });
        }
        return;
      }

      // 4. Intercept Page Print (Ctrl+P / Cmd+P)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        setShortcutNotice('Printing and page export shortcuts (Ctrl+P / Cmd+P) are disabled during the examination.');
        return;
      }

      // 5. Intercept Save Page (Ctrl+S / Cmd+S)
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        setShortcutNotice('Page saving shortcuts (Ctrl+S / Cmd+S) are disabled during the examination.');
        return;
      }

      // 6. Intercept Developer Tools (F12, Ctrl+Shift+I, Cmd+Option+I, Ctrl+Shift+J, Ctrl+Shift+C)
      if (
        e.key === 'F12' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i', 'I', 'j', 'J', 'c', 'C'].includes(e.key)) ||
        (e.metaKey && e.altKey && ['i', 'I', 'j', 'J', 'c', 'C'].includes(e.key))
      ) {
        e.preventDefault();
        setShortcutNotice('Developer tools shortcuts are disabled during the examination.');
        return;
      }

      // 7. Intercept View Source (Ctrl+U / Cmd+Option+U)
      if (
        ((e.ctrlKey || e.metaKey) && (e.key === 'u' || e.key === 'U')) ||
        (e.metaKey && e.altKey && (e.key === 'u' || e.key === 'U'))
      ) {
        e.preventDefault();
        setShortcutNotice('View Source shortcut is disabled during the examination.');
        return;
      }

      // 8. If candidate is NOT typing in an input, provide helpful exam option navigation
      if (!isInput) {
        if (['1', 'a', 'A'].includes(e.key)) {
          handleSelectOption('A');
        } else if (['2', 'b', 'B'].includes(e.key)) {
          handleSelectOption('B');
        } else if (['3', 'c', 'C'].includes(e.key)) {
          handleSelectOption('C');
        } else if (['4', 'd', 'D'].includes(e.key)) {
          handleSelectOption('D');
        } else if (e.key === 'ArrowRight' && currentQuestionIndex < SYNTHETIC_EXAM_QUESTIONS.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
        } else if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
          setCurrentQuestionIndex((prev) => prev - 1);
        }
      }
    };

    // Right-click contextmenu prevention on active exam
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setShortcutNotice('Right-click context menu is disabled during the active examination. Please use on-screen controls.');
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [currentScreen, activeSession, currentQuestionIndex]);

  // Restricted Examination Mode: Fullscreen & Tab Focus Monitors with Debounce
  useEffect(() => {
    if (currentScreen !== 'active_exam' || !activeSession) return;

    const cooldownMs = 1500;

    const handleFullscreenChange = () => {
      const isFs = Boolean(document.fullscreenElement);
      setIsFullscreen(isFs);
      const now = Date.now();
      if (!isFs && now - lastInterruptionTimeRef.current > cooldownMs) {
        lastInterruptionTimeRef.current = now;
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
      if (document.hidden && now - lastInterruptionTimeRef.current > cooldownMs) {
        lastInterruptionTimeRef.current = now;
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

    const handleWindowBlur = () => {
      const now = Date.now();
      if (now - lastInterruptionTimeRef.current > cooldownMs && !document.fullscreenElement) {
        lastInterruptionTimeRef.current = now;
        setWarningType('fullscreen_exit');
        setWarningCount((prev) => prev + 1);
        setWarningModalOpen(true);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
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
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in relative">
      {/* Fullscreen Interruption Warning Modal (Restricted Mode) */}
      {warningModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border-2 border-amber-500 shadow-2xl p-6 space-y-4 text-center animate-scale-up">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                Restricted Mode Alert #{warningCount}
              </span>
              <h3 className="text-base font-bold text-slate-900">
                {warningType === 'fullscreen_exit' ? 'Fullscreen Exited' : 'Tab Switched'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {warningType === 'fullscreen_exit'
                  ? 'Continuous fullscreen required during exam.'
                  : 'Tab switch detected and logged for review.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left">
              <strong className="text-slate-800 block mb-0.5">Policy IM-102 Notice:</strong>
              Interruptions do NOT automatically fail you. Please return to fullscreen.
            </div>

            <button
              onClick={handleAcknowledgeWarning}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <Maximize className="w-4 h-4" />
              <span>Return to Exam</span>
            </button>
          </div>
        </div>
      )}

      {/* Wizard Progress Ribbon */}
      {currentScreen !== 'active_exam' && currentScreen !== 'completion' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 overflow-x-auto gap-1">
            {[
              { id: 'welcome', label: '1. Intro' },
              { id: 'readiness', label: '2. System' },
              { id: 'qr_pairing', label: '3. Phone Scan' },
              { id: 'desktop_permissions', label: '4. Devices' },
              { id: 'network_check', label: '5. Network' },
              { id: 'privacy_consent', label: '6. Privacy' },
              { id: 'exam_rules', label: '7. Rules' },
            ].map((step, idx) => (
              <span
                key={idx}
                className={`whitespace-nowrap px-2.5 py-1 rounded-lg text-[11px] ${
                  currentScreen === step.id
                    ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200'
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
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200">
            <Shield className="w-5 h-5 stroke-[2.5]" />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                Candidate Portal
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {candidateRef}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">{examTitle}</h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
              Protected under <strong>Policy IM-102</strong>: Shared rooms, low lighting, or temporary network drops
              never trigger penalties.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <div className="font-semibold text-slate-800 text-[11px]">Room Declaration:</div>
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isSharedRoom}
                onChange={(e) => setIsSharedRoom(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-slate-700 text-xs leading-normal">
                <strong>Shared Room Active:</strong> Roommates or family members may periodically walk behind me (0 penalty).
              </span>
            </label>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">5 Min &middot; 5 Questions</span>
            <button
              onClick={() => setCurrentScreen('readiness')}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Next: System Check</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 2: SYSTEM READINESS CHECK */}
      {currentScreen === 'readiness' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">System Readiness</h2>
            <p className="text-xs text-slate-500">
              Verifying browser and hardware compatibility.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">Operating System</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-slate-500">{navigator.platform} &middot; Compatible</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">Browser</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-slate-500">{navigator.userAgent.slice(0, 36)}... &middot; Supported</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">Display & Screen</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-slate-500">
                {window.screen.width} &times; {window.screen.height} &middot; Fullscreen Ready
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">Live Telemetry</span>
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-slate-500">Event Stream &middot; Connected</p>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setCurrentScreen('welcome')}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
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
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Next: Phone Scan</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 3: QR PAIRING & MOBILE ENVIRONMENT CHECK */}
      {currentScreen === 'qr_pairing' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-teal-600" />
                <h2 className="text-base font-bold text-slate-900">Mobile Room & Desk Scan</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Scan QR code with smartphone camera for a 60-second sweep.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                  pairingStatus?.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : pairingStatus?.status === 'in_progress'
                    ? 'bg-sky-50 text-sky-800 border border-sky-200'
                    : pairingCountdown === 0
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {pairingStatus?.status === 'completed' ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Check Done</span>
                  </>
                ) : pairingStatus?.status === 'in_progress' ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-sky-600 animate-spin" />
                    <span>Phone Connected</span>
                  </>
                ) : pairingCountdown === 0 ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Token Expired</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span>Awaiting Scan</span>
                  </>
                )}
              </span>
            </div>
          </div>

          {/* QR Display Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
            {/* Left QR Column */}
            <div className="flex flex-col items-center justify-center p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
              {pairingData && pairingCountdown > 0 ? (
                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
                  <QRCodeSVG value={pairingData.qr_payload_url} size={160} level="M" includeMargin={false} />
                </div>
              ) : (
                <div className="w-40 h-40 bg-slate-100 rounded-xl flex flex-col items-center justify-center text-center p-4 text-xs text-slate-500 space-y-2">
                  <AlertTriangle className="w-6 h-6 text-rose-500" />
                  <span>Token Expired</span>
                </div>
              )}

              <div className="text-center space-y-0.5">
                <span className="text-[10px] text-slate-400">Pairing Code:</span>
                <div className="font-mono text-lg font-bold tracking-widest text-teal-600">
                  {pairingData?.pairing_code || 'FP-....'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Expires in: {formatTimer(pairingCountdown)}</span>
                </div>
              </div>

              {/* Regenerate Action */}
              <button
                onClick={() => handleGeneratePairing()}
                disabled={isGeneratingPairing}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-300 text-[11px] text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isGeneratingPairing ? 'animate-spin' : ''}`} />
                <span>Regenerate QR</span>
              </button>
            </div>

            {/* Right Instructions Column */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-xs">
                  <Shield className="w-3.5 h-3.5 text-teal-600" />
                  <span>Privacy Guarantee (IM-102)</span>
                </div>
                <p className="leading-relaxed text-[11px] text-teal-800">
                  Checks lighting and desk surface. Video is processed locally on phone with 0 cloud storage. Background people do not count as violations.
                </p>
              </div>

              {/* Quick Link for Testing / Evaluation */}
              {pairingData && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                  <span className="font-semibold text-slate-700 text-[11px] block">
                    Same-Device Testing:
                  </span>
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <a
                      href={pairingData.qr_payload_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-teal-600 font-semibold hover:underline"
                    >
                      <span>Open in New Tab</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="text-slate-300">&bull;</span>
                    <button
                      onClick={handleSimulateMobileCheck}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:underline"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>Simulate Mobile Scan</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Host Origin Configuration for LAN Mobile Testing */}
              <div className="text-xs space-y-1">
                <button
                  onClick={() => setShowOriginConfig(!showOriginConfig)}
                  className="text-slate-500 hover:text-slate-700 inline-flex items-center gap-1 text-[11px]"
                >
                  <Sliders className="w-3 h-3" />
                  <span>Network IP ({frontendOrigin})</span>
                </button>

                {showOriginConfig && (
                  <div className="p-2.5 rounded-lg bg-slate-100 space-y-1.5 border border-slate-200">
                    <label className="text-[10px] text-slate-600 block">
                      LAN IP for QR payload:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={frontendOrigin}
                        onChange={(e) => setFrontendOrigin(e.target.value)}
                        className="flex-1 bg-white border border-slate-300 rounded-lg p-1 text-xs font-mono"
                      />
                      <button
                        onClick={() => handleGeneratePairing()}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 text-white text-xs font-medium"
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
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Skip Check (Limited Mode)
            </button>

            <button
              onClick={() => setCurrentScreen('desktop_permissions')}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm ${
                pairingStatus?.status === 'completed' || isMobileCheckSkipped
                  ? 'bg-teal-600 hover:bg-teal-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>Next: Hardware Setup</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 4: DESKTOP CAMERA & MICROPHONE PERMISSIONS */}
      {currentScreen === 'desktop_permissions' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Mandatory Hardware Check
              </span>
              <span className="text-xs text-slate-400 font-medium">Step 4 of 7</span>
            </div>
            <h2 className="text-base font-bold text-slate-900">Camera & Microphone Access</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Both webcam and microphone permissions are <strong>strictly required</strong> to proceed to the examination. Audio and video telemetry are processed locally on your device under Policy IM-102.
            </p>
          </div>

          {/* Mandatory Requirement Status Banner */}
          {!isHardwareReady ? (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-start gap-3 shadow-xs">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-bold text-amber-950">
                  Permission Required to Proceed
                </p>
                <p className="text-amber-800 leading-relaxed text-[11px]">
                  {!isCameraAllowed && !isAudioAllowed
                    ? 'Both camera and microphone access are required. The "Next" step remains locked until both devices are enabled and verified.'
                    : !isCameraAllowed
                    ? 'Webcam access is required. Please allow your camera in your browser to unlock the next step.'
                    : 'Microphone access is required. Please allow your microphone in your browser to unlock the next step.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2.5 text-xs shadow-xs">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div>
                <span className="font-bold text-emerald-950">Camera & Microphone Verified! </span>
                <span className="text-emerald-800 text-[11px]">Both devices are active and telemetry is ready. You may now advance to the next step.</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
            {/* Live Camera Preview */}
            <div className="relative aspect-video rounded-2xl bg-slate-900 overflow-hidden border border-slate-200 flex items-center justify-center min-h-[220px]">
              {isRequestingMedia ? (
                <div className="p-4 text-center space-y-2 text-white">
                  <RefreshCw className="w-7 h-7 text-teal-400 animate-spin mx-auto" />
                  <p className="text-xs font-semibold">Requesting Device Access...</p>
                  <p className="text-[11px] text-slate-400">Please respond to the browser permission prompt.</p>
                </div>
              ) : isCameraAllowed ? (
                <>
                  <video
                    ref={handleVideoPreviewMount}
                    autoPlay
                    playsInline
                    muted
                    onLoadedMetadata={(e) => {
                      const v = e.currentTarget;
                      v.muted = true;
                      v.play().catch(() => {});
                    }}
                    onCanPlay={(e) => {
                      const v = e.currentTarget;
                      v.play().catch(() => {});
                    }}
                    className="w-full h-full object-cover"
                  />
                  <canvas
                    ref={previewOverlayRef}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                  />

                  {/* Live Detection HUD Pill */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl text-white text-[11px] border border-white/10 shadow-lg">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          liveDetection.facePresent ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                        }`}
                      />
                      <span className="font-semibold">
                        {liveDetection.facePresent
                          ? `${liveDetection.faceCount === 1 ? '1 Face Verified' : `${liveDetection.faceCount} Faces`} (${Math.round(
                              liveDetection.faceConfidence
                            )}% conf)`
                          : 'Detecting Face...'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-300 text-[10px]">
                      <span>
                        Pose: <strong className="text-white capitalize">{liveDetection.headPose}</strong>
                      </span>
                      <span>
                        Lux: <strong className="text-white">{liveDetection.lightingLevel} ({liveDetection.lightingCategory})</strong>
                      </span>
                      <span className="font-mono text-teal-300">{liveDetection.fps || 20} FPS</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 text-center space-y-2 max-w-xs">
                  <VideoOff className="w-8 h-8 text-rose-500 mx-auto" />
                  <p className="text-xs text-slate-800 font-bold">
                    {cameraErrorInfo ? cameraErrorInfo.message : 'Webcam Inactive (Required)'}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    {cameraErrorInfo ? cameraErrorInfo.guidance : 'Camera access is required. Click "Allow Camera" or "Enable Both Devices" below.'}
                  </p>
                </div>
              )}

              {/* Status indicator pill on preview */}
              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] text-slate-700 border border-slate-200 shadow-xs">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isCameraAllowed
                      ? 'bg-emerald-500'
                      : isRequestingMedia
                      ? 'bg-amber-500 animate-pulse'
                      : 'bg-rose-500'
                  }`}
                />
                <span className="font-medium">
                  {isCameraAllowed
                    ? 'Camera Live & CV Active'
                    : isRequestingMedia
                    ? 'Requesting...'
                    : 'Camera Required'}
                </span>
              </div>
            </div>

            {/* Devices Checklist & Permissions Controls */}
            <div className="space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                {/* Camera Card */}
                <div className={`p-3.5 rounded-xl border transition-all ${
                  isCameraAllowed
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-rose-50/40 border-rose-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${
                        isCameraAllowed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {isCameraAllowed ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">Webcam Video</span>
                          <span className="text-[10px] text-rose-600 font-semibold">*Required</span>
                        </div>
                        <p className="text-[11px] text-slate-500">Focus and gaze verification</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCameraAllowed ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <button
                          onClick={handleRequestCameraOnly}
                          disabled={isRequestingMedia}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <Video className="w-3 h-3" />
                          <span>Allow Camera</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Microphone Card */}
                <div className={`p-3.5 rounded-xl border transition-all ${
                  isAudioAllowed
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-rose-50/40 border-rose-200'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${
                        isAudioAllowed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        {isAudioAllowed ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">Microphone Audio</span>
                          <span className="text-[10px] text-rose-600 font-semibold">*Required</span>
                        </div>
                        <p className="text-[11px] text-slate-500">Acoustic environment telemetry</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAudioAllowed ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 border border-emerald-200 font-mono">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>{micAudioLevel}%</span>
                        </span>
                      ) : (
                        <button
                          onClick={handleRequestMicOnly}
                          disabled={isRequestingMedia}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold transition-colors flex items-center gap-1 shadow-xs"
                        >
                          <Mic className="w-3 h-3" />
                          <span>Allow Audio</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mic Level bar */}
                  <div className="mt-2.5 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>Audio Input Level</span>
                      <span>{isAudioAllowed ? (micAudioLevel > 0 ? 'Detecting audio' : 'Active (Quiet)') : 'Blocked / Muted'}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-100 rounded-full"
                        style={{ width: `${isAudioAllowed ? micAudioLevel : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Dual-Device Controls */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRequestDesktopMedia}
                    disabled={isRequestingMedia}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    {isRequestingMedia ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    <span>{isHardwareReady ? 'Re-test Both Devices' : 'Enable Both Camera & Mic'}</span>
                  </button>

                  {desktopMediaStream && (
                    <button
                      onClick={handleStopDesktopMedia}
                      className="px-3 py-2 rounded-xl border border-rose-200 text-rose-600 text-xs hover:bg-rose-50 transition-colors font-medium"
                    >
                      Stop
                    </button>
                  )}
                </div>

                {cameraErrorInfo && (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-0.5">
                    <strong>Permission Help: </strong>
                    <span>{cameraErrorInfo.guidance}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Step Navigation */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <button
              onClick={() => setCurrentScreen('qr_pairing')}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors w-full sm:w-auto"
            >
              Back
            </button>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {!isHardwareReady && (
                <span className="text-[11px] text-amber-700 flex items-center gap-1 font-semibold">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Allow camera & audio to proceed</span>
                </span>
              )}
              <button
                onClick={handleProceedToNetwork}
                disabled={!isHardwareReady}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 w-full sm:w-auto ${
                  isHardwareReady
                    ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm cursor-pointer'
                    : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed opacity-80'
                }`}
                title={
                  !isHardwareReady
                    ? 'Camera and Microphone access are both required to advance to the next step'
                    : 'Proceed to Network check'
                }
              >
                {!isHardwareReady ? (
                  <Lock className="w-3.5 h-3.5" />
                ) : null}
                <span>Next: Network</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 5: NETWORK QUALITY CHECK */}
      {currentScreen === 'network_check' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">Network Quality</h2>
            <p className="text-xs text-slate-500">
              Measuring connection latency to assessment server.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200">
                <Wifi className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-slate-800 text-xs block">
                  Server Latency (Ping)
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {pingMs !== null ? `${pingMs} ms round-trip` : 'Ready to test'}
                </span>
              </div>
            </div>

            <button
              onClick={handleTestNetwork}
              disabled={isMeasuringNetwork}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors"
            >
              {isMeasuringNetwork ? 'Testing...' : 'Test Network Ping'}
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <strong>Policy IM-102 Safeguard: </strong>
            Network drops or packet loss do NOT penalize candidate scores. Answers are queued and synced safely.
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setCurrentScreen('desktop_permissions')}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentScreen('privacy_consent')}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Next: Privacy</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 6: PRIVACY NOTICE & EXPLICIT CONSENT */}
      {currentScreen === 'privacy_consent' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900">Privacy & Consent</h2>
            <p className="text-xs text-slate-500">
              Fairness safeguards and data policies under Policy IM-102.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 leading-relaxed">
            <p>
              <strong>1. Local Processing:</strong> Audio/video streams are analyzed on your device; zero video files are saved to the cloud.
            </p>
            <p>
              <strong>2. Zero Biometrics:</strong> No facial recognition, biometric profiling, or identity matching.
            </p>
            <p>
              <strong>3. Shared Room Safe:</strong> Family members or roommates passing in the background do NOT penalize scores.
            </p>
            <p>
              <strong>4. Advisory Scores:</strong> AI scores assist human reviewers. Automatic disqualification is prohibited.
            </p>
            <p>
              <strong>5. Screen Focus & Capture Policy:</strong> Continuous fullscreen focus is required during the exam. Screenshot shortcuts (PrintScreen), page printing (Ctrl/Cmd+P), page saving (Ctrl/Cmd+S), and developer tools are restricted to safeguard test integrity. No covert screen recording or hidden surveillance is conducted.
            </p>
          </div>

          <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-700">
            <input
              type="checkbox"
              checked={hasProctoringConsent}
              onChange={(e) => setHasProctoringConsent(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span>
              I consent to local video/audio proctoring and exam focus monitoring under Policy IM-102.
            </span>
          </label>

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setCurrentScreen('network_check')}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentScreen('exam_rules')}
              disabled={!hasProctoringConsent}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Next: Rules</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 7: EXAM RULES & RESTRICTED LOCKDOWN ENTRY */}
      {currentScreen === 'exam_rules' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5">
          <div className="space-y-1">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
              Restricted Exam Mode
            </span>
            <h2 className="text-base font-bold text-slate-900">Exam Rules & Fullscreen</h2>
            <p className="text-xs text-slate-500">
              Exam guidelines before entering fullscreen mode.
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <Maximize className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-slate-900 block mb-0.5 text-xs">Fullscreen Focus</strong>
                <span className="text-slate-600 text-[11px] leading-tight">
                  Fullscreen starts automatically. Exits prompt a return modal.
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <Layers className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-slate-900 block mb-0.5 text-xs">Tab Monitoring</strong>
                <span className="text-slate-600 text-[11px] leading-tight">
                  Switching tabs logs an event for human proctor context.
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong className="text-slate-900 block mb-0.5 text-xs">Browser Security Boundaries</strong>
                <span className="text-slate-600 text-[11px] leading-tight">
                  Proctoring operates via standard browser APIs. It intercepts conflicting application-level shortcuts without globally disabling keyboard input or interfering with operating system controls.
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-900 leading-tight">
            <strong>Fairness Safeguard: </strong>
            Accidental exits do NOT fail your exam. An alert will ask you to return.
          </div>

          {!isHardwareReady && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs shadow-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>
                  <strong>Device Permissions Incomplete: </strong>
                  Both camera and microphone access are strictly required to start the exam.
                </span>
              </div>
              <button
                onClick={() => setCurrentScreen('desktop_permissions')}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] whitespace-nowrap"
              >
                Enable Devices
              </button>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            <button
              onClick={() => setCurrentScreen('privacy_consent')}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleEnterFullscreenAndStart}
              disabled={!isHardwareReady}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-colors flex items-center gap-2 shadow-sm ${
                isHardwareReady
                  ? 'bg-teal-600 hover:bg-teal-700 text-white cursor-pointer'
                  : 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-80'
              }`}
              title={
                !isHardwareReady
                  ? 'Both camera and microphone must be enabled to start the exam'
                  : 'Enter fullscreen and begin exam'
              }
            >
              {!isHardwareReady && <Lock className="w-3.5 h-3.5" />}
              <Maximize className="w-4 h-4" />
              <span>Start Fullscreen Exam</span>
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 8: ACTIVE EXAMINATION INTERFACE */}
      {currentScreen === 'active_exam' && (
        <div className="space-y-4">
          {/* Keyboard Shortcut & Screen Capture Warning Banner */}
          {shortcutNotice && (
            <div className="p-3 rounded-xl bg-amber-50 border-2 border-amber-300 text-xs text-amber-900 flex items-center justify-between shadow-xs animate-fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>{shortcutNotice}</span>
              </div>
              <button
                onClick={() => setShortcutNotice(null)}
                className="text-amber-600 hover:text-amber-800 font-bold ml-2 text-sm"
              >
                &times;
              </button>
            </div>
          )}

          {/* Top Exam Header with Fullscreen Indicator */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-xl bg-slate-100 font-mono text-sm font-bold text-slate-900 flex items-center gap-1.5 border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
                <span>{formatTimer(secondsRemaining)}</span>
              </div>
              <div className="text-xs">
                <span className="font-semibold text-slate-800 block text-xs">
                  Q{currentQuestionIndex + 1} of {SYNTHETIC_EXAM_QUESTIONS.length}
                </span>
                <span className="text-slate-400 text-[11px]">{answeredCount} of {SYNTHETIC_EXAM_QUESTIONS.length} Done</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>RESTRICTED MODE</span>
              </span>

              <button
                onClick={() => setCurrentScreen('submission_confirm')}
                className="px-3 py-1 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-xs"
              >
                Submit Exam
              </button>
            </div>
          </div>

          {/* Status Feedback Notice */}
          {statusNotice && (
            <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-800 flex items-center justify-between animate-fade-in">
              <span>{statusNotice}</span>
              <button onClick={() => setStatusNotice(null)} className="text-slate-400 hover:text-slate-600 text-xs">
                &times;
              </button>
            </div>
          )}

          {/* Main Question + Video Preview Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Question Panel */}
            <div className="lg:col-span-2 p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3.5">
              <div className="text-[11px] font-bold text-teal-600 uppercase tracking-wider">
                {currentQ.category}
              </div>

              <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">{currentQ.text}</h3>

              {/* Options */}
              <div className="space-y-1.5 pt-1">
                {currentQ.options.map((opt) => {
                  const isSelected = selectedAnswers[currentQ.id] === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleSelectOption(opt.key)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-center gap-2.5 ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50 text-teal-900 font-semibold ring-1 ring-teal-500/30'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs ${
                          isSelected
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className="flex-1 text-xs">{opt.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Candidate Scratchpad (Permitted Normal Keyboard Input) */}
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700">
                  <label htmlFor={`scratchpad-${currentQ.id}`}>Candidate Scratchpad / Rough Work:</label>
                  <span className="text-[10px] text-slate-400 font-normal">Normal typing fully supported</span>
                </div>
                <textarea
                  id={`scratchpad-${currentQ.id}`}
                  rows={2}
                  value={candidateNotes[currentQ.id] || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCandidateNotes((prev) => ({ ...prev, [currentQ.id]: val }));
                  }}
                  placeholder="Type rough work notes, formulas, or answer justification here..."
                  className="w-full p-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20"
                />
              </div>

              {/* Question Navigation */}
              <div className="pt-3 flex items-center justify-between border-t border-slate-100">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  className="px-3 py-1 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                >
                  Prev
                </button>
                <div className="flex gap-1">
                  {SYNTHETIC_EXAM_QUESTIONS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentQuestionIndex(i)}
                      className={`w-6 h-6 rounded-md text-xs font-semibold ${
                        currentQuestionIndex === i
                          ? 'bg-teal-600 text-white'
                          : selectedAnswers[i + 1]
                          ? 'bg-slate-100 text-slate-800 border border-slate-200'
                          : 'border border-slate-200 text-slate-400'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                <button
                  disabled={currentQuestionIndex === SYNTHETIC_EXAM_QUESTIONS.length - 1}
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  className="px-3 py-1 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Candidate Desktop Video Preview & Demo Controls Drawer */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800 block">
                    Proctor Telemetry
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      cameraPermissionState === 'granted' && isStreamActive(desktopMediaStream) && !simulatedCameraCut
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : isRequestingMedia
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {cameraPermissionState === 'granted' && isStreamActive(desktopMediaStream) && !simulatedCameraCut
                      ? 'Live Stream'
                      : isRequestingMedia
                      ? 'Connecting'
                      : 'Offline'}
                  </span>
                </div>

                <div className="relative aspect-video rounded-xl bg-slate-900 overflow-hidden border border-slate-200 flex items-center justify-center">
                  {isRequestingMedia ? (
                    <div className="text-center p-3 space-y-1.5 text-white">
                      <RefreshCw className="w-5 h-5 mx-auto text-teal-400 animate-spin" />
                      <span className="text-xs font-semibold block">Starting Camera...</span>
                      <span className="text-[10px] text-slate-400">Connecting to webcam device</span>
                    </div>
                  ) : cameraPermissionState === 'granted' && isStreamActive(desktopMediaStream) && !simulatedCameraCut ? (
                    <>
                      <video
                        ref={handleExamVideoMount}
                        autoPlay
                        playsInline
                        muted
                        onLoadedMetadata={(e) => {
                          const v = e.currentTarget;
                          v.muted = true;
                          v.play().catch(() => {});
                        }}
                        onCanPlay={(e) => {
                          const v = e.currentTarget;
                          v.play().catch(() => {});
                        }}
                        className="w-full h-full object-cover"
                      />
                      <canvas
                        ref={examOverlayRef}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                      />
                    </>
                  ) : (
                    <div className="text-center p-3 text-xs text-slate-400 space-y-2 max-w-[210px]">
                      <VideoOff className="w-5 h-5 mx-auto text-amber-400" />
                      <div>
                        <span className="text-xs font-semibold text-slate-200 block">
                          {cameraErrorInfo ? cameraErrorInfo.message : (simulatedCameraCut ? 'Camera Interrupted' : 'Camera Inactive')}
                        </span>
                        <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                          {cameraErrorInfo ? cameraErrorInfo.guidance : 'Camera is not currently capturing frames.'}
                        </span>
                      </div>
                      <button
                        onClick={() => initializeCamera(true)}
                        disabled={isRequestingMedia}
                        className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-[11px] shadow-xs inline-flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Retry Camera</span>
                      </button>
                    </div>
                  )}

                  {/* Privacy pill */}
                  <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-[9px] text-teal-300 font-mono border border-teal-500/30">
                    Local IM-102 CV
                  </div>
                </div>

                {/* Real-Time Detection Telemetry Panel */}
                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Candidate Focus:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        liveDetection.facePresent && liveDetection.headPose === 'forward'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : liveDetection.facePresent
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {liveDetection.facePresent
                        ? (liveDetection.headPose === 'forward'
                          ? 'Focused (Forward)'
                          : `Deflected (${liveDetection.headPose})`)
                        : 'No Face Detected'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Faces Observed:</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      {liveDetection.faceCount === 1 ? (
                        <span className="text-emerald-700 font-medium">1 Verified</span>
                      ) : liveDetection.faceCount >= 2 ? (
                        <span className="text-amber-700 font-medium flex items-center gap-1">
                          <span>2 Persons</span>
                          <span className="text-[9px] bg-amber-100 text-amber-800 px-1 rounded font-mono font-bold">
                            IM-102 0 Risk
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-400">None detected</span>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Ambient Light:</span>
                    <span
                      className={`font-semibold text-[10px] ${
                        liveDetection.lightingCategory === 'adequate'
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {liveDetection.lightingLevel} Lux ({liveDetection.lightingCategory})
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Microphone:</span>
                    <span className="font-semibold text-emerald-600">
                      {micPermissionState === 'granted' ? `Active (${micAudioLevel}%)` : 'Muted'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 border-t border-slate-100">
                    <span>CV Frame Rate:</span>
                    <span className="font-mono text-teal-600 font-bold">{liveDetection.fps || 20} FPS</span>
                  </div>
                </div>
              </div>

              {/* Demo Simulation Controls Drawer */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 shadow-xs space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Demo Conditions</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Simulate events to verify Policy IM-102 safeguards in reviewer queue:
                </p>

                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    onClick={handleTriggerSimulatedBackgroundPerson}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-amber-400 text-left"
                  >
                    <strong className="block text-slate-800 text-[11px]">Shared Room</strong>
                    <span className="text-[10px] text-slate-400">2nd Person</span>
                  </button>

                  <button
                    onClick={handleTriggerSimulatedLighting}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-amber-400 text-left"
                  >
                    <strong className="block text-slate-800 text-[11px]">Low Light</strong>
                    <span className="text-[10px] text-slate-400">&lt;15 Lux</span>
                  </button>

                  <button
                    onClick={handleTriggerSimulatedNetworkDegradation}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-amber-400 text-left"
                  >
                    <strong className="block text-slate-800 text-[11px]">Net Drop</strong>
                    <span className="text-[10px] text-slate-400">Loss 18%</span>
                  </button>

                  <button
                    onClick={handleTriggerSimulatedCameraCut}
                    className="p-1.5 rounded-lg bg-white border border-slate-200 hover:border-amber-400 text-left"
                  >
                    <strong className="block text-slate-800 text-[11px]">Camera Cut</strong>
                    <span className="text-[10px] text-slate-400">5-Sec Pause</span>
                  </button>
                </div>

                {/* Explicit Authorized Workflow: Capture Verification Snapshot */}
                <div className="pt-1.5 border-t border-amber-200/60">
                  <button
                    onClick={handleCaptureAuthorizedSnapshot}
                    className="w-full py-1.5 px-2 rounded-lg bg-white border border-amber-300 hover:bg-amber-100/60 text-slate-800 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-700" />
                    <span>Capture Authorized Verification Snapshot</span>
                  </button>

                  {authorizedSnapshot && (
                    <div className="mt-2 p-2 rounded-lg bg-white border border-slate-200 flex items-center gap-2">
                      <img
                        src={authorizedSnapshot.dataUrl}
                        alt="Authorized Snapshot"
                        className="w-12 h-9 object-cover rounded border border-slate-200"
                      />
                      <div className="text-[10px] leading-tight">
                        <strong className="text-slate-800 block">Authorized Snapshot</strong>
                        <span className="text-slate-400">{authorizedSnapshot.timestamp} &middot; Candidate Consent</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN 9: SUBMISSION CONFIRMATION MODAL */}
      {currentScreen === 'submission_confirm' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4 text-center max-w-md mx-auto">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <AlertTriangle className="w-5 h-5" />
          </div>

          <div className="space-y-0.5">
            <h2 className="text-base font-bold text-slate-900">Submit Exam?</h2>
            <p className="text-xs text-slate-500">
              Answered {answeredCount} of {SYNTHETIC_EXAM_QUESTIONS.length} questions.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left">
            Your responses and proctoring telemetry will be submitted for human review.
          </div>

          <div className="flex gap-2.5 pt-1">
            <button
              onClick={() => setCurrentScreen('active_exam')}
              className="flex-1 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Back to Exam
            </button>
            <button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="flex-1 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs"
            >
              {isSubmitting ? 'Submitting...' : 'Confirm Submit'}
            </button>
          </div>
        </div>
      )}

      {/* SCREEN 10: COMPLETION SUMMARY */}
      {currentScreen === 'completion' && (
        <div className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle className="w-6 h-6" />
          </div>

          <div className="space-y-0.5">
            <h2 className="text-xl font-bold text-slate-900">Exam Submitted</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Answers and environment check transmitted to the assessment server.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-xs space-y-1.5 text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">Session ID:</span>
              <span className="font-mono font-bold text-slate-900">{activeSession?.session_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mobile Check:</span>
              <span className="font-semibold text-emerald-600">
                {pairingStatus?.status === 'completed' ? 'Verified' : 'Skipped (Limited)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Shared Room Safeguard:</span>
              <span className="font-semibold text-teal-600">Active (0 Penalty)</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              onClick={() => onReturnToReviewer(activeSession?.session_id)}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>View in Reviewer Portal</span>
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
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Start Another Mock Exam
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
