const express = require("express");
var pg = require("pg");
const config = require("../../config");
var conString = config.urlConnection;
const routes = express.Router();

var client = new pg.Client(conString);
client.connect(function (err) {
  if (err) {
    return console.error("could not connect to postgres", err);
  }
  client.query('SELECT NOW() AS "theTime"', function (err, result) {
    if (err) {
      return console.error("error running query", err);
    }

    console.log(result.rows[0].theTime);
    // >> output: 2018-08-23T14:02:57.117Z
  });
});

routes.get("/", (req, res) => {
  console.log("Response ok.");
  res.send("Ok");
});

routes.get("/anime", (req, res) => {
  client.query("SELECT * from anime", function (err, result) {
    if (err) {
      return console.error("error running query", err);
    }
    console.log(result.rows);
    res.send(result.rows);
  });
});

routes.get("/anime/:id", (req, res) => {
  const id = req.params.id;
  client.query(
    `SELECT * from anime where id = ${id}`,
    function (err, result) {
      if (err) {
        return console.error("error running query", err);
      }
      console.log(result.rows);
      res.send(result.rows).status(200);
    }
  );
});

routes.delete("/anime/:id", (req, res) => {
  const id = req.params.id;
  client.query(`Delete from anime where id = ${id}`, function (err, result) {
    if (err) {
      return console.error("error running query", err);
    } else {
      if (result.rowCount == 0) {
        res.status(400).json({ info: "Registro não encontrado" });
      } else {
        res.status(200).json({ info: "Registro excluido" });
      }
    }
  });
});

routes.post("/anime", (req, res) => {
  const { episodio,name } = req.body;
  client.query(
    `insert into anime (episodio,name) values ('${episodio}','${name}') returning *`,
    function (err, result) {
      if (err) {
        return console.error("error running query", err);
      }
      const { id } = result.rows[0];
      console.log(result);

      res.status(201).json({ info: `Registrado com sucesso, id: ${id}` });
    }
  );
});

routes.put("/anime/:id", (req, res) => {
  const { id } = req.params;
  const { episodio,name } = req.body;
  client.query(
    `Update anime set  episodio= '${episodio}', name='${name}' where id = ${id}`,
    function (err, result) {
      if (err) {
        return console.error("error running query", err);
      }
      console.log(result);
      res.setHeader("id", `${id}`);
      res
        .status(202)
        .json({ info: `Registro atualizado com sucesso, id: ${id}` });
    }
  );
});

module.exports = routes;