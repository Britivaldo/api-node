import { test, expect } from 'vitest'
import request from 'supertest'
import { server } from '../app.ts'
import { makeCourse } from '../tests/factories/make-course.ts'
import { randomUUID } from 'crypto'
import { makeAuthenticatedUser } from '../tests/factories/make-user.ts'

test('get courses ', async () => {
  await server.ready()

  const titleId = randomUUID()

   const { token } = await makeAuthenticatedUser('manager')
  const course = await makeCourse(titleId)

  const response = await request(server.server)
    .get(`/courses/search=${titleId}`)
    .set('Authorization', token)

  expect(response.statusCode).toBe(200)
  expect(response.body).toEqual({
    total: 1,
    course: [
      {
        id: expect.any(String),
        title: titleId,
        enrollments: 0,
      }
    ],
  })
})