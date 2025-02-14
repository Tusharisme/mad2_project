export default {
  template: `
      <div class="container mt-4">
        <h3 class="text-center">Professional Payment History</h3>
  
        <div class="wallet-balance text-center mb-3">
          <h5>Wallet Balance: ₹{{ wallet?.balance.toFixed(2) || '0.00' }}</h5>
        </div>
  
        <table class="table table-bordered">
          <thead class="table-dark">
            <tr>
              <th>#</th>
              <th>Customer Name</th>
              <th>Amount Paid</th>
              <th>Payment Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(payment, index) in payments" :key="payment.id">
              <td>{{ index + 1 }}</td>
              <td>{{ payment.customer_name }}</td>
              <td>₹{{ payment.amount ? payment.amount.toFixed(2) : '0.00' }}</td>
              <td>
  <span class="badge"
    :class="{
      'text-bg-success': payment.payment_status === 'Completed',
      'text-bg-primary': payment.payment_status === 'Cancelled',
      'text-bg-warning': payment.payment_status === 'Pending',
      'text-bg-danger': payment.payment_status === 'Refunded'
    }">
    {{ payment.payment_status }}
  </span>
</td>
              <td>{{ formatDate(payment.date_of_payment) }}</td>
            </tr>
            <tr v-if="payments.length === 0">
              <td colspan="5" class="text-center">No payment history available</td>
            </tr>
          </tbody>
        </table>
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
