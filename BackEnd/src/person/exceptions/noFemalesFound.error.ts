export class NoFemalesFound extends Error {
    constructor(){
        super("no males found in this bucket");
    }
}