export default {
  template: `
    <div class="search-container">
      <!-- Search Header -->
      <div class="search-header mb-5">
        <h2 class="text-center">Find Your Perfect Service</h2>
        <p class="text-center text-muted">Search by service, location, or rating to meet your needs</p>
      </div>
      
      <!-- Search Form -->
      <div class="row justify-content-center">
        <div class="col-lg-8 col-md-10">
          <div class="search-form-card">
            <form class="search-form" @submit.prevent="handleSearch">
              <div class="search-fields d-flex flex-wrap align-items-center gap-3">
                <!-- Step 1: Select search type -->
                <div class="search-field">
                  <label for="entity" class="form-label">Search By</label>
                  <select id="entity" class="form-select custom-select" v-model="searchParams.entity" @change="handleEntityChange">
                    <option value="" disabled>Select Category</option>
                    <option value="service">Service</option>
                    <option value="pincode">Location</option>
                    <option value="rating">Rating</option>
                  </select>
                </div>
                
                <!-- Step 2: If searching by service, show service input -->
                <div v-if="searchParams.entity === 'service'" class="search-field flex-grow-1">
                  <label for="service" class="form-label">Service Type</label>
                  <input 
                    id="service"
                    type="text" 
                    class="form-control custom-input" 
                    v-model="searchParams.query"
                    placeholder="Type service name..."
                  />
                </div>
                
                <!-- Step 2: If searching by pincode, show pincode select -->
                <div v-if="searchParams.entity === 'pincode'" class="search-field">
                  <label for="pincode" class="form-label">Pin Code</label>
                  <select id="pincode" class="form-select custom-select" v-model="searchParams.pincode">
                    <option value="" disabled>Select Area</option>
                    <option v-for="pin in pincodes" :key="pin" :value="pin">
                      {{ pin }}
                    </option>
                  </select>
                </div>
                
                <!-- Step 2-3: If searching by rating or additional filters -->
                <!-- First select a service -->
                <div v-if="searchParams.entity === 'rating' || (selectedService && showAdditionalFilters)" class="search-field">
                  <label for="serviceSelect" class="form-label">Select Service</label>
                  <select id="serviceSelect" class="form-select custom-select" v-model="searchParams.serviceId" @change="handleServiceSelect">
                    <option value="" disabled>Choose a service</option>
                    <option v-for="service in services" :key="service.id" :value="service.id">
                      {{ service.name }}
                    </option>
                  </select>
                </div>
                
                <!-- Then filter by rating -->
                <div v-if="searchParams.entity === 'rating' || (selectedService && showAdditionalFilters)" class="search-field flex-grow-1">
                  <label for="rating" class="form-label">Rating</label>
                  <div class="input-group">
                    <input 
                      id="rating"
                      type="number" 
                      class="form-control custom-input" 
                      v-model="searchParams.ratingValue"
                      step="0.1" 
                      min="1" 
                      max="5" 
                      placeholder="Enter rating..."
                    />
                    <select class="form-select custom-select" v-model="searchParams.ratingCondition">
                      <option value="high">& Above</option>
                      <option value="low">& Below</option>
                    </select>
                  </div>
                </div>
                
                <!-- Search Button -->
                <div class="search-button mt-auto">
                  <button class="btn btn-search" type="submit">
                    <i class="fas fa-search me-2"></i>Search
                  </button>
                </div>
              </div>
              
              <!-- Additional Filters Toggle -->
              <div v-if="searchParams.entity !== 'rating' && searchResults.length > 0 && !showAdditionalFilters" class="text-center mt-3">
                <button type="button" class="btn btn-link" @click="toggleAdditionalFilters">
                  <i class="fas fa-filter me-1"></i> Add Filters
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      <!-- Results Section -->
      <div class="search-results mt-5">
        <!-- Results Header -->
        <div v-if="searchResults.length > 0" class="results-header mb-4 text-center">
          <h3 v-if="searchParams.entity === 'service' && !selectedService">Explore Our Services</h3>
          <h3 v-else-if="searchParams.entity === 'pincode' && !selectedService">Services in Your Area</h3>
          <h3 v-else-if="selectedService">{{ getProfessionalResultsHeader() }}</h3>
          <h3 v-else>Top Rated Services</h3>
          <p class="text-muted">Showing {{ searchResults.length }} results</p>
        </div>
        
        <!-- No Results Message -->
        <div v-if="searchResults.length === 0 && hasSearched" class="no-results text-center py-5">
          <i class="fas fa-search fa-5x mb-3" style="color: #8b4513; opacity: 0.7;"></i>
          <h4>No services found</h4>
          <p class="text-muted">Try adjusting your search criteria</p>
        </div>
        
        <!-- Results Grid -->
        <div class="row g-4">
          <!-- Service Results -->
          <div v-if="!selectedService" v-for="result in searchResults" :key="result.id" class="col-lg-4 col-md-6">
            <div class="service-card">
              <div class="service-image">
                <img 
                  :src="result.image_url" 
                  :alt="result.name" 
                  class="img-fluid" 
                />
              </div>
              <div class="service-details">
                <h4 class="service-title">{{ result.name }}</h4>
                <p class="service-description">{{ result.description || 'No description available' }}</p>
                
                <div class="service-meta">
                  <div v-if="result.average_rating" class="service-rating">
                    <span class="stars">
                      <i v-for="n in 5" :key="n" class="fas" :class="n <= Math.round(result.average_rating || 0) ? 'fa-star' : 'fa-star-o'"></i>
                    </span>
                    <span class="rating-text">{{ result.average_rating || 'N/A' }}</span>
                  </div>
                  <div class="service-price">
                    <span class="price-label">From</span>
                    <span class="price-amount">₹{{ result.base_price }}</span>
                  </div>
                </div>
                
                <button 
                  class="btn btn-view"
                  @click="selectService(result)"
                >
                  <span>View Professionals</span>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Professional Results -->
          <div v-if="selectedService" v-for="professional in searchResults" :key="professional.id" class="col-lg-4 col-md-6">
            <div class="professional-card">
              <div class="professional-image">
                <img 
                  :src="professional.profile_picture_url" 
                  :alt="professional.name" 
                  class="img-fluid" 
                />
              </div>
              <div class="professional-details">
                <h4 class="professional-title">{{ professional.name }}</h4>
                <p class="professional-description">{{ professional.description || 'No description available' }}</p>
                
                <div class="professional-info">
                  <div class="professional-rating">
                    <span class="stars">
                      <i v-for="n in 5" :key="n" class="fas" :class="n <= Math.round(professional.average_rating || 0) ? 'fa-star' : 'fa-star-o'"></i>
                    </span>
                    <span class="rating-text">{{ professional.average_rating || 'No Ratings Yet' }}</span>
                  </div>
                  <div class="professional-location">
                    <i class="fas fa-map-marker-alt me-1"></i>
                    <span>{{ professional.pin_code }}</span>
                  </div>
                  <div v-if="professional.experience" class="professional-experience">
                    <i class="fas fa-briefcase me-1"></i>
                    <span>{{ professional.experience }} years</span>
                  </div>
                  <div v-if="professional.phone_no" class="professional-phone">
                    <i class="fas fa-phone me-1"></i>
                    <span>{{ professional.phone_no }}</span>
                  </div>
                </div>
                
                <!-- Custom Services -->
                <div v-if="professional.custom_services && professional.custom_services.length > 0" class="professional-services mt-2">
                  <div v-for="service in professional.custom_services" :key="service.id" class="service-item">
                    <div class="service-price">₹{{ service.custom_price }}</div>
                    <div class="service-desc">{{ service.custom_description }}</div>
                    <div class="service-time">
                      <i class="far fa-clock me-1"></i>{{ service.custom_time_required }}
                    </div>
                  </div>
                </div>
                <p v-else class="no-services mt-2"><b>No custom services available.</b></p>
                
                <button 
                  class="btn btn-book mt-3"
                  @click="openBookingModal(professional)"
                >
                  <i class="fas fa-calendar-check me-2"></i>Book Service
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
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
                <input type="hidden" v-if="selectedProfessionalForBooking" v-model="selectedProfessionalForBooking.id">
                <input type="hidden" v-if="selectedService && selectedService.id" v-model="selectedService.id">

                <!-- Service details summary -->
                <div class="mb-4 p-3" style="background-color: #f4eae1; border-radius: 10px;">
                  <h6 style="color: #8b4513; font-weight: 600;">Service Details</h6>
                  <p class="mb-1" v-if="selectedProfessionalForBooking">Professional: <span class="fw-bold">{{ selectedProfessionalForBooking.name }}</span></p>
                  <p class="mb-1" v-if="selectedService">Service: <span class="fw-bold">{{ selectedService.name }}</span></p>
                  <p class="mb-1" v-if="selectedProfessionalForBooking && selectedProfessionalForBooking.custom_services && selectedProfessionalForBooking.custom_services.length > 0">
                    Amount: <span class="fw-bold text-success">₹{{ selectedProfessionalForBooking.custom_services[0].custom_price }}</span>
                  </p>
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
      searchParams: {
        entity: "",
        query: "",
        pincode: "",
        ratingValue: "",
        ratingCondition: "high",
        serviceId: "",
      },
      pincodes: [],
      services: [],
      searchResults: [],
      hasSearched: false,
      selectedService: null,
      showAdditionalFilters: false,

      // Booking related data
      selectedProfessionalForBooking: null,
      bookingDate: "",
      bookingTime: "",
      cardNumber: "",
      expirationDate: "",
      cvv: "",
    };
  },
  created() {
    this.fetchPincodes();
    this.fetchServices();
  },
  methods: {
    async fetchPincodes() {
      try {
        const response = await fetch("/api/pincodes", {
          headers: {
            "Authentication-Token": this.$store.state.auth_token,
          },
        });
        if (response.ok) {
          this.pincodes = await response.json();
        }
      } catch (error) {
        console.error("Error fetching pincodes:", error);
      }
    },
    async fetchServices() {
      try {
        const response = await fetch("/api/services", {
          headers: {
            "Authentication-Token": this.$store.state.auth_token,
          },
        });
        if (response.ok) {
          this.services = await response.json();
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    },
    handleEntityChange() {
      // Reset all filters when search type changes
      this.searchParams.query = "";
      this.searchParams.pincode = "";
      this.searchParams.ratingValue = "";
      this.searchParams.serviceId = "";
      this.searchResults = [];
      this.hasSearched = false;
      this.selectedService = null;
      this.showAdditionalFilters = false;
    },
    toggleAdditionalFilters() {
      this.showAdditionalFilters = !this.showAdditionalFilters;
    },
    handleServiceSelect() {
      // If a service is selected from the dropdown, update the selectedService
      if (this.searchParams.serviceId) {
        const service = this.services.find(
          (s) => s.id == this.searchParams.serviceId
        );
        if (service) {
          this.selectedService = service;
        }
      }
    },
    selectService(service) {
      this.selectedService = service;
      this.searchParams.serviceId = service.id;

      // Search for professionals offering this service
      this.searchProfessionals();
    },
    getProfessionalResultsHeader() {
      if (!this.selectedService) return "";

      let header = `${this.selectedService.name} Professionals`;

      if (this.searchParams.ratingValue) {
        const condition =
          this.searchParams.ratingCondition === "high" ? "& Above" : "& Below";
        header += ` - ${this.searchParams.ratingValue} Stars ${condition}`;
      }

      if (this.searchParams.pincode) {
        header += ` in ${this.searchParams.pincode}`;
      }

      return header;
    },
    async searchProfessionals() {
      try {
        const params = new URLSearchParams();

        // Set entity to rating for professionals search
        params.append("entity", "rating");

        // Always include service ID when searching for professionals
        params.append("service_id", this.searchParams.serviceId);

        // Add rating filter if specified
        if (this.searchParams.ratingValue) {
          params.append("rating", this.searchParams.ratingValue);
          params.append("condition", this.searchParams.ratingCondition);
        }

        // Add pincode filter if specified
        if (this.searchParams.pincode) {
          params.append("pincode", this.searchParams.pincode);
          // Update entity to pincode for location-based search
          params.set("entity", "pincode");
        }

        const response = await fetch(`/api/search?${params.toString()}`, {
          headers: {
            "Authentication-Token": this.$store.state.auth_token,
          },
        });

        if (response.ok) {
          this.searchResults = await response.json();
          this.hasSearched = true;
        }
      } catch (error) {
        console.error("Error searching professionals:", error);
      }
    },
    async handleSearch() {
      // If a service is already selected, search for professionals
      if (this.selectedService) {
        await this.searchProfessionals();
        return;
      }

      try {
        const params = new URLSearchParams();
        params.append("entity", this.searchParams.entity);

        if (this.searchParams.entity === "service") {
          params.append("query", this.searchParams.query);
        } else if (this.searchParams.entity === "pincode") {
          params.append("pincode", this.searchParams.pincode);
        } else if (this.searchParams.entity === "rating") {
          // For rating search, we now require a service to be selected
          if (!this.searchParams.serviceId) {
            alert("Please select a service first");
            return;
          }

          params.append("service_id", this.searchParams.serviceId);

          if (this.searchParams.ratingValue) {
            params.append("rating", this.searchParams.ratingValue);
            params.append("condition", this.searchParams.ratingCondition);
          }
        }

        const response = await fetch(`/api/search?${params.toString()}`, {
          headers: {
            "Authentication-Token": this.$store.state.auth_token,
          },
        });

        if (response.ok) {
          this.searchResults = await response.json();
          this.hasSearched = true;

          // If we're searching by rating with a service, mark it as a professional search
          if (
            this.searchParams.entity === "rating" &&
            this.searchParams.serviceId
          ) {
            const service = this.services.find(
              (s) => s.id == this.searchParams.serviceId
            );
            if (service) {
              this.selectedService = service;
            }
          }
        }
      } catch (error) {
        console.error("Error performing search:", error);
      }
    },
    // Booking Modal Methods
    openBookingModal(professional) {
      this.selectedProfessionalForBooking = professional;

      // Reset booking form
      this.bookingDate = "";
      this.bookingTime = "";
      this.cardNumber = "";
      this.expirationDate = "";
      this.cvv = "";

      // Show the modal using Bootstrap's modal API
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
          professional_id: this.selectedProfessionalForBooking.id,
          service_id: this.selectedService.id,
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
    viewProfessionalDetails(professionalId) {
      this.$router.push(`/professional/${professionalId}`);
    },
  },
};
