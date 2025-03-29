"use client"

import React, { useState, useRef } from 'react';
import axios from 'axios';

const OCR = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [textResult, setTextResult] = useState('');
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  const cloudinaryUrl = process.env.NEXT_PUBLIC_CLOUDINARY_URL || 'cloudinary://187586565527913:tLVJnIsXiUEWY9xpDnzGQWZi9Dw@dd6nsdcff';
  const cloudName = cloudinaryUrl.split('@')[1] || 'dd6nsdcff';
  const cloudinaryApiKey = '187586565527913';
  const cloudinaryUploadPreset = 'ml_default';

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageUrl(URL.createObjectURL(file));
      processImage(file);
    }
  };

  const processImage = async (imageFile) => {
    setIsLoading(true);
    setTextResult('');
    setExplanation('');

    try {
      // Step 1: Upload image to Cloudinary
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', imageFile);
      cloudinaryFormData.append('upload_preset', cloudinaryUploadPreset);
      cloudinaryFormData.append('api_key', cloudinaryApiKey);

      const cloudinaryResponse = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        cloudinaryFormData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const publicImageUrl = cloudinaryResponse.data.secure_url;

      // Step 2: OCR Processing
      const ocrFormData = new URLSearchParams();
      ocrFormData.set('url', publicImageUrl);

      const ocrResponse = await axios.post(
        'https://ocr43.p.rapidapi.com/v1/results',
        ocrFormData,
        {
          headers: {
            'x-rapidapi-key': 'eefb2d8bd3msh23d0c47bb497b92p1209e8jsn73445f70d294',
            'x-rapidapi-host': 'ocr43.p.rapidapi.com',
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      const extractedText = ocrResponse.data.results?.[0]?.entities?.[0]?.objects?.[0]?.entities?.[0]?.text || 'No text found';
      setTextResult(extractedText);

      // Step 3: Get Explanation
      const explanationResponse = await axios.post(
        'https://deepseek-r1-distill-llama-70b.p.rapidapi.com/chat_completions',
        {
          messages: [
            {
              role: 'user',
              content: `Explain what each word or phrase in "${extractedText}" means in simple terms.`
            }
          ],
          frequency_penalty: 0,
          presence_penalty: 0,
          temperature: 1,
          top_p: 1
        },
        {
          headers: {
            'x-rapidapi-key': 'eefb2d8bd3msh23d0c47bb497b92p1209e8jsn73445f70d294',
            'x-rapidapi-host': 'deepseek-r1-distill-llama-70b.p.rapidapi.com',
            'Content-Type': 'application/json'
          }
        }
      );

      const explanationText = explanationResponse.data.choices?.[0]?.message?.content || 'No explanation available';
      setExplanation(explanationText);
    } catch (error) {
      console.error('Error:', error);
      setTextResult('Error processing image');
      setExplanation(`Failed to process: ${error.response?.data?.error?.message || error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Visual to Text Analyzer</h1>
      
      <div className="mb-4 sm:mb-6">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
        <button
          onClick={triggerFileInput}
          className="w-full sm:w-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300 flex items-center justify-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Upload Image'
          )}
        </button>
      </div>

      {imageUrl && (
        <div className="mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Uploaded Image</h2>
          <div className="flex justify-center">
            <img 
              src={imageUrl} 
              alt="Uploaded content" 
              className="max-w-full h-auto max-h-[300px] sm:max-h-[400px] rounded-lg border border-gray-200 shadow-sm" 
            />
          </div>
        </div>
      )}

      {textResult && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Extracted Text</h2>
          <p className="whitespace-pre-wrap text-sm sm:text-base bg-white p-3 rounded border border-gray-100">
            {textResult}
          </p>
        </div>
      )}

      {explanation && (
        <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Explanation</h2>
          <p className="whitespace-pre-wrap text-sm sm:text-base bg-white p-3 rounded border border-blue-100">
            {explanation}
          </p>
        </div>
      )}

      {isLoading && !textResult && (
        <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center space-x-2">
            <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Processing your image...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OCR;