import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Type, Sparkles, CheckCircle } from 'lucide-react';
import { processingService, cardsService } from '../services/api';
import ResultsTable from './ResultsTable';

const TextInput = () => {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim()) {
      setError('Por favor, insira o texto das ofertas');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');
    setResults(null);

    try {
      // Iniciar processamento
      const response = await processingService.analyzeText(text);
      setJobId(response.jobId);

      // Monitorar progresso
      const result = await processingService.pollJobStatus(response.jobId);
      
      if (result.status === 'completed' && result.result) {
        setResults(result.result);
        setSuccess('Dados extraídos com sucesso! Revise e confirme para salvar.');
      } else if (result.status === 'error') {
        setError(result.error || 'Erro no processamento');
      }
    } catch (err) {
      console.error('Erro ao processar texto:', err);
      setError(`Erro ao processar texto: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirm = async (confirmedData) => {
    setIsSaving(true);
    setError('');
    
    try {
      const response = await cardsService.create(confirmedData);
      
      setSuccess(`✅ Dados salvos com sucesso! Card ID: ${response.id}`);
      setResults(null);
      setText('');
      
      // Limpar após 5 segundos
      setTimeout(() => {
        setSuccess('');
      }, 5000);
      
    } catch (err) {
      console.error('Erro ao salvar dados:', err);
      setError(`Erro ao salvar no banco: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (editedData) => {
    // Preservar os IDs personalizados que o usuário possa ter adicionado
    setResults(editedData);
  };

  const handleReject = () => {
    setResults(null);
    setError('');
    setSuccess('');
  };

  const clearAll = () => {
    setText('');
    setResults(null);
    setError('');
    setSuccess('');
    setJobId(null);
  };

  return (
    <div className="space-y-6">
      {/* Formulário de Entrada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Entrada de Texto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Textarea
                placeholder="Cole aqui o texto com as ofertas de grãos...

Exemplo:
SOJA 2024/2025 FOB - GO PADRE BERNARDO
Setembro: R$ 122,55 (US$ 21,70) - Pagamento 22/09/2025
Outubro: R$ 125,00 (US$ 22,00) - Pagamento 30/10/2025

MILHO 2025/2025 FOB - GO PADRE BERNARDO  
Setembro: R$ 47,12 (US$ 8,33) - Pagamento 30/09/2025"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="min-h-[200px] resize-y"
                disabled={isProcessing}
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isProcessing || !text.trim()}
                className="flex items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processando com ChatGPT...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Processar com ChatGPT
                  </>
                )}
              </Button>
              
              {(text || results) && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={clearAll}
                  disabled={isProcessing}
                >
                  Limpar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Status do Processamento */}
      {isProcessing && jobId && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              <div>
                <p className="font-medium">Processando com ChatGPT...</p>
                <p className="text-sm text-muted-foreground">Job ID: {jobId}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertas */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Tabela de Resultados */}
      {results && (
        <ResultsTable
          results={results}
          onConfirm={handleConfirm}
          onEdit={handleEdit}
          onReject={handleReject}
          isLoading={isSaving}
        />
      )}
    </div>
  );
};

export default TextInput;

