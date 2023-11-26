const fs = require("fs");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer();

app.use(bodyParser.json());

const dataFilePath = 'data.json';

if (!fs.existsSync(dataFilePath)) {
  const initialData = {};
  fs.writeFileSync(dataFilePath, JSON.stringify(initialData, null, 2));
}

app.get("/notes", (req, res) => {
  fs.readFile("data.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Помилка читання файлу JSON!" });
    }
    try {
      const jsonData = JSON.parse(data);
      res.header("Content-Type", "application/json");
      res.send(JSON.stringify(jsonData, null, 2));
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Помилка розбору JSON даних!" });
    }
  });
});

app.get("/UploadForm.html", (req, res) => {
  res.sendFile(__dirname + '/UploadForm.html');
});

app.post("/upload", upload.none(), (req, res) => {
  const formData = {
    note_name: req.body.note_name,
    note: req.body.note
  };

  if (!formData.note_name || !formData.note) {
    res.status(400).send("Поля 'note_name' та 'note' є обов'язковими для заповнення!");
    return;
  }

  fs.readFile("data.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Помилка розбору JSON даних!");
    }

    let jsonData = JSON.parse(data);

    if (jsonData.hasOwnProperty(formData.note_name)) {
      return res.status(400).send("Нотатка з такою назвою вже існує. Виберіть іншу назву!");
    }

    jsonData[formData.note_name] = formData.note;

    fs.writeFile("data.json", JSON.stringify(jsonData, null, 2), (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Помилка запису в JSON-файл!");
      }

      res.status(201).send("Дані успішно записано!");
    });
  });
});

app.get("/notes/:noteName", (req, res) => {
  const noteName = req.params.noteName;

  fs.readFile("data.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Помилка читання файлу JSON!" });
    }

    const jsonData = JSON.parse(data);

    if (jsonData.hasOwnProperty(noteName)) {
      res.send(jsonData[noteName]);
    } else {
      res.status(404).send("Нотатка не знайдена!");
    }
  });
});

app.put("/notes/:noteName", (req, res) => {
  const noteName = req.params.noteName;
  const updatedNote = req.body.updatedNote;

  if (!updatedNote) {
    return res.status(400).send("Тіло запиту має містити оновлений текст нотатки!");
  }

  fs.readFile("data.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Помилка читання файлу JSON!");
    }

    let jsonData = JSON.parse(data);

    if (jsonData.hasOwnProperty(noteName)) {
      jsonData[noteName] = updatedNote.trim();
      fs.writeFile("data.json", JSON.stringify(jsonData, null, 2), (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Помилка запису в JSON-файл!");
        }

        res.send("Нотатку успішно оновлено!");
      });
    }
    else {
      res.status(404).send("Нотатка не знайдена!");
    }
  });
});

app.delete("/notes/:noteName", (req, res) => {
  const noteName = req.params.noteName;

  fs.readFile("data.json", "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Помилка читання файлу JSON!");
    }

    let jsonData = JSON.parse(data);

    if (jsonData.hasOwnProperty(noteName)) {
      delete jsonData[noteName];

      fs.writeFile("data.json", JSON.stringify(jsonData, null, 2), (err) => {
        if (err) {
          console.error(err);
          return res.status(500).send("Помилка запису в JSON-файл!");
        }
        res.send("Нотатку успішно видалено!");
      });
    }
    else {
      res.status(404).send("Нотатка не знайдена!");
    }
  });
});

app.listen(8000, () => {
  console.log("Сервер працює на порту 8000!");
});