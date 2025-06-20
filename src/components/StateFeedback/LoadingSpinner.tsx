import { Show } from "solid-js";

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  overlay?: boolean;
  color?: string;
}

const LoadingSpinner = (props: LoadingSpinnerProps) => {
  const {
    size = 'medium',
    message,
    overlay = false,
    color = 'currentColor'
  } = props;

  const sizeClasses = {
    small: 'spinner-small',
    medium: 'spinner-medium',
    large: 'spinner-large'
  };

  const spinnerContent = (
    <div class={`loading-spinner ${sizeClasses[size]}`}>
      <svg 
        class="spinner-svg" 
        viewBox="0 0 50 50"
        style={{ color }}
      >
        <circle
          class="spinner-circle"
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-dasharray="31.416"
          stroke-dashoffset="31.416"
        />
      </svg>
      <Show when={message}>
        <p class="spinner-message">{message}</p>
      </Show>
    </div>
  );

  return (
    <Show 
      when={overlay}
      fallback={spinnerContent}
    >
      <div class="loading-overlay">
        {spinnerContent}
      </div>
    </Show>
  );
};

export default LoadingSpinner;
