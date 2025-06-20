import { createSignal, Show } from "solid-js";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'default' | 'danger' | 'warning';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

const ConfirmDialog = (props: ConfirmDialogProps) => {
  const [isClosing, setIsClosing] = createSignal(false);

  const {
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'default',
    onConfirm,
    onCancel,
    loading = false
  } = props;

  const handleConfirm = () => {
    if (loading) return;
    onConfirm();
  };

  const handleCancel = () => {
    if (loading) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onCancel();
    }, 200);
  };

  const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" class="dialog-icon danger">
            <path d="M12,2L13.09,8.26L22,9L13.09,9.74L12,16L10.91,9.74L2,9L10.91,8.26L12,2M12,7A2,2 0 0,0 10,9A2,2 0 0,0 12,11A2,2 0 0,0 14,9A2,2 0 0,0 12,7M12,17.5A1.5,1.5 0 0,1 10.5,16A1.5,1.5 0 0,1 12,14.5A1.5,1.5 0 0,1 13.5,16A1.5,1.5 0 0,1 12,17.5Z" />
          </svg>
        );
      case 'warning':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" class="dialog-icon warning">
            <path d="M13,14H11V10H13M13,18H11V16H13M1,21H23L12,2L1,21Z" />
          </svg>
        );
      default:
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" class="dialog-icon default">
            <path d="M13,9H11V7H13M13,17H11V11H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
          </svg>
        );
    }
  };

  return (
    <Show when={isOpen}>
      <div 
        class={`confirm-dialog-overlay ${isClosing() ? 'closing' : ''}`}
        onClick={handleOverlayClick}
      >
        <div class={`confirm-dialog ${type}`}>
          <div class="dialog-header">
            <div class="dialog-icon-container">
              {getIcon()}
            </div>
            <h3 class="dialog-title">{title}</h3>
          </div>

          <div class="dialog-body">
            <p class="dialog-message">{message}</p>
          </div>

          <div class="dialog-actions">
            <button 
              class="dialog-button cancel-button"
              onClick={handleCancel}
              disabled={loading}
            >
              {cancelText}
            </button>
            <button 
              class={`dialog-button confirm-button ${type}`}
              onClick={handleConfirm}
              disabled={loading}
            >
              <Show when={loading}>
                <svg class="button-spinner" width="16" height="16" viewBox="0 0 50 50">
                  <circle
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
              </Show>
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};

// Hook for easier usage
export const useConfirmDialog = () => {
  const [dialogState, setDialogState] = createSignal<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'default' | 'danger' | 'warning';
    onConfirm?: () => void;
    loading?: boolean;
  }>({
    isOpen: false,
    title: '',
    message: ''
  });

  const showConfirm = (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'default' | 'danger' | 'warning';
    onConfirm?: () => void;
  }) => {
    return new Promise<boolean>((resolve) => {
      setDialogState({
        isOpen: true,
        ...options,
        onConfirm: () => {
          options.onConfirm?.();
          resolve(true);
          hideConfirm();
        }
      });
    });
  };

  const hideConfirm = () => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  };

  const setLoading = (loading: boolean) => {
    setDialogState(prev => ({ ...prev, loading }));
  };

  return {
    dialogState,
    showConfirm,
    hideConfirm,
    setLoading,
    ConfirmDialog: () => (
      <ConfirmDialog
        isOpen={dialogState().isOpen}
        title={dialogState().title}
        message={dialogState().message}
        confirmText={dialogState().confirmText}
        cancelText={dialogState().cancelText}
        type={dialogState().type}
        loading={dialogState().loading}
        onConfirm={dialogState().onConfirm || (() => {})}
        onCancel={hideConfirm}
      />
    )
  };
};

export default ConfirmDialog;
