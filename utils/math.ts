import * as THREE from 'three';

// Constants for the tree shape
const TREE_HEIGHT = 14;
const TREE_RADIUS_BASE = 6;
const SCATTER_RADIUS = 25;

/**
 * Generates a random point inside a sphere
 */
export const getRandomSpherePosition = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};

/**
 * Generates a point on a conical spiral (Christmas Tree shape)
 */
export const getTreePosition = (
  index: number, 
  total: number, 
  yOffset: number = -6,
  randomness: number = 0.5
): THREE.Vector3 => {
  // Normalized height (0 at bottom, 1 at top)
  // We use a non-linear distribution to put more leaves at the bottom
  const yRatio = index / total; 
  const y = yRatio * TREE_HEIGHT;
  
  // Radius decreases as we go up
  const currentRadius = TREE_RADIUS_BASE * (1 - yRatio);
  
  // Golden Angle spiral for distribution
  const theta = index * 2.39996; // Golden angle in radians appx
  
  // Add some noise
  const rNoise = (Math.random() - 0.5) * randomness;
  const finalRadius = currentRadius + rNoise;

  const x = Math.cos(theta) * finalRadius;
  const z = Math.sin(theta) * finalRadius;

  return new THREE.Vector3(x, y + yOffset, z);
};

/**
 * Linear interpolation between two vectors
 */
export const lerpVector3 = (v1: THREE.Vector3, v2: THREE.Vector3, alpha: number): THREE.Vector3 => {
    return new THREE.Vector3().copy(v1).lerp(v2, alpha);
}