import * as THREE from 'three'
import { mergeBufferGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils'
import { createNoise2D } from 'simplex-noise';
import alea from 'alea';

const noise2D = createNoise2D(alea(fxrand() * 99999));

function getHexGeo(height, position) {
    const geo = new THREE.CylinderGeometry(1, 1, height, 6, 1, false)
    geo.translate(position.x, height * 0.5, position.y)
    return geo
}

function createHex(height, position, geometries) {
    const newGeo = getHexGeo(height, position)
    return mergeBufferGeometries([geometries, newGeo])
}

function getTilePos(x, y) {
    return new THREE.Vector2((x + (y % 2) * 0.5) * 1.77, y * 1.535)
}

function createMap(x, y, maxHeight, maxHex) {
    let geometries = new THREE.BoxGeometry(0, 0, 0)
    for (let i = -x; i <= x; i++) {
        for (let j = -y; j <= y; j++) {

            let noise = (noise2D(i * 0.1, j * 0.1) + 1) * 0.5
            noise = Math.pow(noise, 1.5)

            const pos = getTilePos(i, j)
            if (pos.length() > maxHex) continue

            geometries = createHex(noise * maxHeight, pos, geometries)
        }
    }
    return geometries
}

function createMesh(envmap, geometries) {
    const material = new THREE.MeshPhysicalMaterial({
        // envMap: envmap,
        // envMapIntensity: 0.135,
        // ior: 1.5,
        // transmission: 1.2,
        // transparent: true,
        // thickness: 0,
        metalness: 0.6,
        roughness: 0,
        flatShading: true
    })
    const hexMesh = new THREE.Mesh(
        geometries,
        material
    )
    hexMesh.castShadow = true
    hexMesh.receiveShadow = true
    
    return hexMesh
}

export { createMap, createMesh}