<template>
  <v-dialog
    v-model="isOpen"
    :transition="transition"
    max-width="700px"
    persistent
  >
    <v-card>
      <v-toolbar :title="isEditMode ? 'Editar Turma' : 'Cadastrar Turma'"></v-toolbar>
      <v-card-text>
        <v-form ref="form" @submit.prevent="handleSubmit">
          <v-container>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.name"
                  label="Nome da Turma"
                  :rules="[v => !!v || 'Nome é obrigatório']"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.max_students"
                  label="Número de Vagas"
                  type="number"
                  min="1"
                  :rules="[
                    v => !!v || 'Número de vagas é obrigatório',
                    v => v > 0 || 'Deve haver pelo menos uma vaga'
                  ]"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.start_date"
                  label="Data de Início"
                  type="date"
                  :rules="[v => !!v || 'Data de início é obrigatória']"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="formData.end_date"
                  label="Data de Término"
                  type="date"
                  :rules="[
                    v => !!v || 'Data de término é obrigatória',
                    v => !formData.start_date || !v || new Date(v) >= new Date(formData.start_date) || 'Data de término deve ser após a data de início'
                  ]"
                  required
                ></v-text-field>
              </v-col>

              <v-col cols="12">
                <v-textarea
                  v-model="formData.description"
                  label="Descrição"
                  rows="3"
                  :rules="[v => !!v || 'Descrição é obrigatória']"
                  required
                ></v-textarea>
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
import { ref, computed, watch, onMounted, defineProps, defineEmits } from 'vue';

interface CourseGroup {
  id?: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  max_students: number;
}

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  courseData: {
    type: Object as () => CourseGroup | null,
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

const isEditMode = computed(() => !!props.courseData?.id);

const form = ref(null);
const loading = ref(false);

const defaultFormData: CourseGroup = {
  name: '',
  description: '',
  start_date: '',
  end_date: '',
  max_students: 30
};

const formData = ref<CourseGroup>({ ...defaultFormData });

watch(() => props.courseData, (newData) => {
  if (newData) {
    formData.value = { ...newData };
  } else {
    resetForm();
  }
}, { immediate: true });

function resetForm() {
  formData.value = { ...defaultFormData };
  if (form.value) {
    form.value.resetValidation();
  }
}

function closeModal() {
  isOpen.value = false;
  resetForm();
}

async function handleSubmit() {
  if (!form.value) return;

  const { valid } = await form.value.validate();

  if (!valid) return;

  loading.value = true;

  try {
    emit('submit', { ...formData.value });
    closeModal();
  } catch (error) {
    console.error('Erro ao salvar:', error);
  } finally {
    loading.value = false;
  }
}
</script>
