export default {
  template: `
      <div class="forgot-password-container">
        <div class="forgot-password-box">
          <h2>Forgot Password</h2>
  
          <div v-if="step === 1">
            <p>Enter your registered email or phone number to receive an OTP.</p>
            <input v-model="emailOrPhone" type="text" placeholder="Email or Phone" required />
            <button @click="sendOTP">Send OTP</button>
          </div>
  
          <div v-if="step === 2">
            <p>Enter the OTP sent to your email.</p>
            <input v-model="otp" type="text" placeholder="Enter OTP" required />
            <button @click="verifyOTP">Verify OTP</button>
          </div>
  
          <div v-if="step === 3">
            <p>Set a new password for your account.</p>
            <input v-model="newPassword" type="password" placeholder="New Password" required />
            <input v-model="confirmPassword" type="password" placeholder="Confirm Password" required />
            <button @click="resetPassword">Reset Password</button>
          </div>
  
          <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
          <p v-if="successMessage" class="success">{{ successMessage }}</p>
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
        // ✅ Check success field instead of response.ok
        if (!data.success) {
          this.errorMessage = data.message; // Show error message
          return; // Stop execution if OTP is wrong
        }

        this.successMessage = data.message;
        this.step = 3; // ✅ Move to reset password only if OTP is correct
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
            this.$router.push("/login"); // ✅ Use Vue Router instead of window.location.href
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
