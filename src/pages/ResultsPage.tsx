import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Trophy, 
  TrendingUp, 
  Clock,
  BarChart3,
  Target,
  Award,
  Home
} from 'lucide-react';
import { assessmentAPI } from '../utils/api.ts';
import { Button } from '../components/Button.tsx';
import { Card } from '../components/Card.tsx';
import LoadingSpinner from '../components/LoadingSpinner.tsx';
import { AssessmentResult } from '../types/index.ts';
import { 
  formatDate, 
  formatDuration, 
  getRatingColor, 
  getRatingDescription, 
  getDomainDisplayName
} from '../utils/helpers.ts';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [results, setResults] = useState<AssessmentResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadResults();
    }
  }, [id]);

  const loadResults = async () => {
    if (!id) {
      toast.error('Assessment ID is required');
      navigate('/');
      return;
    }

    try {
      setIsLoading(true);
      const data = await assessmentAPI.getAssessmentResult(id);
      setResults(data);
    } catch (error) {
      toast.error('Failed to load assessment results');
      console.error('Error loading results:', error);
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleDownloadReport = () => {
    // TODO: Implement PDF download
    toast.info('Download feature coming soon!');
  };

  const handleShareResults = () => {
    // TODO: Implement sharing
    toast.info('Share feature coming soon!');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">No results found.</p>
          <Button onClick={handleBackToHome} className="mt-4">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const radarData = Object.entries(results.domain_scores).map(([domain, score]) => ({
    domain: getDomainDisplayName(domain),
    score,
    fullMark: 50
  }));

  const barData = Object.entries(results.domain_scores).map(([domain, score]) => ({
    domain: getDomainDisplayName(domain),
    score,
    rating: results.domain_ratings[domain as keyof typeof results.domain_ratings]
  }));

  const getRatingDescription = (rating: string) => {
    switch (rating.toLowerCase()) {
      case 'exemplary':
        return 'Outstanding performance with consistent excellence';
      case 'strength':
        return 'Strong performance with room for growth';
      case 'developing':
        return 'Moderate performance, needs development';
      case 'weakness':
        return 'Below average, requires attention';
      case 'critical':
        return 'Significant improvement needed';
      default:
        return 'Performance level not determined';
    }
  };

  const getRecommendations = (domain: string, rating: string) => {
    const recommendations: Record<string, Record<string, string[]>> = {
      leadership: {
        exemplary: ['Continue mentoring others', 'Share best practices with team'],
        strength: ['Take on more leadership opportunities', 'Develop strategic thinking'],
        developing: ['Practice decision-making skills', 'Seek leadership training'],
        weakness: ['Join leadership development programs', 'Practice team management'],
        critical: ['Focus on basic leadership skills', 'Seek mentorship']
      },
      accountability: {
        exemplary: ['Maintain high standards', 'Help others develop accountability'],
        strength: ['Set more challenging goals', 'Improve documentation practices'],
        developing: ['Create clear action plans', 'Follow up on commitments'],
        weakness: ['Set smaller, achievable goals', 'Track progress regularly'],
        critical: ['Start with daily task completion', 'Build trust through consistency']
      },
      communication: {
        exemplary: ['Mentor others in communication', 'Lead communication initiatives'],
        strength: ['Practice active listening', 'Improve presentation skills'],
        developing: ['Take communication courses', 'Practice public speaking'],
        weakness: ['Focus on clarity and brevity', 'Seek feedback on communication'],
        critical: ['Start with basic communication skills', 'Practice daily conversations']
      },
      innovation: {
        exemplary: ['Lead innovation initiatives', 'Mentor creative thinking'],
        strength: ['Explore new technologies', 'Challenge existing processes'],
        developing: ['Attend innovation workshops', 'Practice creative problem-solving'],
        weakness: ['Start with small improvements', 'Learn from others\' innovations'],
        critical: ['Focus on learning new skills', 'Embrace change gradually']
      },
      sales: {
        exemplary: ['Train others in sales techniques', 'Develop sales strategies'],
        strength: ['Improve closing techniques', 'Build stronger relationships'],
        developing: ['Learn sales methodologies', 'Practice objection handling'],
        weakness: ['Focus on customer needs', 'Improve follow-up skills'],
        critical: ['Start with basic sales training', 'Build confidence gradually']
      },
      ethics: {
        exemplary: ['Lead by example', 'Mentor others in ethical behavior'],
        strength: ['Strengthen ethical decision-making', 'Promote transparency'],
        developing: ['Study ethical frameworks', 'Practice ethical decision-making'],
        weakness: ['Focus on integrity', 'Seek ethical guidance'],
        critical: ['Start with basic ethical principles', 'Build trust through actions']
      },
      collaboration: {
        exemplary: ['Lead collaborative initiatives', 'Mentor team collaboration'],
        strength: ['Improve conflict resolution', 'Enhance team dynamics'],
        developing: ['Practice active participation', 'Improve teamwork skills'],
        weakness: ['Focus on team goals', 'Improve communication in teams'],
        critical: ['Start with basic teamwork', 'Build relationships gradually']
      }
    };

    return recommendations[domain]?.[rating.toLowerCase()] || [
      'Focus on continuous improvement',
      'Seek feedback from colleagues',
      'Practice skills regularly'
    ];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToHome}
                className="text-gray-500 hover:text-gray-700"
              >
                <Home size={16} className="mr-1" />
                Back to Home
              </Button>
              <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Assessment Results
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadReport}
              >
                <Download size={16} className="mr-1" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShareResults}
              >
                <Share2 size={16} className="mr-1" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* User Information */}
          <Card className="mb-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Assessment Results for {results.user_data.full_name}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Email:</span> {results.user_data.email}
                </div>
                {results.user_data.phone && (
                  <div>
                    <span className="font-medium">Phone:</span> {results.user_data.phone}
                  </div>
                )}
                {results.user_data.company && (
                  <div>
                    <span className="font-medium">Company:</span> {results.user_data.company}
                  </div>
                )}
                {results.user_data.position && (
                  <div>
                    <span className="font-medium">Position:</span> {results.user_data.position}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Overall Score Card */}
          <Card className="mb-8 bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Trophy className="h-8 w-8 text-primary-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">Assessment Complete!</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <div className="text-4xl font-bold text-primary-600 mb-2">
                    {results.total_score}
                  </div>
                  <p className="text-sm text-gray-600">Total Score</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-secondary-600 mb-2">
                    {Math.round(results.total_score / 7)}
                  </div>
                  <p className="text-sm text-gray-600">Average Score</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-success-600 mb-2">
                    {formatDuration(results.total_time_minutes)}
                  </div>
                  <p className="text-sm text-gray-600">Time Taken</p>
                </div>
              </div>
              <div className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white border border-primary-200">
                <span className={`w-2 h-2 rounded-full mr-2 ${getRatingColor(results.overall_rating)}`}></span>
                Overall Rating: {results.overall_rating.charAt(0).toUpperCase() + results.overall_rating.slice(1)}
              </div>
            </div>
          </Card>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Radar Chart */}
            <Card title="Domain Performance Overview" subtitle="Your scores across all competency domains">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="domain" />
                    <PolarRadiusAxis angle={90} domain={[0, 50]} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Bar Chart */}
            <Card title="Domain Scores Comparison" subtitle="Detailed breakdown of your performance">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="domain" />
                    <YAxis domain={[0, 50]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#3B82F6">
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getRatingColor(entry.rating).replace('bg-', '')} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          {/* Domain Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Object.entries(results.domain_scores).map(([domain, score]) => {
              const rating = results.domain_ratings[domain as keyof typeof results.domain_ratings];
              const recommendations = getRecommendations(domain, rating);
              
              return (
                <Card key={domain} className="hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {getDomainDisplayName(domain)}
                    </h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(rating)}`}>
                      {rating.charAt(0).toUpperCase() + rating.slice(1)}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-3xl font-bold text-primary-600 mb-1">{score}</div>
                    <div className="text-sm text-gray-600">out of 50</div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      {getRatingDescription(rating)}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-primary-500 mr-1">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Descriptive Questions Results */}
          {results.descriptive_scores && Object.keys(results.descriptive_scores).length > 0 && (
            <Card title="Descriptive Questions Analysis" subtitle="Your responses to open-ended questions" className="mb-8">
              <div className="space-y-6">
                {Object.entries(results.descriptive_scores).map(([questionId, score]) => {
                  const questionText = questionId === 'desc_1' 
                    ? 'Describe a situation where you had to collaborate with someone difficult. What did you do, and what was the outcome?'
                    : 'Share an example where your collaboration significantly impacted a project or team result.';
                  
                  const scoreDescription = score === 3 ? 'Excellent' : 
                                          score === 2 ? 'Good' : 
                                          score === 1 ? 'Fair' : 'Poor';
                  
                  return (
                    <div key={questionId} className="border-l-4 border-primary-200 pl-4">
                      <h4 className="font-medium text-gray-900 mb-2">{questionText}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Score:</span>
                        <span className="text-lg font-semibold text-primary-600">{score}/3</span>
                        <span className="text-sm text-gray-500">({scoreDescription})</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Assessment Details */}
          <Card title="Assessment Details" subtitle="Information about your assessment session">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Timing Information</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Started:</span>
                    <span>{formatDate(results.started_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed:</span>
                    <span>{formatDate(results.completed_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Time:</span>
                    <span>{formatDuration(results.total_time_minutes)}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Performance Summary</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Total Questions:</span>
                    <span>72 (70 MCQ + 2 Descriptive)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>MCQ Score:</span>
                    <span>{results.total_score}/350</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Overall Rating:</span>
                    <span className="font-medium">{results.overall_rating.charAt(0).toUpperCase() + results.overall_rating.slice(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button onClick={handleBackToHome} variant="outline">
              <Home size={16} className="mr-2" />
              Take Another Assessment
            </Button>
            <Button onClick={handleDownloadReport}>
              <Download size={16} className="mr-2" />
              Download Report
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ResultsPage; 