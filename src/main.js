import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

window.addEventListener("DOMContentLoaded", async () => {
  const startBtn = document.getElementById("start-video");

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: "./target/codigomoto.mind",
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
    tablet.scale.set(0.1, 0.1, 0.1); // Animación parte desde pequeño
    tablet.rotation.set(0, 0, 0);    // Rotación inicial
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

    let animating = false;
    let animationProgress = 0;

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
        animationProgress = 0;
        animating = true;
        if (video.paused || video.ended) {
          startBtn.style.display = "block";
        }
      };

      anchor.onTargetLost = () => {
        tablet.visible = false;
        video.pause();
        video.currentTime = 0;
        startBtn.style.display = "none";
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

          // Easing suave tipo easeOutCubic
          const t = animationProgress;
          const eased = 1 - Math.pow(1 - t, 3);

          const scale = THREE.MathUtils.lerp(0.1, 0.5, eased);
          const rotationY = THREE.MathUtils.lerp(0, Math.PI, eased);

          tablet.scale.set(scale, scale, scale);
          tablet.rotation.set(0, rotationY, 0);

          if (eased >= 1) {
            animating = false;
          }
        }

        renderer.render(scene, camera);
      });
    });
  });

  await mindarThree.start();
});
