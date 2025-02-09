import { Sequelize, DataTypes, Utils } from 'sequelize'
const crypto = require('crypto');


export class UUIDV7 extends DataTypes.ABSTRACT {
    // Mandatory: complete definition of the new type in the database
    key: string = "UUIDV7";

    constructor(){
        super()
        console.log("new type created");
    }
    
    toSql() {
        return 'BINARY(16)';
    }

    static isUUIDv7(val: string){
        return /^([0-9a-f]){8}-([0-9a-f]){4}-7([0-9a-f]){3}-([0-9a-f]){4}-([0-9a-f]){12}$/
        .test(val);
    }

    // Optional: value stringifier before sending to database
    static _stringify(value): Buffer {
        if(this.isUUIDv7(value))
            return Buffer.from(value.replace(/-/g, ''), 'hex');
        throw new Error("invalid UUID");
    }

    // Optional: parser for values received from the database
    static parse(value: Buffer): string {
        
        if(value.length !== 16)
            throw new Error('Invalid UUID Buffer');

        const uuidString = value.toString('hex');
        return uuidString.slice(0, 8) + '-' + 
            uuidString.slice(8, 12) + '-' + 
            uuidString.slice(12, 16) + '-' + 
            uuidString.slice(16, 20) + '-' + 
            uuidString.slice(20, 32);
    }

    toString(options: object): string {
        return "UUIDV7"
    }

    static generateUUIDv7(): Buffer{
        // Step 1: Get timestamp in milliseconds (big-endian 48-bit)
        const timestamp = Date.now(); // Current time in ms
        const randomNumber = Math.floor(Math.random() * 1000000);
    
        let timestampBytes = Buffer.alloc(6);
        timestampBytes.writeUIntBE(timestamp, 0, 6);  
    
    
        // Step 2: Generate random bytes
        const randomBytes = crypto.randomBytes(10);
    
        // Step 3: Set the UUID version (UUIDv7 -> Version 7 is 0b0111)
        randomBytes[0] = (randomBytes[0] & 0x0F) | 0x70; // Set version 7
    
        // Step 4: Set the variant (RFC 4122 variant: 0b10xx xxxx)
        randomBytes[2] = (randomBytes[2] & 0x3F) | 0x80; // Set variant to 10xxxxxx
    
        // Step 5: Concatenate timestamp and random bytes
        const uuidBuffer = Buffer.concat([timestampBytes, randomBytes]);
    
        return uuidBuffer; 
    }
    
}

UUIDV7.prototype.key = UUIDV7.key = 'UUIDV7';
(DataTypes as any).UUIDV7 = Utils.classToInvokable(UUIDV7);
