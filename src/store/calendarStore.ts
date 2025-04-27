import { create } from 'zustand';

interface CalendarState {
  activeDate: Date;
  setActiveDate: (date: Date) => void;
  view: 'month' | 'week' | 'day';
  setView: (view: 'month' | 'week' | 'day') => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  activeDate: new Date(),
  setActiveDate: (date) => set({ activeDate: date }),
  view: 'month',
  setView: (view) => set({ view }),
}));