'use client';

import BottomNavBar from '../molecules/BottomNavBar';

export default function HomePageTemplate() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      <div className="max-w-screen-xl mx-auto p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Bienvenido
        </h1>
        
        <div className="space-y-4">
          {/* Placeholder para contenido futuro */}
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
}