export default {
  template: `
  <div id="admin-dashboard" class="container">
    <h2 class="text-center" style="text-decoration: underline;">Admin Dashboard</h2>

    <!-- Tabs for different insights -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item" v-for="tab in tabs" :key="tab.value">
        <a class="nav-link" :class="{ active: activeTab === tab.value }" 
           @click="changeTab(tab.value)">{{ tab.label }}</a>
      </li>
    </ul>

    <!-- Graphs -->
    <div v-for="tab in tabs" :key="tab.value">
      <canvas :id="tab.value + 'Chart'" v-show="activeTab === tab.value"></canvas>
    </div>
  </div>
  `,

  data() {
    return {
      activeTab: "requests",
      charts: {},
      tabs: [
        { value: "requests", label: "Service Requests Overview" },
        { value: "trends", label: "Monthly Trends" },
        { value: "topServices", label: "Top Services" },
        { value: "ratings", label: "Professional Ratings" },
        { value: "pincode", label: "Requests by Pincode" },
      ],
    };
  },

  mounted() {
    console.log("Admin Dashboard mounted.");
    this.fetchChartData("requests");
  },

  beforeDestroy() {
    this.cleanupCharts();
  },

  methods: {
    changeTab(newTab) {
      if (this.activeTab === newTab) return;

      this.cleanupChart(this.activeTab);
      this.activeTab = newTab;
      this.$nextTick(() => {
        this.fetchChartData(newTab);
      });
    },

    cleanupCharts() {
      Object.values(this.charts).forEach(this.destroyChart);
      this.charts = {};
    },

    cleanupChart(type) {
      if (this.charts[type]) {
        this.destroyChart(this.charts[type]);
        this.charts[type] = null;
      }
    },

    destroyChart(chart) {
      try {
        chart.destroy();
      } catch (err) {
        console.warn(`Error destroying chart: ${err.message}`);
      }
    },

    async fetchChartData(type) {
      console.log(`Fetching chart data for type: ${type}`);
      const urls = {
        requests: "/api/service_requests/stats",
        trends: "/api/service_requests/monthly",
        topServices: "/api/services/popular",
        ratings: "/api/professionals/ratings",
        pincode: "/api/service_requests/pincode_distribution",
      };

      try {
        const res = await fetch(urls[type]);
        const data = await res.json();
        if (res.ok) {
          this.renderChart(type, data);
        } else {
          console.error("Failed to fetch chart data:", data.message);
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    },

    renderChart(type, data) {
      console.log(`Rendering chart for type: ${type}`);
      const chartId = `${type}Chart`;
      const chartElement = document.getElementById(chartId);

      if (!chartElement) {
        console.error(`Canvas element with ID '${chartId}' not found.`);
        return;
      }

      const ctx = chartElement.getContext("2d");

      let config;

      if (type === "requests") {
        // Check if data is an array
        if (Array.isArray(data)) {
          const labels = data.map((item) => item[0]);
          const counts = data.map((item) => item[1]);
          config = {
            type: "pie",
            data: {
              labels: labels,
              datasets: [
                {
                  data: counts,
                  backgroundColor: ["green", "red", "blue", "orange"],
                },
              ],
            },
          };
        } else if (typeof data === "object" && data !== null) {
          // If data is an object, use its keys and values
          const labels = Object.keys(data);
          const counts = Object.values(data);
          config = {
            type: "pie",
            data: {
              labels: labels,
              datasets: [
                {
                  data: counts,
                  backgroundColor: ["green", "red", "blue", "orange"],
                },
              ],
            },
          };
        } else {
          console.error("Unexpected data format for requests chart");
          return;
        }
      } else {
        // Use the predefined configs for other chart types
        config = {
          requests: {
            type: "pie",
            data: {
              labels: ["Pending", "Accepted", "Completed", "Rejected"],
              datasets: [
                {
                  data: data.counts,
                  backgroundColor: ["blue", "green", "orange", "red"],
                },
              ],
            },
          },
          trends: {
            type: "line",
            data: {
              labels: data.months,
              datasets: [
                {
                  label: "Requests",
                  data: data.counts,
                  borderColor: "blue",
                  fill: false,
                },
              ],
            },
          },
          topServices: {
            type: "bar",
            data: {
              labels: data.services,
              datasets: [
                {
                  label: "Bookings",
                  data: data.counts,
                  backgroundColor: "purple",
                },
              ],
            },
          },
          ratings: {
            type: "bar",
            data: {
              labels: data.professionals,
              datasets: [
                {
                  label: "Ratings",
                  data: data.ratings,
                  backgroundColor: "gold",
                },
              ],
            },
          },
          pincode: {
            type: "bar",
            data: {
              labels: data.pincodes,
              datasets: [
                {
                  label: "Requests",
                  data: data.counts,
                  backgroundColor: "teal",
                },
              ],
            },
          },
        }[type];
      }

      try {
        this.charts[type] = new Chart(ctx, config);
        console.log(`Chart created successfully for type: ${type}`);
      } catch (err) {
        console.error(
          `Error creating chart for type '${type}': ${err.message}`
        );
      }
    },
  },
};
