
import { DataTypes } from "sequelize";
import { AutoIncrement, Column, CreatedAt, DataType, PrimaryKey, Table, UpdatedAt, Model, Index, Default, BeforeFind, AfterFind, BeforeCreate } from "sequelize-typescript";
import { UUIDV7 } from "../data-types/UUID7";
import { UUIDConverter } from "../data-types/uuid7-converter";



@Table({
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    tableName: "user",
    freezeTableName: true
})
export class UserModel extends Model {

    @PrimaryKey
    @Column({
        type: (DataTypes as any).UUIDV7,
        defaultValue: UUIDV7.generateUUIDv7,
    })
    id: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: false
    })
    name: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    accountId: number;

    @Column({
        type: DataType.STRING(100),
        allowNull: false
    })
    passwordHash: string;


    @BeforeCreate
    static beforeCreateHook(inputData: any){
        new UUIDConverter().processInputData(inputData.dataValues);
    }
}