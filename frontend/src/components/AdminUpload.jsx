import { useParams } from 'react-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import axiosClient from '../utils/axiosClient';
import { Upload, CheckCircle, AlertCircle, Film, Clock, Calendar, FileVideo } from 'lucide-react';

function AdminUpload() {
  const { problemId } = useParams();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  
  const { register, handleSubmit, watch, formState: { errors }, reset, setError, clearErrors } = useForm();
  const selectedFile = watch('videoFile')?.[0];

  const onSubmit = async (data) => {
    const file = data.videoFile[0];
    setUploading(true);
    setUploadProgress(0);
    clearErrors();

    try {
      const signatureResponse = await axiosClient.get(`/video/create/${problemId}`);
      const { signature, timestamp, public_id, api_key, cloud_name, upload_url } = signatureResponse.data;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('public_id', public_id);
      formData.append('api_key', api_key);

      const uploadResponse = await axios.post(upload_url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      const cloudinaryResult = uploadResponse.data;

      const metadataResponse = await axiosClient.post('/video/save', {
        problemId: problemId,
        cloudinaryPublicId: cloudinaryResult.public_id,
        secureUrl: cloudinaryResult.secure_url,
        duration: cloudinaryResult.duration,
      });

      setUploadedVideo(metadataResponse.data.videoSolution);
      reset();
    } catch (err) {
      console.error('Upload error:', err);
      setError('root', {
        type: 'manual',
        message: err.response?.data?.message || 'Upload failed. Please try again.'
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Film className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Upload Video Solution</h1>
                <p className="text-blue-100 mt-1">Problem ID: {problemId}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
            {/* File Upload Area */}
            <div className="space-y-4">
              <label className="block">
                <div className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${
                  errors.videoFile 
                    ? 'border-red-300 bg-red-50' 
                    : selectedFile 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'
                }`}>
                  <input
                    type="file"
                    accept="video/*"
                    {...register('videoFile', {
                      required: 'Please select a video file',
                      validate: {
                        isVideo: (files) => {
                          if (!files || !files[0]) return 'Please select a video file';
                          const file = files[0];
                          return file.type.startsWith('video/') || 'Please select a valid video file';
                        },
                        fileSize: (files) => {
                          if (!files || !files[0]) return true;
                          const file = files[0];
                          const maxSize = 100 * 1024 * 1024;
                          return file.size <= maxSize || 'File size must be less than 100MB';
                        }
                      }
                    })}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploading}
                  />
                  
                  <div className="py-12 px-6 text-center">
                    <div className="mx-auto w-16 h-16 mb-4 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-lg font-semibold text-slate-700 mb-2">
                      {selectedFile ? 'File Selected' : 'Choose a video file'}
                    </p>
                    <p className="text-sm text-slate-500">
                      Click to browse or drag and drop
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      Max file size: 100MB
                    </p>
                  </div>
                </div>
              </label>

              {errors.videoFile && (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-3 rounded-lg">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{errors.videoFile.message}</span>
                </div>
              )}
            </div>

            {/* Selected File Info */}
            {selectedFile && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-500 p-3 rounded-lg">
                    <FileVideo className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate text-lg">
                      {selectedFile.name}
                    </p>
                    <p className="text-slate-600 mt-1">
                      Size: <span className="font-medium">{formatFileSize(selectedFile.size)}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-medium text-slate-700">
                  <span>Uploading...</span>
                  <span className="text-blue-600">{uploadProgress}%</span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {errors.root && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{errors.root.message}</span>
              </div>
            )}

            {/* Success Message */}
            {uploadedVideo && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-green-500 p-3 rounded-full">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-green-900 mb-3">
                      Upload Successful!
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-green-700">
                        <Clock className="w-4 h-4" />
                        <span>Duration: <span className="font-semibold">{formatDuration(uploadedVideo.duration)}</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-green-700">
                        <Calendar className="w-4 h-4" />
                        <span>Uploaded: <span className="font-semibold">{new Date(uploadedVideo.uploadedAt).toLocaleString()}</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={uploading || !selectedFile}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-3 text-lg"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Upload Video
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminUpload;