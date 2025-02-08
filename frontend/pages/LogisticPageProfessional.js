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
                <canvas id="requestsChart"></canvas>
                <p class="chart-title">Service Requests Over Time</p>
                </div>
                <div class="chart-container">
                <canvas id="ratingsChart"></canvas>
                <p class="chart-title">Customer Ratings Over Time</p>
                </div>
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
        new Chart(document.getElementById("statusChart").getContext("2d"), {
          type: "doughnut",
          data: statusData,
          options: { responsive: true, maintainAspectRatio: false },
        });

        // Service Requests Over Time (Line Chart)
        const requestsData = {
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
        };
        new Chart(document.getElementById("requestsChart").getContext("2d"), {
          type: "line",
          data: requestsData,
          options: { responsive: true, maintainAspectRatio: false },
        });

        // Customer Ratings Over Time (Line Chart)
        const ratingsData = {
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
        };
        new Chart(document.getElementById("ratingsChart").getContext("2d"), {
          type: "line",
          data: ratingsData,
          options: { responsive: true, maintainAspectRatio: false },
        });
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  },
};
