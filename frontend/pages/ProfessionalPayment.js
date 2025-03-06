export default {
  template: `
    <div class="container mt-5">
      <div class="header-section">
        <h3>Professional Payment History</h3>
      </div>
      
      <div class="card mb-4">
        <div class="card-body text-center">
          <h4 class="card-title">Wallet Balance</h4>
          <h2 class="text-center mb-0" style="color: #8b4513;">₹{{ wallet?.balance.toFixed(2) || '0.00' }}</h2>
        </div>
      </div>
      
      <div class="table-responsive">
        <table class="table table-custom">
          <thead class="table-dark-custom">
            <tr>
              <th width="5%">#</th>
              <th width="25%">Customer Name</th>
              <th width="20%">Amount Paid</th>
              <th width="20%">Payment Status</th>
              <th width="30%">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(payment, index) in payments" :key="payment.id">
              <td>{{ index + 1 }}</td>
              <td>{{ payment.customer_name }}</td>
              <td>₹{{ payment.amount ? payment.amount.toFixed(2) : '0.00' }}</td>
              <td>
                <span class="status-badge" 
                  :class="{
                    'completed': payment.payment_status === 'Completed',
                    'accepted': payment.payment_status === 'Cancelled',
                    'pending': payment.payment_status === 'Pending',
                    'rejected': payment.payment_status === 'Refunded'
                  }">
                  {{ payment.payment_status }}
                </span>
              </td>
              <td>{{ formatDate(payment.date_of_payment) }}</td>
            </tr>
            <tr v-if="payments.length === 0">
              <td colspan="5">
                <div class="empty-state">
                  <p>No payment history available</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,

  data() {
    return {
      wallet: { balance: 0.0 }, // Default wallet data
      payments: [],
    };
  },

  mounted() {
    fetch("/api/professional/payments", {
      headers: {
        "Authentication-Token": this.$store.state.auth_token,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        this.wallet = data.wallet || { balance: 0.0 }; // Ensure wallet exists
        this.payments = data.payments;
      })
      .catch((error) => console.error("Error fetching payments:", error));
  },

  methods: {
    formatDate(dateString) {
      if (!dateString) return "N/A";
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },
  },
};
