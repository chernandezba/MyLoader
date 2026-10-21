/*
 * MyLoader: prototipo 3D sin peticiones de red.
 * Secciones: escena, circuito, carrocerías, simulación y controles.
 */
(function () {
  "use strict";
  const T = THREE;
  const stage = document.getElementById("stage");

  // ESCENA Y MATERIALES -------------------------------------------------------
  const scene = new T.Scene();
  scene.background = new T.Color(0xb9a98b);
  const camera = new T.PerspectiveCamera(
    42,
    innerWidth / innerHeight,
    0.1,
    100,
  );
  const renderer = new T.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputEncoding = T.sRGBEncoding;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  stage.appendChild(renderer.domElement);
  scene.add(new T.HemisphereLight(0xffffff, 0xb8a783, 0.9));
  const sun = new T.DirectionalLight(0xfff5d8, 1.3);
  sun.position.set(-7, 15, 9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -12;
  sun.shadow.camera.right = 12;
  sun.shadow.camera.top = 12;
  sun.shadow.camera.bottom = -12;
  scene.add(sun);
  const mat = (color, metalness = 0) =>
    new T.MeshStandardMaterial({ color, roughness: 0.63, metalness });
  const groundEdge = mat(0x35271f);
  const ground = mat(0x4c382c);
  const rail = mat(0x777b76);
  const yellow = mat(0xf2bd26);
  const orange = mat(0xbf5933);
  const red = mat(0xba4a36);
  const brown = mat(0x8f5638);
  const blue = mat(0x82aeb4);
  const rock = mat(0x5c6060, 0.1);
  const dark = mat(0x343b3b);
  function box(parent, w, h, d, m, x, y, z) {
    let o = new T.Mesh(new T.BoxGeometry(w, h, d), m);
    o.position.set(x, y, z);
    o.castShadow = true;
    o.receiveShadow = true;
    parent.add(o);
    return o;
  }
  function cyl(parent, r, h, m, x, y, z) {
    let o = new T.Mesh(new T.CylinderGeometry(r, r, h, 16), m);
    o.position.set(x, y, z);
    o.castShadow = true;
    parent.add(o);
    return o;
  }
  function label(text, x, z) {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 96;
    const g = c.getContext("2d");
    g.fillStyle = "#f2e2c5";
    g.font = "bold 34px system-ui";
    g.textAlign = "center";
    g.fillText(text, 256, 55);
    const tx = new T.CanvasTexture(c);
    const p = new T.Mesh(
      new T.PlaneGeometry(2.6, 0.49),
      new T.MeshBasicMaterial({
        map: tx,
        transparent: true,
        depthWrite: false,
      }),
    );
    p.rotation.x = -Math.PI / 2;
    p.position.set(x, 0.035, z);
    scene.add(p);
  }
  // CIRCUITO Y ESTACIONES -----------------------------------------------------

  box(scene, 20, 0.22, 13, groundEdge, 0, -0.18, 0);
  box(scene, 19.3, 0.08, 12.3, ground, 0, -0.03, 0);
  // Rutas visuales simplificadas con bordes y ranura guía.
  function path(points, width = 0.68) {
    let curve = new T.CatmullRomCurve3(
      points.map((p) => new T.Vector3(p[0], 0.16, p[1])),
    );
    let pts = curve.getPoints(80);
    let verts = [];
    for (let i = 0; i < pts.length - 1; i++) {
      let a = pts[i],
        b = pts[i + 1],
        v = b.clone().sub(a).normalize(),
        n = new T.Vector3(-v.z, 0, v.x).multiplyScalar(width / 2);
      for (let off of [-1, 1]) {
        let aa = a.clone().addScaledVector(n, off),
          bb = b.clone().addScaledVector(n, off);
        verts.push(aa, bb);
      }
    }
    for (let side of [-1, 1]) {
      let geo = new T.BufferGeometry().setFromPoints(
        verts.filter(
          (_, i) =>
            i % 4 === (side === -1 ? 0 : 2) ||
            i % 4 === (side === -1 ? 1 : 3),
        ),
      );
      scene.add(
        new T.Line(geo, new T.LineBasicMaterial({ color: 0x666c68 })),
      );
    }
    let tube = new T.Mesh(
      new T.TubeGeometry(curve, 80, 0.31, 8, false),
      rail,
    );
    tube.scale.y = 0.11;
    scene.add(tube);
    let groove = new T.Line(
      new T.BufferGeometry().setFromPoints(
        pts.map((p) => p.clone().add(new T.Vector3(0, 0.035, 0))),
      ),
      new T.LineBasicMaterial({ color: 0x434a48 }),
    );
    scene.add(groove);
    return curve;
  }
  const routes = {
    A: path([
      [0, 0],
      [-1.4, -0.7],
      [-3, -1.4],
      [-5, -2.7],
      [-4.9, -4.4],
      [-2.4, -4.7],
      [-0.8, -2.5],
      [0, 0],
    ]),
    B: path([
      [0, 0],
      [1, -1.3],
      [3, -2.7],
      [5, -2.5],
      [6, -1.2],
      [5.6, 1.2],
      [4.2, 3.7],
      [1.2, 3.6],
      [0.4, 1.7],
      [0, 0],
    ]),
    C: path([
      [0, 0],
      [-1.5, 1],
      [-3.7, 1.6],
      [-5.4, 2.8],
      [-4.7, 4.7],
      [-2.8, 4.5],
      [-1.1, 2.3],
      [0, 0],
    ]),
  };
  // Plástico de los tres destinos.
  box(scene, 2.4, 0.17, 1.7, brown, -5, -0.01, -2.7);
  box(scene, 2.1, 0.22, 0.28, blue, -5, 0.26, -3.4);
  box(scene, 2.1, 0.22, 0.28, blue, -5, 0.26, -2.0);
  label("MUELLE / CARGA", -5, -1.15);
  for (let x of [4.4, 5.6]) box(scene, 0.15, 1.1, 0.15, blue, x, 0.55, -2.7);
  box(scene, 1.8, 0.28, 1.25, red, 5, 1.12, -2.7);
  box(scene, 1.25, 0.6, 0.95, blue, 5, 1.45, -2.7);
  label("TOLVA", 5, -1.05);
  box(scene, 2.2, 0.2, 1.15, red, 4.2, 0.12, 3.7);
  box(scene, 2, 0.13, 0.52, blue, 2.5, 0.75, 3.65);
  label("RAMPA", 4.1, 5.1);
  box(scene, 2.1, 0.18, 1.55, brown, -5.4, 0.09, 2.8);
  label("CANAL DE ENTREGA", -5.2, 4.2);
  box(scene, 1.6, 0.12, 0.55, red, 1.2, 0.65, 3.6);
  box(scene, 0.15, 0.7, 0.15, blue, 0.4, 0.35, 3.6);
  box(scene, 0.15, 0.7, 0.15, blue, 2, 0.35, 3.6);
  for (let i = 0; i < 3; i++) {
    let p = [-1.3 + i * 0.43, 0.1, 0.55 + i * 0.15];
    box(scene, 0.26, 0.1, 0.26, red, ...p);
  }
  label("DESVÍO", 0, -0.6);
  // CHASIS Y CARROCERÍAS ------------------------------------------------------
  // Un solo chasis. Las carrocerías se estacionan cuando no están acopladas.
  const chassis = new T.Group();
  scene.add(chassis);
  box(chassis, 0.98, 0.25, 0.62, orange, 0, 0.34, 0);
  for (let x of [-0.32, 0.32]) {
    for (let z of [-0.33, 0.33]) {
      let w = cyl(chassis, 0.16, 0.1, dark, x, 0.22, z);
      w.rotation.x = Math.PI / 2;
    }
  }

  function createScoopBody() {
    const body = new T.Group();
    box(body, 0.95, 0.35, 0.67, yellow, 0, 0.65, 0);
    box(body, 0.43, 0.37, 0.66, blue, -0.2, 0.92, 0);

    const scoop = box(body, 0.43, 0.12, 0.73, yellow, 0.64, 0.55, 0);
    scoop.rotation.z = -0.25;
    return body;
  }

  function createSkipBody() {
    const body = new T.Group();
    box(body, 0.9, 0.32, 0.65, yellow, 0, 0.64, 0);
    box(body, 0.39, 0.32, 0.65, blue, 0.23, 0.94, 0);

    const scoop = box(body, 0.53, 0.16, 0.83, yellow, -0.61, 0.48, 0);
    scoop.rotation.z = 0.22;
    return body;
  }

  function createDumpTruckBody() {
    const body = new T.Group();

    // Cabina azul y caja amarilla del camión volquete.
    box(body, 0.4, 0.38, 0.68, blue, -0.28, 0.85, 0);
    box(body, 0.65, 0.19, 0.79, yellow, 0.25, 0.78, 0);

    for (let z of [-0.34, 0.34]) {
      box(body, 0.65, 0.21, 0.07, yellow, 0.25, 0.94, z);
    }

    box(body, 0.07, 0.22, 0.75, yellow, 0.55, 0.94, 0);
    return body;
  }

  const shells = {
    scoop: createScoopBody(),
    skip: createSkipBody(),
    dump: createDumpTruckBody(),
  };
  Object.values(shells).forEach((o) => scene.add(o));
  const ballMeshes = Array.from({ length: 12 }, () => {
    let o = new T.Mesh(new T.SphereGeometry(0.105, 12, 8), rock);
    o.castShadow = true;
    scene.add(o);
    return o;
  });
  // CICLO DE SIMULACIÓN -------------------------------------------------------
  // Esta secuencia aún simplifica el desvío y la transferencia de bolitas.

  const phases = [
    {
      name: "La pala toma bolitas de la tolva",
      body: "scoop",
      route: "B",
      duration: 8,
    },
    {
      name: "La pala deposita bolitas en el canal",
      body: "scoop",
      route: "B",
      duration: 3,
    },
    {
      name: "Cambio de carrocería: cargador",
      body: "skip",
      route: "A",
      duration: 2.5,
    },
    {
      name: "El cargador recoge bolitas del muelle",
      body: "skip",
      route: "A",
      duration: 7,
    },
    {
      name: "El cargador eleva las bolitas al camión",
      body: "skip",
      route: "A",
      duration: 3,
    },
    {
      name: "Cambio de carrocería: volquete",
      body: "dump",
      route: "C",
      duration: 2.5,
    },
    {
      name: "El volquete lleva la carga a la tolva",
      body: "dump",
      route: "B",
      duration: 8,
    },
    {
      name: "El volquete descarga; inversión de marcha",
      body: "dump",
      route: "B",
      duration: 4,
    },
  ];
  const cycleDuration = phases.reduce((sum, phase) => {
    return sum + phase.duration;
  }, 0);

  let sim = 0;
  let playing = true;
  let speed = 1;
  let cycles = 0;
  let last = performance.now();
  let audio = null;

  function stateAt(time) {
    let remaining = time % cycleDuration;

    for (let index = 0; index < phases.length; index++) {
      const phase = phases[index];

      if (remaining < phase.duration) {
        return {
          index: index,
          progress: remaining / phase.duration,
        };
      }

      remaining -= phase.duration;
    }
  }

  function reset() {
    sim = 0;
    cycles = 0;
    playing = true;
    document.getElementById("play").textContent = "Pausar";
    update();
  }
  function positionChassis(phase, phaseIndex, progress) {
    const route = routes[phase.route];
    const goingBack = phaseIndex === 1 || phaseIndex === 7;
    const routeProgress = goingBack ? 1 - progress : progress;
    const position = route.getPointAt(routeProgress);
    const direction = route.getTangentAt(routeProgress);

    chassis.position.set(position.x, 0, position.z);
    chassis.rotation.y = Math.atan2(-direction.z, direction.x);

    if (goingBack) {
      chassis.rotation.y += Math.PI;
    }

    chassis.updateMatrixWorld(true);
  }

  const parkedPositions = {
    scoop: [-3.6, -3.35],
    skip: [-5.4, 2.5],
    dump: [-4.7, -2.7],
  };

  function positionBodies(activeBody) {
    for (const [name, body] of Object.entries(shells)) {
      if (name === activeBody) {
        chassis.add(body);
        body.position.set(0, 0, 0);
      } else {
        scene.add(body);
        const [x, z] = parkedPositions[name];
        body.position.set(x, 0, z);
      }

      body.rotation.y = 0;
    }
  }

  const ballStores = {
    hopper: [5, 1.79, -2.7],
    chute: [1.2, 0.83, 3.6],
    trough: [-5.4, 0.33, 2.8],
    dock: [-5, 0.39, -2.7],
  };

  function ballLocationForPhase(phaseIndex) {
    if (phaseIndex === 0) return "hopper";
    if (phaseIndex === 1) return "chute";
    if (phaseIndex < 4) return "trough";
    if (phaseIndex === 4) return "dock";
    if (phaseIndex < 7) return "truck";
    return "hopper";
  }

  function positionBalls(phaseIndex) {
    const location = ballLocationForPhase(phaseIndex);

    ballMeshes.forEach((ball, index) => {
      if (location === "truck") {
        const position = new T.Vector3(
          (index % 4) * 0.16 - 0.25,
          0.96 + Math.floor(index / 4) * 0.16,
          (index % 3) * 0.16 - 0.15,
        );
        chassis.localToWorld(position);
        ball.position.copy(position);
        return;
      }

      const [x, y, z] = ballStores[location];
      ball.position.set(
        x + (index % 4) * 0.18 - 0.27,
        y + Math.floor(index / 4) * 0.2,
        z + (index % 3) * 0.19 - 0.19,
      );
    });
  }

  function update() {
    const state = stateAt(sim);
    const phase = phases[state.index];

    document.getElementById("phase").textContent = phase.name;
    document.getElementById("count").textContent = "Ciclos: " + cycles;

    positionChassis(phase, state.index, state.progress);
    positionBodies(phase.body);
    positionBalls(state.index);
  }
  // CÁMARA, CONTROLES Y SONIDO ------------------------------------------------

  const target = new T.Vector3(0, 0, 0);
  let radius = 18;
  let azimuth = -0.5;
  let polar = 0.85;
  let drag = null;

  function updateCamera() {
    camera.position.set(
      target.x + radius * Math.sin(polar) * Math.sin(azimuth),
      target.y + radius * Math.cos(polar),
      target.z + radius * Math.sin(polar) * Math.cos(azimuth),
    );
    camera.lookAt(target);
  }

  function frame(now) {
    const elapsed = Math.min((now - last) / 1000, 0.1);
    last = now;

    if (playing) {
      const previousCycle = Math.floor(sim / cycleDuration);
      sim += elapsed * speed;

      if (Math.floor(sim / cycleDuration) > previousCycle) {
        cycles++;
      }

      update();

      if (audio) {
        audio.osc.frequency.setTargetAtTime(
          90 + Math.sin(sim * 14) * 5,
          audio.ctx.currentTime,
          0.03,
        );
      }
    }

    updateCamera();
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }

  renderer.domElement.addEventListener("pointerdown", (e) => {
    drag = { x: e.clientX, y: e.clientY, button: e.button };
    renderer.domElement.setPointerCapture(e.pointerId);
  });
  renderer.domElement.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    drag.x = e.clientX;
    drag.y = e.clientY;
    if (drag.button === 2 || e.shiftKey) {
      target.x -= dx * 0.015;
      target.z += dy * 0.015;
    } else {
      azimuth -= dx * 0.006;
      polar = Math.max(0.2, Math.min(1.5, polar - dy * 0.006));
    }
  });
  renderer.domElement.addEventListener("pointerup", () => {
    drag = null;
  });

  renderer.domElement.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });
  renderer.domElement.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      radius = Math.max(7, Math.min(32, radius * Math.exp(e.deltaY * 0.001)));
    },
    { passive: false },
  );
  document.getElementById("play").onclick = () => {
    playing = !playing;
    document.getElementById("play").textContent = playing
      ? "Pausar"
      : "Iniciar";
  };
  document.getElementById("reset").onclick = reset;
  document.getElementById("speed").onchange = (event) => {
    speed = Number(event.target.value);
  };
  document.getElementById("camera").onclick = () => {
    target.set(0, 0, 0);
    radius = 18;
    azimuth = -0.5;
    polar = 0.85;
  };
  document.getElementById("sound").onclick = () => {
    const b = document.getElementById("sound");
    if (audio) {
      audio.osc.stop();
      audio.ctx.close();
      audio = null;
      b.textContent = "Sonido: no";
      b.setAttribute("aria-pressed", "false");
    } else {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = 90;
      gain.gain.value = 0.012;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      audio = { ctx, osc };
      b.textContent = "Sonido: sí";
      b.setAttribute("aria-pressed", "true");
    }
  };
  addEventListener("resize", () => {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
  });
  update();
  requestAnimationFrame(frame);
})();
