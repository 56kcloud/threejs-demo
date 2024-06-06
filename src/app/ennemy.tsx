import * as THREE from "three";
import { Gltf } from "@react-three/drei";
import { useRef } from "react";

const Ennemy: React.FC<Partial<THREE.Group>> = (props) => {
    const gltf = useRef<THREE.Group>(null!);;

    return (
        <>
            {/* @ts-ignore */}
            <group ref={gltf} {...props}>
                <Gltf src="/ennemy/scene.gltf" castShadow receiveShadow />
            </group>
        </>
    );
}

export default Ennemy;
