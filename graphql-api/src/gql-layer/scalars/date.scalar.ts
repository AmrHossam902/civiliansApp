import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('Date', () => Date)
export class DateScalar implements CustomScalar<string, Date> {
  description = 'Date custom scalar type';

  parseValue(value: string): Date {
    if( /^dd-dd-dddd$/.test(value)){
        const [day, month, year] = value.split("-");
        return new Date(Number(year), Number(month), Number(day));
    }   
    throw Error("invalid date format, input can't be converted")
  }

  serialize(value: Date): string {
    return `${value.getDate()}-${value.getMonth()}-${value.getFullYear()}`; 
  }

  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.STRING && /^dd-dd-dddd$/.test(ast.value)) {
        const [day, month, year] = ast.value.split("-");
        return new Date(ast.value);
    }
    throw Error("invalid date format, input can't be converted")
  }

}