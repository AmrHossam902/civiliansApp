import { Person } from "../models/person.model";

export interface MarriedTo {
    parent?: Person;
    spouse: Person;
    marriageDate: Date,
    children?: Person[]
}