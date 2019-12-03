process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const request = require('supertest');

const app = require('../../server');
const conn = require('../../db');

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

    it('OK, test endpoint', (done) => {
        request(app).get('/api/user')
            .then(res => {
                const { body } = res;
                expect(body).to.contain.property('msg');
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
})
