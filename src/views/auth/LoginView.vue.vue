<template>
<div class="login-wrapper">
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4" class="text-center" >
       <h1 class="text-h4  font-weight-bold mb-12 white--text">
            <v-icon class="mr-2" size="48" color="white">
              mdi-school
            </v-icon>
          <span class="text-white">Sistema de Gestão Escolar</span>
          </h1>
        <v-card class="elevation-12">
          <v-toolbar color="#00928e" dark flat>
            <v-toolbar-title> Login Administrativo</v-toolbar-title>
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
              color="#00928e"
              @click="login"
              :loading="loading"
            >
              Login
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

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
   </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const form = ref(null)
const email = ref('admin@example.com')

const password = ref('@123456')
const loading = ref(false)
const errorSnackbar = ref({
  show: false,
  text: ''
})

const rules = {
  required: (v: string) => !!v || 'Campo obrigatório',
  email: (v: string) => {
    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return pattern.test(v) || 'Email inválido'
  }
}

const login = async () => {
  const formEl = form.value as { validate: () => Promise<boolean> } | null
  const isValid = await formEl?.validate()

  if (!isValid) return

  loading.value = true
  try {
    const response = await api.post('/users/login', {
      email: email.value,
      password: password.value
    })

    localStorage.setItem('token', response.data.data.token)

    localStorage.setItem('user', JSON.stringify(response.data.data.user))

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

<style scoped>
.login-wrapper {
  background-image: linear-gradient(
    rgba(0, 0, 0, 0.7),
    rgba(0, 0, 0, 0.5)
  ), url('@/assets/fundo.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
  width: 100%;
}

.white--text {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}
</style>
