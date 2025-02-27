export default {
  template: `
    <div>
      <div id="container">
        <div id="panel">
          <h2 class="title">Logistics Page</h2>
          <div class="charts-wrapper">
            <div class="chart-container">
              <canvas id="statusChart"></canvas>
              <p class="chart-title">Service Completion Status</p>
            </div>
            <div class="chart-container">
              <canvas id="requestsChart"></canvas>
              <p class="chart-title">Service Requests Over Time</p>
            </div>
            <div class="chart-container">
              <canvas id="ratingsChart"></canvas>
              <p class="chart-title">Customer Ratings Over Time</p>
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
    const userId = user ? user.professional_id : null;
    if (!userId) {
      console.error("User ID is not available");
      return;
    }

    fetch(`/api/professional-service-summary/${userId}`, {
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
        this.renderCharts(data);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  },

  methods: {
    renderCharts(data) {
      new Chart(document.getElementById("statusChart").getContext("2d"), {
        type: "doughnut",
        data: {
          labels: data.status_data.labels,
          datasets: [
            {
              label: "Service Status",
              backgroundColor: [
                "rgba(54, 162, 235, 0.6)",
                "rgba(255, 99, 132, 0.6)",
                "rgba(255, 206, 86, 0.6)",
                "rgba(75, 192, 192, 0.6)",
              ],
              data: data.status_data.values,
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });

      new Chart(document.getElementById("requestsChart").getContext("2d"), {
        type: "line",
        data: {
          labels: data.requests_over_time.labels,
          datasets: [
            {
              label: "Service Requests",
              backgroundColor: "rgba(255, 159, 64, 0.6)",
              borderColor: "rgba(255, 159, 64, 1)",
              data: data.requests_over_time.values,
              fill: false,
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });

      new Chart(document.getElementById("ratingsChart").getContext("2d"), {
        type: "line",
        data: {
          labels: data.ratings_over_time.labels,
          datasets: [
            {
              label: "Average Ratings",
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderColor: "rgba(75, 192, 192, 1)",
              data: data.ratings_over_time.values,
              fill: false,
            },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false },
      });
    },

    async exportFile(type) {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const userId = user ? user.professional_id : null;
        if (!userId) {
          console.error("User ID is not available");
          return;
        }

        const response = await fetch(
          `/api/professional/generate_report?file_type=${type}&professional_id=${userId}`,
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
          type === "csv"
            ? "Professional_Report.zip"
            : "Professional_Report.xlsx";
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
