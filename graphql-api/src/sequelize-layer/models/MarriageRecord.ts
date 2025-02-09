import { AfterFind, AutoIncrement, BeforeCreate, BeforeFind, BelongsTo, BelongsToMany, Column, CreatedAt, DataType, ForeignKey, HasOne, Index, Model, PrimaryKey, Table, UpdatedAt } from "sequelize-typescript";
import { PersonModel } from "./Person";
import { DataTypes } from "sequelize";
import { UUIDV7 } from "../data-types/UUID7";
import { UUIDConverter } from "../data-types/uuid7-converter";


@Table({
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    tableName: "marriageRecord",
    freezeTableName: true
})
export class MarriageRecordModel extends Model{

    @PrimaryKey
    @Column({
        type: (DataTypes as any).UUIDV7,
        defaultValue: UUIDV7.generateUUIDv7,
    })
    id: string;

    @ForeignKey( ()=> PersonModel )
    @Column({
        type: (DataTypes as any).UUIDV7
    })
    husbandId: string;

    @BelongsTo(()=> PersonModel, 'husbandId')
    husband: PersonModel 

    @ForeignKey( ()=>PersonModel )
    @Column({
        type: (DataTypes as any).UUIDV7
    })
    wifeId: string;

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

    @BeforeFind
    static beforeFindHook(options: any){
        new UUIDConverter().processQueryOptions(options);
    }

    @BeforeCreate
    static beforeCreateHook(inputData: any){
        new UUIDConverter().processInputData(inputData);
    }
        
}