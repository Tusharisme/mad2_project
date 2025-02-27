export default {
  template: `
  <div>
    <div class="header-section text-center">
      <a class="navbar-brand" href="/" style="color: black;">
        <h3 style="text-decoration: underline;">A to Z Household Services</h3>
      </a>
    </div>
    <div id="panel">
      <div id="input-form">
        <h2 style="text-decoration: underline;">Customer Signup</h2>
        <br />
        <form @submit.prevent="handleSubmit" class="needs-validation" novalidate ref="form">
          <div class="mb-3">
            <label for="username" class="form-label text-decoration-underline"><b>User Name</b></label>
            <input type="text" class="form-control" id="username" v-model="username" @input="checkUsernameAvailability" required :class="{'is-invalid': !usernameAvailable && usernameMessage}">
            <small v-if="usernameMessage" :class="{'text-success': usernameAvailable, 'text-danger': !usernameAvailable}">
              {{ usernameMessage }}
            </small>
            <div class="invalid-feedback">Username is required and must be available.</div>
          </div>
          <div class="mb-3">
            <label for="pwd" class="form-label"><b>Password</b></label>
            <input type="password" class="form-control" id="pwd" v-model="password" required :class="{'is-invalid': !password}">
            <div class="invalid-feedback">Please provide a valid password.</div>
          </div>
          <div class="mb-3">
            <label for="fullname" class="form-label"><b>Full Name</b></label>
            <input type="text" class="form-control" id="fullname" v-model="fullName" required :class="{'is-invalid': !fullName}">
            <div class="invalid-feedback">Please provide your full name.</div>
          </div>
          <div class="mb-3">
            <label for="email" class="form-label"><b>Email</b></label>
            <input type="email" class="form-control" id="email" v-model="email" required :class="{'is-invalid': !isValidEmail(email)}">
            <div class="invalid-feedback">Please provide a valid email address.</div>
          </div>
          <div class="mb-3">
            <label for="phone_no" class="form-label"><b>Phone No.</b></label>
            <input type="text" class="form-control" id="phone_no" v-model="phoneNo" maxlength="10" required :class="{'is-invalid': !isValidPhoneNumber(phoneNo)}">
            <div class="invalid-feedback">Please provide a valid phone number (10 digits).</div>
          </div>
          <div class="mb-3">
            <label for="gender" class="form-label"><b>Gender</b></label>
            <select class="form-select" v-model="gender" required :class="{'is-invalid': !gender}">
              <option value="" disabled>Select your gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            <div class="invalid-feedback">Please select your gender.</div>
          </div>
          <div class="mb-3">
            <label for="address" class="form-label"><b>Address</b></label>
            <input type="text" class="form-control" id="address" v-model="address" required :class="{'is-invalid': !address}">
            <div class="invalid-feedback">Please provide your address.</div>
          </div>
          <div class="mb-3">
            <label for="pin_code" class="form-label"><b>Pin Code</b></label>
            <input type="text" class="form-control" id="pin_code" v-model="pinCode" maxlength="6" required :class="{'is-invalid': !isValidPinCode(pinCode)}">
            <div class="invalid-feedback">Please provide a valid pin code (6 digits).</div>
          </div>
          <button type="submit" class="btn btn-success-custom">Register</button><br /><br />
          <div v-if="errorMsg" class="alert alert-danger" role="alert">
            <b>{{ errorMsg }}</b>
          </div>
          <a href="/login" class="btn btn-link"><b>Login here</b></a>
        </form>
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
      usernameMessage: "",
      usernameAvailable: true,
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
      try {
        const response = await fetch(`/api/check-username/${this.username}`);
        const data = await response.json();
        this.usernameAvailable = data.available;
        this.usernameMessage = data.message;
      } catch (error) {
        this.usernameMessage = "Error checking username. Try again later.";
        console.error("Error:", error);
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
