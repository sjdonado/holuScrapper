db.createUser({
  user: 'holu_user',
  pwd: 'root_12345',
  roles: [
    {
      role: 'readWrite',
      db: 'quevent',
    },
  ],
});
