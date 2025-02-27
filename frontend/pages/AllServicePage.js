export default {
  template: `
  <div id="admin-services-page">
  <div class="container">
      <h2 class="text-center mb-4">Services Management</h2>

      <!-- Add New Service Button -->
      <button type="button" class="btn btn-custom mb-3" data-bs-toggle="modal" data-bs-target="#addServiceModal">
          Add New Service
      </button>

      <!-- Services Table -->
      <table v-if="services.length > 0" class="table table-bordered table-hover table-custom">
          <thead class="table-dark-custom">
              <tr>
                  <th scope="col">ID</th>
                  <th scope="col">Service Name</th>
                  <th scope="col">Base Price</th>
                  <th scope="col">No. of Professionals</th>
                  <th scope="col">Action</th>
              </tr>
          </thead>
          <tbody>
              <tr v-for="service in services" :key="service.id">
                  <td>{{ service.id }}</td>
                  <td>{{ service.name }}</td>
                  <td>{{ service.base_price }}</td>
                  <td>{{ service.professional_count }}</td>
                  <td>
                      <button type="button" class="btn btn-success-custom" data-bs-toggle="modal"
                          data-bs-target="#editServiceModal" @click="populateEditModal(service)">
                          Edit
                      </button>
                      <button type="button" class="btn btn-danger-custom ms-2" @click="deleteService(service.id)">
                          Delete
                      </button>
                  </td>
              </tr>
          </tbody>
      </table>

      <p v-else class="mt-3">No services available.</p>

      <!-- Add Service Modal -->
      <div class="modal fade" id="addServiceModal" tabindex="-1" aria-labelledby="addServiceLabel" aria-hidden="true">
          <div class="modal-dialog">
              <div class="modal-content custom-modal">
                  <form @submit.prevent="addService">
                      <div class="modal-header">
                          <h5 class="modal-title" id="addServiceLabel">Add Service</h5>
                          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div class="modal-body">
                          <input v-model="newService.name" type="text" class="form-control mb-3"
                              placeholder="Service Name" required />
                          <input v-model="newService.description" type="text" class="form-control mb-3"
                              placeholder="Description" required />
                          <input v-model="newService.base_price" type="number" class="form-control mb-3"
                              placeholder="Base Price" required />
                          <input v-model="newService.base_time_required" type="number" class="form-control mb-3"
                              placeholder="Base Time (hours)" required />
                          <input type="file" class="form-control mb-3" accept="image/*" @change="handleFileUpload" />
                      </div>
                      <div class="modal-footer">
                          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                          <button type="submit" class="btn btn-custom">Add Service</button>
                      </div>
                  </form>
              </div>
          </div>
      </div>

      <!-- Edit Service Modal -->
      <div class="modal fade" id="editServiceModal" tabindex="-1" aria-labelledby="editServiceLabel"
          aria-hidden="true">
          <div class="modal-dialog">
              <div class="modal-content custom-modal">
                  <form @submit.prevent="editService">
                      <div class="modal-header">
                          <h5 class="modal-title" id="editServiceLabel">Edit Service</h5>
                          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div class="modal-body">
                          <input v-model="currentService.name" type="text" class="form-control mb-3" required />
                          <input v-model="currentService.description" type="text" class="form-control mb-3"
                              required />
                          <input v-model="currentService.base_price" type="number" class="form-control mb-3"
                              required />
                          <input v-model="currentService.base_time_required"  class="form-control mb-3"
                              required />

                          <!-- File Input for Image -->
                          <input type="file" class="form-control mb-3" accept="image/*" @change="handleFileChange" />

                          <div v-if="currentService.picture_url" class="mt-2">
                              <p>Current Picture:</p>
                              <img :src="currentService.picture_url" alt="Service Picture" width="150" height="150" />
                          </div>
                      </div>
                      <div class="modal-footer">
                          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                          <button type="submit" class="btn btn-custom">Save Changes</button>
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
      services: [],
      newService: {
        name: "",
        description: "",
        base_price: 0,
        base_time_required: 0,
        picture: null,
      },
      currentService: {},
    };
  },
  created() {
    this.fetchServices();
  },
  methods: {
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.newService.picture = file; // Update the property as needed
      }
    },

    async fetchServices() {
      // Fetch services directly from the backend or API
      try {
        const response = await fetch("/api/services");
        if (response.ok) {
          this.services = await response.json();
        } else {
          console.error("Failed to fetch services");
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    },
    async deleteService(id) {
      const confirmed = confirm(
        "Are you sure you want to delete this service?"
      );
      if (confirmed) {
        try {
          await fetch(`/api/services/${id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.$store.state.auth_token || "",
            },
          });
          this.fetchServices(); // Refresh the services list
        } catch (error) {
          console.error("Error deleting service:", error);
        }
      }
    },
    populateEditModal(service) {
      this.currentService = { ...service };
    },
    async addService() {
      const formData = new FormData();
      formData.append("name", this.newService.name);
      formData.append("description", this.newService.description);
      formData.append("base_price", this.newService.base_price);
      formData.append("base_time_required", this.newService.base_time_required);

      // Append the picture if it's available
      if (this.newService.picture) {
        formData.append("picture", this.newService.picture);
      }

      console.log([...formData.entries()]); // Log the FormData entries for debugging

      try {
        const response = await fetch("/api/services", {
          method: "POST",
          headers: {
            // Don't set 'Content-Type', let the browser handle it automatically
            "Authentication-Token": this.$store.state.auth_token || "",
          },
          body: formData, // Send FormData as the body
        });

        if (response.ok) {
          this.fetchServices(); // Refresh the services list
          $("#addServiceModal").modal("hide"); // Close the modal
          this.resetNewService();
        } else {
          console.error("Failed to add service");
        }
      } catch (error) {
        console.error("Error adding service:", error);
      }
    },
    // Handle file input change and store the file object
    handleFileChange(event) {
      const file = event.target.files[0]; // Get the first file selected
      if (file) {
        this.currentService.picture = file; // Store the file object in currentService.picture
      }
    },

    // Your existing editService method...
    async editService() {
      const formData = new FormData();
      formData.append("name", this.currentService.name);
      formData.append("description", this.currentService.description);
      formData.append("base_price", this.currentService.base_price);
      formData.append(
        "base_time_required",
        this.currentService.base_time_required
      );

      // Append the actual file object to formData
      if (this.currentService.picture) {
        formData.append("picture", this.currentService.picture);
      }

      try {
        const response = await fetch(
          `/api/services/${this.currentService.id}`,
          {
            method: "PUT",
            headers: {
              "Authentication-Token": this.$store.state.auth_token || "",
            },
            body: formData,
          }
        );

        if (response.ok) {
          console.log("Service edited successfully");
          this.fetchServices(); // Refresh the services list
          // $("#editServiceModal").modal("hide"); // Close the modal
        } else {
          console.error("Failed to edit service");
        }
      } catch (error) {
        console.error("Error editing service:", error);
      }
    },

    resetNewService() {
      this.newService = {
        name: "",
        description: "",
        base_price: 0,
        base_time_required: 0,
        picture: null,
      };
    },
  },
};
