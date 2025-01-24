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
              v-if="request.status === 'pending'"
            >
              <div class="card h-100 shadow-sm">
                <div class="card-body">
                  <h5 class="card-title">{{ request.serviceType }}</h5>
                  <p class="card-text">
                    Request Date: {{ request.requestDate }}<br/>
                    Customer: {{ request.customerName }}<br/>
                    Description: {{ request.description }}
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
                v-if="request.status !== 'pending'"
              >
                <div class="card-body">
                  <h5 class="card-title">{{ request.serviceType }}</h5>
                  <p class="card-text">
                    Request Date: {{ request.requestDate }}<br/>
                    Customer: {{ request.customerName }}<br/>
                    Status: {{ request.status }}
                  </p>
                  <button 
                    v-if="request.status === 'in_progress'"
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
        const response = await fetch("/api/service-requests", {
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
        if (data && Array.isArray(data)) {
          // Sample transformation for requests
          this.requests = data.map((req) => ({
            id: req.id,
            serviceType: req.service_type,
            requestDate: req.created_at,
            customerName: req.customer_name,
            status: req.status,
            description: req.description,
          }));
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
      }
    },
    acceptRequest(requestId) {
      console.log("Accept request:", requestId);
      // Logic to accept request here
    },
    rejectRequest(requestId) {
      console.log("Reject request:", requestId);
      // Logic to reject request here
    },
    markCompleted(requestId) {
      console.log("Mark request as completed:", requestId);
      // Logic to mark request as completed here
    },
  },
};
