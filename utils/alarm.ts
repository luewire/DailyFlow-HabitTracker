// Alarm sound utility
export function playAlarmSound() {
  if (typeof window === 'undefined') return;
  
  try {
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create oscillator for beep sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Set frequency (higher = higher pitch)
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    // Set volume
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    // Play for 0.5 seconds, 3 times
    let beepCount = 0;
    const playBeep = () => {
      if (beepCount >= 3) return;
      
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      osc.connect(gain);
      gain.connect(audioContext.destination);
      
      osc.frequency.value = 800;
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
      
      osc.start(audioContext.currentTime);
      osc.stop(audioContext.currentTime + 0.2);
      
      beepCount++;
      if (beepCount < 3) {
        setTimeout(playBeep, 300);
      }
    };
    
    playBeep();
    
  } catch (error) {
    console.warn('Audio playback not supported:', error);
    // Fallback: browser notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('DailyFlow Timer', {
        body: 'Your timer has finished!',
        icon: '/favicon.ico',
      });
    }
  }
}

export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}
