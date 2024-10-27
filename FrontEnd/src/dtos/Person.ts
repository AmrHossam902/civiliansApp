import { marriedTo } from "./MarriedTo";

export default interface Person {

    id?: string;
    
    firstName?: string;
    lastName?: string;
    middleName?: string;
    birthDate?: string;
    deathDate?: string;
    gender?: string;
    ssn?: string;
    siblings?: Person[]
    parents?: Person[]
    marriedTo?: marriedTo[]


}