export interface Event {
  id: string;
  title: string;
  description: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  color?: string;
}

export interface Alarm {
  id: string;
  title: string;
  description: string;
  time: string; // ISO string
  isActive: boolean;
}