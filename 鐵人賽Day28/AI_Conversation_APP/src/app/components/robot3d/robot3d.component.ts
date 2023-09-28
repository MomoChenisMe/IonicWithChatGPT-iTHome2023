import { AfterViewInit, Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Subject, takeUntil } from 'rxjs';
import { AIStyle } from 'src/app/models/chatgpt.model';
import { StatusService } from 'src/app/services/status.service';

@Component({
  selector: 'app-robot3d',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './robot3d.component.html',
  styleUrls: ['./robot3d.component.scss']
})
export class Robot3dComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('divElement') private divElementRef: ElementRef | undefined;
  @ViewChild('canvasElement') private canvasElementRef: ElementRef | undefined;

  private get div(): HTMLDivElement {
    return this.divElementRef?.nativeElement;
  }

  private get canvas(): HTMLCanvasElement {
    return this.canvasElementRef?.nativeElement;
  }

  private scene!: THREE.Scene; //場景空間
  private clock!: THREE.Clock; //時間追蹤
  private camera!: THREE.PerspectiveCamera; //透視的攝影機
  private renderer!: THREE.WebGLRenderer; //渲染器的核心
  private gltfLoader!: GLTFLoader; //GLTF讀取器
  private mixer!: THREE.AnimationMixer; //管理動畫的物件
  private animationAction!: THREE.AnimationAction; //動畫類別
  private css2DRenderer!: CSS2DRenderer; //三維物體和HTML標籤結合渲染器
  private controls!: OrbitControls; //攝影機控制器(旋轉、縮放、平移)

  //動畫清單
  private animationList: {
    name: AIStyle;
    animationAction: THREE.AnimationAction;
  }[] = [];

  //解除訂閱用
  private destroy$ = new Subject();

  constructor(private statusService: StatusService) { }

  ngOnInit(): void {
    //訂閱語氣
    this.statusService.styleStatus$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(styleStatusResult => {
      if (this.animationAction) {
        //停止當前動畫
        this.animationAction.stop();
        //尋找動畫清單內的對應動畫
        this.animationAction = this.animationList.find(item => item.name === styleStatusResult)!.animationAction;
        //播放動畫
        this.animationAction.play();
      }
    });
  }

  ngOnDestroy(): void {
    //解除訂閱
    this.destroy$.next(null);
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    //設置場景、攝影機和光源
    this.createScene();
    //讀取3D模型、設定座標、旋轉角和動畫
    this.createGLTF3DModel();
    //畫面渲染
    this.startRendering();
    //鏡頭控制
    this.addControls();
  }

  private createScene() {
    this.clock = new THREE.Clock();
    this.scene = new THREE.Scene();

    //設定透明背景，因此這裡需要null
    this.scene.background = null;

    //fov: 視野角度
    //aspect: 攝影機視場的寬度與高度的比例
    //near: 近裁面距離，任何距離攝影機小於0.1的物體都不會被渲染
    //far: 遠裁面距離，任何距離攝影機大於1000的物體都不會被渲染
    this.camera = new THREE.PerspectiveCamera(55, 0.7, 0.1, 1000);

    //攝影機位置
    this.camera.position.set(0, 0, 15);
    this.camera.updateMatrix();

    //環境光: 注意!無陰影的光源!
    let ambientLight = new THREE.AmbientLight(0xffffff, 2);
    this.scene.add(ambientLight);

    //方向光: 是一種有方向性的光源
    let directionLight = new THREE.DirectionalLight(0xffffff, 1);
    directionLight.position.set(0, 1, 0);
    directionLight.castShadow = true;
    this.scene.add(directionLight);
  }

  private createGLTF3DModel() {
    this.gltfLoader = new GLTFLoader();
    //使用GLTF讀取器加載3D模型
    this.gltfLoader.load('assets/robot3DModel/scene.gltf',
      (gltf: GLTF) => {
        //設定3D模型座標位置
        gltf.scene.position.set(1.5, -5, 0);
        //設定3D模型旋轉角度
        gltf.scene.rotation.y = Math.PI;
        //添加模型到場景中
        this.scene.add(gltf.scene);
        //管理3D模型的動畫
        this.mixer = new THREE.AnimationMixer(gltf.scene);
        gltf.animations.forEach((clip: THREE.AnimationClip) => {
          //儲存所有動畫
          this.animationList.push({
            name: this.convertAnimationName(clip.name),
            animationAction: this.mixer.clipAction(clip)
          });
          //先將名字為"IDLE"的動畫抓出來顯示
          if (clip.name === "IDLE") {
            this.animationAction = this.mixer.clipAction(clip);
            this.animationAction.play();
          }
        });
      }, function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
      }, function (error) {
        console.log(error);
      }
    );
  }

  private startRendering() {
    //canvas:canvas HTMLCanvasElement
    //antialias:抗鋸齒
    //alpha:透明度
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    //官方說使用GLTF檔案，必須要關閉
    this.renderer.useLegacyLights = false;
    //設定輸出色彩空間
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    //設置透明度0，讓場景背景透明用
    this.renderer.setClearColor(0x000000, 0);
    //同步渲染器的像素
    this.renderer.setPixelRatio(window.devicePixelRatio);

    let thisComponent: Robot3dComponent = this;
    //立即調用的函數表達式(Immediately Invoked Function Expression，縮寫IIFE)
    (function render() {
      //Web API
      requestAnimationFrame(render);
      if (thisComponent.mixer) {
        //根據時間差更新動畫
        const delta = thisComponent.clock.getDelta();
        thisComponent.mixer.update(delta);
      }
      thisComponent.renderer.render(thisComponent.scene, thisComponent.camera);
    }());
  }

  private addControls() {
    this.css2DRenderer = new CSS2DRenderer();
    this.css2DRenderer.domElement.style.position = 'absolute';
    this.css2DRenderer.domElement.style.top = '0px';
    this.css2DRenderer.domElement.style.width = '100%';
    this.css2DRenderer.domElement.style.height = '100%';
    this.div.appendChild(this.css2DRenderer.domElement);
    this.controls = new OrbitControls(this.camera, this.css2DRenderer.domElement);
    //禁用縮放
    this.controls.enableZoom = false;
    //禁用平移
    this.controls.enablePan = false;
    //限制y軸旋轉角度
    this.controls.minPolarAngle = Math.PI * 60 / 180;
    this.controls.maxPolarAngle = Math.PI / 2;
    //限制x軸旋轉角度
    this.controls.minAzimuthAngle = -Math.PI * 40 / 180;
    this.controls.maxAzimuthAngle = Math.PI * 40 / 180;
    //更新控制器
    this.controls.update();
  }

  private convertAnimationName(animationName: string): AIStyle {
    if (animationName === 'IDLE') {
      return 'friendly';
    } else if (animationName === 'ATTACK') {
      return 'excited';
    } else if (animationName === 'RUN') {
      return 'cheerful';
    }
    return '';
  }
}
