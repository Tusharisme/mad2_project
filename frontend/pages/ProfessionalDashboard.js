// export default {
//   template: `
//     <div id="professional-dashboard">
//       <!-- Welcome Banner -->
//       <div class="welcome-banner text-center p-4" style="background-color: #f4f4f4; border-bottom: 2px solid #ddd;">
//         <h1 style="color: #333;">Hello, {{ professionalName }}</h1>
//         <p style="color: #555;">Manage your pending requests and completed services here</p>
//       </div>

//       <!-- Pending Requests Section -->
//       <div class="container mt-5">
//         <h3 class="text-center mb-4" style="text-decoration: underline; color: #444;">Pending Requests</h3>
//         <div class="row">
//           <div
//             v-for="request in requests"
//             :key="request.id"
//             class="col-md-4 mb-4"
//             v-if="request.status === 'requested'"
//           >
//             <div class="card h-100 shadow-sm" style="border-radius: 10px;">
//               <div class="card-body">
//                 <h5 class="card-title">{{ request.serviceName }}</h5>
//                 <p class="card-text">
//                   Request ID: {{ request.id }}<br />
//                   Requested Date: {{ request.requestedDate }}<br />
//                   Customer: {{ request.customerName }}<br />
//                 </p>
//                 <button class="btn btn-success btn-sm" @click="acceptRequest(request.id)">
//                   Accept
//                 </button>
//                 <button class="btn btn-danger btn-sm ms-2" @click="rejectRequest(request.id)">
//                   Reject
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <!-- Active/Completed Requests Section -->
//       <div class="container mt-5">
//         <h3 class="text-center mb-4" style="text-decoration: underline; color: #444;">My Service Requests</h3>
//         <div class="row">
//           <div v-for="request in requests" :key="request.id" class="col-md-4 mb-4">
//             <div class="card h-100 shadow-sm" style="border-radius: 10px;" v-if="request.status !== 'requested'">
//               <div class="card-body">
//                 <h5 class="card-title">{{ request.serviceName }}</h5>
//                 <p class="card-text">
//                   Request ID: {{ request.id }}<br />
//                   Requested Date: {{ request.requestedDate }}<br />
//                   Customer: {{ request.customerName }}<br />
//                   Current Status: {{ request.status }}
//                 </p>
//                 <button
//                   v-if="request.status === 'accepted'"
//                   class="btn btn-primary btn-sm"
//                   @click="markCompleted(request.id)"
//                 >
//                   Mark as Completed
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <!-- Reviews Section -->
//       <div class="container mt-5">
//         <h3 class="text-center mb-4" style="text-decoration: underline; color: #444;">Recent Feedback</h3>
//         <div class="row">
//           <div v-for="review in reviews" :key="review.customerName" class="col-md-4 mb-4">
//             <div class="card h-100 shadow-sm" style="border-radius: 10px;">
//               <div class="card-body">
//                 <p class="card-text">
//                   <i class="fas fa-quote-left"></i> {{ review.comment }} <i class="fas fa-quote-right"></i>
//                 </p>
//                 <h6 class="card-title mt-3 text-end">- {{ review.customerName }}</h6>
//                 <p class="text-end text-muted">{{ review.location }}</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   `,
//   data() {
//     return {
//       professionalName: this.getProfessionalName(),
//       requests: [],
//       reviews: [
//         {
//           customerName: "John Williams",
//           comment: "Excellent service and quick turnaround!",
//           location: "Houston, TX",
//         },
//         {
//           customerName: "Sarah Lee",
//           comment: "Very professional and courteous. Highly recommend!",
//           location: "Seattle, WA",
//         },
//       ],
//     };
//   },
//   created() {
//     this.fetchRequests();
//   },
//   methods: {
//     getProfessionalName() {
//       const user = JSON.parse(localStorage.getItem("user"));
//       return user ? user.name : "Professional";
//     },
//     async fetchRequests() {
//       try {
//         const response = await fetch("/api/service_requests", {
//           method: "GET",
//           headers: {
//             "Content-Type": "application/json",
//             "Authentication-Token": this.$store.state.auth_token || "",
//           },
//         });
//         if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         const data = await response.json();
//         this.requests = data.map((req) => ({
//           id: req.id,
//           serviceName: req.service_name,
//           requestedDate: req.requested_date,
//           customerName: req.customer_name,
//           status: req.service_status,
//         }));
//       } catch (error) {
//         console.error("Error fetching requests:", error);
//       }
//     },
//     acceptRequest(requestId) {
//       this.handleRequest(`/api/service_requests/${requestId}/accept`);
//     },
//     rejectRequest(requestId) {
//       this.handleRequest(`/api/service_requests/${requestId}/reject`);
//     },
//     markCompleted(requestId) {
//       this.handleRequest(`/api/service_requests/${requestId}/close`);
//     },
//     async handleRequest(url) {
//       try {
//         const response = await fetch(url, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "Authentication-Token": this.$store.state.auth_token || "",
//           },
//         });
//         if (response.ok) {
//           this.fetchRequests();
//         } else {
//           const data = await response.json();
//           alert("Error: " + data.message);
//         }
//       } catch (error) {
//         console.error("Error:", error);
//         alert("An error occurred. Please try again.");
//       }
//     },
//   },
// };
// export default {
//   template: `
//     <div id="professional-dashboard">
//       <!-- Welcome Banner -->
//       <div class="welcome-banner text-center p-4" style="background-color: #f4f4f4; border-bottom: 2px solid #ddd;">
//         <h1 style="color: #333;">Welcome, {{ professionalName }}</h1>
//         <p style="color: #555;">Manage your service requests and completed services here</p>
//       </div>

//       <!-- Today's Services Section -->
//       <div class="container mt-5">
//         <h3 class="text-center mb-4" style="text-decoration: underline; color: #444;">Today's Services</h3>
//         <div v-if="todayServices.length > 0">
//           <div v-for="request in todayServices" :key="request.id" class="card mb-3">
//             <div class="card-body">
//               <h5 class="card-title">Service ID: {{ request.id }}</h5>
//               <p class="card-text">
//                 Customer: {{ request.customer.name }}<br>
//                 Phone: {{ request.customer.phone_no }}<br>
//                 Address: {{ request.customer.address }}, {{ request.customer.pin_code }}<br>
//                 Status: {{ request.service_status }}
//               </p>
//               <button v-if="request.service_status === 'accepted'"
//                 class="btn btn-warning"
//                 @click="closeService(request.id)">
//                 Close Service
//               </button>
//               <template v-else-if="request.service_status === 'requested'">
//                 <button class="btn btn-success" @click="acceptService(request.id)">
//                   Accept
//                 </button>
//                 <button class="btn btn-danger" @click="rejectService(request.id)">
//                   Reject
//                 </button>
//               </template>
//             </div>
//           </div>
//         </div>
//         <p v-else class="text-center"><b>No services requested today.</b></p>
//       </div>

//       <!-- Closed Services Section -->
//       <div class="container mt-5">
//         <h3 class="text-center mb-4" style="text-decoration: underline; color: #444;">Closed Services</h3>
//         <div v-if="closedServices.length > 0">
//           <div v-for="service in closedServices" :key="service.id" class="card mb-3">
//             <div class="card-body">
//               <h5 class="card-title">Service ID: {{ service.id }}</h5>
//               <p class="card-text">
//                 Customer: {{ service.customer.name }}<br>
//                 Phone: {{ service.customer.phone_no }}<br>
//                 Address: {{ service.customer.address }}, {{ service.customer.pin_code }}<br>
//                 Closing Date: {{ formatDate(service.date_of_completion) }}<br>
//                 My Rating: {{ service.rating }}<br>
//                 Customer's Rating: {{ service.customer_rating }}
//               </p>
//             </div>
//           </div>
//         </div>
//         <p v-else class="text-center"><b>No closed services yet.</b></p>
//       </div>
//     </div>
//   `,
//   data() {
//     return {
//       professionalName: "",
//       todayServices: [],
//       closedServices: [],
//     };
//   },
//   created() {
//     this.fetchProfessionalName();
//     this.fetchTodayServices();
//     this.fetchClosedServices();
//   },
//   methods: {
//     async fetchProfessionalName() {
//       try {
//         const response = await fetch(
//           "/api/service_professionals/" + this.getProfessionalId(),
//           {
//             headers: {
//               "Authentication-Token": this.$store.state.auth_token,
//             },
//           }
//         );
//         if (response.ok) {
//           const data = await response.json();
//           this.professionalName = data.name;
//         }
//       } catch (error) {
//         console.error("Error fetching professional name:", error);
//       }
//     },
//     async fetchTodayServices() {
//       try {
//         const response = await fetch("/api/service_requests", {
//           headers: {
//             "Authentication-Token": this.$store.state.auth_token,
//           },
//         });
//         if (response.ok) {
//           const data = await response.json();
//           this.todayServices = data.filter(
//             (request) =>
//               request.professional_id === this.getProfessionalId() &&
//               (request.service_status === "requested" ||
//                 request.service_status === "accepted") &&
//               this.isToday(request.requested_date)
//           );
//         }
//       } catch (error) {
//         console.error("Error fetching today's services:", error);
//       }
//     },
//     async fetchClosedServices() {
//       try {
//         const response = await fetch("/api/service_requests", {
//           headers: {
//             "Authentication-Token": this.$store.state.auth_token,
//           },
//         });
//         if (response.ok) {
//           const data = await response.json();
//           this.closedServices = data.filter(
//             (request) =>
//               request.professional_id === this.getProfessionalId() &&
//               request.service_status === "completed"
//           );
//         }
//       } catch (error) {
//         console.error("Error fetching closed services:", error);
//       }
//     },
//     getProfessionalId() {
//       // Implement this method to get the professional's ID from your authentication system
//       return this.$store.state.professional.id;
//     },
//     isToday(dateString) {
//       const today = new Date();
//       const date = new Date(dateString);
//       return (
//         date.getDate() === today.getDate() &&
//         date.getMonth() === today.getMonth() &&
//         date.getFullYear() === today.getFullYear()
//       );
//     },
//     formatDate(dateString) {
//       return new Date(dateString).toLocaleDateString();
//     },
//     async acceptService(requestId) {
//       try {
//         const response = await fetch(
//           `/api/service_requests/${requestId}/accept`,
//           {
//             method: "POST",
//             headers: {
//               "Authentication-Token": this.$store.state.auth_token,
//             },
//           }
//         );
//         if (response.ok) {
//           await this.fetchTodayServices();
//         }
//       } catch (error) {
//         console.error("Error accepting service:", error);
//       }
//     },
//     async rejectService(requestId) {
//       try {
//         const response = await fetch(
//           `/api/service_requests/${requestId}/reject`,
//           {
//             method: "POST",
//             headers: {
//               "Authentication-Token": this.$store.state.auth_token,
//             },
//           }
//         );
//         if (response.ok) {
//           await this.fetchTodayServices();
//         }
//       } catch (error) {
//         console.error("Error rejecting service:", error);
//       }
//     },
//     async closeService(requestId) {
//       try {
//         const response = await fetch(
//           `/api/service_requests/${requestId}/close`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//               "Authentication-Token": this.$store.state.auth_token,
//             },
//             body: JSON.stringify({
//               customerRating: 5, // You might want to implement a rating system
//               customerRemark: "Service completed successfully",
//             }),
//           }
//         );
//         if (response.ok) {
//           await this.fetchTodayServices();
//           await this.fetchClosedServices();
//         }
//       } catch (error) {
//         console.error("Error closing service:", error);
//       }
//     },
//   },
// };
export default {
  template: `
    <div id="professional-dashboard">
      <!-- Welcome Banner -->
      <div class="welcome-banner text-center p-4" style="background-color: #f4f4f4; border-bottom: 2px solid #ddd;">
        <h1 style="color: #333;">Hello, {{ professionalName }}</h1>
        <p style="color: #555;">Manage your pending requests and completed services here</p>
      </div>

      <!-- Pending Requests Section -->
      <div class="container mt-5">
        <h3 class="text-center mb-4" style="text-decoration: underline; color: #444;">Pending Requests</h3>
        <div class="row">
          <div
            v-for="request in requests"
            :key="request.id"
            class="col-md-4 mb-4"
            v-if="request.status === 'requested'"
          >
            <div class="card h-100 shadow-sm" style="border-radius: 10px;">
              <div class="card-body">
                <h5 class="card-title">{{ request.serviceName }}</h5>
                <p class="card-text">
                  Request ID: {{ request.id }}<br />
                  Requested Date: {{ request.requestedDate }}<br />
                  Customer: {{ request.customerName }}<br />
                </p>
                <button class="btn btn-success btn-sm" @click="acceptRequest(request.id)">
                  Accept
                </button>
                <button class="btn btn-danger btn-sm ms-2" @click="rejectRequest(request.id)">
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Active/Completed Requests Section -->
      <div class="container mt-5">
        <h3 class="text-center mb-4" style="text-decoration: underline; color: #444;">My Service Requests</h3>
        <div class="row">
          <div v-for="request in requests" :key="request.id" class="col-md-4 mb-4">
            <div class="card h-100 shadow-sm" style="border-radius: 10px;" v-if="request.status !== 'requested'">
              <div class="card-body">
                <h5 class="card-title">{{ request.serviceName }}</h5>
                <p class="card-text">
                  Request ID: {{ request.id }}<br />
                  Requested Date: {{ request.requestedDate }}<br />
                  Customer: {{ request.customerName }}<br />
                  Current Status: {{ request.status }}
                </p>
                <button
                  v-if="request.status === 'accepted'"
                  class="btn btn-primary btn-sm"
                  @click="markCompleted(request.id)"
                >
                  Mark as Completed
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Closed Services Section -->
      <div class="container mt-5">
        <h3 class="text-center mb-4" style="text-decoration: underline; color: #444;">Closed Services</h3>
        <div v-if="closedServices.length > 0">
          <div v-for="service in closedServices" :key="service.id" class="card mb-3">
            <div class="card-body">
              <h5 class="card-title">Service ID: {{ service.id }}</h5>
              <p class="card-text">
                Customer: {{ service.customerName }}<br>
                Phone: {{ service.customerPhone }}<br>
                Address: {{ service.customerAddress }}<br>
                Closing Date: {{ formatDate(service.dateOfCompletion) }}<br>
                My Rating: {{ service.myRating }}<br>
                Customer's Rating: {{ service.customerRating }}
              </p>
            </div>
          </div>
        </div>
        <p v-else class="text-center"><b>No closed services yet.</b></p>
      </div>

      <!-- Reviews Section -->
      <div class="container mt-5">
        <h3 class="text-center mb-4" style="text-decoration: underline; color: #444;">Recent Feedback</h3>
        <div class="row">
          <div v-for="review in reviews" :key="review.customerName" class="col-md-4 mb-4">
            <div class="card h-100 shadow-sm" style="border-radius: 10px;">
              <div class="card-body">
                <p class="card-text">
                  <i class="fas fa-quote-left"></i> {{ review.comment }} <i class="fas fa-quote-right"></i>
                </p>
                <h6 class="card-title mt-3 text-end">- {{ review.customerName }}</h6>
                <p class="text-end text-muted">{{ review.location }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div v-if="showModal" class="modal" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Service Completion</h5>
              <button type="button" class="close" @click="showModal = false" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <p>Would you like to mark this service as completed?</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="showModal = false">Cancel</button>
              <button type="button" class="btn btn-primary" @click="closeService">Confirm</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  data() {
    return {
      professionalName: this.getProfessionalName(),
      requests: [],
      closedServices: [],
      reviews: [
        {
          customerName: "John Williams",
          comment: "Excellent service and quick turnaround!",
          location: "Houston, TX",
        },
        {
          customerName: "Sarah Lee",
          comment: "Very professional and courteous. Highly recommend!",
          location: "Seattle, WA",
        },
      ],
      showModal: false,
      currentRequestId: null,
    };
  },
  created() {
    this.fetchRequests();
    this.fetchClosedServices();
  },
  methods: {
    getProfessionalName() {
      const user = JSON.parse(localStorage.getItem("user"));
      return user ? user.name : "Professional";
    },
    async fetchRequests() {
      try {
        const response = await fetch("/api/service_requests", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.$store.state.auth_token || "",
          },
        });
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        this.requests = data.map((req) => ({
          id: req.id,
          serviceName: req.service_name,
          requestedDate: req.requested_date,
          customerName: req.customer_name,
          status: req.service_status,
        }));
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    },
    async fetchClosedServices() {
      try {
        const response = await fetch("/api/service_requests", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.$store.state.auth_token || "",
          },
        });
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        this.closedServices = data.filter(
          (request) => request.service_status === "completed"
        );
      } catch (error) {
        console.error("Error fetching closed services:", error);
      }
    },
    acceptRequest(requestId) {
      this.handleRequest(`/api/service_requests/${requestId}/accept`);
    },
    rejectRequest(requestId) {
      this.handleRequest(`/api/service_requests/${requestId}/reject`);
    },
    markCompleted(requestId) {
      this.currentRequestId = requestId;
      this.showModal = true;
    },
    closeService() {
      this.handleRequest(
        `/api/service_requests/${this.currentRequestId}/close`
      );
      this.showModal = false;
    },
    async handleRequest(url) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.$store.state.auth_token || "",
          },
        });
        if (response.ok) {
          this.fetchRequests();
        } else {
          const data = await response.json();
          alert("Error: " + data.message);
        }
      } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again.");
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    },
  },
};
