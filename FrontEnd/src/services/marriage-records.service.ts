

export function getMarriageRecord(fatherNatId : string, motherNatId: string){
    return fetch(`${process.env.NEXT_PUBLIC_URL}/graphql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        cache: 'no-cache',
        body: JSON.stringify({
          query: `query marriage($fatherNatId: String!, $motherNatId: String!){ 
                marriage(maleNatId: $fatherNatId, femaleNatId: $motherNatId) {
                    id
                    mDate
                    children {
                        id
                        firstName
                        birthDate
                    }
                }
            }`,
            variables: {
                fatherNatId,
                motherNatId
            }
        })
    })
    .then((res)=> res.json())
}
