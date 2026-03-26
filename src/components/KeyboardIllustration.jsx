/**
 * KeyboardIllustration — Isometric 3D keyboard device with 4 macOS modifier keycaps.
 *
 * Renders a self-contained SVG illustration of a small keyboard pad in isometric
 * (≈30°) perspective. The four keys show ⇧ Shift, ⌘ Command, ⌃ Control, ⌥ Option.
 *
 * Layout (top-down view, before isometric transform):
 *   [Shift ⇧]    [Command ⌘]
 *   [Control ⌃]  [Option ⌥]
 *
 * Isometric projection:
 *   u-axis goes right-and-down at 30°, v-axis goes left-and-down at 30°.
 *   screenX = cx + (u - v) * cos30
 *   screenY = cy + (u + v) * sin30
 */

export default function KeyboardIllustration({ className = '' }) {
  const cos30 = Math.cos(Math.PI / 6);
  const sin30 = 0.5;

  const cx = 400;
  const cy = 220;

  const iso = (u, v) => [
    cx + (u - v) * cos30,
    cy + (u + v) * sin30,
  ];

  // Isometric diamond (top face of a box)
  const isoRect = (u, v, w, h) => {
    const [x0, y0] = iso(u, v);
    const [x1, y1] = iso(u + w, v);
    const [x2, y2] = iso(u + w, v + h);
    const [x3, y3] = iso(u, v + h);
    return `M ${x0},${y0} L ${x1},${y1} L ${x2},${y2} L ${x3},${y3} Z`;
  };

  // Right side depth band (visible when looking from the right)
  const isoRightSide = (u, v, w, h, depth) => {
    const [x0, y0] = iso(u + w, v);
    const [x1, y1] = iso(u + w, v + h);
    return `M ${x0},${y0} L ${x1},${y1} L ${x1},${y1 + depth} L ${x0},${y0 + depth} Z`;
  };

  // Front side depth band (visible when looking from the front)
  const isoFrontSide = (u, v, w, h, depth) => {
    const [x0, y0] = iso(u, v + h);
    const [x1, y1] = iso(u + w, v + h);
    return `M ${x0},${y0} L ${x1},${y1} L ${x1},${y1 + depth} L ${x0},${y0 + depth} Z`;
  };

  // --- Device dimensions (isometric units) ---
  const devW = 260;
  const devH = 260;
  const devU = -130;
  const devV = -130;
  const devDepth = 55;

  // --- Keycap dimensions ---
  const keyW = 100;
  const keyH = 100;
  const gap = 16;
  const keyDepth = 16;

  // Keycap grid centered on device
  const gridW = keyW * 2 + gap;
  const gridH = keyH * 2 + gap;
  const gridU = devU + (devW - gridW) / 2;
  const gridV = devV + (devH - gridH) / 2;

  // Individual key positions [u, v, label]
  const keys = [
    { u: gridU, v: gridV, label: 'shift' },
    { u: gridU + keyW + gap, v: gridV, label: 'command' },
    { u: gridU, v: gridV + keyH + gap, label: 'control' },
    { u: gridU + keyW + gap, v: gridV + keyH + gap, label: 'option' },
  ];

  const keycapCenter = (u, v) => iso(u + keyW / 2, v + keyH / 2);

  const id = 'kbi';

  return (
    <svg
      viewBox="0 0 800 600"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width: '100%', height: 'auto' }}
      role="img"
      aria-label="Isometric illustration of a keyboard device with four macOS modifier keys: Shift, Command, Control, and Option"
    >
      <defs>
        <filter id={`${id}-shadow`} x="-30%" y="-20%" width="160%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="22" />
        </filter>

        <filter id={`${id}-keycap-sh`} x="-15%" y="-10%" width="140%" height="150%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#000" floodOpacity="0.13" />
        </filter>

        {/* Keycap top face: white to slight lavender */}
        <linearGradient id={`${id}-keycap-g`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F0EFF8" />
        </linearGradient>

        {/* Device top face */}
        <linearGradient id={`${id}-dev-top`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#DAD9F6" />
          <stop offset="100%" stopColor="#C5C4E6" />
        </linearGradient>

        {/* Device right side */}
        <linearGradient id={`${id}-dev-right`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8A8AD5" />
          <stop offset="100%" stopColor="#7272C0" />
        </linearGradient>

        {/* Device front side */}
        <linearGradient id={`${id}-dev-front`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9E9EE0" />
          <stop offset="100%" stopColor="#8888D0" />
        </linearGradient>

        {/* LED glow */}
        <radialGradient id={`${id}-led`} cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#22C55E" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
        </radialGradient>

        {/* LED glow filter */}
        <filter id={`${id}-led-blur`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
        </filter>
      </defs>

      {/* ========== DROP SHADOW ========== */}
      <ellipse
        cx={cx}
        cy={cy + devDepth + 155}
        rx={230}
        ry={58}
        fill="rgba(0,0,0,0.22)"
        filter={`url(#${id}-shadow)`}
      />

      {/* ========== DEVICE BODY ========== */}

      {/* Right side depth band */}
      <path
        d={isoRightSide(devU, devV, devW, devH, devDepth)}
        fill={`url(#${id}-dev-right)`}
        stroke="#1A1A2E"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Front side depth band */}
      <path
        d={isoFrontSide(devU, devV, devW, devH, devDepth)}
        fill={`url(#${id}-dev-front)`}
        stroke="#1A1A2E"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Bottom corner edge (front-left to front-right to back-right) */}
      {(() => {
        const [p0x, p0y] = iso(devU, devV + devH);
        const [p1x, p1y] = iso(devU + devW, devV + devH);
        const [p2x, p2y] = iso(devU + devW, devV);
        return (
          <path
            d={`M ${p0x},${p0y + devDepth} L ${p1x},${p1y + devDepth} L ${p2x},${p2y + devDepth}`}
            fill="none"
            stroke="#1A1A2E"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      })()}

      {/* LED INDICATOR — on the front (bottom-left) side of the device */}
      {(() => {
        // The front side runs along the bottom-left edge of the isometric diamond.
        // Pick a point about 25% from the left corner along this edge.
        const t = 0.22;
        const [flx, fly] = iso(devU + devW * t, devV + devH);
        const ledCY = fly + devDepth * 0.42;
        return (
          <>
            {/* Outer glow */}
            <ellipse
              cx={flx} cy={ledCY}
              rx="20" ry="12"
              fill="#22C55E"
              opacity="0.35"
              filter={`url(#${id}-led-blur)`}
            />
            {/* LED body */}
            <ellipse cx={flx} cy={ledCY} rx="9" ry="5" fill="#22C55E" />
            {/* Bright highlight */}
            <ellipse cx={flx - 1} cy={ledCY - 1} rx="4" ry="2.2" fill="#86EFAC" />
          </>
        );
      })()}

      {/* Top face */}
      <path
        d={isoRect(devU, devV, devW, devH)}
        fill={`url(#${id}-dev-top)`}
        stroke="#1A1A2E"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Inner bevel highlight on top face */}
      <path
        d={isoRect(devU + 10, devV + 10, devW - 20, devH - 20)}
        fill="none"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Recessed key area — slightly darker inset rectangle */}
      <path
        d={isoRect(gridU - 6, gridV - 6, gridW + 12, gridH + 12)}
        fill="rgba(0,0,0,0.04)"
        stroke="rgba(0,0,0,0.06)"
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* ========== KEYCAPS ========== */}
      {keys.map((key) => {
        const { u, v, label } = key;
        const [centerX, centerY] = keycapCenter(u, v);

        return (
          <g key={label}>
            {/* Keycap right side */}
            <path
              d={isoRightSide(u, v, keyW, keyH, keyDepth)}
              fill="#D0CFE2"
              stroke="#1A1A2E"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Keycap front side */}
            <path
              d={isoFrontSide(u, v, keyW, keyH, keyDepth)}
              fill="#C2C1D6"
              stroke="#1A1A2E"
              strokeWidth="2"
              strokeLinejoin="round"
            />

            {/* Keycap top face */}
            <path
              d={isoRect(u, v, keyW, keyH)}
              fill={`url(#${id}-keycap-g)`}
              stroke="#1A1A2E"
              strokeWidth="2.5"
              strokeLinejoin="round"
              filter={`url(#${id}-keycap-sh)`}
            />

            {/* Top face highlight triangle */}
            {(() => {
              const [hx0, hy0] = iso(u + 5, v + 5);
              const [hx1, hy1] = iso(u + keyW * 0.45, v + 5);
              const [hx2, hy2] = iso(u + 5, v + keyH * 0.4);
              return (
                <path
                  d={`M ${hx0},${hy0} L ${hx1},${hy1} L ${hx2},${hy2} Z`}
                  fill="rgba(255,255,255,0.25)"
                />
              );
            })()}

            {/* ---- LEGEND (modifier symbol) ---- */}
            <g transform={`translate(${centerX}, ${centerY})`}>
              {label === 'shift' && (
                /* ⇧ Shift — hollow upward arrow */
                <g transform="scale(1.6, 0.92)">
                  <path
                    d="M 0,-22 L 19,-5 L 11,-5 L 11,10 L -11,10 L -11,-5 L -19,-5 Z"
                    fill="none"
                    stroke="#1A1A2E"
                    strokeWidth="2.8"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                </g>
              )}

              {label === 'command' && (
                /* ⌘ Command — cloverleaf / looped square */
                <g transform="scale(1.6, 0.92)">
                  {/* Four corner loops */}
                  <circle cx="-9" cy="-9" r="7.5" fill="none" stroke="#1A1A2E" strokeWidth="2.8" />
                  <circle cx="9" cy="-9" r="7.5" fill="none" stroke="#1A1A2E" strokeWidth="2.8" />
                  <circle cx="-9" cy="9" r="7.5" fill="none" stroke="#1A1A2E" strokeWidth="2.8" />
                  <circle cx="9" cy="9" r="7.5" fill="none" stroke="#1A1A2E" strokeWidth="2.8" />
                  {/* White fill to mask inner circle arcs */}
                  <rect x="-8.6" y="-8.6" width="17.2" height="17.2" rx="1"
                    fill={`url(#${id}-keycap-g)`} stroke="none" />
                  {/* Center square outline */}
                  <rect x="-9" y="-9" width="18" height="18" rx="2.5"
                    fill="none" stroke="#1A1A2E" strokeWidth="2.8" />
                </g>
              )}

              {label === 'control' && (
                /* ⌃ Control — upward caret */
                <g transform="scale(1.6, 0.92)">
                  <path
                    d="M -16,6 L 0,-12 L 16,6"
                    fill="none"
                    stroke="#1A1A2E"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
              )}

              {label === 'option' && (
                /* ⌥ Option — split bar with ascending diagonal */
                <g transform="scale(1.6, 0.92)">
                  {/* Top horizontal bar (right half only, starts at the bend) */}
                  <line x1="0" y1="-10" x2="16" y2="-10"
                    stroke="#1A1A2E" strokeWidth="3.2" strokeLinecap="round" />
                  {/* Diagonal from bottom-left to top-center */}
                  <line x1="-16" y1="10" x2="0" y2="-10"
                    stroke="#1A1A2E" strokeWidth="3.2" strokeLinecap="round" />
                  {/* Bottom horizontal bar (full width from bend point to right) */}
                  <line x1="0" y1="10" x2="16" y2="10"
                    stroke="#1A1A2E" strokeWidth="3.2" strokeLinecap="round" />
                </g>
              )}
            </g>
          </g>
        );
      })}

      {/* ========== SPECULAR HIGHLIGHTS ========== */}
      {/* Subtle triangular shine on top-left area of device */}
      {(() => {
        const [sx0, sy0] = iso(devU + 12, devV + 12);
        const [sx1, sy1] = iso(devU + devW * 0.35, devV + 12);
        const [sx2, sy2] = iso(devU + 12, devV + devH * 0.3);
        return (
          <path
            d={`M ${sx0},${sy0} L ${sx1},${sy1} L ${sx2},${sy2} Z`}
            fill="rgba(255,255,255,0.08)"
          />
        );
      })()}

      {/* Edge highlight on right side top edge */}
      {(() => {
        const [ex0, ey0] = iso(devU + devW, devV + 2);
        const [ex1, ey1] = iso(devU + devW, devV + devH * 0.5);
        return (
          <line
            x1={ex0} y1={ey0} x2={ex1} y2={ey1}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1.5"
          />
        );
      })()}
    </svg>
  );
}
