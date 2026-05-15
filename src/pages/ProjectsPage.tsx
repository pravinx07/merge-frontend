import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Search, Plus, MapPin, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { DashboardContainer, EmptyState } from '../components/DashboardComponents';
import toast from 'react-hot-toast';

const ProjectsPage = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  // New Project Form State
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    lookingFor: '',
    techStack: '',
    projectType: 'Startup',
    location: 'Remote',
    teamSize: '5'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Fetch projects error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...newProject,
        lookingFor: newProject.lookingFor.split(',').map(s => s.trim()).filter(Boolean),
        techStack: newProject.techStack.split(',').map(s => s.trim()).filter(Boolean),
        teamSize: parseInt(newProject.teamSize) || null
      };

      await api.post('/projects', payload);
      toast.success('Project created successfully!');
      setIsCreateModalOpen(false);
      fetchProjects();
      setNewProject({
        title: '', description: '', lookingFor: '', techStack: '', projectType: 'Startup', location: 'Remote', teamSize: '5'
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardContainer>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Projects Hub</h1>
          <p className="text-sm text-zinc-400 mt-1">Build startups & find collaborators</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-cyan text-dark-bg font-bold rounded-xl text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)] hover:shadow-[0_0_25px_rgba(0,229,255,0.4)]"
        >
          <Plus className="w-4 h-4" />
          Create Project
        </button>
      </div>

      <div className="mb-8">
        <div className="relative group max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-brand-cyan transition-colors" />
          <input 
            type="text" 
            placeholder="Search projects..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-cyan/50 transition-all w-full"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-8">
          <LoadingSkeleton type="card" />
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-6 flex flex-col hover:bg-zinc-900/60 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-white leading-tight">{project.title}</h3>
                <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] uppercase font-bold text-zinc-400">
                  {project.status || 'Idea'}
                </span>
              </div>
              <p className="text-sm text-zinc-400 mb-4 line-clamp-2 leading-relaxed">
                {project.description}
              </p>

              <div className="flex items-center gap-4 mb-4 text-xs font-medium text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>{project.projectType || 'Startup'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{project.location || 'Remote'}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Looking For</p>
                <div className="flex flex-wrap gap-1.5">
                  {project.lookingFor?.slice(0, 3).map((role: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-brand-purple/10 border border-brand-purple/20 text-brand-purple rounded-md text-[10px] font-bold">
                      {role}
                    </span>
                  ))}
                  {project.lookingFor?.length > 3 && (
                    <span className="px-2 py-1 bg-white/5 border border-white/10 text-zinc-400 rounded-md text-[10px] font-bold">
                      +{project.lookingFor.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                  <Users className="w-4 h-4" />
                  <span>{project.members?.length || 1} / {project.teamSize || '∞'} Members</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigate(`/projects/${project.id}`)}
                    className="px-3 py-1.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    View
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={LayoutGrid}
          title="No projects found"
          description="Be the first to create a startup or project and invite developers to collaborate."
          actionLabel="Create Project"
          onAction={() => setIsCreateModalOpen(true)}
        />
      )}

      {/* Create Project Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsCreateModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }} 
              className="relative bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-lg p-6 overflow-hidden shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Create Project</h2>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Project Title</label>
                  <input 
                    required
                    type="text" 
                    value={newProject.title}
                    onChange={e => setNewProject({...newProject, title: e.target.value})}
                    placeholder="e.g. AI Resume Builder"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-cyan/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea 
                    required
                    value={newProject.description}
                    onChange={e => setNewProject({...newProject, description: e.target.value})}
                    placeholder="Describe your startup/project..."
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-cyan/50 min-h-[100px] resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Looking For</label>
                    <input 
                      type="text" 
                      value={newProject.lookingFor}
                      onChange={e => setNewProject({...newProject, lookingFor: e.target.value})}
                      placeholder="React, AI, UI/UX (comma separated)"
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-cyan/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Tech Stack</label>
                    <input 
                      type="text" 
                      value={newProject.techStack}
                      onChange={e => setNewProject({...newProject, techStack: e.target.value})}
                      placeholder="Next.js, Python, PostgreSQL"
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-cyan/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Type</label>
                    <select 
                      value={newProject.projectType}
                      onChange={e => setNewProject({...newProject, projectType: e.target.value})}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-cyan/50 appearance-none"
                    >
                      <option value="Startup">Startup</option>
                      <option value="Open Source">Open Source</option>
                      <option value="Hackathon">Hackathon</option>
                      <option value="Side Project">Side Project</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Location</label>
                    <select 
                      value={newProject.location}
                      onChange={e => setNewProject({...newProject, location: e.target.value})}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-cyan/50 appearance-none"
                    >
                      <option value="Remote">Remote</option>
                      <option value="In-person">In-person</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Team Size</label>
                    <input 
                      type="number" 
                      value={newProject.teamSize}
                      onChange={e => setNewProject({...newProject, teamSize: e.target.value})}
                      placeholder="e.g. 5"
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-cyan/50"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-cyan text-dark-bg hover:bg-brand-cyan/90 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Project'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardContainer>
  );
};

export default ProjectsPage;
