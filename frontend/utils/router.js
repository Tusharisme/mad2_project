import LoginPage from "../pages/LoginPage.js";
import RegisterPage from "../pages/RegisterPage.js";
import ServiceDetail from "../pages/ServiceDetail.js";
import AdminDashboardPage from "../pages/AdminDashboardPage.js";
import store from "./store.js";
import ProfRegisterPage from "../pages/ProfRegisterPage.js";
import LandingPage from "../pages/LandingPage.js";
import AllServicesPage from "../pages/AllServicePage.js";
import AllCustomersPage from "../pages/AllCustomersPage.js";
import AllProfessionalsPage from "../pages/AllProfessionalsPage.js";
import CustomerDashboard from "../pages/CustomerDashboard.js";
import ServiceProfessionals from "../pages/ServiceProfessional.js";

const routes = [
  { path: "/", component: LandingPage },
  { path: "/login", component: LoginPage },
  { path: "/register_customer", component: RegisterPage },
  { path: "/register_professional", component: ProfRegisterPage },
  {
    path: "/services/:id",
    name: "ServiceDetail",
    component: ServiceDetail,
    props: true,
    meta: { requiresLogin: true },
  },
  {
    path: "/admin_dashboard",
    component: AdminDashboardPage,
    meta: { requiresLogin: true, role: "admin" },
  },
  {
    path: "/services",
    component: AllServicesPage,
    meta: { requiresLogin: true, role: "admin" },
  },
  {
    path: "/customers",
    component: AllCustomersPage,
    meta: { requiresLogin: true, role: "admin" },
  },
  {
    path: "/professionals",
    component: AllProfessionalsPage,
    meta: { requiresLogin: true, role: "admin" },
  },
  {
    path: "/customer_dashboard",
    component: CustomerDashboard,
    meta: { requiresLogin: true, role: "customer" },
  },
  {
    path: "/service_professionals",
    component: ServiceProfessionals,
    meta: { requiresLogin: true, role: "customer" },
  },
];

const router = new VueRouter({
  routes,
});
// Session timeout guard
router.beforeEach((to, from, next) => {
  const { loggedIn, lastActivity, role } = store.state; // Access 'role' from Vuex store
  const sessionTimeout = 30 * 60 * 1000; // 30 minutes timeout

  if (lastActivity && Date.now() - lastActivity > sessionTimeout) {
    // Session expired
    alert("Your session has expired. Please log in again.");
    store.commit("logout"); // Clear session
    next({ path: "/login" }); // Redirect to login
  } else {
    // Update last activity if session is valid
    if (loggedIn) {
      store.commit("setLastActivity");
    }

    if (to.matched.some((record) => record.meta.requiresLogin)) {
      // Check if login is required
      if (!loggedIn) {
        next({ path: "/login" });
      } else {
        // Check if role-specific route is being accessed
        if (to.meta.role && to.meta.role !== role) {
          // Redirect to the appropriate dashboard based on the role
          if (role === "customer") {
            next({ path: "/customer_dashboard" });
          } else if (role === "admin") {
            next({ path: "/admin_dashboard" });
          }
        } else {
          next(); // Proceed to the requested route
        }
      }
    } else {
      next(); // If the route does not require login
    }
  }
});

export default router;
