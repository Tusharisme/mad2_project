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
        <ul class="dropdown-menu" aria-labelledby="adminActions">
          <router-link 
            v-if="$route.path !== '/admin_dashboard'"
            class="dropdown-item" 
            to="/admin_dashboard">Dashboard</router-link>
          <router-link class="dropdown-item" to="/searchAdmin">Search</router-link>
          <router-link class="dropdown-item" to="/services">Manage Services</router-link>
          <router-link class="dropdown-item" to="/customers">Manage Customers</router-link>
          <router-link class="dropdown-item" to="/professionals">Manage Professionals</router-link>
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
        <ul class="dropdown-menu" aria-labelledby="customerActions">
          <router-link 
            v-if="$route.path !== '/customer_dashboard'"
            class="dropdown-item" 
            to="/customer_dashboard">Dashboard</router-link>
          <router-link class="dropdown-item" to="/customer_profile">Profile</router-link>
          <router-link class="dropdown-item" to="/searchCustomer">Search Services</router-link>
          <router-link class="dropdown-item" to="/service_history_customer">Service History</router-link>
          <router-link class="dropdown-item" to="/logistic_page_customer">Logistics</router-link>
          <router-link class="dropdown-item" to="/customer_payment">Payment</router-link>
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
        <ul class="dropdown-menu" aria-labelledby="professionalActions">
          <router-link 
            v-if="$route.path !== '/professional_dashboard'"
            class="dropdown-item" 
            to="/professional_dashboard">Dashboard</router-link>
          <router-link class="dropdown-item" to="/professional_profile">Profile</router-link>
          <router-link class="dropdown-item" to="/searchProfessional">Search Customers</router-link>
          <router-link class="dropdown-item" to="/logistic_page_professional">Logistics</router-link>
          <router-link class="dropdown-item" to="/professional_payment">Payment</router-link>
        </ul>
      </div>

      <!-- Navbar Brand -->
      <a class="navbar-brand" href="/" style="color: #8b4513; font-weight: 700; letter-spacing: 0.5px;">
        A to Z Household Services
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
            <router-link to="/" class="nav-link">
              <i class="fas fa-home me-1"></i> Home
            </router-link>
          </li>
          
          <!-- Services link for all visitors -->
          <li class="nav-item">
            <router-link to="/services" class="nav-link">
              <i class="fas fa-concierge-bell me-1"></i> Services
            </router-link>
          </li>
          
          <!-- Auth links -->
          <li class="nav-item" v-if="!$store.state.loggedIn">
            <router-link to="/login" class="nav-link">
              <i class="fas fa-sign-in-alt me-1"></i> Login
            </router-link>
          </li>
          <li class="nav-item" v-if="!$store.state.loggedIn">
            <router-link to="/register_customer" class="nav-link">
              <i class="fas fa-user-plus me-1"></i> Sign Up
            </router-link>
          </li>
          <li class="nav-item" v-if="!$store.state.loggedIn">
            <router-link to="/register_professional" class="nav-link btn btn-custom btn-sm ms-2 py-1">
              Register as Professional
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
};
