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

      const configs = {
        requests: {
          type: "pie",
          data: {
            labels: Object.keys(data),
            datasets: [
              {
                data: Object.values(data),
                backgroundColor: ["green", "red", "blue", "orange"],
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
                maxBarThickness: 100, // Set maximum bar thickness in pixels
              },
            ],
          },
          options: {
            maintainAspectRatio: true,
            responsive: true,
            elements: {
              bar: {
                barPercentage: 0.9,
                categoryPercentage: 0.1,
              },
            },
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
                maxBarThickness: 100, // Set maximum bar thickness in pixels
              },
            ],
          },
          options: {
            maintainAspectRatio: true,
            responsive: true,

            elements: {
              bar: {
                barPercentage: 0.5,
                categoryPercentage: 0.8,
              },
            },
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
                maxBarThickness: 100, // Set maximum bar thickness in pixels
              },
            ],
          },
          options: {
            elements: {
              maintainAspectRatio: true,
              responsive: true,
              bar: {
                barPercentage: 0.5,
                categoryPercentage: 0.8,
              },
            },
          },
        },
      };

      try {
        this.charts[type] = new Chart(ctx, configs[type]);
        console.log(`Chart created successfully for type: ${type}`);
      } catch (err) {
        console.error(
          `Error creating chart for type '${type}': ${err.message}`
        );
      }
    },
  },
};
