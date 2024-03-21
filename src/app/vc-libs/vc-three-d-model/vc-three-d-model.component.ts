/* eslint-disable */
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import {
  AnimationClip,
  AnimationMixer,
  Clock,
  Color,
  DirectionalLight,
  LoopRepeat,
  Object3D,
  Object3DEventMap,
  PerspectiveCamera,
  Scene,
  WebGLRenderer
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

@Component({
  selector: 'app-vc-three-d-model',
  standalone: true,
  imports: [],
  template: `<div #threeModel></div>`
})
export class VcThreeDModelComponent implements OnInit {
  @ViewChild('threeModel', { static: true }) threeModel!: ElementRef;
  @Input({ required: true }) modelURL!: string;

  private scene!: Scene;
  private camera!: PerspectiveCamera;
  private renderer!: WebGLRenderer;
  private mixer!: AnimationMixer;
  private clock = new Clock();

  ngOnInit(): void {
    this.initScene();
  }

  private initScene(): void {
    this.camera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.y = 50;
    this.camera.position.x = 50;

    this.scene = new Scene();
    this.scene.background = new Color(0xf0f0f0);

    const light1 = new DirectionalLight(0xefefff, 5);
    light1.position.set(1, 1, 1).normalize();
    this.scene.add(light1);

    const light2 = new DirectionalLight(0xffefef, 5);
    light2.position.set(-1, -1, -1).normalize();
    this.scene.add(light2);

    this.loadModel();

    this.setRenderer();

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private loadModel() {
    const extension = this.modelURL.split('.').pop();
    let loader;

    if (extension === 'glb') {
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderConfig({ type: 'js' });
      dracoLoader.setDecoderPath(
        'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/jsm/libs/draco/gltf/'
      );
      loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);
    } else if (extension === 'fbx') {
      loader = new FBXLoader();
    }

    loader?.load(this.modelURL, (object) => {
      let model = object as Object3D<Object3DEventMap>;
      if (extension === 'glb') {
        model = (object as GLTF).scene;
      }
      const animations = object.animations;

      // Add the loaded model to the scene
      this.scene.add(model);

      this.mixer = new AnimationMixer(model);

      // Loop through the available animations and create an action for each
      animations.forEach((clip: AnimationClip) => {
        // Create an action for the animation
        const action = this.mixer.clipAction(clip);

        // You can set the loop mode, like LoopOnce or LoopPingPong
        action.setLoop(LoopRepeat, Infinity);

        // Play the animation
        action.play();
      });

      this.render();
    });
  }

  private setRenderer() {
    this.renderer = new WebGLRenderer();
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.threeModel.nativeElement.appendChild(this.renderer.domElement);
    this.setOrbitControls();
  }

  private setOrbitControls() {
    const controls = new OrbitControls(this.camera, this.renderer.domElement);
    controls.addEventListener('change', this.render.bind(this));
    controls.update();
  }

  private onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private render(): void {
    requestAnimationFrame(() => this.render());

    const delta = this.clock.getDelta();
    this.mixer?.update(delta);

    this.renderer.render(this.scene, this.camera);
  }
}
