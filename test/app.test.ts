//@ts-ignore
import session from 'supertest-session';
import app from '../app';
import request from 'supertest';

let cookie = '';
describe("Test the login path", () => {
  
  it("should respond with 401 given wrong credentials", done => {
    request(app)
      .post("/login")
      .send({
        login: "123123312",
        password: "adsasd123sda"
      })
      .then(response => {
        expect(response.statusCode).toBe(401);
        done();
      });
  })

  it("should respond with 401 given no credentials", done => {
    request(app)
      .post("/login")
      .send({
        login: "",
        password: ""
      })
      .then(response => {
        expect(response.statusCode).toBe(401);
        done();
      });
  })

  it("should repond with 200 and body with role property given correct credentials", done => {
    request(app)
      .post("/login")
      .send({ login: "adminadmin3", password: "12312312312" })
      .then(response => {
      
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            personId: expect.any(Number),
            role: expect.any(String)
          })
        )
        cookie = response.headers['set-cookie'];
        done();
      });
  });


})

describe("Test checkauth path", () => {
  it("should respond with 401 returning body containing role and auth status given the session is not active", done => {
    request(app)
      .get("/checkauth")
      .then(response => {
        expect(response.statusCode).toBe(401);
        expect(response.body).toEqual(
          expect.objectContaining({
            role: null,
            auth: false
          })
        )
        done();
    })
  })

  it("should respond with 200 returning containing role and auth status given the session is active", done => {
    request(app)
      .get("/checkauth")
      .set('Cookie', cookie)
      .then(response => {
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            role: expect.any(String),
            auth: expect.any(Boolean)
          })
        )
        done();
      })
        
  });
  
})

describe("test logout path", () => {

  it("should respond with 200 with session active", done => {
    request(app)
      .delete("/logout")
      .set('Cookie', cookie)
      .then(response => {
        expect(response.statusCode).toBe(200);
        done();
      })
  })

  it("should respond with 200 without session active", done => {
    request(app)
      .delete("/logout")
      .then(response => {
        expect(response.statusCode).toBe(200);
        done();
      })
  })
})
