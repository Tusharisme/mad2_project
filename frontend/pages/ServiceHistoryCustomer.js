// export default {
//   template: `
//   <div class="container mt-4">
//       <h2 class="text-center mb-4">Customer Service History</h2>

//       <!-- Service History Tabs -->
//       <ul class="nav nav-tabs mb-4">
//           <li class="nav-item">
//               <a class="nav-link" :class="{ active: activeTab === 'Pending' }" @click="activeTab = 'Pending'">Pending
//                   Requests</a>
//           </li>
//           <li class="nav-item">
//               <a class="nav-link" :class="{ active: activeTab === 'accepted' }" @click="activeTab = 'accepted'">Accepted
//                   Requests</a>
//           </li>
//           <li class="nav-item">
//               <a class="nav-link" :class="{ active: activeTab === 'Completed' }"
//                   @click="activeTab = 'Completed'">Completed Services</a>
//           </li>
//           <li class="nav-item">
//               <a class="nav-link" :class="{ active: activeTab === 'rejected' }" @click="activeTab = 'rejected'">Rejected
//                   Services</a>
//           </li>
//       </ul>

//             <!-- Pending Requests Table -->
//             <div v-if="activeTab === 'Pending'" class="table-responsive">
//             <h3>Pending Service Requests</h3>
//             <div v-if="pendingRequests.length > 0">
//                 <table class="table table-striped">
//                     <thead>
//                         <tr>
//                             <th>Request ID</th>
//                             <th>Service Name</th>
//                             <th>Requested Date</th>
//                             <th>Status</th>
//                             <th>Action</th> <!-- New column for Cancel Button -->
//                         </tr>
//                     </thead>
//                     <tbody>
//                         <tr v-for="request in pendingRequests" :key="request.id">
//                             <td>{{ request.id }}</td>
//                             <td>{{ request.service.name }}</td>
//                             <td>{{ formatDate(request.requested_date) }}</td>
//                             <td>{{ request.service_status }}</td>
//                             <td>
//                                 <button class="btn btn-danger" @click="cancelService(request.id)">
//                                     Cancel
//                                 </button>
//                             </td>
//                         </tr>
//                     </tbody>
//                 </table>
//             </div>
//             <div v-else class="alert alert-info mt-3">
//                 <p class="mb-0">No Pending service requests available.</p>
//             </div>
//         </div>

//       <!-- Accepted Requests Table -->
//       <div v-if="activeTab === 'accepted'" class="table-responsive">
//           <h3>Accepted Service Requests</h3>
//           <div v-if="acceptedRequests.length > 0">
//               <table class="table table-striped">
//                   <thead>
//                       <tr>
//                           <th>Request ID</th>
//                           <th>Service Name</th>
//                           <th>Requested Date</th>
//                           <th>Status</th>
//                       </tr>
//                   </thead>
//                   <tbody>
//                       <tr v-for="request in acceptedRequests" :key="request.id">
//                           <td>{{ request.id }}</td>
//                           <td>{{ request.service.name }}</td>
//                           <td>{{ formatDate(request.requested_date) }}</td>
//                           <td>{{ request.service_status }}</td>
//                       </tr>
//                   </tbody>
//               </table>
//           </div>
//           <div v-else class="alert alert-info mt-3">
//               <p class="mb-0">No accepted service requests yet.</p>
//           </div>
//       </div>

//       <!-- Completed Services Table -->
//       <div v-if="activeTab === 'Completed'" class="table-responsive">
//           <h3>Completed Services</h3>
//           <div v-if="completedRequests.length > 0">
//               <table class="table table-striped">
//                   <thead>
//                       <tr>
//                           <th>Request ID</th>
//                           <th>Service Name</th>
//                           <th>Completion Date</th>
//                           <th>Rating</th>
//                           <th>Action</th> <!-- Added Action column -->
//                       </tr>
//                   </thead>
//                   <tbody>
//                       <tr v-for="request in completedRequests" :key="request.id">
//                           <td>{{ request.id }}</td>
//                           <td>{{ request.service.name }}</td>
//                           <td>{{ formatDate(request.date_of_completion) }}</td>
//                           <td>{{ request.rating || 'Not rated yet' }}</td>
//                           <td>
//                               <button v-if="!request.rating" class="btn btn-primary" @click="openCompleteServiceModal(request.id)">
//                                   Rate Service
//                               </button>
//                           </td>
//                       </tr>
//                   </tbody>
//               </table>
//           </div>
//           <div v-else class="alert alert-info mt-3">
//               <p class="mb-0">No Completed services yet.</p>
//           </div>
//       </div>

//       <!-- Rejected Services Table -->
//       <div v-if="activeTab === 'rejected'" class="table-responsive">
//           <h3>Rejected Services</h3>
//           <div v-if="rejectedRequests.length > 0">
//               <table class="table table-striped">
//                   <thead>
//                       <tr>
//                           <th>Request ID</th>
//                           <th>Service Name</th>
//                           <th>Requested Date</th>
//                           <th>Status</th>
//                       </tr>
//                   </thead>
//                   <tbody>
//                       <tr v-for="request in rejectedRequests" :key="request.id">
//                           <td>{{ request.id }}</td>
//                           <td>{{ request.service.name }}</td>
//                           <td>{{ formatDate(request.requested_date) }}</td>
//                           <td>{{ request.service_status }}</td>
//                       </tr>
//                   </tbody>
//               </table>
//           </div>
//           <div v-else class="alert alert-info mt-3">
//               <p class="mb-0">No rejected service requests.</p>
//           </div>
//       </div>

//       <!-- Complete Service Modal -->
//       <div class="modal fade" id="completeServiceModal" tabindex="-1" aria-hidden="true">
//         <div class="modal-dialog">
//           <div class="modal-content custom-modal">
//             <div class="modal-header">
//               <h5 class="modal-title">Close Service Request</h5>
//               <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
//             </div>
//             <div class="modal-body">
//               <p><strong>Service Name:</strong> <span>{{ modalServiceName }}</span></p>
//               <p><strong>Professional Name:</strong> <span>{{ modalProfessionalName }}</span></p>
//               <p><strong>Professional ID:</strong> <span>{{ modalProfessionalId }}</span></p>

//               <div class="mb-3">
//                 <label class="form-label">Customer Rating (1 to 5):</label>
//                 <input type="number" class="form-control" v-model="customerRating" step="0.1" min="1" max="5" required />
//               </div>

//               <div class="mb-3">
//                 <label class="form-label">Remarks:</label>
//                 <textarea class="form-control" v-model="customerRemark" rows="2" required></textarea>
//               </div>

//               <input type="hidden" v-model="requestId" />
//             </div>
//             <div class="modal-footer">
//               <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
//                 Close
//               </button>
//               <button type="button" class="btn btn-custom" @click="validateAndSubmit">
//                 Submit
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//   </div>
//   `,

//   data() {
//     return {
//       activeTab: "Pending",
//       pendingRequests: [],
//       acceptedRequests: [],
//       completedRequests: [],
//       rejectedRequests: [],
//       customerId: null,
//       customerRating: null, // Added to store the rating
//       customerRemark: "", // Added to store the remark
//       currentRequest: null, // Store the request currently being marked as Completed
//       modalProfessionalName: "", // Professional name for the modal
//       modalProfessionalId: "", // Professional ID for the modal
//       modalServiceName: "", // Service name for the modal
//       requestId: null, // Added requestId to data
//     };
//   },

//   methods: {
//     async fetchServiceHistory() {
//       try {
//         const storedData = JSON.parse(localStorage.getItem("user"));
//         if (storedData && storedData.customer_id) {
//           this.customerId = storedData.customer_id;
//         } else {
//           console.error("Customer ID is missing or invalid.");
//           return;
//         }
//         const token = this.$store.state.token;

//         const response = await fetch(
//           `/api/service-history/customer/${this.customerId}`,
//           {
//             headers: { "Authentication-Token": this.$store.state.auth_token },
//           }
//         );

//         if (!response.ok) throw new Error("Failed to fetch service history");

//         const data = await response.json();

//         this.pendingRequests = data.filter(
//           (req) => req.service_status === "requested"
//         );
//         this.acceptedRequests = data.filter(
//           (req) => req.service_status === "accepted"
//         );
//         this.completedRequests = data.filter(
//           (req) => req.service_status === "Completed"
//         );
//         this.rejectedRequests = data.filter(
//           (req) => req.service_status === "rejected"
//         );
//       } catch (error) {
//         console.error("Error fetching service history:", error);
//       }
//     },
//     async cancelService(serviceId) {
//       if (!confirm("Are you sure you want to cancel this service?")) return;

//       try {
//         const response = await fetch(`/api/cancel_service/${serviceId}`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "Authentication-Token": this.$store.state.auth_token,
//           },
//         });

//         if (!response.ok) throw new Error("Failed to cancel service");

//         alert("Service canceled successfully");
//         this.fetchServiceHistory(); // Refresh service history
//       } catch (error) {
//         console.error("Error canceling service:", error);
//       }
//     },
//     formatDate(dateString) {
//       const options = { year: "numeric", month: "short", day: "numeric" };
//       return new Date(dateString).toLocaleDateString(undefined, options);
//     },

//     openCompleteServiceModal(requestId) {
//       this.currentRequest = this.findRequestById(requestId);
//       this.customerRating = null;
//       this.customerRemark = "";

//       // Set modal data for professional
//       this.modalProfessionalName = this.currentRequest.professionalName;
//       this.modalProfessionalId = this.currentRequest.professionalId;
//       this.modalServiceName = this.currentRequest.serviceName;
//       this.requestId = requestId; // Set requestId for the modal

//       const modal = new bootstrap.Modal(
//         document.getElementById("completeServiceModal")
//       );
//       modal.show();
//     },

//     findRequestById(id) {
//       const allRequests = [
//         ...this.pendingRequests,
//         ...this.acceptedRequests,
//         ...this.completedRequests,
//         ...this.rejectedRequests,
//       ];
//       return allRequests.find((req) => req.id === id);
//     },
//     // Validate the rating and show an alert if it is out of range
//     validateAndSubmit() {
//       if (
//         this.customerRating < 1 ||
//         this.customerRating > 5 ||
//         this.customerRemark == ""
//       ) {
//         alert("Please enter a rating between 1 and 5. And give the remark");
//         return; // Prevent submission if the rating is out of range
//       }
//       this.completeService(); // Proceed to submit the form if validation passes
//     },
//     async completeService() {
//       try {
//         const response = await fetch(
//           `/api/service_requests/${this.currentRequest.id}/review`,
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
//         this.fetchServiceHistory(); // Refresh service history
//         const modal = bootstrap.Modal.getInstance(
//           document.getElementById("completeServiceModal")
//         );
//         modal.hide(); // Hide the modal
//       } catch (error) {
//         console.error("Failed to complete service:", error);
//       }
//     },
//   },

//   mounted() {
//     this.fetchServiceHistory();
//   },
// };

export default {
  template: `
  <div class="container mt-5">
    <div class="header-section mb-5">
      <h2 class="text-center">Service History</h2>
    </div>
    
    <!-- Service History Tabs -->
    <div class="nav-tabs-container mb-4">
      <ul class="nav nav-tabs">
        <li class="nav-item">
          <a class="nav-link" :class="{ active: activeTab === 'Pending' }" @click="activeTab = 'Pending'">Pending</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{ active: activeTab === 'accepted' }" @click="activeTab = 'accepted'">Accepted</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{ active: activeTab === 'Completed' }" @click="activeTab = 'Completed'">Completed</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{ active: activeTab === 'rejected' }" @click="activeTab = 'rejected'">Rejected</a>
        </li>
      </ul>
    </div>

    <!-- Pending Requests Table -->
    <div v-if="activeTab === 'Pending'" class="table-responsive">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="fs-4 mb-0">Pending Service Requests</h3>
      </div>
      <div v-if="pendingRequests.length > 0">
        <table class="table table-custom">
          <thead class="table-dark-custom">
            <tr>
              <th>Request ID</th>
              <th>Service</th>
              <th>Requested Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in pendingRequests" :key="request.id">
              <td>#{{ request.id }}</td>
              <td>{{ request.service.name }}</td>
              <td>{{ formatDate(request.requested_date) }}</td>
              <td><span class="status-badge pending">{{ request.service_status }}</span></td>
              <td>
                <button class="btn btn-danger-custom btn-sm" @click="cancelService(request.id)">
                  Cancel
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <p>No pending service requests available.</p>
      </div>
    </div>

    <!-- Accepted Requests Table -->
    <div v-if="activeTab === 'accepted'" class="table-responsive">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="fs-4 mb-0">Accepted Service Requests</h3>
      </div>
      <div v-if="acceptedRequests.length > 0">
        <table class="table table-custom">
          <thead class="table-dark-custom">
            <tr>
              <th>Request ID</th>
              <th>Service</th>
              <th>Requested Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in acceptedRequests" :key="request.id">
              <td>#{{ request.id }}</td>
              <td>{{ request.service.name }}</td>
              <td>{{ formatDate(request.requested_date) }}</td>
              <td><span class="status-badge accepted">{{ request.service_status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <p>No accepted service requests yet.</p>
      </div>
    </div>

    <!-- Completed Services Table -->
    <div v-if="activeTab === 'Completed'" class="table-responsive">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="fs-4 mb-0">Completed Services</h3>
      </div>
      <div v-if="completedRequests.length > 0">
        <table class="table table-custom">
          <thead class="table-dark-custom">
            <tr>
              <th>Request ID</th>
              <th>Service</th>
              <th>Completion Date</th>
              <th>Rating</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in completedRequests" :key="request.id">
              <td>#{{ request.id }}</td>
              <td>{{ request.service.name }}</td>
              <td>{{ formatDate(request.date_of_completion) }}</td>
              <td>
                <div v-if="request.rating" class="rating-display">
                  <span class="stars">★</span> {{ request.rating }}/5
                </div>
                <span v-else>Not rated yet</span>
              </td>
              <td>
                <button v-if="!request.rating" class="btn btn-custom btn-sm" @click="openCompleteServiceModal(request.id)">
                  Rate Service
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <p>No completed services yet.</p>
      </div>
    </div>

    <!-- Rejected Services Table -->
    <div v-if="activeTab === 'rejected'" class="table-responsive">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h3 class="fs-4 mb-0">Rejected Services</h3>
      </div>
      <div v-if="rejectedRequests.length > 0">
        <table class="table table-custom">
          <thead class="table-dark-custom">
            <tr>
              <th>Request ID</th>
              <th>Service</th>
              <th>Requested Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="request in rejectedRequests" :key="request.id">
              <td>#{{ request.id }}</td>
              <td>{{ request.service.name }}</td>
              <td>{{ formatDate(request.requested_date) }}</td>
              <td><span class="status-badge rejected">{{ request.service_status }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-state">
        <p>No rejected service requests.</p>
      </div>
    </div>

    <!-- Rating Modal -->
    <div class="modal fade" id="completeServiceModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content custom-modal">
          <div class="modal-header">
            <h5 class="modal-title">Rate Your Service</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="service-info mb-4">
              <div class="row mb-2">
                <div class="col-4 text-muted">Service:</div>
                <div class="col-8 fw-medium">{{ modalServiceName }}</div>
              </div>
              <div class="row mb-2">
                <div class="col-4 text-muted">Professional:</div>
                <div class="col-8 fw-medium">{{ modalProfessionalName }}</div>
              </div>
              <div class="row mb-2">
                <div class="col-4 text-muted">Professional ID:</div>
                <div class="col-8 fw-medium">#{{ modalProfessionalId }}</div>
              </div>
            </div>

            <div class="mb-4">
              <label class="form-label">Your Rating (1 to 5):</label>
              <input 
                type="number" 
                class="form-control" 
                v-model="customerRating" 
                step="0.1" 
                min="1" 
                max="5" 
                required 
              />
              <div class="rating-guide mt-2 d-flex justify-content-between">
                <small>Poor</small>
                <small>Excellent</small>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">Your Feedback:</label>
              <textarea 
                class="form-control" 
                v-model="customerRemark" 
                rows="3" 
                placeholder="Please share your experience with this service..." 
                required
              ></textarea>
            </div>

            <input type="hidden" v-model="requestId" />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
              Cancel
            </button>
            <button type="button" class="btn btn-custom" @click="validateAndSubmit">
              Submit Rating
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
      customerId: null,
      customerRating: null,
      customerRemark: "",
      currentRequest: null,
      modalProfessionalName: "",
      modalProfessionalId: "",
      modalServiceName: "",
      requestId: null,
    };
  },

  methods: {
    async fetchServiceHistory() {
      try {
        const storedData = JSON.parse(localStorage.getItem("user"));
        if (storedData && storedData.customer_id) {
          this.customerId = storedData.customer_id;
        } else {
          console.error("Customer ID is missing or invalid.");
          return;
        }
        const token = this.$store.state.token;

        const response = await fetch(
          `/api/service-history/customer/${this.customerId}`,
          {
            headers: { "Authentication-Token": this.$store.state.auth_token },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch service history");

        const data = await response.json();

        this.pendingRequests = data.filter(
          (req) => req.service_status === "requested"
        );
        this.acceptedRequests = data.filter(
          (req) => req.service_status === "accepted"
        );
        this.completedRequests = data.filter(
          (req) => req.service_status === "Completed"
        );
        this.rejectedRequests = data.filter(
          (req) => req.service_status === "rejected"
        );
      } catch (error) {
        console.error("Error fetching service history:", error);
      }
    },

    async cancelService(serviceId) {
      if (!confirm("Are you sure you want to cancel this service?")) return;

      try {
        const response = await fetch(`/api/cancel_service/${serviceId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.$store.state.auth_token,
          },
        });

        if (!response.ok) throw new Error("Failed to cancel service");

        alert("Service canceled successfully");
        this.fetchServiceHistory();
      } catch (error) {
        console.error("Error canceling service:", error);
      }
    },

    formatDate(dateString) {
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },

    openCompleteServiceModal(requestId) {
      this.currentRequest = this.findRequestById(requestId);
      this.customerRating = null;
      this.customerRemark = "";

      this.modalProfessionalName = this.currentRequest.professionalName;
      this.modalProfessionalId = this.currentRequest.professionalId;
      this.modalServiceName = this.currentRequest.serviceName;
      this.requestId = requestId;

      const modal = new bootstrap.Modal(
        document.getElementById("completeServiceModal")
      );
      modal.show();
    },

    findRequestById(id) {
      const allRequests = [
        ...this.pendingRequests,
        ...this.acceptedRequests,
        ...this.completedRequests,
        ...this.rejectedRequests,
      ];
      return allRequests.find((req) => req.id === id);
    },

    validateAndSubmit() {
      if (
        this.customerRating < 1 ||
        this.customerRating > 5 ||
        this.customerRemark == ""
      ) {
        alert("Please enter a rating between 1 and 5 and provide feedback.");
        return;
      }
      this.completeService();
    },

    async completeService() {
      try {
        const response = await fetch(
          `/api/service_requests/${this.currentRequest.id}/review`,
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

        alert("Thank you for your rating!");
        this.fetchServiceHistory();
        const modal = bootstrap.Modal.getInstance(
          document.getElementById("completeServiceModal")
        );
        modal.hide();
      } catch (error) {
        console.error("Failed to complete service:", error);
      }
    },
  },

  mounted() {
    this.fetchServiceHistory();
  },
};
