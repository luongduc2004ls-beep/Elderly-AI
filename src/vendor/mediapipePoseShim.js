import * as poseModuleRaw from '../../node_modules/@mediapipe/pose/pose.js';

const poseModule = poseModuleRaw?.default ?? poseModuleRaw;

export const Pose = poseModule?.Pose ?? poseModule?.default?.Pose;
export const Solution = poseModule?.Solution ?? poseModule?.default?.Solution;
export const OptionType = poseModule?.OptionType ?? poseModule?.default?.OptionType;
export const POSE_CONNECTIONS = poseModule?.POSE_CONNECTIONS ?? poseModule?.default?.POSE_CONNECTIONS;
export const POSE_LANDMARKS = poseModule?.POSE_LANDMARKS ?? poseModule?.default?.POSE_LANDMARKS;
export const POSE_LANDMARKS_LEFT = poseModule?.POSE_LANDMARKS_LEFT ?? poseModule?.default?.POSE_LANDMARKS_LEFT;
export const POSE_LANDMARKS_RIGHT = poseModule?.POSE_LANDMARKS_RIGHT ?? poseModule?.default?.POSE_LANDMARKS_RIGHT;
export const POSE_LANDMARKS_NEUTRAL = poseModule?.POSE_LANDMARKS_NEUTRAL ?? poseModule?.default?.POSE_LANDMARKS_NEUTRAL;
export const VERSION = poseModule?.VERSION ?? poseModule?.default?.VERSION;

export default poseModule;
