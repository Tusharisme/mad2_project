export default {
  template: `
      <div class="container">
          <form @submit.prevent="updateProfile">
              <div class="mb-3 text-center">
                  <label for="profile_pic" class="d-block">
                      <img :src="customer.profile_pic"
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
                  <input type="text" class="form-control" v-model="customer[field]" 
                         @blur="debouncedCheckAvailability(field)" required>

                  <!-- Display error messages -->
                  <small v-if="field === 'username' && usernameError" class="text-danger">{{ usernameError }}</small>
                  <small v-if="field === 'email' && emailError" class="text-danger">{{ emailError }}</small>
              </div>

              <button type="submit" class="btn btn-custom" >
                  {{ isUpdating ? "Updating..." : "Update Profile" }}
              </button>
          </form>
      </div>
    `,

  data() {
    return {
      customer: {},
      profilePicFile: null,
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
  },

  methods: {
    async fetchProfile() {
      try {
        const customerId = this.$store.state.customer?.id;
        if (!customerId) throw new Error("Customer ID not found");

        const response = await fetch(`/api/customer/profile/${customerId}`, {
          headers: { "Authentication-Token": this.$store.state.auth_token },
        });

        if (!response.ok) throw new Error("Failed to fetch profile");
        this.customer = await response.json();

        this.originalUsername = this.customer.username;
        this.originalEmail = this.customer.email;
      } catch (error) {
        console.error(error);
        alert("Error fetching profile data.");
      }
    },

    handleProfilePicUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.profilePicFile = file;
        const reader = new FileReader();
        reader.onload = () => {
          this.customer.profile_picture_url = reader.result;
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
          this.customer.username !== this.originalUsername
        ) {
          const response = await fetch(
            `/api/check-username/${this.customer.username}`
          );
          const data = await response.json();
          this.usernameError = data.available
            ? ""
            : "Username is already taken.";
        } else if (
          field === "email" &&
          this.customer.email !== this.originalEmail
        ) {
          const response = await fetch(
            `/api/check-email/${this.customer.email}`
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

        const customerId = this.$store.state.customer?.id;
        if (!customerId) throw new Error("Customer ID not found");
        this.isUpdating = true;

        const formData = new FormData();
        this.editableFields.forEach((field) => {
          if (this.customer[field] !== undefined) {
            formData.append(field, this.customer[field]);
          }
        });

        if (this.profilePicFile) {
          formData.append("profile_pic", this.profilePicFile);
        }

        const response = await fetch(`/api/customer/profile/${customerId}`, {
          method: "PUT",
          headers: { "Authentication-Token": this.$store.state.auth_token },
          body: formData,
        });

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
  },
};
