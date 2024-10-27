import { DateValue } from "@nextui-org/react"

type InputState = {
    value: string | DateValue | null,
    isValid: boolean,
    errorMessage: string,
    isTouched: boolean
}

export default InputState;
