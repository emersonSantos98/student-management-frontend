<template>
  <v-navigation-drawer v-model="drawer" :rail="rail" permanent>
    <div class="pa-2">
      <v-btn
        variant="text"
        :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
        @click.stop="toggleRail"
      ></v-btn>
    </div>

    <div class="px-2" v-if="!rail">
      <v-avatar class="mb-2" size="64" rounded="0">
        <v-img src="/api/placeholder/80/80" alt="Avatar"></v-img>
      </v-avatar>
      <div class="text-subtitle-1 font-weight-bold">Admin</div>
      <div class="text-caption text-medium-emphasis">admin@exemplo.com</div>
    </div>

    <v-divider class="my-2"></v-divider>

    <v-list nav density="compact">
      <v-list-item
        v-for="item in menuItems"
        :key="item.value"
        :title="rail ? '' : item.title"
        :prepend-icon="item.icon"
        :to="item.to"
        :value="item.value"
      ></v-list-item>
    </v-list>

    <template v-slot:append>
      <div class="pa-2">
        <v-btn
          block
          @click="$emit('logout')"
          color="primary"
          variant="tonal"
          prepend-icon="mdi-logout"
        >
          {{ rail ? '' : 'Sair' }}
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>


<script setup lang="ts">
import { ref } from 'vue'

const drawer = ref(true)
const rail = ref(false)

const menuItems = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/', value: 'dashboard' },
  { title: 'Alunos', icon: 'mdi-account-multiple', to: '/students', value: 'students' },
  { title: 'Matrículas', icon: 'mdi-school', to: '/enrollments', value: 'enrollments' },
  { title: 'Configurações', icon: 'mdi-cog', to: '/settings', value: 'settings' }
]

const toggleRail = () => {
  rail.value = !rail.value
}

defineEmits(['logout'])
</script>
