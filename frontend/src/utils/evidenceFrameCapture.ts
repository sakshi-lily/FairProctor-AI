import { CapturedEvidenceFrame } from '../types/proctoring';

/**
 * Creates SVG data URIs for demonstration sessions that look like real proctored frames
 * with visual overlays, bounding boxes, and forensic HUD banners.
 */
function createSvgDataUri(svgXml: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgXml.trim())}`;
}

export const DEMO_EVIDENCE_FRAMES = {
  // Demonstration Frame 1: Sustained Handheld Phone in Candidate Foreground (sess_phone_det_02)
  phoneDetection: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="640" height="480">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
        <radialGradient id="deskLamp" cx="70%" cy="30%" r="60%">
          <stop offset="0%" stop-color="#fef08a" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#0f172a" stop-opacity="0"/>
        </radialGradient>
      </defs>

      <!-- Background Room & Ambient Lighting -->
      <rect width="640" height="480" fill="url(#bg)"/>
      <rect width="640" height="480" fill="url(#deskLamp)"/>

      <!-- Room Wall Art / Desk Shelf -->
      <line x1="60" y1="120" x2="380" y2="120" stroke="#334155" stroke-width="3"/>
      <rect x="90" y="70" width="35" height="50" rx="3" fill="#475569"/>
      <rect x="135" y="80" width="28" height="40" rx="3" fill="#64748b"/>
      <rect x="175" y="75" width="40" height="45" rx="3" fill="#475569"/>

      <!-- Computer Monitor Edge in candidate room -->
      <rect x="20" y="240" width="130" height="200" rx="6" fill="#1e293b" stroke="#334155" stroke-width="2"/>
      <rect x="25" y="248" width="120" height="150" fill="#0284c7" fill-opacity="0.2"/>

      <!-- Candidate Torso & Head -->
      <path d="M 230 480 C 230 370 270 330 350 330 C 430 330 470 370 470 480 Z" fill="#334155"/>
      <!-- Collar -->
      <polygon points="350,345 320,330 380,330" fill="#475569"/>
      <!-- Head / Face -->
      <ellipse cx="350" cy="220" rx="65" ry="85" fill="#fbcfe8"/>
      <!-- Hair -->
      <path d="M 285 200 C 285 130 415 130 415 200 C 400 150 300 150 285 200 Z" fill="#1e1b4b"/>
      <!-- Eyes & Brows -->
      <ellipse cx="328" cy="210" rx="7" ry="5" fill="#1e293b"/>
      <ellipse cx="372" cy="210" rx="7" ry="5" fill="#1e293b"/>
      <path d="M 320 198 Q 330 192 340 198" stroke="#0f172a" stroke-width="2.5" fill="none"/>
      <path d="M 360 198 Q 370 192 380 198" stroke="#0f172a" stroke-width="2.5" fill="none"/>
      <!-- Nose & Mouth -->
      <path d="M 350 215 L 347 232 L 354 232" stroke="#e2e8f0" stroke-width="2" fill="none"/>
      <path d="M 338 252 Q 350 258 362 252" stroke="#db2777" stroke-width="2.5" fill="none"/>

      <!-- Handheld Mobile Phone in Foreground -->
      <!-- Arm extending -->
      <path d="M 460 480 Q 420 400 370 395" stroke="#fbcfe8" stroke-width="32" stroke-linecap="round" fill="none"/>
      <!-- Fingers grasping phone -->
      <rect x="290" y="325" width="85" height="135" rx="14" fill="#090d16" stroke="#475569" stroke-width="3"/>
      <!-- Phone Glowing Display -->
      <rect x="296" y="335" width="73" height="115" rx="8" fill="#38bdf8" fill-opacity="0.85"/>
      <!-- Screen content lines (chat / text) -->
      <rect x="304" y="348" width="48" height="6" rx="2" fill="#ffffff"/>
      <rect x="304" y="360" width="38" height="5" rx="2" fill="#bae6fd"/>
      <rect x="316" y="372" width="45" height="6" rx="2" fill="#0284c7"/>
      <rect x="304" y="385" width="54" height="5" rx="2" fill="#bae6fd"/>
      <!-- Fingers wrapped around phone frame -->
      <rect x="282" y="350" width="16" height="12" rx="4" fill="#fbcfe8"/>
      <rect x="282" y="370" width="16" height="12" rx="4" fill="#fbcfe8"/>
      <rect x="282" y="390" width="16" height="12" rx="4" fill="#fbcfe8"/>

      <!-- BOUNDING BOX 1: Candidate Face (Primary) -->
      <rect x="270" y="125" width="160" height="195" rx="6" fill="none" stroke="#10b981" stroke-width="2"/>
      <rect x="270" y="103" width="128" height="20" rx="4" fill="#0f172a" fill-opacity="0.9" stroke="#10b981" stroke-width="1"/>
      <text x="278" y="117" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#34d399">Candidate (Primary) 96%</text>

      <!-- BOUNDING BOX 2: Unauthorized Handheld Device (Phone) -->
      <rect x="275" y="315" width="115" height="155" rx="8" fill="none" stroke="#f43f5e" stroke-width="3" stroke-dasharray="0"/>
      <!-- Corner Accents -->
      <path d="M 275 335 L 275 315 L 295 315" stroke="#fda4af" stroke-width="4" fill="none"/>
      <path d="M 370 315 L 390 315 L 390 335" stroke="#fda4af" stroke-width="4" fill="none"/>
      <path d="M 275 450 L 275 470 L 295 470" stroke="#fda4af" stroke-width="4" fill="none"/>
      <path d="M 370 470 L 390 470 L 390 450" stroke="#fda4af" stroke-width="4" fill="none"/>

      <!-- Phone Label Pill -->
      <rect x="260" y="292" width="150" height="21" rx="4" fill="#e11d48" stroke="#fda4af" stroke-width="1"/>
      <text x="268" y="306" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#ffffff">📱 Phone (Restricted) 94%</text>

      <!-- TOP FORENSIC HUD WATERMARK -->
      <rect x="12" y="12" width="616" height="34" rx="6" fill="#090d16" fill-opacity="0.92" stroke="#334155" stroke-width="1"/>
      <circle cx="28" cy="29" r="5" fill="#f43f5e"/>
      <text x="40" y="33" font-family="monospace" font-size="11" font-weight="bold" fill="#f8fafc">FAIRPROCTOR-AI EVIDENCE CAPTURE</text>
      <text x="280" y="33" font-family="monospace" font-size="10" fill="#94a3b8">SESSION: sess_phone_det_02 | t=320s</text>
      <rect x="520" y="18" width="98" height="22" rx="4" fill="#881337" stroke="#f43f5e" stroke-width="1"/>
      <text x="528" y="33" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#fecdd3">🔴 HIGH RISK</text>

      <!-- BOTTOM AUDIT BANNER -->
      <rect x="12" y="442" width="616" height="28" rx="6" fill="#090d16" fill-opacity="0.92" stroke="#334155" stroke-width="1"/>
      <text x="24" y="460" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#fda4af">
        POLICY SEC-04: Unauthorized Handheld Electronic Device Detected (24 frames sustained)
      </text>
    </svg>
  `),

  // Demonstration Frame 2: Shared Room / Multiple Faces under Policy IM-102 (sess_shared_room_01)
  sharedRoom: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="640" height="480">
      <defs>
        <linearGradient id="bgShared" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </linearGradient>
      </defs>

      <rect width="640" height="480" fill="url(#bgShared)"/>

      <!-- Shared Living Space Background: Doorway and hallway -->
      <rect x="440" y="80" width="160" height="340" rx="4" fill="#0f172a" stroke="#334155" stroke-width="2"/>
      <rect x="450" y="90" width="140" height="320" fill="#1e293b"/>

      <!-- Background Person (Person 2 - Roommate / Family walking in hallway) -->
      <path d="M 480 380 C 480 290 510 270 540 270 C 570 270 600 290 600 380 Z" fill="#475569"/>
      <ellipse cx="540" cy="200" rx="35" ry="46" fill="#fed7aa"/>
      <path d="M 505 190 C 505 150 575 150 575 190 Z" fill="#292524"/>

      <!-- Foreground Candidate (Centered, looking focused at exam) -->
      <path d="M 120 480 C 120 370 170 330 260 330 C 350 330 400 370 400 480 Z" fill="#0f766e"/>
      <ellipse cx="260" cy="230" rx="68" ry="88" fill="#fed7aa"/>
      <!-- Hair -->
      <path d="M 190 210 C 190 140 330 140 330 210 C 310 160 210 160 190 210 Z" fill="#172554"/>
      <!-- Focused Eyes forward -->
      <ellipse cx="238" cy="225" rx="7" ry="5" fill="#0f172a"/>
      <ellipse cx="282" cy="225" rx="7" ry="5" fill="#0f172a"/>
      <!-- Forward Attention Lines -->
      <path d="M 230 212 Q 240 208 250 212" stroke="#0f172a" stroke-width="2.5" fill="none"/>
      <path d="M 270 212 Q 280 208 290 212" stroke="#0f172a" stroke-width="2.5" fill="none"/>

      <!-- BOUNDING BOX 1: Candidate (Primary) -->
      <rect x="180" y="130" width="165" height="205" rx="6" fill="none" stroke="#10b981" stroke-width="2"/>
      <rect x="180" y="108" width="138" height="20" rx="4" fill="#0f172a" fill-opacity="0.9" stroke="#10b981" stroke-width="1"/>
      <text x="188" y="122" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#34d399">Candidate (Primary) 98%</text>

      <!-- BOUNDING BOX 2: Secondary Person in Background (Shared Room Bystander) -->
      <rect x="495" y="145" width="90" height="120" rx="6" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="5,4"/>
      <rect x="450" y="122" width="180" height="21" rx="4" fill="#0f172a" fill-opacity="0.9" stroke="#f59e0b" stroke-width="1"/>
      <text x="458" y="136" font-family="system-ui, sans-serif" font-size="9.5" font-weight="bold" fill="#fbbf24">Person 2 • IM-102 Zero Risk</text>

      <!-- TOP FORENSIC HUD WATERMARK -->
      <rect x="12" y="12" width="616" height="34" rx="6" fill="#090d16" fill-opacity="0.92" stroke="#334155" stroke-width="1"/>
      <circle cx="28" cy="29" r="5" fill="#10b981"/>
      <text x="40" y="33" font-family="monospace" font-size="11" font-weight="bold" fill="#f8fafc">FAIRPROCTOR-AI EVIDENCE CAPTURE</text>
      <text x="280" y="33" font-family="monospace" font-size="10" fill="#94a3b8">SESSION: sess_shared_room_01 | t=124s</text>
      <rect x="495" y="18" width="124" height="22" rx="4" fill="#064e3b" stroke="#10b981" stroke-width="1"/>
      <text x="503" y="33" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#6ee7b7">🟢 POLICY IM-102</text>

      <!-- BOTTOM AUDIT BANNER -->
      <rect x="12" y="442" width="616" height="28" rx="6" fill="#090d16" fill-opacity="0.92" stroke="#334155" stroke-width="1"/>
      <text x="24" y="460" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#38bdf8">
        POLICY IM-102: Environmental Safeguard Enforced • Shared Living Space Non-Penalized (0 Risk Points)
      </text>
    </svg>
  `),

  // Demonstration Frame 3: Tab Switching & Window Blur Interception (sess_tab_switching_03)
  tabSwitching: createSvgDataUri(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" width="640" height="480">
      <defs>
        <linearGradient id="bgTab" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="100%" stop-color="#1e1b4b"/>
        </linearGradient>
      </defs>

      <rect width="640" height="480" fill="url(#bgTab)"/>

      <!-- Candidate silhouette looking sideways away from exam window -->
      <path d="M 210 480 C 210 370 250 330 340 330 C 430 330 470 370 470 480 Z" fill="#334155"/>
      <ellipse cx="360" cy="225" rx="65" ry="85" fill="#fde047" fill-opacity="0.75"/>
      <path d="M 300 200 C 300 135 425 135 425 200 Z" fill="#1e1b4b"/>
      <!-- Eyes looking sharply left (towards second monitor / other tab) -->
      <ellipse cx="330" cy="220" rx="7" ry="5" fill="#0f172a"/>
      <ellipse cx="370" cy="220" rx="7" ry="5" fill="#0f172a"/>
      <circle cx="327" cy="220" r="2.5" fill="#ffffff"/>
      <circle cx="367" cy="220" r="2.5" fill="#ffffff"/>

      <!-- Visual Deflection Vector Indicator -->
      <line x1="330" y1="220" x2="140" y2="180" stroke="#f59e0b" stroke-width="2" stroke-dasharray="4,4"/>
      <polygon points="135,178 145,173 145,183" fill="#f59e0b"/>

      <!-- INTERCEPTION LOCKDOWN OVERLAY BANNER -->
      <rect x="90" y="290" width="460" height="90" rx="12" fill="#0f172a" fill-opacity="0.95" stroke="#f59e0b" stroke-width="2"/>
      <rect x="105" y="305" width="36" height="36" rx="8" fill="#78350f" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="117" y="328" font-size="16">🔒</text>
      <text x="155" y="324" font-family="system-ui, sans-serif" font-size="13" font-weight="bold" fill="#fef08a">
        WINDOW BLUR / TAB SWITCH INTERCEPTED
      </text>
      <text x="155" y="344" font-family="system-ui, sans-serif" font-size="10.5" fill="#cbd5e1">
        Browser focus lost • Duration: 4.2s • DOM focus locked per exam security protocol
      </text>
      <text x="155" y="362" font-family="monospace" font-size="10" font-weight="bold" fill="#f59e0b">
        Total Tab Events: 14 | Clipboard Paste: 4 Events
      </text>

      <!-- TOP FORENSIC HUD WATERMARK -->
      <rect x="12" y="12" width="616" height="34" rx="6" fill="#090d16" fill-opacity="0.92" stroke="#334155" stroke-width="1"/>
      <circle cx="28" cy="29" r="5" fill="#f59e0b"/>
      <text x="40" y="33" font-family="monospace" font-size="11" font-weight="bold" fill="#f8fafc">FAIRPROCTOR-AI EVIDENCE CAPTURE</text>
      <text x="280" y="33" font-family="monospace" font-size="10" fill="#94a3b8">SESSION: sess_tab_switching_03 | t=680s</text>
      <rect x="500" y="18" width="118" height="22" rx="4" fill="#78350f" stroke="#f59e0b" stroke-width="1"/>
      <text x="508" y="33" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#fef08a">🟡 MEDIUM RISK</text>

      <!-- BOTTOM AUDIT BANNER -->
      <rect x="12" y="442" width="616" height="28" rx="6" fill="#090d16" fill-opacity="0.92" stroke="#334155" stroke-width="1"/>
      <text x="24" y="460" font-family="system-ui, sans-serif" font-size="10" font-weight="bold" fill="#fef08a">
        Standard Exam Security Policy: Continuous Browser Focus Interruption • Spot Check Advised
      </text>
    </svg>
  `),
};

/**
 * Capture an actual webcam frame from a live HTMLVideoElement with forensic overlays
 */
export function captureEvidenceFrameFromVideo(
  video: HTMLVideoElement,
  options: {
    sessionId: string;
    label: string;
    reason: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    policyNote?: string;
    boundingBoxes?: Array<{
      label: string;
      x: number;
      y: number;
      width: number;
      height: number;
      color?: string;
    }>;
    source?: string;
    elapsedSeconds?: number;
  }
): CapturedEvidenceFrame {
  const width = video.videoWidth || 640;
  const height = video.videoHeight || 480;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // 1. Draw live camera video frame
    try {
      ctx.drawImage(video, 0, 0, width, height);
    } catch {
      // Fallback dark gradient if video frame buffer protected
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Draw Bounding Boxes if provided
    if (options.boundingBoxes && options.boundingBoxes.length > 0) {
      options.boundingBoxes.forEach((b) => {
        const bx = b.x * width;
        const by = b.y * height;
        const bw = b.width * width;
        const bh = b.height * height;
        const boxColor = b.color || '#10b981';

        ctx.strokeStyle = boxColor;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(bx, by, bw, bh);

        // Label pill
        ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
        const labelW = ctx.measureText(b.label).width + 14;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.fillRect(bx, Math.max(10, by - 18), labelW, 18);
        ctx.strokeStyle = boxColor;
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, Math.max(10, by - 18), labelW, 18);
        ctx.fillStyle = boxColor;
        ctx.fillText(b.label, bx + 7, Math.max(22, by - 5));
      });
    }

    // 3. Top Forensic HUD Watermark Banner
    ctx.fillStyle = 'rgba(9, 13, 22, 0.92)';
    ctx.fillRect(10, 10, width - 20, 36);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, width - 20, 36);

    // Indicator Dot
    const dotColor =
      options.severity === 'HIGH' ? '#f43f5e' : options.severity === 'MEDIUM' ? '#f59e0b' : '#10b981';
    ctx.fillStyle = dotColor;
    ctx.beginPath();
    ctx.arc(26, 28, 5, 0, 2 * Math.PI);
    ctx.fill();

    // App Branding & Title
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('FAIRPROCTOR-AI EVIDENCE CAPTURE', 38, 32);

    // Session & Timestamp
    const timeStr = new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    const offsetStr = options.elapsedSeconds ? ` | t=${Math.round(options.elapsedSeconds)}s` : '';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText(`SESSION: ${options.sessionId}${offsetStr} | ${timeStr}`, 260, 32);

    // Severity Badge
    const sevLabel =
      options.severity === 'HIGH'
        ? '🔴 HIGH RISK'
        : options.severity === 'MEDIUM'
        ? '🟡 MEDIUM RISK'
        : '🟢 POLICY IM-102';
    const sevW = 100;
    const sevX = width - sevW - 20;
    ctx.fillStyle =
      options.severity === 'HIGH'
        ? 'rgba(136, 19, 55, 0.9)'
        : options.severity === 'MEDIUM'
        ? 'rgba(120, 53, 15, 0.9)'
        : 'rgba(6, 78, 59, 0.9)';
    ctx.fillRect(sevX, 16, sevW, 24);
    ctx.strokeStyle = dotColor;
    ctx.strokeRect(sevX, 16, sevW, 24);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px system-ui, sans-serif';
    ctx.fillText(sevLabel, sevX + 8, 32);

    // 4. Bottom Policy Footer
    ctx.fillStyle = 'rgba(9, 13, 22, 0.92)';
    ctx.fillRect(10, height - 38, width - 20, 28);
    ctx.strokeStyle = '#334155';
    ctx.strokeRect(10, height - 38, width - 20, 28);
    ctx.fillStyle = options.severity === 'HIGH' ? '#fda4af' : '#7dd3fc';
    ctx.font = 'bold 10px system-ui, sans-serif';
    const note = options.policyNote || `AUDIT NOTICE: ${options.reason}`;
    ctx.fillText(note.length > 85 ? note.substring(0, 82) + '...' : note, 22, height - 20);
  }

  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  const frameId = `frame_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  return {
    id: frameId,
    timestamp: new Date().toLocaleTimeString(),
    timestamp_offset_sec: options.elapsedSeconds,
    label: options.label,
    reason: options.reason,
    severity: options.severity,
    data_url: dataUrl,
    policy_note: options.policyNote,
    bounding_boxes: options.boundingBoxes,
    source: options.source || 'video_cv',
    sensor: 'HD Webcam (Camera Channel 1)',
    resolution: `${width} x ${height} px`,
  };
}

/**
 * Storage helpers to persist captured frames per session across reloads
 */
export function getStoredEvidenceFrames(sessionId: string): CapturedEvidenceFrame[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`fairproctor_captured_frames_${sessionId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function saveStoredEvidenceFrame(sessionId: string, frame: CapturedEvidenceFrame): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredEvidenceFrames(sessionId);
    // Avoid duplicate frames with same timestamp & label
    const filtered = existing.filter((f) => f.id !== frame.id && f.label !== frame.label);
    filtered.unshift(frame);
    // Keep last 25 frames
    const capped = filtered.slice(0, 25);
    localStorage.setItem(`fairproctor_captured_frames_${sessionId}`, JSON.stringify(capped));

    // Dispatch global event for instant reactivity across dashboard tabs
    window.dispatchEvent(
      new CustomEvent('fairproctor_frame_captured', {
        detail: { sessionId, frame },
      })
    );
  } catch (e) {
    console.warn('Failed to save captured evidence frame to localStorage:', e);
  }
}
