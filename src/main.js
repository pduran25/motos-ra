import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

window.addEventListener("DOMContentLoaded", async () => {
  const startBtn = document.getElementById("start-video");
  const video = document.getElementById("hidden-video");

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
    tablet.rotation.x = Math.PI / 2;
    tablet.rotation.y = Math.PI;
    tablet.position.set(0, 0.05, 0);
    tablet.visible = false;

    anchor.group.add(tablet);

    video.addEventListener("loadeddata", () => {
      const texture = new THREE.VideoTexture(video);
      const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
      const geometry = new THREE.PlaneGeometry(2.2, 1.2);
      const videoPlane = new THREE.Mesh(geometry, material);
      videoPlane.rotation.x = Math.PI / 2;
      videoPlane.scale.x = -1;
      videoPlane.position.set(0, 0.12, 0);

      tablet.add(videoPlane);

      anchor.onTargetFound = () => {
        tablet.visible = true;
        startBtn.style.display = "block";
      };

      anchor.onTargetLost = () => {
        tablet.visible = false;
        startBtn.style.display = "none";
        video.pause();
      };

      startBtn.addEventListener("click", async () => {
        try {
          await video.play();
          video.muted = false;
          startBtn.style.display = "none";
        } catch (err) {
          alert("iOS requiere que toques para iniciar el video.");
          console.error(err);
        }
      });
    });
  });

  await mindarThree.start();
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
});
