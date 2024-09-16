'use client'
import { useEffect } from "react";

type Col = {
    key: string;
    sortable?: boolean;
  }
  
let cols: Col[]= [
    {
        key: "firstName",
        sortable: true
    },{
        key:"lastName",
        sortable: true
    },{
        key: "middleName",
    },{
        key: "birthDate"
    },{
        key: "ssn"
    },{
        key: "gender"
    },{
        key: "family"
    }
]


type Row = {
    firstName: string;
    lastName: string;
    middleName: string;
    ssn: string;
    birthDate: string;
    gender: string;
}

type QueryResult = {
    people: Row[],
    next: string,
    prev: string
}

export default function allCivilians(){

    const fetchData = ()=>{ 
    
        fetch("http://localhost:4000/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          cache: 'no-cache',
          body: JSON.stringify({
            query: `query people($search: String, $limit: Int, $after: String, $before: String, $sort: [[String!]!]){
              people(search: $search, limit: $limit, after: $after, before: $before, sort: $sort) {
                people {
                  firstName
                  lastName
                  middleName
                  ssn
                  birthDate
                  gender
                }
                next
                prev
              }
          }`,
          variables: {
            "limit": 10
          }
          })
        })
        .then( res => res.json())
        .then( res => console.log(res))

    return <div>all civilians</div>;
    }

    useEffect(()=>{
        fetchData()
    },[])
}