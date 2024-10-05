import { ThemeContext } from "@/providers/themeProvider";
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Selection } from "@nextui-org/react";
import { useContext, useState } from "react";
import { themes } from "@/providers/themeProvider";

export function ThemeComponent(){
    const { setTheme, theme } = useContext(ThemeContext);

    return (
        <Dropdown>
            <DropdownTrigger>
                <Button 
                    variant="bordered" 
                    className="bg-primary-light text-primary-darker border-none"
                    >
                    {theme}
                </Button>
            </DropdownTrigger>
            <DropdownMenu 
                aria-label="Single selection example"
                variant="flat"
                disallowEmptySelection
                selectionMode="single"
                selectedKeys={[theme]}
                onSelectionChange={(keys)=> { setTheme(keys.currentKey!) }}
            >
                {
                    themes.map( theme => {
                        return <DropdownItem key={theme}>
                            {theme}
                        </DropdownItem>
                    })
                }
            </DropdownMenu>
        </Dropdown>
    );

}