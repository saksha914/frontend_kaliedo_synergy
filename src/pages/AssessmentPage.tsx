import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  ArrowRight, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Home
} from 'lucide-react';
import { assessmentAPI } from '../utils/api.ts';
import { Button } from '../components/Button.tsx';
import { Card } from '../components/Card.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import { Question, AssessmentResponse, UserData } from '../types/index.ts';

const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<AssessmentResponse[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showUserDataForm, setShowUserDataForm] = useState(true);

  useEffect(() => {
    // Check localStorage for userData
    const storedUserData = localStorage.getItem('assessment_user_data');
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData));
      setShowUserDataForm(false);
    }
    loadQuestions();
  }, []);

  useEffect(() => {
    if (questions.length > 0 && userData && !startTime) {
      setStartTime(new Date());
    }
  }, [questions, userData, startTime]);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      const data = await assessmentAPI.getQuestions();
      setQuestions(data.questions);
      
      // Initialize responses array
      const initialResponses: AssessmentResponse[] = data.questions.map(q => ({
        question_id: q.id,
        response: 0,
        domain: '', // Will be filled by backend
        question_type: q.type
      }));
      setResponses(initialResponses);
    } catch (error) {
      toast.error('Failed to load assessment questions');
      console.error('Error loading questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserDataSubmit = (data: UserData) => {
    setUserData(data);
    setShowUserDataForm(false);
    localStorage.setItem('assessment_user_data', JSON.stringify(data));
  };

  const handleChangeUserData = () => {
    setShowUserDataForm(true);
    setUserData(null);
    localStorage.removeItem('assessment_user_data');
  };

  const handleResponseChange = (response: number) => {
    const updatedResponses = [...responses];
    updatedResponses[currentQuestionIndex] = {
      ...updatedResponses[currentQuestionIndex],
      response
    };
    setResponses(updatedResponses);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitAssessment = async () => {
    if (!userData) {
      toast.error('User data is required');
      return;
    }

    // Check if all questions are answered
    const unansweredQuestions = responses.filter(r => r.response === 0);
    if (unansweredQuestions.length > 0) {
      toast.error(`Please answer all questions. ${unansweredQuestions.length} questions remaining.`);
      return;
    }

    if (!startTime) {
      toast.error('Assessment start time not recorded');
      return;
    }

    setIsSubmitting(true);
    try {
      const completedAt = new Date();
      const result = await assessmentAPI.submitAssessment({
        user_data: userData,
        responses,
        started_at: startTime.toISOString(),
        completed_at: completedAt.toISOString()
      });
      toast.success('Assessment submitted successfully!');
      navigate(`/results/${result.id}`);
    } catch (error) {
      toast.error('Failed to submit assessment. Please try again.');
      console.error('Error submitting assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExitAssessment = () => {
    setShowConfirmExit(true);
  };

  const confirmExit = () => {
    navigate('/');
  };

  const cancelExit = () => {
    setShowConfirmExit(false);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const answeredQuestions = responses.filter(r => r.response !== 0).length;
  const progress = (answeredQuestions / questions.length) * 100;

  // User Data Form Component
  const UserDataForm: React.FC<{ onSubmit: (data: UserData) => void }> = ({ onSubmit }) => {
    const [formData, setFormData] = useState<UserData>({
      full_name: '',
      email: '',
      phone: '',
      company: '',
      position: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.full_name || !formData.email) {
        toast.error('Name and email are required');
        return;
      }
      onSubmit(formData);
    };

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Welcome to Kaleido Synergy Assessment
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please provide your information to begin the assessment
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                  Full Name *
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone Number (Optional)
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                  Company (Optional)
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={formData.company}
                  onChange={(e) => setFormData({...formData, company: e.target.value})}
                />
              </div>
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                  Position (Optional)
                </label>
                <input
                  id="position"
                  name="position"
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
            >
              Start Assessment
            </Button>
          </form>
        </Card>
      </div>
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (showUserDataForm) {
    return <UserDataForm onSubmit={handleUserDataSubmit} />;
  }

  if (showConfirmExit) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="max-w-md w-full mx-4">
        <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Exit Assessment?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Your progress will be lost. Are you sure you want to exit?
            </p>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={cancelExit}
                className="flex-1"
              >
                Continue Assessment
              </Button>
              <Button
                variant="destructive"
                onClick={confirmExit}
                className="flex-1"
              >
                Exit
              </Button>
            </div>
        </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExitAssessment}
                className="text-gray-500 hover:text-gray-700"
              >
                <Home className="h-4 w-4 mr-2" />
                Exit
              </Button>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">
                  {startTime ? Math.floor((Date.now() - startTime.getTime()) / 1000 / 60) : 0} min
                </span>
              </div>
              {/* Change Info Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleChangeUserData}
                className="ml-2"
              >
                Change Info
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-primary-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              {answeredQuestions} of {questions.length} questions answered
            </span>
            <span className="text-xs text-gray-500">
              {currentQuestion?.type === 'descriptive' ? 'Descriptive Question' : 'Multiple Choice'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="mb-8">
              <div className="space-y-6">
                {/* Question */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                      Question {currentQuestionIndex + 1}
                    </span>
                    <span className="text-sm text-gray-500">
                      {currentQuestion?.type === 'descriptive' ? 'Descriptive' : 'Multiple Choice'}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
                    {currentQuestion?.question_text}
                  </h2>
                </div>

                {/* Response Options */}
                {currentQuestion?.type === 'mcq' ? (
                <div className="space-y-3">
                  {[
                    { value: 5, label: 'Strongly Agree', description: 'I completely agree with this statement' },
                    { value: 4, label: 'Agree to Some Extent', description: 'I mostly agree with this statement' },
                    { value: 3, label: 'Neutral / Maybe', description: 'I neither agree nor disagree' },
                    { value: 2, label: 'Disagree to Some Extent', description: 'I mostly disagree with this statement' },
                    { value: 1, label: 'Strongly Disagree', description: 'I completely disagree with this statement' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                        responses[currentQuestionIndex]?.response === option.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`question-${currentQuestionIndex}`}
                        value={option.value}
                        checked={responses[currentQuestionIndex]?.response === option.value}
                        onChange={() => handleResponseChange(option.value)}
                        className="mt-1 mr-3 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-4">
                      Please rate your response based on the following criteria:
                    </p>
                    {[
                      { value: 3, label: 'Excellent', description: 'Demonstrates initiative, empathy, team focus, problem-solving, and clarity' },
                      { value: 2, label: 'Good', description: 'Shows effort and some collaboration, but lacks depth or specific outcomes' },
                      { value: 1, label: 'Fair', description: 'Minimal action, conflict-avoidant, vague effort' },
                      { value: 0, label: 'Poor', description: 'Evades the question or gives a generic, smart-sounding but empty response' },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                          responses[currentQuestionIndex]?.response === option.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`question-${currentQuestionIndex}`}
                          value={option.value}
                          checked={responses[currentQuestionIndex]?.response === option.value}
                          onChange={() => handleResponseChange(option.value)}
                          className="mt-1 mr-3 text-primary-600 focus:ring-primary-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.description}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Navigation */}
            <div className="flex flex-col gap-4">
              {/* Question Navigation - horizontally scrollable */}
              <div className="w-full overflow-x-auto pb-2">
                <div className="flex flex-nowrap gap-2 min-w-max">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToQuestion(index)}
                      className={`w-8 h-8 rounded-full text-xs font-medium transition-colors flex-shrink-0 ${
                        responses[index]?.response !== 0
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 text-gray-600 border border-gray-300'
                      } ${
                        index === currentQuestionIndex
                          ? 'ring-2 ring-primary-500'
                          : ''
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
              {/* Prev/Next Buttons */}
              <div className="flex justify-between items-center mt-2">
              <Button
                variant="outline"
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
                  className="flex items-center"
              >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
                {currentQuestionIndex === questions.length - 1 ? (
                  <Button
                    onClick={handleSubmitAssessment}
                    disabled={isSubmitting || answeredQuestions < questions.length}
                    className="flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <LoadingSpinner className="h-4 w-4 mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                    Submit Assessment
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={goToNextQuestion}
                    className="flex items-center"
                  >
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AssessmentPage; 