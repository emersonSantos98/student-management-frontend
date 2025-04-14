<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h1>Consulta de Turmas</h1>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="router.push({ name: 'course-group-create' })"
        >
          Cadastrar Turma
        </v-btn>
      </v-col>
    </v-row>

    <!-- Filtros -->
    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="filters.name"
              label="Nome da Turma"
              hide-details
              density="compact"
              @update:model-value="handleSearch"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="filters.startDate"
              label="Data Início"
              type="date"
              hide-details
              density="compact"
              @update:model-value="handleSearch"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="filters.endDate"
              label="Data Fim"
              type="date"
              hide-details
              density="compact"
              @update:model-value="handleSearch"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="courseGroups"
        :loading="loading"
        :items-per-page="pagination.limit"
        :page="pagination.page"
        :total-items="total"
        @update:page="handlePageChange"
        class="elevation-1"
      >
        <template v-slot:item.start_date="{ item }">
          {{ formatDate(item.start_date) }}
        </template>
        <template v-slot:item.end_date="{ item }">
          {{ formatDate(item.end_date) }}
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            variant="text"
            color="primary"
            @click="router.push({ name: 'course-group-edit', params: { id: item.id } })"
          >
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn
            icon
            variant="text"
            color="error"
            @click="openDeleteDialog(item)"
          >
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <!-- Dialog de confirmação para exclusão -->
    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Confirmar exclusão</v-card-title>
        <v-card-text>
          Tem certeza que deseja excluir a turma {{ courseGroupToDelete?.name }}?
          Esta ação não pode ser desfeita.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="deleteDialog = false">
            Cancelar
          </v-btn>
          <v-btn
            color="error"
            variant="text"
            @click="confirmDelete"
            :loading="deleting"
          >
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Fechar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { courseService } from '@/services/courseService.ts'

const router = useRouter()
const loading = ref(false)
const courseGroups = ref([])
const total = ref(0)

const pagination = ref({
  page: 1,
  limit: 10
})

const filters = ref({
  name: '',
  startDate: '',
  endDate: ''
})

const deleteDialog = ref(false)
const courseGroupToDelete = ref(null)
const deleting = ref(false)
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

const headers = [
  { title: 'Nome', key: 'name' },
  { title: 'Descrição', key: 'description' },
  { title: 'Data Início', key: 'start_date' },
  { title: 'Data Fim', key: 'end_date' },
  { title: 'Vagas', key: 'max_students' },
  { title: 'Alunos Ativos', key: 'activeStudentsCount' },
  { title: 'Ações', key: 'actions', sortable: false }
]

const fetchCourseGroups = async () => {
  loading.value = true
  try {
    const response = await courseService.getAll({
      ...pagination.value,
      ...filters.value
    })
    courseGroups.value = response.data.courseGroups
    total.value = response.data.total
  } catch (error) {
    showSnackbar('Erro ao carregar turmas', 'error')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.page = 1
  fetchCourseGroups()
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  fetchCourseGroups()
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const openDeleteDialog = (courseGroup: any) => {
  courseGroupToDelete.value = courseGroup
  deleteDialog.value = true
}

const confirmDelete = async () => {
  if (!courseGroupToDelete.value?.id) return

  deleting.value = true
  try {
    await courseService.delete(courseGroupToDelete.value.id)
    deleteDialog.value = false
    showSnackbar('Turma excluída com sucesso')
    fetchCourseGroups()
  } catch (error) {
    showSnackbar('Erro ao excluir turma', 'error')
  } finally {
    deleting.value = false
  }
}

const showSnackbar = (text: string, color: 'success' | 'error' = 'success') => {
  snackbar.value = {
    show: true,
    text,
    color
  }
}

onMounted(() => {
  fetchCourseGroups()
})
</script>
