process.env.NODE_ENV = 'test';
process.env.PORT = 5001;

const expect = require('chai').expect;
const request = require('supertest');

const app = require('../server');
const conn = require('../db');

describe('USER /api/user/', ()=>{
    const userData = {
        email: 'email@gmail.com',
        name: 'name',
        password: 'password',
        password2: 'password'
    }

    before((done) => {
        conn.connect();
        done();
    })

    after((done) => {
        conn.close();
        done();
    })

    it('OK, test root endpoint', (done) => {
        request(app).get('/')
            .then(res => {
                const { body } = res;
                expect(body).to.contain.property('msg');
                done();
            })
    })

    it('OK, test user endpoint', (done) => {
        request(app).get('/api/user')
            .then(res => {
                const { body } = res;
                expect(body).to.contain.property('msg');
                done();
            })
    })

    it('FAIL register, password mismatch', done => {
        request(app).post('/api/user/register')
            .send({
                email: 'email@gmail.com',
                name: 'name',
                password: 'password',
                password2: 'passwords'
            })
            .then(res => {
                const { body } = res;
                expect(body).to.contain.property('password2');
                done();
            })
    })

    it('FAIL register, missing fields', done => {
        request(app).post('/api/user/register')
            .send({})
            .then(res => {
                const { body } = res;
                expect(body).to.contain.property('password2');
                done();
            })
    })

    it('OK, User Registration', done => {
        request(app).post('/api/user/register')
            .send(userData)
            .then(res => {
                const { body } = res;
                expect(body).to.contain.property('email');
                expect(body).to.contain.property('name');
                expect(body).to.contain.property('avatar');
                done();
            })
    })

    it('FAIL login, wrong password', done => {
        request(app).post('/api/user/register')
            .send(userData)
            .then(res => {
                request(app).post('/api/user/login')
                    .send({
                        email: 'email@gmail.com',
                        password: 'passwordm'
                    })
                    .then(res => {
                        const { body } = res;
                        expect(body).to.contain.property('password');
                        done();
                    })
            })
    })

    it('FAIL login, User not found', done => {
        request(app).post('/api/user/register')
            .send(userData)
            .then(res => {
                request(app).post('/api/user/login')
                    .send({
                        email: 'email@email.com',
                        password: 'password'
                    })
                    .then(res => {
                        const { body } = res;
                        expect(body).to.contain.property('email');
                        done();
                    })
            })
    })

    it('FAIL login, missing fields', done => {
        request(app).post('/api/user/register')
            .send(userData)
            .then(res => {
                request(app).post('/api/user/login')
                    .send({})
                    .then(res => {
                        const { body } = res;
                        expect(body).to.contain.property('email');
                        done();
                    })
            })
    })

    it('OK, User login', done => {
        request(app).post('/api/user/register')
            .send(userData)
            .then(res => {
                request(app).post('/api/user/login')
                    .send(userData)
                    .then(res => {
                        const { body } = res;
                        expect(body).to.contain.property('success');
                        expect(body).to.contain.property('token');
                        done();
                    })
            })
    })

    it('OK, get current user', done => {
        request(app).post('/api/user/register')
            .send(userData)
            .then(res => {
                request(app).post('/api/user/login')
                    .send(userData)
                    .then(res => {
                        const { token } = res.body;
                        request(app).get('/api/user/current')
                            .set("Authorization", token)
                            .then(resp => {
                                const { body } = resp;
                                expect(body).to.contain.property('id');
                                expect(body).to.contain.property('name');
                                expect(body).to.contain.property('email');
                                expect(body).to.contain.property('avatar');
                                done()
                            })
                    })
            })
    })
})
