
import { AutoIncrement, Column, CreatedAt, DataType, PrimaryKey, Table, UpdatedAt, Model, Index, Default } from "sequelize-typescript";



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

    @Index({ order: "ASC" , using: "BTREE"})
    @Column({
        type: DataType.UUIDV4,
        defaultValue: DataType.UUIDV4
    })
    publicId: string;

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
    
    @Column(DataType.INTEGER)
    father_id?: number;

    @Column(DataType.INTEGER)
    mother_id?: number;

    @CreatedAt
    createdAt?: Date;
    
    @UpdatedAt
    updateAt?: Date;
}