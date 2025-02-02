export default {
  template: `
    <div class="container mt-4">
      <h3 class="text-center mb-4">Search Services</h3>
      
      <div class="row justify-content-center">
        <div class="col-md-8">
          <form class="d-flex flex-wrap gap-2" @submit.prevent="handleSearch">
            <!-- Entity Selection -->
            <select class="form-select" v-model="searchParams.entity" @change="handleEntityChange">
              <option value="" disabled>Select Entity</option>
              <option value="pin_code">Pin Code</option>
              <option value="customer_name">Customer Name</option>
              <option value="date_of_service">Date of Service</option>
              <option value="date_of_closing">Date of Closing</option>
            </select>
  
            <!-- Pin Code Dropdown -->
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
  
            <!-- Customer Name Input -->
            <input 
              v-if="searchParams.entity === 'customer_name'" 
              type="text" 
              class="form-control" 
              v-model="searchParams.customer_name"
              placeholder="Customer Name"
            />
  
            <!-- Date of Service Input -->
            <input 
              v-if="searchParams.entity === 'date_of_service'" 
              type="date" 
              class="form-control" 
              v-model="searchParams.date_of_service"
              placeholder="Date of Service"
            />
  
            <!-- Date of Closing Input -->
            <input 
              v-if="searchParams.entity === 'date_of_closing'" 
              type="date" 
              class="form-control" 
              v-model="searchParams.date_of_closing"
              placeholder="Date of Closing"
            />
  
            <button class="btn btn-outline-success" type="submit">Search</button>
          </form>
        </div>
      </div>
  
      <!-- Results Section -->
      <div class="row mt-4">
        <div v-for="result in searchResults" :key="result.id" class="col-md-4 mb-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">{{ result.name }}</h5>
              <p class="card-text">{{ result.description }}</p>
              <p class="card-text">
                <small class="text-muted">
                  Rating: {{ result.average_rating || 'N/A' }}
                </small>
              </p>
              <button 
                class="btn btn-primary"
                @click="viewProfessional(result.id)"
              >
                View Professional
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
        date_of_closing: "",
      },
      pincodes: [], // Pin codes fetched from the API
      searchResults: [], // Professionals results based on search criteria
    };
  },
  created() {
    this.fetchPincodes();
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
    handleEntityChange() {
      // Reset search parameters based on the selected entity
      this.searchParams.pin_code = "";
      this.searchParams.customer_name = "";
      this.searchParams.date_of_service = "";
      this.searchParams.date_of_closing = "";
      this.searchResults = [];
    },
    async handleSearch() {
      try {
        const params = new URLSearchParams();
        params.append("entity", this.searchParams.entity);

        if (this.searchParams.entity === "pin_code") {
          params.append("pin_code", this.searchParams.pin_code);
        } else if (this.searchParams.entity === "customer_name") {
          params.append("customer_name", this.searchParams.customer_name);
        } else if (this.searchParams.entity === "date_of_service") {
          params.append("date_of_service", this.searchParams.date_of_service);
        } else if (this.searchParams.entity === "date_of_closing") {
          params.append("date_of_closing", this.searchParams.date_of_closing);
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
          this.searchResults = await response.json();
        }
      } catch (error) {
        console.error("Error performing search:", error);
      }
    },
    viewProfessional(professionalId) {
      this.$router.push(`/professional/${professionalId}`);
    },
  },
};
