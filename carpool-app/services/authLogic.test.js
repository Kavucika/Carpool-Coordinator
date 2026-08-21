const test = require('node:test');
const assert = require('node:assert/strict');
const { registerUser, canLogin } = require('./authLogic.js');

test('new user must sign up before login', () => {
  const users = [];
  assert.equal(canLogin(users, 'Aisha', 'aisha@test.com'), false);
});

test('existing signed-up user can login directly with name and email', () => {
  const users = [{ name: 'Aisha', email: 'aisha@test.com', mobile: '123', role: 'passenger' }];
  assert.equal(canLogin(users, 'Aisha', 'aisha@test.com'), true);
});

test('same name with different email can be registered separately', () => {
  const users = [
    { name: 'Aisha', email: 'aisha@test.com', mobile: '123', role: 'passenger' },
  ];

  const nextUsers = registerUser(users, {
    name: 'Aisha',
    email: 'aisha2@test.com',
    mobile: '456',
    role: 'driver',
  });

  assert.equal(nextUsers.length, 2);
  assert.equal(canLogin(nextUsers, 'Aisha', 'aisha2@test.com'), true);
});
