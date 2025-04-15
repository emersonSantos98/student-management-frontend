<template>
  <v-dialog
    v-model="isOpen"
    :transition="transition"
    max-width="700px"
    persistent
  >
    <v-card>
      <v-toolbar :title="isEditMode ? 'Editar Estudante' : 'Cadastrar Estudante'"></v-toolbar>
      <v-card-text>
        <v-form ref="form" @submit.prevent="handleSubmit">
          <v-container>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.name"
                  label="Nome"
                  :rules="[v => !!v || 'Nome é obrigatório']"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.email"
                  label="Email"
                  type="email"
                  :rules="[
                    v => !!v || 'Email é obrigatório',
                    v => /.+@.+\..+/.test(v) || 'Email deve ser válido'
                  ]"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.ra"
                  label="RA"
                  :rules="[v => !!v || 'RA é obrigatório']"
                  required
                  :disabled="isEditMode"
                  hint="RA não pode ser alterado após o cadastro"
                  persistent-hint
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.cpf"
                  label="CPF"
                  :rules="[
                    v => !!v || 'CPF é obrigatório',
                    v => /^\d{11}$/.test(v.replace(/\D/g, '')) || 'CPF deve conter 11 dígitos'
                  ]"
                  required
                  :disabled="isEditMode"
                  hint="CPF não pode ser alterado após o cadastro"
                  persistent-hint
                  maxlength="14"
                  @input="formatCPF"
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-autocomplete
                  v-model="formData.courseGroupIds"
                  :items="courseGroups"
                  item-title="name"
                  item-value="id"
                  label="Turmas"
                  multiple
                  chips
                  closable-chips
                  :loading="loadingCourseGroups"
                ></v-autocomplete>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn
          color="grey-darken-1"
          variant="text"
          @click="closeModal"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          variant="text"
          @click="handleSubmit"
          :loading="loading"
        >
          {{ isEditMode ? 'Salvar' : 'Cadastrar' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, defineProps, defineEmits } from 'vue';
import { courseService } from '@/services/courseService.ts';
import { enrollmentService } from '@/services/enrollmentService.ts';

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
  enrollments?: Array<{
    id: string;
    status: string;
    courseGroup: {
      id: string;
      name: string;
    }
  }>;
}

interface Enrollment {
  id: string;
  status: string;
  courseGroup: {
    id: string;
    name: string;
  }
}

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  studentData: {
    type: Object as () => Student | null,
    default: null
  },
  transition: {
    type: String,
    default: 'dialog-bottom-transition'
  }
});

const emit = defineEmits(['update:modelValue', 'submit']);

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const isEditMode = computed(() => !!props.studentData?.id);

const form = ref(null);
const loading = ref(false);
const loadingCourseGroups = ref(false);
const courseGroups = ref<CourseGroup[]>([]);
const currentEnrollments = ref<Enrollment[]>([]);
const removedEnrollmentIds = ref<string[]>([]);

const defaultFormData: Student = {
  name: '',
  email: '',
  ra: '',
  cpf: '',
  courseGroupIds: []
};

const formData = reactive<Student>({ ...defaultFormData });

watch(() => props.studentData, (newData) => {
  if (newData) {
    const activeEnrollments = newData.enrollments?.filter(
      enrollment => enrollment.status === 'active'
    ) || [];

    currentEnrollments.value = activeEnrollments;
    removedEnrollmentIds.value = [];

    Object.assign(formData, {
      ...defaultFormData,
      ...newData,
      courseGroupIds: activeEnrollments.map(e => e.courseGroup.id)
    });

    if (formData.cpf) {
      formatCPF();
    }
  } else {
    resetForm();
  }
}, { immediate: true });

watch(() => formData.courseGroupIds, (newIds, oldIds) => {
  if (!isEditMode.value || !oldIds) return;

  const removedGroupIds = oldIds.filter(id => !newIds.includes(id));

  removedGroupIds.forEach(groupId => {
    const enrollment = currentEnrollments.value.find(
      e => e.courseGroup.id === groupId
    );
    if (enrollment) {
      removedEnrollmentIds.value.push(enrollment.id);
    }
  });
});

function resetForm() {
  Object.assign(formData, { ...defaultFormData });
  currentEnrollments.value = [];
  removedEnrollmentIds.value = [];
  if (form.value) {
    form.value.resetValidation?.();
  }
}

function closeModal() {
  isOpen.value = false;
  resetForm();
}

function formatCPF() {
  if (!formData.cpf) return;

  const cpfDigits = formData.cpf.replace(/\D/g, '');

  if (cpfDigits.length <= 11) {
    let formattedCPF = '';
    for (let i = 0; i < cpfDigits.length; i++) {
      if (i === 3 || i === 6) formattedCPF += '.';
      if (i === 9) formattedCPF += '-';
      formattedCPF += cpfDigits[i];
    }
    formData.cpf = formattedCPF;
  }
}

async function fetchCourseGroups() {
  loadingCourseGroups.value = true;
  try {
    const response = await courseService.getAll({ limit: 100 });
    courseGroups.value = response.data.courseGroups;
  } catch (error) {
    console.error('Erro ao carregar turmas:', error);
  } finally {
    loadingCourseGroups.value = false;
  }
}

async function handleSubmit() {
  if (!form.value) return;

  const { valid } = await form.value.validate?.() || { valid: true };

  if (!valid) return;

  loading.value = true;

  try {
    for (const enrollmentId of removedEnrollmentIds.value) {
      await enrollmentService.delete(enrollmentId);
    }

    const submissionData = {
      ...formData,
      cpf: formData.cpf.replace(/\D/g, '')
    };


    if (isEditMode.value) {
      delete submissionData.ra;
      delete submissionData.cpf;
    }

    emit('submit', submissionData);
    closeModal();
  } catch (error) {
    console.error('Erro ao salvar:', error);
  } finally {
    loading.value = false;
  }
}


onMounted(() => {
  fetchCourseGroups();
});
</script>
