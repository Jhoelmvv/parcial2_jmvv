<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import axios from '@/helpers/axios'
import type { EventoCultural, Recinto } from '@/models/evento-cultural'

const eventos = ref<EventoCultural[]>([])
const recintos = ref<Recinto[]>([])
const isLoading = ref(true)
const isSaving = ref(false)
const isDeleting = ref<number | null>(null)
const errorMessage = ref('')
const formError = ref('')

const emptyForm = (): EventoCultural => ({
  id_recinto: 0,
  titulo: '',
  artista_principal: '',
  duracion_minutos: 0,
  precio_entrada: 0,
  fecha_evento: '',
  estado: 'Programado',
})

const form = ref<EventoCultural>(emptyForm())

const programados = computed(
  () => eventos.value.filter((evento) => evento.estado === 'Programado').length,
)
const agotados = computed(
  () => eventos.value.filter((evento) => evento.estado === 'Agotado').length,
)

const loadData = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const [eventosResponse, recintosResponse] = await Promise.all([
      axios.get<EventoCultural[]>('/eventos-culturales'),
      axios.get<Recinto[]>('/recintos'),
    ])
    eventos.value = eventosResponse.data
    recintos.value = recintosResponse.data
  } catch (error) {
    console.error('Error cargando datos', error)
    errorMessage.value = 'No se pudieron cargar los datos. Intenta actualizar la página.'
  } finally {
    isLoading.value = false
  }
}

const saveEvento = async () => {
  formError.value = ''

  if (!recintos.value.length) {
    formError.value = 'Primero registra un recinto para poder crear un evento.'
    return
  }

  isSaving.value = true

  try {
    const evento = {
      ...form.value,
      id_recinto: Number(form.value.id_recinto),
      duracion_minutos: Number(form.value.duracion_minutos),
      precio_entrada: Number(form.value.precio_entrada),
    }

    if (evento.id) {
      await axios.patch(`/eventos-culturales/${evento.id}`, evento)
    } else {
      await axios.post('/eventos-culturales', evento)
    }

    form.value = emptyForm()
    await loadData()
  } catch (error) {
    console.error('Error al guardar el evento', error)
    formError.value = 'No se pudo guardar el evento. Revisa los datos e inténtalo de nuevo.'
  } finally {
    isSaving.value = false
  }
}

const deleteEvento = async (id: number) => {
  if (!confirm('¿Seguro que deseas eliminar este evento?')) return

  isDeleting.value = id
  errorMessage.value = ''

  try {
    await axios.delete(`/eventos-culturales/${id}`)
    await loadData()
  } catch (error) {
    console.error('Error al eliminar el evento', error)
    errorMessage.value = 'No se pudo eliminar el evento. Inténtalo de nuevo.'
  } finally {
    isDeleting.value = null
  }
}

const formatDate = (date: string) => {
  if (!date) return 'Sin fecha'
  const parsedDate = new Date(`${date.slice(0, 10)}T00:00:00`)
  return Number.isNaN(parsedDate.getTime())
    ? date
    : new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium' }).format(parsedDate)
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB',
    maximumFractionDigits: 2,
  }).format(Number(price) || 0)

const recintoLabel = (recinto: Recinto) => {
  const nombre = typeof recinto.nombre === 'string' ? recinto.nombre.trim() : ''
  const ciudad = typeof recinto.ciudad === 'string' ? recinto.ciudad.trim() : ''
  return [nombre || `Recinto #${recinto.id ?? 'sin ID'}`, ciudad].filter(Boolean).join(' · ')
}

const eventoRecintoLabel = (idRecinto: number) => {
  const recinto = recintos.value.find((item) => item.id === idRecinto)
  return recinto ? recintoLabel(recinto) : 'Recinto no disponible'
}

onMounted(loadData)
</script>

<template>
  <main class="events-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">AGENDA Y BOLETERÍA</p>
        <h1>Eventos culturales</h1>
        <p class="page-description">Organiza la programación y administra tus eventos.</p>
      </div>
      <div class="header-icon" aria-hidden="true">
        <i class="bi bi-calendar2-event"></i>
      </div>
    </header>

    <section class="summary-grid" aria-label="Resumen de eventos">
      <article class="summary-card">
        <span class="summary-icon total-icon"><i class="bi bi-ticket-perforated"></i></span>
        <div>
          <p>Total de eventos</p>
          <strong>{{ eventos.length }}</strong>
        </div>
      </article>
      <article class="summary-card">
        <span class="summary-icon scheduled-icon"><i class="bi bi-calendar-check"></i></span>
        <div>
          <p>Programados</p>
          <strong>{{ programados }}</strong>
        </div>
      </article>
      <article class="summary-card">
        <span class="summary-icon sold-icon"><i class="bi bi-check2-circle"></i></span>
        <div>
          <p>Agotados</p>
          <strong>{{ agotados }}</strong>
        </div>
      </article>
    </section>

    <section class="content-card">
      <div class="section-heading">
        <div>
          <p class="eyebrow">NUEVO REGISTRO</p>
          <h2>Crear evento</h2>
        </div>
        <span class="heading-mark"><i class="bi bi-plus-lg"></i></span>
      </div>

      <div v-if="formError" class="notice notice-error" role="alert">
        <i class="bi bi-exclamation-circle"></i>
        <span>{{ formError }}</span>
      </div>

      <form class="event-form" @submit.prevent="saveEvento">
        <label class="field">
          <span>Recinto</span>
          <select v-model.number="form.id_recinto" required :disabled="!recintos.length">
            <option :value="0" disabled>
              {{ recintos.length ? 'Selecciona un recinto' : 'No hay recintos disponibles' }}
            </option>
            <option v-for="recinto in recintos" :key="recinto.id ?? recinto.nombre" :value="recinto.id">
              {{ recintoLabel(recinto) }}
            </option>
          </select>
          <small v-if="!recintos.length && !isLoading">
            Registra un recinto antes de crear eventos.
          </small>
        </label>

        <label class="field">
          <span>Título del evento</span>
          <input
            v-model.trim="form.titulo"
            type="text"
            maxlength="150"
            placeholder="Ej. Festival de música andina"
            required
          />
        </label>

        <label class="field">
          <span>Artista principal</span>
          <input
            v-model.trim="form.artista_principal"
            type="text"
            maxlength="100"
            placeholder="Nombre del artista o grupo"
            required
          />
        </label>

        <label class="field">
          <span>Duración</span>
          <div class="input-suffix">
            <input v-model.number="form.duracion_minutos" type="number" min="1" placeholder="90" required />
            <span>min</span>
          </div>
        </label>

        <label class="field">
          <span>Precio de entrada</span>
          <div class="input-suffix">
            <span>Bs.</span>
            <input
              v-model.number="form.precio_entrada"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              required
            />
          </div>
        </label>

        <label class="field">
          <span>Fecha del evento</span>
          <input v-model="form.fecha_evento" type="date" required />
        </label>

        <label class="field">
          <span>Estado</span>
          <select v-model="form.estado" required>
            <option value="Programado">Programado</option>
            <option value="Agotado">Agotado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </label>

        <div class="form-actions">
          <button class="submit-button" type="submit" :disabled="isSaving || !recintos.length">
            <i :class="isSaving ? 'bi bi-hourglass-split' : 'bi bi-plus-lg'"></i>
            {{ isSaving ? 'Guardando...' : 'Crear evento' }}
          </button>
        </div>
      </form>
    </section>

    <section class="content-card events-card">
      <div class="section-heading list-heading">
        <div>
          <p class="eyebrow">PROGRAMACIÓN</p>
          <h2>Eventos registrados <span class="count-pill">{{ eventos.length }}</span></h2>
        </div>
        <button class="refresh-button" type="button" :disabled="isLoading" @click="loadData">
          <i :class="isLoading ? 'bi bi-arrow-repeat spinning' : 'bi bi-arrow-clockwise'"></i>
          Actualizar
        </button>
      </div>

      <div v-if="errorMessage" class="notice notice-error" role="alert">
        <i class="bi bi-exclamation-circle"></i>
        <span>{{ errorMessage }}</span>
      </div>

      <div v-if="isLoading" class="empty-state">
        <i class="bi bi-arrow-repeat spinning"></i>
        <p>Cargando eventos...</p>
      </div>

      <div v-else-if="!eventos.length" class="empty-state">
        <span class="empty-icon"><i class="bi bi-calendar2-plus"></i></span>
        <h3>Aún no hay eventos</h3>
        <p>Completa el formulario para agregar el primer evento a la agenda.</p>
      </div>

      <div v-else class="table-wrap">
        <table class="events-table">
          <thead>
            <tr>
              <th>Evento</th>
              <th>Recinto</th>
              <th>Fecha</th>
              <th>Entrada</th>
              <th>Estado</th>
              <th><span class="sr-only">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="evento in eventos" :key="evento.id">
              <td>
                <strong class="event-title">{{ evento.titulo || 'Evento sin título' }}</strong>
                <span class="event-artist">{{ evento.artista_principal || 'Artista no especificado' }}</span>
              </td>
              <td>
                <span class="venue-name">{{ eventoRecintoLabel(evento.id_recinto) }}</span>
              </td>
              <td>{{ formatDate(evento.fecha_evento) }}</td>
              <td>{{ formatPrice(evento.precio_entrada) }}</td>
              <td>
                <span class="status-badge" :class="`status-${evento.estado.toLowerCase()}`">
                  <span class="status-dot"></span>
                  {{ evento.estado }}
                </span>
              </td>
              <td class="action-cell">
                <button
                  class="delete-button"
                  type="button"
                  :aria-label="`Eliminar ${evento.titulo}`"
                  :disabled="isDeleting === evento.id"
                  @click="deleteEvento(evento.id!)"
                >
                  <i :class="isDeleting === evento.id ? 'bi bi-hourglass-split' : 'bi bi-trash3'"></i>
                  <span>{{ isDeleting === evento.id ? 'Eliminando' : 'Eliminar' }}</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</template>

<style scoped>
.events-page {
  --ink: #17233c;
  --muted: #748097;
  --line: #e8ebf1;
  --accent: #6d4aff;
  --accent-dark: #5434df;
  width: min(1120px, 100%);
  margin: 0 auto;
  padding: 38px 28px 64px;
  color: var(--ink);
}

.page-header,
.section-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-header {
  margin-bottom: 28px;
}

.eyebrow {
  margin: 0 0 7px;
  color: var(--accent);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.12em;
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 7px;
  font-size: clamp(1.7rem, 3vw, 2.15rem);
  font-weight: 750;
  letter-spacing: -0.04em;
}

.page-description {
  margin-bottom: 0;
  color: var(--muted);
}

.header-icon,
.heading-mark {
  display: grid;
  place-items: center;
  color: var(--accent);
  background: #f0edff;
}

.header-icon {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  font-size: 1.5rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 22px;
}

.summary-card,
.content-card {
  border: 1px solid var(--line);
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 8px 26px rgb(23 35 60 / 4%);
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 19px 21px;
}

.summary-icon {
  display: grid;
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 13px;
  font-size: 1.1rem;
}

.total-icon {
  color: #6042ed;
  background: #f0edff;
}

.scheduled-icon {
  color: #15875a;
  background: #e7f7ef;
}

.sold-icon {
  color: #c17a12;
  background: #fff5dd;
}

.summary-card p {
  margin: 0 0 3px;
  color: var(--muted);
  font-size: 0.83rem;
}

.summary-card strong {
  font-size: 1.45rem;
  line-height: 1;
}

.content-card {
  margin-bottom: 22px;
  padding: 24px;
}

.section-heading {
  margin-bottom: 22px;
}

.section-heading h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 0;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.heading-mark {
  width: 38px;
  height: 38px;
  border-radius: 11px;
}

.event-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px 20px;
}

.field {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
  color: #35415a;
  font-size: 0.84rem;
  font-weight: 650;
}

.field input,
.field select {
  width: 100%;
  min-height: 44px;
  padding: 10px 12px;
  border: 1px solid #dfe3ec;
  border-radius: 9px;
  outline: none;
  background: #fff;
  color: var(--ink);
  font: inherit;
  font-weight: 400;
  transition: border-color 150ms ease, box-shadow 150ms ease;
}

.field input:focus,
.field select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgb(109 74 255 / 12%);
}

.field input::placeholder {
  color: #a4acbb;
}

.field select:disabled {
  background: #f6f7fa;
  color: #929bad;
}

.field small {
  color: #b54747;
  font-size: 0.76rem;
  font-weight: 400;
}

.input-suffix {
  display: flex;
  align-items: center;
  min-height: 44px;
  border: 1px solid #dfe3ec;
  border-radius: 9px;
  color: var(--muted);
}

.input-suffix:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgb(109 74 255 / 12%);
}

.input-suffix input {
  min-width: 0;
  border: 0;
  box-shadow: none;
}

.input-suffix > span {
  padding: 0 11px;
  font-size: 0.8rem;
  font-weight: 500;
}

.input-suffix > span + input {
  padding-left: 0;
}

.form-actions {
  display: flex;
  grid-column: 1 / -1;
  justify-content: flex-end;
  padding-top: 3px;
}

.submit-button,
.refresh-button,
.delete-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 9px;
  font: inherit;
  font-weight: 650;
  cursor: pointer;
  transition: background 150ms ease, transform 150ms ease;
}

.submit-button {
  min-height: 43px;
  padding: 0 17px;
  background: var(--accent);
  color: #fff;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-1px);
  background: var(--accent-dark);
}

.submit-button:disabled,
.refresh-button:disabled,
.delete-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.events-card {
  padding-bottom: 8px;
}

.list-heading {
  margin-bottom: 15px;
}

.count-pill {
  display: inline-grid;
  min-width: 25px;
  height: 25px;
  place-items: center;
  padding: 0 7px;
  border-radius: 20px;
  background: #f0edff;
  color: var(--accent);
  font-size: 0.75rem;
  letter-spacing: 0;
}

.refresh-button {
  min-height: 36px;
  padding: 0 11px;
  border: 1px solid var(--line);
  background: #fff;
  color: #536079;
  font-size: 0.82rem;
}

.refresh-button:hover:not(:disabled) {
  background: #f7f6ff;
}

.notice {
  display: flex;
  align-items: center;
  gap: 9px;
  margin: 0 0 17px;
  padding: 11px 13px;
  border-radius: 9px;
  font-size: 0.85rem;
}

.notice-error {
  border: 1px solid #f0cece;
  background: #fff5f5;
  color: #a53d3d;
}

.table-wrap {
  overflow-x: auto;
}

.events-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.events-table th {
  padding: 12px 13px;
  border-bottom: 1px solid var(--line);
  color: #8992a4;
  font-size: 0.69rem;
  font-weight: 750;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  white-space: nowrap;
}

.events-table td {
  padding: 15px 13px;
  border-bottom: 1px solid #f0f1f5;
  color: #536079;
  font-size: 0.84rem;
  white-space: nowrap;
}

.events-table tbody tr:last-child td {
  border-bottom: 0;
}

.event-title,
.event-artist {
  display: block;
}

.event-title {
  max-width: 260px;
  overflow: hidden;
  color: var(--ink);
  text-overflow: ellipsis;
}

.event-artist {
  margin-top: 4px;
  color: var(--muted);
  font-size: 0.77rem;
}

.venue-name {
  color: #35415a;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 9px;
  border-radius: 30px;
  font-size: 0.75rem;
  font-weight: 650;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.status-programado {
  background: #e9f7ef;
  color: #188452;
}

.status-agotado {
  background: #fff5df;
  color: #a66b0d;
}

.status-cancelado {
  background: #fff0ef;
  color: #bd4d46;
}

.action-cell {
  text-align: right;
}

.delete-button {
  padding: 7px 9px;
  background: #fff3f2;
  color: #b64a43;
  font-size: 0.76rem;
}

.delete-button:hover:not(:disabled) {
  background: #ffe4e1;
}

.empty-state {
  display: flex;
  min-height: 190px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px 16px;
  color: var(--muted);
  text-align: center;
}

.empty-icon {
  display: grid;
  width: 47px;
  height: 47px;
  place-items: center;
  margin-bottom: 12px;
  border-radius: 15px;
  background: #f0edff;
  color: var(--accent);
  font-size: 1.2rem;
}

.empty-state h3 {
  margin-bottom: 5px;
  color: var(--ink);
  font-size: 0.98rem;
}

.empty-state p {
  margin-bottom: 0;
  font-size: 0.83rem;
}

.empty-state > i {
  margin-bottom: 10px;
  color: var(--accent);
  font-size: 1.4rem;
}

.spinning {
  animation: spin 1s linear infinite;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  clip-path: inset(50%);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 700px) {
  .events-page {
    padding: 25px 16px 42px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .summary-card {
    padding: 14px 16px;
  }

  .content-card {
    padding: 19px 16px;
  }

  .event-form {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .form-actions {
    grid-column: auto;
  }

  .submit-button {
    width: 100%;
  }

  .events-table {
    min-width: 760px;
  }

  .list-heading {
    align-items: flex-start;
  }
}
</style>
