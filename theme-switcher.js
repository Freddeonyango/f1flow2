// Get the current theme from localStorage or default to 'light'
function getCurrentTheme() {
  return localStorage.getItem('theme') || 'light';
}

// Set the theme and update the UI
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  
  // Update active button styling
  document.querySelectorAll('.theme-option').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.theme === theme) {
      btn.classList.add('active');
    }
  });
}

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
  const theme = getCurrentTheme();
  setTheme(theme);
  
  // Attach click handlers to theme buttons
  document.querySelectorAll('.theme-option').forEach(button => {
    button.addEventListener('click', () => {
      const selectedTheme = button.dataset.theme;
      setTheme(selectedTheme);
    });
  });
});

// Export for use in other parts of your app
window.switchTheme = setTheme;
