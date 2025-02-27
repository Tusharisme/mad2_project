// export default {
//   template: `
//   <div id="customer-dashboard">
//     <!-- Welcome Banner -->
//     <div class="welcome-banner text-center text-white p-4">
//       <h1>Welcome, {{ customerName }}</h1>
//       <p>Your one-stop solution for all household services</p>
//     </div>

//     <!-- Service Categories Section -->
//     <div class="container mt-4">
//       <h3 class="text-center mb-4" style="text-decoration: underline;">Explore Our Services</h3>
//       <div class="row">
//         <div v-for="category in categories" :key="category.title" class="col-md-4 mb-4">
//           <div class="card h-100 shadow-sm">
//             <div class="card-body text-center">
//               <img
//                 :src="category.image"
//                 :alt="category.title"
//                 class="card-img-top mb-3"
//                 style="max-height: 150px; object-fit: cover;"
//               />
//               <h5 class="card-title">{{ category.title }}</h5>
//               <button class="btn btn-primary btn-sm mt-3">Explore Services</button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>

//     <!-- Featured Services Section -->
//     <div class="container mt-5">
//       <h3 class="text-center mb-4" style="text-decoration: underline;">Featured Services</h3>
//       <div class="row">
//         <div v-for="service in featuredServices" :key="service.title" class="col-md-4 mb-4">
//           <div class="card h-100 shadow-sm">
//             <div class="card-body text-center">
//               <img
//                 :src="service.image"
//                 :alt="service.title"
//                 class="card-img-top mb-3"
//                 style="max-height: 150px; object-fit: cover;"
//               />
//               <h5 class="card-title">{{ service.title }}</h5>
//               <p class="card-text">Starting from: ₹ {{ service.price }}</p>
//               <button class="btn btn-success btn-sm mt-3">Book Now</button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>

//     <!-- Customer Testimonials Section -->
//     <div class="container mt-5">
//       <h3 class="text-center mb-4" style="text-decoration: underline;">What Our Customers Say</h3>
//       <div class="row">
//         <div v-for="testimonial in testimonials" :key="testimonial.name" class="col-md-4 mb-4">
//           <div class="card h-100 shadow-sm">
//             <div class="card-body">
//               <p class="card-text">
//                 <i class="fas fa-quote-left"></i> {{ testimonial.feedback }} <i class="fas fa-quote-right"></i>
//               </p>
//               <h6 class="card-title mt-3 text-end">- {{ testimonial.name }}</h6>
//               <p class="text-end text-muted">{{ testimonial.location }}</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// `,
//   data() {
//     return {
//       customerName: this.getCustomerName(),
//       categories: [
//         {
//           title: "Women's Salon & Spa",
//           image:
//             "https://res.cloudinary.com/dfcpm3kmc/image/upload/v1736747058/services/orrhi0m6aymsg2cgwuga.jpg",
//         },
//         {
//           title: "Men's Salon",
//           image:
//             "https://res.cloudinary.com/dfcpm3kmc/image/upload/v1736747067/services/irpmguvcsjbngnignmal.jpg",
//         },
//         {
//           title: "Home Cleaning",
//           image:
//             "https://res.cloudinary.com/dfcpm3kmc/image/upload/v1736747109/services/rqdhk8o8x7yxggeshjgh.jpg",
//         },
//         {
//           title: "Electrician Services",
//           image:
//             "https://res.cloudinary.com/dfcpm3kmc/image/upload/v1736746813/services/upoxvwc7bjxdlwp3hcha.jpg",
//         },
//       ],
//       featuredServices: [
//         {
//           title: "Air Conditioner Repair",
//           price: 499,
//           image:
//             "https://res.cloudinary.com/dfcpm3kmc/image/upload/v1737293900/services/u9ketst3uf4z0iwjyho3.jpg",
//         },
//         {
//           title: "Pest Control",
//           price: 799,
//           image:
//             "https://res.cloudinary.com/dfcpm3kmc/image/upload/v1737294020/services/mczuyu51ataoov1ec9oc.jpg",
//         },
//         {
//           title: "Furniture Assembly",
//           price: 999,
//           image:
//             "https://res.cloudinary.com/dfcpm3kmc/image/upload/v1737293967/services/b6wjntw3lzvdpcwpm0tq.jpg",
//         },
//       ],
//       testimonials: [
//         {
//           name: "Alice Johnson",
//           feedback:
//             "The service was excellent, and the professional was very courteous!",
//           location: "New York, NY",
//         },
//         {
//           name: "Robert Smith",
//           feedback: "Highly recommend! Quick and reliable service every time.",
//           location: "Los Angeles, CA",
//         },
//         {
//           name: "Emily Davis",
//           feedback: "Amazing experience! Booking and service were seamless.",
//           location: "Chicago, IL",
//         },
//       ],
//     };
//   },
//   methods: {
//     // Method to fetch the customer name from localStorage
//     getCustomerName() {
//       const user = JSON.parse(localStorage.getItem("user"));
//       return user ? user.name : "Customer"; // Fallback to "Customer" if not found
//     },
//   },
// };
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

    <div v-if="!statusMessage" class="container mt-4">
      <h3 class="text-center mb-4" style="text-decoration: underline;">Explore Our Services</h3>
      <div class="row">
        <div v-for="service in services" :key="service.id" class="col-md-4 mb-4">
          <div class="card h-100 shadow-sm">
            <div class="card-body text-center">
              <img 
                :src="service.image" 
                :alt="service.title" 
                class="card-img-top mb-3" 
                style="max-height: 150px; object-fit: cover;" 
              />
              <h5 class="card-title">{{ service.title }}</h5>
              <p class="card-text">{{ service.description }}</p>
              <p class="text-muted">Starting at \₹{{ service.basePrice }}</p>
              <button 
                class="btn btn-primary btn-sm mt-3" 
                @click="viewProfessionals(service.id)"
              >
                Explore Services
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Customer Testimonials Section -->
    <div class="container mt-5">
      <h3 class="text-center mb-4" style="text-decoration: underline;">What Our Customers Say</h3>
      <div class="row">
        <div v-for="testimonial in testimonials" :key="testimonial.name" class="col-md-4 mb-4">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <p class="card-text">
                <i class="fas fa-quote-left"></i> {{ testimonial.feedback }} <i class="fas fa-quote-right"></i>
              </p>
              <h6 class="card-title mt-3 text-end">- {{ testimonial.name }}</h6>
              <p class="text-end text-muted">{{ testimonial.location }}</p>
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
