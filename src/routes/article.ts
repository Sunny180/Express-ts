import express, { Express, NextFunction, Request, Response } from 'express';
import { Pool } from '../dataBase';
import { Status } from '../status';
import { Resp, Payload, Login, Article, Author } from '../interface';
import { sign as jwtsign, verify as jwtverify } from 'jsonwebtoken';
const port = 5000;
const router: Express = express();
const SECRET = 'thisismynewproject';

let resp: Resp = {
    StatusCode: 0,
    Message: '',
    Data: ''
};
let payload: Payload = {
    UserId: 0,
    RoleId: 0,
    UserName: '',
};
login: Login = {
    Account: '',
    Password: ''
};
article: Article = {
    Title: '',
    Content: '',
    User_Id: 0,
    AdminId: 0,
};
author: Author = {
    Name: '',
    AdminId: 0,
};


router.use(express.json());
router.use(express.urlencoded({ extended: false }));
/* GET localhost:3000/api/articles (這個user_id的所有文章,可給可不給) -所有文章的article_id,article_title,user_name  */
router.get('/api/articles', async (req: Request, res: Response) => {
    const userId = req.query.userId;
    const keyword = req.query.keyword;
    let sql = '';
    let conn;
    if (userId === undefined && keyword === undefined) {
        sql = 'SELECT article.Id, article.Title, article.User_Id UserId, user.Name FROM article join user on article.User_Id = user.Id';
    }
    else if (userId === undefined && keyword) {
        sql = `SELECT article.Id, article.Title, article.User_Id, user.Name FROM article join user on article.User_Id = user.Id WHERE BINARY article.Title LIKE '%${keyword}%' OR BINARY user.Name LIKE '%${keyword}%'`;
    }
    else if (userId && keyword === undefined) {
        sql = `SELECT article.Id, article.Title, article.User_Id, user.Name FROM article join user on article.User_Id = user.Id where user.Id = ${userId}`;
    }
    else {
        sql = `SELECT article.Id, article.Title, article.UserId, user.Name FROM article join user on article.User_Id = user.Id WHERE user.Id = ${userId} AND BINARY article.Title LIKE '%${keyword}%'`;
    }
    try {
        conn = await Pool.getConnection();
        const rows = await conn.query(sql);
        if (rows.length > 0) {
            resp = { StatusCode: Status.success, Message: Status[Status.success], Data: rows };
        } else {
            resp = { StatusCode: Status.data_not_found, Message: Status[Status.data_not_found], Data: '' };
        }
    } catch {
        resp = { StatusCode: Status.system_fail, Message: Status[Status.system_fail], Data: '' };
    } finally {
        if (conn) {
            conn.release();
            res.send(resp);
        }
        else;
    }
});


/* GET localhost:3000/articles/:article_id -一筆資料的user_id,user_name,article_title,article_content,create_time,update_time */
// router.get('/api/articles/:article_id', async function(req, res) {
//         const articleId = req.params.article_id;
//         let conn;
//         try {
//             conn = await Pool.getConnection();
//             const rows = await conn.query(`SELECT u.Name, a.User_Id, a.Id, a.Title, a.Content, a.CreateTime, a.UpdateTime FROM article a join user u on a.User_Id = u.Id where a.Id= ${articleId}`);
//             if (rows.length > 0) {
//                 resp = { StatusCode: Status.success, Message: Status[Status.success], Data: rows[0] };
//             } else {
//                 resp = { StatusCode: Status.data_not_found, Message: Status[Status.data_not_found], Data: '' };
//             }
//         } catch {
//             resp = { StatusCode: Status.system_fail, Message: Status[Status.system_fail], Data: '' };
//         } finally {
//             if (conn) {
//                 conn.release();
//                 res.send(resp);
//             }
//             else;
//         }
//     });

// /* GET localhost:3000/api/authors -所有作者 */
// router.get('/api/authors', authenticateToken, async function(req, res) {
//         let conn;
//         try {
//             conn = await Pool.getConnection();
//             if (payload.RoleId === 1) {
//                 const rows = await conn.query('SELECT Id, Name FROM user');
//                 if (rows.length > 0) {
//                     resp = { StatusCode: Status.success, Message: Status[Status.success], Data: rows };
//                 } else {
//                     resp = { StatusCode: Status.data_not_found, Message: Status[Status.data_not_found], Data: '' };
//                 }
//             }
//             else {
//                 resp = { StatusCode: Status.permission_denied, Message: Status[Status.permission_denied], Data: '' };
//             }
//         } catch {
//             resp = { StatusCode: Status.system_fail, Message: Status[Status.system_fail], Data: '' };
//         } finally {
//             if (conn) {
//                 conn.release();
//                 res.send(resp);
//             }
//             else;
//         }
//     });

// /* POST localhost:3000/articles -insert一筆資料 */
// router.post('/api/articles', authenticateToken, async function(req, res) {
//         let conn;
//         article = req.body;
//         if (payload.RoleId) {
//             try {
//                 conn = await Pool.getConnection();
//                 conn.query(`INSERT INTO article(Title, Content, User_Id, AdminId) values ('${article.Title}','${article.Content}',${article.User_Id},${article.AdminId})`);
//                 resp = { StatusCode: Status.success, Message: Status[Status.success], Data: '' };
//             } catch {
//                 resp = { StatusCode: Status.system_fail, Message: Status[Status.system_fail], Data: '' };
//             } finally {
//                 if (conn) {
//                     conn.release();
//                     res.send(resp);
//                 }
//                 else;
//             }
//         } else {
//             res.send({ StatusCode: Status.permission_denied, Message: Status[Status.permission_denied], Data: null });
//         }
//     });

// /* PUT localhost:3000/articles/:article_id -update一筆資料 */
// router.put('/api/articles/:article_id', authenticateToken, async function(req, res) {
//         let conn;
//         const article_id = req.params.article_id;
//         article = req.body;
//         let sql = '';
//         try {
//             conn = await Pool.getConnection();
//             if (payload.RoleId === 1) {
//                 sql = `UPDATE article SET Title='${article.Title}', Content='${article.Content}', AdminId='${article.AdminId}' where Id= ${article_id}`;
//             }
//             else if (payload.RoleId === 2) {
//                 sql = `UPDATE article SET Title='${article.Title}', Content='${article.Content}', AdminId='${article.AdminId}' where Id= ${article_id} AND User_Id=${payload.UserId}`;
//             }
//             else {
//                 resp = { StatusCode: Status.permission_denied, Message: Status[Status.permission_denied], Data: '' };
//             }
//             const rows = await conn.query(`SELECT Id FROM article WHERE Id = ${article_id}`);
//             if (rows.length > 0) {
//                 conn.query(sql);
//                 resp = { StatusCode: Status.success, Message: Status[Status.success], Data: '' };
//             }
//             else {
//                 resp = { StatusCode: Status.data_not_found, Message: Status[Status.data_not_found], Data: '' };
//             }
//         } catch {
//             resp = { StatusCode: Status.system_fail, Message: Status[Status.system_fail], Data: '' };
//         } finally {
//             if (conn) {
//                 conn.release();
//                 res.send(resp);
//             }
//             else;
//         }
//     });

// /* PUT localhost:3000/authors/:author_id -update一筆資料 */
// router.put('/api/authors/:author_id', authenticateToken, async function(req, res) {
//         let conn;
//         const author_id = req.params.author_id;
//         author = req.body;
//         try {
//             conn = await Pool.getConnection();
//             if (payload.RoleId === 1) {
//                 const rows = await conn.query(`SELECT Id FROM user WHERE Id = ${author_id}`);
//                 if (rows.length > 0) {
//                     conn.query(`UPDATE user SET Name='${author.Name}', AdminId='${author.AdminId}' where Id= ${author_id}`);
//                     resp = { StatusCode: Status.success, Message: Status[Status.success], Data: '' };
//                 }
//                 else {
//                     resp = { StatusCode: Status.data_not_found, Message: Status[Status.data_not_found], Data: '' };
//                 }
//             }
//             else {
//                 resp = { StatusCode: Status.permission_denied, Message: Status[Status.permission_denied], Data: '' };
//             }
//         } catch {
//             resp = { StatusCode: Status.system_fail, Message: Status[Status.system_fail], Data: '' };
//         } finally {
//             if (conn) {
//                 conn.release();
//                 res.send(resp);
//             }
//             else;
//         }
//     });


// /* DELETE localhost:3000/articles/:article_id -delete一筆資料 */
// router.delete('/api/articles/:article_id', authenticateToken, async function(req, res) {
//         let conn;
//         const article_id = req.params.article_id;
//         let sql = '';
//         try {
//             conn = await Pool.getConnection();
//             if (payload.RoleId === 1) {
//                 sql = `DELETE FROM article WHERE Id = ${article_id}`;
//             }
//             else if (payload.RoleId === 2) {
//                 sql = `DELETE FROM article WHERE Id = ${article_id} AND User_Id = ${payload.UserId}`;
//             }
//             else {
//                 resp = { StatusCode: Status.permission_denied, Message: Status[Status.permission_denied], Data: '' };
//             }
//             const rows = await conn.query(`SELECT Id FROM article WHERE Id = ${article_id}`);
//             if (rows.length > 0) {
//                 conn.query(sql);
//                 resp = { StatusCode: Status.success, Message: Status[Status.success], Data: '' };
//             }
//             else {
//                 resp = { StatusCode: Status.data_not_found, Message: Status[Status.data_not_found], Data: '' };
//             }
//         } catch {
//             resp = { StatusCode: Status.system_fail, Message: Status[Status.system_fail], Data: '' };
//         } finally {
//             if (conn) {
//                 conn.release();
//                 res.send(resp);
//             }
//             else;
//         }
//     });

// /* DELETE localhost:3000/api/authors/:author_id -delete一個作者 */
// router.delete('/api/authors/:author_id', authenticateToken, async function(req, res) {
//         let conn;
//         const author_id = req.params.author_id;
//         try {
//             conn = await Pool.getConnection();
//             if (payload.RoleId === 1) {
//                 const rows = await conn.query(`SELECT Id FROM user WHERE Id = ${author_id}`);
//                 if (rows.length > 0) {
//                     conn.query(`DELETE u,a FROM user u join article a on u.Id = a.User_Id WHERE u.Id = ${author_id};DELETE FROM user WHERE Id = ${author_id};`);
//                     resp = { StatusCode: Status.success, Message: Status[Status.success], Data: '' };
//                 }
//                 else {
//                     resp = { StatusCode: Status.data_not_found, Message: Status[Status.data_not_found], Data: '' };
//                 }
//             }
//             else {
//                 resp = { StatusCode: Status.permission_denied, Message: Status[Status.permission_denied], Data: '' };
//             }
//         } catch {
//             resp = { StatusCode: Status.system_fail, Message: Status[Status.system_fail], Data: '' };
//         } finally {
//             if (conn) {
//                 conn.release();
//                 res.send(resp);
//             }
//             else;
//         }
//     });

// /* POST localhost:3000/logout -logout */
// router.post('/api/logout', authenticateToken, async function(req, res) {
//         let conn;
//         const userId = req.body.User_Id;
//         try {
//             conn = await Pool.getConnection();
//             if (payload.RoleId) {
//                 const rows = await conn.query(`SELECT t.User_Id FROM token t JOIN user u ON t.User_Id = u.Id where t.User_Id = ${userId}`);
//                 if (rows.length > 0) {
//                     conn.query(`UPDATE token SET Token = '' WHERE User_Id = ${rows[0].User_Id}`);
//                     resp = { StatusCode: Status.success, Message: Status[Status.success], Data: '' };
//                 }
//                 else {
//                     resp = { StatusCode: Status.token_not_found, Message: Status[Status.token_not_found], Data: '' };
//                 }
//             }
//             else {
//                 resp = { StatusCode: Status.permission_denied, Message: Status[Status.permission_denied], Data: '' };
//             }
//         } catch {
//             resp = { StatusCode: Status.system_fail, Message: Status[Status.system_fail], Data: '' };
//         } finally {
//             if (conn) {
//                 conn.release();
//                 res.send(resp);
//             }
//             else;
//         }
//     });

// /* POST localhost:3000/login -login */
// router.post('/api/login', async function(req: Request, res: Response) {
//         let conn;
//         let accessToken;
//         login = req.body;
//         try {
//             conn = await Pool.getConnection();
//             const rows = await conn.query(`select u.Id, u.Name, u.Role_Id from user u JOIN role r on u.Role_Id = r.Id where account= '${login.Account}' AND password='${login.Password}'`);
//             if (rows.length > 0) {
//                 // 產生 JWT
//                 const payload = {
//                     userId: Number(rows[0].Id),
//                     roleId: Number(rows[0].Role_Id),
//                     userName: rows[0].Name
//                 };
//                 // 取得 API Token
//                 accessToken = jwtsign({ payload, exp: Math.floor(Date.now() / 1000) + (60 * 20) }, SECRET);
//                 const row = await conn.query(`SELECT t.User_Id FROM user u JOIN token t ON u.Id = t.User_Id where u.Id = ${rows[0].Id}`);
//                 if (row.length > 0) {
//                     conn.query(`UPDATE token SET Token = '${accessToken}' where User_Id = ${row[0].User_Id}`);
//                     resp = { StatusCode: Status.success, Message: Status[Status.success], Data: accessToken };
//                 }
//                 else {
//                     conn.query(`INSERT INTO token (User_Id, Token) values (${payload.userId}, '${accessToken}')`);
//                     resp = { StatusCode: Status.success, Message: Status[Status.success], Data: accessToken };
//                 }
//             }
//             else {
//                 resp = { StatusCode: Status.Incorrect_account_or_password, Message: Status[Status.Incorrect_account_or_password], Data: '' };
//             }
//         } catch {
//             resp = { StatusCode: Status.system_fail, Message: Status[Status.system_fail], Data: '' };
//         } finally {
//             if (conn) {
//                 conn.release();
//                 res.send(resp);
//             }
//             else;
//         }
//     });

// async function authenticateToken(req: Request, res: Response, next: NextFunction) {
//     let header: string[] = [];
//     let token = '';
//     const SECRET = 'thisismynewproject';
//     try {
//         const authorization = req.header('authorization');
//         if (!authorization) {
//             console.log('header_err');
//         }
//         else {
//             header = authorization.split(' ');
//             token = header[1];
//             jwtverify(token, SECRET, async function (err, decoded) {
//                 if (err) {
//                     if (err.message === 'jwt expired') {
//                         res.send({ StatusCode: Status.login_timeout, Message: Status[Status.login_timeout], Data: '' });
//                     } else {
//                         console.log('token_err');
//                     }
//                 } else {
//                     if (decoded) {
//                         const userId = decoded.payload.userId;
//                         let conn;
//                         try {
//                             conn = await Pool.getConnection();
//                             const rows = await conn.query(`select Id, Role_Id from user where Id = ${userId}`);
//                             if (rows.length > 0) {
//                                 payload = decoded.payload;
//                             } else;
//                         } catch (err) {
//                             res.send({ StatusCode: Status.system_fail, Message: Status[Status.system_fail], Data: '' });
//                         } finally {
//                             if (conn) {
//                                 conn.release();
//                             }
//                             else;
//                         }
//                     } else {
//                         console.log('decoded_err');
//                     }
//                     next();
//                 }
//             });
//         }
//     } catch {
//         console.log('err');
//     }
// }


router.listen(port, () => {
    console.log(`server is running on http://localhost:${port}`);
});


// router.get('/', (req: Request, res: Response) => {
//     let connect: PoolConnection;
//     Pool.getConnection()
//         .then((conn) => {
//             connect = conn;
//             return conn.query('SELECT article.Id, article.Title, article.User_Id, user.Name FROM article join user on article.User_Id = user.Id');
//         })
//         .then((rows) => {
//             res.send({ message: 'success', rows })
//         })
//         .catch((err) => {
//             console.log(err);
//             res.send('fail')
//         })
//         .finally(() => {
//             if (connect) connect.release();
//         })
// })