export default {
  template: `
  <div id="admin-dashboard" class="container py-5">
    <div class="header-section mb-5">
      <h2 class="text-center">Admin Dashboard</h2>
    </div>
    
    <div class="card search-form-card mb-5">
      <div class="card-body">
        <div class="d-flex justify-content-center gap-3 mb-4">
          <button class="btn btn-custom px-4 py-2" @click="exportFile('csv')">
            <i class="fas fa-file-csv me-2"></i>Export as CSV (ZIP)
          </button>
          <button class="btn btn-success-custom px-4 py-2" @click="exportFile('xlsx')">
            <i class="fas fa-file-excel me-2"></i>Export as Excel
          </button>
        </div>
        
        <!-- Tabs for different insights -->
        <ul class="nav nav-tabs mb-4">
          <li class="nav-item" v-for="tab in tabs" :key="tab.value">
            <a class="nav-link" :class="{ active: activeTab === tab.value }" 
               @click="changeTab(tab.value)">{{ tab.label }}</a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Chart Container -->
    <div class="charts-wrapper">
      <div class="chart-container" v-show="activeTab === 'requests'">
        <canvas id="requestsChart"></canvas>
        <h4 class="chart-title mt-3">Service Requests Overview</h4>
      </div>
      
      <div class="chart-container w-full" v-show="activeTab === 'trends'">
        <canvas id="trendsChart"></canvas>
        <h4 class="chart-title mt-3">Monthly Trends</h4>
      </div>
      
      <div class="chart-container w-full" v-show="activeTab === 'topServices'">
        <canvas id="topServicesChart"></canvas>
        <h4 class="chart-title mt-3">Top Services</h4>
      </div>
      
      <div class="chart-container w-full" v-show="activeTab === 'ratings'">
        <canvas id="ratingsChart"></canvas>
        <h4 class="chart-title mt-3">Professional Ratings</h4>
      </div>
      
      <div class="chart-container w-full" v-show="activeTab === 'pincode'">
        <canvas id="pincodeChart"></canvas>
        <h4 class="chart-title mt-3">Requests by Pincode</h4>
      </div>
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

    // Add custom styling for the active tab
    document.head.insertAdjacentHTML(
      "beforeend",
      `
      <style>
        .nav-tabs .nav-link {
          cursor: pointer;
          color: #333;
          border-bottom: 2px solid transparent;
          padding: 10px 20px;
          transition: all 0.3s;
          font-weight: 500;
        }
        
        .nav-tabs .nav-link.active {
          color: #8b4513;
          background-color: transparent;
          border-color: transparent;
          border-bottom: 2px solid #8b4513;
        }
        
        .nav-tabs .nav-link:hover:not(.active) {
          background-color: #f4eae1;
          border-color: transparent;
          border-bottom: 2px solid #d1c6a7;
        }
        
        .chart-container {
          transition: all 0.3s ease;
          transform: translateY(0);
          opacity: 1;
          height: 400px !important; /* Set explicit height */
          max-width: 900px;
          margin: 0 auto;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .chart-container {
          animation: fadeIn 0.5s ease-out;
        }
      </style>
    `
    );
  },

  beforeDestroy() {
    this.cleanupCharts();
  },

  methods: {
    async exportFile(type) {
      try {
        const response = await fetch(
          `/api/admin/generate_report?file_type=${type}`,
          {
            headers: {
              "Authentication-Token": this.$store.state.auth_token,
            },
          }
        );
        if (!response.ok) throw new Error("Failed to generate report");

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download =
          type === "csv" ? "Admin_Reports.zip" : "Admin_Reports.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error generating report:", error);
        alert("Failed to generate report");
      }
    },

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

      // Enhanced color palettes that match your theme
      const colorPalettes = {
        requests: ["#8b4513", "#d1c6a7", "#a05c2b", "#e0d0c0"],
        trends: {
          borderColor: "#8b4513",
          backgroundColor: "rgba(139, 69, 19, 0.1)",
        },
        topServices: ["#8b4513", "#a05c2b", "#c77c3c", "#d1c6a7", "#e0d0c0"],
        ratings: ["#ffd700", "#ffcc00", "#e6b800", "#ccb800", "#b39700"],
        pincode: ["#8b4513", "#a05c2b", "#c77c3c", "#d1c6a7", "#e0d0c0"],
      };

      const configs = {
        requests: {
          type: "doughnut",
          data: {
            labels: Object.keys(data),
            datasets: [
              {
                data: Object.values(data),
                backgroundColor: colorPalettes.requests,
                borderWidth: 1,
                borderColor: "#fff",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  padding: 20,
                  font: {
                    size: 12,
                    family: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                  },
                },
              },
              tooltip: {
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                titleColor: "#333",
                bodyColor: "#333",
                borderColor: "#d1c6a7",
                borderWidth: 1,
                padding: 15,
                cornerRadius: 8,
                boxPadding: 10,
                usePointStyle: true,
              },
            },
            animation: {
              animateScale: true,
              animateRotate: true,
            },
          },
        },
        trends: {
          type: "line",
          data: {
            labels: data.months,
            datasets: [
              {
                label: "Monthly Requests",
                data: data.counts,
                borderColor: colorPalettes.trends.borderColor,
                backgroundColor: colorPalettes.trends.backgroundColor,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: "#8b4513",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "top",
                labels: {
                  font: {
                    size: 14,
                    family: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                  },
                },
              },
              tooltip: {
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                titleColor: "#333",
                bodyColor: "#333",
                borderColor: "#d1c6a7",
                borderWidth: 1,
                cornerRadius: 8,
              },
            },
            scales: {
              x: {
                grid: {
                  display: false,
                },
              },
              y: {
                beginAtZero: true,
                grid: {
                  color: "rgba(0, 0, 0, 0.05)",
                },
              },
            },
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
                backgroundColor: function (context) {
                  const index = context.dataIndex;
                  return colorPalettes.topServices[
                    index % colorPalettes.topServices.length
                  ];
                },
                borderRadius: 6,
                maxBarThickness: 60,
              },
            ],
          },
          options: {
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
              legend: {
                position: "top",
                labels: {
                  font: {
                    size: 14,
                    family: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                  },
                },
              },
              tooltip: {
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                titleColor: "#333",
                bodyColor: "#333",
                borderColor: "#d1c6a7",
                borderWidth: 1,
                cornerRadius: 8,
              },
            },
            scales: {
              x: {
                grid: {
                  display: false,
                },
              },
              y: {
                beginAtZero: true,
                grid: {
                  color: "rgba(0, 0, 0, 0.05)",
                },
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
                backgroundColor: function (context) {
                  const index = context.dataIndex;
                  return colorPalettes.ratings[
                    index % colorPalettes.ratings.length
                  ];
                },
                borderRadius: 6,
                maxBarThickness: 60,
              },
            ],
          },
          options: {
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
              legend: {
                position: "top",
                labels: {
                  font: {
                    size: 14,
                    family: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                  },
                },
              },
              tooltip: {
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                titleColor: "#333",
                bodyColor: "#333",
                borderColor: "#d1c6a7",
                borderWidth: 1,
                cornerRadius: 8,
              },
            },
            scales: {
              x: {
                grid: {
                  display: false,
                },
              },
              y: {
                beginAtZero: true,
                max: 5,
                grid: {
                  color: "rgba(0, 0, 0, 0.05)",
                },
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
                backgroundColor: function (context) {
                  const index = context.dataIndex;
                  return colorPalettes.pincode[
                    index % colorPalettes.pincode.length
                  ];
                },
                borderRadius: 6,
                maxBarThickness: 60,
              },
            ],
          },
          options: {
            maintainAspectRatio: false,
            responsive: true,
            plugins: {
              legend: {
                position: "top",
                labels: {
                  font: {
                    size: 14,
                    family: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                  },
                },
              },
              tooltip: {
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                titleColor: "#333",
                bodyColor: "#333",
                borderColor: "#d1c6a7",
                borderWidth: 1,
                cornerRadius: 8,
              },
            },
            scales: {
              x: {
                grid: {
                  display: false,
                },
              },
              y: {
                beginAtZero: true,
                grid: {
                  color: "rgba(0, 0, 0, 0.05)",
                },
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
