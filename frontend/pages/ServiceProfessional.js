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
                <img :src="professional.profile_pic || '/images/default-profile.jpg'" 
                     :alt="professional.name" 
                     class="img-fluid" 
                     style="max-height: 150px; object-fit: cover;" />
              </div>
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h5 class="card-title">{{ professional.name }}</h5>
                <p class="card-text">Experience: {{ professional.experience }} years</p>
                <p class="card-text">Phone No.: {{ professional.phone_no }}</p>

                <!-- Iterate over custom services -->
                <div v-if="professional.custom_services && professional.custom_services.length > 0">
                  <div v-for="service in professional.custom_services" :key="service.id">
                    <p class="card-text">Price: ₹ {{ service.custom_price }}</p>
                    <p class="card-text">Description: {{ service.custom_description }}</p>
                    <p class="card-text">Time Required: {{ service.custom_time_required }}</p>
                  </div>
                </div>
                <p v-else class="card-text"><b>No custom services available.</b></p>

                <!-- Booking Button -->
                <button class="btn btn-info" @click="openBookingModal(professional)">
                  Book Service
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
      <div class="modal-dialog">
        <div class="modal-content custom-modal">
          <div class="modal-header">
            <h5 class="modal-title" id="bookingModalLabel">Book Service</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="confirmBooking">
              <!-- Ensure v-if checks for null before binding id -->
              <input type="hidden" v-if="selectedProfessional" v-model="selectedProfessional.id">
              <input type="hidden" v-if="service.id" v-model="service.id">

              <div class="mb-3">
                <label for="serviceDate" class="form-label">Select Date</label>
                <input type="date" class="form-control" v-model="bookingDate" required>
              </div>
              <div class="mb-3">
                <label for="serviceTime" class="form-label">Select Time</label>
                <input type="time" class="form-control" v-model="bookingTime" required>
              </div>

              <p>Please confirm the payment amount:</p>
              <p>Amount: ₹{{ selectedProfessional ? selectedProfessional.custom_services[0].custom_price : 0 }}</p>

              <div class="mb-3">
                <label for="cardNumber" class="form-label">Card Number</label>
                <input type="text" class="form-control" v-model="cardNumber" maxlength="16" required>
              </div>
              <div class="mb-3">
                <label for="expirationDate" class="form-label">Expiration Date</label>
                <input type="text" class="form-control" v-model="expirationDate" placeholder="MM/YY" maxlength="5" required>
              </div>
              <div class="mb-3">
                <label for="cvv" class="form-label">CVV</label>
                <input type="text" class="form-control" v-model="cvv" maxlength="3" required>
              </div>
              <button type="submit" class="btn btn-primary">Confirm Booking</button>
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
    async fetchProfessionals(serviceId) {
      try {
        const response = await fetch(
          `/api/professionals-by-service/${serviceId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": this.$store.state.auth_token, // Ensure this matches your backend
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        if (data) {
          this.professionals = data || [];
        }
      } catch (error) {
        console.error("Error fetching professionals:", error);
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
        console.log("Customer ID:", customerId); // Debug log
        const bookingData = {
          professional_id: this.selectedProfessional.id,
          service_id: this.service.id,
          customer_id: customerId,
          requested_date: this.bookingDate,
          requested_time: this.bookingTime,
        };

        console.log("Sending booking data:", bookingData); // Debug log

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
