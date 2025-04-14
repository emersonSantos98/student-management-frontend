import { defineStore } from 'pinia'
import studentService, { Student } from '@/services/studentService'

interface StudentState {
  students: Student[]
  currentStudent: Student | null
  loading: boolean
  error: string | null
}

export const useStudentStore = defineStore('student', {
  state: (): StudentState => ({
    students: [],
    currentStudent: null,
    loading: false,
    error: null
  }),

  actions: {
    async fetchStudents() {
      this.loading = true
      try {
        this.students = await studentService.getAll()
        this.error = null
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch students'
      } finally {
        this.loading = false
      }
    },

    async fetchStudent(id: string | number) {
      this.loading = true
      try {
        this.currentStudent = await studentService.getById(id)
        this.error = null
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch student'
      } finally {
        this.loading = false
      }
    },

    async createStudent(student: Omit<Student, 'id'>) {
      this.loading = true
      try {
        await studentService.create(student)
        this.error = null
      } catch (error: any) {
        this.error = error.message || 'Failed to create student'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateStudent(id: string | number, student: Omit<Student, 'id'>) {
      this.loading = true
      try {
        await studentService.update(id, student)
        this.error = null
      } catch (error: any) {
        this.error = error.message || 'Failed to update student'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteStudent(id: string | number) {
      this.loading = true
      try {
        await studentService.delete(id)
        this.students = this.students.filter(student => student.id !== id)
        this.error = null
      } catch (error: any) {
        this.error = error.message || 'Failed to delete student'
        throw error
      } finally {
        this.loading = false
      }
    },

    resetCurrentStudent() {
      this.currentStudent = null
    }
  }
})
