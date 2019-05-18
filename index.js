const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// пользователи
const users = [
  {
    login: 'user',
    password: '123',
    token: 'xxx',
    role: 'user'
  },

  {
    login: 'admin',
    password: '321',
    token: 'yyy',
    role: 'admin'
  },
]

// генератор айдишников
const IDSGenerator = () => {
  return Math.random().toString(36).substr(2, 16);
}


//////////////////////////////////////////////////////////////////////
// авторизуем пользователя по логину/паролю
//////////////////////////////////////////////////////////////////////

app.post('/auth', (req, res) => {
  const login = req.body.login;
  const password = req.body.password;

  const user = users.find(_user => _user.login === login);

  // пользователь с таким логином найден
  if (user) {

    // пароль верный
    if ('' + user.password === '' + password) {
      res.status(200).send({
        token: user.token
      });

    // пароль не верный
    } else {
      res.status(403).send();
    }
  
  // пользователь с таким логином не найден
  } else {
    res.status(404).send();
  }
});


//////////////////////////////////////////////////////////////////////
// получаем пользователя по токену
//////////////////////////////////////////////////////////////////////

app.get('/user', (req, res) => {
  const token = req.query.token;
  const user = users.find(_user => _user.token === token);

  if (user) {
    res.status(200).send({
      login: user.login,
      role: user.role
    });

  } else {
    res.status(401).send();
  }
});


//////////////////////////////////////////////////////////////////////
// получаем сотрудников
//////////////////////////////////////////////////////////////////////

app.get('/employees', (req, res) => {
  const id = req.query.id;
  const dbData = JSON.parse(fs.readFileSync('db.json', 'utf8'));

  // если в запросе нет id, возвращаем всех
  if (!id) {
    res.status(200).send(dbData);

  // если в запросе есть id, сотрудника с этим id
  } else {
    const item = dbData.find(item => {
      return item.id === id;
    });

    if (item) {
      res.status(200).send(item);

    } else {
      res.status(404).send();
    }
  }
  
});


//////////////////////////////////////////////////////////////////////
// создаем/редактируем сотрудника
//////////////////////////////////////////////////////////////////////

app.post('/employee', (req, res) => {
  const dbData = JSON.parse(fs.readFileSync('db.json', 'utf8'));
  const item = req.body.data;
  const id = req.body.id;

  // если в параметрах есть id, редактируем
  if (id) {
    const indexOfItem = dbData.findIndex(item => {
      return item.id === id;
    });

    item.id = id;
    dbData[indexOfItem] = item;


  // если в параметрах нет id, создаем нового
  } else {
    item.id = IDSGenerator();
    dbData.push(item)
  }

  // сохраняем массив
  fs.writeFile('db.json', JSON.stringify(dbData, null, 4), (err) => {
    if (!err) {
      res.status(200).send(item);

    } else {
      res.status(500).send(err);
    }
  });
});


//////////////////////////////////////////////////////////////////////
// удаляем сотрудника
//////////////////////////////////////////////////////////////////////

app.delete('/employee', (req, res) => {
  const dbData = JSON.parse(fs.readFileSync('db.json', 'utf8'));
  const id = req.query.id;

  const indexOfItem = dbData.findIndex(item => {
    return item.id === id;
  });

  dbData.splice(indexOfItem, 1);

  // сохраняем массив
  fs.writeFile('db.json', JSON.stringify(dbData, null, 4), (err) => {
    if (!err) {
      res.status(200).send({status: 'ok'});

    } else {
      res.status(500).send(err);
    }
  });
});


//////////////////////////////////////////////////////////////////////
// слушаем порт
//////////////////////////////////////////////////////////////////////

server.listen(3000, (err) => {
  if (!err) {
    console.log('port: 3000')
  }
});