import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronDown, ChevronUp, Plus, X, AlertCircle, CheckCircle } from 'lucide-react';

// Zod schema
const problemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.enum(['array', 'linkedList', 'graph', 'dp']),
  visibleTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required'),
      explanation: z.string().min(1, 'Explanation is required')
    })
  ).min(1, 'At least one visible test case required'),
  hiddenTestCases: z.array(
    z.object({
      input: z.string().min(1, 'Input is required'),
      output: z.string().min(1, 'Output is required')
    })
  ).min(1, 'At least one hidden test case required'),
  startCode: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      initialCode: z.string().min(1, 'Initial code is required')
    })
  ).length(3, 'All three languages required'),
  referenceSolution: z.array(
    z.object({
      language: z.enum(['C++', 'Java', 'JavaScript']),
      completeCode: z.string().min(1, 'Complete code is required')
    })
  ).length(3, 'All three languages required')
});

// Toast Notification
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded shadow-lg flex items-center gap-2 z-50`}>
      <Icon className="w-5 h-5" />
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Collapsible Section
function CollapsibleSection({ title, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-gray-800 rounded border border-gray-700">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-800 hover:bg-gray-750 transition-colors"
      >
        <h2 className="text-lg font-semibold text-gray-100">{title}</h2>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
      </button>
      {isOpen && <div className="p-4 border-t border-gray-700">{children}</div>}
    </div>
  );
}

// Code Editor
function CodeEditor({ value, onChange, language, placeholder }) {
  return (
    <div className="relative">
      <div className="absolute top-2 right-2 bg-gray-900 text-gray-400 px-2 py-1 rounded text-xs font-mono z-10">
        {language}
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-950 text-gray-200 font-mono text-sm p-3 rounded border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none min-h-[200px] resize-y"
        spellCheck="false"
      />
    </div>
  );
}

function AdminPanel() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty }
  } = useForm({
    resolver: zodResolver(problemSchema),
    defaultValues: {
      title: '',
      description: '',
      difficulty: 'easy',
      tags: 'array',
      visibleTestCases: [{ input: '', output: '', explanation: '' }],
      hiddenTestCases: [{ input: '', output: '' }],
      startCode: [
        { language: 'C++', initialCode: '' },
        { language: 'Java', initialCode: '' },
        { language: 'JavaScript', initialCode: '' }
      ],
      referenceSolution: [
        { language: 'C++', completeCode: '' },
        { language: 'Java', completeCode: '' },
        { language: 'JavaScript', completeCode: '' }
      ]
    }
  });

  const formData = watch();

  const {
    fields: visibleFields,
    append: appendVisible,
    remove: removeVisible
  } = useFieldArray({ control, name: 'visibleTestCases' });

  const {
    fields: hiddenFields,
    append: appendHidden,
    remove: removeHidden
  } = useFieldArray({ control, name: 'hiddenTestCases' });

  useEffect(() => {
    setHasUnsavedChanges(isDirty);
  }, [isDirty]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setToast({ message: 'Problem created successfully', type: 'success' });
      setHasUnsavedChanges(false);
      console.log('Problem data:', data);
    } catch (error) {
      setToast({ 
        message: error.response?.data?.message || 'Failed to create problem', 
        type: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-6 px-4">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-gray-800 rounded border border-gray-700 p-5 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-100 mb-1">Create New Problem</h1>
              <p className="text-gray-400 text-sm">Design a coding challenge for the platform</p>
            </div>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors text-sm"
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>
        </div>

        <div className="space-y-5">
          {/* Basic Information */}
          <CollapsibleSection title="Basic Information">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Problem Title
                </label>
                <input
                  {...register('title')}
                  className={`w-full px-3 py-2 bg-gray-950 border rounded text-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none ${
                    errors.title ? 'border-red-500' : 'border-gray-700'
                  }`}
                  placeholder="e.g., Two Sum"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Problem Description
                </label>
                <textarea
                  {...register('description')}
                  className={`w-full px-3 py-2 bg-gray-950 border rounded text-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none min-h-[120px] ${
                    errors.description ? 'border-red-500' : 'border-gray-700'
                  }`}
                  placeholder="Describe the problem in detail..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <select
                    {...register('difficulty')}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-700 rounded text-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    {...register('tags')}
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-700 rounded text-gray-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="array">Array</option>
                    <option value="linkedList">Linked List</option>
                    <option value="graph">Graph</option>
                    <option value="dp">Dynamic Programming</option>
                  </select>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Test Cases */}
          <CollapsibleSection title="Test Cases">
            {/* Visible Test Cases */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-semibold text-gray-200">Visible Test Cases</h3>
                <button
                  type="button"
                  onClick={() => appendVisible({ input: '', output: '', explanation: '' })}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Test Case
                </button>
              </div>

              <div className="space-y-3">
                {visibleFields.map((field, index) => (
                  <div key={field.id} className="bg-gray-850 border border-gray-700 rounded p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-300">Test Case {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeVisible(index)}
                        className="text-red-400 hover:text-red-300 p-1"
                        disabled={visibleFields.length === 1}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <input
                        {...register(`visibleTestCases.${index}.input`)}
                        placeholder="Input (e.g., [2,7,11,15], 9)"
                        className="w-full px-3 py-2 bg-gray-950 border border-gray-700 rounded text-gray-200 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      />
                      <input
                        {...register(`visibleTestCases.${index}.output`)}
                        placeholder="Expected Output (e.g., [0,1])"
                        className="w-full px-3 py-2 bg-gray-950 border border-gray-700 rounded text-gray-200 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      />
                      <textarea
                        {...register(`visibleTestCases.${index}.explanation`)}
                        placeholder="Explanation for this test case..."
                        className="w-full px-3 py-2 bg-gray-950 border border-gray-700 rounded text-gray-200 text-sm min-h-[60px] focus:ring-1 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    
                    {errors.visibleTestCases?.[index] && (
                      <p className="mt-2 text-sm text-red-400">Please fill all fields</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Hidden Test Cases */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-semibold text-gray-200">Hidden Test Cases</h3>
                <button
                  type="button"
                  onClick={() => appendHidden({ input: '', output: '' })}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Hidden Case
                </button>
              </div>

              <div className="space-y-3">
                {hiddenFields.map((field, index) => (
                  <div key={field.id} className="bg-gray-850 border border-purple-900 rounded p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-300">Hidden Case {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeHidden(index)}
                        className="text-red-400 hover:text-red-300 p-1"
                        disabled={hiddenFields.length === 1}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <input
                        {...register(`hiddenTestCases.${index}.input`)}
                        placeholder="Input"
                        className="w-full px-3 py-2 bg-gray-950 border border-gray-700 rounded text-gray-200 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                      />
                      <input
                        {...register(`hiddenTestCases.${index}.output`)}
                        placeholder="Expected Output"
                        className="w-full px-3 py-2 bg-gray-950 border border-gray-700 rounded text-gray-200 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                    
                    {errors.hiddenTestCases?.[index] && (
                      <p className="mt-2 text-sm text-red-400">Please fill all fields</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleSection>

          {/* Code Templates */}
          <CollapsibleSection title="Code Templates and Solutions">
            <div className="space-y-6">
              {['C++', 'Java', 'JavaScript'].map((lang, index) => (
                <div key={lang} className="bg-gray-850 rounded p-4 border border-gray-700">
                  <h3 className="text-base font-semibold text-gray-200 mb-3">{lang}</h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Starter Code
                      </label>
                      <CodeEditor
                        value={formData.startCode?.[index]?.initialCode || ''}
                        onChange={(value) => setValue(`startCode.${index}.initialCode`, value, { shouldDirty: true })}
                        language={lang}
                        placeholder={`// ${lang} starter code here...`}
                      />
                      {errors.startCode?.[index]?.initialCode && (
                        <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.startCode[index].initialCode.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Reference Solution
                      </label>
                      <CodeEditor
                        value={formData.referenceSolution?.[index]?.completeCode || ''}
                        onChange={(value) => setValue(`referenceSolution.${index}.completeCode`, value, { shouldDirty: true })}
                        language={lang}
                        placeholder={`// ${lang} complete solution here...`}
                      />
                      {errors.referenceSolution?.[index]?.completeCode && (
                        <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.referenceSolution[index].completeCode.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CollapsibleSection>

          {/* Submit Button */}
          <div className="bg-gray-800 rounded border border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                {hasUnsavedChanges && (
                  <span className="text-sm text-yellow-500 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Unsaved changes
                  </span>
                )}
              </div>
              
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className={`px-6 py-2 rounded font-semibold text-white transition-colors ${
                  isSubmitting
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </span>
                ) : (
                  'Create Problem'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50" onClick={() => setShowPreview(false)}>
            <div className="bg-gray-800 rounded border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-5 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-100">Problem Preview</h2>
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className="text-gray-400 hover:text-gray-200 p-2 hover:bg-gray-700 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-5 space-y-5">
                <div>
                  <h1 className="text-2xl font-bold text-gray-100 mb-2">{formData.title || 'Untitled Problem'}</h1>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      formData.difficulty === 'easy' ? 'bg-green-900 text-green-200' :
                      formData.difficulty === 'medium' ? 'bg-yellow-900 text-yellow-200' :
                      'bg-red-900 text-red-200'
                    }`}>
                      {formData.difficulty?.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 rounded text-sm font-medium bg-gray-700 text-gray-200">
                      {formData.tags}
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-semibold text-gray-200 mb-2">Description</h3>
                  <p className="text-gray-300 whitespace-pre-wrap">{formData.description || 'No description provided'}</p>
                </div>

                {formData.visibleTestCases?.length > 0 && (
                  <div>
                    <h3 className="text-base font-semibold text-gray-200 mb-2">Example Test Cases</h3>
                    {formData.visibleTestCases.map((tc, i) => (
                      <div key={i} className="bg-gray-850 border border-gray-700 p-3 rounded mb-3">
                        <p className="font-medium text-gray-200">Example {i + 1}:</p>
                        <p className="text-sm mt-1 text-gray-300"><strong>Input:</strong> {tc.input}</p>
                        <p className="text-sm text-gray-300"><strong>Output:</strong> {tc.output}</p>
                        <p className="text-sm text-gray-400 mt-1">{tc.explanation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;