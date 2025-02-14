export default {
  template: `
      <div class="container">
          <form @submit.prevent="updateProfile">
              <div class="mb-3 text-center">
                  <label for="profile_pic" class="d-block">
                      <img :src="professional.profile_picture_url"
                          alt="Profile Picture"
                          width="150" height="150"
                          class="rounded-circle"
                          style="cursor: pointer;">
                  </label>
                  <br>
                  <label for="profile_pic" class="form-label" style="cursor: pointer;"><b>Edit</b></label>
                  <input type="file" class="d-none" id="profile_pic" @change="handleProfilePicUpload">
              </div>

              <div class="mb-3" v-for="field in editableFields" :key="field">
                  <label class="form-label"><b>{{ field.replace('_', ' ').toUpperCase() }}</b></label>
                  <input type="text" class="form-control" v-model="professional[field]" 
                         @blur="debouncedCheckAvailability(field)" required>

                  <!-- Display error messages -->
                  <small v-if="field === 'username' && usernameError" class="text-danger">{{ usernameError }}</small>
                  <small v-if="field === 'email' && emailError" class="text-danger">{{ emailError }}</small>
              </div>

              <button type="submit" class="btn btn-custom" >
                  {{ isUpdating ? "Updating..." : "Update Profile" }}
              </button>
          </form>

          <h3 class="text-decoration-underline mt-4">Your Services</h3>
          <form @submit.prevent="updateServices">
              <table class="table table-bordered table-hover table-custom">
                  <thead class="table-dark-custom">
                      <tr>
                          <th>Service Name</th>
                          <th>Base Price</th>
                          <th>Custom Price</th>
                          <th>Custom Description</th>
                          <th>Custom Time (hours)</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr v-for="service in professional_services" :key="service.service_id">
                          <td>{{ service.service.name }}</td>
                          <td>{{ service.service.base_price }}</td>
                          <td><input type="text" class="form-control" v-model="service.custom_price"></td>
                          <td><input type="text" class="form-control" v-model="service.custom_description"></td>
                          <td><input type="text" class="form-control" v-model="service.custom_time_required"></td>
                      </tr>
                  </tbody>
              </table>
              <button type="submit" class="btn btn-custom">Update Services</button>
          </form>
      </div>
    `,

  data() {
    return {
      professional: {},
      profilePicFile: null,
      professional_services: [], // <-- Add this line
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
        console.log(this.$store.state.auth_token);

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
