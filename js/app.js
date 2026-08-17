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

  showVerificationModal: function(flowerItem, onConfirm) {
    const existingModal = document.getElementById('cart-verify-modal');
    if (existingModal) existingModal.remove();

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'cart-verify-modal';
    modalOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.25s ease-in-out;
    `;

    modalOverlay.innerHTML = `
      <div style="
        background: #1e0508;
        border: 1px solid rgba(212, 175, 55, 0.4);
        border-radius: 16px;
        padding: 2.2rem 2rem;
        max-width: 440px;
        width: 90%;
        color: #fff;
        box-shadow: 0 20px 50px rgba(0,0,0,0.8);
        text-align: center;
        transform: scale(0.95);
      ">
        <div style="font-size: 3rem; margin-bottom: 0.5rem; color: #d4af37;">🛒</div>
        <h3 style="margin-top: 0; margin-bottom: 0.5rem; font-size: 1.6rem; color: #fff; font-family: 'Playfair Display', serif;">Confirm Order</h3>
        <p style="font-family: sans-serif; font-size: 0.95rem; color: rgba(255,255,255,0.8); margin-bottom: 1.8rem; line-height: 1.5;">
          Are you sure you want to add <strong style="color: #d4af37;">"${flowerItem.name}"</strong> ($${parseFloat(flowerItem.price).toFixed(2)}) to your shopping cart?
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <button id="cart-cancel-btn" style="
            background: transparent;
            border: 1px solid rgba(255,255,255,0.3);
            color: #fff;
            padding: 0.7rem 1.4rem;
            border-radius: 30px;
            cursor: pointer;
            font-weight: 600;
            font-family: sans-serif;
          ">Cancel</button>
          <button id="cart-confirm-btn" style="
            background: linear-gradient(135deg, #d4af37, #aa820a);
            border: none;
            color: #000;
            padding: 0.7rem 1.6rem;
            border-radius: 30px;
            cursor: pointer;
            font-weight: 700;
            box-shadow: 0 4px 15px rgba(212, 175, 55, 0.4);
            font-family: sans-serif;
          ">Yes, Add to Cart</button>
        </div>
      </div>
    `;

    document.body.appendChild(modalOverlay);

    const closeModal = () => modalOverlay.remove();

    document.getElementById('cart-cancel-btn').addEventListener('click', closeModal);
    document.getElementById('cart-confirm-btn').addEventListener('click', () => {
      closeModal();
      onConfirm();
    });

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  },

  addItem: async function(flowerItem) {
    let flower;
    if (typeof flowerItem === 'object') {
      flower = flowerItem;
    } else {
      flower = await FlowerAPI.getFlowerById(flowerItem);
    }
    if (!flower) return;

    this.showVerificationModal(flower, () => {
      let cart = this.getCart();
      const existingIndex = cart.findIndex(item => item.id === flower.id);

      if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
      } else {
        cart.push({ ...flower, quantity: 1 });
      }

      this.saveCart(cart);
      this.showToast(`Added "${flower.name}" to cart!`);
    });
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
