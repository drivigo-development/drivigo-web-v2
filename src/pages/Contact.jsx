import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } }
};

const slideIn = {
  hidden: { x: -60, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.6 } }
};

// FAQ animation variants
const faqContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Toast component
const Toast = ({ message, type, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -50, x: '-50%' }}
      animate={{ opacity: 1, y: 20, x: '-50%' }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed top-0 left-1/2 z-50 p-4 rounded-lg shadow-lg ${type === 'error' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-success-100 text-success-700 border border-success-200'}`}
      style={{ maxWidth: '90%', minWidth: '300px' }}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {type === 'error' ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
          <span>{message}</span>
        </div>
        <button onClick={onClose} className="ml-4 text-gray-500 hover:text-gray-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    userType: 'Learner',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [expandedFaq, setExpandedFaq] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Prepare data for API format
      const contactData = {
        fullName: formData.name,
        emailAddress: formData.email,
        role: formData.userType,
        message: formData.message
      };
      
      // Make API call to contact-us endpoint
      const response = await fetch('https://drivigo-server-v2.vercel.app/contact-us', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactData)
      });
      
      if (response.ok) {
        // Success
        setToast({
          show: true,
          message: 'Thank you for your message! We\'ll get back to you soon.',
          type: 'success'
        });
        setFormData({ name: '', email: '', userType: 'Learner', message: '' });
      } else {
        // Handle error
        const errorData = await response.json();
        setToast({
          show: true,
          message: `Error: ${errorData.message || 'Failed to send message. Please try again later.'}`,
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setToast({
        show: true,
        message: 'Failed to send message. Please check your connection and try again.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [toast.show]);
  
  // Handle toast close
  const handleCloseToast = () => {
    setToast({ ...toast, show: false });
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const contactInfo = [
    {
      icon: "/email.png",
      title: "Email",
      details: "contact@drivigo.in",
      description: "Send us an email anytime"
    },
    {
      icon: "/phone.png",
      title: "Phone",
      details: "+91 7303537421, +91 9205620971",
      description: "Call us during business hours"
    },
    {
      icon: "/location.png",
      title: "Address",
      details: "New Delhi, India",
      description: ""
    }
  ];

  const faqs = [
    {
      question: "How do I book a driving lesson?",
      answer: "Simply sign up for an account, browse available instructors, and book a lesson that fits your schedule. Our intuitive booking system makes it easy to find the perfect time slot for your driving lessons."
    },
    {
      question: "Are all instructors verified?",
      answer: "Yes, all our instructors go through a thorough verification process including background checks, certification verification, and regular performance reviews to ensure the highest quality of instruction."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, debit cards, and digital wallets for secure payment processing. All transactions are encrypted and protected with industry-standard security protocols."
    },
    {
      question: "Can I reschedule my driving lesson?",
      answer: "Yes, you can reschedule your driving lesson up to 24 hours before the scheduled time without any penalty. Simply log into your account and use our easy rescheduling tool."
    },
    {
      question: "Do you offer specialized driving courses?",
      answer: "Yes, we offer specialized courses for defensive driving, highway driving, parallel parking, and other specific skills. Contact us for more information about our specialized training options."
    }
  ];

  return (
    <div>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={handleCloseToast} 
          />
        )}
      </AnimatePresence>
      {/* Hero Section */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="bg-gradient-to-br from-primary-50 dark:from-primary-900 to-secondary-50 dark:to-secondary-900 py-20"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            variants={fadeIn}
            className="text-4xl lg:text-5xl font-display font-bold text-secondary-900 dark:text-secondary-100 mb-6"
          >
            Get in <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-gradient"
            >Touch</motion.span>
          </motion.h1>
          <motion.p 
            variants={fadeIn}
            className="text-xl text-secondary-600 dark:text-secondary-400 leading-relaxed max-w-2xl mx-auto"
          >
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </motion.p>
        </div>
      </motion.section>

      {/* Contact Form & Info Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-20 bg-white dark:bg-secondary-900"
      >
        <div className="max-w-7xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-12"
          >
            {/* Contact Form */}
            <motion.div 
              variants={fadeIn}
              className="card"
            >
              <motion.h2 
                variants={fadeIn}
                className="text-2xl font-display font-bold text-secondary-900 dark:text-secondary-100 mb-6"
              >
                Send us a Message
              </motion.h2>
              
              {/* Toast notification is now rendered at the app level */}

              <motion.form 
                variants={fadeIn}
                onSubmit={handleSubmit} 
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <motion.div variants={fadeIn}>
                    <label htmlFor="name" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="Enter your full name"
                    />
                  </motion.div>
                  <motion.div variants={fadeIn}>
                    <label htmlFor="email" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="Enter your email"
                    />
                  </motion.div>
                </div>

                <motion.div variants={fadeIn}>
                  <label htmlFor="userType" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    You are
                  </label>
                  <select
                    id="userType"
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                    required
                    className="input-field"
                  >
                    <option value="Learner">Learner</option>
                    <option value="Instructor">Instructor</option>
                  </select>
                </motion.div>

                <motion.div variants={fadeIn}>
                  <label htmlFor="message" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    className="input-field resize-none"
                    placeholder="Tell us more about your inquiry..."
                  />
                </motion.div>

                <motion.button
                  variants={scaleIn}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full flex justify-center items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Sending message...
                    </>
                  ) : (
                    'Send Message'
                  )}
                </motion.button>
              </motion.form>
            </motion.div>

            {/* Contact Information */}
            <motion.div 
              variants={staggerContainer}
              className="space-y-8"
            >
              <motion.div variants={fadeIn}>
                <motion.h2 
                  variants={fadeIn}
                  className="text-2xl font-display font-bold text-secondary-900 dark:text-secondary-100 mb-6"
                >
                  Contact Information
                </motion.h2>
                <motion.p 
                  variants={fadeIn}
                  className="text-secondary-600 dark:text-secondary-400 mb-8"
                >
                  Reach out to us through any of these channels. We're here to help!
                </motion.p>
              </motion.div>

              <motion.div 
                variants={staggerContainer}
                className="space-y-6"
              >
                {contactInfo.map((info, index) => (
                  <motion.div 
                    key={index} 
                    variants={slideIn}
                    className="flex items-start space-x-4"
                  >
                    <motion.div 
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="h-10 w-10 flex items-center justify-center bg-primary-100 dark:bg-primary-800 rounded-full"
                    >
                      <img src={info.icon} alt={info.title} className="h-6 w-6" />
                    </motion.div>
                    <div>
                      <motion.h3 
                        variants={fadeIn}
                        className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-1"
                      >
                        {info.title}
                      </motion.h3>
                      <motion.p 
                        variants={fadeIn}
                        className="text-secondary-900 dark:text-secondary-400 font-medium mb-1"
                      >
                        {info.details}
                      </motion.p>
                      <motion.p 
                        variants={fadeIn}
                        className="text-secondary-600 text-sm"
                      >
                        {info.description}
                      </motion.p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* Business Hours */}
              <motion.div 
                variants={scaleIn}
                className="card"
              >
                <motion.h3 
                  variants={fadeIn}
                  className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4"
                >
                  Business Hours
                </motion.h3>
                <motion.div 
                  variants={staggerContainer}
                  className="space-y-2 text-secondary-600 dark:text-secondary-400"
                >
                  <motion.div variants={fadeIn} className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span>9:00 AM - 6:00 PM</span>
                  </motion.div>
                  <motion.div variants={fadeIn} className="flex justify-between">
                    <span>Saturday</span>
                    <span>10:00 AM - 4:00 PM</span>
                  </motion.div>
                  <motion.div variants={fadeIn} className="flex justify-between">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-20 bg-secondary-50 dark:bg-secondary-900"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={fadeIn}
            className="text-center mb-12"
          >
            <motion.h2 
              variants={fadeIn}
              className="text-3xl font-display font-bold text-secondary-900 dark:text-secondary-100 mb-4"
            >
              Frequently Asked Questions
            </motion.h2>
            <motion.p 
              variants={fadeIn}
              className="text-xl text-secondary-600 dark:text-secondary-400"
            >
              Find quick answers to common questions
            </motion.p>
          </motion.div>

          <motion.div 
            variants={faqContainer}
            className="space-y-6"
          >
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                variants={fadeIn}
                className="overflow-hidden rounded-lg border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-800 shadow-sm"
              >
                <motion.button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center p-5 text-left focus:outline-none"
                  whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                  whileTap={{ scale: 0.99 }}
                >
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-primary-600 dark:text-primary-400"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </motion.div>
                </motion.button>
                
                <AnimatePresence>
                  {expandedFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <motion.div 
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="p-5 pt-0 text-secondary-600 dark:text-secondary-400 border-t border-secondary-100 dark:border-secondary-700"
                      >
                        {faq.answer}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}

export default Contact;