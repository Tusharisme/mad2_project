const store = new Vuex.Store({
  state: {
    auth_token: null,
    role: null,
    loggedIn: false,
    user_id: null,
    lastActivity: null, // Track last activity time
  },
  mutations: {
    setUser(state) {
      const user = JSON.parse(localStorage.getItem("user"));
      try {
        if (user && user.token) {
          state.auth_token = user.token;
          state.role = user.role;
          state.loggedIn = true;
          state.user_id = user.id;
          state.lastActivity = Date.now(); // Set initial activity time on login
        }
      } catch {
        console.warn("No user found");
      }
    },
    logout(state) {
      state.auth_token = null;
      state.role = null;
      state.loggedIn = false;
      state.user_id = null;
      state.lastActivity = null; // Clear last activity on logout
      localStorage.removeItem("user");
      this.$state.push("/");
    },
    setLastActivity(state) {
      state.lastActivity = Date.now(); // Update last activity time
    },
  },
  actions: {
    updateLastActivity({ commit }) {
      commit("setLastActivity"); // Action to update last activity time
    },
  },
});

store.commit("setUser"); // Initialize the user on store setup

export default store;
