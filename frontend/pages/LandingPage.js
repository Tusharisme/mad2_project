export default {
  template: `
        <div>
          <!-- Hero Section -->
          <div class="hero-section">
            <div class="hero-overlay">
              <div class="hero-content text-center text-white">
                <h1 class="display-4">Home Services at Your Doorstep</h1>
                <p class="lead">Find the best service professionals for all your household needs</p>
                <button class="btn btn-primary btn-lg mt-3">Get Started</button>
              </div>
            </div>
          </div>
    
          <!-- Categories Section -->
          
          <div class="container category-section mt-5">
            <h3 class="header-section"><b>What are you looking for?</b></h3>
            <div class="row text-center mt-4">
              <!-- Category Cards -->
              <div class="col-md-3" v-for="category in categories" :key="category.title">
                <div class="card shadow-sm">
                  <img :src="category.image" class="card-img-top" :alt="category.title">
                  <div class="card-body">
                    <p class="card-text"><b>{{ category.title }}</b></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
  data() {
    return {
      categories: [
        {
          title: "Women's Salon & Spa",
          image:
            "https://res.cloudinary.com/dfcpm3kmc/image/upload/v1736747058/demo_services/orrhi0m6aymsg2cgwuga.jpg",
        },
        {
          title: "Men's Salon",
          image:
            "https://res.cloudinary.com/dfcpm3kmc/image/upload/v1736747067/demo_services/irpmguvcsjbngnignmal.jpg",
        },
        {
          title: "Home Cleaning",
          image:
            "https://res.cloudinary.com/dfcpm3kmc/image/upload/v1736747109/demo_services/rqdhk8o8x7yxggeshjgh.jpg",
        },
        {
          title: "Electrician demo_services",
          image:
            "https://res.cloudinary.com/dfcpm3kmc/image/upload/v1736746813/demo_services/upoxvwc7bjxdlwp3hcha.jpg",
        },
      ],
    };
  },
};
