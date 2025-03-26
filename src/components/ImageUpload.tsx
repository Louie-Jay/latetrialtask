import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import { uploadImage } from '../lib/storage';

type ImageUploadProps = {
  value: string;
  onChange: (url: string) => void;
  bucket: string;
  path: string;
  className?: string;
};

export default function ImageUpload({ value, onChange, bucket, path, className = '' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      // Create preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // Upload image
      const publicUrl = await uploadImage(file, bucket, path);
      
      if (!publicUrl) {
        throw new Error('Failed to upload image');
      }

      onChange(publicUrl);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      setPreview(value); // Revert to original image
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      {/* Preview Area */}
      <div className="relative h-48 mb-4">
        {preview ? (
          <div className="relative h-full">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1 rounded-full bg-red-500/80 text-white hover:bg-red-600/80 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center rounded-lg bg-gray-800/30 border-2 border-dashed border-gray-700">
            <div className="text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-400">No image selected</p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="secondary-button flex-1 flex items-center justify-center space-x-2 py-3"
        >
          {uploading ? (
            <>
              <Loader className="animate-spin h-5 w-5 mr-2" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 mr-2" />
              <span>{value ? 'Change Image' : 'Upload Image'}</span>
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}