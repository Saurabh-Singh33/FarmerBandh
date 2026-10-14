import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  Sparkles,
  Sun,
  Sunset,
  Moon,
  Handshake,
  Check,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sliders,
  Sprout,
  User,
  ShoppingBag,
  HelpCircle,
  TrendingUp,
  X
} from 'lucide-react';

const PRODUCE_TYPES = {
  wheat: {
    label: 'Wheat',
    icon: '🌾',
    price: 2450,
    priceLabel: '₹2,450 / quintal',
    badge: 'Grade A Sharbati Wheat',
    color: 0xf59e0b,
    farmerQuote: 'Freshly harvested Sharbati wheat from Anand, Gujarat. Golden grain, no middlemen cut!',
    buyerQuote: 'Protein and moisture verified! Ready to lock purchase order in escrow.'
  },
  tomato: {
    label: 'Tomatoes',
    icon: '🍅',
    price: 1850,
    priceLabel: '₹1,850 / quintal',
    badge: 'Fresh Red Tomatoes',
    color: 0xef4444,
    farmerQuote: 'Vine-ripened farm fresh tomatoes picked this morning at sunrise.',
    buyerQuote: 'Firmness test passed. Loading directly into temperature-controlled logistics.'
  },
  mango: {
    label: 'Mangoes',
    icon: '🥭',
    price: 4600,
    priceLabel: '₹4,600 / quintal',
    badge: 'Kesar Mango Harvest',
    color: 0xfbbf24,
    farmerQuote: 'Naturally ripened Kesar mangoes from Junagadh orchards. Export-ready sweetness.',
    buyerQuote: 'Wholesale batch approved. Fair price agreed directly with grower!'
  },
  carrot: {
    label: 'Carrots',
    icon: '🥕',
    price: 1600,
    priceLabel: '₹1,600 / quintal',
    badge: 'Farm Fresh Orange Carrots',
    color: 0xf97316,
    farmerQuote: 'Crunchy sweet orange carrots, washed and graded at source.',
    buyerQuote: 'Supermarket bulk shipment confirmed at zero middleman markup.'
  }
};

const LIGHTING_PRESETS = {
  morning: {
    ambientColor: 0xffffff,
    ambientIntensity: 0.9,
    sunColor: 0xfff7ed,
    sunIntensity: 1.4,
    bgColor: '#FFFFFF',
    label: 'Morning Sun'
  },
  golden: {
    ambientColor: 0xffedd5,
    ambientIntensity: 0.85,
    sunColor: 0xf97316,
    sunIntensity: 1.6,
    bgColor: '#FFFBEB',
    label: 'Golden Hour'
  },
  night: {
    ambientColor: 0x93c5fd,
    ambientIntensity: 0.5,
    sunColor: 0x60a5fa,
    sunIntensity: 0.9,
    bgColor: '#0F172A',
    label: 'Night Market'
  }
};

const CAMERA_VIEWS = {
  orbit: {
    pos: [0, 3.2, 7.5],
    look: [0, 0.8, 0],
    label: 'Orbit View',
    icon: RotateCcw
  },
  trade: {
    pos: [0, 1.8, 4.4],
    look: [0, 0.9, 0],
    label: 'Trade Focus',
    icon: Handshake
  },
  farmer: {
    pos: [-1.4, 1.7, 4.2],
    look: [-1.6, 1.0, 0],
    label: 'Farmer View',
    icon: User
  },
  buyer: {
    pos: [1.4, 1.7, 4.2],
    look: [1.6, 1.0, 0],
    label: 'Buyer View',
    icon: ShoppingBag
  }
};

// Web Audio synthesizer for tactile sound feedback
const playTone = (type, isMuted) => {
  if (isMuted) return;
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;

    if (type === 'pop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(840, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'chime') {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const start = now + idx * 0.06;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.07, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.35);
      });
    } else if (type === 'shake') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(180, now + 0.12);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch (err) {
    // Ignore audio errors gracefully
  }
};

export const FarmerBuyerScene = () => {
  const mountRef = useRef(null);

  // User Interactive States
  const [selectedCrop, setSelectedCrop] = useState('wheat');
  const [lightingMode, setLightingMode] = useState('morning');
  const [activeCameraView, setActiveCameraView] = useState('orbit');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [manualScrub, setManualScrub] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [showNegotiator, setShowNegotiator] = useState(false);
  const [customOffer, setCustomOffer] = useState(2450);
  const [speech, setSpeech] = useState(null);
  const [hoveredObject, setHoveredObject] = useState(null);
  const [tradeSuccess, setTradeSuccess] = useState(false);
  const [sproutCount, setSproutCount] = useState(0);

  // Sync state to ref for Three.js animation loop access
  const stateRef = useRef({
    selectedCrop: 'wheat',
    lightingMode: 'morning',
    isAutoPlaying: true,
    manualScrub: 0.5,
    cameraTargetPos: new THREE.Vector3(0, 3.2, 7.5),
    cameraTargetLook: new THREE.Vector3(0, 0.8, 0),
    isMuted: false,
    updateProduce: null,
    updateLighting: null,
    triggerCelebration: null,
    sproutAt: null,
    resetView: null,
    zoomIn: null,
    zoomOut: null
  });

  useEffect(() => {
    stateRef.current.selectedCrop = selectedCrop;
    if (stateRef.current.updateProduce) {
      stateRef.current.updateProduce(selectedCrop);
    }
    setCustomOffer(PRODUCE_TYPES[selectedCrop].price);
  }, [selectedCrop]);

  useEffect(() => {
    stateRef.current.lightingMode = lightingMode;
    if (stateRef.current.updateLighting) {
      stateRef.current.updateLighting(lightingMode);
    }
  }, [lightingMode]);

  useEffect(() => {
    stateRef.current.isAutoPlaying = isAutoPlaying;
  }, [isAutoPlaying]);

  useEffect(() => {
    stateRef.current.manualScrub = manualScrub;
  }, [manualScrub]);

  useEffect(() => {
    stateRef.current.isMuted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const view = CAMERA_VIEWS[activeCameraView] || CAMERA_VIEWS.orbit;
    stateRef.current.cameraTargetPos.set(view.pos[0], view.pos[1], view.pos[2]);
    stateRef.current.cameraTargetLook.set(view.look[0], view.look[1], view.look[2]);
  }, [activeCameraView]);

  // Main Three.js Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 520;
    let height = container.clientHeight || 480;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 3.2, 7.5);
    const cameraLookAt = new THREE.Vector3(0, 0.8, 0);
    camera.lookAt(cameraLookAt);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    dirLight.position.set(5, 9, 6);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    const fillLight = new THREE.PointLight(0x22c55e, 1.2, 10);
    fillLight.position.set(-3, 2, 2);
    scene.add(fillLight);

    const tradeGlowLight = new THREE.PointLight(0xf59e0b, 1.8, 6);
    tradeGlowLight.position.set(0, 1.2, 0.5);
    scene.add(tradeGlowLight);

    stateRef.current.updateLighting = (mode) => {
      const p = LIGHTING_PRESETS[mode] || LIGHTING_PRESETS.morning;
      ambientLight.color.setHex(p.ambientColor);
      ambientLight.intensity = p.ambientIntensity;
      dirLight.color.setHex(p.sunColor);
      dirLight.intensity = p.sunIntensity;
    };

    // 5. Main World Group (Rotates with 360° mouse drag)
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // 6. Ground Island
    const islandGeo = new THREE.CylinderGeometry(3.3, 3.5, 0.35, 48);
    const islandMat = new THREE.MeshStandardMaterial({
      color: 0x2e7d32,
      roughness: 0.65,
      metalness: 0.05
    });
    const island = new THREE.Mesh(islandGeo, islandMat);
    island.name = 'Island';
    island.position.y = -0.17;
    island.receiveShadow = true;
    worldGroup.add(island);

    // Soil Pedestal Base
    const soilGeo = new THREE.CylinderGeometry(3.4, 3.6, 0.25, 48);
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.y = -0.42;
    soil.receiveShadow = true;
    worldGroup.add(soil);

    // Stone Pathway connecting Farmer & Buyer
    const pathGeo = new THREE.BoxGeometry(3.4, 0.02, 0.75);
    const pathMat = new THREE.MeshStandardMaterial({ color: 0xe5e7eb, roughness: 0.85 });
    const path = new THREE.Mesh(pathGeo, pathMat);
    path.name = 'Path';
    path.position.set(0, 0.01, 0);
    path.receiveShadow = true;
    worldGroup.add(path);

    // Sprouts Dynamic Group (User can click on island to sprout plants)
    const sproutsGroup = new THREE.Group();
    worldGroup.add(sproutsGroup);

    const sproutStemGeo = new THREE.CylinderGeometry(0.015, 0.025, 0.45, 6);
    const sproutStemMat = new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.5 });
    const sproutFlowerGeo = new THREE.SphereGeometry(0.07, 8, 8);
    const sproutFlowerMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 });

    stateRef.current.sproutAt = (point) => {
      if (sproutsGroup.children.length > 35) {
        sproutsGroup.remove(sproutsGroup.children[0]);
      }
      const singleSprout = new THREE.Group();
      const stem = new THREE.Mesh(sproutStemGeo, sproutStemMat);
      stem.position.y = 0.22;
      const flower = new THREE.Mesh(sproutFlowerGeo, sproutFlowerMat);
      flower.position.y = 0.45;
      singleSprout.add(stem);
      singleSprout.add(flower);
      singleSprout.position.copy(point);
      singleSprout.position.y = 0.02;
      singleSprout.scale.set(0.1, 0.1, 0.1);
      singleSprout.userData = { targetScale: 1.0, currentScale: 0.1 };
      sproutsGroup.add(singleSprout);
      setSproutCount((prev) => prev + 1);
      playTone('pop', stateRef.current.isMuted);
    };

    // Pre-planted Wheat Stalks
    const cropGroup = new THREE.Group();
    const wheatStemGeo = new THREE.CylinderGeometry(0.02, 0.03, 0.55, 6);
    const wheatStemMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.5 });
    const wheatHeadGeo = new THREE.ConeGeometry(0.08, 0.25, 6);
    const wheatHeadMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.4 });

    for (let i = 0; i < 12; i++) {
      const stem = new THREE.Mesh(wheatStemGeo, wheatStemMat);
      const head = new THREE.Mesh(wheatHeadGeo, wheatHeadMat);
      head.position.y = 0.35;
      const stalk = new THREE.Group();
      stalk.add(stem);
      stalk.add(head);

      const angle = (i / 12) * Math.PI * 0.95 + Math.PI * 0.52;
      const radius = 1.9 + (i % 3) * 0.35;
      stalk.position.set(Math.cos(angle) * radius, 0.28, Math.sin(angle) * radius);
      stalk.rotation.z = (Math.random() - 0.5) * 0.2;
      cropGroup.add(stalk);
    }
    worldGroup.add(cropGroup);

    // 7. Characters Builder
    const createCharacter = ({ shirtColor, hatType, skinColor = 0xf5d0a9, name }) => {
      const charGroup = new THREE.Group();
      charGroup.name = name;

      const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.6 });
      const clothesMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.6 });

      // Body / Torso
      const bodyGeo = new THREE.CylinderGeometry(0.32, 0.38, 0.9, 16);
      const body = new THREE.Mesh(bodyGeo, clothesMat);
      body.position.y = 0.75;
      body.castShadow = true;
      body.receiveShadow = true;
      charGroup.add(body);

      // Head
      const headGeo = new THREE.SphereGeometry(0.24, 20, 20);
      const head = new THREE.Mesh(headGeo, skinMat);
      head.position.y = 1.35;
      head.castShadow = true;
      charGroup.add(head);

      // Hat
      if (hatType === 'farmerHat') {
        const brimGeo = new THREE.CylinderGeometry(0.58, 0.58, 0.04, 24);
        const hatMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8 });
        const brim = new THREE.Mesh(brimGeo, hatMat);
        brim.position.y = 1.48;
        brim.castShadow = true;
        charGroup.add(brim);

        const coneGeo = new THREE.ConeGeometry(0.36, 0.34, 20);
        const cone = new THREE.Mesh(coneGeo, hatMat);
        cone.position.y = 1.65;
        cone.castShadow = true;
        charGroup.add(cone);
      } else {
        // Buyer Cap
        const hairGeo = new THREE.SphereGeometry(0.25, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5);
        const hairMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 });
        const hair = new THREE.Mesh(hairGeo, hairMat);
        hair.position.y = 1.37;
        hair.scale.set(1.02, 1.02, 1.02);
        charGroup.add(hair);

        const visorGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.03, 16, 1, false, 0, Math.PI);
        const visorMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.5 });
        const visor = new THREE.Mesh(visorGeo, visorMat);
        visor.position.set(0, 1.45, 0.16);
        visor.rotation.x = 0.2;
        charGroup.add(visor);
      }

      // Arms
      const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.65, 12);
      const leftArm = new THREE.Mesh(armGeo, clothesMat);
      leftArm.position.set(-0.35, 0.72, 0.2);
      leftArm.rotation.x = Math.PI / 3;
      leftArm.rotation.z = -Math.PI / 10;
      charGroup.add(leftArm);

      const rightArm = new THREE.Mesh(armGeo, clothesMat);
      rightArm.position.set(0.35, 0.72, 0.2);
      rightArm.rotation.x = Math.PI / 3;
      rightArm.rotation.z = Math.PI / 10;
      charGroup.add(rightArm);

      // Hands
      const handGeo = new THREE.SphereGeometry(0.09, 12, 12);
      const leftHand = new THREE.Mesh(handGeo, skinMat);
      leftHand.position.set(-0.32, 0.55, 0.5);
      charGroup.add(leftHand);

      const rightHand = new THREE.Mesh(handGeo, skinMat);
      rightHand.position.set(0.32, 0.55, 0.5);
      charGroup.add(rightHand);

      return { charGroup, leftArm, rightArm, body, head };
    };

    // Farmer (Left)
    const farmer = createCharacter({
      shirtColor: 0x15803d,
      hatType: 'farmerHat',
      skinColor: 0xe5b887,
      name: 'Farmer'
    });
    farmer.charGroup.position.set(-1.6, 0.02, 0);
    farmer.charGroup.rotation.y = Math.PI / 4;
    worldGroup.add(farmer.charGroup);

    // Buyer (Right)
    const buyer = createCharacter({
      shirtColor: 0x0369a1,
      hatType: 'buyerCap',
      skinColor: 0xf3cfb2,
      name: 'Buyer'
    });
    buyer.charGroup.position.set(1.6, 0.02, 0);
    buyer.charGroup.rotation.y = -Math.PI / 4;
    worldGroup.add(buyer.charGroup);

    // 8. The Harvest Produce Crate
    const crateGroup = new THREE.Group();
    crateGroup.name = 'Crate';

    const crateBoxGeo = new THREE.BoxGeometry(0.88, 0.46, 0.68);
    const crateMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 });
    const crateBox = new THREE.Mesh(crateBoxGeo, crateMat);
    crateBox.castShadow = true;
    crateBox.receiveShadow = true;
    crateGroup.add(crateBox);

    const rimGeo = new THREE.BoxGeometry(0.92, 0.06, 0.72);
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const rimTop = new THREE.Mesh(rimGeo, rimMat);
    rimTop.position.y = 0.23;
    crateGroup.add(rimTop);

    // Produce Sub-Groups:
    // A) Wheat
    const wheatProduceGroup = new THREE.Group();
    const wheatBundleGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.45, 8);
    const wheatBundleMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });
    for (let k = 0; k < 3; k++) {
      const wb = new THREE.Mesh(wheatBundleGeo, wheatBundleMat);
      wb.position.set((k - 1) * 0.22, 0.24, k % 2 === 0 ? -0.08 : 0.08);
      wb.rotation.z = (k - 1) * 0.15;
      wheatProduceGroup.add(wb);
    }
    crateGroup.add(wheatProduceGroup);

    // B) Tomatoes
    const tomatoProduceGroup = new THREE.Group();
    const tomatoGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const tomatoMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 });
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x15803d });
    for (let x = -1; x <= 1; x++) {
      for (let z = -0.5; z <= 0.5; z += 1) {
        const tom = new THREE.Mesh(tomatoGeo, tomatoMat);
        tom.position.set(x * 0.24, 0.24, z * 0.18);
        const st = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.08, 5), stemMat);
        st.position.set(x * 0.24, 0.35, z * 0.18);
        tomatoProduceGroup.add(tom);
        tomatoProduceGroup.add(st);
      }
    }
    crateGroup.add(tomatoProduceGroup);

    // C) Mangoes
    const mangoProduceGroup = new THREE.Group();
    const mangoGeo = new THREE.SphereGeometry(0.13, 14, 14);
    const mangoMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.35 });
    for (let x = -1; x <= 1; x++) {
      const mg = new THREE.Mesh(mangoGeo, mangoMat);
      mg.scale.set(1.0, 1.25, 0.9);
      mg.position.set(x * 0.25, 0.25, 0);
      mangoProduceGroup.add(mg);
    }
    crateGroup.add(mangoProduceGroup);

    // D) Carrots
    const carrotProduceGroup = new THREE.Group();
    const carrotGeo = new THREE.ConeGeometry(0.09, 0.46, 8);
    const carrotMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.5 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x16a34a });
    for (let x = -1; x <= 1; x++) {
      const cr = new THREE.Mesh(carrotGeo, carrotMat);
      cr.position.set(x * 0.22, 0.22, 0);
      cr.rotation.x = Math.PI * 0.9;
      const lf = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.16, 5), leafMat);
      lf.position.set(x * 0.22, 0.42, 0);
      carrotProduceGroup.add(cr);
      carrotProduceGroup.add(lf);
    }
    crateGroup.add(carrotProduceGroup);

    // Dynamic produce updater
    stateRef.current.updateProduce = (cropKey) => {
      wheatProduceGroup.visible = cropKey === 'wheat';
      tomatoProduceGroup.visible = cropKey === 'tomato';
      mangoProduceGroup.visible = cropKey === 'mango';
      carrotProduceGroup.visible = cropKey === 'carrot';
      crateGroup.scale.set(1.25, 1.25, 1.25);
      playTone('pop', stateRef.current.isMuted);
    };
    stateRef.current.updateProduce('wheat');

    // Pulsing Trade Aura Sphere
    const auraGeo = new THREE.SphereGeometry(0.78, 16, 16);
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.18,
      wireframe: true
    });
    const auraSphere = new THREE.Mesh(auraGeo, auraMat);
    crateGroup.add(auraSphere);

    worldGroup.add(crateGroup);

    // 9. Floating Golden Trade Sparkles
    const particleCount = 55;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleSpeedY = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 4.8;
      particlePositions[i * 3 + 1] = 0.2 + Math.random() * 2.8;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 3.2;
      particleSpeedY[i] = 0.007 + Math.random() * 0.015;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xf59e0b,
      size: 0.09,
      transparent: true,
      opacity: 0.8
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    worldGroup.add(particleSystem);

    // 10. Celebration Confetti Explosion Particles
    const confettiCount = 60;
    const confettiGeo = new THREE.BufferGeometry();
    const confettiPositions = new Float32Array(confettiCount * 3);
    const confettiVelocities = new Float32Array(confettiCount * 3);
    const confettiColors = new Float32Array(confettiCount * 3);

    const palette = [
      new THREE.Color(0x16a34a),
      new THREE.Color(0xf59e0b),
      new THREE.Color(0x0284c7),
      new THREE.Color(0xef4444),
      new THREE.Color(0xa855f7)
    ];

    for (let i = 0; i < confettiCount; i++) {
      confettiPositions[i * 3] = 0;
      confettiPositions[i * 3 + 1] = -10; // offscreen until triggered
      confettiPositions[i * 3 + 2] = 0;

      confettiVelocities[i * 3] = 0;
      confettiVelocities[i * 3 + 1] = 0;
      confettiVelocities[i * 3 + 2] = 0;

      const col = palette[i % palette.length];
      confettiColors[i * 3] = col.r;
      confettiColors[i * 3 + 1] = col.g;
      confettiColors[i * 3 + 2] = col.b;
    }

    confettiGeo.setAttribute('position', new THREE.BufferAttribute(confettiPositions, 3));
    confettiGeo.setAttribute('color', new THREE.BufferAttribute(confettiColors, 3));
    const confettiMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 1.0
    });
    const confettiSystem = new THREE.Points(confettiGeo, confettiMat);
    worldGroup.add(confettiSystem);

    let isConfettiActive = false;

    const launchConfetti = () => {
      const pos = confettiGeo.attributes.position.array;
      for (let i = 0; i < confettiCount; i++) {
        pos[i * 3] = crateGroup.position.x + (Math.random() - 0.5) * 0.4;
        pos[i * 3 + 1] = crateGroup.position.y + 0.3;
        pos[i * 3 + 2] = crateGroup.position.z + (Math.random() - 0.5) * 0.4;

        confettiVelocities[i * 3] = (Math.random() - 0.5) * 0.12;
        confettiVelocities[i * 3 + 1] = 0.08 + Math.random() * 0.12;
        confettiVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.12;
      }
      confettiGeo.attributes.position.needsUpdate = true;
      confettiMat.opacity = 1.0;
      isConfettiActive = true;
    };

    // 11. Celebration Action Function
    const triggerHandshakeCelebration = (customNote) => {
      setTradeSuccess(true);
      crateGroup.scale.set(1.35, 1.35, 1.35);
      farmer.charGroup.position.y = 0.35;
      buyer.charGroup.position.y = 0.35;
      tradeGlowLight.intensity = 3.8;
      launchConfetti();
      playTone('chime', stateRef.current.isMuted);

      const crop = PRODUCE_TYPES[stateRef.current.selectedCrop];
      setSpeech({
        speaker: 'FarmerBandh Smart Settlement',
        avatar: '🎉',
        text: customNote || `Trade Sealed! 100 quintals of ${crop.badge} traded directly at ${crop.priceLabel}. Escrow payment released!`
      });

      setTimeout(() => {
        setTradeSuccess(false);
      }, 4000);
    };
    stateRef.current.triggerCelebration = triggerHandshakeCelebration;

    // 12. Mouse Drag Orbit Controls & Wheel Zoom
    let isMouseDown = false;
    let startPointerX = 0;
    let startPointerY = 0;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotationVelocityY = 0;
    let rotationVelocityX = 0;
    let hasMovedSignificantly = false;

    const onPointerDown = (e) => {
      isMouseDown = true;
      hasMovedSignificantly = false;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      startPointerX = clientX;
      startPointerY = clientY;
      prevMouseX = clientX;
      prevMouseY = clientY;
    };

    const onPointerMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      if (isMouseDown) {
        const deltaTotal = Math.hypot(clientX - startPointerX, clientY - startPointerY);
        if (deltaTotal > 5) {
          hasMovedSignificantly = true;
        }

        const deltaX = clientX - prevMouseX;
        const deltaY = clientY - prevMouseY;
        rotationVelocityY = deltaX * 0.008;
        rotationVelocityX = deltaY * 0.005;

        worldGroup.rotation.y += rotationVelocityY;
        worldGroup.rotation.x = Math.max(-0.45, Math.min(0.55, worldGroup.rotation.x + rotationVelocityX));

        prevMouseX = clientX;
        prevMouseY = clientY;
      }

      // Raycast Hover check for cursor & highlight tooltip
      if (!isMouseDown) {
        const rect = container.getBoundingClientRect();
        mouseCoord.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouseCoord.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
        raycaster.setFromCamera(mouseCoord, camera);
        const intersects = raycaster.intersectObjects(worldGroup.children, true);

        if (intersects.length > 0) {
          let hit = intersects[0].object;
          let foundName = '';
          while (hit && !foundName) {
            if (hit.name) foundName = hit.name;
            hit = hit.parent;
          }
          if (foundName === 'Farmer') {
            container.style.cursor = 'pointer';
            setHoveredObject('👨‍🌾 Ramesh Patel (Farmer) · Click to negotiate');
          } else if (foundName === 'Buyer') {
            container.style.cursor = 'pointer';
            setHoveredObject('🛒 Rahul Verma (Verified Buyer) · Click to view bid');
          } else if (foundName === 'Crate') {
            container.style.cursor = 'pointer';
            setHoveredObject('📦 Fresh Harvest Crate · Click to deliver');
          } else if (foundName === 'Island') {
            container.style.cursor = 'crosshair';
            setHoveredObject('🌱 Click anywhere on the meadow to plant crops');
          } else {
            container.style.cursor = 'grab';
            setHoveredObject(null);
          }
        } else {
          container.style.cursor = 'grab';
          setHoveredObject(null);
        }
      }
    };

    const onPointerUp = () => {
      isMouseDown = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      const zoomDelta = e.deltaY * 0.003;
      stateRef.current.cameraTargetPos.z = Math.max(4.2, Math.min(10.5, stateRef.current.cameraTargetPos.z + zoomDelta));
    };

    stateRef.current.zoomIn = () => {
      stateRef.current.cameraTargetPos.z = Math.max(4.2, stateRef.current.cameraTargetPos.z - 0.8);
      playTone('pop', stateRef.current.isMuted);
    };

    stateRef.current.zoomOut = () => {
      stateRef.current.cameraTargetPos.z = Math.min(10.5, stateRef.current.cameraTargetPos.z + 0.8);
      playTone('pop', stateRef.current.isMuted);
    };

    container.addEventListener('mousedown', onPointerDown);
    container.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('mouseup', onPointerUp);
    window.addEventListener('touchend', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });

    // 13. Raycaster Click Selection
    const raycaster = new THREE.Raycaster();
    const mouseCoord = new THREE.Vector2();

    const onClick = (e) => {
      // Discard clicks that were actually drag gestures
      if (hasMovedSignificantly) return;

      const rect = container.getBoundingClientRect();
      mouseCoord.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseCoord.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      raycaster.setFromCamera(mouseCoord, camera);
      const intersects = raycaster.intersectObjects(worldGroup.children, true);

      if (intersects.length > 0) {
        let hitObject = intersects[0].object;
        let parentName = '';
        let current = hitObject;
        while (current && !parentName) {
          if (current.name) parentName = current.name;
          current = current.parent;
        }

        const crop = PRODUCE_TYPES[stateRef.current.selectedCrop];

        if (parentName === 'Farmer') {
          farmer.charGroup.position.y = 0.28;
          playTone('pop', stateRef.current.isMuted);
          setSpeech({
            speaker: 'Ramesh Patel (Farmer)',
            avatar: '🌾',
            text: crop.farmerQuote
          });
        } else if (parentName === 'Buyer') {
          buyer.charGroup.position.y = 0.28;
          playTone('pop', stateRef.current.isMuted);
          setSpeech({
            speaker: 'Rahul Verma (Verified Buyer)',
            avatar: '🛒',
            text: crop.buyerQuote
          });
        } else if (parentName === 'Crate') {
          triggerHandshakeCelebration();
        } else if (parentName === 'Island') {
          // User clicked on the meadow island: Plant a new crop!
          stateRef.current.sproutAt(intersects[0].point);
        }
      }
    };

    container.addEventListener('click', onClick);

    // 14. Reset View
    stateRef.current.resetView = () => {
      worldGroup.rotation.set(0, 0, 0);
      setActiveCameraView('orbit');
      stateRef.current.cameraTargetPos.set(0, 3.2, 7.5);
      stateRef.current.cameraTargetLook.set(0, 0.8, 0);
      playTone('pop', stateRef.current.isMuted);
    };

    // 15. Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 520;
      height = container.clientHeight || 480;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 16. Animation Loop
    const clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera interpolation towards target position & lookAt
      camera.position.lerp(stateRef.current.cameraTargetPos, 0.08);
      cameraLookAt.lerp(stateRef.current.cameraTargetLook, 0.08);
      camera.lookAt(cameraLookAt);

      // Inertia on 360° Drag Rotation & gentle background spin when idle
      if (!isMouseDown) {
        rotationVelocityY *= 0.94;
        rotationVelocityX *= 0.94;
        worldGroup.rotation.y += rotationVelocityY + 0.0018;
        worldGroup.rotation.x += rotationVelocityX;
      }

      // Island gentle float
      island.position.y = -0.17 + Math.sin(elapsedTime * 1.5) * 0.02;

      // Determine Trade Progress (Auto-Play vs Manual Scrubber)
      let currentProgress = stateRef.current.manualScrub;
      if (stateRef.current.isAutoPlaying) {
        currentProgress = (Math.sin(elapsedTime * 1.4) + 1) / 2;
      }

      // Crate Hand-off Sinusoidal Arc based on progress
      const crateX = -0.9 + currentProgress * 1.8;
      const crateY = 0.85 + Math.sin(currentProgress * Math.PI) * 0.34;
      const crateZ = Math.sin(currentProgress * Math.PI) * 0.18;

      crateGroup.position.set(crateX, crateY, crateZ);
      crateGroup.rotation.y = (currentProgress - 0.5) * 0.4;
      crateGroup.rotation.z = (currentProgress - 0.5) * 0.22;

      // Smooth Crate Scale Return after pop
      crateGroup.scale.x += (1.0 - crateGroup.scale.x) * 0.06;
      crateGroup.scale.y += (1.0 - crateGroup.scale.y) * 0.06;
      crateGroup.scale.z += (1.0 - crateGroup.scale.z) * 0.06;

      // Aura sphere pulse
      auraSphere.rotation.y += 0.02;
      const auraScale = 1.0 + Math.sin(elapsedTime * 4.0) * 0.12;
      auraSphere.scale.set(auraScale, auraScale, auraScale);
      tradeGlowLight.position.set(crateX, crateY + 0.2, 0.4);

      // Dynamic Character Reaching Arm Motions
      const farmerReach = Math.max(0, 1.0 - currentProgress * 1.6);
      farmer.leftArm.rotation.x = Math.PI / 3 + farmerReach * 0.35;
      farmer.rightArm.rotation.x = Math.PI / 3 + farmerReach * 0.35;
      farmer.charGroup.position.y += (0.02 + Math.sin(elapsedTime * 2.0) * 0.02 - farmer.charGroup.position.y) * 0.1;
      farmer.head.rotation.y = (currentProgress * 0.3) - 0.15;

      const buyerReach = Math.max(0, (currentProgress - 0.3) * 1.4);
      buyer.leftArm.rotation.x = Math.PI / 3 + buyerReach * 0.35;
      buyer.rightArm.rotation.x = Math.PI / 3 + buyerReach * 0.35;
      buyer.charGroup.position.y += (0.02 + Math.cos(elapsedTime * 2.0) * 0.02 - buyer.charGroup.position.y) * 0.1;
      buyer.head.rotation.y = ((1.0 - currentProgress) * -0.3) + 0.15;

      // Animate user-sprouted plants
      for (let s = 0; s < sproutsGroup.children.length; s++) {
        const item = sproutsGroup.children[s];
        if (item.userData && item.userData.currentScale < item.userData.targetScale) {
          item.userData.currentScale += 0.08;
          const sc = Math.min(1.0, item.userData.currentScale);
          item.scale.set(sc, sc, sc);
        }
        item.rotation.z = Math.sin(elapsedTime * 2.5 + s) * 0.06;
      }

      // Golden Trade Ambient Sparkles
      const positions = particleGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += particleSpeedY[i];
        if (positions[i * 3 + 1] > 3.2) {
          positions[i * 3 + 1] = 0.2;
          positions[i * 3] = (Math.random() - 0.5) * 4.8;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Confetti physics update
      if (isConfettiActive) {
        const cPos = confettiGeo.attributes.position.array;
        for (let i = 0; i < confettiCount; i++) {
          cPos[i * 3] += confettiVelocities[i * 3];
          cPos[i * 3 + 1] += confettiVelocities[i * 3 + 1];
          cPos[i * 3 + 2] += confettiVelocities[i * 3 + 2];
          confettiVelocities[i * 3 + 1] -= 0.0035; // gravity
        }
        confettiGeo.attributes.position.needsUpdate = true;
        confettiMat.opacity -= 0.008;
        if (confettiMat.opacity <= 0.01) {
          isConfettiActive = false;
        }
      }

      // Sway Wheat Stalks
      for (let i = 0; i < cropGroup.children.length; i++) {
        const stalk = cropGroup.children[i];
        stalk.rotation.z = Math.sin(elapsedTime * 2.2 + i) * 0.08;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 17. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousedown', onPointerDown);
      container.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      window.removeEventListener('touchend', onPointerUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }

      islandGeo.dispose();
      islandMat.dispose();
      soilGeo.dispose();
      soilMat.dispose();
      pathGeo.dispose();
      pathMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      confettiGeo.dispose();
      confettiMat.dispose();
      crateBoxGeo.dispose();
      crateMat.dispose();
      auraGeo.dispose();
      auraMat.dispose();
      sproutStemGeo.dispose();
      sproutStemMat.dispose();
      sproutFlowerGeo.dispose();
      sproutFlowerMat.dispose();
      renderer.dispose();
    };
  }, []);

  const currentCrop = PRODUCE_TYPES[selectedCrop] || PRODUCE_TYPES.wheat;

  // Handle Price Negotiation Submission
  const handleProposeOffer = () => {
    const diff = customOffer - currentCrop.price;
    if (diff === 0) {
      stateRef.current.triggerCelebration(
        `Direct Price Agreed! Buyer offered exact asking rate ₹${customOffer.toLocaleString('en-IN')}/quintal. Contract generated!`
      );
    } else if (diff < -150) {
      playTone('shake', isMuted);
      setSpeech({
        speaker: 'Ramesh Patel (Farmer)',
        avatar: '🌾',
        text: `Offer ₹${customOffer.toLocaleString('en-IN')} is too low, bhai! Seed, water & organic fertilizer input is ₹2,200. Fair direct rate is ₹${currentCrop.price.toLocaleString('en-IN')}.`
      });
    } else if (diff < 0) {
      playTone('pop', isMuted);
      setSpeech({
        speaker: 'Ramesh Patel (Farmer)',
        avatar: '🤝',
        text: `Counter-offer: How about ₹${(currentCrop.price - 50).toLocaleString('en-IN')}? Close enough for direct farm delivery!`
      });
    } else {
      stateRef.current.triggerCelebration(
        `Generous Fair Deal! Buyer offered ₹${customOffer.toLocaleString('en-IN')}/quintal. Farmer accepted with priority harvest dispatch!`
      );
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '480px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '24px',
        backgroundColor: lightingMode === 'night' ? '#0F172A' : '#FFFFFF',
        border: '1.5px solid #BBF7D0',
        boxShadow: '0 12px 35px -8px rgba(27,77,62,0.15)',
        overflow: 'hidden',
        transition: 'background-color 0.4s ease'
      }}
    >
      {/* 1. TOP FLOATING CONTROL BAR */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          right: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
          pointerEvents: 'auto',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        {/* Produce Quick-Switch Pills */}
        <div
          style={{
            display: 'inline-flex',
            backgroundColor: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(10px)',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '3px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
        >
          {Object.entries(PRODUCE_TYPES).map(([key, data]) => {
            const isActive = selectedCrop === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedCrop(key)}
                style={{
                  border: 'none',
                  backgroundColor: isActive ? '#1B4D3E' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#374151',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.78rem',
                  padding: '4px 9px',
                  borderRadius: '9px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
                title={`Switch to ${data.label}`}
              >
                <span>{data.icon}</span>
                <span className="hidden sm:inline">{data.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Tools: Camera Views, Lighting, Audio & Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* Camera View Selector */}
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(10px)',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '3px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}
          >
            {Object.entries(CAMERA_VIEWS).map(([key, view]) => {
              const Icon = view.icon;
              const isActive = activeCameraView === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveCameraView(key)}
                  style={{
                    border: 'none',
                    backgroundColor: isActive ? '#1B4D3E' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#6B7280',
                    padding: '4px 7px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title={view.label}
                >
                  <Icon size={13} />
                </button>
              );
            })}
          </div>

          {/* Lighting Mode Selector */}
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(10px)',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '3px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}
          >
            {[
              { id: 'morning', icon: Sun, label: 'Day' },
              { id: 'golden', icon: Sunset, label: 'Sunset' },
              { id: 'night', icon: Moon, label: 'Night' }
            ].map((mode) => {
              const Icon = mode.icon;
              const isActive = lightingMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setLightingMode(mode.id)}
                  style={{
                    border: 'none',
                    backgroundColor: isActive ? '#1B4D3E' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#6B7280',
                    padding: '4px 6px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title={mode.label}
                >
                  <Icon size={13} />
                </button>
              );
            })}
          </div>

          {/* Zoom Buttons (+ and -) */}
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(10px)',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              padding: '3px'
            }}
          >
            <button
              type="button"
              onClick={() => stateRef.current.zoomIn && stateRef.current.zoomIn()}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#374151',
                padding: '4px 5px',
                cursor: 'pointer',
                display: 'flex'
              }}
              title="Zoom In"
            >
              <ZoomIn size={13} />
            </button>
            <button
              type="button"
              onClick={() => stateRef.current.zoomOut && stateRef.current.zoomOut()}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#374151',
                padding: '4px 5px',
                cursor: 'pointer',
                display: 'flex'
              }}
              title="Zoom Out"
            >
              <ZoomOut size={13} />
            </button>
          </div>

          {/* Audio Mute/Unmute */}
          <button
            type="button"
            onClick={() => setIsMuted(!isMuted)}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(10px)',
              border: '1px solid #E5E7EB',
              borderRadius: '10px',
              padding: '5px 7px',
              color: isMuted ? '#9CA3AF' : '#1B4D3E',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
            }}
            title={isMuted ? 'Unmute sounds' : 'Mute sounds'}
          >
            {isMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
          </button>
        </div>
      </div>

      {/* 2. 3D WEBGL CANVAS */}
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '480px'
        }}
      />

      {/* 3. HOVER OBJECT LIVE TOOLTIP HINT */}
      {hoveredObject && (
        <div
          style={{
            position: 'absolute',
            top: '52px',
            left: '12px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            color: '#F9FAFB',
            padding: '3px 10px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: 600,
            pointerEvents: 'none',
            backdropFilter: 'blur(6px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {hoveredObject}
        </div>
      )}

      {/* 4. SPROUT COUNTER BADGE */}
      {sproutCount > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '52px',
            right: '12px',
            backgroundColor: 'rgba(34, 197, 94, 0.92)',
            color: '#FFFFFF',
            padding: '3px 9px',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: 700,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            boxShadow: '0 2px 8px rgba(34,197,94,0.3)'
          }}
        >
          <Sprout size={12} />
          <span>{sproutCount} Crops Planted</span>
        </div>
      )}

      {/* 5. INTERACTIVE SPEECH BUBBLE */}
      {speech && (
        <div
          style={{
            position: 'absolute',
            bottom: showNegotiator ? '146px' : '96px',
            left: '14px',
            right: '14px',
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid #10B981',
            borderRadius: '14px',
            padding: '10px 14px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            zIndex: 12,
            animation: 'fadeIn 0.2s ease-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>{speech.avatar}</span>
            <div>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#1B4D3E',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                {speech.speaker}
              </div>
              <div
                style={{
                  fontSize: '0.84rem',
                  color: '#1F2937',
                  fontWeight: 500,
                  lineHeight: 1.3,
                  marginTop: '2px'
                }}
              >
                "{speech.text}"
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSpeech(null)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1rem',
              color: '#9CA3AF',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 6. EXPANDABLE PRICE NEGOTIATION SIMULATOR */}
      {showNegotiator && (
        <div
          style={{
            position: 'absolute',
            bottom: '92px',
            left: '12px',
            right: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.97)',
            backdropFilter: 'blur(12px)',
            border: '1.5px solid #BBF7D0',
            borderRadius: '14px',
            padding: '10px 14px',
            boxShadow: '0 8px 24px rgba(27,77,62,0.15)',
            zIndex: 11,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1B4D3E' }}>
              Direct Negotiation Simulator:
            </span>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <button
                type="button"
                onClick={() => setCustomOffer((prev) => Math.max(1000, prev - 50))}
                style={{
                  backgroundColor: '#F3F4F6',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                - ₹50
              </button>
              <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#059669', minWidth: '70px', textAlign: 'center' }}>
                ₹{customOffer.toLocaleString('en-IN')}
              </span>
              <button
                type="button"
                onClick={() => setCustomOffer((prev) => prev + 50)}
                style={{
                  backgroundColor: '#F3F4F6',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  padding: '2px 8px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                + ₹50
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              type="button"
              onClick={handleProposeOffer}
              style={{
                backgroundColor: '#1B4D3E',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '4px 12px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>Send Offer</span>
              <TrendingUp size={12} />
            </button>
            <button
              type="button"
              onClick={() => setShowNegotiator(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#6B7280',
                cursor: 'pointer',
                padding: '2px'
              }}
            >
              <X size={15} />
            </button>
          </div>
        </div>
      )}

      {/* 7. BOTTOM INTERACTIVE TRADE FLOW & SCRUBBER BAR */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          right: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          zIndex: 10,
          pointerEvents: 'auto'
        }}
      >
        {/* Interactive Produce Handoff Scrubber Slider */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.94)',
            backdropFilter: 'blur(10px)',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
        >
          {/* Play/Pause Toggle */}
          <button
            type="button"
            onClick={() => {
              setIsAutoPlaying(!isAutoPlaying);
              playTone('pop', isMuted);
            }}
            style={{
              backgroundColor: isAutoPlaying ? '#E8F5E9' : '#F3F4F6',
              color: isAutoPlaying ? '#1B4D3E' : '#374151',
              border: 'none',
              borderRadius: '8px',
              padding: '4px 8px',
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title={isAutoPlaying ? 'Pause to manually drag hand-off' : 'Resume auto animation'}
          >
            {isAutoPlaying ? <Pause size={12} /> : <Play size={12} />}
            <span>{isAutoPlaying ? 'Auto' : 'Manual'}</span>
          </button>

          {/* Scrubber Label Farmer */}
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#15803D', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span>🧑‍🌾</span>
            <span className="hidden sm:inline">Farmer</span>
          </span>

          {/* Interactive Range Slider */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={manualScrub}
            onChange={(e) => {
              setIsAutoPlaying(false);
              const val = parseFloat(e.target.value);
              setManualScrub(val);
              if (val > 0.95 && !tradeSuccess) {
                stateRef.current.triggerCelebration();
              }
            }}
            style={{
              flex: 1,
              accentColor: '#1B4D3E',
              cursor: 'ew-resize',
              height: '5px'
            }}
            title="Drag crate from Farmer to Buyer manually"
          />

          {/* Scrubber Label Buyer */}
          <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0369A1', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <span className="hidden sm:inline">Buyer</span>
            <span>🛒</span>
          </span>
        </div>

        {/* Action Controls & Deal Badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px'
          }}
        >
          {/* Live Price Tag Pill */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.94)',
              backdropFilter: 'blur(10px)',
              border: '1px solid #BBF7D0',
              borderRadius: '10px',
              padding: '5px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#16A34A',
                boxShadow: '0 0 6px #16A34A'
              }}
            />
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#1B4D3E' }}>
              {currentCrop.badge}:
            </span>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#059669' }}>
              {currentCrop.priceLabel}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* Negotiator Panel Toggle */}
            <button
              type="button"
              onClick={() => {
                setShowNegotiator(!showNegotiator);
                playTone('pop', isMuted);
              }}
              style={{
                backgroundColor: showNegotiator ? '#1B4D3E' : '#FFFFFF',
                color: showNegotiator ? '#FFFFFF' : '#1B4D3E',
                border: '1.5px solid #1B4D3E',
                borderRadius: '10px',
                padding: '6px 12px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                transition: 'all 0.15s ease'
              }}
            >
              <Sliders size={13} />
              <span>Bargain / Offer</span>
            </button>

            {/* Execute Direct Trade Button */}
            <button
              type="button"
              onClick={() => stateRef.current.triggerCelebration && stateRef.current.triggerCelebration()}
              style={{
                backgroundColor: tradeSuccess ? '#059669' : '#1B4D3E',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '6px 14px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(27,77,62,0.25)',
                transition: 'all 0.2s ease',
                transform: tradeSuccess ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              {tradeSuccess ? <Check size={14} strokeWidth={3} /> : <Handshake size={14} />}
              <span>{tradeSuccess ? 'Trade Executed!' : 'Seal Deal'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerBuyerScene;
