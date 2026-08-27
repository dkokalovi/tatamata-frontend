import { createRouter, createWebHistory } from "vue-router";
import Auth from "../views/Auth.vue";
import Home from "../views/Home.vue";
import Admin from "../views/Admin.vue";

const routes = [
  { path: "/", name: "Auth", component: Auth, meta: { guestOnly: true } },
  { path: "/pocetna", name: "Home", component: Home, meta: { requiresAuth: true } },
  { path: "/admin", name: "Admin", component: Admin, meta: { requiresAuth: true, requiresAdmin: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (to.meta.requiresAuth && !token) {
    return { name: "Auth" };
  }
  if (to.meta.guestOnly && token) {
    return { name: "Home" };
  }
  if (to.meta.requiresAdmin && role !== "admin") {
    return { name: "Home" };
  }
});

export default router;
