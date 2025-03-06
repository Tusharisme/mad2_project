// export default {
//   template: `
//     <div class="container">
//       <div id="panel" class="mt-4">
//         <h2>Your Profile</h2>

//         <div id="input-form">
//           <form @submit.prevent="updateProfile">
//             <!-- Profile Picture Section -->
//             <div class="mb-3 text-center">
//               <label for="profile_pic" class="d-block">
//                 <div class="position-relative mx-auto" style="width: 150px; height: 150px;">
//                   <img
//                     :src="customer.profile_pic"
//                     alt="Profile Picture"
//                     class="rounded-circle"
//                     style="width: 150px; height: 150px; cursor: pointer; object-fit: cover; border: 3px solid #8b4513;"
//                   />
//                   <div
//                     class="position-absolute d-flex align-items-center justify-content-center"
//                     style="bottom: 0; right: 0; background-color: #8b4513; width: 36px; height: 36px; border-radius: 50%; cursor: pointer;"
//                   >
//                     <i class="fas fa-camera text-white"></i>
//                   </div>
//                 </div>
//               </label>
//               <p class="text-muted mt-2">Click to change your profile picture</p>
//               <input type="file" class="d-none" id="profile_pic" @change="handleProfilePicUpload" accept="image/*">
//             </div>

//             <!-- Profile Fields Section -->
//             <div class="row">
//               <div v-for="field in editableFields" :key="field"
//                    :class="field === 'address' ? 'col-12' : 'col-12 col-md-6'">
//                 <div class="mb-3">
//                   <label class="form-label"><b>{{ formatFieldName(field) }}</b></label>
//                   <input
//                     type="text"
//                     class="form-control"
//                     v-model="customer[field]"
//                     @blur="debouncedCheckAvailability(field)"
//                     :class="{'border-danger': getFieldError(field)}"
//                     required
//                   >

//                   <!-- Error Messages -->
//                   <small v-if="getFieldError(field)" class="text-danger">
//                     {{ getFieldError(field) }}
//                   </small>
//                 </div>
//               </div>
//             </div>

//             <!-- Submit Button -->
//             <div class="mt-4 text-center">
//               <button
//                 type="submit"
//                 class="btn btn-custom"
//                 :disabled="isUpdating || hasErrors"
//               >
//                 <span v-if="isUpdating">
//                   <i class="fas fa-spinner fa-spin me-2"></i>
//                   Updating...
//                 </span>
//                 <span v-else>Update Profile</span>
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   `,

//   data() {
//     return {
//       customer: {},
//       profilePicFile: null,
//       originalUsername: "",
//       originalEmail: "",
//       usernameError: "",
//       emailError: "",
//       isUpdating: false,
//       editableFields: [
//         "name",
//         "username",
//         "email",
//         "phone_no",
//         "address",
//         "pin_code",
//         "gender",
//       ],
//       debounceTimeout: null,
//     };
//   },

//   computed: {
//     hasErrors() {
//       return (
//         (this.usernameError &&
//           this.customer.username !== this.originalUsername) ||
//         (this.emailError && this.customer.email !== this.originalEmail)
//       );
//     },
//   },

//   mounted() {
//     this.fetchProfile();
//   },

//   methods: {
//     formatFieldName(field) {
//       return field
//         .split("_")
//         .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//         .join(" ");
//     },

//     getFieldError(field) {
//       if (field === "username") return this.usernameError;
//       if (field === "email") return this.emailError;
//       return "";
//     },

//     async fetchProfile() {
//       try {
//         const customerId = this.$store.state.customer?.id;
//         if (!customerId) throw new Error("Customer ID not found");

//         const response = await fetch(`/api/customer/profile/${customerId}`, {
//           headers: { "Authentication-Token": this.$store.state.auth_token },
//         });

//         if (!response.ok) throw new Error("Failed to fetch profile");
//         this.customer = await response.json();

//         this.originalUsername = this.customer.username;
//         this.originalEmail = this.customer.email;
//       } catch (error) {
//         console.error(error);
//         this.showAlert("Error fetching profile data.", "danger");
//       }
//     },

//     handleProfilePicUpload(event) {
//       const file = event.target.files[0];
//       if (file) {
//         if (file.size > 5 * 1024 * 1024) {
//           this.showAlert("Image size must be less than 5MB", "danger");
//           return;
//         }

//         this.profilePicFile = file;
//         const reader = new FileReader();
//         reader.onload = () => {
//           this.customer.profile_pic = reader.result;
//         };
//         reader.readAsDataURL(file);
//       }
//     },

//     debouncedCheckAvailability(field) {
//       if (this.debounceTimeout) {
//         clearTimeout(this.debounceTimeout);
//       }
//       this.debounceTimeout = setTimeout(() => {
//         this.checkAvailability(field);
//       }, 500);
//     },

//     async checkAvailability(field) {
//       try {
//         if (
//           field === "username" &&
//           this.customer.username !== this.originalUsername
//         ) {
//           const response = await fetch(
//             `/api/check-username/${this.customer.username}`
//           );
//           const data = await response.json();
//           this.usernameError = data.available
//             ? ""
//             : "Username is already taken.";
//         } else if (
//           field === "email" &&
//           this.customer.email !== this.originalEmail
//         ) {
//           const response = await fetch(
//             `/api/check-email/${this.customer.email}`
//           );
//           const data = await response.json();
//           this.emailError = data.available ? "" : "Email is already in use.";
//         }
//       } catch (error) {
//         console.error(error);
//         if (field === "username") {
//           this.usernameError = "Error checking username.";
//         } else if (field === "email") {
//           this.emailError = "Error checking email.";
//         }
//       }
//     },

//     showAlert(message, type = "success") {
//       // You can replace this with your preferred notification system
//       alert(message);
//     },

//     async updateProfile() {
//       try {
//         if (this.usernameError || this.emailError) {
//           this.showAlert(
//             "Please resolve the errors before updating your profile.",
//             "danger"
//           );
//           return;
//         }

//         const customerId = this.$store.state.customer?.id;
//         if (!customerId) throw new Error("Customer ID not found");
//         this.isUpdating = true;

//         const formData = new FormData();
//         this.editableFields.forEach((field) => {
//           if (this.customer[field] !== undefined) {
//             formData.append(field, this.customer[field]);
//           }
//         });

//         if (this.profilePicFile) {
//           formData.append("profile_pic", this.profilePicFile);
//         }

//         const response = await fetch(`/api/customer/profile/${customerId}`, {
//           method: "PUT",
//           headers: { "Authentication-Token": this.$store.state.auth_token },
//           body: formData,
//         });

//         if (!response.ok) throw new Error("Profile update failed");

//         this.showAlert("Profile updated successfully!");
//         this.usernameError = "";
//         this.emailError = "";
//         await this.fetchProfile();
//       } catch (error) {
//         console.error(error);
//         this.showAlert("Error updating profile.", "danger");
//       } finally {
//         this.isUpdating = false;
//       }
//     },
//   },
// };
export default {
  template: `
    <div class="container">
      <div id="panel" class="mt-4">
        <h2>Your Profile</h2>
        
        <div id="input-form">
          <form @submit.prevent="updateProfile">
            <!-- Profile Picture Section -->
            <div class="mb-3 text-center">
              <label for="profile_pic" class="d-block">
                <div class="position-relative mx-auto" style="width: 150px; height: 150px;">
                  <img 
                    :src="customer.profile_pic"
                    alt="Profile Picture"
                    class="rounded-circle"
                    style="width: 150px; height: 150px; cursor: pointer; object-fit: cover; border: 3px solid #8b4513;"
                  />
                  <div 
                    class="position-absolute d-flex align-items-center justify-content-center"
                    style="bottom: 0; right: 0; background-color: #8b4513; width: 36px; height: 36px; border-radius: 50%; cursor: pointer;"
                  >
                    <i class="fas fa-camera text-white"></i>
                  </div>
                </div>
              </label>
              <p class="text-muted mt-2">Click to change your profile picture</p>
              <input type="file" class="d-none" id="profile_pic" @change="handleProfilePicUpload" accept="image/*">
            </div>

            <!-- Profile Fields Section -->
            <div class="row">
              <div v-for="field in editableFields" :key="field" 
                   :class="field === 'address' ? 'col-12' : 'col-12 col-md-6'">
                <div class="mb-3">
                  <label class="form-label"><b>{{ formatFieldName(field) }}</b></label>
                  <input 
                    type="text" 
                    class="form-control"
                    v-model="customer[field]" 
                    @blur="debouncedCheckAvailability(field)" 
                    :class="{'border-danger': getFieldError(field)}"
                    required
                  >
                  
                  <!-- Error Messages -->
                  <small v-if="getFieldError(field)" class="text-danger">
                    {{ getFieldError(field) }}
                  </small>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <div class="mt-4 text-center">
              <button 
                type="submit" 
                class="btn btn-custom"
                :disabled="isUpdating"
              >
                <span v-if="isUpdating">
                  <i class="fas fa-spinner fa-spin me-2"></i>
                  Updating...
                </span>
                <span v-else>Update Profile</span>
              </button>
            </div>
          </form>
        </div>
      </div>
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
    formatFieldName(field) {
      return field
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    },

    getFieldError(field) {
      if (field === "username") return this.usernameError;
      if (field === "email") return this.emailError;
      return "";
    },

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
        this.showAlert("Error fetching profile data.", "danger");
      }
    },

    handleProfilePicUpload(event) {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          this.showAlert("Image size must be less than 5MB", "danger");
          event.target.value = ""; // Reset the file input
          return;
        }

        this.profilePicFile = file;
        const reader = new FileReader();
        reader.onload = () => {
          this.customer.profile_pic = reader.result;
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
        // Reset the error messages first
        if (field === "username") this.usernameError = "";
        if (field === "email") this.emailError = "";

        // Only check if the value has changed from original
        if (
          field === "username" &&
          this.customer.username !== this.originalUsername &&
          this.customer.username.trim() !== ""
        ) {
          // Validate username format first
          const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
          if (!usernameRegex.test(this.customer.username)) {
            this.usernameError =
              "Username must be 3-20 characters and can only contain letters, numbers, and underscores.";
            return;
          }

          const response = await fetch(`/api/check-availability`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.$store.state.auth_token,
            },
            body: JSON.stringify({
              type: "username",
              value: this.customer.username,
              current_user_id: this.$store.state.customer?.id,
            }),
          });

          if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
          }

          const data = await response.json();
          this.usernameError = data.available
            ? ""
            : "Username is already taken.";
        } else if (
          field === "email" &&
          this.customer.email !== this.originalEmail &&
          this.customer.email.trim() !== ""
        ) {
          // Validate email format first
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(this.customer.email)) {
            this.emailError = "Please enter a valid email address.";
            return;
          }

          const response = await fetch(`/api/check-availability`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.$store.state.auth_token,
            },
            body: JSON.stringify({
              type: "email",
              value: this.customer.email,
              current_user_id: this.$store.state.customer?.id,
            }),
          });

          if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
          }

          const data = await response.json();
          this.emailError = data.available ? "" : "Email is already in use.";
        }
      } catch (error) {
        console.error(error);
        if (field === "username") {
          this.usernameError = "Error checking username availability.";
        } else if (field === "email") {
          this.emailError = "Error checking email availability.";
        }
      }
    },

    showAlert(message, type = "success") {
      // You can replace this with your preferred notification system
      alert(message);
    },

    async updateProfile() {
      // Validate all required fields
      const emptyFields = this.editableFields.filter(
        (field) =>
          !this.customer[field] ||
          (typeof this.customer[field] === "string" &&
            this.customer[field].trim() === "")
      );

      if (emptyFields.length > 0) {
        const fieldNames = emptyFields.map(this.formatFieldName).join(", ");
        this.showAlert(
          `Please fill in the following required fields: ${fieldNames}`,
          "danger"
        );
        return;
      }

      // Check for validation errors
      if (this.usernameError || this.emailError) {
        this.showAlert(
          "Please resolve the errors before updating your profile.",
          "danger"
        );
        return;
      }

      try {
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
          headers: {
            "Authentication-Token": this.$store.state.auth_token,
            // Note: Don't add Content-Type header when using FormData
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || "Profile update failed");
        }

        this.showAlert("Profile updated successfully!");
        this.usernameError = "";
        this.emailError = "";
        this.profilePicFile = null; // Reset the file after successful update
        await this.fetchProfile();
      } catch (error) {
        console.error(error);
        this.showAlert(`Error updating profile: ${error.message}`, "danger");
      } finally {
        this.isUpdating = false;
      }
    },
  },
};
