<template>
  <nav class="navbar navbar-light bg-white border-bottom shadow-sm" v-if="isLoggedIn">
    <div class="container app-shell">
      <router-link class="navbar-brand" to="/pocetna">TataMata</router-link>
      <div class="d-flex align-items-center gap-2">
        <router-link v-if="role === 'admin'" class="btn btn-sm btn-outline-secondary" to="/admin">
          Admin
        </router-link>
        <button class="btn btn-sm btn-outline-danger" @click="logout">Odjava</button>
      </div>
    </div>
  </nav>
  <router-view />
</template>

<script setup>
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

// route.meta je reaktivan pri navigaciji, dok direktno citanje localStorage nije -
// ovako se navbar ispravno azurira odmah nakon logina/logouta bez reloada.
const isLoggedIn = computed(() => !!route.meta.requiresAuth);
const role = computed(() => localStorage.getItem("role"));

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  router.push("/");
}
</script>
