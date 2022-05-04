// DataBase 
import mariadb from 'mariadb';
export const Pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'pratice',
    multipleStatements: true
});
