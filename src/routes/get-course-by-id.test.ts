import { test, expect } from 'vitest'
import request from 'supertest'
import { server } from '../app.ts'
import { makeCourse } from '../tests/factories/make-course.ts'

test('get a course by id', async () => {
  await server.ready()

  const course = await makeCourse()

  const response = await request(server.server)
    .get(`/course/${course.id}`)

  expect(response.statusCode).toBe(200)
  expect(response.body).toEqual({
    course: {
      id: expect.any(String),
      title: expect.any(String),
      description: null,
    },
  })
})


test('return 404 if course not found', async () => {
  await server.ready()

  const response = await request(server.server)
    .get(`/course/9aefe718-61a5-4e09-8d76-1a728a889194`)

  expect(response.statusCode).toBe(404)
})