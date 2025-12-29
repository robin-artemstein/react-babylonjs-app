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

    // Store a reference to the loaded model animation group; it will be used later.
    let katanaAnimationGroup:any = null;

    // Load the GLB model from the specified URL
    const modelURL = "https://raw.githubusercontent.com/robin-artemstein/testing-static-pages/main/";
    const modelName = "Katana3.glb";

    BABYLON.SceneLoader.ImportMesh("", modelURL, modelName, scene, function(meshes, particleSystems, skeletons, animationGroups) {
        // Callback function after loading completes

        ////Setting coordinate position for loaded model
        meshes[0].position = new BABYLON.Vector3(-0.2, 0.0005, 0);

        // Setting scaling ratio for the loaded model
        meshes[0].scaling = new BABYLON.Vector3(1, 1, 1);

        //Optional: Setting rotation for the loaded model
        meshes[0].rotation = new BABYLON.Vector3(0, Math.PI / 1, 0);

        // Save the reference of the animation group
        katanaAnimationGroup = animationGroups[0];
        console.log("GLB model is loaded successfully:", katanaAnimationGroup.name);

        // Set the current frame number to 1 (Babylon.js uses a 0-based frame index, so the first frame is actually index 0).
        // Use the setCurrentFrame() method to move the model to a specific pose.
        katanaAnimationGroup.pause(); // Pause immediately
        katanaAnimationGroup.goToFrame(1); // Jump to frame 1 (index 1)
    });

    // ArcRotateCamera (explicit config)
    const camera = scene.activeCamera as BABYLON.ArcRotateCamera;
    camera.alpha = -Math.PI / 2;
    camera.beta =  Math.PI / 2;
    camera.radius = 1.5;
    camera.lowerRadiusLimit = 0.25
    camera.upperRadiusLimit = 10
    camera.attachControl(canvas, true)

    // Create an Advanced Dynamic Texture (ADT) to draw a 2D GUI over the scene.
    const advancedTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    // Create a stack panel for slider GUI
    const stackPanelSlider = new GUI.StackPanel();
    stackPanelSlider.isVisible = true;
    stackPanelSlider.width = "70%";
    stackPanelSlider.left = "-7%"
    stackPanelSlider.top = "40%";
    stackPanelSlider.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    advancedTexture.addControl(stackPanelSlider);

    // Create the text block (displaying the number)
    const textBlockSlider = new GUI.TextBlock();
    textBlockSlider.textHorizontalAlignment = GUI.TextBlock.HORIZONTAL_ALIGNMENT_LEFT;
    textBlockSlider.paddingLeft = "130px";
    textBlockSlider.paddingBottom = "1px";
    textBlockSlider.text = "Draw / Sheathe";
    textBlockSlider.color = "white";
    textBlockSlider.fontSize = 20;
    textBlockSlider.height = "50px";
    stackPanelSlider.addControl(textBlockSlider);

    // Create the horizontal slider
    const slider = new GUI.Slider();
    slider.thumbColor = "blue";
    slider.minimum = 0;
    slider.maximum = 230;
    slider.value = 0;
    slider.height = "20px";
    slider.width = "70%";
    slider.isVertical = false; // Ensure horizontal
    slider.isPointerBlocker = true; // Ensure the slider captures pointer (mouse/touch) events
    stackPanelSlider.addControl(slider);

    // Update the text block number and make the animation pause at specific frame when slider value changes
    slider.onValueChangedObservable.add(function(value) {
        const textNumber: number = Math.round(value)
        console.log(textNumber + " is " + typeof textNumber);
        if (katanaAnimationGroup) {
            console.log("When the button is clicked, the animation moves to frame 55.");

            // Go to and pause at the specific frame.
            katanaAnimationGroup.goToFrame(textNumber);
            katanaAnimationGroup.pause();
        } else {
            console.log("The model has not been loaded, so animation operations cannot be performed.");
        }
    });

    // Create the "Need help?" button in the lower right corner.
    const helpButton = GUI.Button.CreateSimpleButton("helpButton", "Help");
    helpButton.fontSize = "3.5%";
    helpButton.width = "130px"; // Set the width of the button.
    helpButton.height = "70px"; // Set the height of the button.
    helpButton.cornerRadius = 30;
    helpButton.color = "white"; // Text color.
    helpButton.background = "blue"; // Background color for visibility.
    helpButton.thickness = 3;
    helpButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT; // Align to the right side.
    helpButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_BOTTOM; // Align to the bottom.
    helpButton.paddingBottom = "20px"; // Add some space from the bottom edge.
    helpButton.paddingRight = "20px"; // Add some space from the right edge.
    advancedTexture.addControl(helpButton); // Add the button to the GUI.

    // Create the modal rectangle that will appear in the center.
    const modalRect = new GUI.Rectangle("modalRect");
    modalRect.width = "100%"; // Width of the modal.
    modalRect.height = "100%"; // Height of the modal.
    modalRect.color = "white"; // Border color.
    modalRect.background = "#333333"; // Dark gray background.
    modalRect.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER; // Center horizontally.
    modalRect.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_CENTER; // Center vertically.
    modalRect.isVisible = false; // Invisible by default.
    advancedTexture.addControl(modalRect); // Add to the GUI.

    // Use a vertical stack panel inside the modal to organize elements top to bottom.
    const modalStack = new GUI.StackPanel();
    modalStack.top = "10px";
    modalStack.width = "100%"; // Full width of the modal.
    modalStack.paddingTop = "20px"; // Some padding at the top.
    modalStack.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP; // Top vertically.
    modalRect.addControl(modalStack); // Add the stack to the modal.

    // Create the headline text block.
    const headLine = new GUI.TextBlock("headLine", "Instructions...");
    headLine.height = "40px"; // Height for the text.
    headLine.fontSize = 30; // Font size as specified.
    headLine.color = "white"; // White text.
    headLine.textHorizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER; // Center the text.
    modalStack.addControl(headLine); // Add to the stack.

    // Create a horizontal stack panel for the Rotate, Zoom, Pan buttons.
    const buttonStack = new GUI.StackPanel();
    buttonStack.isVertical = false; // Horizontal layout.
    buttonStack.height = "70px"; // Height for the buttons.
    buttonStack.paddingTop = "20px"; // Space above.
    modalStack.addControl(buttonStack); // Add to the main stack.

    // Create the Rotate button.
    const rotateButton = GUI.Button.CreateSimpleButton("rotateButton", "Rotate");
    rotateButton.fontSize = "50%";
    rotateButton.width = "100px";
    rotateButton.height = "50px";
    rotateButton.color = "white";
    rotateButton.background = "blue";
    rotateButton.thickness = 3;
    buttonStack.addControl(rotateButton);

    // Create the Zoom button.
    const zoomButton = GUI.Button.CreateSimpleButton("zoomButton", "Zoom");
    zoomButton.fontSize = "50%";
    zoomButton.width = "100px";
    zoomButton.height = "50px";
    zoomButton.color = "white";
    zoomButton.background = "gray";
    zoomButton.thickness = 3;
    buttonStack.addControl(zoomButton);

    // Create the Pan button.
    const panButton = GUI.Button.CreateSimpleButton("panButton", "Pan");
    panButton.fontSize = "50%";
    panButton.width = "100px";
    panButton.height = "50px";
    panButton.color = "white";
    panButton.background = "gray";
    panButton.thickness = 3;
    buttonStack.addControl(panButton);

    // Botton GUI change from gray to blue when clicked
    const buttons = [rotateButton, zoomButton, panButton];
    const selectedButton = function(selected) {
        buttons.forEach(btn => {
            btn.background = "gray"
        });
        selected.background = "blue";
    };
    rotateButton.onPointerUpObservable.add(() => selectedButton(rotateButton));
    zoomButton.onPointerUpObservable.add(() => selectedButton(zoomButton));
    panButton.onPointerUpObservable.add(() => selectedButton(panButton));

    // Create a container for the instruction texts (we'll add them to the main stack).
    // But since they overlap in position, we'll add them separately and control visibility.

    // Create the rotation text block.
    const rotateText = new GUI.TextBlock("rotationText", "Rotate\nLeft click + Drag (Mouse)\nOne finger drag (Touch)");
    rotateText.height = "150px"; // Enough height for multi-line text.
    rotateText.fontSize = 25;
    rotateText.color = "white";
    rotateText.textWrapping = true; // Allow wrapping if needed.
    rotateText.paddingTop = "20px";
    rotateText.paddingLeft = "20px";
    rotateText.paddingRight = "20px";
    rotateText.isVisible = true; // Visible by default.
    modalStack.addControl(rotateText); // Add to stack.

    // Create the zoom text block.
    const zoomText = new GUI.TextBlock("zoomText", "Zoom\nScrolling (Mouse)\nTwo fingers pinch (Touch)");
    zoomText.height = "150px";
    zoomText.fontSize = 25;
    zoomText.color = "white";
    zoomText.textWrapping = true;
    zoomText.paddingTop = "20px";
    zoomText.paddingLeft = "20px";
    zoomText.paddingRight = "20px";
    zoomText.isVisible = false; // Invisible by default.
    modalStack.addControl(zoomText); // Add to stack.

    // Create the pan text block.
    const panText = new GUI.TextBlock("panText", "Pan\nRight click + Drag (Mouse)\nTwo fingers drag (Touch)");
    panText.height = "150px";
    panText.fontSize = 25;
    panText.color = "white";
    panText.textWrapping = true;
    panText.paddingTop = "20px";
    panText.paddingLeft = "20px";
    panText.paddingRight = "20px";
    panText.isVisible = false; // Invisible by default.
    modalStack.addControl(panText); // Add to stack.

    // Note: Since stack panel stacks them vertically, but we want only one visible at a time,
    // hiding will collapse the space, which is fine as heights are fixed.

    // Create the Close button at the bottom.
    const closeButton = GUI.Button.CreateSimpleButton("closeButton", "Close");
    closeButton.fontSize = "7%";
    closeButton.width = "150px";
    closeButton.height = "70px";
    closeButton.cornerRadius = 30;
    closeButton.color = "white";
    closeButton.background = "blue"; // Red for close.
    closeButton.thickness = 3;
    closeButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    closeButton.paddingTop = "20px"; // Space above.
    modalStack.addControl(closeButton); // Add to the stack.

    // Event: When "Need help?" is clicked, show the modal.
    helpButton.onPointerUpObservable.add(function() {
        modalRect.isVisible = true; // Make modal visible.
        stackPanelSlider.isVertical = false; //Make slider stack panel invisible.
    });

    // Event: When Rotate button is clicked, show rotation text, hide others.
    rotateButton.onPointerUpObservable.add(function() {
        rotateText.isVisible = true;
        zoomText.isVisible = false;
        panText.isVisible = false;
    });

    // Event: When Zoom button is clicked, show zoom text, hide others.
    zoomButton.onPointerUpObservable.add(function() {
        rotateText.isVisible = false;
        zoomText.isVisible = true;
        panText.isVisible = false;
    });

    // Event: When Pan button is clicked, show pan text, hide others.
    panButton.onPointerUpObservable.add(function() {
        rotateText.isVisible = false;
        zoomText.isVisible = false;
        panText.isVisible = true;
    });

    // Event: When Close is clicked, hide the modal.
    closeButton.onPointerUpObservable.add(function() {
        modalRect.isVisible = false; // Make modal invisible.
        stackPanelSlider.isVertical = true; //Make slider stack panel visible.
    });

    
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
