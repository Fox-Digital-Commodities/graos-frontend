import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Download,
  Loader2,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  RotateCw
} from 'lucide-react';
import { getWorkingMediaUrl, getDownloadUrl } from '../utils/mediaProxy';

const ImageViewer = ({ imageData, isFromMe = false, onClick }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [workingUrl, setWorkingUrl] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Inicializar imagem quando o componente monta
  useEffect(() => {
    const initializeImage = async () => {
      if (!imageData?.mediaUrl && !imageData?.url) {
        setError('URL de imagem não fornecida');
        return;
      }

      const imageUrl = imageData.mediaUrl || imageData.url;
      setLoading(true);
      setError(null);

      try {
        // Tentar obter URL funcional
        const url = await getWorkingMediaUrl(imageUrl, 'image');
        setWorkingUrl(url);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar imagem:', err);
        setError('Não foi possível carregar a imagem');
        setLoading(false);
        // Fallback: tentar usar URL original
        setWorkingUrl(imageUrl);
      }
    };

    initializeImage();
  }, [imageData?.mediaUrl, imageData?.url]);

  // Download da imagem
  const handleDownload = async () => {
    const imageUrl = imageData?.mediaUrl || imageData?.url;
    if (!imageUrl) return;
    
    try {
      // Usar endpoint de download do backend
      const downloadUrl = getDownloadUrl(imageUrl, imageData?.filename);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = imageData?.filename || 'imagem.jpg';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Erro no download:', err);
      // Fallback: abrir em nova aba
      window.open(imageUrl, '_blank');
    }
  };

  // Abrir imagem em tela cheia
  const handleImageClick = () => {
    if (onClick) {
      onClick();
    } else if (workingUrl) {
      window.open(workingUrl, '_blank');
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setLoading(false);
  };

  const handleImageError = () => {
    setError('Erro ao carregar imagem');
    setLoading(false);
    setImageLoaded(false);
  };

  if (!imageData?.mediaUrl && !imageData?.url) {
    return (
      <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
        <AlertCircle className="w-4 h-4 text-gray-500" />
        <span className="text-sm text-gray-600">Imagem indisponível</span>
      </div>
    );
  }

  return (
    <div className={`relative rounded-lg overflow-hidden max-w-xs ${
      isFromMe ? 'bg-green-600' : 'bg-gray-200'
    }`}>
      {/* Container da imagem */}
      <div className="relative">
        {loading && (
          <div className="flex items-center justify-center p-8 bg-gray-100">
            <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
            <span className="ml-2 text-sm text-gray-600">Carregando...</span>
          </div>
        )}

        {error && !workingUrl && (
          <div className="flex items-center justify-center p-8 bg-gray-100">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <span className="ml-2 text-sm text-red-600">{error}</span>
          </div>
        )}

        {workingUrl && (
          <div className="relative">
            <img 
              src={workingUrl}
              alt={imageData?.caption || "Imagem"}
              className="max-w-xs rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={handleImageClick}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{ 
                display: loading ? 'none' : 'block',
                maxHeight: '300px',
                objectFit: 'cover'
              }}
            />

            {/* Overlay com controles */}
            <div className="absolute top-2 right-2 flex space-x-1">
              {/* Botão de zoom */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleImageClick}
                className="w-6 h-6 p-0 bg-black/50 hover:bg-black/70 text-white rounded-full"
              >
                <ZoomIn className="w-3 h-3" />
              </Button>

              {/* Botão de download */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="w-6 h-6 p-0 bg-black/50 hover:bg-black/70 text-white rounded-full"
              >
                <Download className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Caption da imagem */}
      {imageData?.caption && (
        <div className={`p-2 ${
          isFromMe ? 'text-white' : 'text-gray-800'
        }`}>
          <p className="text-sm">{imageData.caption}</p>
        </div>
      )}

      {/* Informações da imagem */}
      {imageData?.filename && (
        <div className={`px-2 pb-2 ${
          isFromMe ? 'text-green-100' : 'text-gray-600'
        }`}>
          <p className="text-xs truncate">{imageData.filename}</p>
        </div>
      )}
    </div>
  );
};

export default ImageViewer;

