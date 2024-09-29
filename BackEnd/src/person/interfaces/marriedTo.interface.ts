import { Person } from "../models/Person";

export interface MarriedTo {
    parent?: Person;
    spouse: Person;
    marriageDate: Date,
    children?: Person[]
}