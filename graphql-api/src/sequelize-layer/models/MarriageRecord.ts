import { AutoIncrement, BelongsTo, BelongsToMany, Column, CreatedAt, DataType, ForeignKey, HasOne, Index, Model, PrimaryKey, Table, UpdatedAt } from "sequelize-typescript";
import { PersonModel } from "./Person";


@Table({
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    tableName: "marriageRecord",
    freezeTableName: true
})
export class MarriageRecordModel extends Model{

    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Index({ type: "UNIQUE", using: "BTREE"})
    @Column(DataType.STRING)
    publicId: string; 

    @ForeignKey( ()=> PersonModel )
    @Column(DataType.INTEGER)
    husbandId: number;

    @BelongsTo(()=> PersonModel, 'husbandId')
    husband: PersonModel 

    @ForeignKey( ()=>PersonModel )
    @Column(DataType.INTEGER)
    wifeId: number;

    @BelongsTo(()=> PersonModel, 'wifeId')
    wife: PersonModel;

    @Column(DataType.DATE)
    mDate: Date;

    @Column(DataType.TINYINT)
    rType: number; //marriage / divorce

    @CreatedAt
    createdAt: Date;

    @UpdatedAt
    updatedAt: Date;
}