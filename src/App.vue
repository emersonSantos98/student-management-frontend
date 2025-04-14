<template>
  <v-app>
    <template v-if="!isLoginPage">
      <v-layout>
        <AppNavigation
          v-if="isAuthenticated"
          @logout="logout"
        />

        <AppHeader
          :isAuthenticated="isAuthenticated"
          @logout="logout"
        />

        <v-main>
          <v-container fluid>
            <router-view />
          </v-container>
        </v-main>

        <AppFooter />
      </v-layout>
    </template>

    <template v-else>
      <router-view />
    </template>
  </v-app>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppNavigation from '@/components/AppNavigation.vue'
import AppFooter from '@/components/AppFooter.vue'

const router = useRouter()
const route = useRoute()

const isAuthenticated = computed(() => {
  return !!localStorage.getItem('token')
})

const isLoginPage = computed(() => {
  return route.path === '/login'
})

const logout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>
