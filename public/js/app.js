// Global UI helpers: toast notifications
(function () {
  const container = document.getElementById('toastContainer');

  function createToast(message, type, timeout) {
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('visible'));
    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => {
        if (toast.parentNode === container) container.removeChild(toast);
      }, 300);
    }, timeout);
  }

  function showSuccess(message, timeout = 3000) {
    createToast(message, 'success', timeout);
  }

  function showError(message, timeout = 5000) {
    createToast(message, 'error', timeout);
  }

  window.showSuccess = showSuccess;
  window.showError = showError;
})();
