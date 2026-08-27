<template>
  <div class="container app-shell py-3">
    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <h5 class="card-title">Prijavi problem</h5>
        <p class="text-muted small">
          Uslikaj problem u kući ili stanu (npr. fleku na zidu, pukotinu, oštećenje) i po potrebi
          dodaj kratak opis. AI će ti reći o čemu se vjerojatno radi i predložit će rješenje.
        </p>

        <div v-if="uploadError" class="alert alert-danger py-2">{{ uploadError }}</div>

        <form @submit.prevent="submitAnalysis">
          <div class="mb-3">
            <label class="form-label">Fotografija</label>
            <input
              ref="fileInput"
              type="file"
              accept="image/*"
              capture="environment"
              class="form-control"
              required
              @change="onFileChange"
            />
          </div>
          <div v-if="previewUrl" class="mb-3">
            <img :src="previewUrl" class="result-photo" alt="Pregled fotografije" />
          </div>
          <div class="mb-3">
            <label class="form-label">Opis (opcionalno)</label>
            <textarea
              v-model="description"
              class="form-control"
              rows="2"
              placeholder="npr. velika mrlja na zidu, pojavila se nakon kiše"
            ></textarea>
          </div>
          <button type="submit" class="btn btn-tm w-100" :disabled="analyzing">
            {{ analyzing ? "Analiziram fotografiju..." : "Analiziraj" }}
          </button>
        </form>
      </div>
    </div>

    <!-- Rezultat analize -->
    <div v-if="result" class="card shadow-sm mb-4 border-2" :style="{ borderColor: 'var(--tm-orange)' }">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <h5 class="card-title mb-0">{{ result.naslovProblema }}</h5>
          <span class="badge" :class="'badge-hitnost-' + result.hitnost">
            hitnost: {{ result.hitnost }}
          </span>
        </div>
        <img :src="imageUrl(result.slika)" class="result-photo mb-3" alt="Analizirana fotografija" />

        <p><strong>Dijagnoza:</strong> {{ result.opisProblema }}</p>
        <p><strong>Preporučeno rješenje:</strong> {{ result.preporuceno_rjesenje }}</p>
        <p>
          <strong>Okvirni trošak:</strong>
          {{ result.procjenaTroskaMin }}–{{ result.procjenaTroskaMax }} EUR
        </p>
        <p class="text-muted small mb-3">
          Pouzdanost AI procjene: {{ Math.round(result.pouzdanost * 100) }}%
          <span v-if="result.pouzdanost < 0.5">— slika nije bila potpuno jasna, preporuka je okvirna.</span>
        </p>

        <h6 class="mt-3">Preporučene firme</h6>
        <ul v-if="result.preporuceneFirme.length" class="list-group">
          <li
            v-for="c in result.preporuceneFirme"
            :key="c._id"
            class="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <strong>{{ c.naziv }}</strong> <span class="text-muted">· {{ c.grad }}</span>
              <br />
              <small>{{ c.telefon }} · {{ c.email }}</small>
            </div>
            <button
              class="btn btn-sm btn-outline-dark"
              :disabled="interestSentFor.has(c._id)"
              @click="expressInterest(c._id)"
            >
              {{ interestSentFor.has(c._id) ? "Poslano ✓" : "Zanima me" }}
            </button>
          </li>
        </ul>
        <p v-else class="text-muted small">Trenutno nema firmi za ovu kategoriju u bazi.</p>
      </div>
    </div>

    <!-- Povijest -->
    <h6 v-if="history.length">Prijašnje prijave</h6>
    <div v-for="h in history" :key="h._id" class="card mb-2">
      <div class="card-body py-2">
        <div class="d-flex justify-content-between">
          <strong>{{ h.naslovProblema }}</strong>
          <small class="text-muted">{{ formatDate(h.createdAt) }}</small>
        </div>
        <small class="text-muted">{{ h.kategorija }}</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import api, { imageUrl } from "../api.js";

const fileInput = ref(null);
const previewUrl = ref("");
const description = ref("");
const analyzing = ref(false);
const uploadError = ref("");
const result = ref(null);
const history = ref([]);
const interestSentFor = ref(new Set());

function onFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  previewUrl.value = URL.createObjectURL(file);
}

async function submitAnalysis() {
  uploadError.value = "";
  const file = fileInput.value.files[0];
  if (!file) {
    uploadError.value = "Odaberi fotografiju.";
    return;
  }

  analyzing.value = true;
  result.value = null;
  interestSentFor.value = new Set();

  try {
    const formData = new FormData();
    formData.append("photo", file);
    formData.append("description", description.value);

    const { data } = await api.post("/analysis", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    result.value = data;
    await loadHistory();
  } catch (err) {
    uploadError.value = err.response?.data?.message || "Greška pri analizi. Pokušaj ponovno.";
  } finally {
    analyzing.value = false;
  }
}

async function expressInterest(companyId) {
  try {
    await api.post("/interest", { companyId, analysisId: result.value._id });
    interestSentFor.value = new Set([...interestSentFor.value, companyId]);
  } catch (err) {
    alert(err.response?.data?.message || "Greška.");
  }
}

async function loadHistory() {
  const { data } = await api.get("/analysis");
  history.value = data;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("hr-HR");
}

onMounted(loadHistory);
</script>
