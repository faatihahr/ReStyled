'use client';

import { useState } from 'react';

interface QuestionnaireData {
  gender: string;
  style: string[];
  height: string;
  weight: string;
  skinUndertone: string;
}

interface QuestionnaireModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: QuestionnaireData) => void;
  onSkip: () => void;
}

export default function QuestionnaireModal({ isOpen, onClose, onSubmit, onSkip }: QuestionnaireModalProps) {
  const [formData, setFormData] = useState<QuestionnaireData>({
    gender: '',
    style: [],
    height: '',
    weight: '',
    skinUndertone: ''
  });

  const [currentStep, setCurrentStep] = useState(0);

  const questions = [
    {
      title: "Jenis Kelamin",
      subtitle: "Pilih preferensi gender untuk styling",
      field: "gender" as keyof QuestionnaireData,
      options: ["Pria", "Wanita", "Unisex"]
    },
    {
      title: "Style Preference",
      subtitle: "Pilih gaya fashion yang kamu suka",
      field: "style" as keyof QuestionnaireData,
      options: ["Casual", "Classic", "Chic", "Streetwear", "Preppy", "Vintage Retro", "Y2K", "Minimalist"]
    },
    {
      title: "Data Tubuh",
      subtitle: "Input tinggi dan berat badan untuk analisis bentuk tubuh",
      field: "body" as string,
      type: "body"
    },
    {
      title: "Skin Undertone",
      subtitle: "Pilih warna kulit dasar untuk rekomendasi warna yang tepat",
      field: "skinUndertone" as keyof QuestionnaireData,
      options: ["Cool", "Warm", "Neutral"]
    }
  ];

  const handleOptionSelect = (field: keyof QuestionnaireData, value: string) => {
    if (field === 'style') {
      setFormData(prev => ({
        ...prev,
        style: prev.style.includes(value)
          ? prev.style.filter(s => s !== value)
          : [...prev.style, value]
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleBodyDataChange = (field: 'height' | 'weight', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(formData);
    onClose();
  };

  const isCurrentStepValid = () => {
    const currentQuestion = questions[currentStep];
    if (currentQuestion.type === "body") {
      return formData.height && formData.weight;
    }
    if (currentQuestion.field === 'style') {
      return formData.style.length > 0;
    }
    return formData[currentQuestion.field as keyof QuestionnaireData] !== '';
  };

  if (!isOpen) return null;

  const currentQuestion = questions[currentStep];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#aace67]/30 via-pink-200/30 to-[#ffa4a4]/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto font-merriweather">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Kuisioner Gaya Personal
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl cursor-pointer"
            >
              ×
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Langkah {currentStep + 1} dari {questions.length}</span>
              <span>{Math.round(((currentStep + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#aace67] h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {currentQuestion.title}
            </h3>
            <p className="text-gray-600 mb-6">
              {currentQuestion.subtitle}
            </p>

            {/* Options */}
            {currentQuestion.type === "body" ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tinggi Badan (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleBodyDataChange('height', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#aace67] focus:border-transparent cursor-pointer"
                    placeholder="Contoh: 170"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Berat Badan (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleBodyDataChange('weight', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#aace67] focus:border-transparent cursor-pointer"
                    placeholder="Contoh: 65"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options?.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleOptionSelect(currentQuestion.field, option)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-left cursor-pointer ${
                      currentQuestion.field === 'style' && formData.style.includes(option)
                        ? 'border-[#aace67] bg-[#aace67] bg-opacity-10'
                        : currentQuestion.field !== 'style' && formData[currentQuestion.field as keyof QuestionnaireData] === option
                        ? 'border-[#aace67] bg-[#aace67] bg-opacity-10'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <span className="font-medium">{option}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`px-6 py-2 rounded-lg transition cursor-pointer ${
                currentStep === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              Sebelumnya
            </button>

            <div className="flex gap-3">
              <button
                onClick={onSkip}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition cursor-pointer"
              >
                Lewati
              </button>
              <button
                onClick={handleNext}
                disabled={!isCurrentStepValid()}
                className={`px-6 py-2 rounded-lg transition cursor-pointer ${
                  isCurrentStepValid()
                    ? 'bg-[#aace67] text-white hover:bg-[#9bc55f]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {currentStep === questions.length - 1 ? 'Selesai' : 'Selanjutnya'}
              </button>
            </div>
          </div>

          {/* Skip Explanation */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Catatan:</strong> Kuisioner ini akan meningkatkan akurasi rekomendasi AI sebesar 80%. 
              Anda bisa melewati ini sekarang dan mengupdate preferensi kapan saja melalui halaman Settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
