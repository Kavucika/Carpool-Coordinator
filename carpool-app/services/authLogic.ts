export type RegisteredUser = {
  name: string;
  email: string;
  mobile: string;
  role: string;
};

export function normalizeUserName(name = ''): string {
  return String(name).trim().toLowerCase();
}

export function normalizeEmail(email = ''): string {
  return String(email).trim().toLowerCase();
}

export function findUser(users: RegisteredUser[], name: string, email?: string): RegisteredUser | null {
  const lookupName = normalizeUserName(name);
  const lookupEmail = normalizeEmail(email || '');

  if (!lookupName && !lookupEmail) {
    return null;
  }

  return users.find((user) => {
    const matchesName = normalizeUserName(user.name) === lookupName;
    const matchesEmail = normalizeEmail(user.email) === lookupEmail;
    return matchesName && matchesEmail;
  }) || null;
}

export function canLogin(users: RegisteredUser[], name: string, email?: string): boolean {
  return !!findUser(users, name, email);
}

export function registerUser(users: RegisteredUser[], user: RegisteredUser): RegisteredUser[] {
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

  return [
    ...users,
    {
      name: nextName,
      email: nextEmail,
      mobile: nextMobile,
      role: nextRole,
    },
  ];
}
