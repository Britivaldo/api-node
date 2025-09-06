import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { db } from '../database/client.ts'
import { courses, enrollments } from '../database/schema.ts'
import { ilike, asc, SQL, and, eq, count } from 'drizzle-orm'
import z from 'zod'
import { checkRequestJWt } from './hooks/check-request-jwt.ts'
import { checkUserRole } from './hooks/check-user-role.ts'

export const getCoursesRoute: FastifyPluginAsyncZod = async (server) => {
  server.get('/courses', {
    preHandler: [
      checkRequestJWt,
      checkUserRole('manager'),
    ],
    schema: {
      tags: ['courses'],
      summary: 'Get all courses',
      querystring: z.object({
        search: z.string().optional(),
        orderBy: z.enum(['title']).optional().default('title'),
        page: z.coerce.number().optional().default(1),
        perPage: z.coerce.number().optional().default(10),
      }),
      response: {
        200: z.object({
          courses: z.array(
            z.object({
              id: z.uuid(),
              title: z.string(),
              enrollments: z.number(),
            })
          ),
          total: z.number(),
        })
      }
    },
  }, async (request, reply) => {
    const { search, orderBy, page, perPage } = request.query

    const conditions: SQL[] = []

    if (search) {
      conditions.push(ilike(courses.title, `%${search}%`))
    }

    const [result, total] = await Promise.all([
      db
        .select({
          id: courses.id,
          title: courses.title,
          enrollments: count(enrollments.id)
        })
        .from(courses)
        .leftJoin(enrollments, eq(courses.id, enrollments.courseId))
        .orderBy(asc(courses[orderBy]))
        .limit(perPage)
        .offset((page - 1) * perPage)
        .where(and(...conditions))
        .groupBy(courses.id),
      db.$count(courses, and(...conditions))
    ])

    return reply.send({ courses: result, total })
  })
}