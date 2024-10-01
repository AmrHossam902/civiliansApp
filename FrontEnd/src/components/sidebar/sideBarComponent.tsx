'use client';
import { Listbox, ListboxItem } from "@nextui-org/react";
import Link from "next/link";


export function SideBarComponent(){

    return <div className="bg-primary-background">
        <Link href="/civilians" key={1}>all civilians</Link>
        <Link href="/marriage-certificates" key={2}>all certs</Link>
    </div> 
    
    {/* <Listbox>
            <ListboxItem key={1} >
                <Link href="/civilians">all civilians</Link>
            </ListboxItem>
            <ListboxItem key={2} >
                <Link href="/marriage-certificates">all certs</Link>
            </ListboxItem>
        </Listbox> */};
}