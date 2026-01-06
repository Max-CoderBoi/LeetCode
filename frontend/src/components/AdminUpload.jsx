import { useParams } from 'react-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import axiosClient from '../utils/axiosClient';
import { Upload, CheckCircle, AlertCircle, Film, Clock, Calendar, FileVideo, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800/50 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative px-8 py-6 border-b border-slate-800/50">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 opacity-10 blur"></div>
            <div className="relative flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <Film className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Upload Video Solution</h1>
                <p className="text-slate-400 mt-1">Problem ID: <span className="text-purple-400 font-medium">{problemId}</span></p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {/* File Upload Area */}
            <div className="space-y-4">
              <label className="block">
                <div className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${
                  errors.videoFile 
                    ? 'border-rose-500/50 bg-rose-500/5' 
                    : selectedFile 
                    ? 'border-purple-500/50 bg-purple-500/5' 
                    : 'border-slate-700/50 bg-slate-800/30 hover:border-purple-500/50 hover:bg-slate-800/50'
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
                    <div className="relative mx-auto w-16 h-16 mb-4">
                      <div className="absolute -inset-0.5 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full opacity-20 blur"></div>
                      <div className="relative w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-white mb-2">
                      {selectedFile ? 'File Selected' : 'Choose a video file'}
                    </p>
                    <p className="text-sm text-slate-400">
                      Click to browse or drag and drop
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      Max file size: 100MB
                    </p>
                  </div>
                </div>
              </label>

              {errors.videoFile && (
                <div className="flex items-center gap-2 text-rose-400 bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-xl">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{errors.videoFile.message}</span>
                </div>
              )}
            </div>

            {/* Selected File Info */}
            {selectedFile && (
              <div className="relative bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 backdrop-blur-sm">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-10 blur"></div>
                <div className="relative flex items-start gap-4">
                  <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-lg">
                    <FileVideo className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate text-lg">
                      {selectedFile.name}
                    </p>
                    <p className="text-slate-400 mt-1">
                      Size: <span className="font-medium text-slate-300">{formatFileSize(selectedFile.size)}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-medium text-slate-300">
                  <span>Uploading...</span>
                  <span className="text-purple-400">{uploadProgress}%</span>
                </div>
                <div className="relative h-3 bg-slate-800/50 border border-slate-700/50 rounded-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
                  <div
                    className="relative h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300 ease-out rounded-full shadow-lg shadow-purple-500/50"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error Message */}
            {errors.root && (
              <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-5 py-4 rounded-xl backdrop-blur-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{errors.root.message}</span>
              </div>
            )}

            {/* Success Message */}
            {uploadedVideo && (
              <div className="relative bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl opacity-10 blur"></div>
                <div className="relative flex items-start gap-4">
                  <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-full">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-3">
                      Upload Successful!
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span>Duration: <span className="font-semibold text-white">{formatDuration(uploadedVideo.duration)}</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-300">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <span>Uploaded: <span className="font-semibold text-white">{new Date(uploadedVideo.uploadedAt).toLocaleString()}</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="pt-4">
              <div className="relative group">
                <div className={`absolute -inset-0.5 rounded-xl opacity-0 blur transition-opacity duration-300 ${
                  !uploading && selectedFile 
                    ? 'group-hover:opacity-75 bg-gradient-to-r from-purple-600 to-pink-600' 
                    : ''
                }`}></div>
                <button
                  type="button"
                  onClick={handleSubmit(onSubmit)}
                  disabled={uploading || !selectedFile}
                  className="relative w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-700 disabled:to-slate-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUpload;