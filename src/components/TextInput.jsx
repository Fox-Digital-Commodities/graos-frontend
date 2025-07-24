import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { FileText, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { processingService, apiUtils } from '../services/api';

const TextInput = ({ onProcessComplete }) => {
  const [textContent, setTextContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState(null);
  const [error, setError] = useState(null);
  const [currentJobId, setCurrentJobId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!textContent.trim()) {
      setError('Por favor, insira o texto das ofertas de grãos');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingStatus('Enviando texto para processamento...');

    try {
      // Enviar texto para análise
      const jobResponse = await processingService.analyzeText(textContent);
      const jobId = jobResponse.jobId;
      setCurrentJobId(jobId);
      
      setProcessingStatus('Processando com ChatGPT...');

      // Fazer polling do status do job
      const finalStatus = await apiUtils.pollJobStatus(
        jobId,
        (status) => {
          setProcessingStatus(getStatusMessage(status.status, status.progress));
        }
      );

      if (finalStatus.status === 'completed') {
        setProcessingStatus('Texto processado com sucesso!');
        
        if (onProcessComplete) {
          onProcessComplete({
            id: jobId,
            type: 'text',
            content: textContent,
            status: 'completed',
            processedAt: new Date().toISOString(),
            extractedData: finalStatus.result
          });
        }

        // Limpar formulário após sucesso
        setTimeout(() => {
          setTextContent('');
          setProcessingStatus(null);
          setCurrentJobId(null);
        }, 3000);

      } else {
        throw new Error(finalStatus.error || 'Erro no processamento');
      }

    } catch (err) {
      console.error('Erro no processamento:', err);
      setError(`Erro ao processar texto: ${err.message}`);
      setProcessingStatus(null);
      setCurrentJobId(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusMessage = (status, progress) => {
    switch (status) {
      case 'pending':
        return 'Aguardando processamento...';
      case 'processing':
        return `Analisando com ChatGPT... ${progress ? `(${progress}%)` : ''}`;
      case 'completed':
        return 'Processamento concluído!';
      case 'failed':
        return 'Erro no processamento';
      default:
        return 'Processando...';
    }
  };

  const handleClear = () => {
    setTextContent('');
    setError(null);
    setProcessingStatus(null);
    setCurrentJobId(null);
  };

  const exampleText = `Exemplo de formato:
SOJA 2024/2025 FOB - GO PADRE BERNARDO
Setembro: R$ 122,55 (US$ 21,70) - Pagamento 22/09/2025

MILHO 2025/2025 FOB - GO PADRE BERNARDO  
Outubro: R$ 47,01 (US$ 8,25) - Pagamento 30/10/2025`;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Importar via Texto
        </CardTitle>
        <CardDescription>
          Cole ou digite diretamente as ofertas de grãos para processamento automático com ChatGPT
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-content">Texto das Ofertas</Label>
            <Textarea
              id="text-content"
              placeholder={exampleText}
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
              disabled={isProcessing}
            />
            <p className="text-xs text-muted-foreground">
              Cole aqui o texto com as ofertas de grãos. O ChatGPT irá extrair automaticamente 
              os dados de produtos, preços, datas e outras informações relevantes.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {processingStatus && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {processingStatus}
                {currentJobId && (
                  <div className="text-xs mt-1 text-muted-foreground">
                    Job ID: {currentJobId}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isProcessing || !textContent.trim()}
              className="flex-1"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Processar com ChatGPT
                </>
              )}
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClear}
              disabled={isProcessing}
            >
              Limpar
            </Button>
          </div>
        </form>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Dicas para melhor processamento:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Inclua informações de produto (SOJA, MILHO, etc.)</li>
            <li>• Especifique safra, modalidade (FOB, CIF) e localização</li>
            <li>• Forneça preços em R$ e US$ quando disponível</li>
            <li>• Inclua datas de embarque e pagamento</li>
            <li>• Use quebras de linha para separar diferentes produtos</li>
            <li>• O ChatGPT processará automaticamente o texto e extrairá os dados estruturados</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TextInput;

