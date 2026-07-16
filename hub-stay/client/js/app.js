const API_URL = window.location.origin + '/api';

const auth = {
  getToken: () => localStorage.getItem('hubstay_token'),
  getUser: () => {
    const user = localStorage.getItem('hubstay_user');
    return user ? JSON.parse(user) : null;
  },
  setAuth: (token, user) => {
    localStorage.setItem('hubstay_token', token);
    localStorage.setItem('hubstay_user', JSON.stringify(user));
  },
  logout: () => {
    localStorage.removeItem('hubstay_token');
    localStorage.removeItem('hubstay_user');
    window.location.href = '/';
  },
  isLoggedIn: () => !!localStorage.getItem('hubstay_token')
};

async function apiCall(endpoint, options = {}) {
  const token = auth.getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

function updateNavbar() {
  const nav = document.querySelector('.navbar-nav');
  if (!nav) return;

  const user = auth.getUser();
  const authSection = document.querySelector('.navbar-actions');

  if (user && authSection) {
    authSection.innerHTML = `
      <span style="font-weight:600; color: var(--gray-700);">Hi, ${user.name.split(' ')[0]}</span>
      <a href="/client/pages/profile.html" class="btn btn-outline btn-sm">Profile</a>
      <button onclick="auth.logout()" class="btn btn-sm" style="background: var(--gray-100);">Logout</button>
    `;
  }
}

function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

function getQueryParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; bottom: 24px; right: 24px; padding: 14px 24px;
    border-radius: 8px; color: white; font-weight: 600; z-index: 3000;
    animation: slideUp 0.3s ease; font-family: var(--font); font-size: 0.9rem;
    background: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--primary)'};
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function createCard(item, type) {
  const name = item.name || `${item.make} ${item.model}`;
  const location = item.location ? `${item.location.city}, ${item.location.country}` : '';
  const image = item.images && item.images.length > 0 ? item.images[0] : `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600`;
  const rating = item.rating?.average || 0;
  const ratingCount = item.rating?.count || 0;
  const price = item.price || item.pricePerDay || 0;

  let priceLabel = '/night';
  let badge = item.type || '';
  let detailUrl = `/client/pages/listing-detail.html?id=${item._id}`;
  let features = '';

  if (type === 'car') {
    priceLabel = '/day';
    badge = item.type;
    detailUrl = `/client/pages/car-detail.html?id=${item._id}`;
    features = `
      <div class="card-features">
        <span>Seats: ${item.seats}</span>
        <span>${item.transmission}</span>
        <span>${item.fuelType}</span>
      </div>
    `;
  } else if (type === 'food') {
    priceLabel = '';
    badge = item.cuisine?.replace('_', ' ') || '';
    detailUrl = `/client/pages/listing-detail.html?type=food&id=${item._id}`;
    price = item.priceRange || '';
  }

  return `
    <div class="card" onclick="window.location.href='${detailUrl}'">
      <div class="card-image">
        <img src="${image}" alt="${name}" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600'">
        <span class="card-badge">${badge}</span>
      </div>
      <div class="card-body">
        <div class="card-location">📍 ${location}</div>
        <h3 class="card-title">${name}</h3>
        <div class="card-rating">
          <span class="stars">${renderStars(rating)}</span>
          <span class="rating-text">${rating > 0 ? `${rating} (${ratingCount} reviews)` : 'No reviews'}</span>
        </div>
        ${features}
        <div class="card-price">
          <span class="price">${priceLabel ? formatPrice(price) : price} <span>${priceLabel}</span></span>
          <a href="${detailUrl}" class="btn btn-primary btn-sm">View</a>
        </div>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();

  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.navbar-nav');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => navMenu.classList.toggle('active'));
  }

  const style = document.createElement('style');
  style.textContent = `@keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`;
  document.head.appendChild(style);

  document.querySelectorAll('input[type="date"]').forEach(input => {
    input.setAttribute('placeholder', 'dd.mm.yy');
    input.addEventListener('change', function() {
      if (this.value) {
        const parts = this.value.split('-');
        this.setAttribute('data-raw', this.value);
      }
    });
  });
});
