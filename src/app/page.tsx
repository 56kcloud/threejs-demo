"use client";

import { Suspense, useEffect, useRef } from "react";
import * as THREE from "three"; // 3D package
import { Canvas } from "@react-three/fiber"; // Can use three.js in react
import { Gltf, KeyboardControls, Sky } from "@react-three/drei"; // "extension" of @react-three/fiber, got add-ons of three.js and more
import { EffectComposer, Bloom, Selection, Outline, Select } from "@react-three/postprocessing"; // postprocessing package for @react-three/fiber
import { Physics, RigidBody } from "@react-three/rapier"; // Physics package with rapier.js made for react-three/fiber
import { Perf } from "r3f-perf"; // Package for performance
import Ecctrl, { EcctrlAnimation, EcctrlJoystick, useGame } from "ecctrl"; // Package to control character (based on @react-three/rapier)
import Shader from "./shader"; // import shader
import Ennemy from "./ennemy"; // import monstere
import ShotCube from "./shoot";

// Set keys to actions (go forward, jump, attack...)
const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
  { name: "rightward", keys: ["ArrowRight", "KeyD"] },
  { name: "run", keys: ["Shift"] },
  { name: "jump", keys: ["Space"] },
  { name: "action1", keys: ["KeyF"] },
];

// Set animations to actions
const animationSet = {
  idle: "rig|Idel",
  walk: "rig|Walck",
  run: "rig|Run",
  jump: "rig|Idel",
  jumpIdle: "rig|Walck",
  jumpLand: "rig|Idel",
  fall: "rig|Idel",
  action1: "rig|Attack_1",
};

// Return a random position inside the arena
const random = () => {
    const pos = Math.random() < 0.5 ? 1 : -1;
    const val = Math.random() * 12;
    return pos * val
}

const Scene: React.FC = () => {
    const player = useRef<THREE.Group>(null!);

    const initAnimationSet = useGame((s) => s.initializeAnimationSet);

    useEffect(() => {
        // Initialize the animation of the character
        initAnimationSet(animationSet);
    }, []);

    // Create a light that light all the scene with shadows
    const spotLight = new THREE.SpotLight(0xffffff, 3000);
    spotLight.position.set(-20, 20, -20);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    spotLight.decay = 1.9;
    spotLight.castShadow = true;
    spotLight.shadow.bias = -0.0001;
    spotLight.shadow.radius = 8;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.camera.near = 0.5;
    spotLight.shadow.camera.far = 500;

    return (
        <Physics timeStep="vary"> {/* Context for using physics */}

            {/* Ambient light to light up the scene */}
            <ambientLight color={0xffcccc} />
            
            {/* Add spotLight */}
            <primitive object={spotLight} />

            {/* Blue sky with sun */}
            <Sky distance={450000} turbidity={1} inclination={1} />

            {/* Display debug window (GPU, CPU, fps...) */}
            <Perf position="top-right" />

            {/* Création des effets de postprocessing */}
            <EffectComposer enableNormalPass>
                {/* Add bloom to luminous object */}
                <Bloom opacity={0.05} />

                {/* Chromatic ou pixelated effect */}
                {/* <ChromaticAberration offset={new THREE.Vector2(0.005, 0.005)} blendFunction={BlendFunction.OVERLAY} radialModulation={false} modulationOffset={0} /> */}
                {/* <Pixelation /> */}
            </EffectComposer>

            {/* use the keyboard to move the character */}
            <KeyboardControls map={keyboardMap}>
                {/* Package to control the character */}
                <Ecctrl
                    camInitDis={-3}
                    camMaxDis={-3}
                    camMinDis={-3}
                    turnSpeed={10}
                    turnVelMultiplier={1}
                    jumpVel={4}
                    maxVelLimit={4}
                    sprintMult={2}
                    camMoveSpeed={0.75}
                    animated
                >
                    {/* Packages to animate the character */}
                    <EcctrlAnimation characterURL="/player/scene.gltf" animationSet={animationSet}>
                        <group ref={player}>
                            {/* Display the character, gltf file -> /public/player/scene.gltf, downloaded on https://sketchfab.com/ */}
                            <Gltf src="/player/scene.gltf" position={[0, -0.9, 0]} scale={1} castShadow receiveShadow />
                        </group>
                    </EcctrlAnimation>
                </Ecctrl>
            </KeyboardControls>

            {/* Use RigidBody to add physics to the arena (use colliders="trimesh" for 3D files like GLTF) */}
            <RigidBody colliders="trimesh" type="fixed" position={[0, -5, 0]} scale={1}>
                <Gltf src="/map/scene.gltf" receiveShadow castShadow />
            </RigidBody>

            {/* Create 10 cubes with random position with wood texture, fichier jpeg -> /public/box.jpeg */}
            {Array.from({ length: 10 }).map((_, i) => (
                <RigidBody key={i} colliders="cuboid" position={[random(), -11, random()]} >
                    <mesh castShadow receiveShadow>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshBasicMaterial map={new THREE.TextureLoader().load("/box.jpeg")} />
                    </mesh>
                </RigidBody>
            ))}

            {/* Cube tower */}
            <RigidBody position={[0, -11, 0]}>
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshBasicMaterial map={new THREE.TextureLoader().load("/box.jpeg")} />
                </mesh>
            </RigidBody>
            <RigidBody position={[0, -10, 0]}>
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshBasicMaterial map={new THREE.TextureLoader().load("/box.jpeg")} />
                </mesh>
            </RigidBody>
            <RigidBody position={[0, -9, 0]}>
                <mesh castShadow receiveShadow>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshBasicMaterial map={new THREE.TextureLoader().load("/box.jpeg")} />
                </mesh>
            </RigidBody>

            {/* Display the monster */}
            <Selection>
                <EffectComposer autoClear={false}>
                    <Outline blur />
                </EffectComposer>
                <Select enabled>
                    <Ennemy position={new THREE.Vector3(random(), -12, random())} />
                </Select>
            </Selection>

            {/* Display a lava shader (at the center) */}
            <Shader />

            {/* Shoot blue sphere */}
            <ShotCube player={player} />

            {/* Group for green sphere and water cube */}
            {/* <group position={[0, -11, 12]}>
                <mesh position={[0, 0, 0]} castShadow>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshBasicMaterial map={new THREE.TextureLoader().load("/water.jpg")} />
                </mesh>

                <mesh position={[2, 0, 0]} castShadow>
                    <sphereGeometry args={[1, 5, 5]} />
                    <meshLambertMaterial color={0x00ff00} wireframe />
                </mesh>
            </group> */}

        </Physics>
    );
}

const Page: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    return (
        <div className="w-screen h-screen">

            {/* Joystick for mobile */}
            <EcctrlJoystick buttonNumber={5} />

            {/* Dosplay the canvas and request pointer lock */}
            <Canvas
                ref={canvasRef}
                gl={{ antialias: false, powerPreference: "high-performance", stencil: false, depth: false }}
                camera={{  }}
                onPointerDown={() => canvasRef.current?.requestPointerLock()}
                shadows
            >
                {/* Suspense wait till everything is loaded */}
                <Suspense fallback={null}>
                    <Scene />
                </Suspense>
            </Canvas>
        </div>
    );
}

export default Page;
