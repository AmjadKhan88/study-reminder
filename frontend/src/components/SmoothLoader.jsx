
import React from "react";


export default function SmoothLoader({
  size = 128,
  showLabel = false,
  label = "loading",
  classes = ""
}) {
  return (
    <>
      <style>{`
        @keyframes spinSmooth { to { transform: rotate(360deg); } }
        @keyframes breath {
          0%, 100% { opacity: 0.55; transform: scale(0.96); }
          50%      { opacity: 1;    transform: scale(1.04); }
        }
        @keyframes halo {
          0%   { transform: scale(0.9);  opacity: 0.6; }
          70%  { transform: scale(1.35); opacity: 0;   }
          100% { transform: scale(1.35); opacity: 0;   }
        }
        .ldr-ring-a { animation: spinSmooth 1.6s cubic-bezier(0.55,0.15,0.45,0.85) infinite; }
        .ldr-ring-b { animation: spinSmooth 2.4s cubic-bezier(0.55,0.15,0.45,0.85) infinite reverse; }
        .ldr-ring-c { animation: spinSmooth 3.4s linear infinite; }
        .ldr-core   { animation: breath 1.8s ease-in-out infinite; }
        .ldr-halo   { animation: halo 2.2s ease-out infinite; }
      `}</style>

      <div
        className={`flex flex-col items-center justify-center gap-4 bg-transparent ${classes}`}
        role="status"
        aria-live="polite"
        aria-label={label}
      >
        <div
          className="relative flex items-center justify-center"
          style={{ width: size, height: size }}
        >
          <span className="ldr-halo absolute inset-0 rounded-full bg-emerald-400/25 blur-md" />

          <span
            className="ldr-ring-a absolute inset-0 rounded-full border-[3px] border-transparent
                       [border-top-color:rgba(255,255,255,0.95)]
                       [border-right-color:rgba(255,255,255,0.35)]
                       shadow-[0_0_18px_rgba(255,255,255,0.35)]"
          />

          <span
            className="ldr-ring-b absolute inset-2 rounded-full border-[3px] border-transparent
                       [border-bottom-color:rgba(16,185,129,0.95)]
                       [border-left-color:rgba(16,185,129,0.25)]
                       shadow-[0_0_16px_rgba(16,185,129,0.55)]"
          />

          <span
            className="ldr-ring-c absolute inset-5 rounded-full border border-transparent
                       [border-top-color:rgba(255,255,255,0.55)]
                       [border-bottom-color:rgba(255,255,255,0.15)]"
          />

          <span
            className="ldr-core absolute w-8 h-8 rounded-full
                       bg-gradient-to-br from-white via-white/80 to-emerald-200/40
                       blur-[2px]
                       shadow-[0_0_20px_rgba(255,255,255,0.6),0_0_30px_rgba(16,185,129,0.35)]"
          />

          <span className="ldr-ring-a absolute inset-0">
            <span
              className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full
                         bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]"
            />
          </span>
        </div>

        {showLabel && (
          <p className="text-xs tracking-[0.35em] uppercase text-[rgba(16,185,129,0.95)]  font-semibold">
            {label}
          </p>
        )}
      </div>
    </>
  );
}