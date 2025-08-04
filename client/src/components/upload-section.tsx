import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useDropzone } from "react-dropzone"
import { useMutation, useQueryClient } from "@tanstack/react-query"

export default function UploadSection() {
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [uploadedCount, setUploadedCount] = useState(0)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/tickets/upload', {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Upload failed')
      }
      
      return response.json()
    },
    onSuccess: (data) => {
      setUploadStatus('success')
      setUploadedCount(data.count)
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard'] })
      toast({
        title: "Upload successful",
        description: `${data.count} tickets uploaded successfully`,
      })
    },
    onError: (error) => {
      setUploadStatus('error')
      toast({
        title: "Upload failed",
        description: "Please check your file format and try again",
        variant: "destructive",
      })
    }
  })

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setUploadStatus('uploading')
      uploadMutation.mutate(file)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Ticket Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-gray-300 dark:border-gray-600'}
            ${uploadStatus === 'uploading' ? 'pointer-events-none opacity-50' : ''}
          `}
          data-testid="file-dropzone"
        >
          <input {...getInputProps()} />
          
          {uploadStatus === 'uploading' && (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
            </div>
          )}

          {uploadStatus === 'success' && (
            <div className="flex flex-col items-center gap-2 text-green-600">
              <CheckCircle className="h-8 w-8" />
              <p className="text-sm font-medium">Upload Successful!</p>
              <p className="text-xs text-gray-500">{uploadedCount} tickets processed</p>
            </div>
          )}

          {(uploadStatus === 'idle' || uploadStatus === 'error') && (
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isDragActive
                  ? "Drop your CSV file here"
                  : "Drag & drop a CSV file here, or click to select"}
              </p>
              <p className="text-xs text-gray-500">
                Supports CSV, XLS, XLSX files
              </p>
            </div>
          )}
        </div>

        {(uploadStatus === 'idle' || uploadStatus === 'error') && (
          <Button 
            onClick={() => {
              const input = document.querySelector('input[type="file"]') as HTMLInputElement;
              input?.click();
            }}
            className="w-full"
            data-testid="button-select-file"
          >
            Select File
          </Button>
        )}
      </CardContent>
    </Card>
  )
}