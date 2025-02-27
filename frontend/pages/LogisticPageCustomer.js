export default {
  template: `
  <div>
  <div id="container">
    <div id="panel">
      <h2 style="text-decoration: underline;">Logistics Page</h2>
      <br>
      <div class="charts-wrapper">
        <div class="chart-container">
          <canvas id="statusChart"></canvas>
          <p class="chart-title">Service Completion Status</p>
        </div>
        <div class="chart-container">
          <canvas id="categoryChart"></canvas>
          <p class="chart-title">Service Categories</p>
        </div>
        <div class="chart-container">
          <canvas id="requestsChart"></canvas>
          <p class="chart-title">Service Requests Over Time</p>
        </div>
      </div>
      <br>
      <div class="export-buttons">
      <button class="btn btn-primary" @click="exportFile('csv')">Export CSV (ZIP)</button>
      <button class="btn btn-success" @click="exportFile('xlsx')">Export Excel</button>
      </div>
    </div>
  </div>
</div>
  `,

  mounted() {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user ? user.user_id : null;
    if (!userId) {
      console.error("User ID is not available");
      return;
    }
    fetch(`/api/customer-service-summary/${userId}`, {
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
        // Service Completion Status (Doughnut Chart)
        const statusData = {
          labels: data.status_data.labels,
          datasets: [
            {
              label: "Service Status",
              backgroundColor: [
                "rgba(54, 162, 235, 0.6)", // Accepted - Blue
                "rgba(255, 99, 132, 0.6)", // Rejected - Red
                "rgba(255, 206, 86, 0.6)", // Completed - Yellow
                "rgba(75, 192, 192, 0.6)", // Pending - Green
              ],
              data: data.status_data.values,
            },
          ],
        };
        const ctxStatus = document
          .getElementById("statusChart")
          .getContext("2d");
        new Chart(ctxStatus, {
          type: "doughnut",
          data: statusData,
          options: {
            responsive: true,
          },
        });

        // Service Category Distribution (Pie Chart)
        const categoryData = {
          labels: data.category_data.labels,
          datasets: [
            {
              label: "Service Categories",
              backgroundColor: [
                "rgba(255, 99, 132, 0.6)", // Red
                "rgba(54, 162, 235, 0.6)", // Blue
                "rgba(255, 206, 86, 0.6)", // Yellow
                "rgba(75, 192, 192, 0.6)", // Green
                "rgba(153, 102, 255, 0.6)", // Purple
                "rgba(255, 159, 64, 0.6)", // Orange
              ],
              data: data.category_data.values,
            },
          ],
        };
        const ctxCategory = document
          .getElementById("categoryChart")
          .getContext("2d");
        new Chart(ctxCategory, {
          type: "pie",
          data: categoryData,
          options: {
            responsive: true,
          },
        });

        // Service Requests Over Time (Line Chart)
        const requestsData = {
          labels: data.requests_over_time.labels,
          datasets: [
            {
              label: "Requests Over Time",
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 0, // Hides the line
              fill: false, // Keeps the line chart without filling under it
              pointBackgroundColor: "rgba(75, 192, 192, 1)", // Color for the points
              pointRadius: 5, // Size of the points
              data: data.requests_over_time.values,
            },
          ],
        };

        const ctxRequests = document
          .getElementById("requestsChart")
          .getContext("2d");
        new Chart(ctxRequests, {
          type: "line", // Line chart to connect points with a line
          data: requestsData,
          options: {
            responsive: true,
            scales: {
              y: {
                beginAtZero: true, // Ensures the y-axis starts at 0
                stepSize: 1, // Makes the Y-axis increment by 1 (0, 1, 2, etc.)
                ticks: {
                  stepSize: 1, // Adds tick marks at 0, 1, 2, etc.
                },
                grid: {
                  display: true, // Ensure grid lines are visible
                  color: "rgba(0, 0, 0, 0.1)", // Light grid lines
                },
              },
              x: {
                grid: {
                  display: false, // Optional: turn off grid for the X-axis if not needed
                },
              },
            },
            elements: {
              line: {
                tension: 0.4, // Smooths the line
              },
            },
          },
        });
      })
      .catch((error) => console.error("Error fetching data:", error)); // ✅ Catch applied to the fetch chain
  },

  methods: {
    async exportFile(type) {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user ? user.customer_id : null;
        if (!userId) {
          console.error("User ID is not available");
          return;
        }

        const response = await fetch(
          `/api/customer/generate_report?file_type=${type}&customer_id=${userId}`,
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
          type === "csv" ? "Customer_Report.zip" : "Customer_Report.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Error generating report:", error);
        alert("Failed to generate report");
      }
    },
  },
};
