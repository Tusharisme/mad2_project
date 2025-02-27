export default {
  template: `
    <div class="container mt-4">
      <h3 class="text-center mb-4">Search Service Requests</h3>
      
      <div class="row justify-content-center">
        <div class="col-md-8">
          <form class="d-flex flex-wrap gap-2" @submit.prevent="handleSearch">
            <select class="form-select" v-model="searchParams.entity" @change="handleEntityChange">
              <option value="" disabled>Select Entity</option>
              <option value="pin_code">Pin Code</option>
              <option value="customer_name">Customer Name</option>
              <option value="date_of_service">Date of Service</option>
              <option value="date_of_closing">Date of Closing</option>
            </select>

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

            <button class="btn btn-outline-success" type="submit">Search</button>
          </form>
        </div>
      </div>

      <div class="row mt-4">
        <div v-if="searchResults.length === 0 && searchPerformed" class="text-center">
          <p class="text-danger">No results found.</p>
        </div>
        
        <div v-else>
          <div v-for="result in searchResults" :key="result.id" class="col-md-4 mb-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">
                  <template v-if="searchParams.entity === 'pin_code'">
                    Pin Code: {{ result.customer?.pin_code || 'N/A' }}
                  </template>
                  <template v-else-if="searchParams.entity === 'customer_name'">
                    Customer: {{ result.customer?.name || 'Unknown' }}
                  </template>
                  <template v-else>
                    Service Request #{{ result.id }}
                  </template>
                </h5>
                
                <p v-if="result.customer?.email">Email: {{ result.customer.email }}</p>
                <p v-if="result.customer?.phone_no">Phone: {{ result.customer.phone_no }}</p>
                <p v-if="result.customer?.address">Address: {{ result.customer.address }}</p>

                <p v-if="result.date_of_request">Requested On: {{ formatDate(result.date_of_request) }}</p>
                <p v-if="result.date_of_completion">Completed On: {{ formatDate(result.date_of_completion) }}</p>

                <button class="btn btn-primary" @click="openModal(result)">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Modal -->
      <div v-if="showModal" class="modal fade show" tabindex="-1"
      style="display: block; background: rgba(0, 0, 0, 0.5);">
        <div class="modal-dialog">
          <div class="modal-content custom-modal">
            <div class="modal-header">
              <h5 class="modal-title">Service Request Details</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <p><strong>Customer Name:</strong> {{ selectedRequest?.customer?.name || 'N/A' }}</p>
              <p><strong>Email:</strong> {{ selectedRequest?.customer?.email || 'N/A' }}</p>
              <p><strong>Phone:</strong> {{ selectedRequest?.customer?.phone_no || 'N/A' }}</p>
              <p><strong>Address:</strong> {{ selectedRequest?.customer?.address || 'N/A' }}</p>
              <p><strong>Service:</strong> {{ selectedRequest?.service?.name || 'N/A' }}</p>
              <p><strong>Status:</strong> {{ selectedRequest?.service_status || 'N/A' }}</p>
              <p><strong>Date of Request:</strong> {{ formatDate(selectedRequest?.date_of_request) }}</p>
              <p><strong>Date of Completion:</strong> {{ formatDate(selectedRequest?.date_of_completion) }}</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">Close</button>
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
    },
    closeModal() {
      this.showModal = false;
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString();
    },
  },
};
