import { Person } from "../models/person.model"

export interface PeoplePage {
    people: Person[],
    prev?: String,
    next?: String,
}