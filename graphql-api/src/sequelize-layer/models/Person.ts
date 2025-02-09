
import { DataTypes } from "sequelize";
import { AutoIncrement, Column, CreatedAt, DataType, PrimaryKey, Table, UpdatedAt, Model, Index, Default, BeforeFind, AfterFind, BeforeCreate } from "sequelize-typescript";
import { UUIDV7 } from "../data-types/UUID7";
import { UUIDConverter } from "../data-types/uuid7-converter";



@Table({
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    tableName: "person",
    freezeTableName: true
})
export class PersonModel extends Model {

    @PrimaryKey
    @Column({
        type: (DataTypes as any).UUIDV7,
        defaultValue: UUIDV7.generateUUIDv7,
    })
    id: string;

    @Index({ order: "ASC" , using: "BTREE"})
    @Column(DataType.STRING(40) )
    firstName: string;

    @Index({ order: "ASC" , using: "BTREE"})
    @Column(DataType.STRING(40))
    lastName: string;

    @Index({ order: "ASC" , using: "BTREE"})
    @Column(DataType.STRING(40) )
    middleName: string;
    
    @Index({ order: "ASC" , type: "UNIQUE", using: "BTREE"})
    @Column(DataType.STRING(30) )
    ssn: string;

    @Index({ order: "ASC" , using: "BTREE"})
    @Column(DataType.TINYINT)
    gender: number;

    @Column(DataType.DATE)
    birthDate: Date;

    @Column(DataType.DATE)
    deathDate: Date;

    @Column(DataType.STRING(100) )
    address: string;
    
    @Column({
        type: (DataTypes as any).UUIDV7
    })
    father_id?: string;

    @Column({
        type: (DataTypes as any).UUIDV7
    })
    mother_id?: string;

    @CreatedAt
    createdAt?: Date;
    
    @UpdatedAt
    updateAt?: Date;


    @BeforeFind
    static beforeFindHook(options: any){
        new UUIDConverter().processQueryOptions(options);
    }

    @BeforeCreate
    static beforeCreateHook(inputData: any){
        new UUIDConverter().processInputData(inputData.dataValues);
    }
    
}