<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>Login</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="login" ref="form">
              <v-text-field
                v-model="email"
                label="Email"
                name="email"
                prepend-icon="mdi-email"
                type="email"
                :rules="[rules.required, rules.email]"
              ></v-text-field>

              <v-text-field
                v-model="password"
                label="Senha"
                name="password"
                prepend-icon="mdi-lock"
                type="password"
                :rules="[rules.required]"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="login"
              :loading="loading"
            >
              Login
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar para mensagens de erro -->
    <v-snackbar
      v-model="errorSnackbar.show"
      color="error"
      :timeout="3000"
    >
      {{ errorSnackbar.text }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="errorSnackbar.show = false"
        >
          Fechar
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const form = ref(null)
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorSnackbar = ref({
  show: false,
  text: ''
})

// Regras de validação
const rules = {
  required: (v: string) => !!v || 'Campo obrigatório',
  email: (v: string) => {
    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return pattern.test(v) || 'Email inválido'
  }
}

const login = async () => {
  // Validação do formulário (assumindo que você tem um método validate no ref do form)
  const formEl = form.value as { validate: () => Promise<boolean> } | null
  const isValid = await formEl?.validate()

  if (!isValid) return

  loading.value = true
  try {
    const response = await api.post('/users/login', {
      email: email.value,
      password: password.value
    })

    // Salvar token no localStorage
    localStorage.setItem('token', response.data.token)

    // Redirecionar para a página principal
    router.push('/')
  } catch (error: any) {
    errorSnackbar.value = {
      show: true,
      text: error.response?.data?.message || 'Erro ao fazer login'
    }
  } finally {
    loading.value = false
  }
}
</script>
