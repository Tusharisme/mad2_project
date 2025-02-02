export default {
  template: `
        <div class="container mt-4">
          <h3 class="text-center mb-4">Admin Search </h3>
    
          <div class="row justify-content-center">
            <div class="col-md-8">
              <form class="d-flex flex-wrap gap-2" @submit.prevent="handleSearch">
                <!-- Entity Selection -->
                <select class="form-select" v-model="searchParams.entity" @change="handleEntityChange">
                  <option value="" disabled>Select Category</option>
                  <option value="service">Service</option>
                  <option value="professional">Professional</option>
                  <option value="service_request">Service Request</option>
                  <option value="customer">Customer</option>
                </select>
    
                <!-- Criteria Selection -->
                <select class="form-select" v-model="searchParams.criteria" :disabled="!searchParams.entity">
                  <option value="" disabled>Select Criteria</option>
                  <option v-for="criteria in criteriaOptions" :key="criteria.value" :value="criteria.value">
                    {{ criteria.text }}
                  </option>
                </select>
    
                <!-- Rating Filter (only for Professional with Average Rating) -->
                <div v-if="showRatingFilter" class="input-group">
                  <input 
                    type="number" 
                    class="form-control" 
                    v-model="searchParams.ratingValue"
                    step="0.1" 
                    min="1" 
                    max="5" 
                    placeholder="Average Rating" 
                  />
                  <select class="form-select" v-model="searchParams.ratingCondition">
                    <option value="high">Above or Equal</option>
                    <option value="low">Below or Equal</option>
                  </select>
                </div>
    
                <!-- Search Input -->
                <input 
                  v-if="searchParams.entity === 'service'" 
                  type="text" 
                  class="form-control" 
                  v-model="searchParams.query"
                  placeholder="Search services..."
                />
    
                <button class="btn btn-primary" type="submit">Search</button>
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
                  <button class="btn btn-primary" @click="viewProfessionals(result.id)">
                    View Professionals
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
        query: "",
        criteria: "",
        ratingValue: "",
        ratingCondition: "high", // Default condition
      },
      searchResults: [],
      criteriaOptions: [],
    };
  },
  computed: {
    showRatingFilter() {
      return (
        this.searchParams.entity === "professional" &&
        this.searchParams.criteria === "average_rating"
      );
    },
  },
  methods: {
    handleEntityChange() {
      // Reset search parameters when entity changes
      this.searchParams.criteria = "";
      this.searchParams.query = "";
      this.searchResults = [];
      this.criteriaOptions = this.getCriteriaOptions();
    },
    getCriteriaOptions() {
      const entityCriteriaMap = {
        service: [
          { text: "Name", value: "name" },
          { text: "Base Price", value: "base_price" },
          { text: "Description", value: "description" },
        ],
        professional: [
          { text: "Name", value: "name" },
          { text: "Experience", value: "experience" },
          { text: "Average Rating", value: "average_rating" },
          { text: "Verified Status", value: "verified_status" },
          { text: "Blocked Status", value: "blocked_status" },
        ],
        service_request: [
          { text: "Customer Name", value: "customer_name" },
          { text: "Service Status", value: "service_status" },
        ],
        customer: [
          { text: "Name", value: "name" },
          { text: "Email", value: "email" },
          { text: "Phone", value: "phone" },
        ],
      };
      return entityCriteriaMap[this.searchParams.entity] || [];
    },
    async handleSearch() {
      try {
        const params = new URLSearchParams();
        params.append("entity", this.searchParams.entity);
        params.append("criteria", this.searchParams.criteria);

        if (this.searchParams.entity === "service") {
          params.append("query", this.searchParams.query);
        } else if (
          this.searchParams.entity === "professional" &&
          this.searchParams.criteria === "average_rating"
        ) {
          params.append("rating", this.searchParams.ratingValue);
          params.append("rating_condition", this.searchParams.ratingCondition); // Use "rating_condition" instead of "condition"
        }

        const response = await fetch(`/api/search_admin?${params.toString()}`, {
          headers: {
            "Authentication-Token": this.$store.state.auth_token,
          },
        });

        if (response.ok) {
          this.searchResults = await response.json();
        }
      } catch (error) {
        console.error("Error performing search:", error);
      }
    },
    viewProfessionals(id) {
      this.$router.push(`/professionals/${id}`);
    },
  },
};
