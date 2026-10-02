import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { ShieldCheck, Mail, Lock, User, ArrowRight } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('VOTER');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      error('Password must contain at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        role,
      });
      success('Voter registration completed. Please authenticate.', 'Registration Successful');
      navigate('/login');
    } catch (err: any) {
      error(err.response?.data?.detail || 'Registration failed. Check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-soft via-gold to-gold-deep p-0.5 mx-auto mb-4 shadow-luxury">
            <div className="w-full h-full bg-obsidian rounded-[14px] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-gold-soft" />
            </div>
          </div>
          <h1 className="text-2xl font-bold font-serif text-platinum">
            Electoral Voter Registration
          </h1>
          <p className="text-xs text-platinum-muted mt-1">
            Enroll your sovereign credentials into the high-assurance voting registry
          </p>
        </div>

        <div className="glass-card rounded-3xl p-8 border border-graphite-border shadow-luxury">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                placeholder="Eleanor"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
              />
              <Input
                label="Last Name"
                placeholder="Vance"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <Input
              label="Official Email"
              type="email"
              placeholder="eleanor@domain.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password (min 8 characters)"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <Select
              label="Electoral Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={[
                { value: 'VOTER', label: 'Voter (Participate in Ballots)' },
                { value: 'ELECTION_MANAGER', label: 'Election Manager (Oversee Ballots)' },
                { value: 'ADMIN', label: 'Platform Administrator (Full Authority)' },
              ]}
            />

            <Button
              type="submit"
              variant="primary"
              isLoading={loading}
              className="w-full mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Enroll & Submit
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-platinum-muted mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-gold-soft hover:text-gold font-medium">
            Sign in to existing account
          </Link>
        </p>
      </div>
    </div>
  );
};
