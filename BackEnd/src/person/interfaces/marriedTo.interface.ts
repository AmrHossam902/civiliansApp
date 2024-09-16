import { Person } from "../models/Person";

export interface MarriedTo {
    spouse: Person;
    children?: Person[]
}