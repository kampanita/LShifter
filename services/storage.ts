import { ShiftType, DayAssignment } from '../types';

// Initial Seed Data mimicking a fresh install
const DEFAULT_SHIFTS: ShiftType[] = [
  { id: '1', name: 'Morning', code: 'M', color: '#10b981', startTime: '06:00', endTime: '14:00' },
  { id: '2', name: 'Afternoon', code: 'A', color: '#f59e0b', startTime: '14:00', endTime: '22:00' },
  { id: '3', name: 'Night', code: 'N', color: '#6366f1', startTime: '22:00', endTime: '06:00' },
];

// Helper to get namespaced keys
const getKeys = (userId: string) => ({
  SHIFTS: `shifter_shifts_${userId}`,
  ASSIGNMENTS: `shifter_assignments_${userId}`,
});

export const storageService = {
  getShiftTypes: (userId: string): ShiftType[] => {
    const keys = getKeys(userId);
    const stored = localStorage.getItem(keys.SHIFTS);
    return stored ? JSON.parse(stored) : DEFAULT_SHIFTS;
  },

  saveShiftTypes: (userId: string, shifts: ShiftType[]) => {
    const keys = getKeys(userId);
    localStorage.setItem(keys.SHIFTS, JSON.stringify(shifts));
  },

  getAssignments: (userId: string): Record<string, DayAssignment> => {
    const keys = getKeys(userId);
    const stored = localStorage.getItem(keys.ASSIGNMENTS);
    return stored ? JSON.parse(stored) : {};
  },

  saveAssignment: (userId: string, assignment: DayAssignment) => {
    const assignments = storageService.getAssignments(userId);
    assignments[assignment.dateStr] = assignment;

    const keys = getKeys(userId);
    localStorage.setItem(keys.ASSIGNMENTS, JSON.stringify(assignments));
  },

  // Batch save for painting
  saveAssignments: (userId: string, newAssignments: DayAssignment[]) => {
    const assignments = storageService.getAssignments(userId);
    newAssignments.forEach(a => {
      assignments[a.dateStr] = { ...assignments[a.dateStr], ...a };
    });

    const keys = getKeys(userId);
    localStorage.setItem(keys.ASSIGNMENTS, JSON.stringify(assignments));
  },

  clearData: (userId: string) => {
    const keys = getKeys(userId);
    localStorage.removeItem(keys.SHIFTS);
    localStorage.removeItem(keys.ASSIGNMENTS);
  }
};