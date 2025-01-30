import { GraphQLError } from "graphql";

export class MarriageReadError extends GraphQLError {

    constructor(type: MarriageReadErrorType, message: string) {
        super(message);
        this.extensions.name = "MarriageReadError";
        this.extensions.code = 400;
        this.extensions.type = type;
    }

}

export enum MarriageReadErrorType {
    HUSBAND_NOT_FOUND = "HUSBAND_NOT_FOUND",
    WIFE_NOT_FOUND = "WIFE_NOT_FOUND",
    MARRIAGE_CASE_NOT_FOUND = "MARRIAGE_CASE_NOT_FOUND"
}