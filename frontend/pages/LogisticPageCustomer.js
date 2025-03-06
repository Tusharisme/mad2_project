// export default {
//   template: `
//   <div>
//   <div id="container">
//     <div id="panel">
//       <h2 style="text-decoration: underline;">Logistics Page</h2>
//       <br>
//       <div class="charts-wrapper">
//         <div class="chart-container">
//           <canvas id="statusChart"></canvas>
//           <p class="chart-title">Service Completion Status</p>
//         </div>
//         <div class="chart-container">
//           <canvas id="categoryChart"></canvas>
//           <p class="chart-title">Service Categories</p>
//         </div>
//         <div class="chart-container">
//           <canvas id="requestsChart"></canvas>
//           <p class="chart-title">Service Requests Over Time</p>
//         </div>
//       </div>
//       <br>
//       <div class="export-buttons">
//       <button class="btn btn-primary" @click="exportFile('csv')">Export CSV (ZIP)</button>
//       <button class="btn btn-success" @click="exportFile('xlsx')">Export Excel</button>
//       </div>
//     </div>
//   </div>
// </div>
//   `,

//   mounted() {
//     const user = JSON.parse(localStorage.getItem("user"));
//     const userId = user ? user.user_id : null;
//     if (!userId) {
//       console.error("User ID is not available");
//       return;
//     }
//     fetch(`/api/customer-service-summary/${userId}`, {
//       headers: {
//         "Authentication-Token": this.$store.state.auth_token,
//       },
//     })
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error("Network response was not ok");
//         }
//         return response.json();
//       })
//       .then((data) => {
//         // Service Completion Status (Doughnut Chart)
//         const statusData = {
//           labels: data.status_data.labels,
//           datasets: [
//             {
//               label: "Service Status",
//               backgroundColor: [
//                 "rgba(54, 162, 235, 0.6)", // Accepted - Blue
//                 "rgba(255, 99, 132, 0.6)", // Rejected - Red
//                 "rgba(255, 206, 86, 0.6)", // Completed - Yellow
//                 "rgba(75, 192, 192, 0.6)", // Pending - Green
//               ],
//               data: data.status_data.values,
//             },
//           ],
//         };
//         const ctxStatus = document
//           .getElementById("statusChart")
//           .getContext("2d");
//         new Chart(ctxStatus, {
//           type: "doughnut",
//           data: statusData,
//           options: {
//             responsive: true,
//           },
//         });

//         // Service Category Distribution (Pie Chart)
//         const categoryData = {
//           labels: data.category_data.labels,
//           datasets: [
//             {
//               label: "Service Categories",
//               backgroundColor: [
//                 "rgba(255, 99, 132, 0.6)", // Red
//                 "rgba(54, 162, 235, 0.6)", // Blue
//                 "rgba(255, 206, 86, 0.6)", // Yellow
//                 "rgba(75, 192, 192, 0.6)", // Green
//                 "rgba(153, 102, 255, 0.6)", // Purple
//                 "rgba(255, 159, 64, 0.6)", // Orange
//               ],
//               data: data.category_data.values,
//             },
//           ],
//         };
//         const ctxCategory = document
//           .getElementById("categoryChart")
//           .getContext("2d");
//         new Chart(ctxCategory, {
//           type: "pie",
//           data: categoryData,
//           options: {
//             responsive: true,
//           },
//         });

//         // Service Requests Over Time (Line Chart)
//         const requestsData = {
//           labels: data.requests_over_time.labels,
//           datasets: [
//             {
//               label: "Requests Over Time",
//               backgroundColor: "rgba(75, 192, 192, 0.6)",
//               borderColor: "rgba(75, 192, 192, 1)",
//               borderWidth: 0, // Hides the line
//               fill: false, // Keeps the line chart without filling under it
//               pointBackgroundColor: "rgba(75, 192, 192, 1)", // Color for the points
//               pointRadius: 5, // Size of the points
//               data: data.requests_over_time.values,
//             },
//           ],
//         };

//         const ctxRequests = document
//           .getElementById("requestsChart")
//           .getContext("2d");
//         new Chart(ctxRequests, {
//           type: "line", // Line chart to connect points with a line
//           data: requestsData,
//           options: {
//             responsive: true,
//             scales: {
//               y: {
//                 beginAtZero: true, // Ensures the y-axis starts at 0
//                 stepSize: 1, // Makes the Y-axis increment by 1 (0, 1, 2, etc.)
//                 ticks: {
//                   stepSize: 1, // Adds tick marks at 0, 1, 2, etc.
//                 },
//                 grid: {
//                   display: true, // Ensure grid lines are visible
//                   color: "rgba(0, 0, 0, 0.1)", // Light grid lines
//                 },
//               },
//               x: {
//                 grid: {
//                   display: false, // Optional: turn off grid for the X-axis if not needed
//                 },
//               },
//             },
//             elements: {
//               line: {
//                 tension: 0.4, // Smooths the line
//               },
//             },
//           },
//         });
//       })
//       .catch((error) => console.error("Error fetching data:", error)); // ✅ Catch applied to the fetch chain
//   },

//   methods: {
//     async exportFile(type) {
//       try {
//         const user = JSON.parse(localStorage.getItem("user"));
//         const userId = user ? user.customer_id : null;
//         if (!userId) {
//           console.error("User ID is not available");
//           return;
//         }

//         const response = await fetch(
//           `/api/customer/generate_report?file_type=${type}&customer_id=${userId}`,
//           {
//             headers: {
//               "Authentication-Token": this.$store.state.auth_token,
//             },
//           }
//         );

//         if (!response.ok) throw new Error("Failed to generate report");

//         const blob = await response.blob();
//         const url = window.URL.createObjectURL(blob);
//         const link = document.createElement("a");
//         link.href = url;
//         link.download =
//           type === "csv" ? "Customer_Report.zip" : "Customer_Report.xlsx";
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//         window.URL.revokeObjectURL(url);
//       } catch (error) {
//         console.error("Error generating report:", error);
//         alert("Failed to generate report");
//       }
//     },
//   },
// };
export default {
  template: `
  <div>
    <div id="container" class="container-fluid">
      <div id="panel" class="dashboard-panel">
        <h2 class="dashboard-title">Logistics Page</h2>
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
        <div class="export-buttons">
          <button class="btn btn-primary export-btn" @click="exportFile('csv')">Export CSV (ZIP)</button>
          <button class="btn btn-success export-btn" @click="exportFile('xlsx')">Export Excel</button>
        </div>
      </div>
    </div>
  </div>
  `,

  data() {
    return {
      charts: [],
    };
  },

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
                "rgba(54, 162, 235, 0.8)", // Accepted - Blue
                "rgba(255, 99, 132, 0.8)", // Rejected - Red
                "rgba(255, 206, 86, 0.8)", // Completed - Yellow
                "rgba(75, 192, 192, 0.8)", // Pending - Green
              ],
              borderColor: [
                "rgba(54, 162, 235, 1)",
                "rgba(255, 99, 132, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
              ],
              borderWidth: 1,
              data: data.status_data.values,
            },
          ],
        };
        const ctxStatus = document
          .getElementById("statusChart")
          .getContext("2d");
        const statusChart = new Chart(ctxStatus, {
          type: "doughnut",
          data: statusData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "right",
                labels: {
                  font: {
                    size: 12,
                  },
                  padding: 15,
                },
              },
              tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                padding: 10,
                titleFont: {
                  size: 14,
                },
                bodyFont: {
                  size: 13,
                },
              },
            },
            cutout: "65%",
          },
        });
        this.charts.push(statusChart);

        // Service Category Distribution (Pie Chart)
        const categoryData = {
          labels: data.category_data.labels,
          datasets: [
            {
              label: "Service Categories",
              backgroundColor: [
                "rgba(255, 99, 132, 0.8)", // Red
                "rgba(54, 162, 235, 0.8)", // Blue
                "rgba(255, 206, 86, 0.8)", // Yellow
                "rgba(75, 192, 192, 0.8)", // Green
                "rgba(153, 102, 255, 0.8)", // Purple
                "rgba(255, 159, 64, 0.8)", // Orange
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
              ],
              borderWidth: 1,
              data: data.category_data.values,
            },
          ],
        };
        const ctxCategory = document
          .getElementById("categoryChart")
          .getContext("2d");
        const categoryChart = new Chart(ctxCategory, {
          type: "pie",
          data: categoryData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "right",
                labels: {
                  font: {
                    size: 12,
                  },
                  padding: 15,
                },
              },
              tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                padding: 10,
                titleFont: {
                  size: 14,
                },
                bodyFont: {
                  size: 13,
                },
              },
            },
          },
        });
        this.charts.push(categoryChart);

        // Service Requests Over Time (Line Chart) - Fixed styling
        const requestsData = {
          labels: data.requests_over_time.labels,
          datasets: [
            {
              label: "Requests Over Time",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 2,
              fill: true,
              pointBackgroundColor: "rgba(75, 192, 192, 1)",
              pointBorderColor: "#fff",
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: "rgba(75, 192, 192, 1)",
              pointHoverBorderColor: "#fff",
              data: data.requests_over_time.values,
            },
          ],
        };

        const ctxRequests = document
          .getElementById("requestsChart")
          .getContext("2d");
        const requestsChart = new Chart(ctxRequests, {
          type: "line",
          data: requestsData,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0,
                  stepSize: 1,
                  font: {
                    size: 12,
                  },
                },
                grid: {
                  display: true,
                  color: "rgba(0, 0, 0, 0.1)",
                  drawBorder: false,
                },
                border: {
                  display: true,
                },
              },
              x: {
                grid: {
                  display: false,
                  drawBorder: false,
                },
                ticks: {
                  font: {
                    size: 12,
                  },
                },
                border: {
                  display: true,
                },
              },
            },
            elements: {
              line: {
                tension: 0.4,
              },
            },
            plugins: {
              legend: {
                display: true,
                position: "top",
                labels: {
                  font: {
                    size: 12,
                  },
                  padding: 15,
                },
              },
              tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                padding: 10,
                titleFont: {
                  size: 14,
                },
                bodyFont: {
                  size: 13,
                },
                callbacks: {
                  label: function (context) {
                    return `Requests: ${context.parsed.y}`;
                  },
                },
              },
            },
            interaction: {
              mode: "index",
              intersect: false,
            },
          },
        });
        this.charts.push(requestsChart);
      })
      .catch((error) => console.error("Error fetching data:", error));

    // Add event listener for window resize to make charts responsive
    window.addEventListener("resize", this.resizeCharts);
  },

  beforeUnmount() {
    // Clean up charts and event listeners when component is destroyed
    this.charts.forEach((chart) => chart.destroy());
    window.removeEventListener("resize", this.resizeCharts);
  },

  methods: {
    resizeCharts() {
      this.charts.forEach((chart) => chart.resize());
    },

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

  // CSS Styles
  head: {
    style: [
      {
        type: "text/css",
        innerHTML: `
          .container-fluid {
            padding: 20px;
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
          }

          .dashboard-panel {
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            padding: 25px;
            margin-bottom: 20px;
          }

          .dashboard-title {
            color: #333;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 25px;
            padding-bottom: 10px;
            border-bottom: 2px solid #f0f0f0;
            text-decoration: none;
          }

          .charts-wrapper {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
          }

          .chart-container {
            background: #f9f9f9;
            border-radius: 6px;
            padding: 15px;
            box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
            position: relative;
            height: 350px;
            display: flex;
            flex-direction: column;
          }

          canvas {
            flex: 1;
          }

          .chart-title {
            font-size: 16px;
            font-weight: 500;
            color: #555;
            text-align: center;
            margin-top: 15px;
            margin-bottom: 0;
          }

          .export-buttons {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin-top: 20px;
          }

          .export-btn {
            padding: 8px 20px;
            font-weight: 500;
            border-radius: 4px;
            transition: all 0.3s ease;
          }

          .export-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }

          @media (max-width: 768px) {
            .charts-wrapper {
              grid-template-columns: 1fr;
            }
            
            .chart-container {
              height: 300px;
            }
            
            .export-buttons {
              flex-direction: column;
              align-items: center;
            }
            
            .export-btn {
              width: 100%;
              max-width: 200px;
              margin-bottom: 10px;
            }
          }
        `,
      },
    ],
  },
};
