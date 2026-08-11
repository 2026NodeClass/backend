const express = require('express');
const { getGalaxies, getPlanets, searchPlanets, getPlanetById } = require('../controllers/catalog.controller');

const galaxyRouter = express.Router();
const planetRouter = express.Router();

galaxyRouter.get('/', getGalaxies);
planetRouter.get('/', getPlanets);
planetRouter.get('/search', searchPlanets);
planetRouter.get('/:id', getPlanetById);

module.exports = { galaxyRouter, planetRouter };
