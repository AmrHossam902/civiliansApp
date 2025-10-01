import dnsCache from "./dns-cache";



export async function SendRequestOnServer(reqObject: Object){

    /**
     * when using dev mode, it should return address used in compose
     */
    if(process.env.IS_DEV)
        return fetch(process.env.BACKEND_INTERNAL_URL + "/graphql", reqObject)
            .then( res => res.json() );


    /**
     * retry loop 
     *      - failure 3 times causes all api requests to block for ttl
     *      - handle failure according to graph
     */
    let response;

    for(let i=0; i<3; i++){

        try {
            
            // ask DnsCache for instance to call (abstract it for local & prod)
            let address = await dnsCache.resolve("gql-api-service.my-namespace"); // resolve has to check for blockage   
                                                            // resolve has to do rotation

            response = await fetch("http://" + address+ "/graphql", reqObject)
            .then( res => res.json() );

            break;

        } catch (error:any) {

            console.error("calling attempt failed ", error);

            // SERVICE_BLOCKED (blocked)
            if(error.message == "SERVICE_BLOCKED")
                throw new Error("SERVICE_TEMP_UNAVAILABLE", {cause: error});

            // NO_INSTANCE_FOUND (can't find an instance now try later)
            if(error.message == "NO_INSTANCE_FOUND"){
                // no cache record will exist 
                throw new Error("SERVICE_TEMP_UNAVAILABLE", {cause: error});
            }
                

            // ENOTFOUND  means there were an instance and it was killed ==> redo dns
            if(error.errno == "ENOTFOUND")
                dnsCache.remove("gql-api-service.my-namespace");


            // check if third attempt
            if(i == 2){
                dnsCache.blockService("gql-api-service.my-namespace");
                setTimeout(()=>{ dnsCache.remove("gql-api-service.my-namespace") }, 15000);
            }

        }
    }

    return response;
    
}