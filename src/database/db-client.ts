import { Person } from "../person/models/Person";
import { Sequelize } from "sequelize-typescript";
import { MRecord } from "../person/models/MarriageRecord";


export class Db {
    
    sequelizeInstance: Sequelize = new Sequelize({
        host: "localhost",
        port: 3306,
        username: "root",
        password: "123456",
        database: "civilDb",
        dialect: "mysql",
        logging: false,
        models: [
            MRecord,
            Person
        ]
    })
    
    constructor(){
        this.sequelizeInstance.sync({force: true})
        .then(()=>{
            console.log("sync completed");
        })
        .catch( (e)=>{
            console.log("fucked------------")
            console.log(e);
        });
    }
    
    
    

}
