import React, { useState } from 'react';
import { signInWithGoogle, isSupabaseConfigured } from '../src/data/supabaseClient';

interface Props {
  onGuestLogin: () => void;
}

export const LoginScreen: React.FC<Props> = ({ onGuestLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Early return if configuration is missing
  if (!isSupabaseConfigured) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center animate-fade-in text-center border-t-4 border-red-500">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <i className="fa-solid fa-gear text-red-500 text-2xl"></i>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Setup Required</h1>
          <p className="text-slate-600 mb-6 text-sm leading-relaxed">
            The application is missing the Supabase configuration. 
            <br/><br/>
            Please update the <code>.env</code> file.
          </p>
          
          <button
            onClick={onGuestLogin}
            className="mt-6 w-full bg-slate-800 text-white font-medium py-3 px-4 rounded-xl hover:bg-slate-900 transition-all"
          >
            Enter in Offline Mode
          </button>
        </div>
      </div>
    );
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      if (err?.message?.includes('provider is not enabled')) {
        setError('Google Login is not enabled in your Supabase Dashboard. Use Offline Mode below.');
      } else {
        setError(err.message || 'Error signing in');
      }
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center animate-fade-in-up">
        {/* Logo / Icon */}
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200 rotate-3 transition-transform hover:rotate-6">
          <i className="fa-solid fa-calendar-days text-white text-4xl"></i>
        </div>

        <h1 className="text-3xl font-bold text-slate-800 mb-2">Shifter</h1>
        <p className="text-slate-500 text-center mb-8 px-4">
          The ultimate shift planner. Simple, fast, and works offline.
        </p>

        {error && (
          <div className="w-full bg-red-50 text-red-600 p-3 rounded-lg text-xs mb-6 border border-red-100 flex items-start text-left">
            <i className="fa-solid fa-triangle-exclamation mr-2 mt-0.5 flex-shrink-0"></i>
            <span>{error}</span>
          </div>
        )}

        {/* Primary Action: Guest/Offline Mode */}
        <button
          onClick={onGuestLogin}
          className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-4 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-indigo-200 mb-4"
        >
          <span>Start Planning Now</span>
          <i className="fa-solid fa-arrow-right ml-1"></i>
        </button>

        {/* Divider */}
        <div className="relative w-full text-center mb-4 mt-2">
            <span className="bg-white px-2 text-xs text-slate-400 relative z-10">CLOUD SYNC (OPTIONAL)</span>
            <div className="absolute top-1/2 left-0 w-full border-t border-slate-100 -z-0"></div>
        </div>

        {/* Secondary Action: Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center space-x-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-medium py-3 px-4 rounded-xl transition-all active:scale-[0.98]"
        >
          {loading ? (
            <i className="fa-solid fa-circle-notch fa-spin text-slate-400"></i>
          ) : (
            <>
              <img 
                src="https://www.svgrepo.com/show/475656/google-color.svg" 
                alt="Google" 
                className="w-5 h-5 opacity-80"
              />
              <span>Sync with Google</span>
            </>
          )}
        </button>
        
        <p className="mt-6 text-[10px] text-slate-300 text-center">
          v1.0.0 • Offline Ready
        </p>
      </div>
    </div>
  );
};