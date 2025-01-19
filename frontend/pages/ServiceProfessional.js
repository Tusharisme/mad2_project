// // export default {
// //   template: `
// //   <div id="service-professionals">
// //     <h3 class="text-center my-4" style="text-decoration: underline;">Professionals for {{ service.name }}</h3>

// //     <!-- Professionals Cards -->
// //     <div v-if="professionals.length > 0" class="row">
// //       <div v-for="professional in professionals" :key="professional.id" class="col-md-4 mb-4">
// //         <div class="card h-100 shadow-sm">
// //           <div class="row g-0">
// //             <div class="col-md-4">
// //               <div class="img-container">
// //                 <img :src="professional.profile_pic" :alt="professional.name" class="img-fluid" />
// //               </div>
// //             </div>
// //             <div class="col-md-8">
// //               <div class="card-body">
// //                 <h5 class="card-title">{{ professional.name }}</h5>
// //                 <p class="card-text">Experience: {{ professional.experience }} years</p>
// //                 <p class="card-text">Phone No.: {{ professional.phone_no }}</p>
// //                 <p class="card-text">Price: ₹ {{ professional.price }}</p>
// //                 <p class="card-text">Description: {{ professional.description }}</p>
// //                 <p class="card-text">Time Required: {{ professional.time_required }} mins</p>
// //                 <button class="btn btn-info" @click="openBookingModal(professional)">
// //                   Book Service
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>

// //     <p v-else><b>No professionals available for this service.</b></p>

// //     <!-- Booking Modal -->
// //     <div class="modal fade" id="bookingModal" tabindex="-1" aria-labelledby="bookingModalLabel" aria-hidden="true">
// //       <div class="modal-dialog">
// //         <div class="modal-content custom-modal">
// //           <div class="modal-header">
// //             <h5 class="modal-title" id="bookingModalLabel">Book Service</h5>
// //             <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
// //           </div>
// //           <div class="modal-body">
// //             <form @submit.prevent="confirmBooking">
// //               <input type="hidden" v-model="selectedProfessional.id">
// //               <input type="hidden" v-model="service.id">

// //               <div class="mb-3">
// //                 <label for="serviceDate" class="form-label">Select Date</label>
// //                 <input type="date" class="form-control" v-model="bookingDate" required>
// //               </div>
// //               <div class="mb-3">
// //                 <label for="serviceTime" class="form-label">Select Time</label>
// //                 <input type="time" class="form-control" v-model="bookingTime" required>
// //               </div>

// //               <p>Please confirm the payment amount:</p>
// //               <p>Amount: ₹{{ selectedProfessional.price }}</p>

// //               <div class="mb-3">
// //                 <label for="cardNumber" class="form-label">Card Number</label>
// //                 <input type="text" class="form-control" v-model="cardNumber" maxlength="16" required>
// //               </div>
// //               <div class="mb-3">
// //                 <label for="expirationDate" class="form-label">Expiration Date</label>
// //                 <input type="text" class="form-control" v-model="expirationDate" placeholder="MM/YY" maxlength="5" required>
// //               </div>
// //               <div class="mb-3">
// //                 <label for="cvv" class="form-label">CVV</label>
// //                 <input type="text" class="form-control" v-model="cvv" maxlength="3" required>
// //               </div>
// //               <button type="submit" class="btn btn-primary">Confirm Booking</button>
// //             </form>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   </div>
// // `,

// //   data() {
// //     return {
// //       service: {
// //         name: "Example Service",
// //       },
// //       professionals: [],
// //       selectedProfessional: null,
// //       bookingDate: "",
// //       bookingTime: "",
// //       cardNumber: "",
// //       expirationDate: "",
// //       cvv: "",
// //     };
// //   },
// //   created() {
// //     // Fetch professionals from API or use dummy data
// //     this.professionals = [
// //       {
// //         id: 1,
// //         name: "John Doe",
// //         profile_pic: "https://via.placeholder.com/150",
// //         experience: 5,
// //         phone_no: "1234567890",
// //         price: 500,
// //         description: "Experienced professional with expertise in this field.",
// //         time_required: 30,
// //       },
// //       // More professionals
// //     ];
// //   },
// //   methods: {
// //     goBack() {
// //       // Handle the "back" button functionality
// //       this.$router.push("/services"); // Example using Vue Router
// //     },
// //     openBookingModal(professional) {
// //       this.selectedProfessional = professional;
// //       const myModal = new window.bootstrap.Modal(
// //         document.getElementById("bookingModal")
// //       );
// //       myModal.show();
// //     },
// //     confirmBooking() {
// //       // Handle booking confirmation
// //       console.log("Booking confirmed for:", this.selectedProfessional);
// //       console.log("Booking Date:", this.bookingDate);
// //       console.log("Booking Time:", this.bookingTime);
// //       console.log("Card Number:", this.cardNumber);
// //       // Send booking info to the server or proceed with the booking process
// //     },
// //   },
// // };
// export default {
//   template: `
//   <div id="service-professionals">
//     <h3 class="text-center my-4" style="text-decoration: underline;">Professionals for {{ service.name }}</h3>

//     <!-- Professionals Cards -->
//     <div v-if="professionals.length > 0" class="row">
//       <div v-for="professional in professionals" :key="professional.id" class="col-md-4 mb-4">
//         <div class="card h-100 shadow-sm">
//           <div class="row g-0">
//             <div class="col-md-4">
//               <div class="img-container">
//                 <img :src="professional.profile_pic" :alt="professional.name" class="img-fluid" />
//               </div>
//             </div>
//             <div class="col-md-8">
//               <div class="card-body">
//                 <h5 class="card-title">{{ professional.name }}</h5>
//                 <p class="card-text">Experience: {{ professional.experience }} years</p>
//                 <p class="card-text">Phone No.: {{ professional.phone_no }}</p>
//                 <p class="card-text">Price: ₹ {{ professional.price }}</p>
//                 <p class="card-text">Description: {{ professional.description }}</p>
//                 <p class="card-text">Time Required: {{ professional.time_required }} mins</p>
//                 <button class="btn btn-info" @click="openBookingModal(professional)">
//                   Book Service
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>

//     <p v-else><b>No professionals available for this service.</b></p>

//     <!-- Booking Modal -->
//     <div class="modal fade" id="bookingModal" tabindex="-1" aria-labelledby="bookingModalLabel" aria-hidden="true">
//       <div class="modal-dialog">
//         <div class="modal-content custom-modal">
//           <div class="modal-header">
//             <h5 class="modal-title" id="bookingModalLabel">Book Service</h5>
//             <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
//           </div>
//           <div class="modal-body">
//             <form @submit.prevent="confirmBooking">
//               <!-- Ensure v-if checks for null before binding id -->
//               <input type="hidden" v-if="selectedProfessional" v-model="selectedProfessional.id">
//               <input type="hidden" v-if="service.id" v-model="service.id">

//               <div class="mb-3">
//                 <label for="serviceDate" class="form-label">Select Date</label>
//                 <input type="date" class="form-control" v-model="bookingDate" required>
//               </div>
//               <div class="mb-3">
//                 <label for="serviceTime" class="form-label">Select Time</label>
//                 <input type="time" class="form-control" v-model="bookingTime" required>
//               </div>

//               <p>Please confirm the payment amount:</p>
//               <p>Amount: ₹{{ selectedProfessional ? selectedProfessional.price : 0 }}</p>

//               <div class="mb-3">
//                 <label for="cardNumber" class="form-label">Card Number</label>
//                 <input type="text" class="form-control" v-model="cardNumber" maxlength="16" required>
//               </div>
//               <div class="mb-3">
//                 <label for="expirationDate" class="form-label">Expiration Date</label>
//                 <input type="text" class="form-control" v-model="expirationDate" placeholder="MM/YY" maxlength="5" required>
//               </div>
//               <div class="mb-3">
//                 <label for="cvv" class="form-label">CVV</label>
//                 <input type="text" class="form-control" v-model="cvv" maxlength="3" required>
//               </div>
//               <button type="submit" class="btn btn-primary">Confirm Booking</button>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// `,

//   data() {
//     return {
//       service: {
//         name: "Example Service",
//         id: 1, // Ensure service has an id
//       },
//       professionals: [
//         {
//           id: 1,
//           name: "John Doe",
//           profile_pic: "https://via.placeholder.com/150",
//           experience: 5,
//           phone_no: "1234567890",
//           price: 500,
//           description: "Experienced professional with expertise in this field.",
//           time_required: 30,
//         },
//       ],
//       selectedProfessional: null,
//       bookingDate: "",
//       bookingTime: "",
//       cardNumber: "",
//       expirationDate: "",
//       cvv: "",
//     };
//   },

//   methods: {
//     openBookingModal(professional) {
//       this.selectedProfessional = professional;
//       const myModal = new window.bootstrap.Modal(
//         document.getElementById("bookingModal")
//       );
//       myModal.show();
//     },

//     confirmBooking() {
//       // Handle booking confirmation
//       console.log("Booking confirmed for:", this.selectedProfessional);
//       console.log("Booking Date:", this.bookingDate);
//       console.log("Booking Time:", this.bookingTime);
//       console.log("Card Number:", this.cardNumber);
//       // Send booking info to the server or proceed with the booking process
//     },
//   },
// };
export default {
  template: `
  <div id="service-professionals">
    <h3 class="text-center my-4" style="text-decoration: underline;">Professionals for {{ service.name }}</h3>
    
    <div v-if="professionals.length > 0" class="row">
      <div v-for="professional in professionals" :key="professional.id" class="col-md-4 mb-4">
        <div class="card h-100 shadow-sm">
          <div class="row g-0">
            <div class="col-md-4">
              <div class="img-container">
                <img :src="professional.profile_pic || '/images/default-profile.jpg'" 
                     :alt="professional.name" 
                     class="img-fluid" 
                     style="max-height: 150px; object-fit: cover;" />
              </div>
            </div>
            <div class="col-md-8">
              <div class="card-body">
                <h5 class="card-title">{{ professional.name }}</h5>
                <p class="card-text">Experience: {{ professional.experience }} years</p>
                <p class="card-text">Phone No.: {{ professional.phone_no }}</p>
                <p class="card-text">Price: ₹ {{ professional.price }}</p>
                <p class="card-text">Description: {{ professional.description }}</p>
                <p class="card-text">Time Required: {{ professional.time_required }} mins</p>
                <button class="btn btn-info" @click="openBookingModal(professional)">
                  Book Service
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <p v-else class="text-center"><b>No professionals available for this service.</b></p>

    <!-- Booking Modal -->
    <div class="modal fade" id="bookingModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Book Service</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p><b>Professional:</b> {{ selectedProfessional?.name }}</p>
            <p><b>Price:</b> ₹ {{ selectedProfessional?.price }}</p>
            <div class="mb-3">
              <label for="bookingDate" class="form-label">Booking Date</label>
              <input type="date" id="bookingDate" class="form-control" v-model="bookingDate">
            </div>
            <div class="mb-3">
              <label for="bookingTime" class="form-label">Booking Time</label>
              <input type="time" id="bookingTime" class="form-control" v-model="bookingTime">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" @click="confirmBooking">Confirm Booking</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  data() {
    return {
      service: {
        name: "Example Service", // Placeholder, updated after fetching
        id: null, // Will store the service ID
      },
      professionals: [], // Will store fetched professionals
      selectedProfessional: null,
      bookingDate: "",
      bookingTime: "",
    };
  },
  created() {
    const serviceId = this.$route.params.serviceId; // Get service ID from the URL
    this.fetchProfessionals(serviceId); // Fetch professionals for the selected service
  },
  methods: {
    async fetchProfessionals(serviceId) {
      try {
        const response = await fetch(
          `/api/service-professionals/${serviceId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched Data:", data);

        if (data) {
          this.service = { id: data.service.id, name: data.service.name };
          this.professionals = data.professionals || [];
          console.log("Service Details:", this.service);
          console.log("Professionals List:", this.professionals);
        }
      } catch (error) {
        console.error("Error fetching professionals:", error);
      }
    },
    openBookingModal(professional) {
      this.selectedProfessional = professional;
      const myModal = new window.bootstrap.Modal(
        document.getElementById("bookingModal")
      );
      myModal.show();
    },
    confirmBooking() {
      console.log("Booking confirmed for:", this.selectedProfessional);
      console.log("Booking Date:", this.bookingDate);
      console.log("Booking Time:", this.bookingTime);
      // Add booking confirmation logic here
    },
  },
};
