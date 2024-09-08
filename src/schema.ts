
export const schema = `#graphql


    type PeoplePage {
        people: [Person]!
        firstCursor: String
        endCursor: String
        hasMore: Boolean
    }


    type Person {
        firstName: String!
        lastName: String!
        middleName: String!
        gender: Int!
        address: String!
        
        birthDate: String!
        deathDate: String 
        
        ssn: String!

        marriedTo: [Person!]
        marriageHistory: [MarriageRecord!]
        
        siblings: [Person!]
        parents: [Person!]!
    }

    type MarriageRecord {
        husband: Person  
        wife: Person 
        type: String!   
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

    input PersonData {
        firstName: String!
        lastName: String!
        middleName: String!
        gender: Int!
        address: String!
        birthDate: String!
    }

    input DateFilter {
        from: String!
        to: String!
    }

    input filter {
        gender: Int
        isAlive: Boolean,
        birthDate: DateFilter

    }



`