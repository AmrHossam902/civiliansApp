import { Person } from "../person/models/Person";
import { Sequelize } from "sequelize-typescript";
import { MarriageRecord } from "../person/models/MarriageRecord";


export class Db {
    
    sequelizeInstance: Sequelize = new Sequelize({
        host: "localhost",
        port: 3306,
        username: "root",
        password: "123456",
        database: "civilDb",
        dialect: "mysql",
        logging: false,
        pool: {
            min: 3,
            max: 8,
            acquire: 30000,
            idle: 10000 
        },
        models: [
            MarriageRecord,
            Person
        ]
    })
    
    constructor(){
        this.sequelizeInstance.sync({force: false})
        .then(()=>{
            console.log("sync completed");
        })
        .catch( (e)=>{
            console.log("fucked------------")
            console.log(e);
        });
    }
    
    
    

}
