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

  // ✅ Iluminación para que se vea el modelo
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(0, 1, 1).normalize();
  scene.add(directionalLight);

  // Cargar el modelo .glb de la tablet
  const loader = new GLTFLoader();
  loader.load("./assets/tablet.glb", (gltf) => {
    const tablet = gltf.scene;
    tablet.scale.set(0.5, 0.5, 0.5);
    tablet.visible = false;
    anchor.group.add(tablet);

    // Mostrar/ocultar la tablet según tracking
    anchor.onTargetFound = () => {
      tablet.visible = true;
    };
    anchor.onTargetLost = () => {
      tablet.visible = false;
    };

    // Crear el video
    const video = document.createElement("video");
    video.src = "./assets/videomotor.mp4";
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = false; // autoplay móvil
    video.playsInline = true;
    video.setAttribute("preload", "auto");

    // Esperar a que el video esté listo
    video.addEventListener("loadeddata", () => {
      const texture = new THREE.VideoTexture(video);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.format = THREE.RGBAFormat;
    
      // ✅ Geometría del video (doble de tamaño)
      const geometry = new THREE.PlaneGeometry(1.6, 0.9);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.DoubleSide,
        transparent: false
      });
    
      const videoPlane = new THREE.Mesh(geometry, material);
    
      // ✅ Asegurar que el plano esté por encima y bien visible
      videoPlane.rotation.x = -Math.PI / 2;
      videoPlane.position.set(0, 0.1, 0); // más alto para evitar intersección con tablet
    
      // ✅ Agregar un marco visual para saber que está el video
      const frameGeometry = new THREE.PlaneGeometry(1.65, 0.95);
      const frameMaterial = new THREE.MeshBasicMaterial({
        color: 0x333333,
        side: THREE.DoubleSide
      });
      const framePlane = new THREE.Mesh(frameGeometry, frameMaterial);
      framePlane.rotation.x = -Math.PI / 2;
      framePlane.position.set(0, 0.099, 0); // justo debajo del video
    
      tablet.add(framePlane);
      tablet.add(videoPlane);
    
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

  // Iniciar el rastreo AR
  await mindarThree.start();
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
});
