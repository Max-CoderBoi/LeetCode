import { useState, useRef, useEffect } from 'react';
import { Pause, Play, Volume2, VolumeX, Maximize } from 'lucide-react';

const Editorial = ({ secureUrl, thumbnailUrl, duration }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Update current time during playback
  useEffect(() => {
    const video = videoRef.current;
    
    const handleTimeUpdate = () => {
      if (video) setCurrentTime(video.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };
    
    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      video.addEventListener('ended', handleEnded);
      return () => {
        video.removeEventListener('timeupdate', handleTimeUpdate);
        video.removeEventListener('ended', handleEnded);
      };
    }
  }, []);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const progressPercentage = (currentTime / duration) * 100;

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-4xl mx-auto group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Glow effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
      
      {/* Main Container */}
      <div className="relative bg-slate-900/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl">
        {/* Video Element */}
        <div className="relative aspect-video bg-black">
          <video
            ref={videoRef}
            src={secureUrl}
            poster={thumbnailUrl}
            onClick={togglePlayPause}
            className="w-full h-full cursor-pointer"
          />
          
          {/* Center Play Button (shown when paused) */}
          {!isPlaying && (
            <button
              onClick={togglePlayPause}
              className="absolute inset-0 m-auto w-20 h-20 flex items-center justify-center bg-gradient-to-r from-purple-600 to-pink-600 rounded-full shadow-2xl shadow-purple-500/50 transition-all duration-300 hover:scale-110 hover:shadow-purple-500/70 animate-fadeIn"
            >
              <Play className="text-white ml-1" size={32} />
            </button>
          )}
        </div>
        
        {/* Video Controls Overlay */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent backdrop-blur-sm transition-all duration-300 ${
            isHovering || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          {/* Progress Bar */}
          <div className="px-4 pt-4">
            <div className="relative w-full h-1.5 bg-slate-700/50 rounded-full overflow-hidden cursor-pointer group/progress">
              {/* Progress Fill */}
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-100"
                style={{ width: `${progressPercentage}%` }}
              >
                {/* Progress Thumb */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"></div>
              </div>
              
              {/* Interactive Range */}
              <input
                type="range"
                min="0"
                max={duration}
                value={currentTime}
                onChange={(e) => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = Number(e.target.value);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between px-4 py-3">
            {/* Left Controls */}
            <div className="flex items-center gap-3">
              {/* Play/Pause Button */}
              <button
                onClick={togglePlayPause}
                className="w-10 h-10 flex items-center justify-center bg-slate-800/50 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 rounded-full transition-all duration-200 hover:scale-110"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <Pause className="text-white" size={20} />
                ) : (
                  <Play className="text-white ml-0.5" size={20} />
                )}
              </button>

              {/* Volume Controls */}
              <div className="flex items-center gap-2 group/volume">
                <button
                  onClick={toggleMute}
                  className="w-9 h-9 flex items-center justify-center bg-slate-800/50 hover:bg-slate-700/50 rounded-full transition-all duration-200"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="text-white" size={18} />
                  ) : (
                    <Volume2 className="text-white" size={18} />
                  )}
                </button>
                
                {/* Volume Slider */}
                <div className="w-0 group-hover/volume:w-20 overflow-hidden transition-all duration-300">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-slate-700 rounded-full appearance-none cursor-pointer volume-slider"
                  />
                </div>
              </div>

              {/* Time Display */}
              <div className="text-white text-sm font-mono bg-slate-800/30 px-3 py-1 rounded-lg">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="w-9 h-9 flex items-center justify-center bg-slate-800/50 hover:bg-slate-700/50 rounded-full transition-all duration-200"
                aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                <Maximize className="text-white" size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        /* Custom Volume Slider Styling */
        .volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(to right, #a855f7, #ec4899);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
        }

        .volume-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: linear-gradient(to right, #a855f7, #ec4899);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
        }

        .volume-slider::-webkit-slider-runnable-track {
          height: 4px;
          background: linear-gradient(to right, 
            #a855f7 0%, 
            #ec4899 ${volume * 100}%, 
            #475569 ${volume * 100}%, 
            #475569 100%
          );
          border-radius: 2px;
        }

        .volume-slider::-moz-range-track {
          height: 4px;
          background: #475569;
          border-radius: 2px;
        }

        .volume-slider::-moz-range-progress {
          height: 4px;
          background: linear-gradient(to right, #a855f7, #ec4899);
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

export default Editorial;