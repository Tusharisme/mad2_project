// const servicesModule = {
//   state: {
//     services: [],
//   },
//   mutations: {
//     setServices(state, services) {
//       state.services = services;
//     },
//   },
//   actions: {
//     async fetchServices({ commit, rootState }) {
//       try {
//         const token = rootState.auth_token; // Access token from rootState
//         console.log("Auth token:", token);

//         const response = await fetch("/api/services", {
//           headers: {
//             "Content-Type": "application/json",
//             "Authentication-Token": token, // Use token in headers
//           },
//         });

//         if (!response.ok) throw new Error("Failed to fetch services");

//         const services = await response.json();
//         console.log("Fetched services:", services); // Log the parsed data

//         commit("setServices", services);
//         return services;
//       } catch (error) {
//         console.error("[Vuex] Failed to fetch services:", error.message);
//         return [];
//       }
//     },
//   },
//   getters: {
//     allServices: (state) => state.services,
//   },
// };

// const store = new Vuex.Store({
//   modules: {
//     services: servicesModule,
//   },
//   state: {
//     auth_token: null,
//     role: null,
//     loggedIn: false,
//     user_id: null,
//     professional_id: null, // New state to store professional ID
//     customer_id: null, // New state to store customer ID
//     lastActivity: null,
//   },
//   mutations: {
//     setUser(state, user) {
//       try {
//         if (user && user.token) {
//           state.auth_token = user.token;
//           state.role = user.role;
//           state.loggedIn = true;
//           state.user_id = user.id; // Ensure user_id is set (from backend)

//           // Set the correct ID based on role
//           if (user.role === "professional") {
//             state.professional_id = user.id; // Set professional ID
//             state.customer_id = null; // Clear customer ID if not a customer
//           } else if (user.role === "customer") {
//             state.customer_id = user.id; // Set customer ID
//             state.professional_id = null; // Clear professional ID if not a professional
//           }

//           state.lastActivity = Date.now();
//         }
//       } catch (error) {
//         console.warn("Error in setUser mutation:", error);
//       }
//     },
//     logout(state) {
//       state.auth_token = null;
//       state.role = null;
//       state.loggedIn = false;
//       state.user_id = null;
//       state.professional_id = null;
//       state.customer_id = null;
//       state.lastActivity = null;
//       localStorage.removeItem("user");
//     },
//     setLastActivity(state) {
//       state.lastActivity = Date.now();
//     },
//     setCustomerId(state, customerId) {
//       state.customer_id = customerId;
//     },
//     setProfessionalId(state, professionalId) {
//       state.professional_id = professionalId;
//     },
//   },
//   actions: {
//     updateLastActivity({ commit }) {
//       commit("setLastActivity");
//     },
//     checkSessionTimeout({ state, commit }) {
//       const sessionTimeout = 30 * 60 * 1000; // 30 minutes
//       const isExpired =
//         state.lastActivity && Date.now() - state.lastActivity > sessionTimeout;

//       if (isExpired) {
//         commit("logout");
//       }
//     },
//   },
//   getters: {
//     isSessionExpired: (state) => {
//       const sessionTimeout = 30 * 60 * 1000; // 30 minutes
//       return (
//         state.lastActivity && Date.now() - state.lastActivity > sessionTimeout
//       );
//     },
//   },
// });

// export default store;
const store = new Vuex.Store({
  state: {
    auth_token: null,
    role: null,
    loggedIn: false,
    user_id: null,
    professional: null, // Store professional data (ID and name)
    customer: null, // Store customer data (ID and name)
    lastActivity: null,
  },
  mutations: {
    setUser(state, user) {
      try {
        if (user && user.token) {
          state.auth_token = user.token;
          state.role = user.role;
          state.loggedIn = true;
          state.user_id = user.id; // Ensure user_id is set (from backend)

          // Set the correct customer/professional data based on role
          if (user.role === "professional") {
            state.professional = {
              id: user.professional_id,
              name: user.professional_name, // Store name
            };
            state.customer = null; // Clear customer data if not a customer
          } else if (user.role === "customer") {
            state.customer = {
              id: user.customer_id,
              name: user.customer_name, // Store name
            };
            state.professional = null; // Clear professional data if not a professional
          }

          state.lastActivity = Date.now();
        }
      } catch (error) {
        console.warn("Error in setUser mutation:", error);
      }
    },
    logout(state) {
      state.auth_token = null;
      state.role = null;
      state.loggedIn = false;
      state.user_id = null;
      state.professional = null;
      state.customer = null;
      state.lastActivity = null;
      localStorage.removeItem("user");
    },
    setLastActivity(state) {
      state.lastActivity = Date.now();
    },
  },
  actions: {
    updateLastActivity({ commit }) {
      commit("setLastActivity");
    },
    checkSessionTimeout({ state, commit }) {
      const sessionTimeout = 30 * 60 * 1000; // 30 minutes
      const isExpired =
        state.lastActivity && Date.now() - state.lastActivity > sessionTimeout;

      if (isExpired) {
        commit("logout");
      }
    },
  },
  getters: {
    isSessionExpired: (state) => {
      const sessionTimeout = 30 * 60 * 1000; // 30 minutes
      return (
        state.lastActivity && Date.now() - state.lastActivity > sessionTimeout
      );
    },
  },
});

export default store;
