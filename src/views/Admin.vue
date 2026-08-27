<template>
  <div class="container py-3" style="max-width: 700px">
    <h4>Admin panel</h4>

    <ul class="nav nav-tabs mb-3">
      <li class="nav-item" v-for="tab in tabs" :key="tab">
        <button class="nav-link" :class="{ active: activeTab === tab }" @click="activeTab = tab">
          {{ tab }}
        </button>
      </li>
    </ul>

    <div v-if="activeTab === 'Korisnici'">
      <table class="table table-sm">
        <thead><tr><th>Ime</th><th>Email</th><th>Rola</th></tr></thead>
        <tbody>
          <tr v-for="u in users" :key="u._id">
            <td>{{ u.ime }} {{ u.prezime }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.role }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="activeTab === 'Analize'">
      <table class="table table-sm">
        <thead><tr><th>Korisnik</th><th>Problem</th><th>Kategorija</th><th>Datum</th></tr></thead>
        <tbody>
          <tr v-for="a in analyses" :key="a._id">
            <td>{{ a.user?.ime }} {{ a.user?.prezime }}</td>
            <td>{{ a.naslovProblema }}</td>
            <td>{{ a.kategorija }}</td>
            <td>{{ new Date(a.createdAt).toLocaleDateString("hr-HR") }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="activeTab === 'Interesi'">
      <table class="table table-sm">
        <thead><tr><th>Korisnik</th><th>Firma</th><th>Status</th></tr></thead>
        <tbody>
          <tr v-for="i in interests" :key="i._id">
            <td>{{ i.user?.ime }} {{ i.user?.prezime }}</td>
            <td>{{ i.company?.naziv }}</td>
            <td>{{ i.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="activeTab === 'Firme'">
      <div v-if="companyError" class="alert alert-danger py-2">{{ companyError }}</div>
      <div v-if="companySuccess" class="alert alert-success py-2">{{ companySuccess }}</div>

      <form class="card card-body mb-3" @submit.prevent="addCompany">
        <div class="row g-2">
          <div class="col-6"><input v-model="newCompany.naziv" class="form-control form-control-sm" placeholder="Naziv" required /></div>
          <div class="col-6"><input v-model="newCompany.grad" class="form-control form-control-sm" placeholder="Grad" /></div>
          <div class="col-6"><input v-model="newCompany.telefon" class="form-control form-control-sm" placeholder="Telefon" required /></div>
          <div class="col-6"><input v-model="newCompany.email" class="form-control form-control-sm" placeholder="Email" required /></div>
          <div class="col-12">
            <select v-model="newCompany.kategorije" class="form-select form-select-sm" multiple size="5">
              <option v-for="k in kategorije" :key="k" :value="k">{{ k }}</option>
            </select>
            <small class="text-muted">Drži Ctrl (Cmd na Macu) za odabir više kategorija.</small>
          </div>
        </div>
        <button class="btn btn-tm btn-sm mt-2" type="submit">Dodaj firmu</button>
      </form>

      <table class="table table-sm">
        <thead><tr><th>Naziv</th><th>Kategorije</th><th></th></tr></thead>
        <tbody>
          <tr v-for="c in companies" :key="c._id">
            <td>{{ c.naziv }}</td>
            <td><small>{{ c.kategorije.join(", ") }}</small></td>
            <td><button class="btn btn-sm btn-outline-danger" @click="deleteCompany(c._id)">Obriši</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api from "../api.js";

const tabs = ["Korisnici", "Analize", "Interesi", "Firme"];
const activeTab = ref("Korisnici");

const users = ref([]);
const analyses = ref([]);
const interests = ref([]);
const companies = ref([]);

const kategorije = [
  "vlaga_i_fleke", "pukotine", "krov", "vodoinstalacije", "elektroinstalacije",
  "fasada", "podovi_i_zidne_obloge", "izolacija", "plijesan", "stolarija", "ostalo",
];

const newCompany = ref({ naziv: "", grad: "", telefon: "", email: "", kategorije: [] });
const companyError = ref("");
const companySuccess = ref("");

async function loadAll() {
  const [u, a, i, c] = await Promise.all([
    api.get("/admin/users"),
    api.get("/admin/analyses"),
    api.get("/admin/interests"),
    api.get("/companies"),
  ]);
  users.value = u.data;
  analyses.value = a.data;
  interests.value = i.data;
  companies.value = c.data;
}

async function addCompany() {
  companyError.value = "";
  companySuccess.value = "";
  try {
    await api.post("/companies", newCompany.value);
    companySuccess.value = "Firma dodana.";
    newCompany.value = { naziv: "", grad: "", telefon: "", email: "", kategorije: [] };
    await loadAll();
  } catch (err) {
    companyError.value = err.response?.data?.message || "Greška.";
  }
}

async function deleteCompany(id) {
  if (!confirm("Obrisati firmu?")) return;
  await api.delete(`/companies/${id}`);
  await loadAll();
}

onMounted(loadAll);
</script>
