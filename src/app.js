const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function logRequests(request, response, next) {
  const { method, url } = request;

  const logLabel = `[${method.toUpperCase()} ${url}]`;

  console.time(logLabel);

  next();

  console.timeEnd(logLabel);
}

function validateRepositoryId(request, response, next) {
  const { id } = request.params;

  if(!isUuid(id)) {
    return response.status(400).json({ error: 'Invalid repository ID.' });
  }

  return next();
}

app.use(logRequests);
app.use('/repositories/:id', validateRepositoryId);

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  };

  repositories.push(repository);

  return response.status(201).json(repository);
});

app.get("/repositories", (request, response) => {
  return response.status(200).json(repositories);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const searchedRepository = repositories.find(repository => repository.id === id);

  if(!searchedRepository) {
    return response.status(400).json({ message: 'Repository not found!' });
  }

  searchedRepository.title = title;
  searchedRepository.url = url;
  searchedRepository.techs = techs;

  return response.status(200).json(searchedRepository);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;
  
  const indexRepository = repositories.findIndex(repository => repository.id === id);

  if(indexRepository < 0) {
    return response.status(400).json({ message: 'Repository not found!' });
  }

  repositories.splice(indexRepository, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const searchedRepository = repositories.find(repository => repository.id === id);

  if(!searchedRepository) {
    return response.status(400).json({ message: 'Repository not found!' });
  }

  searchedRepository.likes++;

  return response.status(201).json(searchedRepository);
});

module.exports = app;
