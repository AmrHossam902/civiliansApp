import { SideBarComponent } from "@/components/sidebar/sideBarComponent";
import { ReactNode } from "react";
import styles from './layout-styles.module.css';

type Props = Readonly<{ children: ReactNode }>

export default function DashboardLayout({children}: Props){
    return <div className={styles.mainLayout}>
              <div className={styles.sideBar}>
                <SideBarComponent></SideBarComponent>
              </div>
              <div className={styles.pageContent}>
                {children}  
              </div>
        </div>
}