export default {
  template: `
  <div class="container mt-4">
    <h3 class="text-center mb-4">Admin Search</h3>

    <div class="row justify-content-center">
        <div class="col-md-8">
            <form class="d-flex flex-wrap gap-2" @submit.prevent="handleSearch">
                <select class="form-select" v-model="searchParams.entity" @change="handleEntityChange">
                    <option value="" disabled>Select Category</option>
                    <option value="service">Service</option>
                    <option value="professional">Professional</option>
                    <option value="service_request">Service Request</option>
                    <option value="customer">Customer</option>
                </select>

                <select class="form-select" v-model="searchParams.criteria" :disabled="!searchParams.entity">
                    <option value="" disabled>Select Criteria</option>
                    <option v-for="criteria in criteriaOptions" :key="criteria.value" :value="criteria.value">
                        {{ criteria.text }}
                    </option>
                </select>

                <div v-if="showRatingFilter" class="input-group">
                    <input type="number" class="form-control" v-model="searchParams.ratingValue" step="0.1" min="1"
                        max="5" placeholder="Average Rating" />
                    <select class="form-select" v-model="searchParams.ratingCondition">
                        <option value="high">Above or Equal</option>
                        <option value="low">Below or Equal</option>
                    </select>
                </div>

                <input v-if="!showRatingFilter" type="text" class="form-control" v-model="searchParams.query"
                    placeholder="Enter search term..." />

                <button class="btn btn-primary" type="submit">Search</button>
            </form>
        </div>
    </div>

    <div class="row mt-4" v-if="searchResults.length">
        <div v-for="result in searchResults" :key="result.id" class="col-md-4 mb-4">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">
                        {{ searchParams.entity === 'service_request' ? result.service?.name || 'N/A' : result.name ||
                        'N/A' }}
                    </h5>

                    <div v-if="searchParams.entity === 'professional' || searchParams.entity === 'customer'">
                        <p><strong>Email:</strong> {{ result.email || 'N/A' }}</p>
                        <p><strong>Phone:</strong> {{ result.phone_no || 'N/A' }}</p>
                        <p><strong>Rating:</strong> {{ result.average_rating || 'N/A' }}</p>
                    </div>

                    <div v-else-if="searchParams.entity === 'service'">
                        <p><strong>Base Price:</strong> {{ result.base_price || 'N/A' }}</p>
                        <p><strong>Description:</strong> {{ result.description || 'N/A' }}</p>
                    </div>

                    <div v-else-if="searchParams.entity === 'service_request'">
                        <p><strong>Customer:</strong> {{ result.customer?.name || 'N/A' }}</p>
                        <p><strong>Professional:</strong> {{ result.professional?.name || 'N/A' }}</p>
                        <p><strong>Status:</strong> {{ result.service_status || 'N/A' }}</p>
                    </div>

                    <button class="btn btn-primary mt-2" @click="openDetailsModal(result)">View Details</button>
                </div>
            </div>
        </div>
    </div>

    <p class="text-center mt-4" v-if="!loading && searchResults.length === 0">No results found.</p>


    <!-- Details Modal -->
    <div v-if="showDetailsModal" class="modal fade show" tabindex="-1"
        style="display: block; background: rgba(0, 0, 0, 0.5);">
        <div class="modal-dialog "> <!-- Added custom-modal class -->
            <div class="modal-content custom-modal">
                <div class="modal-header">
                    <h5 class="modal-title">Details</h5>
                    <button type="button" class="btn-close" @click="closeDetailsModal"></button>
                </div>
                <div class="modal-body p-4">
                    <p><strong>Name:</strong> {{ modalData.name || 'N/A' }}</p>

                    <div v-if="searchParams.entity === 'professional'" class="mt-3">
                        <p><strong>Email:</strong> {{ modalData.email || 'N/A' }}</p>
                        <p><strong>Phone:</strong> {{ modalData.phone_no || 'N/A' }}</p>
                        <p><strong>Address:</strong> {{ modalData.address || 'N/A' }}</p>
                        <p><strong>Experience:</strong> {{ modalData.experience || 'N/A' }}</p>
                        <p><strong>Average Rating:</strong> {{ modalData.average_rating || 'N/A' }}</p>
                        <p><strong>Verified:</strong>
                            {{
                            modalData.verified_status === 'approved'
                            ? 'Approved'
                            : modalData.verified_status === 'rejected'
                            ? 'Rejected'
                            : 'Yet to be Verified'
                            }}
                        </p>
                        <p><strong>Blocked:</strong> {{ modalData.block_status ? 'Yes' : 'No' }}</p>

                        <div class="d-flex flex-wrap gap-2 mt-3">
                            <button v-if="modalData.verified_status" class="btn btn-danger"
                                @click="deleteProfessional(modalData.id)">Delete</button>
                            <button v-if="modalData.verified_status === 'approved'"
                                :class="['btn', modalData.block_status ? 'btn-success' : 'btn-warning']"
                                @click="toggleBlockProfessional(modalData.id, modalData.block_status)">
                                {{ modalData.block_status ? 'Unblock' : 'Block' }}
                            </button>
                            <button v-if="modalData.verified_status !== 'approved'" class="btn btn-success"
                                @click="openApprovalModal">
                                Approve/Reject
                            </button>
                        </div>
                    </div>

                    <div v-else-if="searchParams.entity === 'customer'" class="mt-3">
                        <p><strong>Email:</strong> {{ modalData.email || 'N/A' }}</p>
                        <p><strong>Phone:</strong> {{ modalData.phone_no || 'N/A' }}</p>
                        <p><strong>Address:</strong> {{ modalData.address || 'N/A' }}</p>
                        <p><strong>Average Rating:</strong> {{ modalData.average_rating || 'N/A' }}</p>
                        <p><strong>Blocked:</strong> {{ modalData.block_status ? "Yes" : "No" }}</p>

                        <div class="d-flex flex-wrap gap-2 mt-3">
                            <button class="btn btn-danger" @click="deleteCustomer(modalData.id)">Delete</button>
                            <button :class="['btn', modalData.block_status ? 'btn-success' : 'btn-warning']"
                                @click="toggleBlockCustomer(modalData.id, modalData.block_status)">
                                {{ modalData.block_status ? 'Unblock' : 'Block' }}
                            </button>
                        </div>
                    </div>

                    <div v-else-if="searchParams.entity === 'service'" class="mt-3">
                        <p><strong>Base Price:</strong> {{ modalData.base_price || 'N/A' }}</p>
                        <p><strong>Description:</strong> {{ modalData.description || 'N/A' }}</p>
                        <img v-if="modalData.image_url" :src="modalData.image_url" alt="Service Image"
                            class="img-fluid mt-3 rounded shadow" />
                        <button class="btn btn-primary mt-2" @click="openEditServiceModal(modalData)">Edit Service</button>
                    </div>

                    <div v-else-if="searchParams.entity === 'service_request'" class="mt-3">
                        <p><strong>Customer Name:</strong> {{ modalData.customer?.name || 'N/A' }}</p>
                        <p><strong>Professional Name:</strong> {{ modalData.professional?.name || 'N/A'
                            }}</p>
                        <p><strong>Service Name:</strong> {{ modalData.service?.name || 'N/A' }}</p>
                        <p><strong>Status:</strong> {{ modalData.service_status || 'N/A' }}</p>
                        <p><strong>Remarks:</strong> {{ modalData.remarks || 'N/A' }}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="closeDetailsModal">Close</button>
                </div>
            </div>
        </div>
    </div>
    <!-- Approve/Reject Modal -->
    <div v-if="showApprovalModal" class="modal fade show" tabindex="-1"
        style="display: block; background: rgba(0, 0, 0, 0.5);">
        <div class="modal-dialog">
            <div class="modal-content custom-modal"> <!-- Added custom-modal class -->
                <div class="modal-header">
                    <h5 class="modal-title">Professional Approval/Rejection</h5>
                    <button type="button" class="btn-close" @click="closeApprovalModal"></button>
                </div>
                <div class="modal-body">
                    <p><b>Professional Name:</b> {{ modalData.name || 'N/A' }}</p>
                    <p><b>Experience:</b> {{ modalData.experience ? modalData.experience + ' years' : 'N/A' }}</p>
                    <p><b>Service:</b> {{ modalData.service || 'N/A' }}</p>
                    <p><b>Address:</b> {{ modalData.address || 'N/A' }}</p>
                    <p><b>Pincode:</b> {{ modalData.pincode || 'N/A' }}</p>

                    <!-- Document URL -->
                    <p><b>Document:</b>
                        <span v-if="modalData.document_url">
                            <a :href="modalData.document_url" target="_blank" rel="noopener noreferrer">View
                                Document</a>
                        </span>
                        <span v-else>N/A</span>
                    </p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="closeApprovalModal">Close</button>
                    <button class="btn btn-custom" @click="approveProfessional">Approve</button>
                    <button class="btn btn-warning" @click="rejectProfessional">Reject</button>
                </div>
            </div>
        </div>
    </div>
<!-- Edit Service Modal -->
<div v-if="showEditServiceModal" class="modal fade show" tabindex="-1"
    style="display: block; background: rgba(0, 0, 0, 0.5);">
    <div class="modal-dialog">
        <div class="modal-content custom-modal">
            <form @submit.prevent="editService">
                <div class="modal-header">
                    <h5 class="modal-title">Edit Service</h5>
                    <button type="button" class="btn-close" @click="closeEditServiceModal"></button>
                </div>
                <div class="modal-body">
                    <input v-model="currentService.name" type="text" class="form-control mb-3" required />
                    <input v-model="currentService.description" type="text" class="form-control mb-3" required />
                    <input v-model="currentService.base_price" type="number" class="form-control mb-3" required />
                    <input v-model="currentService.base_time_required" type="text" class="form-control mb-3" required />

                    <!-- File Input for Image -->
                    <input type="file" class="form-control mb-3" accept="image/*" @change="handleFileChange" />

                    <div v-if="currentService.image_url" class="mt-2">
                        <p>Current Picture:</p>
                        <img :src="currentService.image_url" alt="Service Picture" width="150" height="150" />
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="closeEditServiceModal">Close</button>
                    <button type="submit" class="btn btn-custom">Save Changes</button>
                </div>
            </form>
        </div>
    </div>
</div>


</div>
  `,
  data() {
    return {
      searchParams: {
        entity: "",
        query: "",
        criteria: "",
        ratingValue: "",
        ratingCondition: "high",
      },
      searchResults: [],
      criteriaOptions: [],
      loading: false,
      showDetailsModal: false,
      showApprovalModal: false,
      showEditServiceModal: false,
      currentService: {},
      modalData: {},
    };
  },
  computed: {
    showRatingFilter() {
      return this.searchParams.criteria === "average_rating";
    },
  },
  methods: {
    async deleteCustomer(customerId) {
      try {
        const token = this.$store.state.auth_token;
        if (!token) throw new Error("No authentication token found");

        const res = await fetch(`/api/customers/${customerId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": token,
          },
        });

        if (res.ok) {
          alert("Customer deleted successfully");
          this.closeDetailsModal(); // ✅ Close modal
          await this.handleSearch(); // ✅ Refresh results
        } else {
          const data = await res.json();
          alert("Failed to delete customer: " + data.message);
        }
      } catch (error) {
        console.error("Error deleting customer:", error);
      }
    },

    async toggleBlockCustomer() {
      try {
        const token = this.$store.state.auth_token;
        if (!token) throw new Error("No authentication token found");

        const action = this.modalData.block_status ? "unblock" : "block";
        const res = await fetch(
          `/api/customers/${action}/${this.modalData.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": token,
            },
          }
        );

        if (res.ok) {
          alert(`Customer ${action}ed successfully`);
          this.modalData.block_status = !this.modalData.block_status; // Add this line

          await this.handleSearch(); // ✅ Refresh results
        } else {
          const data = await res.json();
          alert(`Failed to ${action} customer: ${data.message}`);
        }
      } catch (error) {
        console.error(`Error updating customer status:`, error);
      }
    },

    async approveProfessional() {
      try {
        const res = await fetch(
          `/api/service_professionals/approve/${this.modalData.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.$store.state.auth_token,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to approve professional");

        alert("Professional approved successfully");
        this.closeAllModals();
        await this.handleSearch(); // ✅ Refresh results
      } catch (error) {
        console.error(error.message);
      }
    },

    async rejectProfessional() {
      try {
        const res = await fetch(
          `/api/service_professionals/reject/${this.modalData.id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.$store.state.auth_token,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to reject professional");

        alert("Professional rejected successfully");
        this.closeAllModals();
        await this.handleSearch(); // ✅ Refresh results
      } catch (error) {
        console.error(error.message);
      }
    },

    async deleteProfessional(professionalId) {
      try {
        const res = await fetch(
          `/api/service_professionals/${professionalId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.$store.state.auth_token,
            },
          }
        );

        if (res.ok) {
          alert("Professional deleted successfully");
          this.closeDetailsModal();
          await this.handleSearch(); // ✅ Refresh results
        } else {
          alert("Failed to delete professional");
        }
      } catch (error) {
        console.error("Error deleting professional:", error);
      }
    },

    async toggleBlockProfessional(professionalId, currentStatus) {
      try {
        const action = currentStatus ? "unblock" : "block";
        const res = await fetch(
          `/api/service_professionals/${action}/${professionalId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.$store.state.auth_token,
            },
          }
        );

        if (res.ok) {
          alert(`Professional ${action}ed successfully`);
          this.modalData.block_status = !this.modalData.block_status; // Add this line

          await this.handleSearch(); // ✅ Refresh results
        } else {
          alert(`Failed to ${action} professional`);
        }
      } catch (error) {
        console.error(`Error updating professional status:`, error);
      }
    },
    openEditServiceModal(service) {
      this.currentService = { ...service };
      this.showEditServiceModal = true;
    },
    closeEditServiceModal() {
      this.showEditServiceModal = false;
      this.currentService = {};
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.currentService.picture = file;
      }
    },

    async editService() {
      try {
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

        const res = await fetch(`/api/services/${this.currentService.id}`, {
          method: "PUT",
          body: formData,
          headers: {
            "Authentication-Token": this.$store.state.auth_token,
          },
        });

        if (res.ok) {
          alert("Service updated successfully");
          this.closeEditServiceModal();
          await this.handleSearch(); // Refresh results
        } else {
          alert("Failed to update service");
        }
      } catch (error) {
        console.error("Error updating service:", error);
      }
    },
    handleEntityChange() {
      this.searchParams.criteria = "";
      this.searchParams.query = "";
      this.searchResults = [];
      this.criteriaOptions = this.getCriteriaOptions();
    },
    getCriteriaOptions() {
      const entityCriteriaMap = {
        service: [
          { text: "Name", value: "name" },
          { text: "Base Price", value: "base_price" },
          { text: "Description", value: "description" },
        ],
        professional: [
          { text: "Name", value: "name" },
          { text: "Experience", value: "experience" },
          { text: "Average Rating", value: "average_rating" },
          { text: "Verified Status", value: "verified_status" },
          { text: "Blocked Status", value: "blocked_status" },
        ],
        service_request: [
          { text: "Customer Name", value: "customer_name" },
          { text: "Service Status", value: "service_status" },
        ],
        customer: [
          { text: "Name", value: "name" },
          { text: "Email", value: "email" },
          { text: "Phone", value: "phone" },
          { text: "Average Rating", value: "average_rating" },
        ],
      };
      return entityCriteriaMap[this.searchParams.entity] || [];
    },
    async handleSearch() {
      if (!this.searchParams.criteria) {
        alert("Please select a criteria before searching.");
        return;
      }

      this.loading = true;
      try {
        const params = new URLSearchParams({
          entity: this.searchParams.entity,
          criteria: this.searchParams.criteria,
        });

        if (this.showRatingFilter) {
          params.append("rating", this.searchParams.ratingValue);
          params.append("rating_condition", this.searchParams.ratingCondition);
        } else {
          params.append("query", this.searchParams.query);
        }

        const res = await fetch(`/api/search_admin?${params.toString()}`, {
          headers: { "Authentication-Token": this.$store.state.auth_token },
        });

        if (!res.ok) throw new Error("Failed to fetch search results");

        const data = await res.json();
        this.searchResults = data.results;
      } catch (error) {
        console.error("Error performing search:", error);
        this.searchResults = [];
      } finally {
        this.loading = false;
      }
    },
    openDetailsModal(data) {
      this.modalData = data;
      this.showDetailsModal = true;
    },
    closeDetailsModal() {
      this.showDetailsModal = false;
    },
    openApprovalModal() {
      this.showDetailsModal = false;
      this.showApprovalModal = true;
    },
    closeApprovalModal() {
      this.showApprovalModal = false;
    },
    closeAllModals() {
      this.showDetailsModal = false;
      this.showApprovalModal = false;
      this.modalData = {};
    },
  },
};
