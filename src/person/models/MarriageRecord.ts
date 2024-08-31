import { AutoIncrement, BelongsTo, Column, CreatedAt, DataType, ForeignKey, Model, PrimaryKey, Table, UpdatedAt } from "sequelize-typescript";
import { Per, Person } from "./Person";

export interface MarriageRecord {

    id?: string;
    publicId?: string; 

    husbandId: number;
    wifeId: number;
    mDate: Date;

    rType: number; //marriage / divorce

}

@Table({
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    tableName: "marriageRecord",
    freezeTableName: true
})
export class MRecord extends Model{

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column(DataType.STRING)
    publicId: string; 

    @ForeignKey( ()=> Per )
    @Column(DataType.INTEGER)
    husbandId: number;


    @ForeignKey( ()=>Per )
    @Column(DataType.INTEGER)
    wifeId: number;

    @Column(DataType.DATE)
    mDate: Date;

    @Column(DataType.TINYINT)
    rType: number; //marriage / divorce

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}