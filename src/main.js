import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

window.addEventListener("DOMContentLoaded", async () => {
  const startBtn = document.getElementById("start-video");
  startBtn.style.display = "block"; // Mostrar botón desde el inicio

  // Inicializar MindAR
  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: "./target/moto.mind",
    maxTrack: 1
  });

  const { renderer, scene, camera } = mindarThree;
  const anchor = mindarThree.addAnchor(0);

  // Iluminación básica
  scene.add(new THREE.AmbientLight(0xffffff, 1));
  const light = new THREE.DirectionalLight(0xffffff, 0.5);
  light.position.set(1, 2, 1);
  scene.add(light);

  // Cargar modelo de tablet
  const loader = new GLTFLoader();
  loader.load("./assets/tablet.glb", (gltf) => {
    const tablet = gltf.scene;
    tablet.scale.set(0.5, 0.5, 0.5);

    // 🔄 ROTACIÓN para que esté acostada
    tablet.rotation.x = -Math.PI / 2;
    tablet.position.set(0, 0.05, 0); // levemente elevada sobre el target

    tablet.visible = false;
    anchor.group.add(tablet);

    anchor.onTargetFound = () => (tablet.visible = true);
    anchor.onTargetLost = () => (tablet.visible = false);

    // 🎥 Crear video
    const video = document.createElement("video");
    video.src = "./assets/videomotor.mp4";
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = false;
    video.playsInline = true;
    video.setAttribute("preload", "auto");

    // Esperar que el video cargue para usar como textura
    video.addEventListener("loadeddata", () => {
      const texture = new THREE.VideoTexture(video);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide
      });

      const geometry = new THREE.PlaneGeometry(2.2, 1.2); // Tamaño del video
      const videoPlane = new THREE.Mesh(geometry, material);

      // ✅ Posicionar el video sobre la tablet (horizontalmente)
      videoPlane.rotation.x = -Math.PI / 2;
      videoPlane.position.set(0, 0.12, 0); // Encima de la tablet

      tablet.add(videoPlane);

      // 📱 En móvil: usar botón
      startBtn.addEventListener("click", () => {
        video.play()
          .then(() => {
            startBtn.style.display = "none";
            console.log("▶️ Video iniciado");
          })
          .catch((err) => {
            alert("❌ Error al reproducir video. Toca de nuevo.");
            console.error(err);
          });
      });

      // 🖱️ En escritorio: clic directo sobre el video
      document.body.addEventListener("click", (e) => {
        const mouse = new THREE.Vector2(
          (e.clientX / window.innerWidth) * 2 - 1,
          -(e.clientY / window.innerHeight) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(videoPlane);
        if (intersects.length > 0) {
          video.paused ? video.play() : video.pause();
        }
      });
    });
  });

  // Iniciar AR
  await mindarThree.start();
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
});
