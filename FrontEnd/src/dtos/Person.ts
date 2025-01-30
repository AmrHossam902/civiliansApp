import { Gender } from "@/types/gender";
import { marriedTo } from "./MarriedTo";

export default interface Person {

    id?: string;
    
    firstName?: string;
    lastName?: string;
    middleName?: string;
    birthDate?: string;
    deathDate?: string;
    gender?: Gender;
    ssn?: string;
    siblings?: Person[]
    parents?: Person[]
    marriedTo?: marriedTo[]
}