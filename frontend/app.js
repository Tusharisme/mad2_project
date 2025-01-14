import Navbar from "./components/Navbar.js";
import router from "./utils/router.js";
import store from "./utils/store.js";
import Footer from "./components/Footer.js";

const app = new Vue({
  el: "#app",
  data: {},
  template: `
    <div>
      <Navbar v-if="!isLoginOrRegisterPage" />
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
  computed: {
    // Check if the current route is login or register
    isLoginOrRegisterPage() {
      return (
        this.$route.path === "/login" ||
        this.$route.path === "/register_customer" ||
        this.$route.path === "/register_professional"
      );
    },
  },
});
