import api from './api'

export interface Course {
  id?: number
  name: string
  description: string
  start_date: string
  end_date: string
  max_students: number
}

interface FilterParams {
  page?: number;
  limit?: number;
  name?: string;
  startDate?: string;
  endDate?: string;
}

export const courseService = {
  getAll: async (params: FilterParams = {}) => {
    const response = await api.get('/course-groups', { params })
    return response.data
  },

  getById: async (id: string | number) => {
    const response = await api.get(`/course-groups/${id}`)
    return response.data
  },

  create: async (course: Omit<Course, 'id'>) => {
    const response = await api.post('/course-groups', course)
    return response.data
  },

  update: async (id: string | number, course: Omit<Course, 'id'>) => {
    const response = await api.put(`/course-groups/${id}`, course)
    return response.data
  },

  delete: async (id: string | number) => {
    const response = await api.delete(`/course-groups/${id}`)
    return response.data
  }
}

export default courseService
