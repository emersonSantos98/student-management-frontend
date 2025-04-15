import api from './api'



export const enrollmentService = {
  delete: async (id: string | number) => {
    const response = await api.delete(`/enrollments/${id}`)
    return response.data
  }
}


export default enrollmentService
