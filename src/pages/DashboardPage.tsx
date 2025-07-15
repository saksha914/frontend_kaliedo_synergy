import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  User, 
  Calendar, 
  Building, 
  Briefcase, 
  CheckCircle, 
  Clock, 
  BarChart3, 
  LogOut,
  Play,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { Button } from '../components/Button.tsx';
import { Card } from '../components/Card.tsx';
import { formatDate, getInitials } from '../utils/helpers.ts';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartAssessment = () => {
    navigate('/assessment');
  };

  const handleViewResults = () => {
    navigate('/results');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading user information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Kaleido Synergy Assessment Centre
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-medium text-sm">
                    {getInitials(user.full_name)}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {user.full_name}
                </span>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                loading={isLoading}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut size={16} className="mr-1" />
                Logout
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
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user.full_name.split(' ')[0]}!
            </h2>
            <p className="text-gray-600">
              Ready to assess your professional competencies across seven key domains.
            </p>
          </div>

          {/* User Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-primary-600 rounded-lg flex items-center justify-center mr-4">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-primary-600">Full Name</p>
                  <p className="text-lg font-semibold text-gray-900">{user.full_name}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-secondary-50 to-secondary-100 border-secondary-200">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-secondary-600 rounded-lg flex items-center justify-center mr-4">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary-600">Member Since</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(user.created_at).split(',')[0]}
                  </p>
                </div>
              </div>
            </Card>

            {user.company && (
              <Card className="bg-gradient-to-br from-success-50 to-success-100 border-success-200">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-success-600 rounded-lg flex items-center justify-center mr-4">
                    <Building className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-success-600">Company</p>
                    <p className="text-lg font-semibold text-gray-900">{user.company}</p>
                  </div>
                </div>
              </Card>
            )}

            {user.position && (
              <Card className="bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-warning-600 rounded-lg flex items-center justify-center mr-4">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-warning-600">Position</p>
                    <p className="text-lg font-semibold text-gray-900">{user.position}</p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Assessment Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Assessment Card */}
            <Card
              title="Assessment Status"
              subtitle="Complete the competency assessment to get your personalized report"
              className="h-fit"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    {user.assessment_completed ? (
                      <CheckCircle className="h-6 w-6 text-success-600 mr-3" />
                    ) : (
                      <Clock className="h-6 w-6 text-warning-600 mr-3" />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.assessment_completed ? 'Assessment Completed' : 'Assessment Pending'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user.assessment_completed 
                          ? 'You have completed the assessment'
                          : 'Take the assessment to evaluate your competencies'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {user.assessment_completed && user.assessment_completed_at && (
                  <div className="text-sm text-gray-600">
                    <p>Completed on: {formatDate(user.assessment_completed_at)}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  {!user.assessment_completed ? (
                    <Button
                      onClick={handleStartAssessment}
                      className="flex-1"
                    >
                      <Play size={16} className="mr-2" />
                      Start Assessment
                    </Button>
                  ) : (
                    <Button
                      onClick={handleViewResults}
                      className="flex-1"
                    >
                      <FileText size={16} className="mr-2" />
                      View Results
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Assessment Overview */}
            <Card
              title="Assessment Overview"
              subtitle="What you'll be evaluated on"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  {[
                    { domain: 'Leadership', icon: '👑', description: 'Ability to guide and influence others' },
                    { domain: 'Accountability', icon: '✅', description: 'Taking responsibility for outcomes' },
                    { domain: 'Communication', icon: '💬', description: 'Effectively conveying information' },
                    { domain: 'Innovation', icon: '💡', description: 'Creating new ideas and improvements' },
                    { domain: 'Sales', icon: '💰', description: 'Understanding customer needs' },
                    { domain: 'Ethics', icon: '⚖️', description: 'Maintaining integrity and standards' },
                    { domain: 'Collaboration', icon: '🤝', description: 'Working effectively in teams' },
                  ].map((item, index) => (
                    <motion.div
                      key={item.domain}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-2xl mr-3">{item.icon}</span>
                      <div>
                        <p className="font-medium text-gray-900">{item.domain}</p>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="mt-8">
            <Card title="Assessment Details">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">70</div>
                  <p className="text-sm text-gray-600">Total Questions</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary-600 mb-2">7</div>
                  <p className="text-sm text-gray-600">Competency Domains</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-success-600 mb-2">15-20</div>
                  <p className="text-sm text-gray-600">Minutes Duration</p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardPage; 