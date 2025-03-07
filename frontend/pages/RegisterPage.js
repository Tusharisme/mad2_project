export default {
  template: `
  <div class="container mt-5 mb-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow-lg border-0">
          <div class="card-header bg-gradient-light text-center py-3">
            <router-link to="/" class="text-decoration-none">
              <h3 class="mb-0 text-dark fw-bold">A to Z Household Services</h3>
            </router-link>
          </div>
          <div class="card-body p-4">
            <h2 class="text-center mb-4 fw-bold">Customer Registration</h2>
            
            <form @submit.prevent="handleSubmit" class="needs-validation" novalidate ref="form">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="username" class="form-label fw-semibold">
                    <i class="fas fa-user me-2"></i>Username
                  </label>
                  <input type="text" class="form-control" id="username" v-model="username" 
                         @input="checkUsernameAvailability" required 
                         :class="{'is-invalid': !usernameAvailable && usernameMessage, 'is-valid': usernameAvailable && usernameMessage}">
                  <small v-if="usernameMessage" :class="{'text-success': usernameAvailable, 'text-danger': !usernameAvailable}">
                    {{ usernameMessage }}
                  </small>
                  <div class="invalid-feedback">Username is required and must be available.</div>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="pwd" class="form-label fw-semibold">
                    <i class="fas fa-lock me-2"></i>Password
                  </label>
                  <input type="password" class="form-control" id="pwd" v-model="password" required 
                         :class="{'is-invalid': !password}">
                  <div class="invalid-feedback">Please provide a valid password.</div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="fullname" class="form-label fw-semibold">
                    <i class="fas fa-id-card me-2"></i>Full Name
                  </label>
                  <input type="text" class="form-control" id="fullname" v-model="fullName" required 
                         :class="{'is-invalid': !fullName}">
                  <div class="invalid-feedback">Please provide your full name.</div>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="email" class="form-label fw-semibold">
                    <i class="fas fa-envelope me-2"></i>Email
                  </label>
                  <input type="email" class="form-control" id="email" v-model="email" 
                         @input="checkEmailAvailability" required 
                         :class="{'is-invalid': (!email || !isValidEmail(email)) || (!emailAvailable && emailMessage), 
                                 'is-valid': email && isValidEmail(email) && emailAvailable && emailMessage}">
                  <small v-if="emailMessage" :class="{'text-success': emailAvailable, 'text-danger': !emailAvailable}">
                    {{ emailMessage }}
                  </small>
                  <div class="invalid-feedback" v-if="!email || !isValidEmail(email)">
                    Please provide a valid email address.
                  </div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="phone_no" class="form-label fw-semibold">
                    <i class="fas fa-phone me-2"></i>Phone Number
                  </label>
                  <input type="text" class="form-control" id="phone_no" v-model="phoneNo" maxlength="10" required 
                         :class="{'is-invalid': !isValidPhoneNumber(phoneNo)}">
                  <div class="invalid-feedback">Please provide a valid phone number (10 digits).</div>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="gender" class="form-label fw-semibold">
                    <i class="fas fa-venus-mars me-2"></i>Gender
                  </label>
                  <select class="form-select" v-model="gender" required :class="{'is-invalid': !gender}">
                    <option value="" disabled>Select your gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  <div class="invalid-feedback">Please select your gender.</div>
                </div>
              </div>
              
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="address" class="form-label fw-semibold">
                    <i class="fas fa-map-marker-alt me-2"></i>Address
                  </label>
                  <input type="text" class="form-control" id="address" v-model="address" required 
                         :class="{'is-invalid': !address}">
                  <div class="invalid-feedback">Please provide your address.</div>
                </div>
                
                <div class="col-md-6 mb-3">
                  <label for="pin_code" class="form-label fw-semibold">
                    <i class="fas fa-map-pin me-2"></i>Pin Code
                  </label>
                  <input type="text" class="form-control" id="pin_code" v-model="pinCode" maxlength="6" required 
                         :class="{'is-invalid': !isValidPinCode(pinCode)}">
                  <div class="invalid-feedback">Please provide a valid pin code (6 digits).</div>
                </div>
              </div>
              
              <div class="alert alert-danger" v-if="errorMsg" role="alert">
                <b>{{ errorMsg }}</b>
              </div>
              
              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-success-custom btn-lg">
                  <i class="fas fa-user-plus me-2"></i>Register as Customer
                </button>
              </div>
            </form>
            
            <div class="text-center mt-4">
              <p>Already have an account? <router-link to="/login" class="text-decoration-none fw-bold">Login here</router-link></p>
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
      username: "",
      fullName: "",
      phoneNo: "",
      gender: "",
      address: "",
      pinCode: "",
      errorMsg: "",
      role: "customer",
      usernameAvailable: null,
      usernameMessage: "",
      emailAvailable: null,
      emailMessage: "",
    };
  },
  methods: {
    handleSubmit() {
      const form = this.$refs.form;
      if (form.checkValidity() === false) {
        form.classList.add("was-validated");
        return;
      }
      this.register_customer();
    },
    async register_customer() {
      try {
        const body = JSON.stringify({
          email: this.email,
          password: this.password,
          username: this.username,
          full_name: this.fullName,
          phone_no: this.phoneNo,
          gender: this.gender,
          address: this.address,
          pin_code: this.pinCode,
          role: this.role,
        });
        const res = await fetch(`${location.origin}/register_customer`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body,
        });
        if (res.ok) {
          console.log("We are Registered");
          this.$router.push("/login");
        } else {
          const data = await res.json();
          this.errorMsg = data.message || "Registration failed.";
        }
      } catch (e) {
        console.error("An error occurred:", e);
        this.errorMsg = "An error occurred. Please try again later.";
      }
    },
    async checkUsernameAvailability() {
      if (!this.username || this.username.trim() === "") {
        this.usernameAvailable = null;
        this.usernameMessage = "";
        return;
      }

      try {
        const response = await fetch("/api/check-availability", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "username",
            value: this.username,
            current_user_id: null, // For new registrations, there's no current user
          }),
        });

        const data = await response.json();

        if (response.ok) {
          this.usernameAvailable = data.available;
          this.usernameMessage = data.message;
        } else {
          this.usernameAvailable = false;
          this.usernameMessage =
            data.error || "Error checking username availability";
        }
      } catch (error) {
        console.error("Error checking username availability:", error);
        this.usernameAvailable = false;
        this.usernameMessage =
          "Unable to check username availability. Please try again.";
      }
    },
    async checkEmailAvailability() {
      if (!this.email || !this.isValidEmail(this.email)) {
        this.emailAvailable = null;
        this.emailMessage = "";
        return;
      }

      try {
        const response = await fetch("/api/check-availability", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "email",
            value: this.email,
            current_user_id: null, // For new registrations, there's no current user
          }),
        });

        const data = await response.json();

        if (response.ok) {
          this.emailAvailable = data.available;
          this.emailMessage = data.message;
        } else {
          this.emailAvailable = false;
          this.emailMessage = data.error || "Error checking email availability";
        }
      } catch (error) {
        console.error("Error checking email availability:", error);
        this.emailAvailable = false;
        this.emailMessage =
          "Unable to check email availability. Please try again.";
      }
    },
    isValidEmail(email) {
      const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      return re.test(email);
    },
    isValidPhoneNumber(phone) {
      return /^\d{10}$/.test(phone);
    },
    isValidPinCode(pinCode) {
      return /^\d{6}$/.test(pinCode);
    },
  },
};
