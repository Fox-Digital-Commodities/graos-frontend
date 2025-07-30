import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  Volume2, 
  Download,
  Loader2
} from 'lucide-react';

const AudioPlayer = ({ audioData, isFromMe = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  // Inicializar áudio quando o componente monta
  useEffect(() => {
    if (audioData?.url && audioRef.current) {
      const audio = audioRef.current;
      
      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
        setLoading(false);
      };
      
      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };
      
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      
      const handleError = () => {
        setError('Erro ao carregar áudio');
        setLoading(false);
      };
      
      const handleLoadStart = () => {
        setLoading(true);
        setError(null);
      };

      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      audio.addEventListener('loadstart', handleLoadStart);

      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('loadstart', handleLoadStart);
      };
    }
  }, [audioData?.url]);

  // Controlar play/pause
  const togglePlayPause = async () => {
    if (!audioRef.current) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Erro ao reproduzir áudio:', err);
      setError('Erro ao reproduzir áudio');
    }
  };

  // Controlar progresso
  const handleProgressClick = (e) => {
    if (!audioRef.current || !progressRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = clickX / width;
    const newTime = percentage * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Formatar tempo em MM:SS
  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Download do áudio
  const handleDownload = () => {
    if (audioData?.url) {
      const link = document.createElement('a');
      link.href = audioData.url;
      link.download = audioData.filename || 'audio.oga';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!audioData?.url) {
    return (
      <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
        <Volume2 className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600">Áudio indisponível</span>
      </div>
    );
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`flex items-center space-x-3 p-3 rounded-lg max-w-xs ${
      isFromMe ? 'bg-green-600' : 'bg-gray-200'
    }`}>
      {/* Elemento de áudio oculto */}
      <audio
        ref={audioRef}
        src={audioData.url}
        preload="metadata"
      />

      {/* Botão Play/Pause */}
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlayPause}
        disabled={loading || error}
        className={`w-8 h-8 p-0 rounded-full ${
          isFromMe 
            ? 'hover:bg-green-700 text-white' 
            : 'hover:bg-gray-300 text-gray-700'
        }`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </Button>

      {/* Visualização de onda e progresso */}
      <div className="flex-1 space-y-1">
        {/* Barra de progresso */}
        <div
          ref={progressRef}
          className={`h-1 rounded-full cursor-pointer ${
            isFromMe ? 'bg-green-800' : 'bg-gray-400'
          }`}
          onClick={handleProgressClick}
        >
          <div
            className={`h-full rounded-full transition-all duration-100 ${
              isFromMe ? 'bg-white' : 'bg-green-500'
            }`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Tempo */}
        <div className="flex justify-between items-center">
          <span className={`text-xs ${
            isFromMe ? 'text-green-100' : 'text-gray-600'
          }`}>
            {formatTime(currentTime)}
          </span>
          <span className={`text-xs ${
            isFromMe ? 'text-green-100' : 'text-gray-600'
          }`}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Botão de download */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDownload}
        className={`w-6 h-6 p-0 ${
          isFromMe 
            ? 'hover:bg-green-700 text-white' 
            : 'hover:bg-gray-300 text-gray-700'
        }`}
      >
        <Download className="w-3 h-3" />
      </Button>

      {/* Indicador de erro */}
      {error && (
        <div className={`text-xs ${
          isFromMe ? 'text-red-200' : 'text-red-600'
        }`}>
          Erro
        </div>
      )}
    </div>
  );
};

export default AudioPlayer;

