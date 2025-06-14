import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

window.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const selectedMoto = urlParams.get("moto");
  const motoLabel = document.getElementById("moto-label");

  const motoImgs = {
    "1": "videoapache160.png",
    "2": "videoapache200.png",
    "3": "videosport100.png",
    "4": "videoraider125.png",
    "5": "videostryker125.png"
  };

  if (selectedMoto) {
    motoLabel.src = `./assets/${motoImgs[selectedMoto]}`;
    motoLabel.style.display = "block";
  }

  const arContainer = document.getElementById("ar-container");
  const landing = document.getElementById("landing");
  const startBtn = document.getElementById("start-video");
  const backButton = document.getElementById("back-button");
  const scanOverlay = document.getElementById("scan-overlay");

  if (!selectedMoto) {
    landing.style.display = "flex";
    arContainer.style.display = "none";
    startBtn.style.display = "none";
    backButton.style.display = "none";
    scanOverlay.style.display = "none";
    return;
  } else {
    landing.style.display = "none";
    arContainer.style.display = "block";
    backButton.style.display = "block";
  }

  backButton.addEventListener("click", () => {
    window.location.href = window.location.pathname; // Quitar parámetros y volver
  });

  scanOverlay.style.display = "none";

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: arContainer,
    imageTargetSrc: `./target/motocodigo${selectedMoto}.mind`,
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
    tablet.scale.set(0.01, 0.01, 0.01);
    tablet.rotation.set(Math.PI / 2, Math.PI, 0);
    tablet.position.set(0, 0.05, 0);
    tablet.visible = false;
    anchor.group.add(tablet);

    const video = document.createElement("video");
    video.src = `./assets/videomotor${selectedMoto}.mp4`;
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute("preload", "auto");

    const posterTexture = new THREE.TextureLoader().load(`./assets/poster${selectedMoto}.jpg`);
    const material = new THREE.MeshBasicMaterial({ map: posterTexture, side: THREE.DoubleSide });

    const texture = new THREE.VideoTexture(video);
    texture.encoding = THREE.sRGBEncoding;

    const geometry = new THREE.PlaneGeometry(2.5, 1.4);
    const videoPlane = new THREE.Mesh(geometry, material);
    videoPlane.rotation.x = Math.PI / 2;
    videoPlane.scale.x = -1;
    videoPlane.position.set(0, 0.25, 0);
    tablet.add(videoPlane);

    let animating = false;
    let animationProgress = 0;
    const targetScale = new THREE.Vector3(0.7, 0.7, 0.7);
    const initialScale = new THREE.Vector3(0.01, 0.01, 0.01);
    const easeOutCubic = (t) => (--t) * t * t + 1;

    let targetHasBeenSeen = false;

    anchor.onTargetFound = () => {
      scanOverlay.style.display = "none";
      tablet.visible = true;
      animationProgress = 0;
      animating = true;
      targetHasBeenSeen = true;
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
        scanOverlay.style.display = "flex";
      }
    };

    startBtn.addEventListener("click", async () => {
      try {
        await video.play();
        video.muted = false;
        startBtn.style.display = "none";
        videoPlane.material.map = texture;
        videoPlane.material.needsUpdate = true;
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
