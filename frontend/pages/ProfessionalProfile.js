export default {
  template: `
    <div class="container mt-5">
      <div class="row">
        <div class="col-md-12 mb-4">
          <div class="card">
            <div class="card-body">
              <form @submit.prevent="updateProfile">
                <div class="row">
                  <div class="col-md-4 text-center mb-4">
                    <div class="mb-3">
                      <label for="profile_pic" class="d-block">
                        <div class="img-container mx-auto" style="width: 150px; height: 150px; border-radius: 50%; overflow: hidden; border: 3px solid #8b4513;">
                          <img :src="professional.profile_picture_url"
                              alt="Profile Picture"
                              class="img-fluid"
                              style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;">
                        </div>
                      </label>
                      <label for="profile_pic" class="btn btn-custom btn-sm mt-2" style="cursor: pointer;">
                        <i class="fas fa-camera mr-1"></i> Change Photo
                      </label>
                      <input type="file" class="d-none" id="profile_pic" @change="handleProfilePicUpload">
                    </div>
                  </div>
                  
                  <div class="col-md-8">
                    <div class="row">
                      <div class="col-md-6 mb-3" v-for="field in editableFields.slice(0, 4)" :key="field">
                        <label class="form-label"><b>{{ field.replace('_', ' ').toUpperCase() }}</b></label>
                        <input type="text" class="form-control" v-model="professional[field]" 
                              @blur="debouncedCheckAvailability(field)" required>
                        <small v-if="field === 'username' && usernameError" class="text-danger">{{ usernameError }}</small>
                        <small v-if="field === 'email' && emailError" class="text-danger">{{ emailError }}</small>
                      </div>
                    </div>
                    
                    <div class="row">
                      <div class="col-md-6 mb-3" v-for="field in editableFields.slice(4)" :key="field">
                        <label class="form-label"><b>{{ field.replace('_', ' ').toUpperCase() }}</b></label>
                        <input type="text" class="form-control" v-model="professional[field]" required>
                      </div>
                    </div>
                    
                    <div class="text-end mt-3">
                      <button type="submit" class="btn btn-custom" :disabled="isUpdating">
                        <span v-if="isUpdating">
                          <i class="fas fa-spinner fa-spin mr-1"></i> Updating...
                        </span>
                        <span v-else>Update Profile</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div class="col-md-12">
          <div class="card">
            <div class="card-body">
              <div class="header-section mb-4">
                <h3>Your Services</h3>
              </div>
              
              <form @submit.prevent="updateServices">
                <div class="table-responsive">
                  <table class="table table-custom">
                    <thead class="table-dark-custom">
                      <tr>
                        <th width="20%">Service Name</th>
                        <th width="15%">Base Price</th>
                        <th width="15%">Custom Price</th>
                        <th width="30%">Custom Description</th>
                        <th width="20%">Time (hours)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="service in professional_services" :key="service.service_id">
                        <td>{{ service.service.name }}</td>
                        <td>₹{{ service.service.base_price }}</td>
                        <td>
                          <input type="text" class="form-control" v-model="service.custom_price">
                        </td>
                        <td>
                          <input type="text" class="form-control" v-model="service.custom_description">
                        </td>
                        <td>
                          <input type="text" class="form-control" v-model="service.custom_time_required">
                        </td>
                      </tr>
                      <tr v-if="professional_services.length === 0">
                        <td colspan="5">
                          <div class="empty-state">
                            <p>No services available</p>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div class="text-end mt-3">
                  <button type="submit" class="btn btn-custom">Update Services</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  data() {
    return {
      professional: {},
      profilePicFile: null,
      professional_services: [],
      originalUsername: "",
      originalEmail: "",
      usernameError: "",
      emailError: "",
      isUpdating: false,
      editableFields: [
        "name",
        "username",
        "email",
        "phone_no",
        "address",
        "pin_code",
        "gender",
      ],
      debounceTimeout: null,
    };
  },

  mounted() {
    this.fetchProfile();
    this.fetchServices();
  },

  methods: {
    async fetchProfile() {
      try {
        const professionalId = this.$store.state.professional?.id;
        if (!professionalId) throw new Error("Professional ID not found");

        const response = await fetch(
          `/api/professional/profile/${professionalId}`,
          {
            headers: { "Authentication-Token": this.$store.state.auth_token },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch profile");
        this.professional = await response.json();

        this.originalUsername = this.professional.username;
        this.originalEmail = this.professional.email;
      } catch (error) {
        console.error(error);
        alert("Error fetching profile data.");
      }
    },

    async fetchServices() {
      try {
        const professionalId = this.$store.state.professional?.id;
        if (!professionalId) throw new Error("Professional ID not found");

        const response = await fetch(
          `/api/professional/profile/${professionalId}/services`,
          {
            headers: { "Authentication-Token": this.$store.state.auth_token },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch services");

        this.professional_services = await response.json();
      } catch (error) {
        console.error(error);
        alert("Error fetching services data.");
      }
    },

    handleProfilePicUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.profilePicFile = file;
        const reader = new FileReader();
        reader.onload = () => {
          this.professional.profile_picture_url = reader.result;
        };
        reader.readAsDataURL(file);
      }
    },

    debouncedCheckAvailability(field) {
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }
      this.debounceTimeout = setTimeout(() => {
        this.checkAvailability(field);
      }, 500);
    },

    async checkAvailability(field) {
      try {
        if (
          field === "username" &&
          this.professional.username !== this.originalUsername
        ) {
          const response = await fetch(
            `/api/check-username/${this.professional.username}`
          );
          const data = await response.json();
          this.usernameError = data.available
            ? ""
            : "Username is already taken.";
        } else if (
          field === "email" &&
          this.professional.email !== this.originalEmail
        ) {
          const response = await fetch(
            `/api/check-email/${this.professional.email}`
          );
          const data = await response.json();
          this.emailError = data.available ? "" : "Email is already in use.";
        }
      } catch (error) {
        console.error(error);
        if (field === "username") {
          this.usernameError = "Error checking username.";
        } else if (field === "email") {
          this.emailError = "Error checking email.";
        }
      }
    },

    async updateProfile() {
      try {
        if (this.usernameError || this.emailError) {
          alert("Please resolve the errors before updating your profile.");
          return;
        }

        const professionalId = this.$store.state.professional?.id;
        if (!professionalId) throw new Error("Professional ID not found");
        this.isUpdating = true;

        const formData = new FormData();
        this.editableFields.forEach((field) => {
          if (this.professional[field] !== undefined) {
            formData.append(field, this.professional[field]);
          }
        });

        if (this.profilePicFile) {
          formData.append("profile_pic", this.profilePicFile);
        }

        const response = await fetch(
          `/api/professional/profile/${professionalId}`,
          {
            method: "PUT",
            headers: { "Authentication-Token": this.$store.state.auth_token },
            body: formData,
          }
        );

        if (!response.ok) throw new Error("Profile update failed");

        alert("Profile updated successfully!");
        this.usernameError = "";
        this.emailError = "";
        await this.fetchProfile();
      } catch (error) {
        console.error(error);
        alert("Error updating profile.");
      } finally {
        this.isUpdating = false;
      }
    },

    async updateServices() {
      try {
        const professionalId = this.$store.state.professional?.id;
        if (!professionalId) throw new Error("Professional ID not found");

        const response = await fetch(
          `/api/professional/profile/${professionalId}/services`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.$store.state.auth_token,
            },
            body: JSON.stringify(this.professional_services),
          }
        );

        if (!response.ok) throw new Error("Service update failed");
        alert("Services updated successfully!");
      } catch (error) {
        console.error(error);
        alert("Error updating services.");
      }
    },
  },
};
