"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three"; // module 3D principale
import { Canvas } from "@react-three/fiber"; // permet d'utiliser three.js avec react
import { Gltf, Html, KeyboardControls, Sky, useProgress } from "@react-three/drei"; // "extension" de @react-three/fiber, comporte les add-ons de three.js et plus
import { EffectComposer, Bloom } from "@react-three/postprocessing"; // module postprocessing pour @react-three/fiber (effets graphiques)
import { Physics, RigidBody } from "@react-three/rapier"; // Module de physique avec rapier.js concu pour react-three/fiber
import { Perf } from "r3f-perf"; // Module pour afficher les performances
import Ecctrl, { EcctrlAnimation, EcctrlJoystick, useGame } from "ecctrl"; // Module de controle du personnage (sur la base de @react-three/rapier)
import Shader from "./shader"; // import du shader
import Ennemy from "./ennemy"; // import du monstre

// Attribue les touches du clavier au actions (avancer, sauter, attaquer...)
const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "leftward", keys: ["ArrowLeft", "KeyA"] },
  { name: "rightward", keys: ["ArrowRight", "KeyD"] },
  { name: "run", keys: ["Shift"] },
  { name: "jump", keys: ["Space"] },
  { name: "action1", keys: ["KeyF"] },
];

// Attribue les animations du model au actions
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

// Retourn une valeur aleatoire à l'interieur de l'arene
const random = () => {
    const pos = Math.random() < 0.5 ? 1 : -1;
    const val = Math.random() * 12;
    return pos * val
}

const Scene: React.FC = () => {
    // Initialise l'animation du model
    const initAnimationSet = useGame((s) => s.initializeAnimationSet);

    useEffect(() => {
        // Initialise l'animation du model
        initAnimationSet(animationSet);

        // Sers à utiliser le click de la souris pour l'attaque (fonctionne pas)
        const attackEvent = () => {
            const event = new KeyboardEvent("keydown", {
                key: "f",
                code: "KeyF",
                keyCode: 70,
                which: 70,
                bubbles: true,
                cancelable: true
            });

            document.dispatchEvent(event);
        }

        window.addEventListener("mousedown", attackEvent);

        return () => {
            window.removeEventListener("mousedown", attackEvent);
        }
    }, []);

    // Création d'une lumière qui éclaire toute l'arene
    const spotLight = new THREE.SpotLight(0xffffff, 3000);
    spotLight.position.set(-20, 20, -20);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    spotLight.decay = 1.9;
    spotLight.castShadow = true;
    spotLight.shadow.bias = -0.0001;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.radius = 8;

    return (
        <Physics timeStep="vary"> {/* Contexte pour pour ajouter la physique au objet */}

            {/* Lumière ambiante pour éclairer toute l'arene sans les ombres */}
            <ambientLight color={0xffcccc} />
            
            {/* Ajout de la lumière spotLight */}
            <primitive object={spotLight} />

            {/* Ciel bleu avec le soleil */}
            <Sky distance={450000} turbidity={1} inclination={1} />

            {/* Affiche la fenêtre de debug (GPU, CPU, fps...) */}
            <Perf position="top-right" />

            {/* Création des effets de postprocessing */}
            <EffectComposer enableNormalPass>
                {/* Bloom ajoute du réalisme au objet lumineux */}
                <Bloom opacity={0.05} />

                {/* Effet chromatique ou pixelisé, à tester */}
                {/* <ChromaticAberration offset={new THREE.Vector2(0.005, 0.005)} blendFunction={BlendFunction.OVERLAY} radialModulation={false} modulationOffset={0} /> */}
                {/* <Pixelation /> */}
            </EffectComposer>

            {/* Utilisation du clavier pour controler le personnage */}
            <KeyboardControls map={keyboardMap}>
                {/* Module principale pour controler le personnage */}
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
                    {/* Module pour animer le personnage selon les actions */}
                    <EcctrlAnimation characterURL="/player/scene.gltf" animationSet={animationSet}>
                        {/* <Player position={[0, -0.9, 0]} scale={1} /> */}
                        {/* Affiche le personnage, fichier gltf -> /public/player/scene.gltf, téléchargé sur https://sketchfab.com/ */}
                        <Gltf src="/player/scene.gltf" position={[0, -0.9, 0]} scale={1} castShadow receiveShadow />
                    </EcctrlAnimation>
                </Ecctrl>
            </KeyboardControls>

            {/* Utilise RigidBody pour ajouter la physique à l'arene (utiliser colliders="trimesh" pour les fichier 3D) */}
            <RigidBody colliders="trimesh" type="fixed" position={[0, -5, 0]} scale={1}>
                <Gltf src="/map/scene.gltf" receiveShadow castShadow />
            </RigidBody>

            {/* Créer 10 cubes aleatoirement avec une texture perso, fichier jpeg -> /public/box.jpeg */}
            {Array.from({ length: 10 }).map((_, i) => (
                <RigidBody key={i} colliders="cuboid" position={[random(), -11, random()]} >
                    <mesh castShadow receiveShadow>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshBasicMaterial map={new THREE.TextureLoader().load("/box.jpeg")} />
                    </mesh>
                </RigidBody>
            ))}
            
            {/* Affiche le monstre aléatoirement */}
            <Ennemy position={new THREE.Vector3(random(), -12, random())} />

            {/* Affiche le shader, (lave au milieu) */}
            <Shader />

            {/* Groupe pour la sphere verte et le cube d'eau */}
            <group position={[0, -11, 12]}>
                <mesh position={[0, 0, 0]} castShadow>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshBasicMaterial map={new THREE.TextureLoader().load("/water.jpg")} />
                </mesh>

                <mesh position={[2, 0, 0]} castShadow>
                    <sphereGeometry args={[1, 5, 5]} />
                    <meshLambertMaterial color={0x00ff00} wireframe /> {/* wireframe pour afficher uniquement les bordures */}
                </mesh>
            </group>

        </Physics>
    );
}

const Page: React.FC = () => {
    const [started, setStarted] = useState<boolean>(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    return (
        <div className="w-screen h-screen">
            {/* {!started && <Home canvas={canvasRef.current} setStarted={setStarted} />} */}


            {/* Les joysticks pour mobile */}
            <EcctrlJoystick buttonNumber={5} />

            {/* Affiche le canvas (le monde 3D) et demande l'accès au pointeur */}
            <Canvas
                ref={canvasRef}
                gl={{ antialias: false, powerPreference: "high-performance", stencil: false, depth: false }}
                onPointerDown={() => canvasRef.current?.requestPointerLock()}
                shadows
            >
                {/* Suspense permet d'attendre le chargement de toute la scene */}
                <Suspense fallback={null}>
                    <Scene />
                </Suspense>
            </Canvas>
        </div>
    );
}

const Home: React.FC<{ canvas: HTMLCanvasElement, setStarted: React.Dispatch<React.SetStateAction<boolean>> }> = ({ canvas, setStarted }) => {
    const start = () => {
        canvas.requestPointerLock();
        setStarted(true);
    }

    return (
        <div className="fixed inset-0 z-40 w-screen h-screen flex items-center justify-center flex-col gap-y-20" style={{ backgroundImage: "url(/home.png)", backgroundSize: "cover", backgroundPosition: "center" }} >
            <h1 className="text-9xl font-bold">Three.js Demo</h1>
            {canvas ? <button className="btn btn-lg btn-wide" onClick={start}>Start</button> : <span className="loading loading-spinner loading-lg"></span>}
        </div>
    );
}

export default Page;
