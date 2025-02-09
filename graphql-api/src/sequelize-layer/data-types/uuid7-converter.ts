import { Model } from "sequelize-typescript";
import { UUIDV7 } from "./UUID7";
import * as models from '../models/models';
import { ModelAttributeColumnOptions } from "sequelize";

export class UUIDConverter {

    constructor(){}

    processResult(result:Model | Array<Model>){

        if( Array.isArray(result) )
            result.forEach( item => {
                this.processResult(item);
        })
        else{

            let fieldsToConvert:string[] = []
            let attribs: {
                readonly [x: string]: ModelAttributeColumnOptions<Model<any, any>>;
            } = {};

            Object.keys(models).forEach(key =>{
                if(result instanceof models[key])
                    attribs = models[key].getAttributes();
            })

            fieldsToConvert = Object.keys(attribs).filter(attribName =>{ 
                return attribs[attribName].type.toString({}).includes("UUIDV7");
            });

            Object.keys(result.dataValues).forEach( key =>{ 
                if(fieldsToConvert.includes(key) && result.dataValues[key])
                    result.setDataValue(
                        key,
                        UUIDV7.parse(result.dataValues[key])
                    )
                
                else if( typeof result[key] == "object" &&
                    Object.values(models)
                    .includes(result[key]?.constructor)
                )
                    this.processResult(result[key])
            });
            
        }

    }

    processQueryOptions(options){
        if(options.where)
            this.processObject(options.where)
    }

    processInputData(inputsData){
        this.processObject(inputsData);
    }


    processObject(clause){


        if(Array.isArray(clause)){
            
            clause.forEach((item ,index)=> {
                if(typeof item == "string" && 
                    UUIDV7.isUUIDv7(item)
                )
                    clause[index] = UUIDV7._stringify(item);
                
                else if(item && typeof item == "object")
                    this.processObject(item)
            })
            
        }
        else if(typeof clause == "object"){

            //operators
            let symbols = Object.getOwnPropertySymbols(clause);
            let properties = Object.keys(clause);

            [...properties, ...symbols].forEach( (key) => {
                if(typeof clause[key] == "string" && 
                    UUIDV7.isUUIDv7(clause[key])
                )
                    clause[key] = UUIDV7._stringify(clause[key]);
                else if(Array.isArray(clause[key]) || typeof clause[key] == "object")
                    this.processObject(clause[key])
            })
        }
    }



}