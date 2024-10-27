"use client";
import Link from "next/link";
import styles from './sideBar.module.css';
import { useEffect, useState } from "react";
import { GoPeople } from "react-icons/go";
import { PiCertificateLight } from "react-icons/pi";
import { ThemeComponent } from "../theme/themeComponent";


const items = [
    {
        href:"/civilians",
        text: "All Civilians",
        icon: <GoPeople></GoPeople>
    },
    {
        href: "/marriage-certificates",
        text: "Marriage Certificates",
        icon: <PiCertificateLight></PiCertificateLight>
    }
];


export function SideBarComponent(){

    const[activeItem, setActiveItem] = useState(-1);
    
    
    useEffect(()=>{
        setActiveItem(items.findIndex((item)=> item.href == window.location.pathname ));
    },[]);



    return <div className={styles.list}>
            <ThemeComponent></ThemeComponent>
            <div>
                {
                    items.map((item,i)=>{
                        return <Link 
                                className={`${styles.listItem} ${activeItem == i? styles.active: ""}`} 
                                href={item.href}
                                onClick={()=>setActiveItem(i)}
                                key={i}
                                >
                            <div className="inline-block align-text-top">{item.icon}</div> {item.text}
                        </Link> 
                    })
                }
            </div>
    </div> 
}