import { SpinningModel } from "../src/components/SpinningModel";
import { ThemeToggle } from "../src/components/ThemeToggle";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sand-50 font-sans dark:bg-black">
      <ThemeToggle />
      <main className="flex min-h-screen w-full flex-col items-center p-4 bg-sand-50 dark:bg-black sm:items-start gap-4">
        <div className="border border-sand-200 dark:border-white p-4 w-full">
          <pre className="hidden md:block text-xs lg:text-base w-fit mx-auto text-sand-300 dark:text-white">{`░▒▓███████▓▒░░▒▓█▓▒░░▒▓██████▓▒░ ░▒▓██████▓▒░░▒▓█▓▒░       ░▒▓██████▓▒░ ░▒▓███████▓▒░ 
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░        
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░        
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓████████▓▒░░▒▓██████▓▒░  
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░ 
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░ 
░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓██████▓▒░ ░▒▓██████▓▒░░▒▓████████▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓███████▓▒░`}</pre>
          <pre className="md:hidden text-xs sm:text-base w-fit mx-auto text-sand-300 dark:text-white">
            {`▗▖  ▗▖▗▄▄▄▖ ▗▄▄▖ ▗▄▖ ▗▖    ▗▄▖  ▗▄▄▖
▐▛▚▖▐▌  █  ▐▌   ▐▌ ▐▌▐▌   ▐▌ ▐▌▐▌   
▐▌ ▝▜▌  █  ▐▌   ▐▌ ▐▌▐▌   ▐▛▀▜▌ ▝▀▚▖
▐▌  ▐▌▗▄█▄▖▝▚▄▄▖▝▚▄▞▘▐▙▄▄▖▐▌ ▐▌▗▄▄▞▘`}
          </pre>
        </div>
        <div className="border border-sand-200 dark:border-white p-4 w-full flex-1">
          <div className="h-full w-full flex items-center justify-center">
            <div className="hidden dark:block w-full sm:w-1/2 aspect-2/3">
              <SpinningModel
                url="/models/Squid/Squid_01.obj"
                mtlUrl="/models/Squid/Squid_01.mtl"
                cameraPosition={[300, 100, 500]}
              />
            </div>
            <div className="block dark:hidden sm:w-1/2 aspect-square">
              <SpinningModel
                url="/models/Crab/Mesh_Crab.obj"
                mtlUrl="/models/Crab/Mesh_Crab.mtl"
                cameraPosition={[0, 0, 300]}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
