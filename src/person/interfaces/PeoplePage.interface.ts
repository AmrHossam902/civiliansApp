import { Person } from "../models/Person"

export interface PeoplePage {
    people: Person[],
    firstCursor: String,
    endCursor: String,
    total: number
}