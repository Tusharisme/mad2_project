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
    // Helper methods for button hover effects
    setButtonHoverColor(event, color) {
      event.target.style.backgroundColor = color;
    },
    setButtonDefaultColor(event, color) {
      event.target.style.backgroundColor = color;
    },
  },
  template: `
    <div id="all-customers-page" style="padding: 30px 0; background-color: #f8f9fa;">
      <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 20px; background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <h4 style="text-decoration: underline; margin-bottom: 25px; color: #2c3e50; font-weight: 600;">Customers</h4>

        <table v-if="customers.length > 0" style="box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); border-radius: 5px; overflow: hidden; width: 100%; margin-bottom: 30px; border-collapse: collapse; background: linear-gradient(to bottom, #ffffff, #f5f7fa);" class="table table-bordered table-hover table-custom">
          <thead style="background-color: #2c3e50; color: white; border: none;" class="table-dark-custom">
            <tr>
              <th scope="col" style="padding: 15px 10px; font-weight: 500;">ID</th>
              <th scope="col" style="padding: 15px 10px; font-weight: 500;">Name</th>
              <th scope="col" style="padding: 15px 10px; font-weight: 500;">Email</th>
              <th scope="col" style="padding: 15px 10px; font-weight: 500;">Phone</th>
              <th scope="col" style="padding: 15px 10px; font-weight: 500;">Blocked Status</th>
              <th scope="col" style="padding: 15px 10px; font-weight: 500;">Average Rating</th>
              <th scope="col" style="padding: 15px 10px; font-weight: 500;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="customer in customers" :key="customer.id" style="transition: background-color 0.2s ease;">
              <td style="padding: 12px 10px; vertical-align: middle; border-bottom: 1px solid #e0e0e0; background-color: rgba(255, 255, 255, 0.6);">
                <a  style="color: #3498db; text-decoration: none; font-weight: 500;">{{ customer.id }}</a>
              </td>
              <td style="padding: 12px 10px; vertical-align: middle; border-bottom: 1px solid #e0e0e0; background-color: rgba(255, 255, 255, 0.6);">{{ customer.name }}</td>
              <td style="padding: 12px 10px; vertical-align: middle; border-bottom: 1px solid #e0e0e0; background-color: rgba(255, 255, 255, 0.6);">{{ customer.email }}</td>
              <td style="padding: 12px 10px; vertical-align: middle; border-bottom: 1px solid #e0e0e0; background-color: rgba(255, 255, 255, 0.6);">{{ customer.phone_no }}</td>
              <td style="padding: 12px 10px; vertical-align: middle; border-bottom: 1px solid #e0e0e0; background-color: rgba(255, 255, 255, 0.6);">
                <span :style="customer.is_blocked ? 
                  'display: inline-block; padding: 5px 10px; border-radius: 4px; font-size: 0.85rem; font-weight: 500; background-color: #e74c3c; color: white;' : 
                  'display: inline-block; padding: 5px 10px; border-radius: 4px; font-size: 0.85rem; font-weight: 500; background-color: #2ecc71; color: white;'">
                  {{ customer.is_blocked ? 'Blocked' : 'Not Blocked' }}
                </span>
              </td>
              <td style="padding: 12px 10px; vertical-align: middle; border-bottom: 1px solid #e0e0e0; background-color: rgba(255, 255, 255, 0.6);">{{ customer.average_rating || 'N/A' }}</td>
              <td style="padding: 12px 10px; vertical-align: middle; border-bottom: 1px solid #e0e0e0; display: flex; gap: 8px; background-color: rgba(255, 255, 255, 0.6);">
                <button 
                  style="border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: 500; transition: all 0.2s ease; background-color: #e74c3c; color: white;"
                  @click="deleteCustomer(customer.id)"
                  @mouseover="setButtonHoverColor($event, '#c0392b')"
                  @mouseout="setButtonDefaultColor($event, '#e74c3c')"
                >
                  Delete
                </button>
                <button 
                  :style="customer.is_blocked ? 
                    'border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: 500; transition: all 0.2s ease; background-color: #2ecc71; color: white;' : 
                    'border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: 500; transition: all 0.2s ease; background-color: #f39c12; color: white;'"
                  @click="toggleBlockCustomer(customer.id, customer.is_blocked)"
                  @mouseover="setButtonHoverColor($event, customer.is_blocked ? '#27ae60' : '#d35400')"
                  @mouseout="setButtonDefaultColor($event, customer.is_blocked ? '#2ecc71' : '#f39c12')"
                >
                  {{ customer.is_blocked ? 'Unblock' : 'Block' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-else style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; text-align: center; color: #7f8c8d;">
          <p>No customers available.</p>
        </div>
      </div>
    </div>
  `,
};
