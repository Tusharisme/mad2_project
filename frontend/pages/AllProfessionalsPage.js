export default {
  template: `
  <div id="all-professionals-page" class="container">
    <h2 class="text-center">All Professionals</h2>
    <div v-if="professionals.length > 0" class="mt-3">
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
              <a :href="'/professional_details/' + professional.id">{{ professional.id }}</a>
            </td>
            <td>{{ professional.name }}</td>
            <td>{{ professional.verified_status }}</td>
            <td>{{ professional.block_status ? 'Blocked' : 'Not Blocked' }}</td>
            <td>{{ professional.experience }}</td>
            <td>{{ professional.average_rating || 'N/A' }}</td>
            <td>
              <template v-if="professional.verified_status === 'approved'">
                <button class="btn btn-danger-custom" @click="blockProfessional(professional.id)">
                  Block
                </button>
                <button class="btn btn-success-custom" @click="unblockProfessional(professional.id)">
                  Unblock
                </button>
              </template>
              <template v-else>
                <button class="btn btn-success-custom" @click="openModal(professional.id, 'approve')">
                  Approve
                </button>
                <button class="btn btn-warning" @click="openModal(professional.id, 'reject')">
                  Reject
                </button>
              </template>
              <button class="btn btn-danger-custom" @click="deleteProfessional(professional.id)">
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="mt-3">
      <p>No professionals available.</p>
    </div>

    <!-- Approve/Reject Modal -->
    <div class="modal fade" id="approveRejectModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content custom-modal">
          <div class="modal-header">
            <h5 class="modal-title">Professional Approval/Rejection</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p><b>Professional Name:</b> {{ modalData.name }}</p>
            <p><b>Experience:</b> {{ modalData.experience }} years</p>
            <p><b>Service:</b> {{ modalData.service }}</p>
            <p><b>Address:</b> {{ modalData.address }}</p>
            <p><b>Pincode:</b> {{ modalData.pincode }}</p>
            <!-- Document URL -->
        <p><strong>Document:</strong> 
        <span v-if="modalData.document_url">
          <a :href="modalData.document_url" target="_blank" rel="noopener noreferrer">View Document</a>
        </span>
        <span v-else>N/A</span>
      </p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button class="btn btn-custom" @click="submitApprovalReject">
              Confirm
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
      },
    };
  },
  created() {
    this.fetchProfessionals();
  },
  methods: {
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
          document_url: data.document_url || null, // Add this line
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
