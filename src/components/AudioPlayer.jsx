import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  Volume2, 
  Download,
  Loader2,
  AlertCircle
} from 'lucide-react';

const AudioPlayer = ({ audioData, isFromMe = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [audioSupported, setAudioSupported] = useState(true);
  
  const audioRef = useRef(null);
  const progressRef = useRef(null);

  // Verificar suporte do navegador para diferentes formatos
  const checkAudioSupport = () => {
    const audio = new Audio();
    const formats = {
      ogg: audio.canPlayType('audio/ogg; codecs="opus"'),
      oga: audio.canPlayType('audio/ogg; codecs="opus"'),
      mp3: audio.canPlayType('audio/mpeg'),
      wav: audio.canPlayType('audio/wav'),
      webm: audio.canPlayType('audio/webm; codecs="opus"')
    };
    
    console.log('Suporte de áudio:', formats);
    return formats;
  };

  // Tentar diferentes estratégias para carregar o áudio
  const tryLoadAudio = async (url) => {
    const strategies = [
      // Estratégia 1: Tentar carregar diretamente
      () => Promise.resolve(url),
      
      // Estratégia 2: Usar proxy CORS se necessário
      () => Promise.resolve(`https://cors-anywhere.herokuapp.com/${url}`),
      
      // Estratégia 3: Tentar fetch e criar blob URL
      async () => {
        try {
          const response = await fetch(url, { 
            mode: 'cors',
            headers: {
              'Accept': 'audio/*'
            }
          });
          if (!response.ok) throw new Error('Fetch failed');
          const blob = await response.blob();
          return URL.createObjectURL(blob);
        } catch (err) {
          throw new Error('Blob creation failed');
        }
      }
    ];

    for (let i = 0; i < strategies.length; i++) {
      try {
        console.log(`Tentando estratégia ${i + 1} para carregar áudio`);
        const audioUrl = await strategies[i]();
        
        // Testar se o áudio carrega
        return new Promise((resolve, reject) => {
          const testAudio = new Audio();
          testAudio.crossOrigin = 'anonymous';
          
          testAudio.oncanplaythrough = () => {
            console.log(`Estratégia ${i + 1} funcionou!`);
            resolve(audioUrl);
          };
          
          testAudio.onerror = (e) => {
            console.log(`Estratégia ${i + 1} falhou:`, e);
            reject(new Error(`Strategy ${i + 1} failed`));
          };
          
          testAudio.src = audioUrl;
        });
      } catch (err) {
        console.log(`Estratégia ${i + 1} falhou:`, err);
        if (i === strategies.length - 1) {
          throw new Error('Todas as estratégias falharam');
        }
      }
    }
  };

  // Inicializar áudio quando o componente monta
  useEffect(() => {
    const initializeAudio = async () => {
      if (!audioData?.url) {
        setError('URL de áudio não fornecida');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Verificar suporte do navegador
        const support = checkAudioSupport();
        if (!support.ogg && !support.oga && !support.webm) {
          console.warn('Navegador pode não suportar formato Opus/OGG');
        }

        // Tentar carregar o áudio
        const workingUrl = await tryLoadAudio(audioData.url);
        
        if (audioRef.current) {
          const audio = audioRef.current;
          audio.crossOrigin = 'anonymous';
          
          const handleLoadedMetadata = () => {
            setDuration(audio.duration);
            setLoading(false);
            setAudioSupported(true);
          };
          
          const handleTimeUpdate = () => {
            setCurrentTime(audio.currentTime);
          };
          
          const handleEnded = () => {
            setIsPlaying(false);
            setCurrentTime(0);
          };
          
          const handleError = (e) => {
            console.error('Erro no elemento de áudio:', e);
            setError('Formato de áudio não suportado pelo navegador');
            setLoading(false);
            setAudioSupported(false);
          };
          
          const handleLoadStart = () => {
            setLoading(true);
            setError(null);
          };

          // Limpar listeners anteriores
          audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
          audio.removeEventListener('timeupdate', handleTimeUpdate);
          audio.removeEventListener('ended', handleEnded);
          audio.removeEventListener('error', handleError);
          audio.removeEventListener('loadstart', handleLoadStart);

          // Adicionar novos listeners
          audio.addEventListener('loadedmetadata', handleLoadedMetadata);
          audio.addEventListener('timeupdate', handleTimeUpdate);
          audio.addEventListener('ended', handleEnded);
          audio.addEventListener('error', handleError);
          audio.addEventListener('loadstart', handleLoadStart);

          // Definir a fonte
          audio.src = workingUrl;
          audio.load();
        }
      } catch (err) {
        console.error('Erro ao inicializar áudio:', err);
        setError('Não foi possível carregar o áudio');
        setLoading(false);
        setAudioSupported(false);
      }
    };

    initializeAudio();
  }, [audioData?.url]);

  // Controlar play/pause
  const togglePlayPause = async () => {
    if (!audioRef.current || !audioSupported) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Tentar reproduzir com interação do usuário
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsPlaying(true);
        }
      }
    } catch (err) {
      console.error('Erro ao reproduzir áudio:', err);
      setError('Erro ao reproduzir áudio. Tente novamente.');
    }
  };

  // Controlar progresso
  const handleProgressClick = (e) => {
    if (!audioRef.current || !progressRef.current || !audioSupported) return;
    
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
  const handleDownload = async () => {
    if (!audioData?.url) return;
    
    try {
      // Tentar download direto primeiro
      const link = document.createElement('a');
      link.href = audioData.url;
      link.download = audioData.filename || 'audio.oga';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Erro no download:', err);
      // Fallback: abrir em nova aba
      window.open(audioData.url, '_blank');
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
      {/* Elemento de áudio */}
      <audio
        ref={audioRef}
        preload="metadata"
      />

      {/* Botão Play/Pause */}
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlayPause}
        disabled={loading || !audioSupported}
        className={`w-8 h-8 p-0 rounded-full ${
          isFromMe 
            ? 'hover:bg-green-700 text-white' 
            : 'hover:bg-gray-300 text-gray-700'
        }`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : !audioSupported ? (
          <AlertCircle className="w-4 h-4" />
        ) : isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </Button>

      {/* Visualização de progresso */}
      <div className="flex-1 space-y-1">
        {audioSupported ? (
          <>
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
          </>
        ) : (
          <div className={`text-xs ${
            isFromMe ? 'text-green-100' : 'text-gray-600'
          }`}>
            {error || 'Formato não suportado'}
          </div>
        )}
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
    </div>
  );
};

export default AudioPlayer;

