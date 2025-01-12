import Navbar from "./components/Navbar.js";
import router from "./utils/router.js";
import store from "./utils/store.js";
import Footer from "./components/Footer.js";

const app = new Vue({
  el: "#app",
  data: {},
  template: `
    <div>
    <Navbar />
    <router-view /> 
    <Footer />   
    </div>
    
    `,
  components: {
    Navbar,
    Footer,
  },
  router,
  store,
});
