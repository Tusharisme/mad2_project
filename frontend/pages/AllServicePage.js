export default {
  template: `
      <div id="all-services-page">
        <div class="container">
          <h2 class="text-center">All Services</h2>
          <button class="btn btn-primary" @click="fetchServices">Fetch Services</button>
          
          <ul v-if="services.length > 0" class="list-group mt-3">
            <li v-for="service in services" :key="service.id" class="list-group-item">
              <div class="d-flex justify-content-between">
                <span>{{ service.name }} ({{ service.base_price }})</span>
                <button class="btn btn-danger" @click="deleteService(service.id)">Delete</button>
              </div>
            </li>
          </ul>
  
          <div v-else class="mt-3">
            <p>No services available.</p>
          </div>
        </div>
      </div>
    `,
  data() {
    return {
      services: [],
    };
  },
  created() {
    this.fetchServices();
  },
  methods: {
    async fetchServices() {
      try {
        const res = await fetch("/api/services");
        const data = await res.json();
        if (res.ok) {
          this.services = data;
        } else {
          console.error("Failed to fetch services:", data.message);
        }
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    },
    async deleteService(serviceId) {
      try {
        const res = await fetch(`/api/services/${serviceId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          this.services = this.services.filter(
            (service) => service.id !== serviceId
          );
          alert("Service deleted successfully");
        } else {
          const data = await res.json();
          alert("Failed to delete service: " + data.message);
        }
      } catch (error) {
        console.error("Error deleting service:", error);
      }
    },
  },
};
