'use client';
import { Background, Controls, Edge, Node, ReactFlow, getNodesBounds, getViewportForBounds, useEdgesState, useNodesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEffect, useMemo } from 'react';
import Person from '@/interfaces/Person';

import GraphBuilder from './graphBuilder';


import { MarriageComponent } from '../marriage/MarriageComponent';
import { PersonComponent } from '../person/PersonComponent';

import styles from './familyTree.module.css';
import { Button } from '@nextui-org/react';
import { toPng } from 'html-to-image';

const initialNodes: Node[] = [];
  const initialEdges: Edge[] = [/* { id: 'e1-2', source: '1', target: '2' } */];

export default function FamilyTreeComponent({ person }: {person: Person}){

    const nodeTypes = useMemo(
        () => (
            {
                "person" : PersonComponent,
                "marriage" : MarriageComponent

            })
        ,[]);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    
    function exportImage(){
        const imageWidth = 1280;
        const imageHeight = 960;
        const padding = 100;
        const nodesBounds = getNodesBounds(nodes);
        const scale = Math.min( (imageHeight -padding) / nodesBounds.height, (imageWidth -padding) / nodesBounds.width);
        const viewport = getViewportForBounds(
            nodesBounds,
            imageWidth,
            imageHeight,
            scale,
            scale,
            padding
          );

          toPng(document.querySelector('.react-flow__viewport') as HTMLElement, {
            backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-lighter'),
            width: imageWidth,
            height: imageHeight,
            style: {
                transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
            },
            pixelRatio: 1
          }).then((imageUrl)=>{
                const a = document.createElement('a');
                a.setAttribute('download', 'reactflow.png');
                a.setAttribute('href', imageUrl);
                a.click();
          });
    }

    useEffect(()=>{
        const builder = new GraphBuilder();
        builder.build(person);

        setNodes(builder.allNodes);
        setEdges(builder.allEdges);

    }, []);

    return (
        <div className={styles.pageContainer}>
            <div className={styles.flowContainer}>
                <ReactFlow 
                    nodeTypes={nodeTypes}
                    nodes={nodes} 
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onInit={(instance)=> instance.fitView() }
                    minZoom={0.01}
                    >
                    <Controls/>
                </ReactFlow>
            </div>
            <Button 
                className='bg-secondary text-primary-lighter'
                onClick={()=> exportImage() }
                >export as png
            </Button>
        </div>
      );
}







