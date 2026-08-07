const { EntitySchema } = require('typeorm');

const FavoriteEntity = new EntitySchema({
  name: 'Favorite',
  tableName: 'favorites',
  columns: {
    id: {
      type: 'integer',
      primary: true,
      generated: 'increment',
    },
    userId: {
      name: 'user_id',
      type: 'uuid',
    },
    planetId: {
      name: 'planets_id',
      type: 'varchar',
      length: 50,
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamptz',
      createDate: true,
      default: () => 'CURRENT_TIMESTAMP',
    },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      inverseSide: 'favorites',
      joinColumn: {
        name: 'user_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'favorites_user_id_fkey',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
    planet: {
      type: 'many-to-one',
      target: 'Planet',
      inverseSide: 'favorites',
      joinColumn: {
        name: 'planets_id',
        referencedColumnName: 'id',
        foreignKeyConstraintName: 'favorites_planets_id_fkey',
      },
      nullable: false,
      onDelete: 'CASCADE',
    },
  },
  uniques: [
    {
      name: 'favorites_user_id_planets_id_key',
      columns: ['userId', 'planetId'],
    },
  ],
});

module.exports = { FavoriteEntity };
