'use client';
import { Controls, Edge, Handle, Node, Position, ReactFlow, useEdgesState, useNodesState } from '@xyflow/react';
import maleAvatar from "@/assets/male-avatar.png";
import femaleAvatar from "@/assets/female-avatar.png";
import Image from 'next/image';
 
import '@xyflow/react/dist/style.css';
import { useEffect, useMemo } from 'react';
import Person from '@/interfaces/Person';

import styles from './familyTree.module.css'
import GraphBuilder from './graphBuilder';

const initialNodes: Node[] = [];
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
        const builder = new GraphBuilder();
        builder.build(person);

        setNodes(builder.allNodes);
        setEdges(builder.allEdges);

    }, []);

    return (
        <div className='w-4/5 h-4/5 m-auto'>
            <ReactFlow 
                nodeTypes={nodeTypes}
                nodes={nodes} 
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                minZoom={0.01}
                >
                <Controls/>
            </ReactFlow>
        </div>
      );
}


function PersonNode({data}: {data: {gender: string, name: string}}) {
    return <div className={styles.person}>
            { data.gender == "MALE" && <Image className={styles.image} src={maleAvatar} alt='m-av'></Image>}
            { data.gender == "FEMALE" && <Image className={styles.image} src={femaleAvatar} alt='m-av'></Image>}
            <div >
                {data.name}
            </div>

            <Handle className={styles.handle} type='target' id="top" position={Position.Top}></Handle>
            <Handle className={styles.handle} type='source' id="bottom" position={Position.Bottom}></Handle>
        </div>
}



function MarriageNode() {
    return <div style={{ 
            width: "3em",
            height: "3em",
            border: "2px solid green"
        }}>
            <Handle type='target' id="top" position={Position.Top}></Handle>   
            marriage
            <Handle type='source' id="bottom" position={Position.Bottom}></Handle>
        </div>
}



