import app from '../app';
import request from 'supertest';

test("It should respond with 401 given wrong credentials", done => {
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

test("It should repond with 200 and body with role property given correct credentials", done => {
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

      done();
    });
});
