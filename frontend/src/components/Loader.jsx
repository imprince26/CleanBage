import { Recycle } from 'lucide-react';

const Loader = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
      <div className="relative">
        {/* Outer spinning circle */}
        <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-emerald-500 animate-spin"></div>
        
        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Recycle 
            size={24} 
            className="text-emerald-500 animate-bounce"
          />
        </div>
      </div>
      
      {/* Loading text */}
      <span className="text-emerald-500 font-medium text-lg animate-pulse">
        Loading...
      </span>
    </div>
  );
};

export default Loader;