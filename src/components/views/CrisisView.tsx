import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Plus, AlertTriangle, Phone, Heart, TrendingUp, Settings, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { BurnoutMetric, EmergencyContact, CrisisSettings } from '../../types/database';

export function CrisisView() {
  const [burnoutMetrics, setBurnoutMetrics] = useState<BurnoutMetric[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [crisisSettings, setCrisisSettings] = useState<CrisisSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newMetric, setNewMetric] = useState({
    stress_level: 5,
    energy_level: 5,
    work_satisfaction: 5,
    sleep_quality: 5,
    social_connection: 5,
    notes: '',
  });
  const [newContact, setNewContact] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCrisisData();
    }
  }, [user]);

  const fetchCrisisData = async () => {
    try {
      const [metricsResult, contactsResult, settingsResult] = await Promise.all([
        supabase
          .from('burnout_metrics')
          .select('*')
          .eq('user_id', user?.id)
          .order('logged_at', { ascending: false })
          .limit(30),
        supabase
          .from('emergency_contacts')
          .select('*')
          .eq('user_id', user?.id)
          .eq('active', true)
          .order('priority_order', { ascending: true }),
        supabase
          .from('crisis_settings')
          .select('*')
          .eq('user_id', user?.id)
      ]);

      if (metricsResult.error && metricsResult.error.code !== 'PGRST116') {
        throw metricsResult.error;
      }
      if (contactsResult.error && contactsResult.error.code !== 'PGRST116') {
        throw contactsResult.error;
      }
      if (settingsResult.error && settingsResult.error.code !== 'PGRST116') {
        throw settingsResult.error;
      }

      setBurnoutMetrics(metricsResult.data || []);
      setEmergencyContacts(contactsResult.data || []);
      setCrisisSettings(settingsResult.data?.[0] || null);
    } catch (error) {
      console.error('Error fetching crisis data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addBurnoutMetric = async () => {
    try {
      const burnoutRiskScore = calculateBurnoutRisk(newMetric);
      
      const { error } = await supabase
        .from('burnout_metrics')
        .insert({
          user_id: user?.id,
          stress_level: newMetric.stress_level,
          energy_level: newMetric.energy_level,
          work_satisfaction: newMetric.work_satisfaction,
          sleep_quality: newMetric.sleep_quality,
          social_connection: newMetric.social_connection,
          burnout_risk_score: burnoutRiskScore,
          notes: newMetric.notes || null,
          logged_at: new Date().toISOString(),
        });

      if (error) throw error;
      
      setNewMetric({
        stress_level: 5,
        energy_level: 5,
        work_satisfaction: 5,
        sleep_quality: 5,
        social_connection: 5,
        notes: '',
      });
      setShowAddMetric(false);
      fetchCrisisData();
    } catch (error) {
      console.error('Error adding burnout metric:', error);
    }
  };

  const addEmergencyContact = async () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) return;

    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .insert({
          user_id: user?.id,
          name: newContact.name,
          relationship: newContact.relationship,
          phone: newContact.phone,
          email: newContact.email || null,
          priority_order: emergencyContacts.length + 1,
          active: true,
        });

      if (error) throw error;
      
      setNewContact({ name: '', relationship: '', phone: '', email: '' });
      setShowAddContact(false);
      fetchCrisisData();
    } catch (error) {
      console.error('Error adding emergency contact:', error);
    }
  };

  const calculateBurnoutRisk = (metrics: any) => {
    const stress = metrics.stress_level || 5;
    const energy = 11 - (metrics.energy_level || 5); // Invert energy (low energy = high risk)
    const satisfaction = 11 - (metrics.work_satisfaction || 5); // Invert satisfaction
    const sleep = 11 - (metrics.sleep_quality || 5); // Invert sleep quality
    const social = 11 - (metrics.social_connection || 5); // Invert social connection

    return ((stress + energy + satisfaction + sleep + social) / 50) * 100;
  };

  const getCurrentRiskLevel = () => {
    if (burnoutMetrics.length === 0) return { level: 'unknown', score: 0, color: 'gray' };
    
    const latestMetric = burnoutMetrics[0];
    const score = latestMetric.burnout_risk_score;
    
    if (score >= 70) return { level: 'high', score, color: 'red' };
    if (score >= 40) return { level: 'medium', score, color: 'yellow' };
    return { level: 'low', score, color: 'green' };
  };

  const getChartData = () => {
    return burnoutMetrics
      .slice(0, 14)
      .reverse()
      .map(metric => ({
        date: new Date(metric.logged_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        risk: Math.round(metric.burnout_risk_score),
        stress: metric.stress_level,
        energy: metric.energy_level,
      }));
  };

  const getWellnessTrend = () => {
    if (burnoutMetrics.length < 2) return 'stable';
    
    const recent = burnoutMetrics[0].burnout_risk_score;
    const previous = burnoutMetrics[1].burnout_risk_score;
    
    if (recent > previous + 10) return 'worsening';
    if (recent < previous - 10) return 'improving';
    return 'stable';
  };

  const riskLevel = getCurrentRiskLevel();
  const trend = getWellnessTrend();
  const chartData = getChartData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Crisis Prevention & Wellness</h1>
          <p className="text-gray-600 dark:text-gray-300">Monitor your mental health and prevent burnout</p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddMetric(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Log Wellness Check</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddContact(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Emergency Contact</span>
          </motion.button>
        </div>
      </div>

      {/* Current Risk Level */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`col-span-2 rounded-xl p-6 shadow-sm border ${
          riskLevel.color === 'red' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' :
          riskLevel.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700' :
          riskLevel.color === 'green' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' :
          'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className={`h-12 w-12 ${
                riskLevel.color === 'red' ? 'text-red-500' :
                riskLevel.color === 'yellow' ? 'text-yellow-500' :
                riskLevel.color === 'green' ? 'text-green-500' :
                'text-gray-500'
              }`} />
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {riskLevel.level === 'unknown' ? 'No Data' : 
                   riskLevel.level === 'high' ? 'High Risk' :
                   riskLevel.level === 'medium' ? 'Medium Risk' :
                   'Low Risk'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Burnout Risk: {Math.round(riskLevel.score)}%
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-2">
                {trend === 'improving' && <TrendingUp className="h-5 w-5 text-green-500 transform rotate-180" />}
                {trend === 'worsening' && <TrendingUp className="h-5 w-5 text-red-500" />}
                <span className={`text-sm font-medium ${
                  trend === 'improving' ? 'text-green-600' :
                  trend === 'worsening' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {trend === 'improving' ? 'Improving' :
                   trend === 'worsening' ? 'Worsening' :
                   'Stable'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{burnoutMetrics.length}</p>
              <p className="text-gray-600 dark:text-gray-400">Check-ins Logged</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Wellness Check Form */}
      {showAddMetric && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Wellness Check-in</h3>
          <div className="space-y-6">
            {[
              { key: 'stress_level', label: 'Stress Level', description: '1 = Very Low, 10 = Very High' },
              { key: 'energy_level', label: 'Energy Level', description: '1 = Very Low, 10 = Very High' },
              { key: 'work_satisfaction', label: 'Work Satisfaction', description: '1 = Very Low, 10 = Very High' },
              { key: 'sleep_quality', label: 'Sleep Quality', description: '1 = Very Poor, 10 = Excellent' },
              { key: 'social_connection', label: 'Social Connection', description: '1 = Very Isolated, 10 = Very Connected' },
            ].map((metric) => (
              <div key={metric.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {metric.label}
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{metric.description}</p>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={newMetric[metric.key as keyof typeof newMetric] as number}
                  onChange={(e) => setNewMetric(prev => ({ 
                    ...prev, 
                    [metric.key]: parseInt(e.target.value) 
                  }))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>1</span>
                  <span className="font-medium">
                    {newMetric[metric.key as keyof typeof newMetric]}
                  </span>
                  <span>10</span>
                </div>
              </div>
            ))}
            
            <textarea
              placeholder="Notes (optional)"
              value={newMetric.notes}
              onChange={(e) => setNewMetric(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
            />
          </div>
          
          <div className="flex space-x-3 mt-6">
            <button
              onClick={addBurnoutMetric}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              Log Check-in
            </button>
            <button
              onClick={() => setShowAddMetric(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Add Emergency Contact Form */}
      {showAddContact && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={newContact.name}
              onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <input
              type="text"
              placeholder="Relationship"
              value={newContact.relationship}
              onChange={(e) => setNewContact(prev => ({ ...prev, relationship: e.target.value }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={newContact.phone}
              onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <input
              type="email"
              placeholder="Email (optional)"
              value={newContact.email}
              onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex space-x-3 mt-4">
            <button
              onClick={addEmergencyContact}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Add Contact
            </button>
            <button
              onClick={() => setShowAddContact(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Burnout Risk Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Burnout Risk Trend</h3>
          {chartData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis domain={[0, 100]} className="text-xs" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="risk" 
                    stroke="#f97316" 
                    strokeWidth={2}
                    dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
              No wellness data yet. Start logging check-ins to see trends.
            </div>
          )}
        </div>

        {/* Emergency Contacts */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Emergency Contacts</h3>
          <div className="space-y-4">
            {emergencyContacts.map((contact, index) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{contact.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{contact.relationship}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{contact.phone}</p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                </motion.button>
              </motion.div>
            ))}
            
            {emergencyContacts.length === 0 && (
              <div className="text-center py-8">
                <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No emergency contacts
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Add emergency contacts for crisis situations
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Crisis Resources */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Crisis Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700"
          >
            <div className="flex items-center space-x-3">
              <Phone className="h-6 w-6 text-red-600" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Crisis Hotline</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">24/7 Support</p>
                <p className="text-lg font-bold text-red-600">988</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700"
          >
            <div className="flex items-center space-x-3">
              <Heart className="h-6 w-6 text-blue-600" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Breathing Exercise</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">4-7-8 Technique</p>
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Start Exercise
                </button>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700"
          >
            <div className="flex items-center space-x-3">
              <Settings className="h-6 w-6 text-purple-600" />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Crisis Settings</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Configure alerts</p>
                <button className="text-sm text-purple-600 hover:text-purple-800 font-medium">
                  Manage Settings
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Recent Check-ins */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Check-ins</h3>
        <div className="space-y-4">
          {burnoutMetrics.slice(0, 5).map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Wellness Check-in
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {new Date(metric.logged_at).toLocaleDateString()} at {new Date(metric.logged_at).toLocaleTimeString()}
                </p>
                {metric.notes && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {metric.notes}
                  </p>
                )}
              </div>
              
              <div className="text-right">
                <p className={`text-lg font-bold ${
                  metric.burnout_risk_score >= 70 ? 'text-red-600' :
                  metric.burnout_risk_score >= 40 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {Math.round(metric.burnout_risk_score)}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Risk Score</p>
              </div>
            </motion.div>
          ))}
          
          {burnoutMetrics.length === 0 && (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No wellness data yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Start logging wellness check-ins to monitor your mental health
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}