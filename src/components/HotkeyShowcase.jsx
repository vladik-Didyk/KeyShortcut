export default function HotkeyShowcase() {
  return (
    <div className="flex flex-col gap-6 rounded-2xl border-1.5 border-theme-border bg-theme-base-alt p-8">
      {/* Key combination */}
      <div className="flex items-center justify-center gap-3">
        {/* Up Arrow key */}
        <div className="showcase-key" style={{ width: 80 }}>
          <div className="flex items-center justify-center h-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 24 21" fill="none">
              <path
                fill="currentColor"
                d="M8.632 20.41h6.357q1.215 0 1.835-.662.621-.662.621-1.794v-4.611h4.175q.723 0 1.22-.41.5-.409.499-1.077 0-.423-.191-.744a3.6 3.6 0 0 0-.505-.648l-9.454-9.413a2.5 2.5 0 0 0-.635-.464 1.61 1.61 0 0 0-1.473 0 2.7 2.7 0 0 0-.648.464l-9.44 9.413a3.3 3.3 0 0 0-.526.655q-.184.315-.184.737 0 .668.504 1.078.506.409 1.215.409h4.174v4.611q0 1.133.621 1.794.621.662 1.835.662m.205-1.897a.6.6 0 0 1-.444-.17.6.6 0 0 1-.17-.444v-6.03q0-.368-.382-.368H2.998q-.082 0-.082-.068 0-.041.04-.096l8.718-8.635a.19.19 0 0 1 .137-.055q.082 0 .136.055l8.718 8.635q.054.056.054.096 0 .068-.082.068h-4.856q-.382 0-.382.368v6.03q0 .26-.178.437a.6.6 0 0 1-.436.177z"
              />
            </svg>
          </div>
        </div>

        <span className="font-mono text-base text-theme-muted select-none">+</span>

        {/* Command key */}
        <div className="showcase-key" style={{ width: 120 }}>
          <div className="flex items-end justify-end absolute top-2 right-2.5">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 21 21" fill="none">
              <path
                fill="currentColor"
                d="M6.593 8.447v4.626H4.611q-1.065 0-1.942.505a3.84 3.84 0 0 0-1.396 1.37 3.7 3.7 0 0 0-.52 1.941q0 1.066.52 1.942a4 4 0 0 0 1.396 1.403q.876.526 1.942.526t1.942-.526a4 4 0 0 0 1.395-1.403 3.74 3.74 0 0 0 .52-1.942V14.92h4.558v1.97q0 1.065.526 1.941.525.877 1.396 1.403t1.935.526q1.066 0 1.942-.526a4 4 0 0 0 1.396-1.403q.52-.876.52-1.942 0-1.078-.52-1.942a3.84 3.84 0 0 0-3.338-1.874h-1.969V8.447h1.97q1.065 0 1.941-.506a3.84 3.84 0 0 0 1.396-1.369q.52-.862.52-1.942 0-1.065-.52-1.942a4 4 0 0 0-1.396-1.402A3.7 3.7 0 0 0 16.883.76q-1.065 0-1.935.526-.87.525-1.396 1.402a3.7 3.7 0 0 0-.526 1.942V6.6H8.468V4.63a3.74 3.74 0 0 0-.52-1.942 4 4 0 0 0-1.395-1.402A3.7 3.7 0 0 0 4.61.76q-1.065 0-1.942.526-.877.525-1.396 1.402a3.74 3.74 0 0 0-.52 1.942q0 1.08.52 1.942A3.84 3.84 0 0 0 4.61 8.447zM8.468 13.1V8.42h4.558v4.68zM4.61 6.626q-.81 0-1.396-.586a1.92 1.92 0 0 1-.587-1.41q0-.809.587-1.396a1.9 1.9 0 0 1 1.396-.586q.81 0 1.395.586.588.588.587 1.396v1.996zm0 8.254h1.982v1.996q0 .81-.587 1.396a1.9 1.9 0 0 1-1.395.586q-.81 0-1.396-.586a1.9 1.9 0 0 1-.587-1.396q0-.823.587-1.41a1.9 1.9 0 0 1 1.396-.586m12.272-8.254h-1.969V4.63q0-.809.58-1.396t1.39-.586q.808 0 1.395.586.587.588.587 1.396 0 .823-.587 1.41a1.9 1.9 0 0 1-1.396.586m0 8.254q.81 0 1.396.586.587.587.587 1.41 0 .81-.587 1.396a1.9 1.9 0 0 1-1.396.586q-.81 0-1.389-.586a1.92 1.92 0 0 1-.58-1.396V14.88z"
              />
            </svg>
          </div>
          <span className="font-mono text-sm">command</span>
        </div>

        <span className="font-mono text-base text-theme-muted select-none">+</span>

        {/* U key */}
        <div className="showcase-key" style={{ width: 56 }}>
          <span className="font-mono text-2xl font-medium">U</span>
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <h5 className="flex items-center gap-2 font-sans text-base font-semibold text-theme-text">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M8 4.75v-3m0 3H3.75a2 2 0 0 0-2 2v5.5a2 2 0 0 0 2 2h8.5a2 2 0 0 0 2-2v-5.5a2 2 0 0 0-2-2H8Zm-2.25 6.5h4.5m-5.5-3h.5m2.5 0h.5m2.5 0h.5"
            />
          </svg>
          Hotkeys and Aliases
        </h5>
        <p className="text-sm text-theme-muted leading-relaxed">
          Speed up your workflow by assigning hotkeys or aliases to common commands or apps.
        </p>
      </div>
    </div>
  )
}
