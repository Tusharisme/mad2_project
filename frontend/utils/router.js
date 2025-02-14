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
import ProfessionalDashboard from "../pages/ProfessionalDashboard.js";
import SearchPageforCustomer from "../pages/SearchPageforCustomer.js";
import SearchPageforProfessional from "../pages/SearchPageforProfessional.js";
import SearchPageforAdmin from "../pages/SearchPageforAdmin.js";
import ServiceHistoryCustomer from "../pages/ServiceHistoryCustomer.js";
import LogisticPageCustomer from "../pages/LogisticPageCustomer.js";
import LogisticPageProfessional from "../pages/LogisticPageProfessional.js";
import ProfessionalProfile from "../pages/ProfessionalProfile.js";
import CustomerProfile from "../pages/CustomerProfile.js";

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
    path: "/service-professionals/:serviceId",
    component: ServiceProfessionals,
    meta: { requiresLogin: true, role: "customer" },
  },
  {
    path: "/professional_dashboard",
    component: ProfessionalDashboard,
    meta: { requiresLogin: true, role: "professional" },
  },
  {
    path: "/searchCustomer",
    component: SearchPageforCustomer,
    meta: { requiresLogin: true, role: "customer" },
  },
  {
    path: "/searchProfessional",
    component: SearchPageforProfessional,
    meta: { requiresLogin: true, role: "professional" },
  },
  {
    path: "/searchAdmin",
    component: SearchPageforAdmin,
    meta: { requiresLogin: true, role: "admin" },
  },

  {
    path: "/service_history_customer",
    component: ServiceHistoryCustomer,
    meta: { requiresLogin: true, role: "customer" },
  },
  {
    path: "/logistic_page_customer",
    component: LogisticPageCustomer,
    meta: { requiresLogin: true, role: "customer" },
  },
  {
    path: "/logistic_page_professional",
    component: LogisticPageProfessional,
    meta: { requiresLogin: true, role: "professional" },
  },
  {
    path: "/professional_profile",
    component: ProfessionalProfile,
    meta: { requiresLogin: true, role: "professional" },
  },
  {
    path: "/customer_profile",
    component: CustomerProfile,
    meta: { requiresLogin: true, role: "customer" },
  },
];

const router = new VueRouter({
  routes,
});
router.beforeEach((to, from, next) => {
  // Try to restore user session from localStorage if not logged in
  if (!store.state.loggedIn) {
    store.commit("setUser");
  }

  const { loggedIn, lastActivity, role } = store.state;
  const sessionTimeout = 30 * 60 * 1000; // 30 minutes timeout

  if (lastActivity && Date.now() - lastActivity > sessionTimeout) {
    // Session expired
    alert("Your session has expired. Please log in again.");
    store.commit("logout");
    next({ path: "/login" });
    return;
  }

  // Update last activity if session is valid
  if (loggedIn) {
    store.commit("setLastActivity");
  }

  if (to.matched.some((record) => record.meta.requiresLogin)) {
    if (!loggedIn) {
      next({ path: "/login" });
      return;
    }

    // Check if role-specific route is being accessed
    if (to.meta.role && to.meta.role !== role) {
      // Redirect to the appropriate dashboard based on the role
      if (role === "customer") {
        next({ path: "/customer_dashboard" });
      } else if (role === "admin") {
        next({ path: "/admin_dashboard" });
      } else if (role === "professional") {
        next({ path: "/professional_dashboard" });
      }
      return;
    }
  }

  next();
});

export default router;
