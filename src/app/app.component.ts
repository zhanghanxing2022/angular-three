import { Component,OnInit } from '@angular/core';
import * as THREE from "three";
import { DataUtils, LineBasicMaterial, Matrix4, Object3D, PlaneGeometry, SphereGeometry, TextureLoader, Vector3, Vector4 } from 'three';
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { Font, FontLoader } from "three/examples/jsm/loaders/FontLoader";
import {RGBELoader} from "three/examples/jsm/loaders/RGBELoader";
import {Reflector} from "three/examples/jsm/objects/Reflector";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { MTLLoader} from'three/examples/jsm/loaders/MTLLoader';
import { OBJLoader} from'three/examples/jsm/loaders/OBJLoader';
import {FBXLoader} from'three/examples/jsm/loaders/FBXLoader';
import { Cube4 } from './Cube4';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{

  xy=0;
  xz=0;
  xw=0;
  yz=0;
  yw=0;
  zw=0;
  title = 'angular-three';
  assetsPath='../assets/';
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
  render = new THREE.WebGLRenderer({antialias:true});
  mixer?:THREE.AnimationMixer;
  rotation=0;
  clips: THREE.AnimationClip[] | undefined;
  myclip: THREE.Group | undefined;
  controls :any;
  gltf: any;
  a: any;
  anims = ['Walking', 'Walking Backwards', 'Turning', 'SlowRun',"Idle"];
  animations:Map<string,any>=new Map();
  mode: any;
  action: string="";
  root: THREE.Group = new THREE.Group();
  actionTime: number= Date.now();
  bias =1.0;
  cubeReset()
  {
    this.SuperCube4.reset();
    for(let id in this.last)
        {
          this.scene.remove(this.last[id]);
          
        }
        for(let id in this.lastG)
        {
          this.lastG[id].dispose();
        }
    this.last = [];
    this.lastG=[];
    this.superCubeCast();
    this.cubeInit=true
  }
  objLoader():void
  {
    var mtlLoader = new MTLLoader();
    mtlLoader.setPath("../assets/xg/");
    mtlLoader.load('xg2.mtl', (materials) =>{
        materials.preload();
        console.log(materials);
        var objLoader = new OBJLoader();
        objLoader.setPath("../assets/xg/");
        objLoader.setMaterials(materials);
          objLoader.load('xg2.obj',  ( object ) =>{
              this.mixer = new THREE.AnimationMixer( object );
              this.root=object;
              object.position.y =  0;
              console.log(objLoader.materials)
              let a =new Matrix4();
              a.makeScale(1,1,1);
              object.applyMatrix4(a);
              // if has object, add to scene
              // if (object.children.length > 0) {
              //     this.scene.add( object.children[0] );
              // }
              this.scene.add(object);
              object.translateX(5)
              object.traverse((child)=>{
                child.castShadow=true;
                child.receiveShadow = false;
                if (child instanceof THREE.Mesh)
                {
                    //重点，没有该句会导致PNG显示透明效果
                    child.material.transparent = false;
                }

              })
        });
    });
  }
  loadAnimate():void{
    new FBXLoader().setPath("../assets/xg/").load("xg.fbx",(gltf)=>{

      this.gltf=gltf;
      console.log(gltf);
      // this.scene.applyMatrix4(a);
      // idle 0-195
      // this.myclip = gltf;
      this.mixer = new THREE.AnimationMixer(gltf);
      this.scene.add(gltf);
      // this.clips = gltf.animations;
      // var _mixer = this.mixer;
      // this.clips.forEach(function(clip)
      // {
      //   if(_mixer)
      //   {
      //     const action =_mixer.clipAction(clip);
      //     action.loop = THREE.LoopRepeat;
      //     action.play();
      //     action.clampWhenFinished = true;
      //   }
        
      // });
      gltf.traverse((child)=>{
        child.castShadow=true;
        child.receiveShadow = true;
        if (child instanceof THREE.Mesh)
        {
            //重点，没有该句会导致PNG显示透明效果
            child.material.transparent = false;
        }
      })
      this.loadNextAnim(new FBXLoader());
    }, undefined, function ( error ) {

      console.error( error );
    
    });
  }
  loadStatic():void
  {

    new FBXLoader().load("../assets/animate/Idle.fbx",(object)=>
    // new GLTFLoader().load("../assets/xg/model.glb",(object)
    {
      console.log(object)
      this.mixer = new THREE.AnimationMixer( object );
      this.root=object;
      let a =new Matrix4();
      a.makeScale(0.01,0.01,0.01);
      object.applyMatrix4(a);
    
      this.scene.add(object);
      object.traverse((child)=>{
        child.castShadow=true;
        child.receiveShadow = true;
        if (child instanceof THREE.Mesh)
        {
            //重点，没有该句会导致PNG显示透明效果
            child.material.transparent = false;
        }

      })
      console.log(object)
    })
    this.loadNextAnim(new FBXLoader());
  }
  set act(name:string)
  {
    if (this.action== name) return;
		const clip = this.animations.get(name); 
    if(this.mixer)
    {
      const action = this.mixer.clipAction( clip );
        action.time = 0;
        console.log(action);
      this.mixer.stopAllAction();
      this.action = name;
      this.actionTime = Date.now();
      
      action.fadeIn(0.5);	
      action.play();
      /*
      p.component.ts:82 THREE.PropertyBinding: Trying to update node for track: mixamorigHips.position but it wasn't found.
b*/
    }
		
  }
  get act(){
		return this.action;
	}
  loadNextAnim(loader:FBXLoader){
		let anim = this.anims.pop();
    if(anim == undefined)
      return;
		const game = this;
    console.log(anim)
		loader.load( this.assetsPath+"animate/"+anim+".fbx", function( object ){
      console.log(object)
      let a =new Matrix4();
      a.makeScale(1000,1000,1000);
      object.applyMatrix4(a);
      if(anim)
        game.animations.set(anim, object.animations[0]);
			if (game.anims.length>0){
				game.loadNextAnim(loader);
			}else{
				game.action = "Idle";
				// game.mode = game.modes.ACTIVE;
				// game.animate();
			}
		});	
	}
  floor():void{
    new TextureLoader().load("../assets/large_floor_tiles_02_4k.gltf/textures/large_floor_tiles_02_diff_4k.jpg", 
    (texture) =>{
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 4);
      const floorMaterial = new THREE.MeshBasicMaterial({
          map: texture,
          side: THREE.DoubleSide
      });
      const floorGeometry = new THREE.PlaneGeometry(500, 500, 5, 5);
      const floor = new THREE.Mesh(floorGeometry, floorMaterial);
      floor.position.y = 0;
      floor.rotation.x = Math.PI / 2;
      this.scene.add(floor);
    })
  }
  hdr():void
  {
    new RGBELoader().load("../assets/belfast_sunset_puresky_4k.hdr",(texture: THREE.Texture | null) =>
    {
      if(texture!=null)
      {
        this.scene.background = texture;
        texture.mapping = THREE.EquirectangularReflectionMapping;
        this.scene.environment = texture;
        this.render.outputEncoding = THREE.sRGBEncoding;
        this.render.render(this.scene,this.camera);
      }
      
    })
  }
  
  SuperCube4= new Cube4();
  cube = new THREE.Object3D();
  last:Array<Object3D>=[];
  lastG:Array<THREE.BufferGeometry>=[];
  material = new THREE.LineBasicMaterial( { color: 0x0000ff } );
  cubeInit = true;
  cubeGo = true;
  pointMaterial = new THREE.PointsMaterial({
    color: 0xffFfff,    //设置颜色，默认 0xFFFFFF
    vertexColors: false, //定义材料是否使用顶点颜色，默认false ---如果该选项设置为true，则color属性失效
    size: 0.05             //定义粒子的大小。默认为1.0
  });
  Changecube()
  {
    this.cubeGo=!this.cubeGo;
  }
  superCubeCast()
  {
    this.cube.clear();
    
    if(this.xy||this.xz||this.xw||this.yz||this.yw||this.zw||this.cubeInit)
    {
      if(this.cubeGo||this.cubeInit)
      {
        
        
        this.cubeInit = false;
        const bias =this.bias;
        this.SuperCube4.rotate(0,this.xy*bias*1).rotate(1,this.xz*bias*1).rotate(2,this.xw*bias*1).rotate(3,this.yz*bias*1).rotate(4,this.yw*bias*1).rotate(5,this.zw*bias);
        const tempList = this.SuperCube4.castShadow();
        const Linegeometry = new THREE.BufferGeometry().setFromPoints( tempList );
        const point  = new THREE.Points(Linegeometry,this.pointMaterial);
        let a =new Matrix4();
        a.makeScale(10,10,10);
        point.applyMatrix4(a);
        this.scene.add(point)
        this.SuperCube4.edge.forEach((value,index)=>
        {
          value.forEach(v=>
            {
              
              const points = [tempList[index],tempList[v]];
              const geometry = new THREE.BufferGeometry().setFromPoints( points );
              this.lastG.push(geometry);
              const line = new THREE.Line( geometry,this.material );
              this.cube.add(line);
              let a =new Matrix4();
              a.makeScale(10,10,10);
              line.applyMatrix4(a);
              this.last.push(line);
              this.scene.add(line);
            })
          
        })
      }
      
    }
    
  }
  ngOnInit(): void {

    
    
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.render.setSize(window.innerWidth,window.innerHeight);
    document.body.firstElementChild?.appendChild(this.render.domElement);
    this.render.domElement.focus();
    this.render.domElement.tabIndex=0;

    this.controls = new OrbitControls(this.camera, this.render.domElement); 
    let onkeydown = (ev: KeyboardEvent):void=>
    {
      switch (ev.key) {
        case 'a':
          this.rotation = 0.01;
          break;
        case 'd':
          this.rotation = -0.01;
          break;
        case 'r':
          this.act="SlowRun";
          break;
        case 'i':
          this.act="Idle";
          break;
        case 'b':
            this.act="Walking Backwards";
            break;
        case 'w':
          this.act="Walking";
          break
        default:
          this.rotation = 0;
          break;
      }
    }
    window.addEventListener("keydown",onkeydown);
    window.addEventListener("keyup",():void=>
    {
      this.rotation = 0;
    });
    
    this.render.setClearColor( 0x000000 );
    const geometry = new THREE.BoxGeometry(1,1,1);
    const material = new THREE.MeshLambertMaterial({color:0x0000ff});
    const myCube = new THREE.Mesh(geometry,material);
    // scene.add(myCube);

    this.camera.position.z = 30;
    this.camera.position.y = 12;
    this.camera.position.x = 20;
    this.camera.lookAt(new THREE.Vector3(0,0,0));
    const plane = new THREE.Mesh(new PlaneGeometry(100,100,30,30),new THREE.MeshBasicMaterial({color:0xfff000, wireframe: true}));
    const axisHelper = new THREE.AxesHelper( 200 ); // 创建轴辅助对象（坐标轴）
    // this.scene.add( axisHelper ); // 轴辅助对象添加到场景 
    // plane.rotateX(Math.PI/2);
    this.scene.add(plane);
    const ambientlLight = new THREE.AmbientLight(0xffffff,1);
    this.scene.add(ambientlLight);

    this.superCubeCast();
    this.scene.add(this.cube);


    this.floor();
    this.hdr();
    this.loadStatic();
    this.loadAnimate();

    let animate=()=>
  {
  
    requestAnimationFrame(animate);
    this.superCubeCast();
    if(this.myclip)
    {
      // this.myclip.translateX(Math.sin( this.myclip.rotation.y)*0.2);
      // this.myclip.translateZ(Math.cos( this.myclip.rotation.y)*0.2);
      this.myclip.rotation.y+=this.rotation;
      
      const a = new THREE.Vector3(10*Math.sin( this.myclip.rotation.y),0,10*Math.cos( this.myclip.rotation.y));
      // this.myclip.lookAt(a);
      // this.myclip.translateOnAxis(a,0.01);
      
    }
      

    this.render.render(this.scene,this.camera);
    if(this.mixer)
    {
      this.mixer.update(0.02);
    }
      
  }
    
    var _this = this;
    // material loader
   
  
    animate();
    const geometry1=new THREE.PlaneGeometry(270,270,20,20)
    let mirro1=new Reflector(geometry1,{textureWidth:200,textureHeight:200})
    mirro1.position.set(0,0,-70)
    mirro1.lookAt(0,0,0)
    // this.scene.add(mirro1)

    const geometry2=new THREE.PlaneGeometry(270,270,20,20)
    let mirro2=new Reflector(geometry2,{textureWidth:200,textureHeight:200})
    mirro2.position.set(0,0,70)
    mirro2.lookAt(0,0,0)
    // this.scene.add(mirro2)

    const geometry3=new THREE.PlaneGeometry(270,270,20,20)
    let mirro3=new Reflector(geometry3,{textureWidth:200,textureHeight:200})
    mirro3.position.set(-70,0,0)
    mirro3.lookAt(0,0,0)
    // this.scene.add(mirro3)

    const geometry4=new THREE.PlaneGeometry(270,270,20,20)
    let mirro4=new Reflector(geometry4,{textureWidth:200,textureHeight:200})
    mirro4.position.set(70,0,0)
    mirro4.lookAt(0,0,0)
    // this.scene.add(mirro4)

    const geometry5=new THREE.PlaneGeometry(270,270,20,20)
    let mirro5=new Reflector(geometry5,{textureWidth:200,textureHeight:200})
    mirro5.position.set(0,-10,0)
    mirro5.lookAt(0,0,0)
    // this.scene.add(mirro5)


    
    var loader = new FontLoader();
    loader.load('../assets/gentilis_bold.typeface.json',(font)=>{
      const textGeo = new TextGeometry(
        "name",  // 文字内容
        {
          font: font,
          size: 7, // 文字大小
          height: 2, // 文字厚度
          curveSegments: 0.5,  // 文字平滑度
          bevelThickness: 0.5, // 文字斜面厚度
          bevelSize: 0.2,  // 文字斜面的大小
          bevelEnabled: true // 文字阴影
        });
      textGeo.computeBoundingBox();
      const materials = [
        new THREE.MeshPhongMaterial({ color: 0xffcc33, flatShading: true }), // front
        new THREE.MeshPhongMaterial({ color: 0xffcc33 }) // side
      ];
      const name= new THREE.Mesh(textGeo, materials);
      name.position.x = 0;
      name.position.y = 0;
      name.position.z = 10;
      name.rotation.x = 0;
      name.rotation.y = Math.PI * 2;
      // this.scene.add(name)
  });



    
    
    // this.buffer();
  }
  
}
