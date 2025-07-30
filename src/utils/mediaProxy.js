// Utilitário para contornar problemas de CORS com mídia do WhatsApp

// Lista de proxies CORS públicos (em ordem de preferência)
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://cors-anywhere.herokuapp.com/',
  'https://thingproxy.freeboard.io/fetch/',
  'https://api.codetabs.com/v1/proxy?quest='
];

// Cache para URLs já processadas
const urlCache = new Map();

/**
 * Tenta carregar uma URL de mídia usando diferentes estratégias
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

  console.log(`Tentando carregar ${type}:`, originalUrl);

  const strategies = [
    // Estratégia 1: URL direta
    () => testDirectUrl(originalUrl, type),
    
    // Estratégia 2: Proxies CORS
    ...CORS_PROXIES.map(proxy => () => testProxyUrl(proxy + encodeURIComponent(originalUrl), type)),
    
    // Estratégia 3: Fetch e Blob (para áudio)
    ...(type === 'audio' ? [() => createBlobUrl(originalUrl)] : []),
    
    // Estratégia 4: Base64 embed (para imagens pequenas)
    ...(type === 'image' ? [() => createBase64Url(originalUrl)] : [])
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
 * Testa uma URL através de proxy
 */
const testProxyUrl = async (proxyUrl, type) => {
  return new Promise((resolve, reject) => {
    if (type === 'audio') {
      const audio = new Audio();
      
      const timeout = setTimeout(() => {
        reject(new Error('Timeout no proxy'));
      }, 8000);
      
      audio.oncanplaythrough = () => {
        clearTimeout(timeout);
        resolve(proxyUrl);
      };
      
      audio.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Erro no proxy de áudio'));
      };
      
      audio.src = proxyUrl;
    } else if (type === 'image') {
      const img = new Image();
      
      const timeout = setTimeout(() => {
        reject(new Error('Timeout no proxy'));
      }, 8000);
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve(proxyUrl);
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Erro no proxy de imagem'));
      };
      
      img.src = proxyUrl;
    }
  });
};

/**
 * Cria uma Blob URL para áudio
 */
const createBlobUrl = async (url) => {
  try {
    const response = await fetch(url, {
      mode: 'cors',
      headers: {
        'Accept': 'audio/*'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    throw new Error(`Falha ao criar blob: ${error.message}`);
  }
};

/**
 * Cria uma URL base64 para imagem
 */
const createBase64Url = async (url) => {
  try {
    const response = await fetch(url, {
      mode: 'cors',
      headers: {
        'Accept': 'image/*'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Erro ao converter para base64'));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    throw new Error(`Falha ao criar base64: ${error.message}`);
  }
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
  clearMediaCache,
  checkAudioSupport
};

