/**
 * Authentication Module
 * Bloom & Blossom Flower Shop System
 */

export const Auth = {
  // Get active session user
  getUser: function() {
    const userStr = localStorage.getItem('bloom_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Register new customer
  register: function(name, email, password) {
    const usersStr = localStorage.getItem('bloom_registered_users');
    const users = usersStr ? JSON.parse(usersStr) : [];

    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: "Email is already registered!" };
    }

    const newUser = { id: Date.now(), name, email, password };
    users.push(newUser);
    localStorage.setItem('bloom_registered_users', JSON.stringify(users));

    // Auto login
    localStorage.setItem('bloom_user', JSON.stringify({ name: newUser.name, email: newUser.email }));
    return { success: true, message: "Registration successful!" };
  },

  // Login existing customer
  login: function(email, password) {
    const usersStr = localStorage.getItem('bloom_registered_users');
    const users = usersStr ? JSON.parse(usersStr) : [];

    // Default demo user fallback for quick testing
    if (email === "demo@bloom.com" && password === "demo123") {
      const demoUser = { name: "Demo Customer", email: "demo@bloom.com" };
      localStorage.setItem('bloom_user', JSON.stringify(demoUser));
      return { success: true, user: demoUser };
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) {
      return { success: false, message: "Invalid email or password." };
    }

    const loggedUser = { name: user.name, email: user.email };
    localStorage.setItem('bloom_user', JSON.stringify(loggedUser));
    return { success: true, user: loggedUser };
  },

  // Logout current customer
  logout: function() {
    localStorage.removeItem('bloom_user');
    window.location.reload();
  },

  // Update navbar user status UI
  updateNavUI: function() {
    const userNav = document.getElementById('user-nav-slot');
    if (!userNav) return;

    const currentUser = this.getUser();
    if (currentUser) {
      userNav.innerHTML = `
        <div class="user-info" style="background: rgba(255,255,255,0.15); border: 1px solid rgba(212,175,55,0.4); color: #fff;">
          <span>🌸 Hi, <strong>${currentUser.name}</strong></span>
          <button id="logout-btn" class="btn btn-outline" style="padding: 0.3rem 0.8rem; font-size: 0.8rem; border-color: rgba(255,255,255,0.4); color: #fff;">Logout</button>
        </div>
      `;
      document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
    } else {
      userNav.innerHTML = `
        <a href="login.html" class="maison-btn maison-btn-gold" style="padding: 0.45rem 1.2rem; font-size: 0.75rem; letter-spacing: 1px;">
          LOG IN
        </a>
      `;
    }
  }
};
