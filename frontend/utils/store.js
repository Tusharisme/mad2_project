import router from "./router.js";
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
        // If no user is passed, try to get from localStorage
        if (!user) {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            user = JSON.parse(storedUser);
          }
        }

        if (user && user.token) {
          state.auth_token = user.token;
          state.role = user.role;
          state.loggedIn = true;
          state.user_id = user.id;

          // Set the correct customer/professional data based on role
          if (user.role === "professional") {
            state.professional = {
              id: user.professional_id,
              name: user.professional_name,
            };
            state.customer = null;
          } else if (user.role === "customer") {
            state.customer = {
              id: user.customer_id,
              name: user.customer_name,
            };
            state.professional = null;
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
      router.push("/");
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
