export default {
  template: `
    <div>
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-overlay">
          <div class="hero-content">
            <h1 class="display-4 mb-3">Home Services at Your Doorstep</h1>
            <p class="lead mb-4">Find the best service professionals for all your household needs</p>
            <button class="btn btn-custom btn-lg">
            <router-link to="/desired-route" class="nav-link"><b>Get Started</b></router-link>
        </button>
                  </div>
        </div>
      </div>

      <!-- Categories Section -->
      <div class="container mt-5">
        <div class="header-section">
          <h3>What are you looking for?</h3>
        </div>
        
        <div class="row text-center mt-4">
          <!-- Category Cards -->
          <div class="col-md-3 col-sm-6 mb-4" v-for="category in categories" :key="category.title">
            <div class="card">
              <div class="img-container">
                <img :src="category.image" class="card-img-top" :alt="category.title">
              </div>
              <div class="card-body">
                <h5 class="card-title">{{ category.title }}</h5>
                <button class="btn btn-custom btn-sm mt-2">
                <router-link to="/login" class="nav-link"><b>Explore</b></router-link>
            </button>
                          </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- How It Works Section -->
      <div class="container mt-5 mb-5">
        <div class="header-section">
          <h3>How It Works</h3>
        </div>
        
        <div class="row mt-4 text-center">
          <div class="col-md-4 mb-4">
            <div style="background-color: #f4eae1; border-radius: 15px; padding: 25px; height: 100%;">
              <i class="fas fa-search fa-3x mb-3" style="color: #8b4513;"></i>
              <h5 style="color: #8b4513; font-weight: 600;">Search</h5>
              <p>Find the service you need from our wide range of offerings</p>
            </div>
          </div>
          
          <div class="col-md-4 mb-4">
            <div style="background-color: #f4eae1; border-radius: 15px; padding: 25px; height: 100%;">
              <i class="fas fa-calendar-check fa-3x mb-3" style="color: #8b4513;"></i>
              <h5 style="color: #8b4513; font-weight: 600;">Book</h5>
              <p>Select your preferred professional and schedule at your convenience</p>
            </div>
          </div>
          
          <div class="col-md-4 mb-4">
            <div style="background-color: #f4eae1; border-radius: 15px; padding: 25px; height: 100%;">
              <i class="fas fa-home fa-3x mb-3" style="color: #8b4513;"></i>
              <h5 style="color: #8b4513; font-weight: 600;">Relax</h5>
              <p>Our professional will arrive at your doorstep at the scheduled time</p>
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
          title: "Electrician Services",
          image:
            "https://res.cloudinary.com/dfcpm3kmc/image/upload/v1736746813/demo_services/upoxvwc7bjxdlwp3hcha.jpg",
        },
      ],
    };
  },
};
