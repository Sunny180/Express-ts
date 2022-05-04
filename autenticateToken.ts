import { Request, Response, NextFunction } from 'express';
import { Pool } from './src/dataBase';
import { Status } from './src/status';
import { Resp, Payload } from './src/interface';
import { verify } from 'jsonwebtoken';

export class authenticate {
    private resp: Resp = {
        StatusCode: 0,
        Message: '',
        Data: ''
    }
    public payload: Payload = {
        userId: 0,
        roleId: 0,
        userName: '',
    }
    private header: string[] = [];
    private token = '';
    private SECRET = 'thisismynewproject';

    public authenticateToken(req: Request, res: Response, next: NextFunction): void {
        try {
            const authorization = req.header('authorization');
            if (!authorization) {
                console.log('header_err');
            }
            else {
                this.token = (authorization.split(' '))[1];
                verify(this.token, this.SECRET, async (err, decoded) => {
                    if (err) {
                        if (err.message === 'jwt expired') {
                            this.resp = { StatusCode: Status.login_timeout, Message: 'login_timeout', Data: '' };
                        } else {
                            console.log('token_err');
                        }
                    } else {
                        if (decoded) {
                            const userId = decoded.payload.userId;
                            let conn;
                            try {
                                conn = await Pool.getConnection();
                                const rows = await conn.query(`select Id, Role_Id from user where Id = ${userId}`);
                                if (rows.length > 0) {
                                    this.payload = decoded.payload;
                                } else;
                            } catch {
                                this.resp = { StatusCode: Status.system_fail, Message: 'system_fail', Data: '' };
                            } finally {
                                if (conn) {
                                    conn.release();
                                    res.send(this.resp);
                                }
                                else;
                            }
                        } else {
                            console.log('decoded_err');
                        }
                        next();
                    }
                });
            }
        } catch {
            console.log('err');
        }
    }
}

// export function authenticateToken(req: Request, res: Response, next: NextFunction) {
//     const resp: Resp = {
//         StatusCode: 0,
//         Message: '',
//         Data: ''
//     }
//     let payload: Payload = {
//         userId: 0,
//         roleId: 0,
//         userName: '',
//     }
//     let header: string[] = [];
//     let token: string = '';
//     const SECRET = 'thisismynewproject';

//     try {
//         const authorization = req.header('authorization');
//         if (!authorization) {
//             console.log('header_err');
//         }
//         else {
//             header = authorization.split(' ');
//             token = header[1];
//             verify(token, SECRET, async function (err, decoded) {
//                 if (err) {
//                     if (err.message === 'jwt expired') {
//                         resp.StatusCode = Status.login_timeout;
//                         resp.Message = 'login_timeout';
//                         resp.Data = '';
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
//                             } else { }
//                         } catch {
//                             resp.StatusCode = Status.system_fail;
//                             resp.Message = 'system_fail';
//                             resp.Data = '';
//                         } finally {
//                             if (conn) {
//                                 conn.release();
//                                 res.send(resp);
//                             }
//                             else;
//                         }
//                     }else{
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
