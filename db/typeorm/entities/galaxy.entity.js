const { EntitySchema } = require('typeorm');

const GalaxyEntity = new EntitySchema({
  name: 'Galaxy',
  tableName: 'galaxies',
  columns: {
    id: {
      type: 'varchar',
      length: 50,
      primary: true,
    },
    name: {
      type: 'varchar',
      length: 100,
    },
    en: {
      type: 'varchar',
      length: 150,
    },
    color: {
      type: 'char',
      length: 7,
    },
    description: {
      type: 'text',
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
    planets: {
      type: 'one-to-many',
      target: 'Planet',
      inverseSide: 'galaxy',
    },
  },
  checks: [
    {
      name: 'galaxies_color_check',
      expression: '"color" ~ \'^#[0-9A-Fa-f]{6}$\'',
    },
  ],
});

module.exports = { GalaxyEntity };
