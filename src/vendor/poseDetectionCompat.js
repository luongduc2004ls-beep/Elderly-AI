import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const poseDetection = require('@tensorflow-models/pose-detection');

export const SupportedModels = poseDetection.SupportedModels;
export const createDetector = poseDetection.createDetector;
export const movenet = poseDetection.movenet;

export default poseDetection;
