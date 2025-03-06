// export default {
//   props: {
//     service: {
//       type: Object,
//       required: true,
//     },
//   },
//   template: `
//     <div class="card mb-3">
//       <div class="card-body">
//         <h5 class="card-title">{{ service.name }}</h5>
//         <p class="card-text">Price: {{ service.base_price }}</p>
//         <button @click="showDetails">View Details</button>
//       </div>
//     </div>
//   `,
//   methods: {
//     showDetails() {
//       this.$router.push({
//         name: "ServiceDetail",
//         params: { id: this.service.id },
//       });
//     },
//   },
// };

// export default {
//   props: {
//     service: {
//       type: Object,
//       required: true,
//     },
//   },
//   template: `
//     <div class="card mb-4 service-card">
//       <div class="card-img-container">
//         <img
//           :src="service.image_url || '/api/placeholder/400/200'"
//           class="card-img-top"
//           :alt="service.name"
//         >
//         <div class="service-badge" v-if="service.is_popular">Popular</div>
//       </div>
//       <div class="card-body">
//         <h5 class="card-title">{{ service.name }}</h5>
//         <div class="service-rating" v-if="service.rating">
//           <span class="stars">
//             <i class="fas fa-star" v-for="i in Math.floor(service.rating)" :key="'star-'+i"></i>
//             <i class="fas fa-star-half-alt" v-if="service.rating % 1 >= 0.5"></i>
//           </span>
//           <span class="rating-count" v-if="service.rating_count">({{ service.rating_count }})</span>
//         </div>
//         <p class="card-text description" v-if="service.description">{{ truncateDescription(service.description) }}</p>
//         <div class="price-container">
//           <p class="price">₹{{ service.base_price }}</p>
//           <p class="old-price" v-if="service.old_price">₹{{ service.old_price }}</p>
//         </div>
//         <button class="btn btn-custom view-details-btn" @click="showDetails">
//           <i class="fas fa-arrow-right"></i> View Details
//         </button>
//       </div>
//     </div>
//   `,
//   methods: {
//     showDetails() {
//       this.$router.push({
//         name: "ServiceDetail",
//         params: { id: this.service.id },
//       });
//     },
//     truncateDescription(desc) {
//       if (!desc) return "";
//       return desc.length > 70 ? desc.substring(0, 70) + "..." : desc;
//     },
//   },
// };
