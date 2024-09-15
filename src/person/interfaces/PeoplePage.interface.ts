import { Person } from "../models/Person"

export interface PeoplePage {
    people: Person[],
    prev?: String,
    next?: String,
}