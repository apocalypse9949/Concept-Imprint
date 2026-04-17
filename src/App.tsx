import { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition as NativeSpeech } from '@capacitor-community/speech-recognition';
import { CapacitorUpdater } from '@capgo/capacitor-updater';
import { db, syncWithCloud } from './db';
import type { Idea, IdeaStatus, IdeaPriority } from './db';
import { 
  Lightbulb, Search, Mic, Plus, 
  X, CheckSquare, Clock, Tag as TagIcon, Cloud
} from 'lucide-react';
import './App.css';

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Hide splash after 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const [quickIdea, setQuickIdea] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Apply dark theme exclusively for Neon Protocol
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Global Keyboard shortcut (Ctrl + Shift + I) and Online Sync Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    
    const handleOnline = async () => {
      console.log('Back online! Syncing with Supabase...');
      setIsSyncing(true);
      await syncWithCloud();
      setIsSyncing(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('online', handleOnline);
    
    // Initial sync on load - removed brittle onLine check for Native reliability
    handleOnline();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Capacitor OTA Updater Listener
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // Notify Capgo that the app has successfully loaded the patch!
      // This prevents the updater from rolling back to the previous version.
      CapacitorUpdater.notifyAppReady();

      CapacitorUpdater.addListener('updateAvailable', () => {
        console.log('Patch Update available! Restart app to apply.');
      });
    }
  }, []);

  // Fetch Ideas
  const ideas = useLiveQuery(
    () => {
      let collection = db.ideas.orderBy('created_at').reverse();
      collection = collection.filter(idea => !idea.deleted); // Hide soft-deleted items
      if (selectedTag) {
        return collection.filter(idea => idea.tags.includes(selectedTag)).toArray();
      }
      return collection.toArray();
    },
    [selectedTag]
  );
  
  // Local Filtering
  const filteredIdeas = ideas?.filter((idea: Idea) => {
    if (searchTerm) {
      return idea.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
             idea.description.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const allTags = Array.from(new Set(ideas?.flatMap((i: Idea) => i.tags) || []));

  const extractTags = (text: string) => {
    const regex = /#[\w-]+/g;
    const matches = text.match(regex);
    return matches ? matches.map(m => m.slice(1)) : [];
  };

  const handleAddIdea = async () => {
    if (!quickIdea.trim()) return;
    
    const tags = extractTags(quickIdea);
    
    // Create title from first line
    const lines = quickIdea.split('\n');
    const title = lines[0].replace(/#[\w-]+/g, '').trim().substring(0, 50) || 'New Idea';
    
    const idea: Idea = {
      id: crypto.randomUUID(),
      title,
      description: quickIdea,
      tags,
      status: 'Raw',
      priority: 'Medium',
      created_at: Date.now(),
      updated_at: Date.now()
    };
    
    await db.ideas.add(idea);
    setQuickIdea('');
    
    // Trigger mock sync
    setIsSyncing(true);
    await syncWithCloud();
    setIsSyncing(false);
  };

  const handleSpeech = async () => {
    // 1. Native Mobile App Speech Handling
    if (Capacitor.isNativePlatform()) {
       try {
          const hasPerm = await NativeSpeech.checkPermissions();
          if (hasPerm.speechRecognition !== 'granted') {
             await NativeSpeech.requestPermissions();
          }

          setIsRecording(true);
          const { matches } = await NativeSpeech.start({
             language: 'en-US',
             maxResults: 1,
             prompt: 'What is your idea?',
             partialResults: false,
             popup: true,
          });

          if (matches && matches.length > 0) {
             const transcript = matches[0];
             setQuickIdea(prev => prev ? prev + ' ' + transcript : transcript);
          }
       } catch (err) {
          console.error('Native speech error:', err);
          alert('Could not capture native speech.');
       } finally {
          setIsRecording(false);
       }
       return;
    }

    // 2. Web Browser Speech Handling
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported in this browser. Try Chrome or Edge!");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false; // Set to true to keep it listening longer
      recognition.interimResults = false;
      
      recognition.onstart = () => {
        setIsRecording(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuickIdea(prev => prev ? prev + ' ' + transcript : transcript);
        setIsRecording(false);
      };
      
      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        if (event.error === 'not-allowed') {
          alert('Microphone access was denied. Please allow microphone permissions in your browser or system settings.');
        } else if (event.error === 'network') {
           alert('Voice typing requires an internet connection on some browsers.');
        }
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const updateIdea = async (id: string, updates: Partial<Idea>) => {
    await db.ideas.update(id, { ...updates, updated_at: Date.now() });
    
    // Auto sync
    setIsSyncing(true);
    syncWithCloud().then(() => setIsSyncing(false));
  };

  const deleteIdea = async (id: string) => {
    await db.ideas.update(id, { deleted: true, updated_at: Date.now() });
    setSelectedIdea(null);
    
    // Immediate sync to propagate deletion to cloud
    setIsSyncing(true);
    syncWithCloud().then(() => setIsSyncing(false));
  };

  return (
    <div className="app-root">
      <AnimatePresence>
        {showSplash && (
          <motion.div 
            className="splash-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.8, 
                ease: "easeOut",
              }}
              className="splash-logo"
            >
              <motion.div
                animate={{ 
                  boxShadow: ["0px 0px 0px 0px rgba(59,130,246,0)", "0px 0px 60px 20px rgba(59,130,246,0.5)", "0px 0px 0px 0px rgba(59,130,246,0)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="splash-icon-wrapper"
              >
                <Lightbulb color="#ffffff" size={64} />
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Concept Imprint
              </motion.h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="header">
        <div className="brand">
          <Lightbulb color="var(--accent-primary)" size={28} />
          Concept Imprint
        </div>
        
        <div className="sync-status">
          <div className={`status-dot ${isSyncing ? 'syncing' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Synced'}
          <Cloud size={14} style={{ marginLeft: '4px' }} />
        </div>
      </header>

      <main className="main-content app-container">
        {/* Quick Capture Section */}
        <section className="capture-section">
          <div className="capture-input-wrapper">
            <textarea
              ref={inputRef}
              className="capture-input"
              placeholder="What's your big idea? (Use #tags)"
              value={quickIdea}
              onChange={(e) => setQuickIdea(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  handleAddIdea();
                }
              }}
            />
            <div className="capture-actions">
              <div className="capture-tools">
                <button 
                  className="btn-icon" 
                  title="Voice Capture" 
                  onClick={handleSpeech}
                >
                  <Mic size={20} className={isRecording ? 'voice-recording' : ''} />
                </button>
                <div className="shortcut-hint">
                  <span className="kbd">Ctrl</span> + <span className="kbd">Shift</span> + <span className="kbd">I</span> to focus
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleAddIdea}>
                <Plus size={18} /> Add Idea
              </button>
            </div>
          </div>
        </section>

        {/* Dashboard */}
        <section className="dashboard-section">
          <div className="filters">
            <div className="search-bar">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                className="input-base search-input" 
                placeholder="Search ideas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Tag Filter */}
            {allTags.length > 0 && (
              <div className="idea-tags" style={{ alignSelf: 'center' }}>
                <button 
                  className={`tag ${!selectedTag ? 'tag-project' : 'tag-raw'}`}
                  style={{ border: 'none', cursor: 'pointer' }}
                  onClick={() => setSelectedTag(null)}
                >
                  All
                </button>
                {allTags.map((tag) => (
                  <button 
                    key={tag as string}
                    className={`tag ${selectedTag === tag ? 'tag-project' : 'tag-raw'}`}
                    style={{ border: 'none', cursor: 'pointer' }}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag as string)}
                  >
                    #{tag as string}
                  </button>
                ))}
              </div>
            )}
          </div>

          <motion.div 
            className="ideas-list"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
             <AnimatePresence>
              {filteredIdeas?.map((idea: Idea) => (
                <motion.div 
                  key={idea.id}
                  layoutId={idea.id} // Smooth layout shifting!
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  className="card idea-card"
                  onClick={() => setSelectedIdea(idea)}
                >
                  <div className="idea-header">
                    <h3 className="idea-title">{idea.title}</h3>
                    <span className={`tag tag-${idea.status.toLowerCase()}`}>
                      {idea.status}
                    </span>
                  </div>
                  
                  <p className="idea-desc">{idea.description}</p>
                  
                  <div className="idea-footer">
                    <div className="idea-tags">
                      {idea.tags.map((tag: string) => (
                        <span key={tag} className="tag">#{tag}</span>
                      ))}
                    </div>
                    <div className="idea-date">
                      {new Date(idea.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </motion.div>
              ))}
             </AnimatePresence>
             
             {filteredIdeas?.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
                   <Lightbulb size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                   <p>No ideas found. Capture something great!</p>
                </div>
             )}
          </motion.div>
        </section>
      </main>

      {/* Idea Detail Modal */}
      <AnimatePresence>
        {selectedIdea && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setSelectedIdea(null);
            }}
          >
            <motion.div 
              className="modal-content"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <div className="modal-header">
                <div className="meta-item">
                  <Clock size={16} /> 
                  {new Date(selectedIdea.created_at).toLocaleString()}
                </div>
                <button className="btn-icon" onClick={() => setSelectedIdea(null)}>
                  <X size={24} />
                </button>
              </div>
              
              <div className="modal-body">
                <input 
                  type="text" 
                  className="modal-input-title"
                  value={selectedIdea.title}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setSelectedIdea({...selectedIdea, title: newTitle});
                    if (selectedIdea.id) updateIdea(selectedIdea.id, { title: newTitle });
                  }}
                />
                
                <div className="meta-row">
                  <div className="meta-item">
                    <TagIcon size={16} /> Status:
                    <select 
                      className="modal-meta-select"
                      value={selectedIdea.status}
                      onChange={(e) => {
                        const newStatus = e.target.value as IdeaStatus;
                        setSelectedIdea({...selectedIdea, status: newStatus});
                        if (selectedIdea.id) updateIdea(selectedIdea.id, { status: newStatus });
                      }}
                    >
                      <option value="Raw">Raw</option>
                      <option value="Developing">Developing</option>
                      <option value="Project">Project</option>
                    </select>
                  </div>
                  
                  <div className="meta-item">
                    <CheckSquare size={16} /> Priority:
                    <select 
                      className="modal-meta-select"
                      value={selectedIdea.priority}
                      onChange={(e) => {
                        const newPriority = e.target.value as IdeaPriority;
                        setSelectedIdea({...selectedIdea, priority: newPriority});
                        if (selectedIdea.id) updateIdea(selectedIdea.id, { priority: newPriority });
                      }}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <textarea 
                  className="modal-input-desc"
                  value={selectedIdea.description}
                  placeholder="Elaborate on your idea..."
                  onChange={(e) => {
                    const newDesc = e.target.value;
                    const newTags = extractTags(newDesc);
                    setSelectedIdea({...selectedIdea, description: newDesc, tags: newTags});
                    // Only update DB on blur or debounce? For simplicity, we just update on change
                     if (selectedIdea.id) updateIdea(selectedIdea.id, { description: newDesc, tags: newTags });
                  }}
                />
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
                   <button 
                     className="btn btn-secondary" 
                     style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                     onClick={() => {
                        if (selectedIdea.id && window.confirm("Delete this idea?")) {
                           deleteIdea(selectedIdea.id);
                        }
                     }}
                   >
                     Delete Idea
                   </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
