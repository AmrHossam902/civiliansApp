
export const schema = `#graphql

    scalar Date 

    enum Gender {
        MALE
        FEMALE
    }

    type Person {
        id: ID
        firstName: String!
        lastName: String!
        middleName: String!
        gender: Gender!
        address: String!
        
        birthDate: Date!
        deathDate: Date 
        
        ssn: String!

        marriedTo: [MarriedTo!]
        
        siblings: [Person!]
        parents: [Person!]
    }


    type MarriageRecord {
        id: ID
        type: String! 
        marriageDate: Date
        husband: Person 
        wife: Person
    }

    type MarriedTo {
        spouse: Person!
        marriageDate: Date
        children: [Person]
    }


    input PersonData {
        firstName: String!
        lastName: String!
        middleName: String!
        gender: Gender!
        address: String!
        birthDate: String!
    }

    input DateFilter {
        from: String!
        to: String!
    }

    input filter {
        gender: Gender
        isAlive: Boolean,
        birthDate: DateFilter
    }

    type PeoplePage {
        people: [Person]!
        next: String
        prev: String
    }

    type Query {
        people(
            after: String,
            before: String, 
            sort:[[String!]!], 
            limit: Int,
            filter: filter,
            search: String): PeoplePage
        someone(ssn: String!): Person
    }


    type Mutation {
        addNewPerson(person: PersonData!): String
    } 


`