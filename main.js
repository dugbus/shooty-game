import './styles.css'
import * as BABYLON from 'babylonjs'
import 'babylonjs-gui'
import 'babylonjs-loaders'

const canvas = document.getElementById('renderCanvas')

//const engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true})
const engine = new BABYLON.Engine(canvas, true)

const getRandomInt = ( min, max ) => Math.floor( Math.random() * ( max - min ) ) + min

const pills = []
const far = 60

const createScene = function() {

  const scene = new BABYLON.Scene(engine)
  scene.clearColor = new BABYLON.Color4(0, 0, 0, 0)

  const camera = new BABYLON.UniversalCamera("Camera", new BABYLON.Vector3(0,1,0), scene)
  camera.attachControl(canvas, true)

  const pillMaster = BABYLON.MeshBuilder.CreateSphere("sphere", {segments: 4, diameterX: 1, diameterY: 1, diameterZ: 0.5}, scene)

  const material = new BABYLON.StandardMaterial("white", scene)

  material.diffuseColor = BABYLON.Color3.White()

  pillMaster.material = material

  pillMaster.registerInstancedBuffer("color", 4)
  pillMaster.instancedBuffers.color = new BABYLON.Color4(1, 0, 0, 1)

  scene.createDefaultLight()

  const count = 100

  for (let i = 0; i < count; i++) {

    const instance = pillMaster.createInstance("sphere" + i)

    pills.push(instance)

    instance.position.x = getRandomInt(-20, 20)
    instance.position.y = getRandomInt(-20, 20)
    instance.position.z = far

    instance.velocity = getRandomInt(1, 15)

    instance.metadata = "sphere" + i

    let startPosition = new BABYLON.Vector3(instance.position.x, instance.position.y, instance.position.z)

    let endPosition = new BABYLON.Vector3(0,1,0)

    BABYLON.Animation.CreateAndStartAnimation("anim", instance, "position", 30, getRandomInt(3, 20)*100, startPosition, endPosition, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);

    pillMaster.instancedBuffers.color = new BABYLON.Color4(1, Math.random(), Math.random(), 1)

  }

/* MOUSE VERSION */
  // scene.onPointerDown = function castRay() {
  //   var ray = scene.createPickingRay(scene.pointerX, scene.pointerY, BABYLON.Matrix.Identity(), camera)
  //   var hit = scene.pickWithRay(ray)
  //   if (hit.pickedMesh){
  //     // createGUIButton(hit)
  //     hit.pickedMesh.position.z = hit.pickedMesh.position.z + 10
  //   }
  // }

/* XR VERSION */
  scene.onPointerObservable.add((pointerInfo) => {
    switch (pointerInfo.type) {
      case BABYLON.PointerEventTypes.POINTERDOWN:
        var pickResult = pointerInfo.pickInfo;
        if (pickResult.hit) {
          var pickedMesh = pickResult.pickedMesh;
          if (pickedMesh) {
            //createGUIButton(pickedMesh)
            pickedMesh.position.z = far
            pickedMesh.velocity = 0
          }
        }
        break;
      case BABYLON.PointerEventTypes.POINTERPICK:
        break;
    }

  });

  // scene.debugLayer.show({
  //   embedMode: true,
  // })

  // var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI(
  //   "myUI"
  // );

  function createGUIButton(hit) {
    let label = hit.metadata
    //Creates a gui label to display the cannon
    let guiCanvas = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI")
    let guiButton = BABYLON.GUI.Button.CreateSimpleButton("guiButton", label)
    guiButton.width = "150px"
    guiButton.height = "40px"
    guiButton.color = "white"
    guiButton.cornerRadius = 5
    guiButton.background = "green"

    guiButton.onPointerUpObservable.add(function() {
      guiCanvas.dispose();
    })

    guiButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER
    guiCanvas.addControl(guiButton)
  }

  const xr = scene.createDefaultXRExperienceAsync();

  // const xr = scene.createDefaultXRExperienceAsync({
  //   uiOptions: {
  //     sessionMode: "immersive-ar",
  //   },
  //   optionalFeatures: ["hit-test", "anchors"],
  // });

  return scene
}

const scene = createScene()

engine.runRenderLoop( function() {

  // for (let i = 0; i < pills.length; i++) {
  //   pills[i].position.z = pills[i].position.z - pills[i].velocity / 100
  //   if ( pills[i].position.z < -50 ) {
  //     pills[i].position.z = 50
  //   }
  // }

  scene.render()
} )

window.addEventListener( 'resize', function() {
  engine.resize()
} )