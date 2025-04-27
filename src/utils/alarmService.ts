import { useEffect } from 'react';
import { toast } from 'sonner';
import { useAlarmStore } from '../store/alarmStore';

export const useAlarmService = () => {
  const { alarms, toggleAlarm } = useAlarmStore();
  
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const activeAlarms = alarms.filter(alarm => alarm.isActive);
      
      activeAlarms.forEach(alarm => {
        const alarmTime = new Date(alarm.time);
        
        // Check if the alarm should trigger (within the last minute)
        if (now.getTime() - alarmTime.getTime() >= 0 && 
            now.getTime() - alarmTime.getTime() < 60000) {
          
          // Trigger notification
          triggerAlarm(alarm);
          
          // Disable the alarm after it triggers (if it's not a recurring alarm)
          toggleAlarm(alarm.id, false);
        }
      });
    };
    
    // Check for alarms every minute
    const intervalId = setInterval(checkAlarms, 60000);
    
    // Initial check when component mounts
    checkAlarms();
    
    return () => clearInterval(intervalId);
  }, [alarms, toggleAlarm]);
  
  const triggerAlarm = (alarm: { title: string; description: string }) => {
    // Play sound if supported
    playAlarmSound();
    
    // Show toast notification
    toast(
      <div>
        <h3 className="font-bold text-lg">{alarm.title}</h3>
        {alarm.description && <p>{alarm.description}</p>}
      </div>,
      {
        duration: 10000,
        important: true,
        onDismiss: stopAlarmSound
      }
    );
    
    // Browser notification if permission granted
    tryBrowserNotification(alarm);
  };
  
  const playAlarmSound = () => {
    try {
      // Create audio context and play a simple beep sound
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.value = 440; // A4 note
      gainNode.gain.value = 0.5;
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.start();
      
      // Stop after 1 second
      setTimeout(() => {
        oscillator.stop();
      }, 1000);
      
    } catch (error) {
      console.error('Error playing alarm sound:', error);
    }
  };
  
  const stopAlarmSound = () => {
    // This would normally stop any ongoing alarm sounds
    // For this simple implementation, we just log it
    console.log('Stopping alarm sound');
  };
  
  const tryBrowserNotification = (alarm: { title: string; description: string }) => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(alarm.title, {
          body: alarm.description,
          icon: '/notification-icon.png' // Would need to provide this
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission();
      }
    }
  };
  
  return { triggerAlarm };
};