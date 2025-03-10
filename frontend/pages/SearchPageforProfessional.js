export default {
  template: `
    <div class="container mt-5">
      <div class="header-section mb-4">
        <h2 class="text-primary fw-bold">Search Service Requests</h2>
        <div class="section-divider"></div>
      </div>
      
      <!-- Search Form Card -->
      <div class="card shadow-sm border-0 rounded-3 mb-4">
        <div class="card-header bg-gradient-light py-3">
          <h4 class="mb-0 text-dark"><i class="fas fa-search me-2"></i>Search Filters</h4>
        </div>
        <div class="card-body">
          <div class="row justify-content-center">
            <div class="col-md-10">
              <form class="row g-3 align-items-end" @submit.prevent="handleSearch">
                <div class="col-md-4">
                  <label class="form-label">Search By</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-filter"></i></span>
                    <select class="form-select" v-model="searchParams.entity" @change="handleEntityChange">
                      <option value="" disabled>Select Entity</option>
                      <option value="pin_code">Pin Code</option>
                      <option value="customer_name">Customer Name</option>
                      <option value="date_of_service">Date of Service</option>
                      <option value="date_of_closing">Date of Closing</option>
                    </select>
                  </div>
                </div>

                <div class="col-md-5">
                  <label class="form-label" v-if="searchParams.entity">Search Value</label>
                  <div class="input-group">
                    <span class="input-group-text" v-if="searchParams.entity === 'pin_code'">
                      <i class="fas fa-map-pin"></i>
                    </span>
                    <span class="input-group-text" v-if="searchParams.entity === 'customer_name'">
                      <i class="fas fa-user"></i>
                    </span>
                    <span class="input-group-text" v-if="searchParams.entity === 'date_of_service' || searchParams.entity === 'date_of_closing'">
                      <i class="fas fa-calendar-alt"></i>
                    </span>

                    <select 
                      v-if="searchParams.entity === 'pin_code'" 
                      class="form-select" 
                      v-model="searchParams.pin_code"
                    >
                      <option value="" disabled>Select Pin Code</option>
                      <option v-for="pin in pincodes" :key="pin" :value="pin">
                        {{ pin }}
                      </option>
                    </select>

                    <input 
                      v-if="searchParams.entity === 'customer_name'" 
                      type="text" 
                      class="form-control" 
                      v-model="searchParams.customer_name"
                      placeholder="Enter Customer Name"
                    />

                    <input 
                      v-if="searchParams.entity === 'date_of_service'" 
                      type="date" 
                      class="form-control" 
                      v-model="searchParams.date_of_service"
                    />

                    <input 
                      v-if="searchParams.entity === 'date_of_closing'" 
                      type="date" 
                      class="form-control" 
                      v-model="searchParams.date_of_completion"
                    />
                  </div>
                </div>

                <div class="col-md-3">
                  <button class="btn btn-custom w-100" type="submit">
                    <i class="fas fa-search me-2"></i> Search
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Search Results -->
      <div class="search-results mt-4">
        <transition name="fade">
          <div v-if="searchResults.length === 0 && searchPerformed" class="empty-state text-center py-5">
            <i class="fas fa-exclamation-circle fa-3x mb-3" style="color: var(--primary-color);"></i>
            <h5>No results found</h5>
            <p class="text-muted">Try adjusting your search criteria</p>
          </div>
        </transition>
        
        <div v-if="searchResults.length > 0" class="row">
          <div v-for="result in searchResults" :key="result.id" class="col-md-4 mb-4">
            <div class="card h-100 shadow-sm border-0 rounded-3 hover-card">
              <div class="card-header bg-gradient-light py-3">
                <h5 class="card-title mb-0">
                  <template v-if="searchParams.entity === 'pin_code'">
                    <i class="fas fa-map-pin me-2" style="color: var(--primary-color);"></i>
                    Pin Code: {{ result.customer?.pin_code || 'N/A' }}
                  </template>
                  <template v-else-if="searchParams.entity === 'customer_name'">
                    <i class="fas fa-user me-2" style="color: var(--primary-color);"></i>
                    {{ result.customer?.name || 'Unknown' }}
                  </template>
                  <template v-else>
                    <i class="fas fa-clipboard-list me-2" style="color: var(--primary-color);"></i>
                    Request #{{ result.id }}
                  </template>
                </h5>
              </div>
              <div class="card-body">
                <div class="info-row mb-2" v-if="result.customer?.email">
                  <i class="fas fa-envelope me-2 text-muted"></i>
                  <span>{{ result.customer.email }}</span>
                </div>
                <div class="info-row mb-2" v-if="result.customer?.phone_no">
                  <i class="fas fa-phone me-2 text-muted"></i>
                  <span>{{ result.customer.phone_no }}</span>
                </div>
                <div class="info-row mb-2" v-if="result.customer?.address">
                  <i class="fas fa-map-marker-alt me-2 text-muted"></i>
                  <span>{{ result.customer.address }}</span>
                </div>
                <div class="info-row mb-2" v-if="result.date_of_request">
                  <i class="fas fa-calendar-plus me-2 text-muted"></i>
                  <span>Requested: {{ formatDate(result.date_of_request) }}</span>
                </div>
                <div class="info-row" v-if="result.date_of_completion">
                  <i class="fas fa-calendar-check me-2 text-muted"></i>
                  <span>Completed: {{ formatDate(result.date_of_completion) }}</span>
                </div>
              </div>
              <div class="card-footer bg-transparent border-0 text-end p-3">
                <button class="btn btn-custom btn-sm" @click="openModal(result)">
                  <i class="fas fa-eye me-1"></i> View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal (Fixed positioning now) -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container">
          <div class="modal-content custom-modal shadow-lg border-0 rounded-3">
            <div class="modal-header bg-gradient-light py-3">
              <h5 class="modal-title">
                <i class="fas fa-clipboard-check me-2" style="color: var(--primary-color);"></i>
                Service Request Details
              </h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body p-4">
              <div class="info-group mb-3">
                <h6 class="info-label"><i class="fas fa-user me-2 text-primary"></i>Customer Information</h6>
                <div class="info-content">
                  <div class="row">
                    <div class="col-md-6 mb-2">
                      <label class="small text-muted">Name</label>
                      <p class="mb-0 fw-medium">{{ selectedRequest?.customer?.name || 'N/A' }}</p>
                    </div>
                    <div class="col-md-6 mb-2">
                      <label class="small text-muted">Email</label>
                      <p class="mb-0">{{ selectedRequest?.customer?.email || 'N/A' }}</p>
                    </div>
                    <div class="col-md-6 mb-2">
                      <label class="small text-muted">Phone</label>
                      <p class="mb-0">{{ selectedRequest?.customer?.phone_no || 'N/A' }}</p>
                    </div>
                    <div class="col-md-6 mb-2">
                      <label class="small text-muted">Pin Code</label>
                      <p class="mb-0">{{ selectedRequest?.customer?.pin_code || 'N/A' }}</p>
                    </div>
                  </div>
                  <div class="row mt-1">
                    <div class="col-12">
                      <label class="small text-muted">Address</label>
                      <p class="mb-0">{{ selectedRequest?.customer?.address || 'N/A' }}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="info-group mb-3">
                <h6 class="info-label"><i class="fas fa-briefcase me-2 text-primary"></i>Service Information</h6>
                <div class="info-content">
                  <div class="row">
                    <div class="col-md-6 mb-2">
                      <label class="small text-muted">Service</label>
                      <p class="mb-0 fw-medium">{{ selectedRequest?.service?.name || 'N/A' }}</p>
                    </div>
                    <div class="col-md-6 mb-2">
                      <label class="small text-muted">Status</label>
                      <p class="mb-0">
                        <span class="badge" :class="getStatusBadgeClass(selectedRequest?.service_status)">
                          {{ selectedRequest?.service_status || 'N/A' }}
                        </span>
                      </p>
                    </div>
                    <div class="col-md-6 mb-2">
                      <label class="small text-muted">Date of Request</label>
                      <p class="mb-0">{{ formatDate(selectedRequest?.date_of_request) }}</p>
                    </div>
                    <div class="col-md-6 mb-2">
                      <label class="small text-muted">Date of Completion</label>
                      <p class="mb-0">{{ formatDate(selectedRequest?.date_of_completion) || 'Pending' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary rounded-pill" @click="closeModal">
                <i class="fas fa-times me-1"></i> Close
              </button>
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
        pin_code: "",
        customer_name: "",
        date_of_service: "",
        date_of_completion: "",
      },
      professional_id: this.$store.state.professional?.id,
      pincodes: [],
      searchResults: [],
      searchPerformed: false,
      showModal: false,
      selectedRequest: null,
    };
  },
  created() {
    this.fetchPincodes();
    // Add style element to the document head
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      /* Modal Styles */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1050;
      }

      .modal-container {
        position: relative;
        width: 90%;
        max-width: 700px;
        max-height: 90vh;
        z-index: 1060;
      }

      .custom-modal {
        background-color: #fff;
        overflow-y: auto;
        max-height: 90vh;
      }

      /* When modal is open, prevent body scrolling */
      body.modal-open {
        overflow: hidden;
      }

      /* Additional styling */
      .hover-card {
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .hover-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
      }

      .section-divider {
        height: 3px;
        width: 60px;
        background: var(--primary-color);
        margin-top: 8px;
      }

      .info-label {
        font-weight: 600;
        margin-bottom: 10px;
        padding-bottom: 8px;
        border-bottom: 1px solid #eee;
      }

      .btn-custom {
        background-color: var(--primary-color);
        color: white;
        border-radius: 5px;
        font-weight: 500;
        transition: all 0.3s;
      }

      .btn-custom:hover {
        background-color: var(--primary-color-dark, #0056b3);
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      }

      .info-row {
        display: flex;
        align-items: center;
      }
    `;
    document.head.appendChild(styleElement);
  },
  methods: {
    async fetchPincodes() {
      try {
        const response = await fetch(
          `/api/forprofessional_pincodes?professional_id=${this.professional_id}`,
          {
            headers: {
              "Authentication-Token": this.$store.state.auth_token,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          this.pincodes = data.pincodes || [];
        }
      } catch (error) {
        console.error("Error fetching pincodes:", error);
      }
    },
    handleEntityChange() {
      this.searchParams.pin_code = "";
      this.searchParams.customer_name = "";
      this.searchParams.date_of_service = "";
      this.searchParams.date_of_completion = "";
      this.searchResults = [];
      this.searchPerformed = false;
    },
    async handleSearch() {
      if (!this.searchParams.entity) {
        alert("Please select a search entity before proceeding.");
        return;
      }

      try {
        const params = new URLSearchParams();
        params.append("entity", this.searchParams.entity);
        params.append("professional_id", this.professional_id);

        if (this.searchParams.entity === "pin_code") {
          if (!this.searchParams.pin_code) {
            alert("Please select a Pin Code.");
            return;
          }
          params.append("pin_code", this.searchParams.pin_code);
        } else if (this.searchParams.entity === "customer_name") {
          if (this.searchParams.customer_name.trim()) {
            params.append("query", this.searchParams.customer_name);
          }
        } else if (this.searchParams.entity === "date_of_service") {
          if (!this.searchParams.date_of_service) {
            alert("Please select a Date of Service.");
            return;
          }
          params.append("date_of_service", this.searchParams.date_of_service);
        } else if (this.searchParams.entity === "date_of_closing") {
          if (!this.searchParams.date_of_completion) {
            alert("Please select a Date of Closing.");
            return;
          }
          params.append(
            "date_of_closing",
            this.searchParams.date_of_completion
          );
        }

        const response = await fetch(
          `/api/search-professionals?${params.toString()}`,
          {
            headers: {
              "Authentication-Token": this.$store.state.auth_token,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          this.searchResults = Array.isArray(data.results) ? data.results : [];
        } else {
          console.error("Search failed:", response.statusText);
          this.searchResults = [];
        }
      } catch (error) {
        console.error("Error performing search:", error);
        this.searchResults = [];
      } finally {
        this.searchPerformed = true;
      }
    },
    openModal(result) {
      this.selectedRequest = result;
      this.showModal = true;
      // Add body class to prevent scrolling when modal is open
      document.body.classList.add("modal-open");
    },
    closeModal() {
      this.showModal = false;
      // Remove body class when modal is closed
      document.body.classList.remove("modal-open");
    },
    formatDate(dateStr) {
      if (!dateStr) return "N/A";
      return new Date(dateStr).toLocaleDateString();
    },
    getStatusBadgeClass(status) {
      if (!status) return "bg-secondary";

      status = status.toLowerCase();
      if (status.includes("complete") || status.includes("closed")) {
        return "bg-success";
      } else if (status.includes("progress") || status.includes("assigned")) {
        return "bg-primary";
      } else if (status.includes("pending") || status.includes("wait")) {
        return "bg-warning text-dark";
      } else if (status.includes("cancel") || status.includes("reject")) {
        return "bg-danger";
      }
      return "bg-secondary";
    },
  },
};
