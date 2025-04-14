<template xmlns="">
  <v-app>
    <v-app-bar density="compact" color="primary">
      <v-app-bar-title>Sistema de Gerenciamento de Alunos</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn v-if="isAuthenticated" icon @click="logout">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer
      v-if="isAuthenticated"
      v-model="drawer"
      permanent
    >
      <v-list>
        <v-list-item
          title="Dashboard"
          prepend-icon="mdi-view-dashboard"
          to="/"
        ></v-list-item>
        <v-list-item
          title="Alunos"
          prepend-icon="mdi-account-multiple"
          to="/students"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view />
    </v-main>

    <v-footer app>
      <div class="text-center w-100">
        {{ new Date().getFullYear() }} — <strong>+A Educação</strong>
      </div>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const drawer = ref(true)

// Estado de autenticação simulado
const isAuthenticated = computed(() => {
  return !!localStorage.getItem('token')
})

// Função de logout
const logout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>
