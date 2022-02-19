import './styles.css'
import * as BABYLON from 'babylonjs'
import 'babylonjs-gui'
import 'babylonjs-loaders'

const canvas = document.getElementById('renderCanvas')

//const engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true})
const engine = new BABYLON.Engine(canvas, true)

const getRandomInt = ( min, max ) => Math.floor( Math.random() * ( max - min ) ) + min

let boxes = []

const createScene = function() {

  const scene = new BABYLON.Scene(engine)
  scene.clearColor = new BABYLON.Color4(0, 0, 0, 0)

  const camera = new BABYLON.ArcRotateCamera("Camera", -1.5, 1.5, 36, BABYLON.Vector3.Zero(), scene)
  camera.attachControl(canvas, true)

  const box = BABYLON.BoxBuilder.CreateBox("box", {size: 1}, scene)

  const material = new BABYLON.StandardMaterial("white", scene)

  material.diffuseColor = BABYLON.Color3.White()

  box.material = material

  box.registerInstancedBuffer("color", 4)
  box.instancedBuffers.color = new BABYLON.Color4(1, 0, 0, 1)

  scene.createDefaultLight()

  const count = 100

  for (let i = 0; i < count; i++) {

    const instance = box.createInstance("box" + i)

    boxes.push(instance)

    instance.position.x = getRandomInt(-20, 20)
    instance.position.y = getRandomInt(-20, 20)
    instance.position.z = getRandomInt(0, 100)

    instance.velocity = getRandomInt(1, 15)

    instance.metadata = "box" + i

    box.instancedBuffers.color = new BABYLON.Color4(1, Math.random(), Math.random(), 1)

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
            pickedMesh.position.z = pickedMesh.position.z + 10
          }
        }
        break;
      case BABYLON.PointerEventTypes.POINTERPICK:
        break;
    }

  });

  scene.debugLayer.show({
    embedMode: true,
  })

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
  for (let i = 0; i < boxes.length; i++) {
    boxes[i].position.z = boxes[i].position.z - boxes[i].velocity / 100
    if ( boxes[i].position.z < -50 ) {
      boxes[i].position.z = 200
    }
  }
  scene.render()
} )

window.addEventListener( 'resize', function() {
  engine.resize()
} )