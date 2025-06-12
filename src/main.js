import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

window.addEventListener("DOMContentLoaded", async () => {
  const startBtn = document.getElementById("start-video");
  startBtn.style.display = "block";

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: "./target/moto.mind",
    maxTrack: 1
  });

  const { renderer, scene, camera } = mindarThree;
  const anchor = mindarThree.addAnchor(0);

  scene.add(new THREE.AmbientLight(0xffffff, 1));
  const light = new THREE.DirectionalLight(0xffffff, 0.5);
  light.position.set(1, 2, 1);
  scene.add(light);

  const loader = new GLTFLoader();
  loader.load("./assets/tablet.glb", (gltf) => {
    const tablet = gltf.scene;
    tablet.scale.set(0.5, 0.5, 0.5);
    tablet.visible = false;
    anchor.group.add(tablet);

    anchor.onTargetFound = () => (tablet.visible = true);
    anchor.onTargetLost = () => (tablet.visible = false);

    const video = document.createElement("video");
    video.src = "./assets/videomotor.mp4";
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = false;
    video.playsInline = true;
    video.setAttribute("preload", "auto");

    // ⏳ Esperar a que el video esté listo
    video.addEventListener("loadeddata", () => {
      const texture = new THREE.VideoTexture(video);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
      });
      const geometry = new THREE.PlaneGeometry(2.2, 1.2);
      const videoPlane = new THREE.Mesh(geometry, material);
      videoPlane.rotation.x = -Math.PI / 2;
      videoPlane.position.set(0, 0.1, 0);
      tablet.add(videoPlane);

      // 🎯 Reproducir video cuando se toque el botón
      startBtn.addEventListener("click", () => {
        video.play()
          .then(() => {
            startBtn.style.display = "none";
            console.log("▶️ Video iniciado");
          })
          .catch((err) => {
            alert("❌ No se pudo reproducir el video. Intenta tocar nuevamente.");
            console.error(err);
          });
      });
    });
  });

  await mindarThree.start();
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
});
