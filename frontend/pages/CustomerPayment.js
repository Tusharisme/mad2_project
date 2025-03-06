export default {
  template: `
    <div class="container mt-5">
      <div class="header-section">
        <h3>Payment History</h3>
      </div>
      
      <div class="card mb-4">
        <div class="card-body text-center">
          <h5 class="card-title">Wallet Balance</h5>
          <p class="price-amount">₹{{ walletBalance.toFixed(2) }}</p>
        </div>
      </div>
      
      <div class="card">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-custom mb-0">
              <thead class="table-dark-custom">
                <tr>
                  <th class="ps-4">#</th>
                  <th>Service</th>
                  <th>Professional</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th class="pe-4">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(payment, index) in payments" :key="payment.id">
                  <td class="ps-4">{{ index + 1 }}</td>
                  <td>{{ payment.service_name }}</td>
                  <td>{{ payment.professional_name }} <span class="text-muted small">({{ payment.professional_email }})</span></td>
                  <td>₹{{ payment.amount.toFixed(2) }}</td>
                  <td>{{ formatDate(payment.date_of_payment) }}</td>
                  <td class="pe-4">
                    <span class="status-badge" :class="{
                      'status-completed': payment.payment_status === 'Completed',
                      'status-pending': payment.payment_status === 'Pending',
                      'status-refunded': payment.payment_status === 'Refunded',
                      'status-cancelled': payment.payment_status === 'Cancelled'
                    }">
                      {{ payment.payment_status }}
                    </span>
                  </td>
                </tr>
                <tr v-if="payments.length === 0">
                  <td colspan="6" class="text-center py-4">
                    <div class="no-results">
                      <p>No payment history available</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
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
    this.addCustomStyles();
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

    addCustomStyles() {
      // Add component-specific styles
      const style = document.createElement("style");
      style.textContent = `
        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 50px;
          font-size: 0.8rem;
          font-weight: 500;
          text-align: center;
          min-width: 100px;
        }
        
        .status-completed {
          background-color: rgba(39, 174, 96, 0.15);
          color: #27ae60;
        }
        
        .status-pending {
          background-color: rgba(243, 156, 18, 0.15);
          color: #f39c12;
        }
        
        .status-refunded {
          background-color: rgba(52, 152, 219, 0.15);
          color: #3498db;
        }
        
        .status-cancelled {
          background-color: rgba(192, 57, 43, 0.15);
          color: #c0392b;
        }
        
        .no-results {
          padding: 20px;
          text-align: center;
          color: #777;
        }
        
        .price-amount {
          font-size: 2rem;
          font-weight: 700;
          color: #8b4513;
          margin: 10px 0 0;
        }
      `;
      document.head.appendChild(style);
    },
  },
};
