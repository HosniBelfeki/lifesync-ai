import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, Phone, Mail, Calendar, Gift, MessageCircle, Heart } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Contact, Interaction } from '../../types/database';

export function RelationshipsView() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddContact, setShowAddContact] = useState(false);
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone: '',
    relationship_type: '',
    birthday: '',
    notes: '',
  });
  const [newInteraction, setNewInteraction] = useState({
    contact_id: '',
    interaction_type: 'call' as const,
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
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
          .order('name', { ascending: true }),
        supabase
          .from('interactions')
          .select('*, contacts(name)')
          .eq('user_id', user?.id)
          .order('date', { ascending: false })
          .limit(50)
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

  const addContact = async () => {
    if (!newContact.name.trim()) return;

    try {
      const { error } = await supabase
        .from('contacts')
        .insert({
          user_id: user?.id,
          name: newContact.name,
          email: newContact.email || null,
          phone: newContact.phone || null,
          relationship_type: newContact.relationship_type || null,
          birthday: newContact.birthday || null,
          notes: newContact.notes || null,
        });

      if (error) throw error;
      
      setNewContact({ name: '', email: '', phone: '', relationship_type: '', birthday: '', notes: '' });
      setShowAddContact(false);
      fetchRelationshipData();
    } catch (error) {
      console.error('Error adding contact:', error);
    }
  };

  const addInteraction = async () => {
    if (!newInteraction.contact_id || !newInteraction.description.trim()) return;

    try {
      const { error } = await supabase
        .from('interactions')
        .insert({
          user_id: user?.id,
          contact_id: newInteraction.contact_id,
          interaction_type: newInteraction.interaction_type,
          description: newInteraction.description,
          date: newInteraction.date,
        });

      if (error) throw error;

      // Update last contact date
      await supabase
        .from('contacts')
        .update({ last_contact_date: newInteraction.date })
        .eq('id', newInteraction.contact_id);
      
      setNewInteraction({ contact_id: '', interaction_type: 'call', description: '', date: new Date().toISOString().split('T')[0] });
      setShowAddInteraction(false);
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
      case 'call': return <Phone className="h-4 w-4" />;
      case 'text': return <MessageCircle className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'meeting': return <Users className="h-4 w-4" />;
      case 'gift': return <Gift className="h-4 w-4" />;
      default: return <Heart className="h-4 w-4" />;
    }
  };

  const relationshipTypes = [
    'Family', 'Friend', 'Colleague', 'Partner', 'Acquaintance', 'Mentor', 'Other'
  ];

  const interactionTypes = [
    { value: 'call', label: 'Phone Call' },
    { value: 'text', label: 'Text Message' },
    { value: 'email', label: 'Email' },
    { value: 'meeting', label: 'In-Person Meeting' },
    { value: 'gift', label: 'Gift/Card' },
    { value: 'other', label: 'Other' },
  ];

  const stats = getRelationshipStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Relationships</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your connections and interactions</p>
        </div>
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddContact(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Contact</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddInteraction(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Log Interaction</span>
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalContacts}</p>
              <p className="text-gray-600 dark:text-gray-400">Total Contacts</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MessageCircle className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.recentInteractions}</p>
              <p className="text-gray-600 dark:text-gray-400">This Week</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-red-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.overdueContacts}</p>
              <p className="text-gray-600 dark:text-gray-400">Need Attention</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Gift className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.upcomingBirthdays}</p>
              <p className="text-gray-600 dark:text-gray-400">Upcoming Birthdays</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Contact Form */}
      {showAddContact && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={newContact.name}
              onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <input
              type="email"
              placeholder="Email"
              value={newContact.email}
              onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={newContact.phone}
              onChange={(e) => setNewContact(prev => ({ ...prev, phone: e.target.value }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <select
              value={newContact.relationship_type}
              onChange={(e) => setNewContact(prev => ({ ...prev, relationship_type: e.target.value }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select Relationship</option>
              {relationshipTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <input
              type="date"
              placeholder="Birthday"
              value={newContact.birthday}
              onChange={(e) => setNewContact(prev => ({ ...prev, birthday: e.target.value }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <textarea
              placeholder="Notes"
              value={newContact.notes}
              onChange={(e) => setNewContact(prev => ({ ...prev, notes: e.target.value }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white md:col-span-2"
              rows={3}
            />
          </div>
          <div className="flex space-x-3 mt-4">
            <button
              onClick={addContact}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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

      {/* Add Interaction Form */}
      {showAddInteraction && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Log Interaction</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={newInteraction.contact_id}
              onChange={(e) => setNewInteraction(prev => ({ ...prev, contact_id: e.target.value }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select Contact</option>
              {contacts.map(contact => (
                <option key={contact.id} value={contact.id}>{contact.name}</option>
              ))}
            </select>
            <select
              value={newInteraction.interaction_type}
              onChange={(e) => setNewInteraction(prev => ({ ...prev, interaction_type: e.target.value as any }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {interactionTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            <input
              type="date"
              value={newInteraction.date}
              onChange={(e) => setNewInteraction(prev => ({ ...prev, date: e.target.value }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <textarea
              placeholder="Description"
              value={newInteraction.description}
              onChange={(e) => setNewInteraction(prev => ({ ...prev, description: e.target.value }))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white md:col-span-2"
              rows={3}
            />
          </div>
          <div className="flex space-x-3 mt-4">
            <button
              onClick={addInteraction}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Log Interaction
            </button>
            <button
              onClick={() => setShowAddInteraction(false)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Contacts and Interactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contacts List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Contacts</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {contacts.map((contact, index) => (
              <motion.div
                key={contact.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                onClick={() => setSelectedContact(contact)}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 dark:text-purple-400 font-semibold">
                      {contact.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{contact.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {contact.relationship_type || 'No relationship set'}
                    </p>
                    {contact.last_contact_date && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        Last contact: {new Date(contact.last_contact_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {contact.phone && (
                    <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                      <Phone className="h-4 w-4" />
                    </button>
                  )}
                  {contact.email && (
                    <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                      <Mail className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
            
            {contacts.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No contacts yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Add your first contact to start managing relationships
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Interactions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Recent Interactions</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {interactions.map((interaction, index) => (
              <motion.div
                key={interaction.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  {getInteractionIcon(interaction.interaction_type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {(interaction as any).contacts?.name || 'Unknown Contact'}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(interaction.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {interaction.interaction_type.replace('_', ' ')}
                  </p>
                  {interaction.description && (
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {interaction.description}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
            
            {interactions.length === 0 && (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No interactions yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Start logging interactions to track your relationships
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedContact(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {selectedContact.name}
              </h3>
              <button
                onClick={() => setSelectedContact(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {selectedContact.relationship_type && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Relationship</p>
                  <p className="text-gray-900 dark:text-white">{selectedContact.relationship_type}</p>
                </div>
              )}
              
              {selectedContact.email && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</p>
                  <p className="text-gray-900 dark:text-white">{selectedContact.email}</p>
                </div>
              )}
              
              {selectedContact.phone && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</p>
                  <p className="text-gray-900 dark:text-white">{selectedContact.phone}</p>
                </div>
              )}
              
              {selectedContact.birthday && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Birthday</p>
                  <p className="text-gray-900 dark:text-white">
                    {new Date(selectedContact.birthday).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              {selectedContact.notes && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes</p>
                  <p className="text-gray-900 dark:text-white">{selectedContact.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}