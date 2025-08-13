import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { uploadService, processingService, apiUtils, cardsService } from '../services/api';
import TextInput from './TextInput';
import ResultsTable from './ResultsTable';

const FileUpload = ({ onUploadComplete }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const [results, setResults] = useState(null);
  const [success, setSuccess] = useState('');

   const [isSaving, setIsSaving] = useState(false);

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError(null);
    
    if (rejectedFiles.length > 0) {
      setError('Alguns arquivos foram rejeitados. Verifique o tipo e tamanho dos arquivos.');
      return;
    }


    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'pending',
      progress: 0,
      uploadedFileId: null,
      jobId: null
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  const removeFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const fileItem = files[i];
        
        if (fileItem.status !== 'pending') continue;

        // Atualizar status para uploading
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'uploading', progress: 0 } : f
        ));

        try {
          // Upload do arquivo
          const uploadResult = await uploadService.uploadFile(
            fileItem.file,
            (progress) => {
              setFiles(prev => prev.map(f => 
                f.id === fileItem.id ? { ...f, progress: progress / 2 } : f // 50% para upload
              ));
              setUploadProgress(((i * 100) + (progress / 2)) / files.length);
            }
          );

          // Arquivo enviado com sucesso
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { 
              ...f, 
              status: 'processing', 
              progress: 50,
              uploadedFileId: uploadResult.id // Usar 'id' em vez de 'fileId'
            } : f
          ));

          // Iniciar processamento
          const jobResponse = await processingService.analyzeFile(uploadResult.id); // Usar 'id'
          
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { ...f, jobId: jobResponse.jobId } : f
          ));

          // Fazer polling do status do job
          const finalStatus = await apiUtils.pollJobStatus(
            jobResponse.jobId,
            (status) => {
              if (status && typeof status === 'object') {
                const progressValue = 50 + (status.progress || 0) / 2; // 50% + até 50% para processamento
                setFiles(prev => prev.map(f => 
                  f.id === fileItem.id ? { ...f, progress: progressValue } : f
                ));
                setUploadProgress(((i * 100) + progressValue) / files.length);
              }
            }
          );

          if (finalStatus && finalStatus.status === 'completed') {

            setResults(finalStatus.result);
            console.log('Dados extraídos:', finalStatus.result);
            setSuccess('Dados extraídos com sucesso! Revise e confirme para salvar.');

            // Marcar como concluído
            setFiles(prev => prev.map(f => 
              f.id === fileItem.id ? { ...f, status: 'completed', progress: 100 } : f
            ));

            // Notificar componente pai
            if (onUploadComplete) {
              onUploadComplete({
                id: fileItem.id,
                name: fileItem.name,
                type: 'file',
                status: 'completed',
                uploadedAt: new Date().toISOString(),
                extractedData: finalStatus.result
              });
            }
          } else {
            throw new Error(finalStatus?.error || 'Erro no processamento');
          }

        } catch (fileError) {
          console.error(`Erro no arquivo ${fileItem.name}:`, fileError);
          setFiles(prev => prev.map(f => 
            f.id === fileItem.id ? { 
              ...f, 
              status: 'error', 
              error: fileError.message 
            } : f
          ));
        }
      }

      // Limpar arquivos concluídos após alguns segundos
      setTimeout(() => {
        setFiles(prev => prev.filter(f => f.status !== 'completed'));
        setUploadProgress(0);
      }, 3000);

    } catch (err) {
      console.error('Erro geral no upload:', err);
      setError(`Erro no upload: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (type === 'text/plain') return <FileText className="h-4 w-4" />;
    if (type === 'application/pdf') return <File className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (file) => {
    switch (file.status) {
      case 'pending':
        return <Badge variant="secondary">Aguardando</Badge>;
      case 'uploading':
        return <Badge variant="default">Enviando...</Badge>;
      case 'processing':
        return <Badge variant="default">Processando...</Badge>;
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Concluído
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Erro
          </Badge>
        );
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  const handleTextProcessComplete = (result) => {
    if (onUploadComplete) {
      onUploadComplete(result);
    }
  };


   const handleEdit = (editedData) => {
    // Preservar os IDs personalizados que o usuário possa ter adicionado
    setResults(editedData);
  };


  const handleConfirm = async (confirmedData) => {
      setIsSaving(true);
      setError('');
      
      try {
        const response = await cardsService.create(confirmedData);
        
        setSuccess(`✅ Dados salvos com sucesso! Card ID: ${response.id}`);
        setResults(null);
        
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
    
  const handleReject = () => {
    setResults(null);
    setError('');
    setSuccess('');
  };


  return (
    <div className="w-full space-y-6">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload de Arquivos
          </TabsTrigger>
          <TabsTrigger value="text" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Entrada de Texto
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload de Arquivos</CardTitle>
              <CardDescription>
                Faça upload de imagens, PDFs ou arquivos de texto com cards de preços para processamento com ChatGPT
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary/50'
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                {isDragActive ? (
                  <p className="text-lg">Solte os arquivos aqui...</p>
                ) : (
                  <div>
                    <p className="text-lg mb-2">
                      Arraste arquivos aqui ou clique para selecionar
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Suporta PNG, JPG, PDF, TXT (máx. 10MB cada)
                    </p>
                  </div>
                )}
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {files.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Arquivos Selecionados:</h4>
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3 flex-1">
                        {getFileIcon(file.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                          {(file.status === 'uploading' || file.status === 'processing') && (
                            <Progress value={file.progress} className="mt-2" />
                          )}
                          {file.error && (
                            <p className="text-xs text-red-500 mt-1">{file.error}</p>
                          )}
                          {file.jobId && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Job ID: {file.jobId}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(file)}
                        </div>
                      </div>
                      {!uploading && file.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progresso geral</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}

                  <Button 
                    onClick={uploadFiles} 
                    disabled={uploading || files.filter(f => f.status === 'pending').length === 0}
                    className="w-full"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processando arquivos...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Enviar e Processar {files.filter(f => f.status === 'pending').length} arquivo(s)
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="text">
          <TextInput onProcessComplete={handleTextProcessComplete} />
        </TabsContent>
      </Tabs>


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

export default FileUpload;

