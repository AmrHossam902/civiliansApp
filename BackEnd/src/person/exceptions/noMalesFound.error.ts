export class NoMalesFound extends Error {
    constructor(){
        super("no males found in this bucket");
    }
}