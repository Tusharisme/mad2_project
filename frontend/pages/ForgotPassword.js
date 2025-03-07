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
              <h2 class="text-center mb-4 fw-bold">Forgot Password</h2>
              
              <!-- Step 1: Enter Email or Phone -->
              <div v-if="step === 1">
                <p class="text-center mb-4">Enter your registered email or phone number to receive an OTP.</p>
                <form @submit.prevent="sendOTP" class="needs-validation" novalidate>
                  <div class="mb-3">
                    <label for="emailOrPhone" class="form-label fw-semibold">
                      <i class="fas fa-envelope me-2"></i>Email or Phone
                    </label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="emailOrPhone" 
                      v-model="emailOrPhone" 
                      required
                      placeholder="Enter your registered email or phone"
                    >
                    <div class="invalid-feedback">
                      Please provide your registered email or phone number.
                    </div>
                  </div>
                  
                  <div class="d-grid gap-2">
                    <button type="submit" class="btn btn-success-custom btn-lg">
                      <i class="fas fa-paper-plane me-2"></i>Send OTP
                    </button>
                  </div>
                </form>
              </div>
              
              <!-- Step 2: Verify OTP -->
              <div v-if="step === 2">
                <p class="text-center mb-4">Enter the OTP sent to your email or phone.</p>
                <form @submit.prevent="verifyOTP" class="needs-validation" novalidate>
                  <div class="mb-3">
                    <label for="otp" class="form-label fw-semibold">
                      <i class="fas fa-key me-2"></i>One-Time Password
                    </label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="otp" 
                      v-model="otp" 
                      required
                      placeholder="Enter the OTP"
                    >
                    <div class="invalid-feedback">
                      Please enter the OTP sent to you.
                    </div>
                  </div>
                  
                  <div class="d-grid gap-2">
                    <button type="submit" class="btn btn-success-custom btn-lg">
                      <i class="fas fa-check-circle me-2"></i>Verify OTP
                    </button>
                  </div>
                </form>
              </div>
              
              <!-- Step 3: Reset Password -->
              <div v-if="step === 3">
                <p class="text-center mb-4">Set a new password for your account.</p>
                <form @submit.prevent="resetPassword" class="needs-validation" novalidate>
                  <div class="mb-3">
                    <label for="newPassword" class="form-label fw-semibold">
                      <i class="fas fa-lock me-2"></i>New Password
                    </label>
                    <input 
                      type="password" 
                      class="form-control" 
                      id="newPassword" 
                      v-model="newPassword" 
                      required
                      placeholder="Enter new password"
                    >
                    <div class="invalid-feedback">
                      Please provide a new password.
                    </div>
                  </div>
                  
                  <div class="mb-3">
                    <label for="confirmPassword" class="form-label fw-semibold">
                      <i class="fas fa-lock me-2"></i>Confirm Password
                    </label>
                    <input 
                      type="password" 
                      class="form-control" 
                      id="confirmPassword" 
                      v-model="confirmPassword" 
                      required
                      placeholder="Confirm new password"
                      :class="{'is-invalid': newPassword !== confirmPassword && confirmPassword}"
                    >
                    <div class="invalid-feedback">
                      Passwords do not match.
                    </div>
                  </div>
                  
                  <div class="d-grid gap-2">
                    <button type="submit" class="btn btn-success-custom btn-lg">
                      <i class="fas fa-save me-2"></i>Reset Password
                    </button>
                  </div>
                </form>
              </div>
              
              <!-- Messages -->
              <div class="mt-3">
                <div class="alert alert-danger" v-if="errorMessage" role="alert">
                  <i class="fas fa-exclamation-circle me-2"></i>{{ errorMessage }}
                </div>
                <div class="alert alert-success" v-if="successMessage" role="alert">
                  <i class="fas fa-check-circle me-2"></i>{{ successMessage }}
                </div>
              </div>
            </div>
            
            <div class="card-footer bg-light p-3 text-center">
              <p class="mb-0">Remember your password? <router-link to="/login" class="text-decoration-none fw-bold">Login here</router-link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      step: 1,
      emailOrPhone: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
      errorMessage: "",
      successMessage: "",
    };
  },

  methods: {
    async sendOTP() {
      this.clearMessages();
      try {
        const response = await fetch("/api/forgot-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email_or_phone: this.emailOrPhone }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error sending OTP");
        this.successMessage = data.message;
        this.step = 2;
      } catch (error) {
        this.errorMessage = error.message;
      }
    },

    async verifyOTP() {
      this.clearMessages();
      try {
        const response = await fetch("/api/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email_or_phone: this.emailOrPhone,
            otp: this.otp,
          }),
        });
        const data = await response.json();
        // Check success field instead of response.ok
        if (!data.success) {
          this.errorMessage = data.message; // Show error message
          return; // Stop execution if OTP is wrong
        }

        this.successMessage = data.message;
        this.step = 3; // Move to reset password only if OTP is correct
      } catch (error) {
        this.errorMessage = error.message;
      }
    },

    async resetPassword() {
      this.clearMessages();
      if (this.newPassword !== this.confirmPassword) {
        this.errorMessage = "Passwords do not match!";
        return;
      }
      try {
        const response = await fetch("/api/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email_or_phone: this.emailOrPhone,
            otp: this.otp,
            new_password: this.newPassword,
          }),
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Error resetting password");

        this.successMessage = data.message;

        // Redirect to login page after a short delay
        setTimeout(() => {
          this.$router.push("/login"); // Use Vue Router instead of window.location.href
        }, 2000);
      } catch (error) {
        this.errorMessage = error.message;
      }
    },

    clearMessages() {
      this.errorMessage = "";
      this.successMessage = "";
    },
  },
};
