import { useEffect, useRef } from "react"
import * as BABYLON from "@babylonjs/core"
import '@babylonjs/loaders';
import * as GUI from "@babylonjs/gui"

export default function BabylonjsScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const engine = new BABYLON.Engine(canvas, true)
    const scene = new BABYLON.Scene(engine)
    
    // Default camera & light
    scene.createDefaultCameraOrLight(true, true, true)

    // Environment (ground + skybox)
    const hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("https://playground.babylonjs.com/textures/environment.dds", scene);
    scene.createDefaultSkybox(hdrTexture, true);

    // Load GLB model
    BABYLON.SceneLoader.ImportMeshAsync("", "https://raw.githubusercontent.com/changhejeong/web-assets-hotlink/main/", "m40-sniper-rifle.glb", scene).then((result) => {
             // Retrieve the loaded model (assuming the model is the first root node)
            const model = result.meshes[0];

            // Setting coordinate position for loaded model, for instance, move it to (x: -0.25, y: -01, z: 0)
            model.position = new BABYLON.Vector3(-0.25, -0.1, 0);

            // Optional: Setting scaling ratio for the loaded model (if the model is too small or too large)
            model.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1); // Setting the scaling ratio

            // Optional: Setting rotation for the loaded model (in radians)
            model.rotation = new BABYLON.Vector3(0, Math.PI / 1, 0); // Rotate 90 degrees along the Y-axis.
        }).catch((error) => {
            console.error("Model loading failed:", error);
        });

    // ArcRotateCamera (explicit config)
    const camera = scene.activeCamera as BABYLON.ArcRotateCamera;
    camera.alpha = -Math.PI / 2;
    camera.beta =  Math.PI / 2;
    camera.radius = 1.5;
    camera.lowerRadiusLimit = 0.25
    camera.upperRadiusLimit = 10
    camera.attachControl(canvas, true)

    // GUI Button (inside canvas)
    
    const guiTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene)

    const button = GUI.Button.CreateSimpleButton("btn", "Reset Camera")
    button.width = "160px"
    button.height = "40px"
    button.color = "white"
    button.background = "#2563eb"
    button.cornerRadius = 8
    button.thickness = 0
    button.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM
    button.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER
    button.top = "-20px"

    button.onPointerUpObservable.add(() => {
      camera.alpha = -Math.PI / 2
      camera.beta = Math.PI / 2
      camera.radius = 1000
    })

    guiTexture.addControl(button)

    
    // Render loop & resize
    
    engine.runRenderLoop(() => {
      scene.render()

    })

    const handleResize = () => {
      engine.resize()
    }
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      scene.dispose()
      engine.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{width: "100%", height: "550px"}}
    />
  )
}