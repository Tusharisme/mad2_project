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
            <h2 class="text-decoration-underline">Service Professional Signup</h2>
            <form @submit.prevent="registerProfessional" class="needs-validation" novalidate ref="form">
              <div class="mb-3">
                <label for="username" class="form-label text-decoration-underline"><b>User Name</b></label>
                <input type="text" class="form-control" id="username" v-model="form.uname" @input="checkUsernameAvailability" required :class="{'is-invalid': !usernameAvailable && usernameMessage}">
                <small v-if="usernameMessage" :class="{'text-success': usernameAvailable, 'text-danger': !usernameAvailable}">
                  {{ usernameMessage }}
                </small>
              </div>
              <div class="mb-3">
                <label for="pwd" class="form-label text-decoration-underline"><b>Password</b></label>
                <input type="password" class="form-control" id="pwd" v-model="form.pwd" required :class="{'is-invalid': !form.pwd}">
                <div class="invalid-feedback">
                  Please provide a valid password.
                </div>
              </div>
              <div class="mb-3">
                <label for="fullname" class="form-label text-decoration-underline"><b>Full Name</b></label>
                <input type="text" class="form-control" id="fullname" v-model="form.full_name" required :class="{'is-invalid': !form.full_name}">
                <div class="invalid-feedback">
                  Please provide your full name.
                </div>
              </div>
              <div class="mb-3">
                <label for="email" class="form-label text-decoration-underline"><b>Email</b></label>
                <input type="email" class="form-control" id="email" v-model="form.email" required :class="{'is-invalid': !form.email || !isValidEmail(form.email)}">
                <div class="invalid-feedback">
                  Please provide a valid email address.
                </div>
              </div>
              <div class="mb-3">
                <label for="phone_no" class="form-label text-decoration-underline"><b>Phone No.</b></label>
                <input type="text" class="form-control" id="phone_no" maxlength="10" v-model="form.phone_no" required :class="{'is-invalid': !form.phone_no || form.phone_no.length !== 10}">
                <div class="invalid-feedback">
                  Please provide a valid phone number (10 digits).
                </div>
              </div>
              <div class="mb-3">
                <label for="gender" class="form-label text-decoration-underline"><b>Gender</b></label>
                <select class="form-select" v-model="form.gender" required :class="{'is-invalid': !form.gender}">
                  <option value="" disabled>Select your gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <div class="invalid-feedback">
                  Please select your gender.
                </div>
              </div>
              <div class="mb-3">
                <label for="experience" class="form-label text-decoration-underline"><b>Experience (in years)</b></label>
                <input type="text" class="form-control" id="experience" v-model="form.experience" required :class="{'is-invalid': !form.experience || isNaN(form.experience)}">
                <div class="invalid-feedback">
                  Please provide a valid number of years of experience.
                </div>
              </div>
              <div class="mb-3">
                <label for="document" class="form-label text-decoration-underline"><b>Attach Documents (Single PDF)</b></label>
                <input type="file" class="form-control form-control-sm" id="document" @change="handleFileUpload" required :class="{'is-invalid': !form.document}">
                <div class="invalid-feedback">
                  Please upload a document (PDF).
                </div>
              </div>
              <div class="mb-3">
                <label for="address" class="form-label text-decoration-underline"><b>Address</b></label>
                <input type="text" class="form-control" id="address" v-model="form.address" required :class="{'is-invalid': !form.address}">
                <div class="invalid-feedback">
                  Please provide your address.
                </div>
              </div>
              <div class="mb-3">
                <label for="pin_code" class="form-label text-decoration-underline"><b>Pin Code</b></label>
                <input type="text" class="form-control" id="pin_code" maxlength="6" v-model="form.pin_code" required :class="{'is-invalid': !form.pin_code || form.pin_code.length !== 6}">
                <div class="invalid-feedback">
                  Please provide a valid pin code (6 digits).
                </div>
              </div>
              <div class="mb-3">
                <label for="service_ids" class="form-label text-decoration-underline"><b>Select Service Type</b></label>
                <select class="form-select" id="service_ids" v-model="form.service_type" required :class="{'is-invalid': !form.service_type}">
                  <option v-for="service in availableServices" :key="service.id" :value="service.name">
                    {{ service.name }}
                  </option>
                </select>
                <div class="invalid-feedback">
                  Please select a service type.
                </div>

              </div>
              <button type="submit" class="btn btn-success-custom">Register</button><br /><br />
            </form>
          </div>
        </div>
      </div>
    `,
  data() {
    return {
      form: {
        uname: "",
        pwd: "",
        full_name: "",
        email: "",
        phone_no: "",
        gender: "",
        experience: "",
        address: "",
        pin_code: "",
        service_type: "",
        document: null,
        role: "professional",
      },
      availableServices: [], // Populate this dynamically or hard-code
      usernameAvailable: null, // To track username availability
      usernameMessage: "", // To show availability message
      messages: [], // For displaying flash messages
    };
  },
  created() {
    this.fetchServices();
  },
  methods: {
    handleFileUpload(event) {
      this.form.document = event.target.files[0];
    },
    async registerProfessional() {
      const form = this.$refs.form;

      // Bootstrap validation
      if (form.checkValidity() === false) {
        form.classList.add("was-validated");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("uname", this.form.uname);
        formData.append("pwd", this.form.pwd);
        formData.append("full_name", this.form.full_name);
        formData.append("email", this.form.email);
        formData.append("phone_no", this.form.phone_no);
        formData.append("gender", this.form.gender);
        formData.append("experience", this.form.experience);
        formData.append("address", this.form.address);
        formData.append("pin_code", this.form.pin_code);
        formData.append("service_type", this.form.service_type);
        formData.append("document", this.form.document);
        formData.append("role", this.form.role);

        const res = await fetch(`${location.origin}/register_professional`, {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          console.log("We are Registered as a Professional");
          // Handle success (redirect or show success message)
        } else {
          const data = await res.json();
          this.messages.push(data.message || "Registration failed.");
        }
      } catch (e) {
        console.error("An error occurred:", e);
        this.messages.push("An error occurred. Please try again later.");
      }
    },
    async fetchServices() {
      try {
        const response = await fetch("/api/services");
        if (response.ok) {
          this.availableServices = await response.json();
        } else {
          console.error("Failed to fetch services");
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    },
    async checkUsernameAvailability() {
      try {
        const response = await fetch(`/api/check-username/${this.form.uname}`);
        const data = await response.json();
        if (data.available) {
          this.usernameAvailable = true;
          this.usernameMessage = data.message;
        } else {
          this.usernameAvailable = false;
          this.usernameMessage = data.message;
        }
      } catch (error) {
        console.error("Error checking username availability:", error);
        this.usernameMessage =
          "Unable to check username availability. Please try again.";
      }
    },
    isValidEmail(email) {
      const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
      return re.test(email);
    },
  },
};
