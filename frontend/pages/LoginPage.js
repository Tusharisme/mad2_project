export default {
  template: `
    <div id="container">
      <div class="header-section text-center">
        <router-link to="/" class="navbar-brand" style="color: black;">
          <h3 style="text-decoration: underline;">A to Z Household Services</h3>
        </router-link>
      </div>
      <div id="panel">
        <div id="input-form">
          <h2 style="text-decoration: underline;">Login</h2>
          <form @submit.prevent="submitLogin">
            <div class="mb-3">
              <label for="email" class="form-label" style="text-decoration: underline;"><b>Registered Email ID</b></label>
              <input type="email" class="form-control" v-model="email" id="email" aria-describedby="emailHelp" />
            </div>
            <div class="mb-3">
              <label for="pwd" class="form-label" style="text-decoration: underline;"><b>Password</b></label>
              <input type="password" v-model="password" class="form-control" id="pwd" />
            </div>
            <button type="submit" class="btn btn-success-custom">Login</button><br /><br />
            <router-link to="/register_customer" class="btn btn-link"><b>Create Account?</b></router-link>
          </form>

          <div v-if="error" class="alert alert-danger mt-3" role="alert">
            <b>{{ error }}</b>
          </div>
        </div>

        <br /><br />
        <router-link to="/register_professional" class="btn btn-link"><b>Register as Professional</b></router-link>
        <router-link to="/forgot-password" class="btn btn-link"><b>Forgot Password?</b></router-link>
      </div>
    </div>
  `,
  data() {
    return {
      email: "",
      password: "",
      name: "",
      error: null,
    };
  },
  methods: {
    async submitLogin() {
      try {
        const body = JSON.stringify({
          email: this.email,
          password: this.password,
        });

        const res = await fetch(`${location.origin}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body,
        });

        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("user", JSON.stringify(data));
          this.$store.commit("setUser", data); // Store user data (including role)
          this.$store.dispatch("updateLastActivity"); // Update the last activity timestamp on login
        } else {
          const errorData = await res.json();
          this.error = errorData.message || "Login failed";
        }
      } catch (e) {
        this.error = "An error occurred during login";
        console.error("An error occurred:", e);
      }
    },
  },
};
