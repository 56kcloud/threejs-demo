import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import { extend, useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";

const LavaMaterial = shaderMaterial(
    {
        time: 0,
        color: new THREE.Color(0xff0000),
        texture1: null,
        texture2: null,
    },
    `
    uniform float time;
    varying vec2 vUv;
    void main() {
        vUv = uv;
        vec3 pos = position;
        pos.z += sin(pos.x * 10.0 + time * 5.0) * 0.2;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
    `,
    `
    uniform float time;
    uniform vec3 color;
    uniform sampler2D texture1;
    uniform sampler2D texture2;
    varying vec2 vUv;
    void main() {
        vec2 uv1 = vUv;
        vec2 uv2 = vUv;
        uv1.y += time * 0.05;
        uv2.y -= time * 0.05;
        vec4 lava = texture2D(texture1, uv1);
        vec4 mask = texture2D(texture2, uv2);
        gl_FragColor = mix(lava, vec4(color, 1.0), mask.r);
    }
    `
);

extend({ LavaMaterial });

const Shader = () => {
    const ref = useRef();
    const [texture1, texture2] = useLoader(TextureLoader, [
        "/lava.png",
        "/lava.png",
    ]);

    useFrame(({ clock }) => {
        // @ts-ignore
        if (ref.current) ref.current.time = clock.getElapsedTime()
    });

    return (
        <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <sphereGeometry args={[1, 0.4, 16, 100]} />
            {/* @ts-ignore */}
            <lavaMaterial ref={ref} texture1={texture1} texture2={texture2} />
        </mesh>
    );
};

export default Shader;
