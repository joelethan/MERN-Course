const mongoose = require('mongoose')
const User = require('../models/User')
const db_url = 'mongodb://localhost/test'

const app = require('../server')
const supertest = require('supertest')
const request = supertest(app)

beforeAll(async () => {
  await mongoose.connect(db_url, { useUnifiedTopology: true, useNewUrlParser: true })
})
afterEach(async () => {
    await User.deleteMany()
  })

it('gets the test endpoint', async done => {
    const response = await request.get('/')
    
    expect(response.status).toBe(200)
    expect(response.body.msg).toBe('Hello world!!')
    done()
})

it('Should register a new user', async done => {
  const res = await request.post('/api/user/register')
    .send({
      name: 'Zell',
      email: 'testing@gmail.com',
      password: 'password',
      password2: 'password'
    })
    expect(res.status).toBe(200)
    expect(res.body.email).toBe('testing@gmail.com');
    done()
  })

  it('Should login a registered user', async done => {
    await request.post('/api/user/register')
      .send({
        name: 'Zell',
        email: 'testing@gmail.com',
        password: 'password',
        password2: 'password'
      })
    const res = await request.post('/api/user/login')
      .send({
        email: 'testing@gmail.com',
        password: 'password'
      })
    expect(res.status).toBe(200)
    console.log(res.body);
    expect(res.body.success).toBe(true);
    done()
  })
