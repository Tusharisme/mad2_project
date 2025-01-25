export default {
  template: `
      <div id="professional-dashboard">
        <div class="welcome-banner text-center text-white p-4">
          <h1 style="color:black">Hello, {{ professionalName }}</h1>
          <p style="color:black">Manage your pending requests and completed services here</p>
        </div>
  
        <!-- Pending Requests Section -->
        <div class="container mt-5">
          <h3 class="text-center mb-4" style="text-decoration: underline;">Pending Requests</h3>
          <div class="row">
            <div 
              v-for="request in requests" 
              :key="request.id" 
              class="col-md-4 mb-4"
              v-if="request.status === 'requested'"
            >
              <div class="card h-100 shadow-sm">
                <div class="card-body">
                  <h5 class="card-title">{{ request.serviceName }}</h5>
                  <p class="card-text">
                    Request ID: {{ request.id }}<br/>
                    Requested Date: {{ request.requestedDate }}<br/>
                    Customer: {{ request.customerName }}<br/>
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
          <h3 class="text-center mb-4" style="text-decoration: underline;">My Service Requests</h3>
          <div class="row">
            <div v-for="request in requests" :key="request.id" class="col-md-4 mb-4">
              <div 
                class="card h-100 shadow-sm" 
                v-if="request.status !== 'requested'"
              >
                <div class="card-body">
                  <h5 class="card-title">{{ request.serviceName }}</h5>
                  <p class="card-text">
                    Request ID: {{ request.id }}<br/>
                    Requested Date: {{ request.requestedDate }}<br/>
                    Customer: {{ request.customerName }}<br/>
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
  
        <!-- Reviews Section -->
        <div class="container mt-5">
          <h3 class="text-center mb-4" style="text-decoration: underline;">Recent Feedback</h3>
          <div class="row">
            <div v-for="review in reviews" :key="review.customerName" class="col-md-4 mb-4">
              <div class="card h-100 shadow-sm">
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
      </div>
    `,
  data() {
    return {
      professionalName: this.getProfessionalName(),
      requests: [],
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
    };
  },
  created() {
    this.fetchRequests();
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
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        /*
          Each item in 'data' is expected to have:
            - id
            - service_name
            - requested_date
            - customer_name
            - status
            etc.
          Adjust the transformations accordingly.
        */
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
    acceptRequest(requestId) {
      fetch(`/accept_service/${requestId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": this.$store.state.auth_token || "",
        },
      })
        .then((response) => {
          if (response.ok) {
            window.location.href = "/professional_dashboard";
          } else {
            return response.json().then((data) => {
              alert("Error: " + data.message);
            });
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("An error occurred. Please try again.");
        });
    },
    rejectRequest(requestId) {
      fetch(`/reject_service/${requestId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": this.$store.state.auth_token || "",
        },
      })
        .then((response) => {
          if (response.ok) {
            window.location.href = "/professional_dashboard";
          } else {
            return response.json().then((data) => {
              alert("Error: " + data.message);
            });
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("An error occurred. Please try again.");
        });
    },
    markCompleted(requestId) {
      fetch("/close_service_professional", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authentication-Token": this.$store.state.auth_token || "",
        },
        body: JSON.stringify({
          requestId: requestId,
        }),
      })
        .then((response) => {
          if (response.ok) {
            window.location.href = "/professional_dashboard";
          } else {
            return response.json().then((data) => {
              alert("Error: " + data.message);
            });
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("An error occurred. Please try again.");
        });
    },
  },
};
