export interface InAppNotification {
  id: string;
  title: string;
  body: string;
  timestamp: string;
  type: 'reminder' | 'update' | 'security' | 'sync';
  read: boolean;
}

class NotificationEngine {
  private notifications: InAppNotification[] = [
    {
      id: 'notif-1',
      title: 'Task Reminder: Surface Coatings Paper Revision',
      body: 'Your paper revision for Surface & Coatings Tech journal is due today at 18:00 UTC.',
      timestamp: '10 mins ago',
      type: 'reminder',
      read: false
    },
    {
      id: 'notif-2',
      title: 'Real-time Lab Database Synchronized',
      body: '12 new citation indexes and 5 EBSD micrographs synced across all active terminals.',
      timestamp: '1 hour ago',
      type: 'sync',
      read: false
    },
    {
      id: 'notif-3',
      title: 'Security Alert: FIDO2 Hardware Passkey Verified',
      body: 'Session authenticated on MacBook Pro 16" with end-to-end encryption.',
      timestamp: '2 hours ago',
      type: 'security',
      read: true
    }
  ];

  private listeners: Set<(list: InAppNotification[]) => void> = new Set();

  public getNotifications(): InAppNotification[] {
    return [...this.notifications];
  }

  public subscribe(listener: (list: InAppNotification[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.getNotifications());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const copy = this.getNotifications();
    this.listeners.forEach((fn) => fn(copy));
  }

  public requestPermission(): Promise<NotificationPermission> {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.requestPermission();
    }
    return Promise.resolve('granted');
  }

  public triggerPushAlert(title: string, body: string, type: 'reminder' | 'update' | 'security' | 'sync' = 'reminder') {
    // 1. Browser Native Push Notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico'
        });
      } catch (err) {
        console.warn('Browser notification skipped:', err);
      }
    }

    // 2. Play subtle audio ping using Web Audio API
    this.playNotificationSound();

    // 3. Add to In-App Notification Center
    const newNotif: InAppNotification = {
      id: `notif-${Date.now()}`,
      title,
      body,
      timestamp: 'Just now',
      type,
      read: false
    };

    this.notifications = [newNotif, ...this.notifications];
    this.notify();
  }

  public markAllAsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.notify();
  }

  public clearNotification(id: string) {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.notify();
  }

  private playNotificationSound() {
    try {
      if (typeof window !== 'undefined' && (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5 note

        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch {
      // Audio fallback silent
    }
  }
}

export const notificationsEngine = new NotificationEngine();
