window.addEventListener("DOMContentLoaded", async () => {
  const THREE = window.THREE;
  const { GLTFLoader } = await import('https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/loaders/GLTFLoader.js');

  const mindarThree = new window.MINDAR.IMAGE.MindARThree({
    container: document.querySelector("#ar-container"),
    imageTargetSrc: "./target/moto.mind",
    maxTrack: 1
  });

  const { renderer, scene, camera } = mindarThree;
  const anchor = mindarThree.addAnchor(0);

  const loader = new GLTFLoader();
  loader.load("./assets/tablet.glb", (gltf) => {
    console.log("✅ Modelo cargado:", gltf);

    const tablet = gltf.scene;
    tablet.scale.set(0.5, 0.5, 0.5);
    anchor.group.add(tablet);

    const video = document.createElement("video");
    video.src = "./assets/videomotor.mp4";
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = false;
    video.playsInline = true;
    video.setAttribute("preload", "auto");

    const texture = new THREE.VideoTexture(video);
    const geometry = new THREE.PlaneGeometry(0.8, 0.45);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const videoPlane = new THREE.Mesh(geometry, material);
    videoPlane.position.set(0, 0.65, 0.03);
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

  await mindarThree.start();
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
});
