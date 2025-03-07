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
              <h2 class="text-center mb-4 fw-bold">Service Professional Registration</h2>
              
              <form @submit.prevent="registerProfessional" class="needs-validation" novalidate ref="form">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="username" class="form-label fw-semibold">
                      <i class="fas fa-user me-2"></i>Username
                    </label>
                    <input type="text" class="form-control" id="username" v-model="form.uname" 
                           @input="checkUsernameAvailability" required 
                           :class="{'is-invalid': !usernameAvailable && usernameMessage, 'is-valid': usernameAvailable && usernameMessage}">
                    <small v-if="usernameMessage" :class="{'text-success': usernameAvailable, 'text-danger': !usernameAvailable}">
                      {{ usernameMessage }}
                    </small>
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <label for="pwd" class="form-label fw-semibold">
                      <i class="fas fa-lock me-2"></i>Password
                    </label>
                    <input type="password" class="form-control" id="pwd" v-model="form.pwd" required 
                           :class="{'is-invalid': !form.pwd}">
                    <div class="invalid-feedback">
                      Please provide a valid password.
                    </div>
                  </div>
                </div>
                
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="fullname" class="form-label fw-semibold">
                      <i class="fas fa-id-card me-2"></i>Full Name
                    </label>
                    <input type="text" class="form-control" id="fullname" v-model="form.full_name" required 
                           :class="{'is-invalid': !form.full_name}">
                    <div class="invalid-feedback">
                      Please provide your full name.
                    </div>
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <label for="email" class="form-label fw-semibold">
                      <i class="fas fa-envelope me-2"></i>Email
                    </label>
                    <input type="email" class="form-control" id="email" v-model="form.email" 
                           @input="checkEmailAvailability" required 
                           :class="{'is-invalid': (!form.email || !isValidEmail(form.email)) || (!emailAvailable && emailMessage), 
                                   'is-valid': form.email && isValidEmail(form.email) && emailAvailable && emailMessage}">
                    <small v-if="emailMessage" :class="{'text-success': emailAvailable, 'text-danger': !emailAvailable}">
                      {{ emailMessage }}
                    </small>
                    <div class="invalid-feedback" v-if="!form.email || !isValidEmail(form.email)">
                      Please provide a valid email address.
                    </div>
                  </div>
                </div>
                
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="phone_no" class="form-label fw-semibold">
                      <i class="fas fa-phone me-2"></i>Phone Number
                    </label>
                    <input type="text" class="form-control" id="phone_no" maxlength="10" v-model="form.phone_no" required 
                           :class="{'is-invalid': !form.phone_no || form.phone_no.length !== 10}">
                    <div class="invalid-feedback">
                      Please provide a valid phone number (10 digits).
                    </div>
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <label for="gender" class="form-label fw-semibold">
                      <i class="fas fa-venus-mars me-2"></i>Gender
                    </label>
                    <select class="form-select" v-model="form.gender" required :class="{'is-invalid': !form.gender}">
                      <option value="" disabled>Select your gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                    <div class="invalid-feedback">
                      Please select your gender.
                    </div>
                  </div>
                </div>
                
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="experience" class="form-label fw-semibold">
                      <i class="fas fa-briefcase me-2"></i>Experience (years)
                    </label>
                    <input type="text" class="form-control" id="experience" v-model="form.experience" required 
                           :class="{'is-invalid': !form.experience || isNaN(form.experience)}">
                    <div class="invalid-feedback">
                      Please provide a valid number of years of experience.
                    </div>
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <label for="service_ids" class="form-label fw-semibold">
                      <i class="fas fa-tools me-2"></i>Service Type
                    </label>
                    <select class="form-select" id="service_ids" v-model="form.service_type" required 
                            :class="{'is-invalid': !form.service_type}">
                      <option value="" disabled selected>Select a service</option>
                      <option v-for="service in availableServices" :key="service.id" :value="service.name">
                        {{ service.name }}
                      </option>
                    </select>
                    <div class="invalid-feedback">
                      Please select a service type.
                    </div>
                  </div>
                </div>
                
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="address" class="form-label fw-semibold">
                      <i class="fas fa-map-marker-alt me-2"></i>Address
                    </label>
                    <input type="text" class="form-control" id="address" v-model="form.address" required 
                           :class="{'is-invalid': !form.address}">
                    <div class="invalid-feedback">
                      Please provide your address.
                    </div>
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <label for="pin_code" class="form-label fw-semibold">
                      <i class="fas fa-map-pin me-2"></i>Pin Code
                    </label>
                    <input type="text" class="form-control" id="pin_code" maxlength="6" v-model="form.pin_code" required 
                           :class="{'is-invalid': !form.pin_code || form.pin_code.length !== 6}">
                    <div class="invalid-feedback">
                      Please provide a valid pin code (6 digits).
                    </div>
                  </div>
                </div>
                
                <div class="mb-4">
                  <label for="document" class="form-label fw-semibold">
                    <i class="fas fa-file-pdf me-2"></i>Attach Documents (Single PDF)
                  </label>
                  <input type="file" class="form-control" id="document" @change="handleFileUpload" required 
                         :class="{'is-invalid': !form.document}" accept=".pdf">
                  <div class="invalid-feedback">
                    Please upload a document (PDF).
                  </div>
                </div>
                
                <div class="alert alert-danger" v-if="messages.length > 0">
                  <ul class="mb-0">
                    <li v-for="message in messages" :key="message">{{ message }}</li>
                  </ul>
                </div>
                
                <div class="d-grid gap-2">
                  <button type="submit" class="btn btn-success-custom btn-lg">
                    <i class="fas fa-user-plus me-2"></i>Register as Professional
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
      availableServices: [],
      usernameAvailable: null,
      usernameMessage: "",
      emailAvailable: null,
      emailMessage: "",
      messages: [],
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

        // Add profile picture URL (if any)
        const defaultProfilePicture =
          this.form.gender === "Male"
            ? "https://res.cloudinary.com/dfcpm3kmc/image/upload/v1739114421/default_pic/ido90awmqkwdtveme9h3.png"
            : "https://res.cloudinary.com/dfcpm3kmc/image/upload/v1739114431/default_pic/h0kiyvh0a679w4xivqie.jpg";

        const profilePictureUrl =
          this.form.profilePictureUrl || defaultProfilePicture;

        formData.append("profile_picture_url", profilePictureUrl);

        const res = await fetch(`${location.origin}/register_professional`, {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          console.log("We are Registered as a Professional");
          // Handle success (redirect or show success message)
          this.$router.push("/login");
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
      if (!this.form.uname || this.form.uname.trim() === "") {
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
            value: this.form.uname,
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
      if (!this.form.email || !this.isValidEmail(this.form.email)) {
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
            value: this.form.email,
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
  },
};
