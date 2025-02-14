export default {
  template: `
        <div class="container mt-4">
            <h3 class="text-center">Payment History</h3>
  
            <div class="wallet-balance text-center mb-3">
                <h5>Wallet Balance: ₹{{ walletBalance }}</h5>
            </div>
  
            <table class="table table-bordered">
                <thead class="table-dark">
                    <tr>
                        <th>#</th>
                        <th>Service</th>
                        <th>Professional</th>
                        <th>Amount</th>
                        <th>Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(payment, index) in payments" :key="payment.id">
                        <td>{{ index + 1 }}</td>
                        <td>{{ payment.service_name }}</td>
                        <td>{{ payment.professional_name }} ({{ payment.professional_email }})</td>
                        <td>₹{{ payment.amount.toFixed(2) }}</td>
                        <td>{{ formatDate(payment.date_of_payment) }}</td>
                        <td>
                            <span class="badge"
                                  :class="{'text-bg-success': payment.payment_status === 'Completed',
                                           'text-bg-warning': payment.payment_status === 'Pending',
                                           'text-bg-primary': payment.payment_status === 'Refunded',
                                           'text-bg-danger': payment.payment_status === 'Cancelled'}">
                                {{ payment.payment_status }}
                            </span>
                        </td>
                    </tr>
                    <tr v-if="payments.length === 0">
                        <td colspan="6" class="text-center">No payment history available</td>
                    </tr>
                </tbody>
            </table>
        </div>
      `,

  data() {
    return {
      payments: [],
      walletBalance: 0.0,
    };
  },

  mounted() {
    this.fetchPaymentHistory();
  },

  methods: {
    async fetchPaymentHistory() {
      try {
        const response = await fetch("/api/customer/payments", {
          headers: { "Authentication-Token": this.$store.state.auth_token },
        });

        if (!response.ok) throw new Error("Failed to fetch payment history");

        const data = await response.json();
        this.payments = data.payments;
        this.walletBalance = data.wallet.balance;
      } catch (error) {
        console.error(error);
        alert("Error fetching payment history.");
      }
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    },
  },
};
