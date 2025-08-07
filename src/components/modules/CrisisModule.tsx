import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Phone, Heart, TrendingUp, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { BurnoutMetric, EmergencyContact, CrisisSettings } from '../../types/database';
import { TranslatedText } from '../common/TranslatedText';

export function CrisisModule() {
  const [burnoutMetrics, setBurnoutMetrics] = useState<BurnoutMetric[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [crisisSettings, setCrisisSettings] = useState<CrisisSettings | null>(null);
  const [loading, setLoading] = useState(true);
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
          .limit(7),
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

  const logWellnessCheck = async (metrics: Partial<BurnoutMetric>) => {
    try {
      const burnoutRiskScore = calculateBurnoutRisk(metrics);
      
      const { error } = await supabase
        .from('burnout_metrics')
        .insert({
          user_id: user?.id,
          stress_level: metrics.stress_level || 5,
          energy_level: metrics.energy_level || 5,
          work_satisfaction: metrics.work_satisfaction || 5,
          sleep_quality: metrics.sleep_quality || 5,
          social_connection: metrics.social_connection || 5,
          burnout_risk_score: burnoutRiskScore,
          logged_at: new Date().toISOString(),
        });

      if (error) throw error;
      fetchCrisisData();
    } catch (error) {
      console.error('Error logging wellness check:', error);
    }
  };

  const calculateBurnoutRisk = (metrics: Partial<BurnoutMetric>) => {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Professional Risk Level Indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className={`text-center p-4 rounded-2xl shadow-soft border ${
          riskLevel.color === 'red' ? 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-red-100 dark:border-red-800/30' :
          riskLevel.color === 'yellow' ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-100 dark:border-yellow-800/30' :
          riskLevel.color === 'green' ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-100 dark:border-green-800/30' :
          'bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-700 dark:to-slate-700 border-gray-100 dark:border-gray-600'
        }`}
      >
        <div className="flex items-center justify-center mb-2">
          <Shield className={`h-8 w-8 ${
            riskLevel.color === 'red' ? 'text-red-500' :
            riskLevel.color === 'yellow' ? 'text-yellow-500' :
            riskLevel.color === 'green' ? 'text-green-500' :
            'text-gray-500'
          }`} />
          {trend === 'worsening' && <TrendingUp className="h-4 w-4 text-red-500 ml-1" />}
          {trend === 'improving' && <TrendingUp className="h-4 w-4 text-green-500 ml-1 transform rotate-180" />}
        </div>
        
        <p className={`text-xl font-bold ${
          riskLevel.color === 'red' ? 'text-red-600 dark:text-red-400' :
          riskLevel.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
          riskLevel.color === 'green' ? 'text-green-600 dark:text-green-400' :
          'text-gray-600 dark:text-gray-400'
        }`}>
          <TranslatedText text={
            riskLevel.level === 'unknown' ? 'No Data' : 
            riskLevel.level === 'high' ? 'High Risk' :
            riskLevel.level === 'medium' ? 'Medium Risk' :
            'Low Risk'
          } />
        </p>
        
        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
          <TranslatedText text="Burnout Risk" />: {Math.round(riskLevel.score)}%
        </p>
      </motion.div>

      {/* Professional Quick Wellness Check */}
      <div>
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
          <TranslatedText text="Quick Check-in" />
        </h4>
        
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            onClick={() => logWellnessCheck({ 
              stress_level: 3, 
              energy_level: 7, 
              work_satisfaction: 7, 
              sleep_quality: 7, 
              social_connection: 7 
            })}
            className="flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 text-green-600 dark:text-green-400 rounded-2xl hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30 transition-all duration-300 shadow-soft border border-green-100 dark:border-green-800/30"
          >
            <span className="text-lg">😊</span>
            <span className="font-semibold text-sm">
              <TranslatedText text="Good" />
            </span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={() => logWellnessCheck({ 
              stress_level: 7, 
              energy_level: 3, 
              work_satisfaction: 4, 
              sleep_quality: 4, 
              social_connection: 4 
            })}
            className="flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 text-red-600 dark:text-red-400 rounded-2xl hover:from-red-100 hover:to-pink-100 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 transition-all duration-300 shadow-soft border border-red-100 dark:border-red-800/30"
          >
            <span className="text-lg">😰</span>
            <span className="font-semibold text-sm">
              <TranslatedText text="Stressed" />
            </span>
          </motion.button>
        </div>
      </div>

      {/* Professional Emergency Contacts */}
      {emergencyContacts.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
            <TranslatedText text="Emergency Contacts" />
          </h4>
          
          <div className="space-y-2">
            {emergencyContacts.slice(0, 2).map((contact, index) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-soft border border-blue-100 dark:border-blue-800/30"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-300 truncate">
                    {contact.name}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {contact.relationship}
                  </p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition-all"
                >
                  <Phone className="h-3 w-3" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Professional Crisis Resources */}
      <div>
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
          <TranslatedText text="Crisis Resources" />
        </h4>
        
        <div className="space-y-2">
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full flex items-center space-x-2 p-3 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 text-red-600 dark:text-red-400 rounded-2xl hover:from-red-100 hover:to-pink-100 dark:hover:from-red-900/30 dark:hover:to-pink-900/30 transition-all duration-300 shadow-soft border border-red-100 dark:border-red-800/30"
          >
            <Phone className="h-4 w-4" />
            <span className="font-semibold text-sm">
              <TranslatedText text="Crisis Hotline: 988" />
            </span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="w-full flex items-center space-x-2 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 text-purple-600 dark:text-purple-400 rounded-2xl hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/30 dark:hover:to-indigo-900/30 transition-all duration-300 shadow-soft border border-purple-100 dark:border-purple-800/30"
          >
            <Heart className="h-4 w-4" />
            <span className="font-semibold text-sm">
              <TranslatedText text="Breathing Exercise" />
            </span>
          </motion.button>
        </div>
      </div>

      {/* Professional Settings */}
      <motion.button
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all duration-300 group mt-auto"
      >
        <Settings className="h-4 w-4 text-gray-500 group-hover:text-orange-500 transition-colors" />
        <span className="font-semibold text-sm text-gray-600 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          <TranslatedText text="Crisis Settings" />
        </span>
      </motion.button>
    </div>
  );
}