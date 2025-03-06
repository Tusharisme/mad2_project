export default {
  template: `
  <div id="service-professionals">
    <h3 class="text-center my-4" style="text-decoration: underline;">Professionals for {{ service.name }}</h3>

    <div v-if="professionals.length > 0" class="row">
    <div v-for="professional in professionals" :key="professional.id" class="col-md-4 mb-4">
      <div class="card h-100 shadow-sm">
        <div class="row g-0">
          <div class="col-md-4">
            <div class="img-container">
              <img :src="professional.profile_picture_url" 
                   :alt="professional.name" 
                   class="img-fluid" />
            </div>
          </div>
          <div class="col-md-8">
            <div class="card-body">
              <h5 class="card-title">{{ professional.name }}</h5>
              <p class="card-text"><i class="fas fa-briefcase me-2"></i>Experience: {{ professional.experience }} years</p>
              <p class="card-text"><i class="fas fa-phone me-2"></i>Phone: {{ professional.phone_no }}</p>
  
              <!-- Iterate over custom services -->
              <div v-if="professional.custom_services && professional.custom_services.length > 0" 
                   class="custom-services">
                <div v-for="service in professional.custom_services" :key="service.id">
                  <p class="card-text"><strong>₹ {{ service.custom_price }}</strong></p>
                  <p class="card-text">{{ service.custom_description }}</p>
                  <p class="card-text"><i class="far fa-clock me-1"></i> {{ service.custom_time_required }}</p>
                </div>
              </div>
              <p v-else class="card-text no-services"><b>No custom services available.</b></p>
  
              <!-- Booking Button -->
              <button class="btn btn-info w-100" @click="openBookingModal(professional)">
                <i class="fas fa-calendar-check me-2"></i> Book Service
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

    <!-- No Professionals Available -->
    <p v-else class="text-center"><b>No professionals available for this service.</b></p>

    <!-- Booking Modal -->
<div class="modal fade" id="bookingModal" tabindex="-1" aria-labelledby="bookingModalLabel" aria-hidden="true">
<div class="modal-dialog modal-dialog-centered">
  <div class="modal-content custom-modal">
    <div class="modal-header">
      <h5 class="modal-title" id="bookingModalLabel">Book Service</h5>
      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    </div>
    <div class="modal-body">
      <form @submit.prevent="confirmBooking">
        <!-- Hidden fields -->
        <input type="hidden" v-if="selectedProfessional" v-model="selectedProfessional.id">
        <input type="hidden" v-if="service.id" v-model="service.id">

        <!-- Service details summary -->
        <div class="mb-4 p-3" style="background-color: #f4eae1; border-radius: 10px;">
          <h6 style="color: #8b4513; font-weight: 600;">Service Details</h6>
          <p class="mb-1" v-if="selectedProfessional">Professional: <span class="fw-bold">{{ selectedProfessional.name }}</span></p>
          <p class="mb-1" v-if="service">Service: <span class="fw-bold">{{ service.title }}</span></p>
          <p class="mb-1" v-if="selectedProfessional">Amount: <span class="fw-bold text-success">₹{{ selectedProfessional ? selectedProfessional.custom_services[0].custom_price : 0 }}</span></p>
        </div>

        <!-- Date and time selection -->
        <div class="row mb-3">
          <div class="col-md-6 mb-3 mb-md-0">
            <label for="serviceDate" class="form-label">Select Date</label>
            <input type="date" class="form-control" id="serviceDate" v-model="bookingDate" required>
          </div>
          <div class="col-md-6">
            <label for="serviceTime" class="form-label">Select Time</label>
            <input type="time" class="form-control" id="serviceTime" v-model="bookingTime" required>
          </div>
        </div>

        <!-- Payment section -->
        <div class="mt-4 mb-3">
          <h6 style="color: #8b4513; font-weight: 600;">Payment Information</h6>
        </div>
        
        <div class="mb-3">
          <label for="cardNumber" class="form-label">Card Number</label>
          <input type="text" class="form-control" id="cardNumber" v-model="cardNumber" maxlength="16" placeholder="1234 5678 9012 3456" required>
        </div>
        
        <div class="row mb-3">
          <div class="col-md-6 mb-3 mb-md-0">
            <label for="expirationDate" class="form-label">Expiration Date</label>
            <input type="text" class="form-control" id="expirationDate" v-model="expirationDate" placeholder="MM/YY" maxlength="5" required>
          </div>
          <div class="col-md-6">
            <label for="cvv" class="form-label">CVV</label>
            <input type="text" class="form-control" id="cvv" v-model="cvv" placeholder="123" maxlength="3" required>
          </div>
        </div>
        
        <div class="text-center mt-4">
          <button type="submit" class="btn btn-custom">Confirm Booking</button>
          <button type="button" class="btn btn-outline-secondary ms-2" data-bs-dismiss="modal">Cancel</button>
        </div>
      </form>
    </div>
  </div>
</div>
</div>
  </div>
  `,
  data() {
    return {
      service: {
        name: "Example Service", // Placeholder, updated after fetching
        id: null, // Will store the service ID
      },
      professionals: [], // Will store fetched professionals
      selectedProfessional: null,
      bookingDate: "",
      bookingTime: "",
      cardNumber: "",
      expirationDate: "",
      cvv: "",
    };
  },
  created() {
    const serviceId = this.$route.params.serviceId; // Get service ID from the URL
    if (serviceId) {
      this.service.id = serviceId; // Set the service ID
      this.fetchProfessionals(serviceId); // Fetch professionals for the selected service
    } else {
      console.error("Service ID is missing in URL parameters.");
    }
  },

  methods: {
    async fetchProfessionals() {
      try {
        if (!this.service || !this.service.id) {
          console.error("No service ID available");
          return;
        }

        const response = await fetch(
          `/api/professionals-by-service/${this.service.id}`,
          {
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.$store.state.auth_token,
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch professionals");
        }

        const data = await response.json();
        // Filter out any professionals that might be blocked or not approved
        this.professionals = data.filter(
          (prof) => prof.verified_status === "approved" && !prof.block_status
        );

        console.log("Fetched professionals:", this.professionals); // Debug log
      } catch (error) {
        console.error("Error fetching professionals:", error);
        this.professionals = [];
      }
    },
    openBookingModal(professional) {
      this.selectedProfessional = professional;
      const myModal = new window.bootstrap.Modal(
        document.getElementById("bookingModal")
      );
      myModal.show();
    },
    async confirmBooking() {
      try {
        const customerId = this.$store.state.customer.id;
        // Check if customer is blocked
        const customerResponse = await fetch(`/api/customers/${customerId}`, {
          headers: {
            "Authentication-Token": this.$store.state.auth_token,
          },
        });
        const customerData = await customerResponse.json();

        if (customerData.is_blocked) {
          alert(
            "Your account is blocked. You cannot book services at this time."
          );
          return;
        }

        const bookingData = {
          professional_id: this.selectedProfessional.id,
          service_id: this.service.id,
          customer_id: customerId,
          requested_date: this.bookingDate,
          requested_time: this.bookingTime,
        };
        const response = await fetch(`${location.origin}/api/book-service`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.$store.state.auth_token,
          },
          body: JSON.stringify(bookingData),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Booking confirmed:", result);
          alert("Service request created successfully!");
          // Close the modal
          const modal = bootstrap.Modal.getInstance(
            document.getElementById("bookingModal")
          );
          modal.hide();
          // Optionally redirect to customer dashboard
          this.$router.push("/customer_dashboard");
        } else {
          const error = await response.json();
          throw new Error(error.message || "Failed to create service request");
        }
      } catch (error) {
        console.error("Error confirming booking:", error);
        alert(error.message || "Failed to create service request");
      }
    },
  },
};
