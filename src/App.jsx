import { useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import Layout from './components/Layout';
import FileUpload from './components/FileUpload';
import CardsList from './components/CardsList';
import SpreadsheetGenerator from './components/SpreadsheetGenerator';
import ChatManager from './components/ChatManager';
import './App.css';

function App() {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleUploadComplete = (fileInfo) => {
    setUploadedFiles(prev => [...prev, fileInfo]);
    console.log('Arquivo enviado:', fileInfo);
  };

  return (
    <Layout>
      <TabsContent value="upload" className="space-y-6">
        <FileUpload onUploadComplete={handleUploadComplete} />
      </TabsContent>

      <TabsContent value="cards" className="space-y-6">
        <CardsList uploadedData={uploadedFiles} />
      </TabsContent>

      <TabsContent value="spreadsheets" className="space-y-6">
        <SpreadsheetGenerator />
      </TabsContent>

      <TabsContent value="chat" className="space-y-6">
        <ChatManager />
      </TabsContent>
    </Layout>
  );
}

export default App;
