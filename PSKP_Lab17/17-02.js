const express = require('express');
const bodyParser = require('body-parser');
const Sequelize = require('sequelize');
const { Model: _Model, INTEGER, STRING } = Sequelize;
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const redis = require('redis');

const PORT = 3000;
const app = express();
const redisClient = redis.createClient();

redisClient.on('error', (err) => { console.log('[ERROR] Redis:', err); });
redisClient.on('end', () => console.log('[WARN] Client disconnected.\n'));
redisClient.connect()
    .then(() => { console.log('[OK] Redis connected.') })
    .catch(err => console.log(err));

const sequelize = new Sequelize(
    'PSKP_Lab17',
    'sa',
    '1234',
    {
        host: 'localhost',
        dialect: 'mssql'
    }
);

const Model = _Model;
class Users extends Model { }
Users.init(
    {
        id: { type: INTEGER, autoIncrement: true, primaryKey: true },
        login: { type: STRING, allowNull: false },
        password: { type: STRING, allowNull: false },
    },
    {
        sequelize,
        Users: 'Users',
        tableName: 'Users',
        timestamps: false
    }
);

async function createUser(login, password) {
    await Users.create({ login: login, password: password });
}

const accessKey = 'access_key';
const refreshKey = 'refresh_key';

app.use(express.static(__dirname + '/static'));
app.use(cookieParser('cookie_key'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    if (req.cookies.accessToken) {
        jwt.verify(req.cookies.accessToken, accessKey, (err, payload) => {
            if (err) {
                next();
            } else if (payload) {
                req.payload = payload;
                next();
            }
        });
    } else next();
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/static/login.html');
});

app.post('/login', async (req, res) => {
    const candidate = await Users.findOne({
        where: {
            login: req.body.username,
            password: req.body.password,
        },
    });
    if (candidate) {
        const accessToken = jwt.sign(
            { id: candidate.id, login: candidate.login },
            accessKey,
            { expiresIn: 10 * 60 }
        );
        const refreshToken = jwt.sign(
            { id: candidate.id, login: candidate.login },
            refreshKey,
            { expiresIn: 24 * 60 * 60 }
        );
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            sameSite: 'strict',
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            path: '/refresh-token',
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: 'strict',
            path: '/logout',
        });
        res.redirect('/resource');
    } else {
        res.redirect('/login');
    }
});

app.get('/refresh-token', async (req, res) => {
    if (req.cookies.refreshToken) {
        let isToken = await redisClient.get(req.cookies.refreshToken);
        if (isToken === null) {
            jwt.verify(req.cookies.refreshToken, refreshKey, async (err, payload) => {
                if (err) res.send(err.message);
                else if (payload) {
                    await redisClient.set(req.cookies.refreshToken, 'blocked');
                    console.log('\x1b[33m%s\x1b[0m', '\nRefresh token: ' + await redisClient.get(req.cookies.refreshToken));

                    const candidate = await Users.findOne({ where: { id: payload.id } });
                    const newAccessToken = jwt.sign(
                        {
                            id: candidate.id,
                            login: candidate.login,
                        },
                        accessKey,
                        { expiresIn: 10 * 60 }
                    );
                    const newRefreshToken = jwt.sign(
                        {
                            id: candidate.id,
                            login: candidate.login,
                        },
                        refreshKey,
                        { expiresIn: 24 * 60 * 60 }
                    );

                    res.cookie('accessToken', newAccessToken, {
                        httpOnly: true,
                        sameSite: 'strict',
                    });

                    res.cookie('refreshToken', newRefreshToken, {
                        httpOnly: true,
                        sameSite: 'strict',
                        path: '/refresh-token',
                    });
                    res.cookie('refreshToken', newRefreshToken, {
                        httpOnly: true,
                        sameSite: 'strict',
                        path: '/logout',
                    });

                    console.log('\x1b[36m%s\x1b[0m', newRefreshToken);
                    res.redirect('/resource');
                }
            });
        } else
            return res.status(401).send('<h2>[ERROR] 401: Invalid token</h2>');
    } else
        return res.status(401).send('<h2>[ERROR] 401: Unathorized</h2>');
});

app.get('/resource', (req, res) => {
    if (req.payload) res.status(200).send(`<h2>Welcome to the resource, ${req.payload.login}!</h2></br>` +
        "<a href='http://localhost:3000/logout'>Log Out</a>");
    else return res.status(401).send('<h2>[ERROR] 401: Unathorized</h2>');
});

app.get('/logout', async (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    await redisClient.set(req.cookies.refreshToken, 'blocked');
    console.log('\x1b[33m%s\x1b[0m', '\nRefresh token: ' + await redisClient.get(req.cookies.refreshToken));
    res.redirect('/login');
});

app.get('/reg', (req, res) => {
    res.sendFile(__dirname + '/static/register.html');
});

app.post('/reg', (req, res) => {
    console.log(req.body.username);
    createUser(req.body.username, req.body.password);
    res.redirect('/login');
});

app.use((req, res, next) => {
    res.status(404).send('[ERROR] 404: Not Found');
});

sequelize.sync().then(() => {
    app.listen(PORT, () => console.log(`[OK] Server running at localhost:${PORT}/\n`));
}).catch((error) => console.log(error));