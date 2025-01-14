// export default {
//   template: `
//       <nav>
//         <router-link to="/"> Home </router-link>
//         <router-link v-if="!$store.state.loggedIn" to="/login"> Login </router-link>
//         <router-link v-if="!$store.state.loggedIn" to="/register_customer"> Register </router-link>
//         <router-link v-if="$store.state.loggedIn && $store.state.role=='admin'" to="/admin_dashboard"> Admin Dashboard </router-link>
//         <router-link v-if="$store.state.loggedIn && $store.state.role=='customer'" to="/services"> Services</router-link>
//         <button v-if="$store.state.loggedIn" class="btn btn-primary" @click="$store.commit('logout')">Logout</button>
//       </nav>
//     `,
// // };
// export default {
//   template: `
//     <nav class="navbar navbar-expand-lg navbar-custom fixed-navbar">
//       <div class="container">
//         <a class="navbar-brand" href="/" style="color: black;">
//           <b>A to Z Household Services</b>
//         </a>
//         <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
//             aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
//           <span class="navbar-toggler-icon"></span>
//         </button>
//         <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
//           <ul class="navbar-nav">
//             <li class="nav-item" v-if="!$store.state.loggedIn">
//               <router-link to="/login" class="nav-link"><b>Login</b></router-link>
//             </li>
//             <li class="nav-item" v-if="!$store.state.loggedIn">
//               <router-link to="/register_customer" class="nav-link"><b>Sign Up</b></router-link>
//             </li>
//             <li class="nav-item" v-if="!$store.state.loggedIn">
//               <router-link to="/register_professional" class="nav-link"><b>Register as Professional</b></router-link>
//             </li>
//             <li class="nav-item" v-if="$store.state.loggedIn && $store.state.role === 'admin'">
//               <router-link to="/admin_dashboard" class="nav-link"><b>Admin Dashboard</b></router-link>
//             </li>
//             <li class="nav-item" v-if="$store.state.loggedIn && $store.state.role === 'customer'">
//               <router-link to="/services" class="nav-link"><b>Services</b></router-link>
//             </li>
//             <li class="nav-item" v-if="$store.state.loggedIn">
//               <button class="btn btn-primary nav-link" @click="$store.commit('logout')">Logout</button>
//             </li>
//           </ul>
//         </div>
//       </div>
//     </nav>
//   `,
// // };
// export default {
//   template: `
//   <nav class="navbar navbar-expand-lg navbar-custom fixed-navbar">
//     <div class="container">
//       <a class="navbar-brand" href="/" style="color: black;">
//         <b>A to Z Household Services</b>
//       </a>
//       <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
//           aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
//         <span class="navbar-toggler-icon"></span>
//       </button>
//       <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
//         <ul class="navbar-nav">
//           <li class="nav-item" v-if="!$store.state.loggedIn">
//             <router-link to="/login" class="nav-link"><b>Login</b></router-link>
//           </li>
//           <li class="nav-item" v-if="!$store.state.loggedIn">
//             <router-link to="/register_customer" class="nav-link"><b>Sign Up</b></router-link>
//           </li>
//           <li class="nav-item" v-if="!$store.state.loggedIn">
//             <router-link to="/register_professional" class="nav-link"><b>Register as Professional</b></router-link>
//           </li>
//           <li class="nav-item" v-if="$store.state.loggedIn && $store.state.role === 'admin'">
//             <router-link to="/admin_dashboard" class="nav-link"><b>Admin Dashboard</b></router-link>
//           </li>
//           <li class="nav-item" v-if="$store.state.loggedIn && $store.state.role === 'customer'">
//             <router-link to="/services" class="nav-link"><b>Services</b></router-link>
//           </li>
//           <li class="nav-item" v-if="$store.state.loggedIn">
//             <button class="btn btn-primary nav-link" @click="$store.commit('logout')">Logout</button>
//           </li>
//           <!-- Dropdown Menu for Admin -->
//           <li class="nav-item dropdown">
//             <a class="nav-link dropdown-toggle" href="#" id="adminDropdown" role="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
//               Admin Actions
//             </a>
//             <div class="dropdown-menu" aria-labelledby="adminDropdown">
//               <router-link class="dropdown-item" :to="'/admin_dashboard'">Dashboard</router-link>
//               <router-link class="dropdown-item" :to="'/services'">Manage Services</router-link>
//               <router-link class="dropdown-item" :to="'/customers'">Manage Customers</router-link>
//               <router-link class="dropdown-item" :to="'/professionals'">Manage Professionals</router-link>
//             </div>
//           </li>
//         </ul>
//       </div>
//     </div>
//   </nav>
// `,
// };

// export default {
//   template: `
//   <nav class="navbar navbar-expand-lg navbar-custom fixed-navbar">
//     <div class="container">
//       <!-- Dropdown Menu for Admin Actions -->
//       <div v-if="$store.state.loggedIn && $store.state.role === 'admin'" class="dropdown me-3">
//         <button
//           class="btn btn-light dropdown-toggle"
//           type="button"
//           id="adminActions"
//           data-bs-toggle="dropdown"
//           aria-expanded="false"
//         >
//           <i class="bi bi-list"></i>
//         </button>
//         <ul class="dropdown-menu" aria-labelledby="adminActions">
//           <router-link class="dropdown-item" to="/admin_dashboard">Dashboard</router-link>
//           <router-link class="dropdown-item" to="/services">Manage Services</router-link>
//           <router-link class="dropdown-item" to="/customers">Manage Customers</router-link>
//           <router-link class="dropdown-item" to="/professionals">Manage Professionals</router-link>
//         </ul>
//       </div>

//       <!-- Navbar Brand -->
//       <a class="navbar-brand" href="/" style="color: black;">
//         <b>A to Z Household Services</b>
//       </a>

//       <!-- Toggler for Mobile View -->
//       <button
//         class="navbar-toggler"
//         type="button"
//         data-bs-toggle="collapse"
//         data-bs-target="#navbarNav"
//         aria-controls="navbarNav"
//         aria-expanded="false"
//         aria-label="Toggle navigation"
//       >
//         <span class="navbar-toggler-icon"></span>
//       </button>

//       <!-- Navbar Links -->
//       <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
//         <ul class="navbar-nav">
//           <!-- Visible based on user login status -->
//           <li class="nav-item" v-if="!$store.state.loggedIn">
//             <router-link to="/login" class="nav-link"><b>Login</b></router-link>
//           </li>
//           <li class="nav-item" v-if="!$store.state.loggedIn">
//             <router-link to="/register_customer" class="nav-link"><b>Sign Up</b></router-link>
//           </li>
//           <li class="nav-item" v-if="!$store.state.loggedIn">
//             <router-link to="/register_professional" class="nav-link"><b>Register as Professional</b></router-link>
//           </li>
//           <li class="nav-item" v-if="$store.state.loggedIn && $store.state.role === 'customer'">
//             <router-link to="/services" class="nav-link"><b>Services</b></router-link>
//           </li>
//           <li class="nav-item" v-if="$store.state.loggedIn">
//             <button class="btn btn-primary nav-link" @click="$store.commit('logout')">Logout</button>
//           </li>
//         </ul>
//       </div>
//     </div>
//   </nav>
//   `,
// };
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
          <li class="nav-item" v-if="$store.state.loggedIn && $store.state.role === 'customer'">
            <router-link to="/services" class="nav-link"><b>Services</b></router-link>
          </li>
          <li class="nav-item" v-if="$store.state.loggedIn">
            <button class="btn btn-primary nav-link" @click="$store.commit('logout')">Logout</button>
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
