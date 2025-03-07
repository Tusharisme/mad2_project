export default {
  template: `
  <nav class="navbar navbar-expand-lg navbar-custom fixed-navbar">
    <div class="container">
      <!-- Dropdown Menu for Admin Actions -->
      <div 
        v-if="$store.state.loggedIn && $store.state.role === 'admin'" 
        class="dropdown me-3" 
        :class="{'show': dropdownVisible}" 
        @mouseleave="dropdownVisible = false"
      >
        <button
          class="btn btn-custom dropdown-toggle"
          type="button"
          id="adminActions"
          aria-expanded="false"
          @mouseenter="dropdownVisible = true"
        >
          <i class="fa-solid fa-bars"></i>
        </button>
        <ul class="dropdown-menu shadow-lg" aria-labelledby="adminActions">
          <router-link 
            v-if="$route.path !== '/admin_dashboard'"
            class="dropdown-item" 
            to="/admin_dashboard">
            <i class="fas fa-tachometer-alt me-2"></i>Dashboard
          </router-link>
          <router-link 
            v-if="$route.path !== '/searchAdmin'"
            class="dropdown-item" 
            to="/searchAdmin">
            <i class="fas fa-search me-2"></i>Search
          </router-link>
          <router-link 
            v-if="$route.path !== '/services'"
            class="dropdown-item" 
            to="/services">
            <i class="fas fa-concierge-bell me-2"></i>Manage Services
          </router-link>
          <router-link 
            v-if="$route.path !== '/customers'"
            class="dropdown-item" 
            to="/customers">
            <i class="fas fa-users me-2"></i>Manage Customers
          </router-link>
          <router-link 
            v-if="$route.path !== '/professionals'"
            class="dropdown-item" 
            to="/professionals">
            <i class="fas fa-user-tie me-2"></i>Manage Professionals
          </router-link>
        </ul>
      </div>

      <!-- Dropdown Menu for Customer Actions -->
      <div 
        v-if="$store.state.loggedIn && $store.state.role === 'customer'" 
        class="dropdown me-3" 
        :class="{'show': dropdownVisible}" 
        @mouseleave="dropdownVisible = false"
      >
        <button
          class="btn btn-custom dropdown-toggle"
          type="button"
          id="customerActions"
          aria-expanded="false"
          @mouseenter="dropdownVisible = true"
        >
          <i class="fa-solid fa-bars"></i>
        </button>
        <ul class="dropdown-menu shadow-lg" aria-labelledby="customerActions">
          <router-link 
            v-if="$route.path !== '/customer_dashboard'"
            class="dropdown-item" 
            to="/customer_dashboard">
            <i class="fas fa-tachometer-alt me-2"></i>Dashboard
          </router-link>
          <router-link 
            v-if="$route.path !== '/customer_profile'"
            class="dropdown-item" 
            to="/customer_profile">
            <i class="fas fa-user-circle me-2"></i>Profile
          </router-link>
          <router-link 
            v-if="$route.path !== '/searchCustomer'"
            class="dropdown-item" 
            to="/searchCustomer">
            <i class="fas fa-search me-2"></i>Search Services
          </router-link>
          <router-link 
            v-if="$route.path !== '/service_history_customer'"
            class="dropdown-item" 
            to="/service_history_customer">
            <i class="fas fa-history me-2"></i>Service History
          </router-link>
          <router-link 
            v-if="$route.path !== '/logistic_page_customer'"
            class="dropdown-item" 
            to="/logistic_page_customer">
            <i class="fas fa-truck me-2"></i>Logistics
          </router-link>
          <router-link 
            v-if="$route.path !== '/customer_payment'"
            class="dropdown-item" 
            to="/customer_payment">
            <i class="fas fa-credit-card me-2"></i>Payment
          </router-link>
        </ul>
      </div>

      <!-- Dropdown Menu for Professional Actions -->
      <div 
        v-if="$store.state.loggedIn && $store.state.role === 'professional'" 
        class="dropdown me-3" 
        :class="{'show': dropdownVisible}" 
        @mouseleave="dropdownVisible = false"
      >
        <button
          class="btn btn-custom dropdown-toggle"
          type="button"
          id="professionalActions"
          aria-expanded="false"
          @mouseenter="dropdownVisible = true"
        >
          <i class="fa-solid fa-bars"></i>
        </button>
        <ul class="dropdown-menu shadow-lg" aria-labelledby="professionalActions">
          <router-link 
            v-if="$route.path !== '/professional_dashboard'"
            class="dropdown-item" 
            to="/professional_dashboard">
            <i class="fas fa-tachometer-alt me-2"></i>Dashboard
          </router-link>
          <router-link 
            v-if="$route.path !== '/professional_profile'"
            class="dropdown-item" 
            to="/professional_profile">
            <i class="fas fa-user-circle me-2"></i>Profile
          </router-link>
          <router-link 
            v-if="$route.path !== '/searchProfessional'"
            class="dropdown-item" 
            to="/searchProfessional">
            <i class="fas fa-search me-2"></i>Search Customers
          </router-link>
          <router-link 
            v-if="$route.path !== '/logistic_page_professional'"
            class="dropdown-item" 
            to="/logistic_page_professional">
            <i class="fas fa-truck me-2"></i>Logistics
          </router-link>
          <router-link 
            v-if="$route.path !== '/professional_payment'"
            class="dropdown-item" 
            to="/professional_payment">
            <i class="fas fa-credit-card me-2"></i>Payment
          </router-link>
        </ul>
      </div>

      <!-- Navbar Brand -->
      <a class="navbar-brand" href="/" style="color: #8b4513; font-weight: 700; letter-spacing: 0.5px;">
        <i class="fas fa-home-alt me-2"></i>A to Z Household Services
      </a>

      <!-- Toggler for Mobile View -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Navbar Links -->
      <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
        <ul class="navbar-nav">
          <!-- Home link for all visitors -->
          <li class="nav-item">
            <router-link to="/" class="nav-link" :class="{'active-nav-link': $route.path === '/'}">
              <i class="fas fa-home me-1"></i> Home
            </router-link>
          </li>
          
          <!-- Services link for all visitors -->
          <li class="nav-item">
            <router-link to="/services" class="nav-link" :class="{'active-nav-link': $route.path === '/services'}">
              <i class="fas fa-concierge-bell me-1"></i> Services
            </router-link>
          </li>
          
          <!-- Auth links -->
          <li class="nav-item" v-if="!$store.state.loggedIn">
            <router-link to="/login" class="nav-link" :class="{'active-nav-link': $route.path === '/login'}">
              <i class="fas fa-sign-in-alt me-1"></i> Login
            </router-link>
          </li>
          <li class="nav-item" v-if="!$store.state.loggedIn">
            <router-link to="/register_customer" class="nav-link" :class="{'active-nav-link': $route.path === '/register_customer'}">
              <i class="fas fa-user-plus me-1"></i> Sign Up
            </router-link>
          </li>
          <li class="nav-item" v-if="!$store.state.loggedIn">
            <router-link to="/register_professional" class="nav-link btn btn-custom btn-sm ms-2 py-1 nav-btn">
              <i class="fas fa-briefcase me-1"></i> Register as Professional
            </router-link>
          </li>
          <li class="nav-item" v-if="$store.state.loggedIn">
            <button class="btn btn-custom-outline nav-link" @click="$store.commit('logout')">
              <i class="fas fa-sign-out-alt me-1"></i> Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  `,
  data() {
    return {
      dropdownVisible: false,
    };
  },
  methods: {
    toggleDropdown() {
      this.dropdownVisible = !this.dropdownVisible;
    },
  },
  watch: {
    $route() {
      this.dropdownVisible = false;
    },
  },
  mounted() {
    // Add custom CSS for navbar styling
    const style = document.createElement("style");
    style.textContent = `
      .navbar-custom {
        background-color: #f8f0e2;
        box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
        padding: 12px 20px;
        transition: all 0.3s ease;
      }
      
      .fixed-navbar {
        position: sticky;
        top: 0;
        z-index: 1000;
      }
      
      .btn-custom {
        background-color: #8b4513;
        color: white;
        border: none;
        border-radius: 5px;
        transition: all 0.3s ease;
      }
      
      .btn-custom:hover {
        background-color: #7a3e10;
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }
      
      .btn-custom-outline {
        background-color: transparent;
        color: #8b4513;
        border: 1px solid #8b4513;
        border-radius: 5px;
        transition: all 0.3s ease;
      }
      
      .btn-custom-outline:hover {
        background-color: #8b4513;
        color: white;
      }
      
      .dropdown-menu {
        border: none;
        border-radius: 10px;
        background-color: #f8f0e2;
        padding: 10px;
        min-width: 220px;
        animation: fadeIn 0.3s ease;
      }
      
      .dropdown-item {
        padding: 10px 15px;
        border-radius: 8px;
        margin-bottom: 5px;
        transition: all 0.2s ease;
      }
      
      .dropdown-item:hover {
        background-color: #e0d0c0;
        transform: translateX(5px);
      }
      
      .active-nav-link {
        color: #8b4513 !important;
        font-weight: 600;
        position: relative;
      }
      
      .active-nav-link:after {
        content: '';
        position: absolute;
        bottom: -5px;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: #8b4513;
        animation: slideIn 0.3s ease forwards;
      }
      
      .nav-btn {
        margin-top: 0;
        margin-bottom: 0;
      }
      
      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes slideIn {
        from {
          width: 0;
        }
        to {
          width: 100%;
        }
      }
    `;
    document.head.appendChild(style);
  },
};
