// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

// DOM Elements
const searchForm = document.querySelector('#search-form');
const searchInput = document.querySelector('#input-value');
const paraText = document.querySelector('#para-text');
const signInButton = document.querySelector('#sign-in');
const cards = document.querySelectorAll('.card');
const navbar = document.querySelector('.navbar');

// Debounce function for performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Search functionality with debounce
const handleSearch = debounce((event) => {
  event.preventDefault();
  
  const searchValue = searchInput.value.trim();
  
  if (!searchValue) {
    showError('Please enter a search term');
    return;
  }

  // Update the text with animation
  paraText.style.opacity = '0';
  setTimeout(() => {
    paraText.textContent = searchValue.toUpperCase();
    paraText.style.opacity = '1';
  }, 300);
}, 300);

// User info collection with validation
function collectUserInfo() {
  const userInfo = {
    name: '',
    country: '',
    foodPreference: ''
  };

  // Get user name
  userInfo.name = prompt('👋 Welcome! What is your name?');
  if (!userInfo.name) return;

  // Get country
  userInfo.country = prompt('🌎 From which country are you?');
  if (!userInfo.country) return;

  // Get food preference
  userInfo.foodPreference = prompt('What type of food you want to order? Asian, French, Greek.😇');
  if (!userInfo.foodPreference) return;

  // Validate and process food preference
  const validFoods = ['asian', 'french', 'greek'];
  const normalizedFood = userInfo.foodPreference.toLowerCase().trim();
  
  if (validFoods.includes(normalizedFood)) {
    showSuccess(`Hi👋 ${userInfo.name}, Thanks for connecting from ${userInfo.country}, Happy exploring ${normalizedFood} food.😍`);
  } else {
    showError(`Ahhh ${userInfo.name} your ${userInfo.foodPreference} food is out of list😕, Stay connected for taste different🤤`);
  }
}

// Utility functions
function showError(message) {
  const toast = createToast(message, 'error');
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function showSuccess(message) {
  const toast = createToast(message, 'success');
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function createToast(message, type) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  return toast;
}

// Intersection Observer for card animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

cards.forEach(card => observer.observe(card));

// Navbar scroll behavior
let lastScroll = 0;
const handleScroll = debounce(() => {
  const currentScroll = window.pageYOffset;
  
  if (currentScroll <= 0) {
    navbar.classList.remove('scroll-up');
    return;
  }
  
  if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
    navbar.classList.remove('scroll-up');
    navbar.classList.add('scroll-down');
  } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
    navbar.classList.remove('scroll-down');
    navbar.classList.add('scroll-up');
  }
  
  lastScroll = currentScroll;
}, 100);

// Add loading state to buttons
function addLoadingState(button) {
  button.disabled = true;
  button.dataset.originalText = button.textContent;
  button.textContent = 'Loading...';
}

function removeLoadingState(button) {
  button.disabled = false;
  button.textContent = button.dataset.originalText;
}

// Smooth scrolling with offset for fixed header
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const headerOffset = 80;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Lazy loading for images
document.addEventListener('DOMContentLoaded', () => {
  const lazyImages = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });

  lazyImages.forEach(img => imageObserver.observe(img));
});

// Event Listeners
searchForm.addEventListener('submit', handleSearch);
signInButton.addEventListener('click', collectUserInfo);
window.addEventListener('scroll', handleScroll);

// Add keyboard navigation support
document.addEventListener('keydown', (event) => {
  if (event.key === 'Tab') {
    document.body.classList.add('user-is-tabbing');
  }
});

document.addEventListener('mousedown', () => {
  document.body.classList.remove('user-is-tabbing');
});

// Add CSS for toast notifications
const style = document.createElement('style');
style.textContent = `
  .toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 1rem 2rem;
    border-radius: 4px;
    color: white;
    font-weight: bold;
    z-index: 1000;
    animation: slideIn 0.3s ease-out;
  }
  
  .toast.success {
    background-color: #4CAF50;
  }
  
  .toast.error {
    background-color: #f44336;
  }
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  .card {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.5s ease-out, transform 0.5s ease-out;
  }
  
  .card.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  .navbar {
    transition: transform 0.3s ease-in-out;
  }
  
  .navbar.scroll-down {
    transform: translateY(-100%);
  }
  
  .navbar.scroll-up {
    transform: translateY(0);
  }
`;
document.head.appendChild(style);
