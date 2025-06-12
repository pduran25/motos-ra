import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

window.addEventListener("DOMContentLoaded", async () => {
  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: "./target/moto.mind",
    maxTrack: 1
  });

  const { renderer, scene, camera } = mindarThree;
  const anchor = mindarThree.addAnchor(0);

  const loader = new GLTFLoader();
  loader.load("./assets/tablet2.glb", (gltf) => {
    const tablet = gltf.scene;
    tablet.scale.set(0.5, 0.5, 0.5);
    tablet.visible = false; // Ocultar hasta detectar el target
    anchor.group.add(tablet);

    // Mostrar/ocultar al detectar el target
    anchor.onTargetFound = () => {
      tablet.visible = true;
    };
    anchor.onTargetLost = () => {
      tablet.visible = false;
    };

    // Crear video
    const video = document.createElement("video");
    video.src = "./assets/videomotor.mp4";
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = false;
    video.playsInline = true;
    video.setAttribute("preload", "auto");

    // Solo crear la textura cuando esté listo
    video.addEventListener("canplaythrough", () => {
      const texture = new THREE.VideoTexture(video);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.format = THREE.RGBFormat;

      const geometry = new THREE.PlaneGeometry(0.8, 0.45);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      const videoPlane = new THREE.Mesh(geometry, material);
      videoPlane.position.set(0, 0.65, 0.03);
      tablet.add(videoPlane);

      // Click para reproducir/pausar
      let playing = false;
      document.body.addEventListener("click", (e) => {
        const mouse = new THREE.Vector2(
          (e.clientX / window.innerWidth) * 2 - 1,
          -(e.clientY / window.innerHeight) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(videoPlane);
        if (intersects.length > 0) {
          playing ? video.pause() : video.play();
          playing = !playing;
        }
      });
    });
  });

  await mindarThree.start();
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
});
