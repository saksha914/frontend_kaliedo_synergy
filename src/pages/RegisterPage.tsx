import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext.tsx';
import { Button } from '../components/Button.tsx';
import { Input } from '../components/Input.tsx';
import { Card } from '../components/Card.tsx';
import { isValidUsername, validatePassword } from '../utils/helpers.ts';
import { User, Lock, Eye, EyeOff, UserCheck, Building, Briefcase } from 'lucide-react';

interface RegisterFormData {
  username: string;
  full_name: string;
  password: string;
  confirm_password: string;
  company?: string;
  position?: string;
}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<RegisterFormData>({
    mode: 'onBlur'
  });

  const password = watch('password');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Validate username format
      if (!isValidUsername(data.username)) {
        setError('username', { message: 'Please enter a valid username (3-20 characters, alphanumeric and underscores only)' });
        return;
      }

      // Validate password strength
      const passwordValidation = validatePassword(data.password);
      if (!passwordValidation.isValid) {
        setError('password', { message: passwordValidation.errors.join(', ') });
        return;
      }

      // Check if passwords match
      if (data.password !== data.confirm_password) {
        setError('confirm_password', { message: 'Passwords do not match' });
        return;
      }

      setIsSubmitting(true);
      await registerUser({
        username: data.username,
        full_name: data.full_name,
        password: data.password,
        company: data.company,
        position: data.position,
      });
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create Account
            </h1>
            <p className="text-gray-600">
              Join Kaleido Synergy Assessment Centre
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Username"
              type="text"
              placeholder="Choose a username"
              icon={<User className="w-5 h-5" />}
              error={errors.username?.message}
              {...register('username', {
                required: 'Username is required',
                validate: (value) => {
                  if (!isValidUsername(value)) {
                    return 'Please enter a valid username (3-20 characters, alphanumeric and underscores only)';
                  }
                  return true;
                }
              })}
            />

            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              icon={<UserCheck className="w-5 h-5" />}
              error={errors.full_name?.message}
              {...register('full_name', {
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Full name must be at least 2 characters'
                }
              })}
            />

            <Input
              label="Company (Optional)"
              type="text"
              placeholder="Enter your company name"
              icon={<Building className="w-5 h-5" />}
              error={errors.company?.message}
              {...register('company')}
            />

            <Input
              label="Position (Optional)"
              type="text"
              placeholder="Enter your position"
              icon={<Briefcase className="w-5 h-5" />}
              error={errors.position?.message}
              {...register('position')}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                icon={<Lock className="w-5 h-5" />}
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="relative">
              <Input
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                icon={<Lock className="w-5 h-5" />}
                error={errors.confirm_password?.message}
                {...register('confirm_password', {
                  required: 'Please confirm your password',
                  validate: (value) => {
                    if (value !== password) {
                      return 'Passwords do not match';
                    }
                    return true;
                  }
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting || loading}
              disabled={isSubmitting || loading}
              className="w-full"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage; 