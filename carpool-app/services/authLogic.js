function normalizeUserName(name = '') {
  return String(name).trim().toLowerCase();
}

function normalizeEmail(email = '') {
  return String(email).trim().toLowerCase();
}

function findUser(users, name, email) {
  const lookupName = normalizeUserName(name);
  const lookupEmail = normalizeEmail(email);

  if (!lookupName && !lookupEmail) {
    return null;
  }

  return users.find((user) => {
    const matchesName = normalizeUserName(user.name) === lookupName;
    const matchesEmail = normalizeEmail(user.email) === lookupEmail;
    return matchesName && matchesEmail;
  }) || null;
}

function canLogin(users, name, email) {
  return !!findUser(users, name, email);
}

function registerUser(users, user) {
  const nextName = String(user.name || '').trim();
  const nextEmail = String(user.email || '').trim();
  const nextMobile = String(user.mobile || '').trim();
  const nextRole = String(user.role || '').trim();

  if (!nextName || !nextEmail || !nextMobile || !nextRole) {
    return users;
  }

  if (findUser(users, nextName, nextEmail)) {
    return users;
  }

  return [...users, {
    name: nextName,
    email: nextEmail,
    mobile: nextMobile,
    role: nextRole,
  }];
}

module.exports = {
  normalizeUserName,
  findUser,
  canLogin,
  registerUser,
};
