import FamilyTreeComponent from "@/components/family/FamilyTreeComponent";
import Person from "@/dtos/Person";


type Params = {
    ssn: string
}

export default async function PersonalDetails({ params }: {params: Params}) {

   const fetchData = async ()=>{
            
        return fetch("http://localhost:4000/graphql", {
            "method": "POST",
            headers: {
                "Content-Type": "application/json"
              },
            cache: 'no-cache',
            body: JSON.stringify({
                query: `query someone($ssn: String!){
                    someone(ssn: $ssn) {
                        ...personDetails

                        parents {
                            ...personDetails
                            marriedTo{
                                spouse{
                                    id
                                }
                                marriageDate
                            }
                        }

                        siblings {
                            ...personDetails

                            parents {
                                id
                            }
                            
                            marriedTo {
                                spouse {
                                    ...personDetails
                                }
                                marriageDate
                                children {
                                    ...personDetails
                                }
                            }
                        }

                        marriedTo {
                            spouse {
                                ...personDetails
                                parents {
                                    ...personDetails
                                    marriedTo{
                                        spouse{
                                            id
                                        }
                                        marriageDate
                                    }
                                }
                            }
                            marriageDate
                            children {
                                ...personDetails
                            }
                        }
                    }
                }
                
                fragment personDetails on Person {
                    id
                    firstName
                    middleName
                    lastName
                    ssn
                    birthDate
                    deathDate
                    gender
                }
                
                `,
                variables: {
                    ssn:params.ssn
                }
                
            })
        })
        .then((res)=> res.json())
        .catch( (e)=> {
            console.error(e);
            return {}
        })
    };

    const data = await fetchData();
    console.log(JSON.stringify(data, undefined, "   "));
    const personInfo: Person = data.data.someone; 

    return <div className="w-full h-full">
        <FamilyTreeComponent person={personInfo}></FamilyTreeComponent>
    </div>

}


