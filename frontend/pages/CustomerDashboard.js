export default {
  template: `
                                    
<div id="customer-dashboard">
<div class="welcome-banner text-center text-white p-4">
  <h1 style="color:black">Welcome, {{ customerName }}</h1>
  <p style="color:black">Your one-stop solution for all household services</p>
</div>

<!-- Display Blocked Message -->
<div v-if="statusMessage" class="alert alert-warning text-center">
  {{ statusMessage }}
</div>

<div v-if="!statusMessage" class="container mt-5">
  <div class="header-section">
    <h3>Explore Our Services</h3>
  </div>
  <div class="row">
    <div v-for="service in services" :key="service.id" class="col-md-4 mb-4">
      <div class="card h-100">
        <div class="img-container">
          <img :src="service.image" :alt="service.title" class="card-img-top" />
        </div>
        <div class="card-body text-center">
          <h5 class="card-title">{{ service.title }}</h5>
          <p class="card-text">{{ service.description }}</p>
          <p class="card-text fw-bold">Starting at ₹{{ service.basePrice }}</p>
          <button class="btn btn-custom mt-2" @click="viewProfessionals(service.id)">
            Explore Services
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Customer Testimonials Section -->
<div class="container mt-5">
  <div class="header-section">
    <h3>What Our Customers Say</h3>
  </div>
  <div class="row">
    <div v-for="testimonial in testimonials" :key="testimonial.name" class="col-md-4 mb-4">
      <div class="card h-100">
        <div class="card-body">
          <div style="background-color: #f4eae1; border-radius: 8px; padding: 15px;">
            <p class="card-text">
              <i class="fas fa-quote-left" style="color: #8b4513; margin-right: 5px;"></i>
              {{ testimonial.feedback }}
              <i class="fas fa-quote-right" style="color: #8b4513; margin-left: 5px;"></i>
            </p>
          </div>
          <div class="mt-3 text-end">
            <h6 class="card-title mb-1" style="color: #8b4513; font-weight: 600;">- {{ testimonial.name }}</h6>
            <p class="text-muted" style="font-size: 0.9rem;">{{ testimonial.location }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
</div>

  `,

  data() {
    return {
      customerName: "",
      services: [], // Will store fetched services
      statusMessage: "", // Holds the block message
      testimonials: [
        {
          name: "Alice Johnson",
          feedback: "The service was excellent!",
          location: "New York, NY",
        },
        {
          name: "Robert Smith",
          feedback: "Highly recommend! Quick and reliable.",
          location: "Los Angeles, CA",
        },
        {
          name: "Emily Davis",
          feedback: "Amazing experience! Seamless booking.",
          location: "Chicago, IL",
        },
      ],
    };
  },

  created() {
    this.fetchCustomerData();
  },

  methods: {
    async fetchCustomerData() {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        this.customerName = user ? user.customer_name : "Customer";

        const response = await fetch(`/api/customers/${user.customer_id}`, {
          headers: { "Authentication-Token": this.$store.state.auth_token },
        });

        if (!response.ok) throw new Error("Failed to fetch customer data");

        const customerData = await response.json();
        console.log("Customer data:", customerData);
        if (customerData.is_blocked) {
          this.statusMessage =
            "Your account is blocked by the admin. You cannot book services.";
          return;
        }

        this.fetchServices(); // Fetch services only if the customer is not blocked
      } catch (error) {
        console.error("Error fetching customer data:", error);
        this.statusMessage =
          "Failed to load customer data. Please try again later.";
      }
    },

    async fetchServices() {
      try {
        const response = await fetch("/api/services", {
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": this.$store.state.auth_token,
          },
        });

        if (!response.ok) throw new Error("Failed to fetch services");

        const data = await response.json();
        this.services = data.map((service) => ({
          id: service.id,
          title: service.name,
          image: service.image_url,
          basePrice: service.base_price,
          description: service.description,
        }));
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    },

    viewProfessionals(serviceId) {
      this.$router.push(`/service-professionals/${serviceId}`);
    },
  },
};
