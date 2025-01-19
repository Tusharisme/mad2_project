const servicesModule = {
  state: {
    services: [],
  },
  mutations: {
    setServices(state, services) {
      state.services = services;
    },
  },
  actions: {
    async fetchServices({ commit, rootState }) {
      try {
        const token = rootState.auth_token; // Access token from rootState
        console.log("Auth token:", token);

        const response = await fetch("/api/services", {
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": token, // Use token in headers
          },
        });

        if (!response.ok) throw new Error("Failed to fetch services");

        // Parse the response body as JSON and return it
        const services = await response.json();
        console.log("Fetched services:", services); // Log the parsed data

        // Commit the services to the Vuex store
        commit("setServices", services);

        // Return services to the component
        return services;
      } catch (error) {
        console.error("[Vuex] Failed to fetch services:", error.message);
        return []; // Return an empty array in case of error
      }
    },
  },
  getters: {
    allServices: (state) => state.services,
  },
};

const store = new Vuex.Store({
  modules: {
    services: servicesModule,
  },
  state: {
    auth_token: null,
    role: null,
    loggedIn: false,
    user_id: null,
    lastActivity: null,
  },
  mutations: {
    setUser(state) {
      const user = JSON.parse(localStorage.getItem("user"));
      try {
        if (user && user.token) {
          state.auth_token = user.token;
          state.role = user.role;
          state.name = user.name;
          state.loggedIn = true;
          state.user_id = user.id;
          state.lastActivity = Date.now();
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
      const isExpired =
        state.lastActivity && Date.now() - state.lastActivity > SESSION_TIMEOUT;

      if (isExpired) {
        commit("logout");
      }
    },
  },
  getters: {
    isSessionExpired: (state) => {
      return (
        state.lastActivity && Date.now() - state.lastActivity > SESSION_TIMEOUT
      );
    },
  },
});

store.commit("setUser"); // Initialize the user on store setup

export default store;
