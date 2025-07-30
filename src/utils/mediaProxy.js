// Utilitário para contornar problemas de CORS com mídia do WhatsApp

// URL base da API
const API_BASE_URL = 'http://localhost:3001/api';

// Cache para URLs já processadas
const urlCache = new Map();

/**
 * Tenta carregar uma URL de mídia usando o backend como proxy
 * @param {string} originalUrl - URL original da mídia
 * @param {string} type - Tipo de mídia ('audio' ou 'image')
 * @returns {Promise<string>} - URL funcional ou erro
 */
export const getWorkingMediaUrl = async (originalUrl, type = 'audio') => {
  if (!originalUrl) {
    throw new Error('URL não fornecida');
  }

  // Verificar cache primeiro
  const cacheKey = `${type}_${originalUrl}`;
  if (urlCache.has(cacheKey)) {
    return urlCache.get(cacheKey);
  }

  console.log(`Tentando carregar ${type} via backend:`, originalUrl);

  const strategies = [
    // Estratégia 1: Backend proxy (principal)
    () => testBackendProxy(originalUrl, type),
    
    // Estratégia 2: URL direta (fallback)
    () => testDirectUrl(originalUrl, type),
    
    // Estratégia 3: Proxies CORS públicos (último recurso)
    () => testPublicProxies(originalUrl, type)
  ];

  for (let i = 0; i < strategies.length; i++) {
    try {
      console.log(`Testando estratégia ${i + 1} para ${type}`);
      const workingUrl = await strategies[i]();
      
      // Cache da URL que funcionou
      urlCache.set(cacheKey, workingUrl);
      console.log(`Estratégia ${i + 1} funcionou para ${type}!`);
      return workingUrl;
      
    } catch (error) {
      console.log(`Estratégia ${i + 1} falhou para ${type}:`, error.message);
    }
  }

  throw new Error(`Todas as estratégias falharam para ${type}`);
};

/**
 * Testa o proxy do backend
 */
const testBackendProxy = async (url, type) => {
  const proxyUrl = `${API_BASE_URL}/media/proxy?url=${encodeURIComponent(url)}&type=${type}`;
  
  return new Promise((resolve, reject) => {
    if (type === 'audio') {
      const audio = new Audio();
      
      const timeout = setTimeout(() => {
        reject(new Error('Timeout no backend proxy'));
      }, 10000);
      
      audio.oncanplaythrough = () => {
        clearTimeout(timeout);
        resolve(proxyUrl);
      };
      
      audio.onerror = (e) => {
        clearTimeout(timeout);
        reject(new Error('Erro no backend proxy de áudio'));
      };
      
      audio.src = proxyUrl;
    } else if (type === 'image') {
      const img = new Image();
      
      const timeout = setTimeout(() => {
        reject(new Error('Timeout no backend proxy'));
      }, 10000);
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(proxyUrl);
      };
      
      img.onerror = (e) => {
        clearTimeout(timeout);
        reject(new Error('Erro no backend proxy de imagem'));
      };
      
      img.src = proxyUrl;
    }
  });
};

/**
 * Testa se uma URL carrega diretamente
 */
const testDirectUrl = async (url, type) => {
  return new Promise((resolve, reject) => {
    if (type === 'audio') {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      
      const timeout = setTimeout(() => {
        reject(new Error('Timeout na URL direta'));
      }, 5000);
      
      audio.oncanplaythrough = () => {
        clearTimeout(timeout);
        resolve(url);
      };
      
      audio.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Erro ao carregar áudio direto'));
      };
      
      audio.src = url;
    } else if (type === 'image') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const timeout = setTimeout(() => {
        reject(new Error('Timeout na URL direta'));
      }, 5000);
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(url);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Erro ao carregar imagem direta'));
      };
      
      img.src = url;
    }
  });
};

/**
 * Testa proxies CORS públicos como último recurso
 */
const testPublicProxies = async (url, type) => {
  const proxies = [
    'https://api.allorigins.win/raw?url=',
    'https://cors-anywhere.herokuapp.com/',
    'https://thingproxy.freeboard.io/fetch/',
  ];

  for (const proxy of proxies) {
    try {
      const proxyUrl = proxy + encodeURIComponent(url);
      await testDirectUrl(proxyUrl, type);
      return proxyUrl;
    } catch (error) {
      console.log(`Proxy ${proxy} falhou:`, error.message);
    }
  }
  
  throw new Error('Todos os proxies públicos falharam');
};

/**
 * Obtém URL para download direto via backend
 */
export const getDownloadUrl = (originalUrl, filename) => {
  const params = new URLSearchParams({
    url: originalUrl,
    ...(filename && { filename })
  });
  
  return `${API_BASE_URL}/media/download?${params.toString()}`;
};

/**
 * Limpa o cache de URLs
 */
export const clearMediaCache = () => {
  urlCache.clear();
  console.log('Cache de mídia limpo');
};

/**
 * Verifica se o navegador suporta um formato de áudio
 */
export const checkAudioSupport = () => {
  const audio = new Audio();
  return {
    ogg: audio.canPlayType('audio/ogg; codecs="opus"'),
    oga: audio.canPlayType('audio/ogg; codecs="opus"'),
    mp3: audio.canPlayType('audio/mpeg'),
    wav: audio.canPlayType('audio/wav'),
    webm: audio.canPlayType('audio/webm; codecs="opus"'),
    m4a: audio.canPlayType('audio/mp4; codecs="mp4a.40.2"')
  };
};

export default {
  getWorkingMediaUrl,
  getDownloadUrl,
  clearMediaCache,
  checkAudioSupport
};

