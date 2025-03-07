export default {
  template: `
  <div id="all-professionals-page" class="container mt-5">
    <div class="header-section mb-4">
      <h2 class="text-center">All Professionals</h2>
    </div>
    
    <div class="card table-custom-card">
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
                  <span class="stars">★</span>
                  <span>{{ professional.average_rating }}</span>
                </div>
                <span v-else>N/A</span>
              </td>
              <td class="action-buttons">
                <template v-if="professional.verified_status === 'approved'">
                  <button class="btn btn-danger-custom btn-sm me-1" @click="blockProfessional(professional.id)">
                    <i class="fas fa-ban me-1"></i> Block
                  </button>
                  <button class="btn btn-success-custom btn-sm me-1" @click="unblockProfessional(professional.id)">
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
                <button class="btn btn-danger-custom btn-sm" @click="deleteProfessional(professional.id)">
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
            <div class="professional-info-card p-3 mb-3 rounded">
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
            <button class="btn btn-custom" @click="submitApprovalReject">
              <i class="fas fa-check me-1"></i> Confirm {{ currentAction }}
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
    async fetchProfessionals() {
      try {
        const token = this.$store.state.auth_token;
        if (!token) throw new Error("No authentication token found");

        const response = await fetch("/api/service_professionals", {
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": token,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch professionals");

        this.professionals = await response.json();
      } catch (error) {
        console.error("Error fetching professionals:", error.message);
      }
    },
    async blockProfessional(id) {
      await this.modifyProfessionalStatus(id, "block");
    },
    async unblockProfessional(id) {
      await this.modifyProfessionalStatus(id, "unblock");
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
        if (!response.ok) throw new Error("Failed to delete professional");

        this.fetchProfessionals();
        alert("Professional deleted successfully.");
      } catch (error) {
        console.error(error.message);
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
        if (!response.ok) throw new Error(`Failed to ${action} professional`);

        this.fetchProfessionals(); // Re-fetch the professionals to get the updated status
        alert(`Professional ${action}d successfully.`);
      } catch (error) {
        console.error("Error during unblock action:", error.message); // Log error details
        alert(`Failed to ${action} professional.`);
      }
    },
    async openModal(id, action) {
      this.currentProfessionalId = id;
      this.currentAction = action;
      console.log(id, action);

      try {
        const token = this.$store.state.auth_token;
        if (!token) throw new Error("No authentication token found");

        const response = await fetch(`/api/service_professionals/${id}`, {
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": token,
          },
        });

        if (!response.ok)
          throw new Error("Failed to fetch professional details");

        const data = await response.json();
        this.modalData = {
          name: data.name,
          experience: data.experience,
          service: data.service_type,
          address: data.address,
          pincode: data.pin_code,
          document_url: data.document_url || null,
        };

        new bootstrap.Modal(
          document.getElementById("approveRejectModal")
        ).show();
      } catch (error) {
        console.error(error.message);
      }
    },
    async submitApprovalReject() {
      try {
        const token = this.$store.state.auth_token;
        if (!token) throw new Error("No authentication token found");
        console.log(this.currentAction, this.currentProfessionalId);
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

        if (!response.ok)
          throw new Error(`Failed to ${this.currentAction} professional`);

        alert(`Professional ${this.currentAction}d successfully.`);
        this.fetchProfessionals();
        bootstrap.Modal.getInstance(
          document.getElementById("approveRejectModal")
        ).hide();
      } catch (error) {
        console.error(error.message);
      }
    },
  },
};
