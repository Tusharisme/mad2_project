import LoginPage from "../pages/LoginPage.js";
import RegisterPage from "../pages/RegisterPage.js";
// import Services from "../pages/Services.js";
import ServiceDetail from "../pages/ServiceDetail.js";
import AdminDashboardPage from "../pages/AdminDashboardPage.js";
import store from "./store.js";
import ProfRegisterPage from "../pages/ProfRegisterPage.js";
import LandingPage from "../pages/LandingPage.js";
import AllServicesPage from "../pages/AllServicePage.js";
import AllCustomersPage from "../pages/AllCustomersPage.js";
import AllProfessionalsPage from "../pages/AllProfessionalsPage.js";

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
];

const router = new VueRouter({
  routes,
});

// Session timeout guard
router.beforeEach((to, from, next) => {
  const lastActivity = store.state.lastActivity;
  const sessionTimeout = 30 * 60 * 1000; // 30 minutes timeout

  if (lastActivity && Date.now() - lastActivity > sessionTimeout) {
    alert("Your session has expired. Please log in again.");
    store.commit("logout"); // Clear the session
    next({ path: "/login" }); // Redirect to login
  } else {
    // Proceed if session is still valid
    if (to.matched.some((record) => record.meta.requiresLogin)) {
      if (!store.state.loggedIn) {
        next({ path: "/login" });
      } else if (to.meta.role && to.meta.role != store.state.role) {
        alert("You do not have the correct permissions to access this page");
        next({ path: "/" });
      } else {
        next();
      }
    } else {
      next();
    }
  }
});

export default router;
