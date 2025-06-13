import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

window.addEventListener("DOMContentLoaded", async () => {
  const startBtn = document.getElementById("start-video");
  const scanOverlay = document.getElementById("scan-overlay");

  // 👇 Fuerza ocultar el overlay apenas inicia
  scanOverlay.style.display = "none";

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: "./target/motocodigo.mind",
    maxTrack: 1
  });

  const { renderer, scene, camera } = mindarThree;
  const anchor = mindarThree.addAnchor(0);

  scene.add(new THREE.AmbientLight(0xffffff, 1));
  const light = new THREE.DirectionalLight(0xffffff, 0.5);
  light.position.set(1, 2, 1);
  scene.add(light);

  const loader = new GLTFLoader();
  loader.load("./assets/tb1.glb", (gltf) => {
    const tablet = gltf.scene;
    tablet.scale.set(0.01, 0.01, 0.01); // Animación: inicia pequeño
    tablet.rotation.set(Math.PI / 2, Math.PI, 0);
    tablet.position.set(0, 0.05, 0);
    tablet.visible = false;
    anchor.group.add(tablet);

    const video = document.createElement("video");
    video.src = "./assets/videomotor.mp4";
    video.crossOrigin = "anonymous";
    video.loop = false;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("preload", "auto");


    // Crear material negro inicialmente
/*const blackMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
const geometry = new THREE.PlaneGeometry(2.2, 1.2);
const videoPlane = new THREE.Mesh(geometry, blackMaterial);
videoPlane.rotation.x = Math.PI / 2;
videoPlane.scale.x = -1;
videoPlane.position.set(0, 0.12, 0);
tablet.add(videoPlane);

// Cuando se reproduzca el video, reemplazar el material
video.addEventListener("play", () => {
  const texture = new THREE.VideoTexture(video);
  texture.encoding = THREE.sRGBEncoding;
  videoPlane.material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
});*/

    
    const texture = new THREE.VideoTexture(video);
    texture.encoding = THREE.sRGBEncoding;

    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    //const geometry = new THREE.PlaneGeometry(2.2, 1.2);
    const geometry = new THREE.PlaneGeometry(2.5, 1.4);
    const videoPlane = new THREE.Mesh(geometry, material);
    videoPlane.rotation.x = Math.PI / 2;
    videoPlane.scale.x = -1;
    videoPlane.position.set(0, 0.25, 0);
    tablet.add(videoPlane);

    // Animación de aparición
    let animating = false;
    let animationProgress = 0;
    const targetScale = new THREE.Vector3(0.5, 0.5, 0.5);
    const initialScale = new THREE.Vector3(0.01, 0.01, 0.01);
    const easeOutCubic = (t) => (--t) * t * t + 1;

    let targetHasBeenSeen = false;

    anchor.onTargetFound = () => {
      scanOverlay.style.display = "none";
      tablet.visible = true;
      animationProgress = 0;
      animating = true;
      targetHasBeenSeen = true; // ✅ Marcamos que ya se vio por primera vez
      if (video.paused || video.ended) {
        startBtn.style.display = "block";
      }
    };
  
    anchor.onTargetLost = () => {
      tablet.visible = false;
      video.pause();
      video.currentTime = 0;
      startBtn.style.display = "none";
    
      if (targetHasBeenSeen) {
        scanOverlay.style.display = "flex"; // ✅ Mostrar escaneo después de la 1ra detección
      }
    };
    
  

    startBtn.addEventListener("click", async () => {
      try {
        await video.play();
        video.muted = false;
        startBtn.style.display = "none";
      } catch (err) {
        alert("Toca nuevamente para iniciar el video.");
        console.error(err);
      }
    });

    renderer.setAnimationLoop(() => {
      if (animating && animationProgress < 1) {
        animationProgress += 0.02;
        const eased = easeOutCubic(animationProgress);
        tablet.scale.lerpVectors(initialScale, targetScale, eased);
        tablet.rotation.z = Math.PI * (1 - eased);
      }
      renderer.render(scene, camera);
    });
  });

  await mindarThree.start();
});
