
import { AutoIncrement, Column, CreatedAt, DataType, PrimaryKey, Table, UpdatedAt, Model } from "sequelize-typescript";



@Table({
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    tableName: "person",
    freezeTableName: true
})
export class Person extends Model {

    @AutoIncrement    
    @PrimaryKey
    @Column(DataType.INTEGER)
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
    
    @Column(DataType.INTEGER)
    father_id?: number;

    @Column(DataType.INTEGER)
    mother_id?: number;
    
    @CreatedAt
    createdAt?: Date;
    
    @UpdatedAt
    updateAt?: Date;
}