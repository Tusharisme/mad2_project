export default {
  template: `
    <div class="container mt-5 mb-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow-lg border-0">
            <div class="card-header bg-gradient-light text-center py-3">
              <router-link to="/" class="text-decoration-none">
                <h3 class="mb-0 text-dark fw-bold">A to Z Household Services</h3>
              </router-link>
            </div>
            <div class="card-body p-4">
              <h2 class="text-center mb-4 fw-bold">Login</h2>
              
              <form @submit.prevent="submitLogin" class="needs-validation" novalidate>
                <div class="mb-3">
                  <label for="email" class="form-label fw-semibold">
                    <i class="fas fa-envelope me-2"></i>Email Address
                  </label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="email" 
                    v-model="email" 
                    required
                    :class="{'is-invalid': !isValidEmail(email) && email}"
                    autocomplete="email"
                  >
                  <div class="invalid-feedback">
                    Please provide a valid email address.
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="pwd" class="form-label fw-semibold">
                    <i class="fas fa-lock me-2"></i>Password
                  </label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="pwd" 
                    v-model="password" 
                    required
                    :class="{'is-invalid': !password && password !== undefined}"
                    autocomplete="current-password"
                  >
                  <div class="invalid-feedback">
                    Please enter your password.
                  </div>
                </div>
                
                <div class="alert alert-danger" v-if="error" role="alert">
                  <i class="fas fa-exclamation-circle me-2"></i>{{ error }}
                </div>
                
                <div class="d-grid gap-2 mb-3">
                  <button type="submit" class="btn btn-success-custom btn-lg">
                    <i class="fas fa-sign-in-alt me-2"></i>Login
                  </button>
                </div>
                
                <div class="text-center">
                  <router-link to="/forgot_password" class="text-decoration-none fw-bold">
                    <i class="fas fa-key me-1"></i>Forgot Password?
                  </router-link>
                </div>
              </form>
            </div>
            <div class="card-footer bg-light p-3 text-center">
              <p class="mb-2">Don't have an account?</p>
              <div class="d-flex justify-content-center gap-3">
                <router-link to="/register_customer" class="btn btn-outline-success">
                  <i class="fas fa-user me-2"></i>Register as Customer
                </router-link>
                <router-link to="/register_professional" class="btn btn-outline-primary">
                  <i class="fas fa-briefcase me-2"></i>Register as Professional
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      email: "",
      password: "",
      error: null,
    };
  },
  methods: {
    async submitLogin() {
      try {
        if (!this.isValidEmail(this.email) || !this.password) {
          this.error = "Please provide valid email and password";
          return;
        }

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
          localStorage.setItem("user", JSON.stringify(data)); // Save the user data
          this.$store.commit("setUser", data); // Use setUser mutation to store the user data (including professional/customer data)

          this.$store.dispatch("updateLastActivity"); // Update the last activity timestamp on login

          if (data.role === "customer") {
            this.$router.push("/customer_dashboard");
          } else if (data.role === "professional") {
            this.$router.push("/professional_dashboard");
          } else if (data.role === "admin") {
            this.$router.push("/admin_dashboard");
          }
        } else {
          const errorData = await res.json();
          this.error = errorData.message || "Login failed";
        }
      } catch (e) {
        this.error = "An error occurred during login";
        console.error("An error occurred:", e);
      }
    },
    isValidEmail(email) {
      const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      return re.test(email);
    },
  },
};
