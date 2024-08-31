
import { AutoIncrement, Column, CreatedAt, DataType, PrimaryKey, Table, UpdatedAt, Model } from "sequelize-typescript";


export interface Person {

    id?: string;
    publicId?: string; 

    firstName: string;
    lastName: string;
    middleName: string;
    
    ssn: string;
    gender: boolean;
    birthDate: Date;
    deathDate?: Date;
    address: string;
    
    
    father_id?: number;
    mother_id?: number;
    
    createdAt?: Date;
    updateAt?: Date;
}


@Table({
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    tableName: "person",
    freezeTableName: true
})
export class Per extends Model {

    
    @PrimaryKey
    @Column(DataType.INTEGER)
    @AutoIncrement
    id: number;

    @Column(DataType.STRING(20) )
    firstName: string;

    @Column(DataType.STRING(20))
    lastName: string;

    @Column(DataType.STRING(40) )
    middleName: string;
    
    @Column(DataType.STRING(30) )
    ssn: string;

    @Column(DataType.TINYINT)
    gender: boolean;

    @Column(DataType.DATE)
    birthDate: Date;

    @Column(DataType.DATE)
    deathDate: Date;

    @Column(DataType.STRING(100) )
    address: string;
    
    @Column(DataType.NUMBER)
    father_id?: number;

    @Column(DataType.NUMBER)
    mother_id?: number;
    
    @CreatedAt
    createdAt?: Date;
    
    @UpdatedAt
    updateAt?: Date;
}