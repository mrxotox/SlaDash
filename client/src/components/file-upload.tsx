import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFileUploaded: () => void;
}

export default function FileUpload({ onFileUploaded }: FileUploadProps) {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiRequest('POST', '/api/tickets/upload', formData);
      return response.json();
    },
    onSuccess: (data) => {
      setUploadStatus('success');
      toast({
        title: "Upload Successful",
        description: `Processed ${data.count} tickets successfully.`,
      });
      onFileUploaded();
    },
    onError: (error: any) => {
      setUploadStatus('error');
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to process CSV file. Please check the format and try again.",
        variant: "destructive",
      });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast({
        title: "File Too Large",
        description: "File size must be less than 10MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadStatus('uploading');
    uploadMutation.mutate(file);
  }, [uploadMutation, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5 text-primary" />
          <span data-testid="upload-title">Upload Ticket Data</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300
            ${isDragActive 
              ? 'border-primary bg-primary/5 transform scale-105' 
              : 'border-gray-300 hover:border-primary hover:bg-gray-50'
            }
            ${uploadStatus === 'uploading' ? 'pointer-events-none opacity-50' : ''}
          `}
          data-testid="upload-dropzone"
        >
          <input {...getInputProps()} data-testid="file-input" />
          
          {uploadStatus === 'uploading' && (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-lg font-medium text-gray-700" data-testid="upload-status">
                Processing CSV file...
              </p>
            </div>
          )}

          {uploadStatus === 'success' && (
            <div className="space-y-4">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <div>
                <p className="text-lg font-medium text-green-700" data-testid="upload-success">
                  File uploaded successfully!
                </p>
                <p className="text-sm text-gray-600">
                  Your ticket data has been processed and is ready for analysis.
                </p>
              </div>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <div>
                <p className="text-lg font-medium text-red-700" data-testid="upload-error">
                  Upload failed
                </p>
                <p className="text-sm text-gray-600">
                  Please check your file format and try again.
                </p>
              </div>
            </div>
          )}

          {uploadStatus === 'idle' && (
            <div className="space-y-4">
              <FileText className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-700" data-testid="upload-instructions">
                  {isDragActive 
                    ? "Drop your CSV file here" 
                    : "Drop your CSV file here or click to browse"
                  }
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Supports CSV files up to 10MB
                </p>
                <Button variant="outline" data-testid="button-select-file">
                  Select File
                </Button>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-4 flex items-center text-sm text-gray-600">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span data-testid="upload-format-info">
            Expected format: Request ID, Subject, Technician, Status, Due Date, Priority, Category
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
