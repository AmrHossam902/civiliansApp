
export const schema = `#graphql

    type Person {
        firstName: String!
        lastName: String!
        middleName: String!
        gender: Boolean!
        address: String!
        
        birthDate: String!
        deathDate: String 
        
        ssn: String!

        marriedTo: [Person!]
        marriageHistory: [MarriageRecord!]
        
        siblings: [Person!]
        parents: [Person!]!
        grandParents: [Person!]!
    }

    type MarriageRecord {
        husband: Person  
        wife: Person 
        type: String!   
    }

    type Query {
        people: [Person!],
        someone(ssn: String!): Person 
    }


    type Mutation {
        addNewPerson(person: PersonData!): String
    } 

    input PersonData {
        firstName: String!
        lastName: String!
        middleName: String!
        gender: Boolean!
        address: String!
        
        birthDate: String!
    }

`