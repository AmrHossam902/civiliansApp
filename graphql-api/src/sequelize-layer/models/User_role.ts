
import { DataTypes } from "sequelize";
import { AutoIncrement, Column, CreatedAt, DataType, PrimaryKey, Table, UpdatedAt, Model, Index, Default, BeforeFind, AfterFind, BeforeCreate, ForeignKey, BelongsTo } from "sequelize-typescript";
import { UUIDV7 } from "../data-types/UUID7";
import { UUIDConverter } from "../data-types/uuid7-converter";
import { RoleModel } from "./Role";
import { UserModel } from "./User";



@Table({
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    tableName: "user_role",
    timestamps: false,
    freezeTableName: true
})
export class UserRoleModel extends Model {

    @PrimaryKey
    @Column({
        type: (DataTypes as any).UUIDV7,
        defaultValue: UUIDV7.generateUUIDv7,
    })
    id: string;

    @ForeignKey( ()=> RoleModel )
    @Column({
        type: (DataTypes as any).UUIDV7
    })
    roleId: string;
    @BelongsTo(()=> RoleModel, 'roleId')
    role: RoleModel

    @ForeignKey( ()=> UserModel )
    @Column({
        type: (DataTypes as any).UUIDV7
    })
    userId: string;
    @BelongsTo(()=> UserModel, 'userId')
    user: UserModel
    
    @BeforeCreate
    static beforeCreateHook(inputData: any){
        new UUIDConverter().processInputData(inputData.dataValues);
    }
}