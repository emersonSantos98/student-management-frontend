<template>
  <v-app-bar color="#00928e">
    <v-app-bar-title>Sistema de Gerenciamento de Alunos</v-app-bar-title>
    <v-spacer></v-spacer>
    <v-btn v-if="isAuthenticated" icon @click="logout">
      <v-icon>mdi-logout</v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script setup lang="ts">
defineProps<{
  isAuthenticated: boolean
}>()

const emit = defineEmits(['logout'])

const logout = () => {
  emit('logout')
}
</script>
