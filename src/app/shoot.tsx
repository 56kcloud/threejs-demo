import * as THREE from "three";
import { RapierRigidBody, RigidBody } from "@react-three/rapier";
import { useRef, useMemo, useState, useEffect } from "react";
import { Trail } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

const ShotCube: React.FC<{ player: React.MutableRefObject<THREE.Group> }> = ({ player }) => {
    const { camera } = useThree();
    const [cubeMesh, setCubeMesh] = useState<JSX.Element[]>([]);
    const cubeRef = useRef<RapierRigidBody>(null!);

    const position = useMemo(() => new THREE.Vector3(), []);
    const direction = useMemo(() => new THREE.Vector3(), []);

    const clickToCreateBox = () => {        
        if (document.pointerLockElement) {
            const camPos = player.current.getWorldPosition(position);
            const camQuat = player.current.getWorldQuaternion(new THREE.Quaternion());
            
            const d = 2;
            const v = new THREE.Vector3(0, 0, 0.5);
            v.applyQuaternion(camQuat);
            v.multiplyScalar(d);
            position.copy(camPos).add(v);
    
            const newMesh = (
                <mesh
                    position={[position.x, position.y + .1, position.z]}
                    scale={0.5}
                    castShadow
                    receiveShadow
                >
                    <sphereGeometry args={[0.05]} />
                    <meshStandardMaterial color={0xaaaaff} />
                </mesh>
            );
            setCubeMesh((prevMeshes) => [...prevMeshes, newMesh]);
        }
    };

    useEffect(() => {
        player.current.getWorldDirection(direction);
        if (cubeMesh.length > 0) {
            cubeRef.current?.setLinvel(
                new THREE.Vector3(
                    direction.x * 30,
                    direction.y * 30,
                    direction.z * 30
                ),
                false
            );
        }
    }, [cubeMesh]);

    useEffect(() => {
        window.addEventListener("click", () => clickToCreateBox());

        return () => {
            window.removeEventListener("click", () => clickToCreateBox());
        };
    }, []);

    return (
        <>
            {cubeMesh.map((item, i) => (
                <RigidBody key={i} colliders="ball" gravityScale={0} ref={cubeRef}>
                    <Trail width={2} color={0xaaaaff} attenuation={w => w - 0.2}>
                        {item}
                    </Trail>
                </RigidBody>
            ))}
        </>
    );
}

export default ShotCube;
