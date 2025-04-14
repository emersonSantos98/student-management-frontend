<template>
  <v-app>
    <v-layout class="rounded rounded-md">
      <AppHeader
        :isAuthenticated="isAuthenticated"
        @logout="logout"
      />

      <AppNavigation
        v-if="isAuthenticated"
        @logout="logout"
      />

      <v-main>
        <v-container fluid>
          <router-view />
        </v-container>
      </v-main>
    </v-layout>

    <AppFooter />
  </v-app>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppNavigation from '@/components/AppNavigation.vue'
import AppFooter from '@/components/AppFooter.vue'

const router = useRouter()

const isAuthenticated = computed(() => {
  return !!localStorage.getItem('token')
})

const logout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>
