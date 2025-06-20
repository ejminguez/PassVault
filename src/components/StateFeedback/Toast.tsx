import { createSignal, createEffect, onCleanup, Show } from "solid-js";

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
  persistent?: boolean;
}

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  persistent: boolean;
  onClose?: () => void;
}

// Global toast state
const [toasts, setToasts] = createSignal<ToastItem[]>([]);

// Toast manager functions
export const showToast = (message: string, type: ToastType = 'info', duration: number = 4000, persistent: boolean = false) => {
  const id = Math.random().toString(36).substr(2, 9);
  const toast: ToastItem = {
    id,
    message,
    type,
    duration,
    persistent
  };

  setToasts(prev => [...prev, toast]);

  if (!persistent) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }

  return id;
};

export const removeToast = (id: string) => {
  setToasts(prev => prev.filter(toast => toast.id !== id));
};

export const clearAllToasts = () => {
  setToasts([]);
};

// Individual Toast Component
const Toast = (props: ToastProps & { id: string }) => {
  const [isVisible, setIsVisible] = createSignal(true);
  const [isExiting, setIsExiting] = createSignal(false);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      props.onClose?.();
      removeToast(props.id);
    }, 300); // Animation duration
  };

  // Auto-close timer
  createEffect(() => {
    if (!props.persistent && props.duration && props.duration > 0) {
      const timer = setTimeout(handleClose, props.duration);
      onCleanup(() => clearTimeout(timer));
    }
  });

  const getIcon = () => {
    switch (props.type) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z" />
          </svg>
        );
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,7A1,1 0 0,0 11,8V12A1,1 0 0,0 12,13A1,1 0 0,0 13,12V8A1,1 0 0,0 12,7M12,17.5A1.5,1.5 0 0,1 10.5,16A1.5,1.5 0 0,1 12,14.5A1.5,1.5 0 0,1 13.5,16A1.5,1.5 0 0,1 12,17.5Z" />
          </svg>
        );
      case 'warning':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
          </svg>
        );
    }
  };

  return (
    <Show when={isVisible()}>
      <div class={`toast toast-${props.type} ${isExiting() ? 'toast-exit' : ''}`}>
        <div class="toast-content">
          <div class="toast-icon">
            {getIcon()}
          </div>
          <div class="toast-message">
            {props.message}
          </div>
          <button class="toast-close" onClick={handleClose}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
            </svg>
          </button>
        </div>
      </div>
    </Show>
  );
};

// Toast Container Component
export const ToastContainer = () => {
  return (
    <div class="toast-container">
      {toasts().map(toast => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          persistent={toast.persistent}
          onClose={toast.onClose}
        />
      ))}
    </div>
  );
};

export default Toast;
