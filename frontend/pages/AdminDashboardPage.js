// export default {
//   template: `
//     <div id="admin-dashboard">
//       <div class="container">
//         <div class="row">
//           <div class="col-12">
//             <h2 class="text-center" style="text-decoration: underline;">Admin Dashboard</h2>
//           </div>
//         </div>

//         <nav class="navbar navbar-expand-lg navbar-light bg-light">
//   <a class="navbar-brand" href="#">Admin Dashboard</a>
//   <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
//     <span class="navbar-toggler-icon"></span>
//   </button>
//   <div class="collapse navbar-collapse" id="navbarNav">
//     <ul class="navbar-nav">
//       <li class="nav-item dropdown">
//         <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
//           Manage Services
//         </a>
//         <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
//           <a class="dropdown-item" href="#" @click="fetchServices">Fetch Services</a>
//           <a class="dropdown-item" href="#" @click="addService">Add Service</a>
//         </div>
//       </li>
//       <li class="nav-item dropdown">
//         <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
//           Manage Customers
//         </a>
//         <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
//           <a class="dropdown-item" href="/customers" @click="fetchCustomers">Fetch Customers</a>
//           <router-link class="dropdown-item" :to="'/customers'" @click.native="fetchCustomers">Fetch Customers</router-link>
//         </div>
//       </li>
//       <li class="nav-item dropdown">
//         <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
//           Manage Professionals
//         </a>
//         <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
//           <a class="dropdown-item" href="#" @click="fetchProfessionals">Fetch Professionals</a>
//         </div>
//       </li>
//     </ul>
//   </div>
// </nav>

//         <!-- Services Section -->
//         <div class="row mt-5" v-if="currentPage === 'services'">
//           <div class="col-12">
//             <h3>Manage Services</h3>
//             <button class="btn btn-primary" @click="fetchServices">Fetch Services</button>
//             <ul v-if="services.length > 0" class="list-group mt-3">
//               <li v-for="service in services" :key="service.id" class="list-group-item">
//                 <div class="d-flex justify-content-between">
//                   <span>{{ service.name }} ({{ service.base_price }})</span>
//                   <button class="btn btn-danger" @click="deleteService(service.id)">Delete</button>
//                 </div>
//               </li>
//             </ul>
//             <div v-else class="mt-3">
//               <p>No services found.</p>
//             </div>
//             <button class="btn btn-success" @click="addService">Add Service</button>
//           </div>
//         </div>

//         <!-- Customers Section -->
//         <div class="row mt-5" v-if="currentPage === 'customers'">
//           <div class="col-12">
//             <h3>Manage Customers</h3>
//             <button class="btn btn-primary" @click="fetchCustomers">Fetch Customers</button>
//             <ul v-if="customers.length > 0" class="list-group mt-3">
//               <li v-for="customer in customers" :key="customer.id" class="list-group-item">
//                 <div class="d-flex justify-content-between">
//                   <span>{{ customer.name }} ({{ customer.email }})</span>
//                   <button class="btn btn-danger" @click="deleteCustomer(customer.id)">Delete</button>
//                 </div>
//               </li>
//             </ul>
//             <div v-else class="mt-3">
//               <p>No customers found.</p>
//             </div>
//           </div>
//         </div>

//         <!-- Professionals Section -->
//         <div class="row mt-5" v-if="currentPage === 'professionals'">
//           <div class="col-12">
//             <h3>Manage Professionals</h3>
//             <button class="btn btn-primary" @click="fetchProfessionals">Fetch Professionals</button>
//             <ul v-if="professionals.length > 0" class="list-group mt-3">
//               <li v-for="professional in professionals" :key="professional.id" class="list-group-item">
//                 <div class="d-flex justify-content-between">
//                   <span>{{ professional.name }} ({{ professional.email }})</span>
//                   <button class="btn btn-danger" @click="deleteProfessional(professional.id)">Delete</button>
//                 </div>
//               </li>
//             </ul>
//             <div v-else class="mt-3">
//               <p>No professionals found.</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   `,
//   data() {
//     return {
//       services: [],
//       customers: [],
//       professionals: [],
//       currentPage: "services", // Set default page as "services"
//     };
//   },
//   created() {
//     this.fetchServices();
//     if (this.$route.path === "/customers") {
//       this.fetchCustomers();
//     }
//     this.fetchProfessionals();
//   },
//   watch: {
//     // Watch the route and trigger data loading when it changes
//     $route(to) {
//       if (to.path === "/customers") {
//         this.fetchCustomers();
//         this.currentPage = "customers";
//       }
//     },
//   },
//   methods: {
//     async fetchServices() {
//       try {
//         const res = await fetch("/api/services");
//         const data = await res.json();
//         if (res.ok) {
//           this.services = data;
//         } else {
//           console.error("Failed to fetch services:", data.message);
//         }
//       } catch (error) {
//         console.error("Error fetching services:", error);
//       }
//     },
//     async fetchCustomers() {
//       try {
//         const res = await fetch("/api/customers");
//         const data = await res.json();
//         if (res.ok) {
//           this.customers = data;
//         } else {
//           console.error("Failed to fetch customers:", data.message);
//         }
//       } catch (error) {
//         console.error("Error fetching customers:", error);
//       }
//     },
//     async fetchProfessionals() {
//       try {
//         const res = await fetch("/api/service_professionals");
//         const data = await res.json();
//         if (res.ok) {
//           this.professionals = data;
//         } else {
//           console.error("Failed to fetch professionals:", data.message);
//         }
//       } catch (error) {
//         console.error("Error fetching professionals:", error);
//       }
//     },
//     async deleteService(serviceId) {
//       try {
//         const res = await fetch(`/api/services/${serviceId}`, {
//           method: "DELETE",
//         });
//         if (res.ok) {
//           this.services = this.services.filter(
//             (service) => service.id !== serviceId
//           );
//           alert("Service deleted successfully");
//         } else {
//           const data = await res.json();
//           alert("Failed to delete service: " + data.message);
//         }
//       } catch (error) {
//         console.error("Error deleting service:", error);
//       }
//     },
//     async deleteCustomer(customerId) {
//       try {
//         const res = await fetch(`/api/customers/${customerId}`, {
//           method: "DELETE",
//         });
//         if (res.ok) {
//           this.customers = this.customers.filter(
//             (customer) => customer.id !== customerId
//           );
//           alert("Customer deleted successfully");
//         } else {
//           const data = await res.json();
//           alert("Failed to delete customer: " + data.message);
//         }
//       } catch (error) {
//         console.error("Error deleting customer:", error);
//       }
//     },
//     async deleteProfessional(professionalId) {
//       try {
//         const res = await fetch(
//           `/api/service_professionals/${professionalId}`,
//           {
//             method: "DELETE",
//           }
//         );
//         if (res.ok) {
//           this.professionals = this.professionals.filter(
//             (professional) => professional.id !== professionalId
//           );
//           alert("Professional deleted successfully");
//         } else {
//           const data = await res.json();
//           alert("Failed to delete professional: " + data.message);
//         }
//       } catch (error) {
//         console.error("Error deleting professional:", error);
//       }
//     },
//     // Toggle current page based on the selected navigation
//     navigateTo(page) {
//       this.currentPage = page;
//     },
//   },
// };

// export default {
//   template: `
//     <div id="admin-dashboard">
//       <div class="container">
//         <div class="row">
//           <div class="col-12">
//             <h2 class="text-center" style="text-decoration: underline;">Admin Dashboard</h2>
//           </div>
//         </div>

//         <nav class="navbar navbar-expand-lg navbar-light bg-light">
//           <a class="navbar-brand" href="#">Admin Dashboard</a>
//           <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
//             <span class="navbar-toggler-icon"></span>
//           </button>
//           <div class="collapse navbar-collapse" id="navbarNav">
//             <ul class="navbar-nav">
//               <li class="nav-item dropdown">
//                 <a class="nav-link dropdown-toggle" href="#" id="navbarDropdownMenuLink" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
//                   Manage Customers
//                 </a>
//                 <div class="dropdown-menu" aria-labelledby="navbarDropdownMenuLink">
//                   <router-link class="dropdown-item" :to="'/customers'">Fetch Customers</router-link>
//                 </div>
//               </li>
//               <!-- Add other navigation items similarly -->
//             </ul>
//           </div>
//         </nav>

//         <!-- Customers Section -->
//         <div class="row mt-5" v-if="currentPage === 'customers'">
//           <div class="col-12">
//             <h3>Manage Customers</h3>
//             <ul v-if="customers.length > 0" class="list-group mt-3">
//               <li v-for="customer in customers" :key="customer.id" class="list-group-item">
//                 <div class="d-flex justify-content-between">
//                   <span>{{ customer.name }} ({{ customer.email }})</span>
//                   <button class="btn btn-danger" @click="deleteCustomer(customer.id)">Delete</button>
//                 </div>
//               </li>
//             </ul>
//             <div v-else class="mt-3">
//               <p>No customers found.</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   `,
//   data() {
//     return {
//       customers: [],
//       currentPage: "customers",
//     };
//   },
//   watch: {
//     // Watch the route and trigger data loading when it changes
//     $route(to) {
//       if (to.path === "/customers") {
//         this.fetchCustomers();
//         this.currentPage = "customers";
//       }
//     },
//   },
//   created() {
//     // Fetch customers initially if the current route matches
//     if (this.$route.path === "/customers") {
//       this.fetchCustomers();
//     }
//   },
//   methods: {
//     async fetchCustomers() {
//       try {
//         const res = await fetch("/api/customers");
//         const data = await res.json();
//         if (res.ok) {
//           this.customers = data;
//         } else {
//           console.error("Failed to fetch customers:", data.message);
//         }
//       } catch (error) {
//         console.error("Error fetching customers:", error);
//       }
//     },
//     async deleteCustomer(customerId) {
//       try {
//         const res = await fetch(`/api/customers/${customerId}`, {
//           method: "DELETE",
//         });
//         if (res.ok) {
//           this.customers = this.customers.filter(
//             (customer) => customer.id !== customerId
//           );
//           alert("Customer deleted successfully");
//         } else {
//           const data = await res.json();
//           alert("Failed to delete customer: " + data.message);
//         }
//       } catch (error) {
//         console.error("Error deleting customer:", error);
//       }
//     },
//   },
// };
export default {
  template: `
  <div id="admin-dashboard">
    <div class="container">
      <div class="row">
        <div class="col-12">
          <h2 class="text-center" style="text-decoration: underline;">Admin Dashboard</h2>
        </div>
      </div>

      <!-- Customers Section -->
      <div class="row mt-5" v-if="currentPage === 'customers'">
        <div class="col-12">
          <h3>Manage Customers</h3>
          <button class="btn btn-primary" @click="fetchCustomers">Fetch Customers</button>
          <ul v-if="customers.length > 0" class="list-group mt-3">
            <li v-for="customer in customers" :key="customer.id" class="list-group-item">
              <div class="d-flex justify-content-between">
                <span>{{ customer.name }} ({{ customer.email }})</span>
                <button class="btn btn-danger" @click="deleteCustomer(customer.id)">Delete</button>
              </div>
            </li>
          </ul>
          <div v-else class="mt-3">
            <p>No customers found.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
`,
  data() {
    return {
      customers: [],
      currentPage: "customers",
    };
  },
  watch: {
    // Watch the route and trigger data loading when it changes
    $route(to) {
      if (to.path === "/customers") {
        this.fetchCustomers();
        this.currentPage = "customers";
      }
    },
  },
  created() {
    // Fetch customers initially if the current route matches
    if (this.$route.path === "/customers") {
      this.fetchCustomers();
    }
  },
  methods: {
    async fetchCustomers() {
      try {
        const res = await fetch("/api/customers");
        const data = await res.json();
        if (res.ok) {
          this.customers = data;
        } else {
          console.error("Failed to fetch customers:", data.message);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    },
    async deleteCustomer(customerId) {
      try {
        const res = await fetch(`/api/customers/${customerId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          this.customers = this.customers.filter(
            (customer) => customer.id !== customerId
          );
          alert("Customer deleted successfully");
        } else {
          const data = await res.json();
          alert("Failed to delete customer: " + data.message);
        }
      } catch (error) {
        console.error("Error deleting customer:", error);
      }
    },
  },
};
