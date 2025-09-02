import React from 'react'
import { Link } from 'react-router-dom'

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 dark:bg-gray-950 text-white py-6 transition-colors duration-300">
      <div className="container mx-auto px-4 text-center">
        <div className="flex flex-col items-center">
          <div className="flex gap-8 mb-4 text-sm text-gray-300">
            <Link to="/privacy-policy" className="hover:text-blue-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:text-blue-400 transition-colors">
              Terms of Service
            </Link>
            <Link to="/contact" className="hover:text-blue-400 transition-colors">
              Contact Us
            </Link>
          </div>
          <p>&copy; {new Date().getFullYear()} CareerQuestAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer