export default {
  template: `
  <div class="container mt-4">
    <h2 class="text-center mb-4">Professional Dashboard</h2>
    
    <!-- Service Requests Tabs -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'pending' }" 
           @click="activeTab = 'pending'">Pending Requests</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'accepted' }" 
           @click="activeTab = 'accepted'">Accepted Requests</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'completed' }" 
           @click="activeTab = 'completed'">Completed Services</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'rejected' }" 
           @click="activeTab = 'rejected'">Rejected Services</a>
      </li>
    </ul>

    <!-- Pending Requests Table -->
    <div v-if="activeTab === 'pending'" class="table-responsive">
      <h3>Pending Service Requests</h3>
      <div v-if="pendingRequests.length > 0">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Customer Name</th>
              <th>Requested Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in pendingRequests" :key="request.id">
              <td>{{ request.id }}</td>
    <td>{{ request.customer.name }}</td> <!-- Update this line -->
              <td>{{ formatDate(request.requested_date) }}</td>
              <td>{{ request.service_status }}</td>
              <td>
                <button class="btn btn-primary btn-sm" @click="openAcceptRejectModal(request)">
                  View Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="alert alert-info mt-3">
        <p class="mb-0">No pending service requests available at the moment.</p>
      </div>
    </div>

    <!-- Accepted Requests Table -->
    <div v-if="activeTab === 'accepted'" class="table-responsive">
      <h3>Accepted Service Requests</h3>
      <div v-if="acceptedRequests.length > 0">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Customer Name</th>
              <th>Requested Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in acceptedRequests" :key="request.id">
              <td>{{ request.id }}</td>
    <td>{{ request.customer.name }}</td> <!-- Update this line -->
              <td>{{ formatDate(request.requested_date) }}</td>
              <td>{{ request.service_status }}</td>
              <td>
                <button class="btn btn-success btn-sm" @click="openCompleteModal(request)">
                  Mark Complete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="alert alert-info mt-3">
        <p class="mb-0">You haven't accepted any service requests yet.</p>
      </div>
    </div>

    <!-- Completed Services Table -->
    <div v-if="activeTab === 'completed'" class="table-responsive">
      <h3>Completed Services</h3>
      <div v-if="completedRequests.length > 0">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Customer Name</th>
              <th>Completion Date</th>
              <th>Status</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in completedRequests" :key="request.id">
              <td>{{ request.id }}</td>
              <td>{{ request.customer.name }}</td> <!-- Update this line -->
                <td>{{ formatDate(request.date_of_completion) }}</td>
              <td>{{ request.service_status }}</td>
              <td>{{ request.rating || 'Not rated yet' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="alert alert-info mt-3">
        <p class="mb-0">You haven't completed any services yet.</p>
      </div>
    </div>

    <!-- Rejected Services Table -->
    <div v-if="activeTab === 'rejected'" class="table-responsive">
      <h3>Rejected Services</h3>
      <div v-if="rejectedRequests.length > 0">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>Request ID</th>
              <th>Customer Name</th>
              <th>Requested Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in rejectedRequests" :key="request.id">
              <td>{{ request.id }}</td>
              <td>{{ request.customer.name }}</td>
              <td>{{ formatDate(request.requested_date) }}</td>
              <td>{{ request.service_status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="alert alert-info mt-3">
        <p class="mb-0">No rejected service requests to display.</p>
      </div>
    </div>

    <!-- Accept/Reject Service Modal -->
    <div class="modal fade" id="acceptRejectModal" tabindex="-1" aria-labelledby="acceptRejectModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content custom-modal">
          <div class="modal-header">
            <h5 class="modal-title" id="acceptRejectModalLabel">Accept/Reject Service Request</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p><strong>Customer Name:</strong> {{ currentRequest?.customer.name }}</p>
            <p><strong>Customer ID:</strong> {{ currentRequest?.customer_id }}</p>
            <p><strong>Address:</strong> {{ currentRequest?.customer.address }}</p>
            <p><strong>Requested Date:</strong> {{ formatDate(currentRequest?.requested_date) }}</p>
            <p><strong>Requested Time:</strong> {{ currentRequest?.requested_time }}</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-success" @click="acceptRequest(currentRequest.id)">Accept</button>
            <button type="button" class="btn btn-danger" @click="rejectRequest(currentRequest.id)">Reject</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Complete Service Modal -->
<div class="modal fade" id="completeServiceModal" tabindex="-1">
  <div class="modal-dialog">
    <div class="modal-content custom-modal">
      <div class="modal-header">
        <h5 class="modal-title">Close Service Request</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <p><strong>Service Name:</strong> <span>{{ modalServiceName }}</span></p>
        <p><strong>Customer Name:</strong> <span>{{ modalCustomerName }}</span></p>
        <p><strong>Customer ID:</strong> <span>{{ modalCustomerId }}</span></p>
        <p><strong>Address:</strong> <span>{{ modalAddress }}</span></p>

        <div class="mb-3">
          <label class="form-label">Customer Rating (1 to 5):</label>
          <input type="number" class="form-control" v-model="customerRating" step="0.1" min="1" max="5" required />
        </div>

        <div class="mb-3">
          <label class="form-label">Remarks:</label>
          <textarea class="form-control" v-model="customerRemark" rows="2" required></textarea>
        </div>

        <input type="hidden" v-model="requestId" />
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
          Close
        </button>
        <button type="button" class="btn btn-custom" @click="completeService">
          Submit
        </button>
      </div>
    </div>
  </div>
</div>

</div>

`,

  data() {
    return {
      activeTab: "pending",
      pendingRequests: [],
      acceptedRequests: [],
      completedRequests: [],
      rejectedRequests: [],
      currentRequest: null,
      completionNotes: "",
      acceptRejectModalVisible: false,
      modalServiceName: "",
      modalCustomerName: "",
      modalCustomerId: "",
      modalAddress: "",
      customerRating: "",
      customerRemark: "",
      requestId: "",
    };
  },

  created() {
    this.fetchServiceRequests();
  },
  // Add mounted hook to initialize modals
  mounted() {
    this.initializeModals();
    this.fetchServiceRequests();
  },
  methods: {
    initializeModals() {
      this.acceptRejectModal = new bootstrap.Modal(
        document.getElementById("acceptRejectModal")
      );
      this.completeModal = new bootstrap.Modal(
        document.getElementById("completeServiceModal")
      );
    },

    openAcceptRejectModal(request) {
      this.currentRequest = request;
      this.acceptRejectModal.show();
    },
    async fetchServiceRequests() {
      try {
        const professionalId = this.$store.state.professional.id;

        const profResponse = await fetch(
          `/api/service_professionals/${professionalId}`, // Changed from profId to professionalId
          {
            headers: {
              "Authentication-Token": this.$store.state.auth_token,
            },
          }
        );
        const profData = await profResponse.json();

        if (profData.block_status) {
          this.pendingRequests = [];
          this.acceptedRequests = [];
          this.completedRequests = [];
          alert(
            "Your account is currently blocked. You cannot receive new service requests."
          );
          return;
        }

        const response = await fetch(
          `/api/service_requests/professional/${professionalId}`,
          {
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.$store.state.auth_token,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch service requests");

        const requests = await response.json();
        this.pendingRequests = requests.filter(
          (req) => req.service_status === "requested"
        );
        this.acceptedRequests = requests.filter(
          (req) => req.service_status === "accepted"
        );
        this.completedRequests = requests.filter(
          (req) => req.service_status === "completed"
        );
        this.rejectedRequests = requests.filter(
          (req) => req.service_status === "rejected"
        );
      } catch (error) {
        this.handleError("Failed to load service requests", error);
      }
    },
    formatDate(dateString) {
      if (!dateString) return "Invalid date";

      // Remove microseconds and milliseconds
      const formattedDateString = dateString.split(".")[0];

      const date = new Date(formattedDateString);
      if (isNaN(date)) return "Invalid date"; // Check if the date is valid

      // Get the day, month, and year in the correct format
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
      const year = date.getFullYear();

      return `${day}-${month}-${year}`; // Return date in DD-MM-YYYY format
    },

    async acceptRequest(requestId) {
      try {
        const response = await fetch(
          `/api/service_requests/${requestId}/accept`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.$store.state.auth_token,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to accept request");

        this.acceptRejectModal.hide();
        await this.fetchServiceRequests();
        alert("Service request accepted successfully");
      } catch (error) {
        console.error("Error accepting request:", error);
        alert("Failed to accept service request");
      }
    },
    async rejectRequest(requestId) {
      try {
        const response = await fetch(
          `/api/service_requests/${requestId}/reject`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.$store.state.auth_token,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to reject request");

        this.acceptRejectModal.hide();
        await this.fetchServiceRequests();
        alert("Service request rejected successfully");
      } catch (error) {
        console.error("Error rejecting request:", error);
        alert("Failed to reject service request");
      }
    },
    openCompleteModal(request) {
      this.currentRequest = request;
      this.modalServiceName = request.service?.name || "N/A";
      this.modalCustomerName = request.customer?.name || "N/A";
      this.modalCustomerId = request.customer?.id || "N/A";
      this.modalAddress = request.customer?.address || "N/A";
      this.customerRating = null;
      this.customerRemark = "";
      this.requestId = request.id;

      let modal = new bootstrap.Modal(
        document.getElementById("completeServiceModal")
      );
      modal.show();
    },

    async completeService() {
      try {
        const response = await fetch(
          `/api/service_requests/${this.requestId}/close`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.$store.state.auth_token,
            },
            body: JSON.stringify({
              customerRating: this.customerRating,
              customerRemark: this.customerRemark,
            }),
          }
        );

        if (!response.ok) throw new Error("Failed to complete service");

        alert("Service marked as complete successfully");
        this.fetchServiceRequests();
        let modal = bootstrap.Modal.getInstance(
          document.getElementById("completeServiceModal")
        );
        modal.hide();
      } catch (error) {
        this.handleError("Failed to complete service", error);
      }
    },

    async updateRequestStatus(endpoint, successMessage) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.$store.state.auth_token,
          },
        });

        if (!response.ok) throw new Error(successMessage);

        this.acceptRejectModal.hide();
        await this.fetchServiceRequests();
        alert(successMessage);
      } catch (error) {
        this.handleError("Failed to update service request status", error);
      }
    },
    handleError(message, error) {
      console.error(message, error);
      alert(message);
    },
  },
};
