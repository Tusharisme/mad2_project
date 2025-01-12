const Home = {
  template: `
    <div>Home</div>
    `,
};
import LoginPage from "../pages/LoginPage.js";
import RegisterPage from "../pages/RegisterPage.js";
import Services from "../pages/Services.js";
import ServiceDetail from "../pages/ServiceDetail.js";
import AdminDashboardPage from "../pages/AdminDashboardPage.js";
import store from "./store.js";
import ProfRegisterPage from "../pages/ProfRegisterPage.js";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: LoginPage },
  { path: "/register_customer", component: RegisterPage },
  { path: "/register_professional", component: ProfRegisterPage },
  { path: "/services", component: Services, meta: { requiresLogin: true } },
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
];

const router = new VueRouter({
  routes,
});

// registration guards
router.beforeEach((to, from, next) => {
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
});

export default router;
