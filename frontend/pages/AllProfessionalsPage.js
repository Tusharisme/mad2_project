export default {
  template: `
  <div id="all-professionals-page" class="container mt-5">
    <div class="header-section mb-4">
      <h2 class="text-center">All Professionals</h2>
      <div class="d-flex justify-content-end mb-3">
        <button class="btn btn-primary" @click="fetchProfessionals">
          <i class="fas fa-sync-alt me-1"></i> Refresh
        </button>
      </div>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading professionals...</p>
    </div>
    
    <!-- Error state -->
    <div v-else-if="error" class="alert alert-danger" role="alert">
      <i class="fas fa-exclamation-triangle me-2"></i> {{ error }}
      <button class="btn btn-sm btn-outline-danger ms-2" @click="fetchProfessionals">
        <i class="fas fa-sync-alt me-1"></i> Try Again
      </button>
    </div>
    
    <div v-else class="card table-custom-card">
      <div v-if="professionals.length > 0" class="table-responsive">
        <table class="table table-bordered table-hover table-custom">
          <thead class="table-dark-custom">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Verified Status</th>
              <th>Blocked Status</th>
              <th>Experience (Years)</th>
              <th>Average Rating</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="professional in professionals" :key="professional.id">
              <td>
                <a :href="'/professional_details/' + professional.id" class="professional-link">{{ professional.id }}</a>
              </td>
              <td>{{ professional.name }}</td>
              <td>
                <span :class="getStatusBadgeClass(professional.verified_status)">
                  {{ professional.verified_status }}
                </span>
              </td>
              <td>
                <span :class="getBlockStatusBadgeClass(professional.block_status)">
                  {{ professional.block_status ? 'Blocked' : 'Not Blocked' }}
                </span>
              </td>
              <td>{{ professional.experience }}</td>
              <td>
                <div v-if="professional.average_rating" class="professional-rating">
                  <div class="stars-container">
                    <div class="stars-filled" :style="{width: (professional.average_rating/5*100) + '%'}">★★★★★</div>
                    <div class="stars-empty">☆☆☆☆☆</div>
                  </div>
                  <span class="rating-value">{{ professional.average_rating.toFixed(1) }}</span>
                </div>
                <span v-else>N/A</span>
              </td>
              <td class="action-buttons">
                <template v-if="professional.verified_status === 'approved'">
                  <button class="btn btn-danger-custom btn-sm me-1" 
                          @click="confirmAction('block', professional.id, professional.name)"
                          :disabled="professional.block_status">
                    <i class="fas fa-ban me-1"></i> Block
                  </button>
                  <button class="btn btn-success-custom btn-sm me-1" 
                          @click="confirmAction('unblock', professional.id, professional.name)"
                          :disabled="!professional.block_status">
                    <i class="fas fa-unlock me-1"></i> Unblock
                  </button>
                </template>
                <template v-else>
                  <button class="btn btn-success-custom btn-sm me-1" @click="openModal(professional.id, 'approve')">
                    <i class="fas fa-check-circle me-1"></i> Approve
                  </button>
                  <button class="btn btn-warning btn-sm me-1" @click="openModal(professional.id, 'reject')">
                    <i class="fas fa-times-circle me-1"></i> Reject
                  </button>
                </template>
                <button class="btn btn-danger-custom btn-sm" 
                        @click="confirmAction('delete', professional.id, professional.name)">
                  <i class="fas fa-trash-alt me-1"></i> Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-else class="empty-state">
        <p><i class="fas fa-user-slash me-2"></i> No professionals available.</p>
      </div>
    </div>

    <!-- Approve/Reject Modal -->
    <div class="modal fade" id="approveRejectModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content custom-modal">
          <div class="modal-header">
            <h5 class="modal-title">
              <i :class="currentAction === 'approve' ? 'fas fa-check-circle text-success me-2' : 'fas fa-times-circle text-warning me-2'"></i>
              Professional {{ currentAction === 'approve' ? 'Approval' : 'Rejection' }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div v-if="modalLoading" class="text-center py-3">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2">Loading professional details...</p>
            </div>
            <div v-else-if="modalError" class="alert alert-danger" role="alert">
              <i class="fas fa-exclamation-triangle me-2"></i> {{ modalError }}
            </div>
            <div v-else class="professional-info-card p-3 mb-3 rounded">
              <p><b><i class="fas fa-user me-2"></i>Professional Name:</b> {{ modalData.name }}</p>
              <p><b><i class="fas fa-briefcase me-2"></i>Experience:</b> {{ modalData.experience }} years</p>
              <p><b><i class="fas fa-tools me-2"></i>Service:</b> {{ modalData.service }}</p>
              <p><b><i class="fas fa-map-marker-alt me-2"></i>Address:</b> {{ modalData.address }}</p>
              <p><b><i class="fas fa-map-pin me-2"></i>Pincode:</b> {{ modalData.pincode }}</p>
              <p><b><i class="fas fa-file-alt me-2"></i>Document:</b> 
                <span v-if="modalData.document_url">
                  <a :href="modalData.document_url" target="_blank" rel="noopener noreferrer" class="document-link">
                    <i class="fas fa-external-link-alt me-1"></i> View Document
                  </a>
                </span>
                <span v-else>N/A</span>
              </p>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="fas fa-times me-1"></i> Close
            </button>
            <button class="btn btn-custom" 
                    @click="submitApprovalReject"
                    :disabled="actionInProgress">
              <span v-if="actionInProgress">
                <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Processing...
              </span>
              <span v-else>
                <i class="fas fa-check me-1"></i> Confirm {{ currentAction }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Confirmation Modal -->
    <div class="modal fade" id="confirmationModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content custom-modal">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-exclamation-triangle text-warning me-2"></i>
              Confirm Action
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to {{ confirmationAction }} professional <strong>{{ confirmationName }}</strong>?</p>
            <p v-if="confirmationAction === 'delete'" class="text-danger">
              <i class="fas fa-exclamation-circle me-1"></i>
              This action cannot be undone.
            </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
              <i class="fas fa-times me-1"></i> Cancel
            </button>
            <button class="btn" 
                    :class="getConfirmButtonClass()"
                    @click="executeAction"
                    :disabled="actionInProgress">
              <span v-if="actionInProgress">
                <span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Processing...
              </span>
              <span v-else>
                <i class="fas fa-check me-1"></i> Confirm
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  data() {
    return {
      professionals: [],
      currentAction: "",
      currentProfessionalId: null,
      loading: true,
      error: null,
      modalLoading: false,
      modalError: null,
      actionInProgress: false,
      confirmationAction: "",
      confirmationId: null,
      confirmationName: "",
      modalData: {
        name: "",
        experience: "",
        service: "",
        address: "",
        pincode: "",
        document_url: null,
      },
    };
  },
  created() {
    this.fetchProfessionals();
  },
  methods: {
    getStatusBadgeClass(status) {
      switch (status) {
        case "approved":
          return "status-badge completed";
        case "pending":
          return "status-badge pending";
        case "rejected":
          return "status-badge rejected";
        default:
          return "status-badge";
      }
    },
    getBlockStatusBadgeClass(isBlocked) {
      return isBlocked ? "status-badge rejected" : "status-badge completed";
    },
    getConfirmButtonClass() {
      switch (this.confirmationAction) {
        case "delete":
          return "btn-danger";
        case "block":
          return "btn-danger-custom";
        case "unblock":
          return "btn-success-custom";
        default:
          return "btn-primary";
      }
    },
    async fetchProfessionals() {
      this.loading = true;
      this.error = null;

      try {
        const token = this.$store.state.auth_token;
        if (!token) throw new Error("No authentication token found");

        const response = await fetch("/api/service_professionals", {
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": token,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch professionals");
        }

        this.professionals = await response.json();
      } catch (error) {
        console.error("Error fetching professionals:", error.message);
        this.error =
          error.message || "Failed to load professionals. Please try again.";
      } finally {
        this.loading = false;
      }
    },
    confirmAction(action, id, name) {
      this.confirmationAction = action;
      this.confirmationId = id;
      this.confirmationName = name;

      new bootstrap.Modal(document.getElementById("confirmationModal")).show();
    },
    async executeAction() {
      this.actionInProgress = true;

      try {
        let result;
        switch (this.confirmationAction) {
          case "block":
            result = await this.modifyProfessionalStatus(
              this.confirmationId,
              "block"
            );
            break;
          case "unblock":
            result = await this.modifyProfessionalStatus(
              this.confirmationId,
              "unblock"
            );
            break;
          case "delete":
            result = await this.deleteProfessional(this.confirmationId);
            break;
          default:
            throw new Error("Invalid action");
        }

        if (result) {
          bootstrap.Modal.getInstance(
            document.getElementById("confirmationModal")
          ).hide();
          this.fetchProfessionals();
        }
      } catch (error) {
        console.error(error.message);
      } finally {
        this.actionInProgress = false;
      }
    },
    async blockProfessional(id) {
      return await this.modifyProfessionalStatus(id, "block");
    },
    async unblockProfessional(id) {
      return await this.modifyProfessionalStatus(id, "unblock");
    },
    async deleteProfessional(id) {
      try {
        const response = await fetch(`/api/service_professionals/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.$store.state.auth_token,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to delete professional");
        }

        alert("Professional deleted successfully.");
        return true;
      } catch (error) {
        console.error(error.message);
        alert("Failed to delete professional: " + error.message);
        return false;
      }
    },
    async modifyProfessionalStatus(id, action) {
      try {
        const response = await fetch(
          `/api/service_professionals/${action}/${id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.$store.state.auth_token,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `Failed to ${action} professional`
          );
        }

        alert(`Professional ${action}ed successfully.`);
        return true;
      } catch (error) {
        console.error(`Error during ${action} action:`, error.message);
        alert(`Failed to ${action} professional: ${error.message}`);
        return false;
      }
    },
    async openModal(id, action) {
      this.currentProfessionalId = id;
      this.currentAction = action;
      this.modalLoading = true;
      this.modalError = null;

      // Show the modal first with loading state
      new bootstrap.Modal(document.getElementById("approveRejectModal")).show();

      try {
        const token = this.$store.state.auth_token;
        if (!token) throw new Error("No authentication token found");

        const response = await fetch(`/api/service_professionals/${id}`, {
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": token,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || "Failed to fetch professional details"
          );
        }

        const data = await response.json();
        this.modalData = {
          name: data.name,
          experience: data.experience,
          service: data.service_type,
          address: data.address,
          pincode: data.pin_code,
          document_url: data.document_url || null,
        };
      } catch (error) {
        console.error(error.message);
        this.modalError =
          error.message || "Failed to load professional details";
      } finally {
        this.modalLoading = false;
      }
    },
    async submitApprovalReject() {
      this.actionInProgress = true;

      try {
        const token = this.$store.state.auth_token;
        if (!token) throw new Error("No authentication token found");

        const response = await fetch(
          `/api/service_professionals/${this.currentAction}/${this.currentProfessionalId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": token,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || `Failed to ${this.currentAction} professional`
          );
        }

        alert(`Professional ${this.currentAction}d successfully.`);
        this.fetchProfessionals();
        bootstrap.Modal.getInstance(
          document.getElementById("approveRejectModal")
        ).hide();
      } catch (error) {
        console.error(error.message);
        alert(`Failed to ${this.currentAction} professional: ${error.message}`);
      } finally {
        this.actionInProgress = false;
      }
    },
  },
};
