/**
 * Main Web App Logic & Cart Manager
 * Bloom & Blossom Flower Shop System
 */

import { FlowerAPI } from './api.js';
import { Auth } from './auth.js';

// Cart Helper Utility
export const Cart = {
  getCart: function() {
    return JSON.parse(localStorage.getItem('bloom_cart')) || [];
  },

  saveCart: function(cart) {
    localStorage.setItem('bloom_cart', JSON.stringify(cart));
    this.updateCartBadge();
  },

  addItem: async function(flowerId) {
    const flower = await FlowerAPI.getFlowerById(flowerId);
    if (!flower) return;

    let cart = this.getCart();
    const existingIndex = cart.findIndex(item => item.id === flower.id);

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({ ...flower, quantity: 1 });
    }

    this.saveCart(cart);
    this.showToast(`Added "${flower.name}" to cart!`);
  },

  updateQuantity: function(flowerId, delta) {
    let cart = this.getCart();
    const index = cart.findIndex(item => item.id === flowerId);

    if (index > -1) {
      cart[index].quantity += delta;
      if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
      }
      this.saveCart(cart);
    }
  },

  removeItem: function(flowerId) {
    let cart = this.getCart();
    cart = cart.filter(item => item.id !== flowerId);
    this.saveCart(cart);
  },

  clearCart: function() {
    localStorage.removeItem('bloom_cart');
    this.updateCartBadge();
  },

  updateCartBadge: function() {
    const badges = document.querySelectorAll('.cart-badge');
    const cart = this.getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    badges.forEach(b => b.textContent = totalCount);
  },

  showToast: function(message) {
    const existingToast = document.querySelector('.toast-msg');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.style.cssText = `
      position: fixed;
      bottom: 25px;
      right: 25px;
      background: #e85d75;
      color: white;
      padding: 0.9rem 1.5rem;
      border-radius: 30px;
      box-shadow: 0 10px 25px rgba(232, 93, 117, 0.4);
      z-index: 2000;
      font-weight: 600;
      animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 2800);
  }
};

// UI Initialization
document.addEventListener('DOMContentLoaded', async () => {
  Auth.updateNavUI();
  Cart.updateCartBadge();

  const flowerGrid = document.getElementById('flower-grid');
  const searchInput = document.getElementById('search-input');
  const categoryContainer = document.getElementById('category-tags');

  let currentCategory = 'all';
  let searchQuery = '';

  // Render flower cards on home catalog page
  async function renderCatalog() {
    if (!flowerGrid) return;

    flowerGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 2rem;">Loading beautiful flowers...</div>`;
    const flowers = await FlowerAPI.filterFlowers(currentCategory, searchQuery);

    if (flowers.length === 0) {
      flowerGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #718096;">
          <h3>No flowers found</h3>
          <p>Try searching for a different bouquet or rose variant.</p>
        </div>
      `;
      return;
    }

    flowerGrid.innerHTML = flowers.map(flower => `
      <div class="flower-card">
        <div class="card-img-wrapper">
          <img src="${flower.image}" alt="${flower.name}" loading="lazy">
          <span class="badge-tag">⭐ ${flower.rating}</span>
        </div>
        <div class="card-body">
          <h3 class="card-title">${flower.name}</h3>
          <p class="card-desc">${flower.description}</p>
          <div class="card-footer">
            <span class="price">$${flower.price.toFixed(2)}</span>
            <button class="btn btn-primary add-to-cart-btn" data-id="${flower.id}">
              + Add to Cart
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Attach click listeners to Add to Cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.dataset.id);
        Cart.addItem(id);
      });
    });
  }

  if (flowerGrid) {
    renderCatalog();

    // Category button filters
    if (categoryContainer) {
      categoryContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('tag-btn')) {
          document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
          e.target.classList.add('active');
          currentCategory = e.target.dataset.category;
          renderCatalog();
        }
      });
    }

    // Search filter input
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderCatalog();
      });
    }
  }
});
