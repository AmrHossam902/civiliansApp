import FamilyTreeComponent from "@/components/family/FamilyTreeComponent";
import ClientComponent from "@/components/clientComponent";
import ServerComponent from "@/components/serverComponent";
import Person from "@/interfaces/Person";


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
                        id
                        firstName
                        lastName
                        middleName
                        ssn
                        birthDate
                        gender

                        parents {
                            id
                            firstName
                            lastName
                            middleName
                            ssn
                            birthDate
                            gender
                        }

                        siblings {
                            id
                            firstName
                            lastName
                            middleName
                            ssn
                            birthDate
                            gender

                            parents {
                                id
                            }
                        }

                        marriedTo {
                            spouse {
                                id
                                firstName
                                lastName
                                middleName
                                ssn
                                birthDate
                                gender
                            }

                            children {
                                id
                                firstName
                                lastName
                                middleName
                                ssn
                                birthDate
                                gender
                            }
                        }
                    }
                }`,
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

    const personInfo: Person = data.data.someone; 

    return <div className="w-screen h-screen">
        <FamilyTreeComponent person={personInfo}></FamilyTreeComponent>
    </div>

}


