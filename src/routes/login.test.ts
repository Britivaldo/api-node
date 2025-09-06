import { test, expect } from 'vitest'
import request from 'supertest'
import { server } from '../app.ts'
import { makeUser } from '../tests/factories/make-user.ts'

test('login', async () => {
  await server.ready()

  const { user, passwordBeforetHash } = await makeUser()

  const response = await request(server.server)
    .post('/sessions')
    .set('Content-Type', 'application/json')
    .send({
      email: user.email,
      password: passwordBeforetHash,
    })

  expect(response.status).toEqual(20)
  expect(response.body).toEqual({
    token: expect.any(String),
  })
})