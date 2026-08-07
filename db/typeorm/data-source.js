const path = require('path');
const { DataSource } = require('typeorm');
const { connectionConfig } = require('../config');
const { UserEntity } = require('./entities/user.entity');
const { GalaxyEntity } = require('./entities/galaxy.entity');
const { PlanetEntity } = require('./entities/planet.entity');
const { FavoriteEntity } = require('./entities/favorite.entity');

const AppDataSource = new DataSource({
  type: 'postgres',
  host: connectionConfig.host,
  port: connectionConfig.port,
  username: connectionConfig.user,
  password: connectionConfig.password,
  database: connectionConfig.database,
  entities: [UserEntity, GalaxyEntity, PlanetEntity, FavoriteEntity],
  migrations: [path.join(__dirname, 'migrations/*.js')],
  migrationsTableName: 'typeorm_migrations',
  migrationsRun: false,
  synchronize: false,
  logging: process.env.TYPEORM_LOGGING === 'true',
  poolSize: Number(process.env.TYPEORM_POOL_SIZE || 5),
  invalidWhereValuesBehavior: {
    null: 'throw',
    undefined: 'throw',
  },
});

module.exports = { AppDataSource };
