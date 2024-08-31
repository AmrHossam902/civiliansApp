import mysql, {Pool} from "mysql2/promise";
import { Person } from "../person/models/Person";
import { PoolConnection } from "mysql2/typings/mysql/lib/PoolConnection";

export const connectionPool:Pool = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "123456",
    database: "civilDb"
});

export function addPerson(p: Person){
    connectionPool.getConnection()
    .then( (connection) =>{
        
        connection.execute(
            "insert into person"
        )
    })
}



