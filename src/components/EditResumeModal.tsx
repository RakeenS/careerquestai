import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { ResumeContent } from '../types';
import QuillEditor from './QuillEditor';

interface EditResumeModalProps {
  resume: ResumeContent;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedResume: ResumeContent) => void;
}

const EditResumeModal: React.FC<EditResumeModalProps> = ({ resume, isOpen, onClose, onSave }) => {
  const [editedResume, setEditedResume] = useState<ResumeContent>(resume);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      ...editedResume,
      lastUpdated: new Date().toISOString()
    });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-4xl w-full m-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Edit Resume</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={editedResume.name}
              onChange={(e) => setEditedResume({ ...editedResume, name: e.target.value })}
              className="w-full p-3 border rounded-lg dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Job Title</label>
            <input
              type="text"
              value={editedResume.jobTitle}
              onChange={(e) => setEditedResume({ ...editedResume, jobTitle: e.target.value })}
              className="w-full p-3 border rounded-lg dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={editedResume.email}
              onChange={(e) => setEditedResume({ ...editedResume, email: e.target.value })}
              className="w-full p-3 border rounded-lg dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              type="tel"
              value={editedResume.phone}
              onChange={(e) => setEditedResume({ ...editedResume, phone: e.target.value })}
              className="w-full p-3 border rounded-lg dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <input
              type="text"
              value={editedResume.location}
              onChange={(e) => setEditedResume({ ...editedResume, location: e.target.value })}
              className="w-full p-3 border rounded-lg dark:bg-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Professional Summary</label>
            <QuillEditor
              value={editedResume.summary}
              onChange={(value) => setEditedResume({ ...editedResume, summary: value })}
              placeholder="Write a brief summary of your professional experience and goals..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Skills</label>
            <QuillEditor
              value={editedResume.skills}
              onChange={(value) => setEditedResume({ ...editedResume, skills: value })}
              placeholder="List your key skills..."
            />
          </div>

          {/* Experience Section */}
          <div>
            <label className="block text-sm font-medium mb-2">Experience</label>
            {editedResume.experience.map((exp, index) => (
              <div key={exp.id} className="mb-4 p-4 border rounded-lg">
                <input
                  type="text"
                  value={exp.jobTitle}
                  onChange={(e) => {
                    const newExperience = [...editedResume.experience];
                    newExperience[index] = { ...exp, jobTitle: e.target.value };
                    setEditedResume({ ...editedResume, experience: newExperience });
                  }}
                  className="w-full p-2 mb-2 border rounded-lg dark:bg-gray-700"
                  placeholder="Job Title"
                />
                <input
                  type="text"
                  value={exp.employer}
                  onChange={(e) => {
                    const newExperience = [...editedResume.experience];
                    newExperience[index] = { ...exp, employer: e.target.value };
                    setEditedResume({ ...editedResume, experience: newExperience });
                  }}
                  className="w-full p-2 mb-2 border rounded-lg dark:bg-gray-700"
                  placeholder="Employer"
                />
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    value={exp.startDate}
                    onChange={(e) => {
                      const newExperience = [...editedResume.experience];
                      newExperience[index] = { ...exp, startDate: e.target.value };
                      setEditedResume({ ...editedResume, experience: newExperience });
                    }}
                    className="p-2 border rounded-lg dark:bg-gray-700"
                    placeholder="Start Date"
                  />
                  <input
                    type="text"
                    value={exp.endDate}
                    onChange={(e) => {
                      const newExperience = [...editedResume.experience];
                      newExperience[index] = { ...exp, endDate: e.target.value };
                      setEditedResume({ ...editedResume, experience: newExperience });
                    }}
                    className="p-2 border rounded-lg dark:bg-gray-700"
                    placeholder="End Date"
                  />
                </div>
                <QuillEditor
                  value={exp.description}
                  onChange={(value) => {
                    const newExperience = [...editedResume.experience];
                    newExperience[index] = { ...exp, description: value };
                    setEditedResume({ ...editedResume, experience: newExperience });
                  }}
                  placeholder="Describe your responsibilities and achievements..."
                />
              </div>
            ))}
          </div>

          {/* Education Section */}
          <div>
            <label className="block text-sm font-medium mb-2">Education</label>
            {editedResume.education.map((edu, index) => (
              <div key={edu.id} className="mb-4 p-4 border rounded-lg">
                <input
                  type="text"
                  value={edu.school}
                  onChange={(e) => {
                    const newEducation = [...editedResume.education];
                    newEducation[index] = { ...edu, school: e.target.value };
                    setEditedResume({ ...editedResume, education: newEducation });
                  }}
                  className="w-full p-2 mb-2 border rounded-lg dark:bg-gray-700"
                  placeholder="School"
                />
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => {
                    const newEducation = [...editedResume.education];
                    newEducation[index] = { ...edu, degree: e.target.value };
                    setEditedResume({ ...editedResume, education: newEducation });
                  }}
                  className="w-full p-2 mb-2 border rounded-lg dark:bg-gray-700"
                  placeholder="Degree"
                />
                <input
                  type="text"
                  value={edu.fieldOfStudy}
                  onChange={(e) => {
                    const newEducation = [...editedResume.education];
                    newEducation[index] = { ...edu, fieldOfStudy: e.target.value };
                    setEditedResume({ ...editedResume, education: newEducation });
                  }}
                  className="w-full p-2 mb-2 border rounded-lg dark:bg-gray-700"
                  placeholder="Field of Study"
                />
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input
                    type="text"
                    value={edu.startDate}
                    onChange={(e) => {
                      const newEducation = [...editedResume.education];
                      newEducation[index] = { ...edu, startDate: e.target.value };
                      setEditedResume({ ...editedResume, education: newEducation });
                    }}
                    className="p-2 border rounded-lg dark:bg-gray-700"
                    placeholder="Start Date"
                  />
                  <input
                    type="text"
                    value={edu.endDate}
                    onChange={(e) => {
                      const newEducation = [...editedResume.education];
                      newEducation[index] = { ...edu, endDate: e.target.value };
                      setEditedResume({ ...editedResume, education: newEducation });
                    }}
                    className="p-2 border rounded-lg dark:bg-gray-700"
                    placeholder="End Date"
                  />
                </div>
                <QuillEditor
                  value={edu.description}
                  onChange={(value) => {
                    const newEducation = [...editedResume.education];
                    newEducation[index] = { ...edu, description: value };
                    setEditedResume({ ...editedResume, education: newEducation });
                  }}
                  placeholder="Describe your studies, achievements, or relevant coursework..."
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Save className="mr-2" size={18} />
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EditResumeModal;