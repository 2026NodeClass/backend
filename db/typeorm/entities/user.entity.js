const { EntitySchema } = require('typeorm');

const UserEntity = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    name: {
      type: 'varchar',
      length: 100,
    },
    email: {
      type: 'varchar',
      length: 255,
    },
    passwordHash: {
      name: 'password_hash',
      type: 'varchar',
      length: 255,
      select: false,
    },
    role: {
      type: 'varchar',
      length: 20,
      default: 'user',
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamptz',
      createDate: true,
      default: () => 'CURRENT_TIMESTAMP',
    },
    updatedAt: {
      name: 'updated_at',
      type: 'timestamptz',
      updateDate: true,
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
  relations: {
    favorites: {
      type: 'one-to-many',
      target: 'Favorite',
      inverseSide: 'user',
    },
  },
  checks: [
    {
      name: 'users_role_check',
      expression: '"role" IN (\'user\', \'admin\')',
    },
  ],
});

module.exports = { UserEntity };
