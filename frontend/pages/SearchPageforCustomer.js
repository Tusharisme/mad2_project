export default {
  template: `
      <div class="container mt-4">
        <h3 class="text-center mb-4">Search Services</h3>
        
        <div class="row justify-content-center">
          <div class="col-md-8">
            <form class="d-flex flex-wrap gap-2" @submit.prevent="handleSearch">
              <select class="form-select" v-model="searchParams.entity" @change="handleEntityChange">
                <option value="" disabled>Select Entity</option>
                <option value="service">Service</option>
                <option value="pincode">Pincode</option>
                <option value="rating">Rating</option>
              </select>
  
              <select 
                v-if="searchParams.entity === 'pincode'" 
                class="form-select" 
                v-model="searchParams.pincode"
              >
                <option value="" disabled>Select Pin Code</option>
                <option v-for="pin in pincodes" :key="pin" :value="pin">
                  {{ pin }}
                </option>
              </select>
  
              <div v-if="searchParams.entity === 'rating'" class="input-group">
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
  
        <div class="container mt-4">
  <!-- Heading -->
  <h3 v-if="searchParams.entity === 'service'" class="text-center mb-4" style="text-decoration: underline;">
    Explore Our Services
  </h3>

  <div class="row">
    <div v-for="result in searchResults" :key="result.id" class="col-md-4 mb-4">
      <!-- Service Card -->
      <div v-if="searchParams.entity === 'service'" class="card h-100 shadow-sm">
        <div class="card-body text-center">
          <img 
            :src="result.image" 
            :alt="result.name" 
            class="card-img-top mb-3" 
            style="max-height: 150px; object-fit: cover;" 
          />
          <h5 class="card-title">{{ result.name }}</h5>
          <p class="card-text">{{ result.description || 'No description available' }}</p>
          <p class="text-muted">Starting at ₹{{ result.base_price }}</p>
          <button 
            class="btn btn-primary btn-sm mt-3" 
            @click="viewProfessionals(result.id)"
          >
            Explore Services
          </button>
        </div>
      </div>

      <!-- Default Card (For Professionals, Customers, etc.) -->
      <div v-else class="card">
        <div class="card-body">
          <h5 class="card-title">{{ result.name }}</h5>
          <p class="card-text">{{ result.description || 'No description available' }}</p>
          
          <!-- Hide rating for services -->
          <p v-if="searchParams.entity !== 'service'" class="card-text">
            <small class="text-muted">
              Rating: {{ result.average_rating || 'N/A' }}
            </small>
          </p>

          <button 
            class="btn btn-primary"
            @click="viewProfessionals(result.id)"
          >
            View Professionals
          </button>
        </div>
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
      },
      pincodes: [],
      searchResults: [],
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
      this.searchParams.query = "";
      this.searchParams.pincode = "";
      this.searchParams.ratingValue = "";
      this.searchResults = [];
    },
    async handleSearch() {
      try {
        const params = new URLSearchParams();
        params.append("entity", this.searchParams.entity);

        if (this.searchParams.entity === "service") {
          params.append("query", this.searchParams.query);
        } else if (this.searchParams.entity === "pincode") {
          params.append("pincode", this.searchParams.pincode);
        } else if (this.searchParams.entity === "rating") {
          params.append("rating", this.searchParams.ratingValue);
          params.append("condition", this.searchParams.ratingCondition);
        }

        const response = await fetch(`/api/search?${params.toString()}`, {
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
    viewProfessionals(serviceId) {
      // Redirect to the Service Professionals page for the selected service
      this.$router.push(`/service-professionals/${serviceId}`);
    },
  },
};
