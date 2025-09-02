import { Sequelize } from "sequelize-typescript"
import { MarriageRecordModel } from "./models/MarriageRecord"
import { PersonModel } from "./models/Person"
import { UUIDConverter } from "./data-types/uuid7-converter"
import { UserModel } from "./models/User"
import { UserRoleModel } from "./models/User_role"
import { RoleModel } from "./models/Role"

export const DbProvider = {
    provide: 'SEQUELIZE',
    useFactory: async () => {

        const sequelize = new Sequelize({
            host: `${process.env.DB_HOST || "localhost"}` ,
            port: Number(process.env.DB_PORT) || 3306,
            username: "root",
            password: `${process.env.DB_ROOT_PASSWORD}`,
            database: "civilDb",
            dialect: "mysql",
            logging: false,
            pool: {
                min: 3,
                max: 8,
                acquire: 30000,
                idle: 60000 
            },
            models: [
                MarriageRecordModel,
                PersonModel,
                UserModel,
                UserRoleModel,
                RoleModel
            ]
        })

        sequelize.addHook("afterFind", (res: any) => {
            new UUIDConverter().processResult(res)
            return res;
        });

        sequelize.addHook("afterCreate", (res: any) => {
            new UUIDConverter().processResult(res)
            return res;
        });


        
        return sequelize;
    }
}