// export default {
//   template: `
//       <div id="all-professionals-page">
//         <div class="container">
//           <h2 class="text-center">All Professionals</h2>
//           <button class="btn btn-primary" @click="fetchProfessionals">Fetch Professionals</button>

//           <ul v-if="professionals.length > 0" class="list-group mt-3">
//             <li v-for="professional in professionals" :key="professional.id" class="list-group-item">
//               <div class="d-flex justify-content-between">
//                 <span>{{ professional.name }} ({{ professional.email }})</span>
//                 <button class="btn btn-danger" @click="deleteProfessional(professional.id)">Delete</button>
//               </div>
//             </li>
//           </ul>

//           <div v-else class="mt-3">
//             <p>No professionals available.</p>
//           </div>
//         </div>
//       </div>
//     `,
//   data() {
//     return {
//       professionals: [],
//     };
//   },
//   created() {
//     this.fetchProfessionals();
//   },
//   methods: {
//     async fetchProfessionals() {
//       try {
//         const res = await fetch("/api/service_professionals");
//         const data = await res.json();
//         if (res.ok) {
//           this.professionals = data;
//         } else {
//           console.error("Failed to fetch professionals:", data.message);
//         }
//       } catch (error) {
//         console.error("Error fetching professionals:", error);
//       }
//     },
//     async deleteProfessional(professionalId) {
//       try {
//         const res = await fetch(
//           `/api/service_professionals/${professionalId}`,
//           {
//             method: "DELETE",
//           }
//         );
//         if (res.ok) {
//           this.professionals = this.professionals.filter(
//             (professional) => professional.id !== professionalId
//           );
//           alert("Professional deleted successfully");
//         } else {
//           const data = await res.json();
//           alert("Failed to delete professional: " + data.message);
//         }
//       } catch (error) {
//         console.error("Error deleting professional:", error);
//       }
//     },
//   },
// };
export default {
  template: `
  <div id="all-professionals-page">
    <div class="container">
      <h2 class="text-center">All Professionals</h2>

      <ul v-if="professionals.length > 0" class="list-group mt-3">
        <li v-for="professional in professionals" :key="professional.id" class="list-group-item">
          <div class="d-flex justify-content-between">
            <span>{{ professional.name }} ({{ professional.email }})</span>
            <div>
              <button
                v-if="professional.verified_status === 'approved'"
                class="btn btn-danger-custom"
                @click="blockProfessional(professional.id)"
              >
                Block
              </button>
              <button
                v-if="professional.block_status === false"
                class="btn btn-success-custom"
                @click="unblockProfessional(professional.id)"
              >
                Unblock
              </button>
              <button
                class="btn btn-danger-custom"
                @click="deleteProfessional(professional.id)"
              >
                Delete
              </button>
              <button
                v-if="professional.verified_status !== 'approved'"
                type="button"
                class="btn btn-success-custom"
                @click="openModal(professional.id, 'approve')"
              >
                Approve
              </button>
              <button
                v-if="professional.verified_status !== 'approved'"
                type="button"
                class="btn btn-warning"
                @click="openModal(professional.id, 'reject')"
              >
                Reject
              </button>
            </div>
          </div>
          <div v-if="professional.average_rating">
            <p><strong>Average Rating:</strong> {{ professional.average_rating }}</p>
          </div>
        </li>
      </ul>

      <div v-else class="mt-3">
        <p>No professionals available.</p>
      </div>

      <!-- Approve/Reject Modal -->
      <div
        class="modal fade"
        id="approveRejectModal"
        tabindex="-1"
        aria-labelledby="approveRejectModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content custom-modal">
            <div class="modal-header">
              <h5 class="modal-title" id="approveRejectModalLabel">
                Professional Approval/Rejection
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p><b>Professional Name:</b> <span id="professional_name"></span></p>
              <p><b>Experience:</b> <span id="professional_experience"></span> years</p>
              <p><b>Service:</b> <span id="professional_service"></span></p>
              <p><b>Address:</b> <span id="professional_address"></span></p>
              <p><b>Pincode:</b> <span id="professional_pincode"></span></p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
              <button
                type="button"
                class="btn btn-custom"
                id="action_button"
                @click="submitApprovalReject"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
`,

  data() {
    return {
      professionals: [],
      currentAction: "",
      currentProfessionalId: null,
    };
  },
  created() {
    this.fetchProfessionals(); // Automatically fetch professionals when the page loads
  },
  methods: {
    async fetchProfessionals() {
      try {
        const token = this.$store.state.auth_token; // Get token from Vuex store

        if (!token) {
          console.error("No authentication token found");
          return;
        }

        const res = await fetch("/api/service_professionals", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authentication-Token": token,
          },
        });

        if (res.ok) {
          const data = await res.json();
          this.professionals = data;
        } else {
          console.error("Failed to fetch professionals:", res.statusText);
        }
      } catch (error) {
        console.error("Error fetching professionals:", error);
      }
    },
    async blockProfessional(professionalId) {
      try {
        const res = await fetch(
          `/api/service_professionals/${professionalId}/block`,
          {
            method: "POST",
          }
        );
        if (res.ok) {
          this.fetchProfessionals();
          alert("Professional blocked successfully.");
        } else {
          const data = await res.json();
          alert("Failed to block professional: " + data.message);
        }
      } catch (error) {
        console.error("Error blocking professional:", error);
      }
    },
    async unblockProfessional(professionalId) {
      try {
        const res = await fetch(
          `/api/service_professionals/${professionalId}/unblock`,
          {
            method: "POST",
          }
        );
        if (res.ok) {
          this.fetchProfessionals();
          alert("Professional unblocked successfully.");
        } else {
          const data = await res.json();
          alert("Failed to unblock professional: " + data.message);
        }
      } catch (error) {
        console.error("Error unblocking professional:", error);
      }
    },
    async deleteProfessional(professionalId) {
      try {
        const token = this.$store.state.auth_token; // Get token from Vuex store
        if (!token) {
          console.error("Authentication token missing.");
          return;
        }

        const res = await fetch(
          `/api/service_professionals/${professionalId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              "Authentication-Token": token,
            },
          }
        );

        if (res.ok) {
          // Filter out the deleted professional
          this.professionals = this.professionals.filter(
            (professional) => professional.id !== professionalId
          );
          alert("Professional deleted successfully");
        } else {
          const data = await res.json();
          alert("Failed to delete professional: " + data.message);
        }
      } catch (error) {
        console.error("Error deleting professional:", error);
      }
    },
    openModal(professionalId, action) {
      this.currentProfessionalId = professionalId;
      this.currentAction = action;
      this.fetchProfessionalDetails(professionalId);
    },
    async fetchProfessionalDetails(professionalId) {
      try {
        const res = await fetch(`/api/professional/${professionalId}`);
        const data = await res.json();
        if (res.ok) {
          document.getElementById("professional_name").textContent = data.name;
          document.getElementById("professional_experience").textContent =
            data.experience;
          document.getElementById("professional_service").textContent =
            data.service_type;
          document.getElementById("professional_address").textContent =
            data.address;
          document.getElementById("professional_pincode").textContent =
            data.pin_code;
        } else {
          console.error("Failed to fetch professional details:", data.message);
        }
      } catch (error) {
        console.error("Error fetching professional details:", error);
      }
    },
    async submitApprovalReject() {
      try {
        const action = this.currentAction;
        const professionalId = this.currentProfessionalId;
        const res = await fetch(
          `/api/professional/${action}/${professionalId}`,
          {
            method: "POST",
          }
        );
        if (res.ok) {
          alert(`Professional ${action}d successfully.`);
          this.fetchProfessionals();
        } else {
          const data = await res.json();
          alert(`Failed to ${action} professional: ` + data.message);
        }
      } catch (error) {
        console.error(`Error submitting ${this.currentAction}:`, error);
      }
    },
  },
};
