const Home = {
  template: `
    <div>Home</div>
    `,
};
import LoginPage from "../pages/LoginPage.js";
import RegisterPage from "../pages/RegisterPage.js";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: LoginPage },
  { path: "/register", component: RegisterPage },
];

const router = new VueRouter({
  routes,
});

export default router;
