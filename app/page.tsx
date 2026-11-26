import Link from "next/link";
import { SpinningModel } from "../src/components/SpinningModel";
import { ThemeToggle } from "../src/components/ThemeToggle";

export default function Home() {
  return (
    <div className="flex flex-col h-dvh overflow-hidden items-center bg-sand-50 font-sans dark:bg-black">
      <ThemeToggle />
      <main className="flex flex-1 min-h-0 w-full flex-col items-center p-4 bg-sand-50 dark:bg-black sm:items-start gap-4">
        <div className="border border-sand-200 dark:border-white p-4 w-full shrink-0">
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
        <div className="border border-sand-200 dark:border-white p-4 w-full flex-1 min-h-0">
          <div className="h-full w-full flex items-center justify-center">
            <Link
              href="/aquarium/night"
              aria-label="Visit the aquarium by night"
              className="hidden dark:block h-full aspect-2/3 max-w-full cursor-pointer"
            >
              <SpinningModel
                url="/models/Squid/Squid_01.obj"
                mtlUrl="/models/Squid/Squid_01.mtl"
                cameraPosition={[300, 100, 500]}
                lightIntensity={70}
              />
            </Link>
            <Link
              href="/aquarium"
              aria-label="Visit the aquarium"
              className="block dark:hidden h-full aspect-square max-w-full cursor-pointer"
            >
              <SpinningModel
                url="/models/Crab/Mesh_Crab.obj"
                mtlUrl="/models/Crab/Mesh_Crab.mtl"
                cameraPosition={[0, 0, 300]}
                lightIntensity={1}
              />
            </Link>
          </div>
        </div>
      </main>
      <footer className="border-t border-sand-200 dark:border-white p-4 w-full shrink-0">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-sand-300 dark:text-white font-mono">
            {new Date().getFullYear()} Crab Web. All rights undeserved.
          </p>
          <Link
            href="https://www.tiktok.com/@citroenschoen"
            className="text-center text-sand-300 dark:text-white font-mono"
          >
            Look at my videos
          </Link>
        </div>
      </footer>
    </div>
  );
}
