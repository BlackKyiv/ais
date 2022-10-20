let http = require('http');
const express = require('express');
const mysql = require('mysql');
const util = require('util');
const cors = require('cors')

let server = express();
server.use(cors());

server.listen(9999, () => {
    console.log('Server started on port 9999');
});

server.use(express.static(__dirname));
server.use(express.json());

const connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'user',
    password: 'root',
    database: 'model_ais'
});

connection.connect((err) => {
    if (err) throw err;
    console.log('MySQL connected.');
});

const query = util.promisify(connection.query).bind(connection);

/*
* CATEGORIES
* */

server.get('/categories', (req, res) => {
    let sqlQuery = "SELECT * FROM category ORDER BY name";
    connection.query(sqlQuery, (err, results) => {
        if (err) {
            res.sendStatus(400);
        }
        res.setHeader('content-type', 'application/json');
        res.send(results);
    });
});

server.post('/categories', (req, res) => {
    console.log(req.body);
    const data = {
        name: req.body.name
    };
    let sqlQuery = "INSERT INTO category SET ?";
    connection.query(sqlQuery, data, (err, results) => {
        if (err) {
            res.sendStatus(400);
            return;
        }
        res.setHeader('content-type', 'application/json');
        res.send(results);
    });
});

server.get('/categories/:id', (req, res) => {
    let sqlQuery = "SELECT * FROM category WHERE id=" + req.params.id;
    connection.query(sqlQuery, (err, results) => {
        if (err) {
            res.sendStatus(400);
        }
        res.setHeader('content-type', 'application/json');
        res.send(results);
    });
});

server.put('/categories/:id', (req, res) => {
    const data = {
        name: req.body.name
    };
    let sqlQuery = "UPDATE category SET name='" + data.name + "' WHERE id=" + req.params.id;
    connection.query(sqlQuery, (err, results) => {
        if (err) {
            res.sendStatus(400);
        }
        res.setHeader('content-type', 'application/json');
        res.send(results);
    });
});

server.delete('/categories/:id', (req, res) => {
    let sqlQuery = "DELETE FROM category WHERE id=" + req.params.id + "";
    connection.query(sqlQuery, (err, results) => {
        console.log(results);
        if (err) {
            res.sendStatus(400);
        }
        res.setHeader('content-type', 'application/json');
        res.send(results);
    });
});

/*
* ITEMS
* */

server.get('/items', (req, res) => {
    let sqlItems = "SELECT * FROM item ORDER BY ";
    if (typeof req.query['sort_by'] != 'undefined') {
        sqlItems += req.query['sort_by'] + " ";
    } else {
        sqlItems += "name ";
    }
    if (typeof req.query['sort_order'] != 'undefined') {
        sqlItems += req.query['sort_order'];
    } else {
        sqlItems += "asc";
    }
    console.log(sqlItems);
    let sqlCategories = "SELECT * FROM category";
    let sqlProducers = "SELECT * FROM producer";
    (async () => {
        try {
            let items = await query(sqlItems);
            let categories = await query(sqlCategories);
            let producers = await query(sqlProducers);
            items.map((item) => item.category = categories.find((e, i, arr) => e.id === item.category_id));
            items.map((item) => item.producer = producers.find((e, i, arr) => e.id === item.producer_id));
            res.setHeader('content-type', 'application/json');
            res.send(items);
        } finally {
        }
    })()
});

server.post('/items', (req, res) => {
    res.setHeader('content-type', 'application/json');
    const data = {
        name: req.body.name,
        notes: req.body.notes,
        price: req.body.price,
        quantity: req.body.quantity,
        category_id: req.body.category_id,
        producer_id: req.body.producer_id
    };
    let sqlQuery = "INSERT INTO item SET ?";
    connection.query(sqlQuery, data, (err, results) => {
        if (err) {
            res.sendStatus(400);
        }
        res.setHeader('content-type', 'application/json');
        res.send(results);
    });
});

server.get('/items/:id', (req, res) => {
    res.setHeader('content-type', 'application/json');
    let sqlQuery = "SELECT * FROM item WHERE id=" + req.params.id;
    connection.query(sqlQuery, (err, results) => {
        if (err) {
            console.log(err);
            throw err;
        }
        res.send(results[0]);
    });
});

server.put('/items/:id', (req, res) => {
    const data = {
        name: req.body.name,
        notes: req.body.notes,
        price: req.body.price,
        category_id: req.body.category_id,
        producer_id: req.body.producer_id,
        quantity: req.body.quantity,
    };
    let sqlQuery = "UPDATE item SET name='" + data.name
        + "', notes='" + data.notes
        + "', price =" + data.price
        + ", category_id=" + data.category_id
        + ", producer_id=" + data.producer_id
        + ", quantity=" + data.quantity
        + " WHERE id=" + req.params.id;
    connection.query(sqlQuery, (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

server.delete('/items/:id', (req, res) => {
    let sqlQuery = "DELETE FROM item WHERE id=" + req.params.id + "";
    connection.query(sqlQuery, (err, results) => {
        console.log(results);
        if (err) {
            console.log(err);
            throw err;
        }
        else res.send(results);
    });
});

/*
* PRODUCERS
* */

server.get('/producers', (req, res) => {
    let sqlQuery = "SELECT * FROM producer ORDER BY name";
    connection.query(sqlQuery, (err, results) => {
        if (err) {
            res.sendStatus(400);
        }
        res.setHeader('content-type', 'application/json');
        res.send(results);
    });
});

server.post('/producers', (req, res) => {
    const data = {
        name: req.body.name,
        country: req.body.country,
        district: req.body.district,
        city: req.body.city,
        street: req.body.street,
        house: req.body.house,
        email: req.body.email,
        tel: req.body.tel,
        notes: req.body.notes
    };
    let sqlQuery = "INSERT INTO producer SET ?";
    connection.query(sqlQuery, data, (err, results) => {

        console.log(data);
        if (err) {

            res.sendStatus(400);
        } else {
            res.setHeader('content-type', 'application/json');
            res.send(results);
        }
    });
});

server.get('/producers/:id', (req, res) => {
    let sqlQuery = "SELECT * FROM producer WHERE id=" + req.params.id;
    connection.query(sqlQuery, (err, results) => {
        if (err) {
            res.sendStatus(400);
        }
        res.setHeader('content-type', 'application/json');
        res.send(results);
    });
});

server.put('/producers/:id', (req, res) => {
    const data = {
        name: req.body.name,
        country: req.body.country,
        district: req.body.district,
        city: req.body.city,
        street: req.body.street,
        house: req.body.house,
        email: req.body.email,
        tel: req.body.tel,
        notes: req.body.notes
    };
    let sqlQuery = "UPDATE producer SET name='" + data.name
        + "', country='" + data.country
        + "', district='" + data.district
        + "', city='" + data.city
        + "', street='" + data.street
        + "', house='" + data.house
        + "', email='" + data.email
        + "', tel='" + data.tel
        + "', notes='" + data.notes
        + "' WHERE id=" + req.params.id;
    console.log(sqlQuery);
    connection.query(sqlQuery, (err, results) => {
        if (err) {
            res.sendStatus(400);
        }
        res.setHeader('content-type', 'application/json');
        res.send(results);
    });
});

server.delete('/producers/:id', (req, res) => {
    let sqlQuery = "DELETE FROM producer WHERE id=" + req.params.id + "";
    connection.query(sqlQuery, (err, results) => {
        console.log(results);
        if (err) {
            res.sendStatus(400);
        }
        res.setHeader('content-type', 'application/json');
        res.send(results);
    });
});

/*
* CASHIERS
* */

server.get('/cashiers', (req, res) => {
    let sqlQuery = "SELECT * FROM cashier ORDER BY surname, name, patronim";
    connection.query(sqlQuery, (err, results) => {
        if (err) {
            res.sendStatus(400);
        }
        res.setHeader('content-type', 'application/json');
        res.send(results);
    });
});

server.post('/cashiers', (req, res) => {
    const data = {
        name: req.body.name,
        surname: req.body.surname,
        patronim: req.body.patronim,
        job_date: req.body.job_date,
        b_date: req.body.b_date,
        tel: req.body.tel,
    };
    let sqlQuery = "INSERT INTO cashier SET ?";
    connection.query(sqlQuery, data, (err, results) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
        } else {
            res.setHeader('content-type', 'application/json');
            res.send(results);
        }
    });
});

server.get('/cashiers/:id', (req, res) => {
    let sqlQuery = "SELECT * FROM cashier WHERE id=" + req.params.id;
    connection.query(sqlQuery, (err, results) => {
        if (err) {
            res.sendStatus(400);
        }
        res.setHeader('content-type', 'application/json');
        res.send(results);
    });
});

server.put('/cashiers/:id', (req, res) => {
    const data = {
        name: req.body.name,
        surname: req.body.surname,
        patronim: req.body.patronim,
        job_date: req.body.job_date,
        b_date: req.body.b_date,
        tel: req.body.tel,
    };
    console.log(data);
    let sqlQuery = "UPDATE cashier SET name='" + data.name
        + "', surname='" + data.surname
        + "', patronim='" + data.patronim
        + "', job_date='" + data.job_date
        + "', b_date='" + data.b_date
        + "', tel='" + data.tel
        + "' WHERE id=" + req.params.id;
    connection.query(sqlQuery, (err, results) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
        } else {
            res.setHeader('content-type', 'application/json');
            res.send(results);
        }
    });
});

server.delete('/cashiers/:id', (req, res) => {
    let sqlQuery = "DELETE FROM cashier WHERE id=" + req.params.id + "";
    connection.query(sqlQuery, (err, results) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
        } else {
            res.setHeader('content-type', 'application/json');
            res.send(results);
        }

    });
});

/*
* CHECKS AND ROWS
* */

server.get('/checks', (req, res) => {
    res.setHeader('content-type', 'application/json');
    const data = {
        cashier_id: 1,
        buyer_id: 1,
        notes: req.body.notes,
        date: "11.05.2022"
    };
    let sqlQuery = "SELECT * FROM chek";
    connection.query(sqlQuery, data, (err, results) => {
        if (err) {
            res.sendStatus(400);
        }
        res.send(results);
    });
});

server.get('/checkrows', (req, res) => {
    res.setHeader('content-type', 'application/json');
    const data = {
        check_id_check: req.body.check_id_check,
        item_id: req.body.item_id,
        quantity: req.body.quantity
    };
    let sqlQuery = "SELECT * FROM check_has_item";
    connection.query(sqlQuery, data, (err, results) => {
        if (err) {
            res.sendStatus(400);
        }
        res.send(results);
    });
});

server.post('/buy', (req, res) => {
    console.log(req);
    res.setHeader('content-type', 'application/json');
    let cashierQuery = "SELECT id FROM cashier ORDER BY RAND() LIMIT 1;";
    let checkQuery = "INSERT INTO chek SET ?;";
    let rowQuery = "INSERT INTO check_has_item SET ?";
    (async () => {
        try {
            let cashierIds = await query(cashierQuery);
            console.log(req.body);
            const checkData = {
                buyer_id: req.body.buyer_id,
                notes: req.body.notes,
                date: "11.05.2022", // є Date() але треба тільки дату витягнути якось
                cashier_id: cashierIds[0].id
            };
            let check = await query(checkQuery, checkData);
            check_id = await query("SELECT LAST_INSERT_ID();");
            req.body.positions.forEach(position => {
                const rowData = {
                    check_id_check: check_id[0]['LAST_INSERT_ID()'], // так працює, check.id_check ні
                    item_id: position.item.id,
                    quantity: position.q
                }
                let newRow = query(rowQuery, rowData);
            });
            res.setHeader('content-type', 'application/json');
            res.sendStatus(200);
        } finally {
        }
    })()
});

/*
* LOGIN
* */

server.post('/login', (req, res) => {
    res.setHeader('content-type', 'application/json');
    console.log(req.body);
    const data = {
        login: req.body.login,
        password: req.body.password
    };
    let sqlQuery = "SELECT * FROM account WHERE login='" + data.login + "'";
    (async () => {
        try {
            const accounts = await query(sqlQuery);
            if (accounts.length === 0) {
                res.sendStatus(401)
                return;
            }
            const user = accounts[0];
            if (user.password !== data.password) {
                res.sendStatus(401)
                return;
            }
            if (user.role === 'user') {
                const result = await query(`SELECT * FROM buyer WHERE id = ${user.buyer_id_buyer}`);
                user.buyer = result[0];
            }
            console.log(user);
            res.send(user);
        } finally {
        }
    })()
});

/*
* REGISTRATION
* */
server.post('/register', (req, res) => {
    res.setHeader('content-type', 'application/json');
    const buyerData = {
        name: req.body.name,
        surname: req.body.surname,
        patronim: req.body.patronim,
        country: req.body.country,
        district: req.body.district,
        city: req.body.city,
        street: req.body.street,
        house: req.body.house,
        email: req.body.email,
        tel: req.body.tel
    };
    let buyerQuery = "INSERT INTO buyer SET ?; ";
    let accountQuery = "INSERT INTO account SET ?";
    (async () => {
        try {
            let buyer = await query(buyerQuery, buyerData);
            const buyer_id = await query("SELECT LAST_INSERT_ID();");
            let accountData = {
                "login": req.body.login,
                "password": req.body.password,
                "role": "user",
                "buyer_id_buyer": buyer_id[0]['LAST_INSERT_ID()']
            }
            let account = query(accountQuery, accountData);
            res.sendStatus(200);
        } finally {
        }
    })()
});

server.get('/checks', (req, res) => {
    res.setHeader('content-type', 'application/json');
    let sqlQuery = "SELECT * FROM chek";
    let rowsQuery = "SELECT * FROM check_has_item";
    let cashierQuery = "SELECT * FROM cashier";
    (async () => {
        try {
            const checks = await query(sqlQuery);
            const rows = await query(rowsQuery);
            const cashiers = await query(cashierQuery);
            checks.map((check) => check.rows = rows.filter((row) => row.check_id_check == check.id));
            checks.map((check) => check.cashier = cashiers.find((cashier) => cashier.id == check.cashier_id));
            res.send(checks);
        } finally {
        }
    })()
});
server.get('/checks/user/:id', (req, res) => {
    res.setHeader('content-type', 'application/json');
    let sqlQuery = "SELECT * FROM chek WHERE buyer_id = " + req.params.id;
    let rowsQuery = "SELECT * FROM check_has_item";
    let cashierQuery = "SELECT * FROM cashier";
    let itemQuery = "SELECT * FROM item";
    (async () => {
        try {
            const checks = await query(sqlQuery);
            const rows = await query(rowsQuery);
            const cashiers = await query(cashierQuery);
            const items = await query(itemQuery);
            checks.map((check) => {
                check.rows = rows.filter((row) => row.check_id_check === check.id);
                check.cashier = cashiers.find((cashier) => cashier.id === check.cashier_id);
                check.rows = check.rows.map((row) => {
                    return { quantity: row.quantity, item: items.find((item) => item.id === row.item_id) };
                });

                return check;
            });
            res.send(checks);
        } finally {
        }
    })()
});

/*
* 1 - with param NAME
* */

server.get('/query1', (req, res) => {
    res.setHeader('content-type', 'application/json');
    let sqlQuery = "SELECT producer.id, producer.name, producer.country, producer.district, producer.city, producer.street, producer.house, producer.tel, producer.email, producer.notes "+
        "FROM (producer INNER JOIN item ON producer.id = item.producer_id) INNER JOIN category ON item.category_id=category.id "+
        "WHERE category.name = 'телефон'" + // PARAM
        "GROUP BY producer.id, producer.name, producer.country, producer.district, producer.city, producer.street, producer.house, producer.tel, producer.email";
    connection.query(sqlQuery, (err, results) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
        }
        res.send(results);
    });
});

/*
* 2
* */

server.get('/query2', (req, res) => {
    res.setHeader('content-type', 'application/json');
    let sqlQuery = "SELECT * " +
        "FROM buyer AS O " +
        "WHERE NOT EXISTS ( " +
        "SELECT DISTINCT country FROM producer WHERE country NOT IN ( " +
        "SELECT DISTINCT country FROM " +
        "(SELECT check_has_item.item_id, check_has_item.check_id_check, F.country AS country " +
        "FROM check_has_item INNER JOIN " +
        "(SELECT item.id, producer.country " +
        "FROM item INNER JOIN producer ON item.producer_id = producer.id) F ON check_has_item.item_id = F.id) T " +
        "INNER JOIN chek ON T.check_id_check = chek.id " +
        "WHERE chek.buyer_id = O.id))";
    connection.query(sqlQuery, (err, results) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
        }
        res.send(results);
    });
});

/*
* 3
* */

server.get('/query3', (req, res) => {
    res.setHeader('content-type', 'application/json');
    let sqlQuery = "SELECT producer.name, item.producer_id, AVG(item.price) AS avg_price "+
        "FROM producer INNER JOIN item ON producer.id=item.producer_id "+
        "GROUP BY item.producer_id, producer.name";
    connection.query(sqlQuery, (err, results) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
        }
        res.send(results);
    });
});

/*
* 4
* */

server.get('/query4', (req, res) => {
    res.setHeader('content-type', 'application/json');
    let sqlQuery = "SELECT * " +
        "FROM producer " +
        "WHERE id IN ( " +
        "           SELECT producer_id " +
        "           FROM item O " +
        "           WHERE NOT EXISTS ( " +
        "                    SELECT id " +
        "                    FROM category " +
        "                    WHERE id NOT IN( " +
        "                        SELECT category_id " +
        "                        FROM item " +
        "                        WHERE producer_id = O.producer_id)))";
    connection.query(sqlQuery, (err, results) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
        }
        res.send(results);
    });
});

/*
* 5 Знайти покупців які купували товари виробників з усіх країн
* */

server.get('/query5', (req, res) => {
    res.setHeader('content-type', 'application/json');
    let sqlQuery = "SELECT * " +
        "FROM buyer AS O " +
        "WHERE NOT EXISTS ( " +
        "SELECT DISTINCT country FROM producer WHERE country NOT IN ( " +
        "SELECT DISTINCT country FROM " +
        "(SELECT check_has_item.item_id, check_has_item.check_id_check, F.country AS country " +
        "FROM check_has_item INNER JOIN " +
        "(SELECT item.id, producer.country " +
        "FROM item INNER JOIN producer ON item.producer_id = producer.id) F ON check_has_item.item_id = F.id) T " +
        "INNER JOIN chek ON T.check_id_check = chek.id " +
        "WHERE chek.buyer_id = O.id))";
    connection.query(sqlQuery, (err, results) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
        }
        res.send(results);
    });
});

/*
* 6 Для кожного товару порахувати кількість випущених чеків
* */

server.get('/query6', (req, res) => {
    res.setHeader('content-type', 'application/json');
    let sqlQuery = "SELECT id, name, COUNT(check_id_check) AS n_check " +
        "FROM (SELECT id, name FROM item)  AS Т LEFT JOIN check_has_item ON Т.id = check_has_item.item_id " +
        "GROUP BY id, name";
    connection.query(sqlQuery, (err, results) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
        }
        res.send(results);
    });
});

/*
* 7 Знайти покупців які не купували телефони за останні 12 місяців, але купували самсунг раніше
* */

server.get('/query7', (req, res) => {
    res.setHeader('content-type', 'application/json');
    let sqlQuery = "SELECT * " +
        "FROM buyer " +
        "WHERE id IN ( " +
        "             SELECT buyer_id " +
        "             FROM chek " +
        "             WHERE TIMESTAMPDIFF(MONTH,date,SYSDATE()) > 12 " +
        "             AND id IN ( " +
        "                         SELECT check_id_check " +
        "                         FROM check_has_item " +
        "                         WHERE item_id IN( " +
        "                                     SELECT id " +
        "                                     FROM item " +
        "                                     WHERE producer_id  = ( " +
        "                                              SELECT id " +
        "                                              FROM producer " +
        "                                              WHERE name = 'Samsung')))) " +
        "AND id NOT IN( " +
        "               SELECT buyer_id " +
        "               FROM chek " +
        "               WHERE TIMESTAMPDIFF(MONTH,date,SYSDATE()) < 12 " +
        "               AND id IN (         " +
        "                                  SELECT check_id_check " +
        "                                  FROM check_has_item " +
        "                                  WHERE item_id IN ( " +
        "                                               SELECT id " +
        "                                               FROM item " +
        "                                               WHERE category_id  = ( " +
        "                                                        SELECT id " +
        "                                                        FROM category " +
        "                                                        WHERE name = 'phone')))); ";
    connection.query(sqlQuery, (err, results) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
        }
        res.send(results);
    });
});

/*
* 8 Для кожного виробника з Києва порахувати кількість категорій, товари якої вони виробляють
* */

server.get('/query8', (req, res) => {
    res.setHeader('content-type', 'application/json');
    let sqlQuery = "SELECT id, name, COUNT(category_id) AS cat " +
        "FROM ( " +
        "                 SELECT DISTINCT producer.id, producer.name, item.category_id " +
        "                 FROM item INNER JOIN producer ON item.producer_id = producer.id " +
        "                 WHERE producer.city = 'Kyiv')  AS N " +
        "GROUP BY id, name";
    connection.query(sqlQuery, (err, results) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
        }
        res.send(results);
    });
});

/*
* 9 Вивести інформацію про покупців та касирів, які їх обслуговували
* */

server.get('/query9', (req, res) => {
    res.setHeader('content-type', 'application/json');
    let sqlQuery = "SELECT * " +
        "FROM ( " +
        "         SELECT B.id AS buyer_id, B.surname AS buyer_surname, B.name AS buyer_name, C.id AS check_id, C.date AS chek_date, K.id AS cashier_id, K.surname AS cashier_surname, K.name AS cashier_name " +
        "         FROM (buyer AS B INNER JOIN chek AS C ON B.id = C.buyer_id) " +
        "                                     INNER JOIN cashier AS K ON C.cashier_id = K.id) AS I";
    connection.query(sqlQuery, (err, results) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
        }
        res.send(results);
    });
});

/*
* 10 Порахувати кількість чеків, які випустив касир за певну дату. Параметр – дата
* */

server.get('/query10', (req, res) => {
    res.setHeader('content-type', 'application/json');
    let sqlQuery = "SELECT cashier.id, cashier.surname, cashier.name, cashier.patronim, T.count_of_check " +
        "FROM ( " +
        "SELECT cashier_id, COUNT(*) AS count_of_check " +
        "FROM chek " +
        "WHERE date = '2022-05-12' " +
        "GROUP BY cashier_id " +
        ") AS T " +
        "INNER JOIN cashier " +
        "ON T.cashier_id = cashier.id";
    connection.query(sqlQuery, (err, results) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
        }
        res.send(results);
    });
});

/*
* 11 Знайти покупців, які купували всі товари виробника Samsung.
* Тобто не існує товару Samsung такого, який би не був придбаний покупцем
* */

server.get('/query11', (req, res) => {
    res.setHeader('content-type', 'application/json');
    let sqlQuery = "SELECT DISTINCT id, surname, name, patronim " +
        "FROM buyer " +
        "WHERE NOT EXISTS ( " +
        "           SELECT N.id " +
        "           FROM ( " +
        "                  SELECT id " +
        "                  FROM item " +
        "                  WHERE producer_id = ( " +
        "                  SELECT id " +
        "                  FROM producer " +
        "                  WHERE name = 'Samsung'" +
        "                  ) " +
        "           ) AS N " +
        "           WHERE N.id NOT IN ( " +
        "                      SELECT artucle " +
        "                      FROM ( " +
        "                                      SELECT buyer.id AS IPN,item.id AS artucle " +
        "                                      FROM ((buyer INNER JOIN chek ON buyer.id = chek.buyer_id) " +
        "                                  INNER JOIN check_has_item ON chek.id = check_has_item.check_id_check) " +
        "                                  INNER JOIN item ON  check_has_item.item_id= item.id ) AS PT " +
        "                     WHERE PT.IPN = buyer.id));";
    connection.query(sqlQuery, (err, results) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
        }
        res.send(results);
    });
});

/*
* 12 Знайти покупців, які купили не менше 3-х різних телефонів
* */

server.get('/query12', (req, res) => {
    res.setHeader('content-type', 'application/json');
    let sqlQuery = "SELECT buyer.id, buyer.surname, buyer.name, buyer.patronim " +
        "FROM buyer INNER JOIN ( " +
        "         SELECT IPN " +
        "         FROM (  " +
        "            SELECT DISTINCT IPN, article, number_category " +
        "            FROM ( " +
        "          SELECT buyer.id AS IPN, chek.id, item.id AS article, category.id AS number_category " +
        "                FROM (((buyer INNER JOIN chek ON buyer.id = chek.buyer_id) " +
        "                                  INNER JOIN check_has_item ON chek.id = check_has_item.check_id_check) " +
        "                                  INNER JOIN item ON  check_has_item.item_id= item.id) " +
        "                                  INNER JOIN category ON category.id = item.category_id) AS K) AS T " +
        "                WHERE number_category = (  " +
        "                     SELECT id " +
        "                     FROM category " +
        "                     WHERE name = 'phone' ) " +
        "               GROUP BY IPN " +
        "               HAVING COUNT (*) >= 3)  AS Result " +
        "ON buyer.id = Result.IPN";
    connection.query(sqlQuery, (err, results) => {
        if (err) {
            console.log(err);
            res.sendStatus(400);
            return;
        }
        res.send(results);
    });
});