import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

window.addEventListener("DOMContentLoaded", async () => {
  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: "./target/moto.mind",
    maxTrack: 1
  });

  const startBtn = document.getElementById("start-video");

  const { renderer, scene, camera } = mindarThree;
  const anchor = mindarThree.addAnchor(0);

  // Luces
  scene.add(new THREE.AmbientLight(0xffffff, 1));
  const light = new THREE.DirectionalLight(0xffffff, 0.5);
  light.position.set(1, 2, 1);
  scene.add(light);

  const loader = new GLTFLoader();
  loader.load("./assets/tablet.glb", (gltf) => {
    const tablet = gltf.scene;
    tablet.scale.set(0.5, 0.5, 0.5);

    // 🛏️ Tablet acostada y rotada correctamente sobre el target
    tablet.rotation.x = -Math.PI / 2;
    tablet.rotation.y = Math.PI; // gira la tablet 180° sobre su eje para que no salga de cabeza

    tablet.visible = false;
    anchor.group.add(tablet);

    anchor.onTargetFound = () => (tablet.visible = true);
    anchor.onTargetLost = () => (tablet.visible = false);

    // 🎥 Crear video
    const video = document.createElement("video");
    video.src = "./assets/videomotor.mp4";
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true; // 🔇 para autoplay en móviles
    video.playsInline = true;
    video.setAttribute("preload", "auto");

    // Esperar a que el video esté listo
    video.addEventListener("loadeddata", () => {
      const texture = new THREE.VideoTexture(video);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
      });

      const geometry = new THREE.PlaneGeometry(2.2, 1.2);
      const videoPlane = new THREE.Mesh(geometry, material);

      videoPlane.rotation.x = Math.PI / 2;
      videoPlane.scale.x = -1; // invertir para corregir orientación
      videoPlane.position.set(0, 0.12, 0); // sobre la tablet

      tablet.add(videoPlane);

      // 📱 Móviles: reproducir al tocar el botón
      const isMobile = /Mobi|Android/i.test(navigator.userAgent);
      if (isMobile) {
        startBtn.style.display = "block";

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
      } else {
        // 🖥️ Escritorio: clic sobre el plano del video
        document.body.addEventListener("click", (e) => {
          const mouse = new THREE.Vector2(
            (e.clientX / window.innerWidth) * 2 - 1,
            -(e.clientY / window.innerHeight) * 2 + 1
          );
          const raycaster = new THREE.Raycaster();
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObject(videoPlane);
          if (intersects.length > 0) {
            if (video.paused) {
              video.play();
              video.muted = false;
            } else {
              video.pause();
            }
          }
        });
      }
    });
  });

  await mindarThree.start();
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
});
