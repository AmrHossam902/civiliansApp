import Person from "@/dtos/Person";
import { DateValue } from "@nextui-org/react"

type InputState = {
    value: Person | string | DateValue | null,
    isValid: boolean,
    errorMessage: string,
    isTouched: boolean
}

export default InputState;
