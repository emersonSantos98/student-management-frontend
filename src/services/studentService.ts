import api from './api'

export interface Student {
  id?: number
  name: string
  email: string
  ra: string
  cpf: string
}

export const studentService = {
  getAll: async () => {
    const response = await api.get('/students')
    return response.data
  },

  getById: async (id: string | number) => {
    const response = await api.get(`/students/${id}`)
    return response.data
  },

  create: async (student: Omit<Student, 'id'>) => {
    const response = await api.post('/students', student)
    return response.data
  },

  update: async (id: string | number, student: Omit<Student, 'id'>) => {
    const response = await api.put(`/students/${id}`, student)
    return response.data
  },

  delete: async (id: string | number) => {
    const response = await api.delete(`/students/${id}`)
    return response.data
  }
}

export default studentService
