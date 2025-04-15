<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h1>Consulta de Estudantes</h1>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openModal()"
        >
          Cadastrar Estudante
        </v-btn>
      </v-col>
    </v-row>

    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="filters.name"
              label="Nome do Estudante"
              hide-details
              density="compact"
              @update:model-value="handleSearch"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="filters.email"
              label="Email"
              hide-details
              density="compact"
              @update:model-value="handleSearch"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field
              v-model="filters.ra"
              label="RA"
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
        :items="students"
        :loading="loading"
        :items-per-page="pagination.limit"
        :page="pagination.page"
        :total-items="total"
        @update:page="handlePageChange"
        class="elevation-1"
      >
        <template v-slot:item.courseGroups="{ item }">
          <v-chip
            v-for="(courseGroup, index) in item.courseGroups"
            :key="index"
            class="mr-1 mb-1"
            size="small"
            color="primary"
          >
            {{ courseGroup.name }}
          </v-chip>
        </template>
        <template v-slot:item.cpf="{ item }">
          {{ formatCPFDisplay(item.cpf) }}
        </template>
        <template v-slot:item.actions="{ item }">
          <v-btn
            icon
            variant="text"
            color="primary"
            @click="openModal(item)"
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

    <v-dialog v-model="deleteDialog" max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Confirmar exclusão</v-card-title>
        <v-card-text>
          Tem certeza que deseja excluir o estudante {{ studentToDelete?.name }}?
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

    <StudentModal
      v-model="modalOpen"
      :student-data="selectedStudent"
      :transition="'dialog-bottom-transition'"
      @submit="handleFormSubmit"
    />

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Fechar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { studentService } from '@/services/studentService.ts'
import StudentModal from '@/components/students/modalStudent.vue'

interface CourseGroup {
  id: string;
  name: string;
}

interface Student {
  id?: string;
  name: string;
  email: string;
  ra: string;
  cpf: string;
  courseGroupIds: string[];
  courseGroups?: CourseGroup[];
}

interface APIError {
  response?: {
    data?: {
      message?: string;
      errors?: Array<{
        field: string;
        message: string;
      }>;
    };
  };
}

const loading = ref(false)
const students = ref<Student[]>([])
const total = ref(0)

const pagination = reactive({
  page: 1,
  limit: 10
})

const filters = reactive({
  name: '',
  email: '',
  ra: ''
})

const deleteDialog = ref(false)
const studentToDelete = ref<Student | null>(null)
const deleting = ref(false)
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
})

const modalOpen = ref(false)
const selectedStudent = ref<Student | null>(null)

const headers = [
  { title: 'Nome', key: 'name' },
  { title: 'Email', key: 'email' },
  { title: 'RA', key: 'ra' },
  { title: 'CPF', key: 'cpf', sortable: false },
  { title: 'Turmas', key: 'activeCourseCount', sortable: false },
  { title: 'Ações', key: 'actions', sortable: false }
]

const fetchStudents = async () => {
  loading.value = true
  try {
    const response = await studentService.getAll({
      ...pagination,
      ...filters
    })
    students.value = response.data.students
    total.value = response.data.total
  } catch (error) {
    showSnackbar('Erro ao carregar estudantes', 'error')
  } finally {
    loading.value = false
  }
}

const openModal = (student: Student | null = null) => {
  selectedStudent.value = student ? { ...student } : null
  modalOpen.value = true
}

const handleFormSubmit = async (formData: Student) => {
  loading.value = true
  try {
    if (formData.id) {
      await studentService.update(formData.id, formData)
      showSnackbar('Estudante atualizado com sucesso')
    } else {
      await studentService.create(formData)
      showSnackbar('Estudante cadastrado com sucesso')
    }
    fetchStudents()
  } catch (error: APIError | unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as APIError;
      if (apiError.response?.data) {
        const errorData = apiError.response.data;

        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors.map(err => `${err.field}: ${err.message}`).join('\n');
          showSnackbar(errorMessages, 'error');
        } else if (errorData.message) {
          showSnackbar(errorData.message, 'error');
        } else {
          showSnackbar(`Erro ao ${formData.id ? 'atualizar' : 'cadastrar'} estudante`, 'error');
        }
      }
    } else {
      showSnackbar(`Erro ao ${formData.id ? 'atualizar' : 'cadastrar'} estudante`, 'error');
    }
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchStudents()
}

const handlePageChange = (page: number) => {
  pagination.page = page
  fetchStudents()
}

const openDeleteDialog = (student: Student) => {
  studentToDelete.value = student
  deleteDialog.value = true
}

const confirmDelete = async () => {
  if (!studentToDelete.value?.id) return

  deleting.value = true
  try {
    await studentService.delete(studentToDelete.value.id)
    deleteDialog.value = false
    showSnackbar('Estudante excluído com sucesso')
    await fetchStudents()
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Erro ao excluir estudante'
    showSnackbar(errorMessage, 'error')
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

const formatCPFDisplay = (cpf: string) => {
  if (!cpf) return '';
  const cleanCpf = cpf.replace(/\D/g, '');
  return cleanCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

onMounted(() => {
  fetchStudents()
})
</script>
