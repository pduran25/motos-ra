import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

document.addEventListener("DOMContentLoaded", async () => {

  // Cargar MindAR desde CDN y acceder a la variable global
  await import("https://cdn.jsdelivr.net/npm/mind-ar@1.1.4/dist/mindar-image-three.prod.js");
  const { MindARThree } = window.MINDAR.IMAGE;

  const mindarThree = new MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: "/target/moto.mind",
    maxTrack: 1,
  });

  const { renderer, scene, camera } = mindarThree;
  const anchor = mindarThree.addAnchor(0);

  // Cargar el modelo de tablet
  const loader = new GLTFLoader();
  const gltf = await loader.loadAsync("/assets/tablet.glb");
  const tablet = gltf.scene;
  tablet.scale.set(0.5, 0.5, 0.5);
  anchor.group.add(tablet);

  // Crear video
  const video = document.createElement("video");
  video.src = "/assets/videomotor.mp4";
  video.crossOrigin = "anonymous";
  video.loop = true;
  video.muted = false;
  video.playsInline = true;
  await video.load();

  const videoTexture = new THREE.VideoTexture(video);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.6, 0.35),
    new THREE.MeshBasicMaterial({ map: videoTexture })
  );
  screen.position.set(0, 0.12, 0.08);
  tablet.add(screen);

  // Al hacer clic en cualquier parte de la escena
  window.addEventListener("click", () => {
    if (video.paused) video.play();
    else video.pause();
  });

  // Overlay
  const overlay = document.getElementById("overlay");
  anchor.onTargetFound = () => overlay.innerText = "✅ Imagen detectada";
  anchor.onTargetLost = () => {
    overlay.innerText = "📷 Apunta a la imagen target para iniciar";
    video.pause();
  };

  // Iniciar MindAR
  await mindarThree.start();
  renderer.setAnimationLoop(() => renderer.render(scene, camera));
});
