import { sendRequest } from "./api-client";


export function getPeople(search: string, filter: Record<string, any>) { 
    
    return sendRequest({
        query: `query people($limit: Int, $search: String, $filter: FilterInput){
            people(search: $search, limit: $limit, filter: $filter) {
                people {
                    id
                    firstName
                    middleName
                    lastName
                    birthDate
                    ssn
                    gender
                }
            }
        }`,
        variables: {
            limit: 20,
            search: search,
            filter: filter
        }
    })
    .then(result=> result.data.people);
}


export function createNewPerson(person:any){
    
    return fetch(`${process.env.NEXT_PUBLIC_API_URL}/graphql`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        cache: 'no-cache',
        body: JSON.stringify({
            query: `mutation AddNewPerson($person: CreatePersonInput!) {
                        addNewPerson(person: $person){
                            id
                        }
            }`,
            variables: {
                person
            }
        })

    })
}
