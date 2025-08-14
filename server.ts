import fastify from 'fastify'
import crypto from 'node:crypto'

const server = fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      }
    }
  }
})

const courses = [
  { id: '1', title: 'Curso de NodeJS' },
  { id: '2', title: 'Curso de JavaScript' },
  { id: '3', title: 'Curso de ReactJS' },
]

server.get('/courses', () => {
  return { courses }
})

server.get('/courses/:id', (request, reply) => {
  type Params = {
    id: string
  }

  const params = request.params as Params
  const courseId = params.id

  const course = courses.find(course => course.id === courseId)

  if(course) {
    return reply.status(200).send(course)
  }

  return reply.status(404).send({ error: 'Course not found' })
})

server.post('/courses', (request, reply) => {
  type Body = {
    title: string
  }

  const coursesId = crypto.randomUUID()
  
  const body = request.body as Body
  const courseTitle = body.title

  if(!courseTitle) {
    return reply.status(400).send({ message: 'Title is required' })
  }

  courses.push({
    id: coursesId,
    title: courseTitle,
  })

  return reply.status(201).send({ coursesId })
})

server.listen({ port: 3333 }).then(() => {
  console.log('Server is running on port 3333')
})