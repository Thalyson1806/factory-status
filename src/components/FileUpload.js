import React, { useState, useRef } from 'react';
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const FileUpload = ({ onFileUpload, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    // Verificar se é um arquivo CSV
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadStatus('error');
      return;
    }

    setFileName(file.name);
    setUploadStatus('uploading');

    try {
      // Simular delay de upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Chamar função de upload
      await onFileUpload(file);
      
      setUploadStatus('success');
      
      // Fechar modal após sucesso
      setTimeout(() => {
        onClose();
        setUploadStatus('idle');
        setFileName('');
      }, 2000);
      
    } catch (error) {
      console.error('Erro no upload:', error);
      setUploadStatus('error');
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl border max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Carregar Arquivo CSV</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Upload Area */}
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300
            ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${uploadStatus === 'success' ? 'border-green-400 bg-green-50' : ''}
            ${uploadStatus === 'error' ? 'border-red-400 bg-red-50' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleChange}
            className="hidden"
          />

          {/* Status Icons */}
          <div className="mb-4">
            {uploadStatus === 'idle' && (
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
            )}
            {uploadStatus === 'uploading' && (
              <div className="w-12 h-12 mx-auto">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
            )}
            {uploadStatus === 'success' && (
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            )}
            {uploadStatus === 'error' && (
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            )}
          </div>

          {/* Status Messages */}
          {uploadStatus === 'idle' && (
            <>
              <p className="text-gray-700 mb-2">
                Arraste e solte seu arquivo CSV aqui
              </p>
              <p className="text-gray-500 text-sm mb-4">
                ou clique para selecionar
              </p>
              <button
                onClick={onButtonClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Selecionar Arquivo
              </button>
            </>
          )}

          {uploadStatus === 'uploading' && (
            <>
              <p className="text-gray-700 mb-2">Carregando arquivo...</p>
              <p className="text-gray-500 text-sm">{fileName}</p>
            </>
          )}

          {uploadStatus === 'success' && (
            <>
              <p className="text-green-600 mb-2">Arquivo carregado com sucesso!</p>
              <p className="text-gray-500 text-sm">{fileName}</p>
            </>
          )}

          {uploadStatus === 'error' && (
            <>
              <p className="text-red-600 mb-2">Erro ao carregar arquivo</p>
              <p className="text-gray-500 text-sm">
                Certifique-se de que é um arquivo CSV válido
              </p>
              <button
                onClick={() => {
                  setUploadStatus('idle');
                  setFileName('');
                }}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Tentar Novamente
              </button>
            </>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold mb-1">Formato esperado:</p>
              <p>Arquivo CSV com colunas separadas por ponto e vírgula (;)</p>
              <p>Primeira linha deve conter os cabeçalhos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;