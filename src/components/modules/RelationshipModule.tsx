import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Calendar, Phone, Gift, MessageCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Contact, Interaction } from '../../types/database';
import { TranslatedText } from '../common/TranslatedText';

export function RelationshipModule() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchRelationshipData();
    }
  }, [user]);

  const fetchRelationshipData = async () => {
    try {
      const [contactsResult, interactionsResult] = await Promise.all([
        supabase
          .from('contacts')
          .select('*')
          .eq('user_id', user?.id)
          .order('last_contact_date', { ascending: true, nullsFirst: false })
          .limit(10),
        supabase
          .from('interactions')
          .select('*, contacts(name)')
          .eq('user_id', user?.id)
          .order('date', { ascending: false })
          .limit(5)
      ]);

      if (contactsResult.error) throw contactsResult.error;
      if (interactionsResult.error) throw interactionsResult.error;

      setContacts(contactsResult.data || []);
      setInteractions(interactionsResult.data || []);
    } catch (error) {
      console.error('Error fetching relationship data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addQuickInteraction = async (contactId: string, type: string, description: string) => {
    try {
      const { error } = await supabase
        .from('interactions')
        .insert({
          user_id: user?.id,
          contact_id: contactId,
          interaction_type: type,
          description,
          date: new Date().toISOString().split('T')[0],
        });

      if (error) throw error;

      // Update last contact date
      await supabase
        .from('contacts')
        .update({ last_contact_date: new Date().toISOString().split('T')[0] })
        .eq('id', contactId);

      fetchRelationshipData();
    } catch (error) {
      console.error('Error adding interaction:', error);
    }
  };

  const getRelationshipStats = () => {
    const today = new Date();
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentInteractions = interactions.filter(interaction => 
      new Date(interaction.date) >= thisWeek
    );

    const overdueContacts = contacts.filter(contact => {
      if (!contact.last_contact_date) return true;
      const lastContact = new Date(contact.last_contact_date);
      const daysSinceContact = (today.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceContact > contact.contact_frequency_days;
    });

    const upcomingBirthdays = contacts.filter(contact => {
      if (!contact.birthday) return false;
      const birthday = new Date(contact.birthday);
      const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
      const daysToBirthday = (thisYearBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return daysToBirthday >= 0 && daysToBirthday <= 30;
    });

    return {
      totalContacts: contacts.length,
      recentInteractions: recentInteractions.length,
      overdueContacts: overdueContacts.length,
      upcomingBirthdays: upcomingBirthdays.length,
    };
  };

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'call': return '📞';
      case 'text': return '💬';
      case 'email': return '📧';
      case 'meeting': return '🤝';
      case 'gift': return '🎁';
      default: return '💭';
    }
  };

  const stats = getRelationshipStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Professional Stats Overview */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-2xl shadow-soft border border-purple-100 dark:border-purple-800/30"
        >
          <Users className="h-6 w-6 text-purple-500 mx-auto mb-2" />
          <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
            {stats.totalContacts}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            <TranslatedText text="Contacts" />
          </p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-soft border border-blue-100 dark:border-blue-800/30"
        >
          <MessageCircle className="h-6 w-6 text-blue-500 mx-auto mb-2" />
          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {stats.recentInteractions}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            <TranslatedText text="This Week" />
          </p>
        </motion.div>
      </div>

      {/* Professional Overdue Contacts */}
      {stats.overdueContacts > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">
              <TranslatedText text="Need Attention" />
            </h4>
            <span className="text-xs bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-full font-bold">
              {stats.overdueContacts}
            </span>
          </div>
          
          <div className="space-y-2 max-h-20 overflow-y-auto">
            {contacts.filter(contact => {
              if (!contact.last_contact_date) return true;
              const lastContact = new Date(contact.last_contact_date);
              const daysSinceContact = (new Date().getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24);
              return daysSinceContact > contact.contact_frequency_days;
            }).slice(0, 3).map((contact, index) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl shadow-soft border border-red-100 dark:border-red-800/30"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-red-700 dark:text-red-300 truncate">
                    {contact.name}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {contact.relationship_type}
                  </p>
                </div>
                
                <div className="flex items-center space-x-1">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => addQuickInteraction(contact.id, 'call', 'Quick check-in call')}
                    className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-all"
                  >
                    <Phone className="h-3 w-3" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => addQuickInteraction(contact.id, 'text', 'Quick text message')}
                    className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-all"
                  >
                    <MessageCircle className="h-3 w-3" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Professional Recent Interactions */}
      <div className="flex-1">
        <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
          <TranslatedText text="Recent Activity" />
        </h4>
        
        <div className="space-y-2 max-h-24 overflow-y-auto">
          {interactions.slice(0, 4).map((interaction, index) => (
            <motion.div
              key={interaction.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex items-center space-x-3 p-3 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-soft border border-gray-100 dark:border-gray-700"
            >
              <span className="text-sm">
                {getInteractionIcon(interaction.interaction_type)}
              </span>
              
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                  {(interaction as any).contacts?.name || 'Unknown'}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {interaction.interaction_type} • {new Date(interaction.date).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          ))}
          
          {interactions.length === 0 && (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
              <TranslatedText text="No recent interactions" />
            </div>
          )}
        </div>
      </div>

      {/* Professional Upcoming Birthdays */}
      {stats.upcomingBirthdays > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">
              <TranslatedText text="Upcoming Birthdays" />
            </h4>
            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 px-2 py-1 rounded-full font-bold">
              {stats.upcomingBirthdays}
            </span>
          </div>
          
          <div className="space-y-2">
            {contacts.filter(contact => {
              if (!contact.birthday) return false;
              const birthday = new Date(contact.birthday);
              const thisYearBirthday = new Date(new Date().getFullYear(), birthday.getMonth(), birthday.getDate());
              const daysToBirthday = (thisYearBirthday.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
              return daysToBirthday >= 0 && daysToBirthday <= 30;
            }).slice(0, 2).map((contact, index) => {
              const birthday = new Date(contact.birthday!);
              const thisYearBirthday = new Date(new Date().getFullYear(), birthday.getMonth(), birthday.getDate());
              const daysToBirthday = Math.ceil((thisYearBirthday.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <motion.div 
                  key={contact.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-2xl shadow-soft border border-yellow-100 dark:border-yellow-800/30"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-yellow-700 dark:text-yellow-300 truncate">
                      {contact.name}
                    </p>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                      {daysToBirthday === 0 ? 'Today!' : `${daysToBirthday} days`}
                    </p>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-1.5 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-full transition-all"
                  >
                    <Gift className="h-3 w-3" />
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Professional Quick Actions */}
      <motion.button
        whileHover={{ scale: 1.02, y: -1 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all duration-300 group"
      >
        <Plus className="h-4 w-4 text-gray-500 group-hover:text-purple-500 transition-colors" />
        <span className="font-semibold text-sm text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
          <TranslatedText text="Add Contact" />
        </span>
      </motion.button>
    </div>
  );
}