import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 gap-8 font-sans bg-gray-50 text-gray-900">
      <main className="flex flex-col gap-8 items-center text-center max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight text-blue-600 sm:text-6xl">
          Finotype
        </h1>
        <p className="text-lg text-gray-600">
          Discover your financial personality type. Are you a Guardian, a Maverick, or something else? 
          Take the 10-question test to find out and level up your financial literacy.
        </p>
        
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            href="/question/1"
            className="rounded-full bg-blue-600 text-white px-8 py-4 text-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Start Test
          </Link>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-gray-400 text-sm">
         © {new Date().getFullYear()} Finotype. All rights reserved.
      </footer>
    </div>
  );
}
