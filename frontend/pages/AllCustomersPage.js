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
    async toggleBlockCustomer(customerId, currentStatus) {
      try {
        const token = this.$store.state.auth_token;
        if (!token) {
          console.error("No authentication token found");
          return;
        }

        const action = currentStatus ? "unblock" : "block";
        const response = await fetch(`/api/customers/${action}/${customerId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": token,
          },
        });

        if (response.ok) {
          await this.fetchCustomers(); // Refresh the customer list
          alert(`Customer ${action}ed successfully`);
        } else {
          const data = await response.json();
          alert(`Failed to ${action} customer: ${data.message}`);
        }
      } catch (error) {
        console.error(
          `Error ${currentStatus ? "unblocking" : "blocking"} customer:`,
          error
        );
        alert("An error occurred while updating customer status");
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
            <th scope="col">Actions</th>
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
              <button 
                class="btn btn-danger-custom me-2" 
                @click="deleteCustomer(customer.id)"
              >
                Delete
              </button>
              <button 
                :class="['btn', customer.is_blocked ? 'btn-success-custom' : 'btn-warning']"
                @click="toggleBlockCustomer(customer.id, customer.is_blocked)"
              >
                {{ customer.is_blocked ? 'Unblock' : 'Block' }}
              </button>
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
