<template>
  <v-navigation-drawer color="#00928e" v-model="drawer" :rail="rail" permanent>
    <div class="pa-2">
      <v-btn
        variant="text"
        :icon="rail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
        @click.stop="toggleRail"
      ></v-btn>
    </div>


    <div class="px-2" v-if="!rail">
      <div class="text-subtitle-1 font-weight-bold">{{ user.name }}</div>
      <div class="text-caption text-medium-emphasis mb-2">{{ user.email }}</div>
      <div class="d-flex justify-start">
        <v-chip
          size="small"
          color="dark"
          class="text-uppercase"
        >
          {{ user.role }}
        </v-chip>
      </div>
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
import { ref, onMounted } from 'vue'

const drawer = ref(true)
const rail = ref(false)
const user = ref({
  name: '',
  email: '',
  role: ''
})

onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
  }
})

const menuItems = [
  { title: 'Alunos', icon: 'mdi-account-multiple', to: '/students', value: 'students' },
  { title: 'Cursos', icon: 'mdi-book', to: '/courses', value: 'courses' },
]

const toggleRail = () => {
  rail.value = !rail.value
}

defineEmits(['logout'])
</script>
