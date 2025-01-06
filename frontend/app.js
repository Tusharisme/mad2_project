import Navbar from "./components/Navbar.js";
import router from "./utils/router.js";

const app = new Vue({
  el: "#app",
  data: {},
  template: `
    <div>
    <Navbar />
    <router-view />    
    </div>
    
    `,
  components: {
    Navbar,
  },
  router,
});
