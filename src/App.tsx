import BabylonScene from "./BabylonScene";

function App() {
  const modelLink: string = "https://raw.githubusercontent.com/robin-artemstein/testing-static-pages/main/";
  const modelName: string = "Katana3.glb"
  return (
    <>
      <div className="flex flex-col justify-center gap-4">
        <div className="font-bold text-3xl text-lime-300">Babylon.js + React + Vite + React testing application...</div>
        <div><BabylonScene modelSourceLink={modelLink} modelSourceName={modelName} /></div>
      </div>
    </>
  )
}

export default App
