export default {
  template: `
  <nav class="navbar navbar-expand-lg navbar-custom fixed-navbar">
    <div class="container">
      <!-- Dropdown Menu for Admin Actions -->
      <div v-if="$store.state.loggedIn && $store.state.role === 'admin'" class="dropdown me-3" :class="{'show': dropdownVisible}" @mouseleave="dropdownVisible = false">
        <button
          class="btn btn-light dropdown-toggle"
          type="button"
          id="adminActions"
          aria-expanded="false"
          @mouseenter="dropdownVisible = true"
        >
          <i class="fa-solid fa-bars"></i>
        </button>
        <ul class="dropdown-menu" aria-labelledby="adminActions">
          <router-link class="dropdown-item" to="/admin_dashboard">Dashboard</router-link>
          <router-link class="dropdown-item" to="/services">Manage Services</router-link>
          <router-link class="dropdown-item" to="/customers">Manage Customers</router-link>
          <router-link class="dropdown-item" to="/professionals">Manage Professionals</router-link>
        </ul>
      </div>

      <!-- Dropdown Menu for Customer Actions -->
      <div v-if="$store.state.loggedIn && $store.state.role === 'customer'" class="dropdown me-3" :class="{'show': dropdownVisible}" @mouseleave="dropdownVisible = false">
        <button
          class="btn btn-light dropdown-toggle"
          type="button"
          id="customerActions"
          aria-expanded="false"
          @mouseenter="dropdownVisible = true"
        >
          <i class="fa-solid fa-bars"></i>
        </button>
        <ul class="dropdown-menu" aria-labelledby="customerActions">
          <router-link class="dropdown-item" to="/profile">Profile</router-link>
          <router-link class="dropdown-item" to="/search">Search Services</router-link>
          <router-link class="dropdown-item" to="/service_history">Service History</router-link>
          <router-link class="dropdown-item" to="/logistics">Logistics</router-link>
          <router-link class="dropdown-item" to="/payment">Payment</router-link>
        </ul>
      </div>

      <!-- Navbar Brand -->
      <a class="navbar-brand" href="/" style="color: black;">
        <b>A to Z Household Services</b>
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
          <!-- Visible based on user login status -->
          <li class="nav-item" v-if="!$store.state.loggedIn">
            <router-link to="/login" class="nav-link"><b>Login</b></router-link>
          </li>
          <li class="nav-item" v-if="!$store.state.loggedIn">
            <router-link to="/register_customer" class="nav-link"><b>Sign Up</b></router-link>
          </li>
          <li class="nav-item" v-if="!$store.state.loggedIn">
            <router-link to="/register_professional" class="nav-link"><b>Register as Professional</b></router-link>
          </li>
          <li class="nav-item" v-if="$store.state.loggedIn">
            <button class="btn btn-secondary nav-link" @click="$store.commit('logout')">Logout</button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
  `,
  data() {
    return {
      dropdownVisible: false, // Track if dropdown is visible
    };
  },
  methods: {
    toggleDropdown() {
      this.dropdownVisible = !this.dropdownVisible;
    },
  },
  watch: {
    $route(to, from) {
      this.dropdownVisible = false; // Close dropdown when navigating to a new page
    },
  },
};
