import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgpu";

let backendLoaded = false;

export function isBackendLoaded() {
  return backendLoaded;
}

tf.setBackend("webgpu").then(() => (backendLoaded = true));

export { TweetGenerator, Vocabulary } from "./model";
