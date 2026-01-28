import React, { useState, useEffect, useCallback } from 'react';
import { Calendar } from './components/Calendar';
import { ShiftPalette } from './components/ShiftPalette';
import { EditShiftModal } from './components/EditShiftModal';
import { DatePickerModal } from './components/DatePickerModal';
import { LoginScreen } from './components/LoginScreen';
import { ShiftType, DayAssignment } from './types';
import { storageService } from './services/storage';
import { formatDateKey } from './helpers';
import { supabase, signOut } from './src/data/supabaseClient';
import { Session } from '@supabase/supabase-js';

// Dummy session generator for Guest Mode
const createGuestSession = (): Session => ({
  access_token: 'guest-token',
  refresh_token: 'guest-refresh',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: 'guest-user-local',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'guest@demo.local',
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    confirmation_sent_at: '',
    confirmed_at: '',
    last_sign_in_at: '',
    app_metadata: { provider: 'email' },
    user_metadata: { 
      avatar_url: '',
      full_name: 'Guest User'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
});

const App: React.FC = () => {
  // Auth State
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // App State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shiftTypes, setShiftTypes] = useState<ShiftType[]>([]);
  const [assignments, setAssignments] = useState<Record<string, DayAssignment>>({});
  const [selectedShiftTypeId, setSelectedShiftTypeId] = useState<string | null>(null);
  const [isPainting, setIsPainting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // 1. Initialize Auth
  useEffect(() => {
    const initAuth = async () => {
      // Check for guest session first
      const guestStored = localStorage.getItem('shifter_guest_mode');
      if (guestStored === 'true') {
        setSession(createGuestSession());
        setAuthLoading(false);
        return;
      }

      // Check Supabase session
      const { data: { session: supabaseSession } } = await supabase.auth.getSession();
      if (supabaseSession) {
        setSession(supabaseSession);
      }
      setAuthLoading(false);
    };

    initAuth();

    // Listen for Supabase changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Only update if we aren't in explicit guest mode (prevents conflict)
      if (localStorage.getItem('shifter_guest_mode') !== 'true') {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Load Data when Session Changes
  useEffect(() => {
    if (session?.user) {
      const userId = session.user.id;
      const loadedShifts = storageService.getShiftTypes(userId);
      setShiftTypes(loadedShifts);
      setAssignments(storageService.getAssignments(userId));
      
      // Set first shift as default selected if available
      if (loadedShifts.length > 0) setSelectedShiftTypeId(loadedShifts[0].id);
    } else {
      // Clear state on logout
      setShiftTypes([]);
      setAssignments({});
    }
  }, [session]);

  // Persistence Effects
  const handleSaveShift = (newShift: ShiftType) => {
    if (!session?.user) return;
    const updatedShifts = [...shiftTypes, newShift];
    setShiftTypes(updatedShifts);
    storageService.saveShiftTypes(session.user.id, updatedShifts);
    // Auto Select
    setSelectedShiftTypeId(newShift.id);
  };

  const handlePaint = useCallback((date: Date) => {
    if (!session?.user) return;
    const key = formatDateKey(date);
    
    // Optimistic UI update
    setAssignments((prev) => {
      const newAssignment: DayAssignment = {
        dateStr: key,
        shiftTypeId: selectedShiftTypeId,
        note: prev[key]?.note // preserve notes
      };
      
      const next = { ...prev, [key]: newAssignment };
      return next;
    });

    // Save to storage
    const newAssignment: DayAssignment = {
      dateStr: key,
      shiftTypeId: selectedShiftTypeId,
      note: assignments[key]?.note
    };
    storageService.saveAssignment(session.user.id, newAssignment);
  }, [selectedShiftTypeId, assignments, session]);

  const handleSignOut = async () => {
    // Check if guest
    if (localStorage.getItem('shifter_guest_mode') === 'true') {
      localStorage.removeItem('shifter_guest_mode');
      setSession(null);
    } else {
      await signOut();
    }
  };

  const handleGuestLogin = () => {
    localStorage.setItem('shifter_guest_mode', 'true');
    setSession(createGuestSession());
  };

  // Navigation
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // --- RENDER ---

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <i className="fa-solid fa-circle-notch fa-spin text-indigo-600 text-2xl"></i>
      </div>
    );
  }

  if (!session) {
    return <LoginScreen onGuestLogin={handleGuestLogin} />;
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <header className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] z-30 relative">
        <button 
          onClick={() => setIsDatePickerOpen(true)}
          className="flex items-center space-x-2.5 pl-1 pr-3 py-1.5 rounded-xl hover:bg-slate-50 transition-colors group active:scale-[0.98]"
        >
          <div className="flex flex-col items-start">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider leading-none mb-0.5 ml-0.5">
              {currentDate.getFullYear()}
            </span>
            <h1 className="text-2xl font-bold text-slate-800 leading-none tracking-tight group-hover:text-indigo-600 transition-colors">
              {currentDate.toLocaleString('default', { month: 'long' })}
            </h1>
          </div>
          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
             <i className="fa-solid fa-chevron-down text-[10px]"></i>
          </div>
        </button>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <button 
              onClick={prevMonth} 
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all active:scale-90"
              aria-label="Previous Month"
            >
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button 
              onClick={nextMonth} 
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-all active:scale-90"
              aria-label="Next Month"
            >
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
          
          {/* User Profile / Logout */}
          <button
            onClick={handleSignOut}
            className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden relative ml-2 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            title="Sign Out"
          >
             {session.user.user_metadata.avatar_url ? (
               <img src={session.user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
             ) : (
               <div className="w-full h-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold text-sm">
                 {session.user.email?.charAt(0).toUpperCase()}
               </div>
             )}
          </button>
        </div>
      </header>

      {/* Main Calendar Area */}
      <Calendar
        currentDate={currentDate}
        assignments={assignments}
        shiftTypes={shiftTypes}
        selectedShiftTypeId={selectedShiftTypeId}
        onPaint={handlePaint}
        isPainting={isPainting}
        setIsPainting={setIsPainting}
      />

      {/* Bottom Toolbar */}
      <ShiftPalette
        shiftTypes={shiftTypes}
        selectedId={selectedShiftTypeId}
        onSelect={setSelectedShiftTypeId}
        onEdit={() => setIsModalOpen(true)}
      />

      {/* Modals */}
      <EditShiftModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveShift}
      />
      
      <DatePickerModal
        isOpen={isDatePickerOpen}
        currentDate={currentDate}
        onClose={() => setIsDatePickerOpen(false)}
        onSelect={setCurrentDate}
      />
    </div>
  );
};

export default App;