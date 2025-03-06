// export default {
//   template: `
//   <div class="container mt-4">
//     <h2 class="text-center mb-4">Professional Dashboard</h2>
//           <!-- Display Blocked/Unverified Message -->
//     <div v-if="statusMessage" class="alert alert-warning text-center">
//     {{ statusMessage }}
//   </div>
//     <!-- Service Requests Tabs -->
//     <ul class="nav nav-tabs mb-4">
//       <li class="nav-item">
//         <a class="nav-link" :class="{ active: activeTab === 'Pending' }"
//            @click="activeTab = 'Pending'">Pending Requests</a>
//       </li>
//       <li class="nav-item">
//         <a class="nav-link" :class="{ active: activeTab === 'accepted' }"
//            @click="activeTab = 'accepted'">Accepted Requests</a>
//       </li>
//       <li class="nav-item">
//         <a class="nav-link" :class="{ active: activeTab === 'Completed' }"
//            @click="activeTab = 'Completed'">Completed Services</a>
//       </li>
//       <li class="nav-item">
//         <a class="nav-link" :class="{ active: activeTab === 'rejected' }"
//            @click="activeTab = 'rejected'">Rejected Services</a>
//       </li>
//     </ul>

//     <!-- Pending Requests Table -->
//     <div v-if="activeTab === 'Pending'" class="table-responsive">
//       <h3>Pending Service Requests</h3>
//       <div v-if="pendingRequests.length > 0">
//         <table class="table table-striped">
//           <thead>
//             <tr>
//               <th>Request ID</th>
//               <th>Customer Name</th>
//               <th>Requested Date</th>
//               <th>Status</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr v-for="request in pendingRequests" :key="request.id">
//               <td>{{ request.id }}</td>
//     <td>{{ request.customer.name }}</td> <!-- Update this line -->
//               <td>{{ formatDate(request.requested_date) }}</td>
//               <td>{{ request.service_status }}</td>
//               <td>
//                 <button class="btn btn-primary btn-sm" @click="openAcceptRejectModal(request)">
//                   View Details
//                 </button>
//               </td>
//             </tr>
//           </tbody>
//         </table>
//       </div>
//       <div v-else class="alert alert-info mt-3">
//         <p class="mb-0">No Pending service requests available at the moment.</p>
//       </div>
//     </div>

//     <!-- Accepted Requests Table -->
//     <div v-if="activeTab === 'accepted'" class="table-responsive">
//       <h3>Accepted Service Requests</h3>
//       <div v-if="acceptedRequests.length > 0">
//         <table class="table table-striped">
//           <thead>
//             <tr>
//               <th>Request ID</th>
//               <th>Customer Name</th>
//               <th>Requested Date</th>
//               <th>Status</th>
//               <th>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr v-for="request in acceptedRequests" :key="request.id">
//               <td>{{ request.id }}</td>
//     <td>{{ request.customer.name }}</td> <!-- Update this line -->
//               <td>{{ formatDate(request.requested_date) }}</td>
//               <td>{{ request.service_status }}</td>
//               <td>
//                 <button class="btn btn-success btn-sm" @click="openCompleteModal(request)">
//                   Mark Complete
//                 </button>
//               </td>
//             </tr>
//           </tbody>
//         </table>
//       </div>
//       <div v-else class="alert alert-info mt-3">
//         <p class="mb-0">You haven't accepted any service requests yet.</p>
//       </div>
//     </div>

//     <!-- Completed Services Table -->
//     <div v-if="activeTab === 'Completed'" class="table-responsive">
//       <h3>Completed Services</h3>
//       <div v-if="completedRequests.length > 0">
//         <table class="table table-striped">
//           <thead>
//             <tr>
//               <th>Request ID</th>
//               <th>Customer Name</th>
//               <th>Completion Date</th>
//               <th>Status</th>
//               <th>Rating</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr v-for="request in completedRequests" :key="request.id">
//               <td>{{ request.id }}</td>
//               <td>{{ request.customer.name }}</td> <!-- Update this line -->
//                 <td>{{ formatDate(request.date_of_completion) }}</td>
//               <td>{{ request.service_status }}</td>
//               <td>{{ request.rating || 'Not rated yet' }}</td>
//             </tr>
//           </tbody>
//         </table>
//       </div>
//       <div v-else class="alert alert-info mt-3">
//         <p class="mb-0">You haven't Completed any services yet.</p>
//       </div>
//     </div>

//     <!-- Rejected Services Table -->
//     <div v-if="activeTab === 'rejected'" class="table-responsive">
//       <h3>Rejected Services</h3>
//       <div v-if="rejectedRequests.length > 0">
//         <table class="table table-striped">
//           <thead>
//             <tr>
//               <th>Request ID</th>
//               <th>Customer Name</th>
//               <th>Requested Date</th>
//               <th>Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             <tr v-for="request in rejectedRequests" :key="request.id">
//               <td>{{ request.id }}</td>
//               <td>{{ request.customer.name }}</td>
//               <td>{{ formatDate(request.requested_date) }}</td>
//               <td>{{ request.service_status }}</td>
//             </tr>
//           </tbody>
//         </table>
//       </div>
//       <div v-else class="alert alert-info mt-3">
//         <p class="mb-0">No rejected service requests to display.</p>
//       </div>
//     </div>

//     <!-- Accept/Reject Service Modal -->
//     <div class="modal fade" id="acceptRejectModal" tabindex="-1" aria-labelledby="acceptRejectModalLabel" aria-hidden="true">
//       <div class="modal-dialog">
//         <div class="modal-content custom-modal">
//           <div class="modal-header">
//             <h5 class="modal-title" id="acceptRejectModalLabel">Accept/Reject Service Request</h5>
//             <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
//           </div>
//           <div class="modal-body">
//             <p><strong>Customer Name:</strong> {{ currentRequest?.customer.name }}</p>
//             <p><strong>Customer ID:</strong> {{ currentRequest?.customer_id }}</p>
//             <p><strong>Address:</strong> {{ currentRequest?.customer.address }}</p>
//             <p><strong>Requested Date:</strong> {{ formatDate(currentRequest?.requested_date) }}</p>
//             <p><strong>Requested Time:</strong> {{ currentRequest?.requested_time }}</p>
//           </div>
//           <div class="modal-footer">
//             <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
//             <button type="button" class="btn btn-success" @click="acceptRequest(currentRequest.id)">Accept</button>
//             <button type="button" class="btn btn-danger" @click="rejectRequest(currentRequest.id)">Reject</button>
//           </div>
//         </div>
//       </div>
//     </div>

//     <!-- Complete Service Modal -->
// <div class="modal fade" id="completeServiceModal" tabindex="-1">
//   <div class="modal-dialog">
//     <div class="modal-content custom-modal">
//       <div class="modal-header">
//         <h5 class="modal-title">Close Service Request</h5>
//         <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
//       </div>
//       <div class="modal-body">
//         <p><strong>Service Name:</strong> <span>{{ modalServiceName }}</span></p>
//         <p><strong>Customer Name:</strong> <span>{{ modalCustomerName }}</span></p>
//         <p><strong>Customer ID:</strong> <span>{{ modalCustomerId }}</span></p>
//         <p><strong>Address:</strong> <span>{{ modalAddress }}</span></p>

//         <div class="mb-3">
//           <label class="form-label">Customer Rating (1 to 5):</label>
//           <input type="number" class="form-control" v-model="customerRating" step="0.1" min="1" max="5" required />
//         </div>

//         <div class="mb-3">
//           <label class="form-label">Remarks:</label>
//           <textarea class="form-control" v-model="customerRemark" rows="2" required></textarea>
//         </div>

//         <input type="hidden" v-model="requestId" />
//       </div>
//       <div class="modal-footer">
//         <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
//           Close
//         </button>
//         <button type="button" class="btn btn-custom" @click="validateAndSubmit">
//           Submit
//         </button>
//       </div>
//     </div>
//   </div>
// </div>

// </div>

// `,

//   data() {
//     return {
//       activeTab: "Pending",
//       pendingRequests: [],
//       acceptedRequests: [],
//       completedRequests: [],
//       rejectedRequests: [],
//       currentRequest: null,
//       completionNotes: "",
//       acceptRejectModalVisible: false,
//       modalServiceName: "",
//       modalCustomerName: "",
//       modalCustomerId: "",
//       modalAddress: "",
//       customerRating: "",
//       customerRemark: "",
//       requestId: "",
//       statusMessage: "", // Holds the block/unverified message
//     };
//   },

//   created() {
//     this.fetchServiceRequests();
//   },
//   // Add mounted hook to initialize modals
//   mounted() {
//     this.initializeModals();
//     this.fetchServiceRequests();
//   },
//   methods: {
//     initializeModals() {
//       this.acceptRejectModal = new bootstrap.Modal(
//         document.getElementById("acceptRejectModal")
//       );
//       this.completeModal = new bootstrap.Modal(
//         document.getElementById("completeServiceModal")
//       );
//     },

//     openAcceptRejectModal(request) {
//       this.currentRequest = request;
//       this.acceptRejectModal.show();
//     },
//     async fetchServiceRequests() {
//       try {
//         const professionalId = this.$store.state.professional.id;

//         const profResponse = await fetch(
//           `/api/service_professionals/${professionalId}`, // Changed from profId to professionalId
//           {
//             headers: {
//               "Authentication-Token": this.$store.state.auth_token,
//             },
//           }
//         );
//         const profData = await profResponse.json();

//         if (profData.block_status) {
//           this.pendingRequests = [];
//           this.acceptedRequests = [];
//           this.completedRequests = [];
//           this.statusMessage =
//             "Your account is blocked by the admin. You cannot receive service requests.";
//           return;
//         }
//         if (!profData.verified_status === "approved") {
//           this.statusMessage =
//             "Your account needs to be verified by the admin before accepting service requests.";
//           return;
//         }

//         const response = await fetch(
//           `/api/service_requests/professional/${professionalId}`,
//           {
//             headers: {
//               "Content-Type": "application/json",
//               "Authentication-Token": this.$store.state.auth_token,
//             },
//           }
//         );
//         if (!response.ok) throw new Error("Failed to fetch service requests");

//         const requests = await response.json();
//         this.pendingRequests = requests.filter(
//           (req) => req.service_status === "requested"
//         );
//         this.acceptedRequests = requests.filter(
//           (req) => req.service_status === "accepted"
//         );
//         this.completedRequests = requests.filter(
//           (req) => req.service_status === "Completed"
//         );
//         this.rejectedRequests = requests.filter(
//           (req) => req.service_status === "rejected"
//         );
//       } catch (error) {
//         this.handleError("Failed to load service requests", error);
//       }
//     },
//     formatDate(dateString) {
//       if (!dateString) return "Invalid date";

//       // Remove microseconds and milliseconds
//       const formattedDateString = dateString.split(".")[0];

//       const date = new Date(formattedDateString);
//       if (isNaN(date)) return "Invalid date"; // Check if the date is valid

//       // Get the day, month, and year in the correct format
//       const day = String(date.getDate()).padStart(2, "0");
//       const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
//       const year = date.getFullYear();

//       return `${day}-${month}-${year}`; // Return date in DD-MM-YYYY format
//     },

//     async acceptRequest(requestId) {
//       try {
//         const response = await fetch(
//           `/api/service_requests/${requestId}/accept`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               "Authentication-Token": this.$store.state.auth_token,
//             },
//           }
//         );

//         if (!response.ok) throw new Error("Failed to accept request");

//         this.acceptRejectModal.hide();
//         await this.fetchServiceRequests();
//         alert("Service request accepted successfully");
//       } catch (error) {
//         console.error("Error accepting request:", error);
//         alert("Failed to accept service request");
//       }
//     },
//     async rejectRequest(requestId) {
//       try {
//         const response = await fetch(
//           `/api/service_requests/${requestId}/reject`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               "Authentication-Token": this.$store.state.auth_token,
//             },
//           }
//         );

//         if (!response.ok) throw new Error("Failed to reject request");

//         this.acceptRejectModal.hide();
//         await this.fetchServiceRequests();
//         alert("Service request rejected successfully");
//       } catch (error) {
//         console.error("Error rejecting request:", error);
//         alert("Failed to reject service request");
//       }
//     },
//     openCompleteModal(request) {
//       this.currentRequest = request;
//       this.modalServiceName = request.service?.name || "N/A";
//       this.modalCustomerName = request.customer?.name || "N/A";
//       this.modalCustomerId = request.customer?.id || "N/A";
//       this.modalAddress = request.customer?.address || "N/A";
//       this.customerRating = null;
//       this.customerRemark = "";
//       this.requestId = request.id;

//       let modal = new bootstrap.Modal(
//         document.getElementById("completeServiceModal")
//       );
//       modal.show();
//     },
//     // Validate the rating and show an alert if it is out of range
//     validateAndSubmit() {
//       if (this.customerRating < 1 || this.customerRating > 5) {
//         alert("Please enter a rating between 1 and 5.");
//         return; // Prevent submission if the rating is out of range
//       }
//       this.completeService(); // Proceed to submit the form if validation passes
//     },
//     async completeService() {
//       try {
//         const response = await fetch(
//           `/api/service_requests/${this.requestId}/close`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               "Authentication-Token": this.$store.state.auth_token,
//             },
//             body: JSON.stringify({
//               customerRating: this.customerRating,
//               customerRemark: this.customerRemark,
//             }),
//           }
//         );

//         if (!response.ok) throw new Error("Failed to complete service");

//         alert("Service marked as complete successfully");
//         this.fetchServiceRequests();
//         let modal = bootstrap.Modal.getInstance(
//           document.getElementById("completeServiceModal")
//         );
//         modal.hide();
//       } catch (error) {
//         this.handleError("Failed to complete service", error);
//       }
//     },

//     async updateRequestStatus(endpoint, successMessage) {
//       try {
//         const response = await fetch(endpoint, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "Authentication-Token": this.$store.state.auth_token,
//           },
//         });

//         if (!response.ok) throw new Error(successMessage);

//         this.acceptRejectModal.hide();
//         await this.fetchServiceRequests();
//         alert(successMessage);
//       } catch (error) {
//         this.handleError("Failed to update service request status", error);
//       }
//     },
//     handleError(message, error) {
//       console.error(message, error);
//       alert(message);
//     },
//   },
// };

export default {
  template: `
  <div class="container mt-5">
    <div class="card shadow-sm border-0 mb-5">
      <div class="card-body p-4">
        <h2 class="text-center mb-4 fw-bold text-primary">Professional Dashboard</h2>
        
        <!-- Display Blocked/Unverified Message -->
        <div v-if="statusMessage" class="alert alert-warning text-center mb-4 border-0 bg-light">
          <i class="bi bi-exclamation-triangle me-2"></i> {{ statusMessage }}
        </div>
        
        <!-- Service Requests Tabs -->
        <ul class="nav nav-tabs mb-4 border-bottom">
          <li class="nav-item">
            <a class="nav-link px-4" :class="{ 'active fw-semibold': activeTab === 'Pending', 'text-muted': activeTab !== 'Pending' }" 
              @click="activeTab = 'Pending'">
              <i class="bi bi-hourglass me-1"></i> Pending
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link px-4" :class="{ 'active fw-semibold': activeTab === 'accepted', 'text-muted': activeTab !== 'accepted' }" 
              @click="activeTab = 'accepted'">
              <i class="bi bi-check-circle me-1"></i> Accepted
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link px-4" :class="{ 'active fw-semibold': activeTab === 'Completed', 'text-muted': activeTab !== 'Completed' }" 
              @click="activeTab = 'Completed'">
              <i class="bi bi-trophy me-1"></i> Completed
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link px-4" :class="{ 'active fw-semibold': activeTab === 'rejected', 'text-muted': activeTab !== 'rejected' }" 
              @click="activeTab = 'rejected'">
              <i class="bi bi-x-circle me-1"></i> Rejected
            </a>
          </li>
        </ul>

        <!-- Pending Requests Table -->
        <div v-if="activeTab === 'Pending'" class="table-responsive">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h3 class="h4 fw-semibold text-secondary mb-0">Pending Service Requests</h3>
            <span class="badge bg-primary rounded-pill">{{ pendingRequests.length }}</span>
          </div>
          
          <div v-if="pendingRequests.length > 0">
            <table class="table table-hover border-top">
              <thead class="table-light">
                <tr>
                  <th scope="col" class="text-nowrap">Request ID</th>
                  <th scope="col">Customer Name</th>
                  <th scope="col">Requested Date</th>
                  <th scope="col">Status</th>
                  <th scope="col" class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="request in pendingRequests" :key="request.id">
                  <td class="text-muted">#{{ request.id }}</td>
                  <td>{{ request.customer.name }}</td>
                  <td>{{ formatDate(request.requested_date) }}</td>
                  <td><span class="badge bg-warning text-dark">{{ request.service_status }}</span></td>
                  <td class="text-center">
                    <button class="btn btn-outline-primary btn-sm" @click="openAcceptRejectModal(request)">
                      <i class="bi bi-eye me-1"></i> View Details
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="alert alert-light border rounded p-4 mt-3 text-center">
            <i class="bi bi-inbox-fill fs-3 d-block mb-2 text-muted"></i>
            <p class="mb-0 text-muted">No pending service requests available at the moment.</p>
          </div>
        </div>

        <!-- Accepted Requests Table -->
        <div v-if="activeTab === 'accepted'" class="table-responsive">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h3 class="h4 fw-semibold text-secondary mb-0">Accepted Service Requests</h3>
            <span class="badge bg-success rounded-pill">{{ acceptedRequests.length }}</span>
          </div>
          
          <div v-if="acceptedRequests.length > 0">
            <table class="table table-hover border-top">
              <thead class="table-light">
                <tr>
                  <th scope="col" class="text-nowrap">Request ID</th>
                  <th scope="col">Customer Name</th>
                  <th scope="col">Requested Date</th>
                  <th scope="col">Status</th>
                  <th scope="col" class="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="request in acceptedRequests" :key="request.id">
                  <td class="text-muted">#{{ request.id }}</td>
                  <td>{{ request.customer.name }}</td>
                  <td>{{ formatDate(request.requested_date) }}</td>
                  <td><span class="badge bg-success">{{ request.service_status }}</span></td>
                  <td class="text-center">
                    <button class="btn btn-outline-success btn-sm" @click="openCompleteModal(request)">
                      <i class="bi bi-check2-circle me-1"></i> Mark Complete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="alert alert-light border rounded p-4 mt-3 text-center">
            <i class="bi bi-clipboard-check fs-3 d-block mb-2 text-muted"></i>
            <p class="mb-0 text-muted">You haven't accepted any service requests yet.</p>
          </div>
        </div>

        <!-- Completed Services Table -->
        <div v-if="activeTab === 'Completed'" class="table-responsive">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h3 class="h4 fw-semibold text-secondary mb-0">Completed Services</h3>
            <span class="badge bg-info rounded-pill">{{ completedRequests.length }}</span>
          </div>
          
          <div v-if="completedRequests.length > 0">
            <table class="table table-hover border-top">
              <thead class="table-light">
                <tr>
                  <th scope="col" class="text-nowrap">Request ID</th>
                  <th scope="col">Customer Name</th>
                  <th scope="col">Completion Date</th>
                  <th scope="col">Status</th>
                  <th scope="col">Rating</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="request in completedRequests" :key="request.id">
                  <td class="text-muted">#{{ request.id }}</td>
                  <td>{{ request.customer.name }}</td>
                  <td>{{ formatDate(request.date_of_completion) }}</td>
                  <td><span class="badge bg-info text-dark">{{ request.service_status }}</span></td>
                  <td>
                    <div v-if="request.rating">
                      <span class="text-warning">
                        <i v-for="n in Math.floor(request.rating)" class="bi bi-star-fill"></i>
                        <i v-if="request.rating % 1 >= 0.5" class="bi bi-star-half"></i>
                        <i v-for="n in Math.floor(5 - request.rating)" class="bi bi-star"></i>
                      </span>
                      <span class="ms-1 text-muted">({{ request.rating }})</span>
                    </div>
                    <span v-else class="text-muted fst-italic">Not rated yet</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="alert alert-light border rounded p-4 mt-3 text-center">
            <i class="bi bi-trophy fs-3 d-block mb-2 text-muted"></i>
            <p class="mb-0 text-muted">You haven't completed any services yet.</p>
          </div>
        </div>

        <!-- Rejected Services Table -->
        <div v-if="activeTab === 'rejected'" class="table-responsive">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h3 class="h4 fw-semibold text-secondary mb-0">Rejected Services</h3>
            <span class="badge bg-danger rounded-pill">{{ rejectedRequests.length }}</span>
          </div>
          
          <div v-if="rejectedRequests.length > 0">
            <table class="table table-hover border-top">
              <thead class="table-light">
                <tr>
                  <th scope="col" class="text-nowrap">Request ID</th>
                  <th scope="col">Customer Name</th>
                  <th scope="col">Requested Date</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="request in rejectedRequests" :key="request.id">
                  <td class="text-muted">#{{ request.id }}</td>
                  <td>{{ request.customer.name }}</td>
                  <td>{{ formatDate(request.requested_date) }}</td>
                  <td><span class="badge bg-danger">{{ request.service_status }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="alert alert-light border rounded p-4 mt-3 text-center">
            <i class="bi bi-x-octagon fs-3 d-block mb-2 text-muted"></i>
            <p class="mb-0 text-muted">No rejected service requests to display.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Accept/Reject Service Modal -->
    <div class="modal fade" id="acceptRejectModal" tabindex="-1" aria-labelledby="acceptRejectModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow custom-modal">
          <div class="modal-header bg-light">
            <h5 class="modal-title fw-bold" id="acceptRejectModalLabel">Service Request Details</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body p-4">
            <div class="mb-3 p-3 bg-light rounded">
              <div class="row mb-2">
                <div class="col-5 text-muted">Customer Name:</div>
                <div class="col-7 fw-semibold">{{ currentRequest?.customer.name }}</div>
              </div>
              <div class="row mb-2">
                <div class="col-5 text-muted">Customer ID:</div>
                <div class="col-7">{{ currentRequest?.customer_id }}</div>
              </div>
              <div class="row mb-2">
                <div class="col-5 text-muted">Address:</div>
                <div class="col-7">{{ currentRequest?.customer.address }}</div>
              </div>
              <div class="row mb-2">
                <div class="col-5 text-muted">Requested Date:</div>
                <div class="col-7">{{ formatDate(currentRequest?.requested_date) }}</div>
              </div>
              <div class="row">
                <div class="col-5 text-muted">Requested Time:</div>
                <div class="col-7">{{ currentRequest?.requested_time }}</div>
              </div>
            </div>
          </div>
          <div class="modal-footer border-top-0">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-success" @click="acceptRequest(currentRequest.id)">
              <i class="bi bi-check-circle me-1"></i> Accept
            </button>
            <button type="button" class="btn btn-danger" @click="rejectRequest(currentRequest.id)">
              <i class="bi bi-x-circle me-1"></i> Reject
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Complete Service Modal -->
    <div class="modal fade" id="completeServiceModal" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow custom-modal">
          <div class="modal-header bg-light">
            <h5 class="modal-title fw-bold">Mark Service as Complete</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-4">
            <div class="mb-4 p-3 bg-light rounded">
              <div class="row mb-2">
                <div class="col-5 text-muted">Service Name:</div>
                <div class="col-7 fw-semibold">{{ modalServiceName }}</div>
              </div>
              <div class="row mb-2">
                <div class="col-5 text-muted">Customer Name:</div>
                <div class="col-7">{{ modalCustomerName }}</div>
              </div>
              <div class="row mb-2">
                <div class="col-5 text-muted">Customer ID:</div>
                <div class="col-7">{{ modalCustomerId }}</div>
              </div>
              <div class="row">
                <div class="col-5 text-muted">Address:</div>
                <div class="col-7">{{ modalAddress }}</div>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">Customer Rating (1 to 5):</label>
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-star-fill text-warning"></i></span>
                <input type="number" class="form-control" v-model="customerRating" step="0.1" min="1" max="5" required />
              </div>
              <small class="text-muted">Please enter a value between 1 and 5</small>
            </div>

            <div class="mb-3">
              <label class="form-label fw-semibold">Remarks:</label>
              <textarea class="form-control" v-model="customerRemark" rows="3" placeholder="Enter your comments about the service..." required></textarea>
            </div>

            <input type="hidden" v-model="requestId" />
          </div>
          <div class="modal-footer border-top-0">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              Cancel
            </button>
            <button type="button" class="btn btn-primary" @click="validateAndSubmit">
              <i class="bi bi-check2-all me-1"></i> Complete Service
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,

  data() {
    return {
      activeTab: "Pending",
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
      statusMessage: "", // Holds the block/unverified message
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
          this.statusMessage =
            "Your account is blocked by the admin. You cannot receive service requests.";
          return;
        }
        if (!profData.verified_status === "approved") {
          this.statusMessage =
            "Your account needs to be verified by the admin before accepting service requests.";
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
          (req) => req.service_status === "Completed"
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
    // Validate the rating and show an alert if it is out of range
    validateAndSubmit() {
      if (this.customerRating < 1 || this.customerRating > 5) {
        alert("Please enter a rating between 1 and 5.");
        return; // Prevent submission if the rating is out of range
      }
      this.completeService(); // Proceed to submit the form if validation passes
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
