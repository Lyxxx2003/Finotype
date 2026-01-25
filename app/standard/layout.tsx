'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { clearAnswers } from "@/lib/storage";

export default function StandardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleGoHome = () => {
    setShowModal(true);
  };

  const confirmGoHome = () => {
    clearAnswers();
    setShowModal(false);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <button 
                  onClick={handleGoHome}
                  className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Finotype Standard
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <Link href="/standard/account" className="text-sm text-gray-500 hover:text-gray-900">
                Account
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {showModal && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fadeIn"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white p-8 rounded-2xl max-w-md w-full shadow-2xl transform transition-all scale-100 border border-gray-100" 
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-3">Return to Home?</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Are you sure you want to go back to Home? You'll lose all your current results.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 py-3 rounded-xl text-gray-700 font-bold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmGoHome}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl text-white font-bold transition-colors shadow-lg"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
