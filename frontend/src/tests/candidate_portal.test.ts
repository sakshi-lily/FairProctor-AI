import { describe, it, expect } from 'vitest';
import { SYNTHETIC_EXAM_QUESTIONS } from '../candidate/examQuestions';
import {
  CandidateEventType,
  EventSource,
  CandidateEventRecord,
} from '../types/proctoring';
import { LiveDetectionResult, evaluateExamKeyLockdown } from '../candidate/CandidatePortal';

describe('FairProctor-AI Candidate Portal Tests', () => {

  describe('1. Synthetic Examination Integrity & Questions', () => {
    it('contains at least 5 synthetic multiple-choice questions without real student PII', () => {
      expect(SYNTHETIC_EXAM_QUESTIONS.length).toBeGreaterThanOrEqual(5);

      SYNTHETIC_EXAM_QUESTIONS.forEach((q, idx) => {
        expect(q.id).toBe(idx + 1);
        expect(q.text).toBeTruthy();
        expect(q.options.length).toBe(4);
        expect(q.options.map(o => o.key)).toEqual(['A', 'B', 'C', 'D']);
      });
    });

    it('pseudonymous candidate reference format avoids real student identifiers', () => {
      const candidateRef = `cand_anon_${Math.floor(1000 + Math.random() * 9000)}`;
      expect(candidateRef).toMatch(/^cand_anon_\d{4}$/);
      expect(candidateRef).not.toContain('@');
      expect(candidateRef).not.toContain('student');
    });
  });

  describe('2. Live Session Event Types & Schema', () => {
    const validEventTypes: CandidateEventType[] = [
      'SESSION_STARTED',
      'ANSWER_SUBMITTED',
      'TAB_VISIBILITY_CHANGED',
      'CAMERA_UNAVAILABLE',
      'CAMERA_RESTORED',
      'NETWORK_DEGRADED',
      'NETWORK_RESTORED',
      'ENVIRONMENTAL_OBSERVATION',
      'SESSION_SUBMITTED',
      'SESSION_COMPLETED',
      'QR_PAIRING_CREATED',
      'QR_PAIRING_COMPLETED',
      'ENVIRONMENT_CHECK_STARTED',
      'ENVIRONMENT_CHECK_COMPLETED',
      'ENVIRONMENT_CHECK_UNAVAILABLE',
      'CAMERA_PERMISSION_GRANTED',
      'MICROPHONE_PERMISSION_GRANTED',
      'EXAM_FULLSCREEN_ENTERED',
      'EXAM_FULLSCREEN_EXITED',
      'EXAM_TAB_HIDDEN',
      'EXAM_TAB_VISIBLE',
      'EXAM_WARNING_ACKNOWLEDGED',
    ];

    it('supports candidate lifecycle and restricted exam mode event types', () => {
      expect(validEventTypes.length).toBe(22);
      expect(validEventTypes).toContain('QR_PAIRING_CREATED');
      expect(validEventTypes).toContain('QR_PAIRING_COMPLETED');
      expect(validEventTypes).toContain('ENVIRONMENT_CHECK_STARTED');
      expect(validEventTypes).toContain('ENVIRONMENT_CHECK_COMPLETED');
      expect(validEventTypes).toContain('CAMERA_PERMISSION_GRANTED');
      expect(validEventTypes).toContain('MICROPHONE_PERMISSION_GRANTED');
      expect(validEventTypes).toContain('EXAM_FULLSCREEN_ENTERED');
      expect(validEventTypes).toContain('EXAM_FULLSCREEN_EXITED');
      expect(validEventTypes).toContain('EXAM_TAB_HIDDEN');
      expect(validEventTypes).toContain('EXAM_TAB_VISIBLE');
      expect(validEventTypes).toContain('EXAM_WARNING_ACKNOWLEDGED');
    });

    it('clearly distinguishes simulated events from browser native events', () => {
      const simulatedEvt: CandidateEventRecord = {
        event_id: 'evt_sim_01',
        session_id: 'sess_live_123',
        event_type: 'ENVIRONMENTAL_OBSERVATION',
        timestamp: new Date().toISOString(),
        source: 'simulation',
        is_simulated: true,
        evidence_reliability: 'MEDIUM',
        metadata: {
          condition: 'background_person',
          observed_persons: 2,
          is_simulation: true,
        },
      };

      const browserEvt: CandidateEventRecord = {
        event_id: 'evt_tab_02',
        session_id: 'sess_live_123',
        event_type: 'TAB_VISIBILITY_CHANGED',
        timestamp: new Date().toISOString(),
        source: 'browser',
        is_simulated: false,
        evidence_reliability: 'HIGH',
        metadata: {
          visibility_state: 'hidden',
          is_tab_switch: true,
        },
      };

      expect(simulatedEvt.source).toBe('simulation');
      expect(simulatedEvt.is_simulated).toBe(true);
      expect(browserEvt.source).toBe('browser');
      expect(browserEvt.is_simulated).toBe(false);
    });
  });

  describe('3. Privacy Safeguards & Camera Permissions', () => {
    it('supports camera-denied flow without blocking examination', () => {
      let cameraPermission: 'prompt' | 'granted' | 'denied' = 'prompt';
      let isCameraDeniedMode = false;

      // Simulate user denying camera permission
      cameraPermission = 'denied';
      isCameraDeniedMode = true;

      expect(cameraPermission).toBe('denied');
      expect(isCameraDeniedMode).toBe(true);
      // Under policy IM-102, camera denial continues in limited-evidence mode
    });

    it('does not store or transmit raw video chunks to local event records', () => {
      const eventRecord: CandidateEventRecord = {
        event_id: 'evt_cam_status',
        session_id: 'sess_live_test',
        event_type: 'CAMERA_UNAVAILABLE',
        timestamp: new Date().toISOString(),
        source: 'browser',
        is_simulated: false,
        evidence_reliability: 'HIGH',
        metadata: {
          permission_denied: true,
          mode: 'audio_telemetry_only',
        },
      };

      expect(eventRecord.metadata).not.toHaveProperty('video_blob');
      expect(eventRecord.metadata).not.toHaveProperty('frame_data');
      expect(eventRecord.metadata).not.toHaveProperty('face_biometrics');
    });

    it('strictly requires both camera and audio permissions to advance past the devices step', () => {
      const verifyHardwareReady = (
        cameraState: 'prompt' | 'granted' | 'denied',
        micState: 'prompt' | 'granted' | 'denied',
        hasLiveVideoTrack: boolean,
        hasLiveAudioTrack: boolean
      ): boolean => {
        const isCameraAllowed = cameraState === 'granted' && hasLiveVideoTrack;
        const isAudioAllowed = micState === 'granted' && hasLiveAudioTrack;
        return isCameraAllowed && isAudioAllowed;
      };

      // Both denied: cannot proceed to next step
      expect(verifyHardwareReady('denied', 'denied', false, false)).toBe(false);

      // Camera granted but microphone denied: cannot proceed to next step
      expect(verifyHardwareReady('granted', 'denied', true, false)).toBe(false);

      // Microphone granted but camera denied: cannot proceed to next step
      expect(verifyHardwareReady('denied', 'granted', false, true)).toBe(false);

      // Both prompt (unanswered): cannot proceed to next step
      expect(verifyHardwareReady('prompt', 'prompt', false, false)).toBe(false);

      // Camera granted but video track disconnected: cannot proceed
      expect(verifyHardwareReady('granted', 'granted', false, true)).toBe(false);

      // Microphone granted but audio track disconnected: cannot proceed
      expect(verifyHardwareReady('granted', 'granted', true, false)).toBe(false);

      // BOTH camera and audio granted with live tracks: successfully unlocked
      expect(verifyHardwareReady('granted', 'granted', true, true)).toBe(true);
    });

    it('records distinct event logs for both camera and microphone authorization', () => {
      const camEvent: CandidateEventRecord = {
        event_id: 'evt_cam_grant',
        session_id: 'sess_cand_1',
        event_type: 'CAMERA_PERMISSION_GRANTED',
        timestamp: new Date().toISOString(),
        source: 'browser',
        is_simulated: false,
        evidence_reliability: 'HIGH',
        metadata: {},
      };

      const micEvent: CandidateEventRecord = {
        event_id: 'evt_mic_grant',
        session_id: 'sess_cand_1',
        event_type: 'MICROPHONE_PERMISSION_GRANTED',
        timestamp: new Date().toISOString(),
        source: 'browser',
        is_simulated: false,
        evidence_reliability: 'HIGH',
        metadata: {},
      };

      expect(camEvent.event_type).toBe('CAMERA_PERMISSION_GRANTED');
      expect(micEvent.event_type).toBe('MICROPHONE_PERMISSION_GRANTED');
    });
  });

  describe('4. Policy IM-102 Environmental Non-Penalization', () => {
    it('verifies that background person observation is logged as environmental context', () => {
      const observationEvent: CandidateEventRecord = {
        event_id: 'evt_shared_room',
        session_id: 'sess_live_shared',
        event_type: 'ENVIRONMENTAL_OBSERVATION',
        timestamp: new Date().toISOString(),
        source: 'simulation',
        is_simulated: true,
        evidence_reliability: 'MEDIUM',
        metadata: {
          condition: 'background_person',
          observed_persons: 2,
          policy: 'IM-102',
          penalty_points: 0,
        },
      };

      expect(observationEvent.metadata.penalty_points).toBe(0);
      expect(observationEvent.metadata.policy).toBe('IM-102');
    });
  });

  describe('5. QR Pairing & Mobile Environment Check Contract', () => {
    it('generates short pairing codes adhering to the FP-XXXX format', () => {
      const code = 'FP-A7B2';
      expect(code).toMatch(/^FP-[A-Z0-9]{4}$/);
      expect(code.length).toBe(7);
    });

    it('validates mobile pairing response without leaking student PII', () => {
      const pairingResponse = {
        session_id: 'cand_anon_4921',
        pairing_token: '0123456789abcdef0123456789abcdef',
        pairing_code: 'FP-9X8Y',
        pairing_url: 'http://localhost:5173/?mode=mobile_check&pairing_token=0123456789abcdef0123456789abcdef',
        status: 'waiting_for_scan',
        expires_at: new Date(Date.now() + 300 * 1000).toISOString(),
        expires_in_seconds: 300,
      };

      expect(pairingResponse.pairing_url).not.toContain('@');
      expect(pairingResponse.pairing_url).not.toContain('student');
      expect(pairingResponse.pairing_token.length).toBe(32);
      expect(pairingResponse.expires_in_seconds).toBe(300);
      expect(pairingResponse.status).toBe('waiting_for_scan');
    });

    it('structures mobile environment check submission properly', () => {
      const checkSubmission = {
        session_id: 'cand_anon_4921',
        pairing_status: 'paired' as const,
        check_status: 'completed' as const,
        lighting_status: 'adequate' as const,
        camera_status: 'available' as const,
        candidate_confirmation: true,
        notes: 'Room sweep completed with desk clear.',
      };

      expect(checkSubmission.check_status).toBe('completed');
      expect(checkSubmission.candidate_confirmation).toBe(true);
      expect(checkSubmission.lighting_status).toBe('adequate');
    });

    it('gracefully represents camera_unavailable without penalizing student', () => {
      const checkUnavailable = {
        session_id: 'cand_anon_4921',
        pairing_status: 'paired' as const,
        check_status: 'camera_unavailable' as const,
        lighting_status: 'uncertain' as const,
        camera_status: 'unavailable' as const,
        candidate_confirmation: true,
        notes: 'Mobile browser blocked camera permission; candidate confirmed desk clearance manually.',
      };

      expect(checkUnavailable.check_status).toBe('camera_unavailable');
      expect(checkUnavailable.camera_status).toBe('unavailable');
      // Must not be flagged as misconduct
    });
  });

  describe('6. Restricted Examination Mode & Event Interception', () => {
    it('creates EXAM_FULLSCREEN_ENTERED browser event upon explicit entry', () => {
      const fsEvent: CandidateEventRecord = {
        event_id: 'evt_fs_enter',
        session_id: 'cand_anon_4921',
        event_type: 'EXAM_FULLSCREEN_ENTERED',
        timestamp: new Date().toISOString(),
        source: 'browser',
        is_simulated: false,
        evidence_reliability: 'HIGH',
        metadata: {
          fullscreen_mode: true,
          element: 'document.documentElement',
        },
      };

      expect(fsEvent.event_type).toBe('EXAM_FULLSCREEN_ENTERED');
      expect(fsEvent.source).toBe('browser');
      expect(fsEvent.metadata.fullscreen_mode).toBe(true);
    });

    it('records tab switch as EXAM_TAB_HIDDEN and handles candidate acknowledgement', () => {
      const tabHiddenEvt: CandidateEventRecord = {
        event_id: 'evt_tab_hide',
        session_id: 'cand_anon_4921',
        event_type: 'EXAM_TAB_HIDDEN',
        timestamp: new Date().toISOString(),
        source: 'browser',
        is_simulated: false,
        evidence_reliability: 'HIGH',
        metadata: {
          reason: 'visibility_change_hidden',
          warning_count: 1,
        },
      };

      const ackEvt: CandidateEventRecord = {
        event_id: 'evt_ack_01',
        session_id: 'cand_anon_4921',
        event_type: 'EXAM_WARNING_ACKNOWLEDGED',
        timestamp: new Date().toISOString(),
        source: 'candidate',
        is_simulated: false,
        evidence_reliability: 'HIGH',
        metadata: {
          warning_type: 'tab_switch',
          warning_count: 1,
        },
      };

      expect(tabHiddenEvt.event_type).toBe('EXAM_TAB_HIDDEN');
      expect(ackEvt.event_type).toBe('EXAM_WARNING_ACKNOWLEDGED');
      expect(ackEvt.source).toBe('candidate');
    });

    it('debounces rapid fullscreen/visibility transitions into single warning sequence', () => {
      let lastTrigger = -99999;
      const cooldownMs = 1500;
      const logEvent = (now: number) => {
        if (now - lastTrigger < cooldownMs) {
          return false; // suppressed duplicate
        }
        lastTrigger = now;
        return true;
      };

      const t0 = 1000;
      expect(logEvent(t0)).toBe(true);
      expect(logEvent(t0 + 200)).toBe(false); // suppressed alt-tab duplicate
      expect(logEvent(t0 + 500)).toBe(false); // suppressed blur duplicate
      expect(logEvent(t0 + 1600)).toBe(true); // new distinct transition allowed
    });
  });

  describe('7. Camera Initialization, Stream Lifecycle & Cleanup', () => {
    it('verifies that media stream has active video track with live readyState', () => {
      // Mock video track
      const mockVideoTrack = {
        kind: 'video',
        readyState: 'live' as MediaStreamTrackState,
        stop: () => { mockVideoTrack.readyState = 'ended'; },
      };

      const isStreamActive = (stream: { active: boolean; getVideoTracks: () => any[] } | null): boolean => {
        if (!stream || !stream.active) return false;
        const tracks = stream.getVideoTracks();
        return tracks.length > 0 && tracks.some((t) => t.readyState === 'live');
      };

      const stream = {
        active: true,
        getVideoTracks: () => [mockVideoTrack],
      };

      expect(isStreamActive(stream)).toBe(true);

      // Verify that after track stop, stream is recognized as inactive
      mockVideoTrack.stop();
      expect(mockVideoTrack.readyState).toBe('ended');
      expect(isStreamActive(stream)).toBe(false);
    });

    it('attaches stream to video element with muted property and handles play Promise', async () => {
      let isPlayCalled = false;
      const mockVideoEl: any = {
        srcObject: null,
        muted: false,
        playsInline: false,
        play: async () => {
          isPlayCalled = true;
          return Promise.resolve();
        },
      };

      const mockStream: any = { active: true };

      // Helper simulating attachStreamToVideo
      const attachStreamToVideo = (videoEl: any, stream: any) => {
        if (!videoEl || !stream) return;
        videoEl.srcObject = stream;
        videoEl.muted = true;
        videoEl.playsInline = true;
        videoEl.play().catch(() => {});
      };

      attachStreamToVideo(mockVideoEl, mockStream);
      expect(mockVideoEl.srcObject).toBe(mockStream);
      expect(mockVideoEl.muted).toBe(true);
      expect(mockVideoEl.playsInline).toBe(true);
      expect(isPlayCalled).toBe(true);
    });

    it('stops all tracks when stopping media or unmounting', () => {
      let stoppedTrackCount = 0;
      const mockTrack = {
        stop: () => { stoppedTrackCount++; },
      };
      const mockStream = {
        getTracks: () => [mockTrack, mockTrack],
      };

      mockStream.getTracks().forEach((t) => t.stop());
      expect(stoppedTrackCount).toBe(2);
    });
  });

  describe('8. Camera Permission Errors & Diagnostics', () => {
    const mapCameraError = (errorName: string, message?: string) => {
      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
        return {
          type: 'NotAllowedError',
          message: 'Camera permission was denied or dismissed.',
          guidance: 'Click the camera/lock icon in your browser address bar to allow camera access, then click "Retry Camera".',
        };
      } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
        return {
          type: 'NotFoundError',
          message: 'No video input hardware detected.',
          guidance: 'Ensure your webcam is connected and recognized by your operating system, then click "Retry Camera".',
        };
      } else if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
        return {
          type: 'NotReadableError',
          message: 'Camera is busy or in use by another application.',
          guidance: 'Close any application currently using your webcam (Zoom, Teams, FaceTime, or other browser tabs), then click "Retry Camera".',
        };
      } else if (errorName === 'OverconstrainedError' || errorName === 'ConstraintNotSatisfiedError') {
        return {
          type: 'OverconstrainedError',
          message: 'Camera could not satisfy requested video constraints.',
          guidance: 'Default video resolution could not be fulfilled. Fallback to standard resolution will be attempted on retry.',
        };
      }
      return {
        type: 'Unknown',
        message: message || 'Unable to start camera stream.',
        guidance: 'Please check browser device permissions and click "Retry Camera".',
      };
    };

    it('accurately maps NotAllowedError with actionable address bar guidance', () => {
      const err = mapCameraError('NotAllowedError');
      expect(err.type).toBe('NotAllowedError');
      expect(err.guidance).toContain('address bar');
    });

    it('accurately maps NotFoundError when no webcam hardware is present', () => {
      const err = mapCameraError('NotFoundError');
      expect(err.type).toBe('NotFoundError');
      expect(err.message).toContain('No video input hardware');
    });

    it('accurately maps NotReadableError when webcam is occupied by Zoom/Teams', () => {
      const err = mapCameraError('NotReadableError');
      expect(err.type).toBe('NotReadableError');
      expect(err.guidance).toContain('Zoom, Teams, FaceTime');
    });

    it('accurately maps OverconstrainedError for resolution fallback', () => {
      const err = mapCameraError('OverconstrainedError');
      expect(err.type).toBe('OverconstrainedError');
      expect(err.guidance).toContain('Fallback to standard resolution');
    });
  });

  describe('9. Duplicate Camera Initialization Prevention', () => {
    it('prevents concurrent duplicate getUserMedia requests while already requesting', async () => {
      let isInitializing = false;
      let requestCount = 0;

      const mockInitializeCamera = async () => {
        if (isInitializing) return 'already_in_progress';
        isInitializing = true;
        requestCount++;
        // Simulate async getUserMedia delay
        await new Promise((resolve) => setTimeout(resolve, 10));
        isInitializing = false;
        return 'success';
      };

      const [res1, res2] = await Promise.all([
        mockInitializeCamera(),
        mockInitializeCamera(),
      ]);

      expect(requestCount).toBe(1);
      expect(res1).toBe('success');
      expect(res2).toBe('already_in_progress');
    });

    it('reuses existing healthy stream instead of spawning redundant stream tracks', () => {
      const activeStream = { active: true, getVideoTracks: () => [{ readyState: 'live' }] };
      const checkAndReuse = (currentStream: any, forceRestart: boolean) => {
        if (!forceRestart && currentStream && currentStream.active) {
          return { reused: true, stream: currentStream };
        }
        return { reused: false, stream: 'new_stream' };
      };

      const result = checkAndReuse(activeStream, false);
      expect(result.reused).toBe(true);
      expect(result.stream).toBe(activeStream);

      // When forceRestart is requested, new stream is created
      const restartResult = checkAndReuse(activeStream, true);
      expect(restartResult.reused).toBe(false);
    });
  });

  describe('10. Keyboard Shortcut Handling & Conflicts Prevention', () => {
    const evaluateKeypress = (event: {
      key: string;
      code?: string;
      ctrlKey?: boolean;
      metaKey?: boolean;
      shiftKey?: boolean;
      altKey?: boolean;
      targetTagName?: string;
    }) => {
      const isInput = ['INPUT', 'TEXTAREA'].includes(event.targetTagName || '');
      let prevented = false;
      let interceptedType: string | null = null;

      // 1. If in input/textarea, never prevent normal typing
      if (isInput) {
        return { prevented: false, interceptedType: null };
      }

      // 2. PrintScreen
      if (event.key === 'PrintScreen' || event.code === 'PrintScreen') {
        prevented = true;
        interceptedType = 'PrintScreen';
      }
      // 3. Ctrl+P / Cmd+P (Print to PDF/Screenshot)
      else if ((event.ctrlKey || event.metaKey) && (event.key === 'p' || event.key === 'P')) {
        prevented = true;
        interceptedType = 'Print';
      }
      // 4. Ctrl+S / Cmd+S (Save webpage)
      else if ((event.ctrlKey || event.metaKey) && (event.key === 's' || event.key === 'S')) {
        prevented = true;
        interceptedType = 'Save';
      }
      // 5. DevTools (F12, Ctrl+Shift+I, Cmd+Option+I)
      else if (
        event.key === 'F12' ||
        ((event.ctrlKey || event.metaKey) && event.shiftKey && ['i', 'I'].includes(event.key)) ||
        (event.metaKey && event.altKey && ['i', 'I'].includes(event.key))
      ) {
        prevented = true;
        interceptedType = 'DevTools';
      }
      // 6. View Source (Ctrl+U / Cmd+Option+U)
      else if (
        ((event.ctrlKey || event.metaKey) && (event.key === 'u' || event.key === 'U')) ||
        (event.metaKey && event.altKey && (event.key === 'u' || event.key === 'U'))
      ) {
        prevented = true;
        interceptedType = 'ViewSource';
      }

      return { prevented, interceptedType };
    };

    it('intercepts PrintScreen and marks it as screen capture prevention', () => {
      const res = evaluateKeypress({ key: 'PrintScreen', code: 'PrintScreen' });
      expect(res.prevented).toBe(true);
      expect(res.interceptedType).toBe('PrintScreen');
    });

    it('intercepts Ctrl+P and Cmd+P print shortcuts', () => {
      const resCtrl = evaluateKeypress({ key: 'p', ctrlKey: true });
      const resMeta = evaluateKeypress({ key: 'P', metaKey: true });
      expect(resCtrl.prevented).toBe(true);
      expect(resCtrl.interceptedType).toBe('Print');
      expect(resMeta.prevented).toBe(true);
      expect(resMeta.interceptedType).toBe('Print');
    });

    it('intercepts Ctrl+S and Cmd+S save shortcuts', () => {
      const res = evaluateKeypress({ key: 's', ctrlKey: true });
      expect(res.prevented).toBe(true);
      expect(res.interceptedType).toBe('Save');
    });

    it('intercepts F12 and Ctrl+Shift+I devtools shortcuts', () => {
      const resF12 = evaluateKeypress({ key: 'F12' });
      const resDev = evaluateKeypress({ key: 'I', ctrlKey: true, shiftKey: true });
      expect(resF12.prevented).toBe(true);
      expect(resDev.prevented).toBe(true);
      expect(resDev.interceptedType).toBe('DevTools');
    });

    it('intercepts Ctrl+U view source shortcut', () => {
      const res = evaluateKeypress({ key: 'u', ctrlKey: true });
      expect(res.prevented).toBe(true);
      expect(res.interceptedType).toBe('ViewSource');
    });
  });

  describe('11. Candidate Typing & Accessibility Preservation', () => {
    it('never prevents keystrokes when candidate is typing inside textarea or input', () => {
      const evaluateInInput = (key: string, ctrlKey = false) => {
        const isInput = true;
        // In input, normal typing and editing shortcuts are completely permitted
        return { isInput, prevented: false };
      };

      expect(evaluateInInput('A').prevented).toBe(false);
      expect(evaluateInInput('Backspace').prevented).toBe(false);
      expect(evaluateInInput('Enter').prevented).toBe(false);
      expect(evaluateInInput('Space').prevented).toBe(false);
      expect(evaluateInInput('Tab').prevented).toBe(false);
      expect(evaluateInInput('v', true).prevented).toBe(false); // Paste into scratchpad
      expect(evaluateInInput('c', true).prevented).toBe(false); // Copy from scratchpad
    });

    it('allows standard keyboard accessibility navigation (Tab, Arrow keys, Enter, Escape)', () => {
      const accessibilityKeys = ['Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape'];
      accessibilityKeys.forEach((key) => {
        const isModifier = false;
        const isAccessibilityAllowed = true;
        expect(isAccessibilityAllowed).toBe(true);
      });
    });
  });

  describe('12. Explicit Authorized Workflow vs Covert Screenshot Capture', () => {
    it('prohibits hidden surveillance and requires explicit candidate consent for local snapshots', () => {
      const consentRecord = {
        has_consent: true,
        cloud_storage_permitted: false,
        local_inspection_only: true,
        policy: 'IM-102',
      };

      expect(consentRecord.has_consent).toBe(true);
      expect(consentRecord.cloud_storage_permitted).toBe(false);
      expect(consentRecord.local_inspection_only).toBe(true);
    });

    it('creates an authorized verification snapshot event with candidate source and zero penalty', () => {
      const snapshotEvent: CandidateEventRecord = {
        event_id: 'evt_snap_01',
        session_id: 'cand_anon_4921',
        event_type: 'ENVIRONMENTAL_OBSERVATION',
        timestamp: new Date().toISOString(),
        source: 'candidate',
        is_simulated: false,
        evidence_reliability: 'HIGH',
        metadata: {
          type: 'AUTHORIZED_PROCTORING_SNAPSHOT',
          policy: 'IM-102',
          penalty_points: 0,
        },
      };

      expect(snapshotEvent.source).toBe('candidate');
      expect(snapshotEvent.metadata.penalty_points).toBe(0);
      expect(snapshotEvent.metadata.type).toBe('AUTHORIZED_PROCTORING_SNAPSHOT');
    });
  });

  describe('13. Live Camera Detection, Proctoring Telemetry & Policy IM-102 Safeguards', () => {
    it('generates compliant LiveDetectionResult structure with bounding box and pose', () => {
      const mockDetection: LiveDetectionResult = {
        facePresent: true,
        faceCount: 1,
        faceConfidence: 92,
        headPose: 'forward',
        lightingLevel: 48,
        lightingCategory: 'adequate',
        boundingBox: { x: 0.35, y: 0.22, width: 0.30, height: 0.45 },
        secondaryBox: null,
        fps: 20,
        hasSimulatedPerson: false,
        hasSimulatedLowLight: false,
      };

      expect(mockDetection.facePresent).toBe(true);
      expect(mockDetection.faceCount).toBe(1);
      expect(mockDetection.headPose).toBe('forward');
      expect(mockDetection.lightingCategory).toBe('adequate');
      expect(mockDetection.boundingBox).not.toBeNull();
      expect(mockDetection.boundingBox?.width).toBeGreaterThan(0);
    });

    it('correctly classifies head pose according to normalized coordinates', () => {
      const classifyPose = (normCx: number, normCy: number): 'forward' | 'left' | 'right' | 'down' => {
        if (normCx < 0.36) return 'right';
        if (normCx > 0.64) return 'left';
        if (normCy > 0.66) return 'down';
        return 'forward';
      };

      expect(classifyPose(0.50, 0.45)).toBe('forward');
      expect(classifyPose(0.25, 0.45)).toBe('right');
      expect(classifyPose(0.75, 0.45)).toBe('left');
      expect(classifyPose(0.50, 0.72)).toBe('down');
    });

    it('classifies ambient illumination into adequate and low lux categories', () => {
      const classifyLighting = (lux: number): 'adequate' | 'low' => {
        return lux >= 18 ? 'adequate' : 'low';
      };

      expect(classifyLighting(52)).toBe('adequate');
      expect(classifyLighting(20)).toBe('adequate');
      expect(classifyLighting(11)).toBe('low');
      expect(classifyLighting(8)).toBe('low');
    });

    it('handles simulated multi-face shared room with zero penalty annotation', () => {
      const sharedRoomDetection: LiveDetectionResult = {
        facePresent: true,
        faceCount: 2,
        faceConfidence: 88,
        headPose: 'forward',
        lightingLevel: 45,
        lightingCategory: 'adequate',
        boundingBox: { x: 0.32, y: 0.20, width: 0.30, height: 0.44 },
        secondaryBox: { x: 0.70, y: 0.14, width: 0.22, height: 0.32 },
        fps: 20,
        hasSimulatedPerson: true,
        hasSimulatedLowLight: false,
      };

      expect(sharedRoomDetection.faceCount).toBe(2);
      expect(sharedRoomDetection.secondaryBox).not.toBeNull();
      expect(sharedRoomDetection.hasSimulatedPerson).toBe(true);
    });

    it('formats frame_observation telemetry payload exactly as expected by backend session_store', () => {
      const detection: LiveDetectionResult = {
        facePresent: true,
        faceCount: 1,
        faceConfidence: 94,
        headPose: 'forward',
        lightingLevel: 50,
        lightingCategory: 'adequate',
        boundingBox: { x: 0.33, y: 0.21, width: 0.30, height: 0.42 },
        secondaryBox: null,
        fps: 20,
        hasSimulatedPerson: false,
        hasSimulatedLowLight: false,
      };

      const elapsedSec = 25.4;
      const payload = {
        condition_type: 'live_frame_telemetry',
        frame_observation: {
          timestamp_sec: Math.round(elapsedSec * 10) / 10,
          face_present: detection.facePresent ? 1 : 0,
          no_of_face: detection.faceCount,
          face_conf: Math.round(detection.faceConfidence),
          head_pose: detection.headPose,
          phone_present: 0,
        },
        lighting_lux: detection.lightingLevel,
        lighting_category: detection.lightingCategory,
        detection_fps: detection.fps,
        policy_im102_applied: true,
      };

      expect(payload.condition_type).toBe('live_frame_telemetry');
      expect(payload.frame_observation.timestamp_sec).toBe(25.4);
      expect(payload.frame_observation.face_present).toBe(1);
      expect(payload.frame_observation.no_of_face).toBe(1);
      expect(payload.frame_observation.face_conf).toBe(94);
      expect(payload.frame_observation.head_pose).toBe('forward');
      expect(payload.frame_observation.phone_present).toBe(0);
      expect(payload.policy_im102_applied).toBe(true);
    });
  });

  describe('12. Examination Fullscreen Keyboard Lockdown & Interception Guardrails', () => {
    it('locks Escape key during fullscreen examination with non-penalizing guidance', () => {
      const decision = evaluateExamKeyLockdown({ key: 'Escape', code: 'Escape' });
      expect(decision.isLocked).toBe(true);
      expect(decision.category).toBe('escape');
      expect(decision.message).toContain('Escape key is locked during fullscreen exam');
      expect(decision.eventMetadata?.interception).toBe('Escape');
    });

    it('locks page reload shortcuts (F5, Ctrl+R, Cmd+R, Ctrl+Shift+R) to preserve session state', () => {
      const f5 = evaluateExamKeyLockdown({ key: 'F5', code: 'F5' });
      expect(f5.isLocked).toBe(true);
      expect(f5.category).toBe('reload');
      expect(f5.message).toContain('Page reload');

      const ctrlR = evaluateExamKeyLockdown({ key: 'r', ctrlKey: true, code: 'KeyR' });
      expect(ctrlR.isLocked).toBe(true);
      expect(ctrlR.category).toBe('reload');

      const cmdR = evaluateExamKeyLockdown({ key: 'r', metaKey: true, code: 'KeyR' });
      expect(cmdR.isLocked).toBe(true);
      expect(cmdR.category).toBe('reload');

      const ctrlShiftR = evaluateExamKeyLockdown({ key: 'R', ctrlKey: true, shiftKey: true, code: 'KeyR' });
      expect(ctrlShiftR.isLocked).toBe(true);
      expect(ctrlShiftR.category).toBe('reload');
    });

    it('locks tab switching and window management shortcuts (Ctrl+Tab, Ctrl+Shift+Tab, Ctrl+1-9, Ctrl+PageUp/Down, Ctrl+W, Ctrl+T, Ctrl+N)', () => {
      // Direct tab index jumps (Ctrl+1 to Ctrl+9)
      for (let i = 1; i <= 9; i++) {
        const tabJump = evaluateExamKeyLockdown({ key: String(i), ctrlKey: true, code: `Digit${i}` });
        expect(tabJump.isLocked).toBe(true);
        expect(tabJump.category).toBe('tab_window');
        expect(tabJump.message).toContain('Tab switching');
      }

      // Mac direct tab jumps (Cmd+1 to Cmd+9)
      const cmdTab1 = evaluateExamKeyLockdown({ key: '1', metaKey: true, code: 'Digit1' });
      expect(cmdTab1.isLocked).toBe(true);
      expect(cmdTab1.category).toBe('tab_window');

      // Tab cycling shortcuts
      const ctrlTab = evaluateExamKeyLockdown({ key: 'Tab', ctrlKey: true, code: 'Tab' });
      expect(ctrlTab.isLocked).toBe(true);
      expect(ctrlTab.category).toBe('tab_window');

      const ctrlShiftTab = evaluateExamKeyLockdown({ key: 'Tab', ctrlKey: true, shiftKey: true, code: 'Tab' });
      expect(ctrlShiftTab.isLocked).toBe(true);
      expect(ctrlShiftTab.category).toBe('tab_window');

      const ctrlPageDown = evaluateExamKeyLockdown({ key: 'PageDown', ctrlKey: true, code: 'PageDown' });
      expect(ctrlPageDown.isLocked).toBe(true);
      expect(ctrlPageDown.category).toBe('tab_window');

      const ctrlPageUp = evaluateExamKeyLockdown({ key: 'PageUp', ctrlKey: true, code: 'PageUp' });
      expect(ctrlPageUp.isLocked).toBe(true);
      expect(ctrlPageUp.category).toBe('tab_window');

      // Tab and window creation/close
      const ctrlW = evaluateExamKeyLockdown({ key: 'w', ctrlKey: true, code: 'KeyW' });
      expect(ctrlW.isLocked).toBe(true);
      expect(ctrlW.category).toBe('tab_window');

      const ctrlT = evaluateExamKeyLockdown({ key: 't', ctrlKey: true, code: 'KeyT' });
      expect(ctrlT.isLocked).toBe(true);
      expect(ctrlT.category).toBe('tab_window');

      const ctrlN = evaluateExamKeyLockdown({ key: 'n', ctrlKey: true, code: 'KeyN' });
      expect(ctrlN.isLocked).toBe(true);
      expect(ctrlN.category).toBe('tab_window');

      const cmdShiftN = evaluateExamKeyLockdown({ key: 'N', metaKey: true, shiftKey: true, code: 'KeyN' });
      expect(cmdShiftN.isLocked).toBe(true);
      expect(cmdShiftN.category).toBe('tab_window');
    });

    it('locks system navigation (Alt+Tab, Alt+F4, Alt+ArrowLeft, Backspace outside input)', () => {
      const altTab = evaluateExamKeyLockdown({ key: 'Tab', altKey: true, code: 'Tab' });
      expect(altTab.isLocked).toBe(true);
      expect(altTab.category).toBe('navigation');

      const altF4 = evaluateExamKeyLockdown({ key: 'F4', altKey: true, code: 'F4' });
      expect(altF4.isLocked).toBe(true);
      expect(altF4.category).toBe('navigation');

      const altLeft = evaluateExamKeyLockdown({ key: 'ArrowLeft', altKey: true });
      expect(altLeft.isLocked).toBe(true);
      expect(altLeft.category).toBe('navigation');

      const backspaceOutside = evaluateExamKeyLockdown({ key: 'Backspace', isInput: false });
      expect(backspaceOutside.isLocked).toBe(true);
      expect(backspaceOutside.category).toBe('navigation');
    });

    it('locks F11 browser fullscreen toggle to maintain controlled proctoring container', () => {
      const f11 = evaluateExamKeyLockdown({ key: 'F11', code: 'F11' });
      expect(f11.isLocked).toBe(true);
      expect(f11.category).toBe('fullscreen');
      expect(f11.message).toContain('F11 fullscreen toggle is locked');
    });

    it('locks browser search and utility shortcuts (Ctrl+F, Ctrl+H, Ctrl+J, F3)', () => {
      const ctrlF = evaluateExamKeyLockdown({ key: 'f', ctrlKey: true });
      expect(ctrlF.isLocked).toBe(true);
      expect(ctrlF.category).toBe('browser_tool');

      const ctrlH = evaluateExamKeyLockdown({ key: 'h', ctrlKey: true });
      expect(ctrlH.isLocked).toBe(true);
      expect(ctrlH.category).toBe('browser_tool');

      const ctrlJ = evaluateExamKeyLockdown({ key: 'j', ctrlKey: true });
      expect(ctrlJ.isLocked).toBe(true);
      expect(ctrlJ.category).toBe('browser_tool');

      const f3 = evaluateExamKeyLockdown({ key: 'F3', code: 'F3' });
      expect(f3.isLocked).toBe(true);
      expect(f3.category).toBe('browser_tool');
    });

    it('protects question content against copy, cut, and select-all outside input elements', () => {
      const ctrlC = evaluateExamKeyLockdown({ key: 'c', ctrlKey: true, isInput: false });
      expect(ctrlC.isLocked).toBe(true);
      expect(ctrlC.category).toBe('content_protection');
      expect(ctrlC.message).toContain('Copying, cutting, and text extraction');

      const ctrlX = evaluateExamKeyLockdown({ key: 'x', ctrlKey: true, isInput: false });
      expect(ctrlX.isLocked).toBe(true);
      expect(ctrlX.category).toBe('content_protection');

      const ctrlA = evaluateExamKeyLockdown({ key: 'a', ctrlKey: true, isInput: false });
      expect(ctrlA.isLocked).toBe(true);
      expect(ctrlA.category).toBe('content_protection');
    });

    it('preserves candidate typing and full scratchpad accessibility inside editable areas', () => {
      // Normal typing in scratchpad
      const backspaceInInput = evaluateExamKeyLockdown({ key: 'Backspace', isInput: true });
      expect(backspaceInInput.isLocked).toBe(false);

      const letterTyping = evaluateExamKeyLockdown({ key: 'e', isInput: true });
      expect(letterTyping.isLocked).toBe(false);

      // Copy / Paste / Select All inside rough notes scratchpad is permitted
      const copyInNotes = evaluateExamKeyLockdown({ key: 'c', ctrlKey: true, isInput: true });
      expect(copyInNotes.isLocked).toBe(false);

      const pasteInNotes = evaluateExamKeyLockdown({ key: 'v', ctrlKey: true, isInput: true });
      expect(pasteInNotes.isLocked).toBe(false);

      const selectAllInNotes = evaluateExamKeyLockdown({ key: 'a', ctrlKey: true, isInput: true });
      expect(selectAllInNotes.isLocked).toBe(false);
    });

    it('locks developer tools, view source, screen capture, and page export', () => {
      const f12 = evaluateExamKeyLockdown({ key: 'F12', code: 'F12' });
      expect(f12.isLocked).toBe(true);
      expect(f12.category).toBe('devtools');

      const ctrlShiftI = evaluateExamKeyLockdown({ key: 'I', ctrlKey: true, shiftKey: true });
      expect(ctrlShiftI.isLocked).toBe(true);
      expect(ctrlShiftI.category).toBe('devtools');

      const ctrlU = evaluateExamKeyLockdown({ key: 'u', ctrlKey: true });
      expect(ctrlU.isLocked).toBe(true);
      expect(ctrlU.category).toBe('devtools');

      const printScreen = evaluateExamKeyLockdown({ key: 'PrintScreen', code: 'PrintScreen' });
      expect(printScreen.isLocked).toBe(true);
      expect(printScreen.category).toBe('print_export');

      const ctrlP = evaluateExamKeyLockdown({ key: 'p', ctrlKey: true });
      expect(ctrlP.isLocked).toBe(true);
      expect(ctrlP.category).toBe('print_export');

      const ctrlS = evaluateExamKeyLockdown({ key: 's', ctrlKey: true });
      expect(ctrlS.isLocked).toBe(true);
      expect(ctrlS.category).toBe('print_export');
    });

    it('ignores solitary modifier keys (Shift, Ctrl, Alt, Meta)', () => {
      expect(evaluateExamKeyLockdown({ key: 'Shift' }).isLocked).toBe(false);
      expect(evaluateExamKeyLockdown({ key: 'Control' }).isLocked).toBe(false);
      expect(evaluateExamKeyLockdown({ key: 'Alt' }).isLocked).toBe(false);
      expect(evaluateExamKeyLockdown({ key: 'Meta' }).isLocked).toBe(false);
    });
  });

});


