export interface ShiftType {
  id: string;
  name: string;
  code: string; // Short abbreviation (e.g., "M", "N")
  color: string; // Hex code
  startTime: string;
  endTime: string;
}

export interface DayAssignment {
  dateStr: string; // YYYY-MM-DD
  shiftTypeId: string | null; // null means cleared
  note?: string;
  isHoliday?: boolean;
}

export interface AppState {
  currentDate: Date;
  selectedShiftTypeId: string | null;
  isPainting: boolean;
  isSidebarOpen: boolean;
}

// Supabase-ready structure
export interface Profile {
  id: string;
  email: string;
}
