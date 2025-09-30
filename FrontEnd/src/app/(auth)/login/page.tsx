'use client'
import { Button, Input, Spinner } from "@nextui-org/react";

import './login-styles.css';
import { useCallback, useState } from "react";
import InputState from "@/types/inputState";
import { decodeJWT, login } from "@/services/client-side/auth.service";
import { useRouter } from "next/navigation";

export default function Login(){

    const [accountId, setAccountId] = useState<InputState>({ value: "", isValid: true, isTouched: false, errorMessage: ""});;
    const [password, setPassword] = useState<InputState>({ value: "", isValid: true, isTouched: false, errorMessage: ""});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const router = useRouter(); 
    
    const checkInputIsEmpty = useCallback(
        (inputState: InputState, setInput: (i: InputState)=> void) => {
            
            let isValid = inputState.isValid
            let errorMessage = inputState.errorMessage;
            
            if(!inputState.value){
                isValid = false;
                errorMessage = "field required please";
            }
            
            setInput({
                ...inputState,
                isTouched: true,
                isValid,
                errorMessage
            });
            
        }
    ,[]);

    return <div className="w-full h-full flex flex-row justify-center items-center">
        <form className="w-fit h-fit">
                <Input 
                    label="Account Id"
                    labelPlacement="outside"
                    placeholder="enter account Id"
                    type="text"
                    maxLength={10}
                    minLength={10}
                    variant="bordered"
                    className="textInput"
                    value={accountId.value as string}
                    isInvalid={!accountId.isValid}
                    errorMessage={accountId.errorMessage}
                    onValueChange={
                        (newValue)=> {
                            setAccountId({ ...accountId, value: newValue});
                        }
                    }
                    onBlur={ ()=>{
                        checkInputIsEmpty(accountId, setAccountId);
                    }}
                    onFocus={() => {
                        setAccountId({
                            ...accountId,
                                isTouched: true,
                                isValid: true,
                                errorMessage: ""
                        });
                    }}
                    
                />
                <br/>
                <Input 
                    label="Password"
                    labelPlacement="outside"
                    placeholder="enter password"
                    type="password"
                    variant="bordered"
                    className="textInput"
                    maxLength={12}
                    value={password.value as string}
                    isInvalid={!password.isValid}
                    errorMessage={password.errorMessage}
                    onValueChange={
                        (newValue)=> {
                            setPassword({ ...password, value: newValue});
                        }
                    }
                    onBlur={ ()=>{
                        checkInputIsEmpty(password, setPassword);
                    }}
                    onFocus={() => {
                        setPassword({
                            ...password,
                                isTouched: true,
                                isValid: true,
                                errorMessage: ""
                        });
                    }}
                />
                <br/>
                
                <Button 
                    className="submit"
                    onClick={()=>{
                        setIsLoading(true);
                        setErrorMsg("");

                        login(Number(accountId.value) , password.value as string)
                        .then( (response)=>{

                            setIsLoading(false);
                            if(response.errors){

                                switch (response.errors[0].message) {
                                    case "INVALID_CREDENTIALS":
                                        setErrorMsg("incorrect account ID or password");
                                        break;
                                
                                    default:
                                        setErrorMsg("log in failed");
                                        break;
                                }
                            }   
                            else{
                                
                                localStorage.setItem('accessToken', response.data.login.accessToken);
                                localStorage.setItem('refreshToken', response.data.login.refreshToken);
                                decodeJWT(response.data.login.accessToken);
                            
                                router.push('/civilians');
                            }
                            

                        })
                    }}
                    isLoading={isLoading}
                    >
                    Log In
                </Button>
                
                {
                    errorMsg && <div className="text-red-500 font-bold text-center pt-5">
                        {errorMsg}
                    </div>
                }


        </form>
    </div> 
}