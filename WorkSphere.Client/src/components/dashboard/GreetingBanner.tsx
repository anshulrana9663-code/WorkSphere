import { useState, useEffect } from 'react';
import { SunIcon, MoonIcon, ClockIcon } from '../common/Icons';

interface GreetingBannerProps {
  userName?: string;
  subtitle?: string;
}

export function GreetingBanner({
  userName = 'Alex Morgan',
  subtitle = 'Here is your productivity overview for today. You have 3 high priority tasks to review.',
}: GreetingBannerProps) {
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());


  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const hours = currentTime.getHours();
  let greeting = 'Good morning';
  let isNight = false;

  if (hours >= 12 && hours < 17) {
    greeting = 'Good afternoon';
  } else if (hours >= 17) {
    greeting = 'Good evening';
    isNight = true;
  }

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 p-6 sm:p-8 text-white shadow-lg">
      {/* Decorative background glow circles */}
      <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
      <div className="absolute right-32 -bottom-10 h-48 w-48 rounded-full bg-violet-400/20 blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left greeting section */}
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur-md border border-white/20">
            {isNight ? (
              <MoonIcon size={14} className="text-amber-200" />
            ) : (
              <SunIcon size={14} className="text-amber-300" />
            )}
            <span>WorkSphere Hub Online</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {greeting}, <span className="text-indigo-100">{userName}</span>!
          </h1>

          <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Right time & date card */}
        <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center rounded-xl bg-white/10 p-4 backdrop-blur-md border border-white/15 shrink-0 min-w-[210px]">
          <div className="flex items-center gap-2 text-indigo-100 text-xs font-medium mb-1">
            <ClockIcon size={14} />
            <span>{formattedDate}</span>
          </div>
          <div className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-white">
            {formattedTime}
          </div>
        </div>
      </div>
    </div>
  );
}
