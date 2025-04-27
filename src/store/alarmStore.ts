import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Alarm } from '../types';

interface AlarmState {
  alarms: Alarm[];
  addAlarm: (alarm: Alarm) => void;
  updateAlarm: (alarm: Alarm) => void;
  removeAlarm: (id: string) => void;
  toggleAlarm: (id: string, isActive: boolean) => void;
}

export const useAlarmStore = create<AlarmState>()(
  persist(
    (set) => ({
      alarms: [],
      addAlarm: (alarm) => set((state) => ({ 
        alarms: [...state.alarms, alarm] 
      })),
      updateAlarm: (updatedAlarm) => set((state) => ({ 
        alarms: state.alarms.map((alarm) => 
          alarm.id === updatedAlarm.id ? updatedAlarm : alarm
        ) 
      })),
      removeAlarm: (id) => set((state) => ({ 
        alarms: state.alarms.filter((alarm) => alarm.id !== id) 
      })),
      toggleAlarm: (id, isActive) => set((state) => ({
        alarms: state.alarms.map((alarm) =>
          alarm.id === id ? { ...alarm, isActive } : alarm
        )
      })),
    }),
    {
      name: 'calendar-alarms',
    }
  )
);