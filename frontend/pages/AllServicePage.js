export default {
  template: `
  <div id="admin-services-page">
    <div class="container">
      <h2 class="text-center mb-4">Services Management</h2>

      <!-- Add New Service Button -->
      <div class="d-flex justify-content-between mb-3">
        <button type="button" class="btn btn-custom" data-bs-toggle="modal" data-bs-target="#addServiceModal">
          <i class="fas fa-plus-circle me-2"></i> Add New Service
        </button>
        <span class="align-self-center text-muted">{{ services.length }} services available</span>
      </div>

      <div class="card table-custom-card">
        <div class="table-responsive">
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
                <td>{{ formatPrice(service.base_price) }}</td>
                <td>
                <span class="badge bg-custom professional-count-badge">{{ service.professionalCount }}</span>
              </td>
              
                <td>
                  <button type="button" class="btn btn-success-custom" data-bs-toggle="modal"
                    data-bs-target="#editServiceModal" @click="populateEditModal(service)">
                    <i class="fas fa-edit me-1"></i> Edit
                  </button>
                  <button type="button" class="btn btn-danger-custom ms-2" @click="confirmDelete(service.id)">
                    <i class="fas fa-trash-alt me-1"></i> Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="services.length === 0" class="alert alert-info mt-3 text-center">
        <i class="fas fa-info-circle me-2"></i> No services available. Add your first service using the button above.
      </div>

      <!-- Add Service Modal -->
      <div class="modal fade" id="addServiceModal" tabindex="-1" aria-labelledby="addServiceLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content custom-modal">
            <form @submit.prevent="addService">
              <div class="modal-header">
                <h5 class="modal-title" id="addServiceLabel">
                  <i class="fas fa-plus-circle me-2"></i> Add Service
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label">Service Name</label>
                  <input v-model="newService.name" type="text" class="form-control" placeholder="Service Name" required />
                </div>
                <div class="mb-3">
                  <label class="form-label">Description</label>
                  <textarea v-model="newService.description" class="form-control" placeholder="Description" rows="3" required></textarea>
                </div>
                <div class="row mb-3">
                  <div class="col-md-6">
                    <label class="form-label">Base Price</label>
                    <div class="input-group">
                      <span class="input-group-text">₹</span>
                      <input v-model="newService.base_price" type="number" min="0" step="0.01" class="form-control" placeholder="Base Price" required />
                    </div>
                  </div>
                  <div class="col-md-6">
                  <label class="form-label">Base Time</label>
                  <input v-model="newService.base_time_required" type="text" class="form-control" placeholder="Base Time" required />
                </div>
                
                </div>
                <div class="mb-3">
                  <label class="form-label">Service Image</label>
                  <input type="file" class="form-control" accept="image/*" @change="handleFileUpload" />
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="submit" class="btn btn-custom">
                  <i class="fas fa-save me-2"></i> Add Service
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Edit Service Modal -->
      <div class="modal fade" id="editServiceModal" tabindex="-1" aria-labelledby="editServiceLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content custom-modal">
            <form @submit.prevent="editService">
              <div class="modal-header">
                <h5 class="modal-title" id="editServiceLabel">
                  <i class="fas fa-edit me-2"></i> Edit Service
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div class="mb-3">
                  <label class="form-label">Service Name</label>
                  <input v-model="currentService.name" type="text" class="form-control" required />
                </div>
                <div class="mb-3">
                  <label class="form-label">Description</label>
                  <textarea v-model="currentService.description" class="form-control" rows="3" required></textarea>
                </div>
                <div class="row mb-3">
                  <div class="col-md-6">
                    <label class="form-label">Base Price</label>
                    <div class="input-group">
                      <span class="input-group-text">₹</span>
                      <input v-model="currentService.base_price" type="number" min="0" step="0.01" class="form-control" required />
                    </div>
                  </div>
                  <div class="col-md-6">
  <label class="form-label">Base Time</label>
  <input v-model="currentService.base_time_required" type="text" class="form-control" required />
</div>

                </div>
                <div class="mb-3">
                  <label class="form-label">Service Image</label>
                  <input type="file" class="form-control" accept="image/*" @change="handleFileChange" />
                </div>

                <!-- Current Image Preview -->
                <div v-if="currentService.picture_url" class="mb-3 text-center">
                  <p class="mb-2">Current Image:</p>
                  <div class="img-preview-container">
                    <img :src="currentService.picture_url" alt="Service Picture" class="img-thumbnail" style="max-height: 150px;" />
                  </div>
                </div>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                <button type="submit" class="btn btn-custom">
                  <i class="fas fa-save me-2"></i> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div class="modal fade" id="deleteConfirmModal" tabindex="-1" aria-labelledby="deleteConfirmLabel" aria-hidden="true">
        <div class="modal-dialog modal-sm">
          <div class="modal-content custom-modal">
            <div class="modal-header">
              <h5 class="modal-title" id="deleteConfirmLabel">
                <i class="fas fa-exclamation-triangle text-danger me-2"></i> Confirm Delete
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body text-center">
              <p>Are you sure you want to delete this service?</p>
              <p class="text-danger"><small>This action cannot be undone.</small></p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-danger-custom" @click="executeDelete">
                <i class="fas fa-trash-alt me-2"></i> Delete
              </button>
            </div>
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
      serviceIdToDelete: null,
    };
  },
  created() {
    this.fetchServices();
  },
  methods: {
    formatPrice(price) {
      return `₹${parseFloat(price).toFixed(2)}`;
    },
    handleFileUpload(event) {
      const file = event.target.files[0];
      if (file) {
        this.newService.picture = file;
      }
    },
    async fetchServices() {
      try {
        const response = await fetch("/api/services");
        if (response.ok) {
          const services = await response.json();
          // Fetch professional counts for each service
          for (let service of services) {
            const countResponse = await fetch(
              `/api/services/${service.id}/professional-count`
            );
            if (countResponse.ok) {
              const countData = await countResponse.json();
              service.professionalCount = countData.count;
            } else {
              service.professionalCount = 0;
            }
          }
          this.services = services;
        } else {
          console.error("Failed to fetch services");
          this.showToast("Failed to fetch services", "error");
        }
      } catch (error) {
        console.error("Error fetching services:", error);
        this.showToast("Error loading services", "error");
      }
    },
    confirmDelete(id) {
      this.serviceIdToDelete = id;
      const deleteModal = new bootstrap.Modal(
        document.getElementById("deleteConfirmModal")
      );
      deleteModal.show();
    },
    async executeDelete() {
      if (!this.serviceIdToDelete) return;

      try {
        const response = await fetch(
          `/api/services/${this.serviceIdToDelete}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.$store.state.auth_token || "",
            },
          }
        );

        if (response.ok) {
          // Close the confirmation modal
          const deleteModal = bootstrap.Modal.getInstance(
            document.getElementById("deleteConfirmModal")
          );
          if (deleteModal) {
            deleteModal.hide();
          }

          this.showToast("Service deleted successfully", "success");
          this.fetchServices(); // Refresh the services list
          this.serviceIdToDelete = null;
        } else {
          this.showToast("Failed to delete service", "error");
        }
      } catch (error) {
        console.error("Error deleting service:", error);
        this.showToast("Error deleting service", "error");
      }
    },
    populateEditModal(service) {
      this.currentService = {
        ...service,
        base_time_required: service.base_time_required || "", // Ensure it's not null
      };
    },
    showToast(message, type = "info") {
      // Implementation depends on your toast notification system
      // This is a placeholder - implement according to your project's notification system
      if (window.toastr) {
        toastr[type](message);
      } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
        // Fallback to alert for demo purposes
        if (type === "error") {
          alert(`Error: ${message}`);
        }
      }
    },
    async addService() {
      const formData = new FormData();
      formData.append("name", this.newService.name);
      formData.append("description", this.newService.description);
      formData.append("base_price", this.newService.base_price);
      formData.append("base_time_required", this.newService.base_time_required);

      if (this.newService.picture) {
        formData.append("picture", this.newService.picture);
      }

      try {
        const response = await fetch("/api/services", {
          method: "POST",
          headers: {
            "Authentication-Token": this.$store.state.auth_token || "",
          },
          body: formData,
        });

        if (response.ok) {
          // Close modal using Bootstrap's API
          const modal = bootstrap.Modal.getInstance(
            document.getElementById("addServiceModal")
          );
          if (modal) {
            modal.hide();
          }

          this.showToast("Service added successfully", "success");
          this.fetchServices(); // Refresh the services list
          this.resetNewService();
        } else {
          this.showToast("Failed to add service", "error");
        }
      } catch (error) {
        console.error("Error adding service:", error);
        this.showToast("Error adding service", "error");
      }
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.currentService.picture = file;
      }
    },
    async editService() {
      const formData = new FormData();
      formData.append("name", this.currentService.name);
      formData.append("description", this.currentService.description);
      formData.append("base_price", this.currentService.base_price);
      formData.append(
        "base_time_required",
        this.currentService.base_time_required
      );

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
          // Close modal using Bootstrap's API
          const modal = bootstrap.Modal.getInstance(
            document.getElementById("editServiceModal")
          );
          if (modal) {
            modal.hide();
          }

          this.showToast("Service updated successfully", "success");
          this.fetchServices(); // Refresh the services list
        } else {
          this.showToast("Failed to update service", "error");
        }
      } catch (error) {
        console.error("Error editing service:", error);
        this.showToast("Error updating service", "error");
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
