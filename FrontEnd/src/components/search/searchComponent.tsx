import { Input } from "@nextui-org/react";
import { useRef } from "react";
import { FaSearch } from "react-icons/fa";

type Props = {
    onChange: (v: string)=> void
}

export function SearchComponent({ onChange }: Props){

    const timer = useRef<NodeJS.Timeout>();

    function onSearchChange(newValue:string){
        clearTimeout(timer.current);
        timer.current = setTimeout(()=>{ onChange(newValue); }, 1000);
    }

    return  <div>
                <Input
                    isClearable
                    type="text"
                    placeholder="search..."
                    startContent={
                        <FaSearch />
                    }
                    classNames={
                        {
                            inputWrapper: [
                                "bg-primary-lighter",
                                "!text-primary-darker",
                                "hover:!bg-primary-light",
                                "focus-within:!bg-primary-light"
                            ],
                            input: [
                                "placeholder:text-primary-darker",
                                "!text-primary-darker"
                            ]
                        }
                    }
                    onValueChange={onSearchChange}
                />
    </div>
}

