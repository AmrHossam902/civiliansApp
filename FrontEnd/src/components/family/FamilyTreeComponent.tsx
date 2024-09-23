'use client';
import { Controls, Edge, Handle, Node, Position, ReactFlow, useEdgesState, useNodesState } from '@xyflow/react';
import maleAvatar from "@/assets/male-avatar.png";
import femaleAvatar from "@/assets/female-avatar.png";
import Image from 'next/image';
 
import '@xyflow/react/dist/style.css';
import { useEffect, useMemo, useRef } from 'react';
import Person from '@/interfaces/Person';

import styles from './familyTree.module.css'
import GraphBuilder from './graphBuilder';

const initialNodes: Node[] = [
/*     { 
        id: '1', 
        position: { x: 100, y: 0 }, 
        type: 'person', 
        data: { label: '1' },

    },
    */
    { 
        id: '2', 
        position: { x: 200, y: 400 },
        type: 'person', 
        data: { 
            label: '2',
            gender: 'male' } 
    } 
  ];
  const initialEdges: Edge[] = [/* { id: 'e1-2', source: '1', target: '2' } */];

export default function FamilyTreeComponent({ person }: {person: Person}){

    const nodeTypes = useMemo(
        () => (
            {
                "person" : PersonNode,
                "marriage" : MarriageNode

            })
        ,[]);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    useEffect(()=>{
        new GraphBuilder()
        .build(person);
    }, []);

    return (
        <div className='w-4/5 h-4/5 m-auto'>
            <ReactFlow 
                nodeTypes={nodeTypes}
                nodes={nodes} 
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                >
                <Controls/>
            </ReactFlow>
        </div>
      );
}


function PersonNode({data}: any) {
    return <div className={styles.person}>
            <Image className={styles.image} src={maleAvatar} alt='m-av'></Image>
            <div ></div>

            <Handle className={styles.handle} type='target' position={Position.Top}></Handle>
            <Handle className={styles.handle} type='source' position={Position.Right}></Handle>
            <Handle className={styles.handle} type='source' position={Position.Left}></Handle>
        </div>
}



function MarriageNode() {
    return <div style={{ 
            width: "3em",
            height: "3em",
            border: "2px solid green"
        }}>
            <Handle type='target' position={Position.Left}></Handle>
            <Handle type='target' position={Position.Right}></Handle>
            marriage
            <Handle type='source' position={Position.Bottom}></Handle>
        </div>
}



