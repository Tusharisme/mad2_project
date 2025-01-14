export default {
  data() {
    return {
      customers: [],
    };
  },
  created() {
    this.fetchCustomers(); // Automatically fetch customers when the page loads
  },
  methods: {
    async fetchCustomers() {
      try {
        const token = this.$store.state.auth_token;

        if (!token) {
          console.error("No authentication token found");
          return;
        }

        const res = await fetch("/api/customers", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": token,
          },
        });

        if (res.ok) {
          const data = await res.json();
          this.customers = data;
        } else {
          console.error("Failed to fetch customers:", res.statusText);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    },
    async deleteCustomer(customerId) {
      try {
        const token = this.$store.state.auth_token;

        if (!token) {
          console.error("No authentication token found");
          return;
        }

        const res = await fetch(`/api/customers/${customerId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": token,
          },
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
  template: `
    <div id="all-customers-page">
      <div class="container">
        <h4 style="text-decoration: underline;">Customers</h4>

        <table v-if="customers.length > 0" class="table table-bordered table-hover table-custom">
          <thead class="table-dark-custom">
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Name</th>
              <th scope="col">Email</th>
              <th scope="col">Phone</th>
              <th scope="col">Blocked Status</th>
              <th scope="col">Average Rating</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="customer in customers" :key="customer.id">
              <td><a :href="'/customers/' + customer.id">{{ customer.id }}</a></td>
              <td>{{ customer.name }}</td>
              <td>{{ customer.email }}</td>
              <td>{{ customer.phone_no }}</td>
              <td>{{ customer.is_blocked ? 'Blocked' : 'Not Blocked' }}</td>
              <td>{{ customer.average_rating || 'N/A' }}</td>
              <td>
                <button class="btn btn-danger" @click="deleteCustomer(customer.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else class="mt-3">
          <p>No customers available.</p>
        </div>
      </div>
    </div>
  `,
};
