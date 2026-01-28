import React from 'react';

export const ShifterLogo: React.FC<{ className?: string }> = ({ className = "w-12 h-12" }) => {
    return (
        <div className={`relative ${className} group`}>
            <style>
                {`
                @keyframes shifter-pulse {
                    0%, 100% { transform: scale(1); filter: brightness(1); }
                    50% { transform: scale(1.02); filter: brightness(1.1); }
                }
                @keyframes shifter-draw {
                    from { stroke-dashoffset: 100; }
                    to { stroke-dashoffset: 0; }
                }
                .animate-shifter-pulse {
                    animation: shifter-pulse 4s ease-in-out infinite;
                    transform-origin: center;
                }
                .animate-shifter-draw {
                    animation: shifter-draw 2s ease-out forwards;
                }
                `}
            </style>
            {/* Animated SVG Logo */}
            <svg
                viewBox="0 0 100 100"
                className="w-full h-full drop-shadow-[0_4px_8px_rgba(99,102,241,0.4)]"
            >
                <defs>
                    <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#818cf8" />
                        <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                </defs>

                {/* Main Body - Bezel effect */}
                <rect
                    x="15" y="15" width="70" height="70" rx="16"
                    fill="url(#logoGrad)"
                    className="animate-shifter-pulse"
                />

                {/* Calendar Grid Lines */}
                <g stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.3">
                    <line x1="35" y1="25" x2="35" y2="75" />
                    <line x1="55" y1="25" x2="55" y2="75" />
                    <line x1="25" y1="45" x2="75" y2="45" />
                    <line x1="25" y1="65" x2="75" y2="65" />
                </g>

                {/* Animated Checkmark/Clock Hand */}
                <path
                    d="M35 55 L45 65 L65 40"
                    fill="none"
                    stroke="white"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-shifter-draw"
                    style={{ strokeDasharray: 100 }}
                />
            </svg>

            {/* 3D Reflection layer */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 pointer-events-none rounded-2xl"></div>
        </div>
    );
};

export const BezelFrame: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => {
    return (
        <div className={`relative p-1 bg-slate-200 rounded-[2.2rem] shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_10px_40px_-10px_rgba(0,0,0,0.2)] flex flex-col ${className}`}>
            <div className="absolute inset-x-4 top-0 h-px bg-white/60 blur-[1px]"></div>
            <div className="bg-white rounded-[2rem] overflow-hidden flex flex-col flex-1 min-h-0 ring-1 ring-black/5 shadow-sm">
                {children}
            </div>
        </div>
    );
};
