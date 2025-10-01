import { promisify } from "util";
const dns = require("dns");

/**
 * this project uses SRV records for services, as we 
 * are deploying to a cluster of machines
 */
type SRVRecord = {
    port: number,
    name: string,
    weight: number,
    priority: number,
}

type CacheRecord = {
    srvRecords: SRVRecord[];
    isBlocked: boolean;
    next: number;  //round robbin index to use
    ttl: number;
    lookedAt: number;   // timestamp of lookup operation 
}

class DnsCache {

    private cache: {
        [name: string] : CacheRecord 
    } = {}
 
    constructor(){
    }

    async resolve(dnsName: string){

        if(!this.cache[dnsName]){
            await this.callDnsResolv(dnsName);
        }

        if(this.cache[dnsName].isBlocked)
            throw new Error("SERVICE_BLOCKED");


        // select service instance
        const index = this.cache[dnsName].next; // get index
        
        //rotate next index
        this.cache[dnsName].next =
            ( this.cache[dnsName].next + 1 ) % this.cache[dnsName].srvRecords.length
        
        const address = this.cache[dnsName].srvRecords[index].name + ":" +
                        this.cache[dnsName].srvRecords[index].port;

        console.log("cached addresses are ,", this.cache[dnsName]);
        console.log("index: ", index);

        return address;
    }

    isServiceBlocked(dnsName: string){
        return this.cache[dnsName].isBlocked;
    }

    blockService(dnsName: string){
        if(this.cache[dnsName])
        this.cache[dnsName].isBlocked = true;
    }

    remove(dnsName: string){
        delete this.cache[dnsName];
    }

    private callDnsResolv(dnsName: string){
        
        const resolvSrv = promisify(dns.resolveSrv);

        return resolvSrv(dnsName)
            .then((addresses: SRVRecord[])=>{
                console.log("new DNS call ", dnsName);
                if(!addresses || !addresses.length)
                    throw new Error("NO_INSTANCE_FOUND");

                this.cache[dnsName] = {
                    ...this.cache[dnsName],
                    srvRecords: addresses,
                    next: 0,
                    ttl: 15000,
                    lookedAt: Date.now()
                }

                console.log("addresses resolved successfully, ", addresses);
            });
    }
}

const dnsCache = new DnsCache();
export default dnsCache;
