import { CustomScalar, Scalar } from "@nestjs/graphql";
import { GraphQLScalarType, Kind, ValueNode } from "graphql";

export enum GenderEnum {
    FEMALE,
    MALE
}



export const Gender = new GraphQLScalarType({
    name: 'Gender',
    description: 'Gender custom scalar type ("MALE" | "FEMALE")',

    parseValue: (value: string): GenderEnum => {
        if(value == "MALE")
              return GenderEnum.MALE;
        if(value == "FEMALE")
              return GenderEnum.FEMALE;
  
        throw Error("invalid gender format, input can't be converted")
    },
    
    serialize: (value: GenderEnum): string => {
        return value == GenderEnum.FEMALE ? "FEMALE" : "MALE"; 
    },
    
    parseLiteral: (ast: ValueNode): GenderEnum => {
          
        if(ast.kind != Kind.STRING)
            throw Error("invalid gender format, input can't be converted")
          
        if(ast.value == "MALE")
            return GenderEnum.MALE;
        if(ast.value == "FEMALE")
            return GenderEnum.FEMALE;
        else 
            throw Error("invalid gender value, input can't be converted");
  
      }
  });