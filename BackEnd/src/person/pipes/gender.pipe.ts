import { Person } from "../models/Person";

export default function genderPipe(personData: Record<string, any>) {
    if(personData?.gender) {
        return {
            ...personData, 
            gender : personData.gender == "MALE" ? 1: 0
        }
    }
    return personData;
}