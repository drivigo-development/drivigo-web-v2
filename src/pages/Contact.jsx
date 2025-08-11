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
      question: "Can I choose my instructor?",
      answer: "Yes! You can view instructor profiles, ratings, and reviews before booking to select the one that best suits your needs."
    },
    {
      question: "Do I need to have my own car for lessons?",
      answer: "Not necessarily. Many instructors provide their own training vehicles equipped with dual controls for safety."
    },
    {
      question: "Are lessons available on weekends or evenings?",
      answer: "Yes, many instructors offer flexible timings, including weekends and evenings, to match your schedule."
    },
    {
      question: "Do you offer packages or discounts for multiple lessons?",
      answer: "Absolutely. We offer discounted packages at 30% off so you can save while learning at your own pace."
    },
    {
      question: "Is there a way to track my learning progress?",
      answer: "Yes. Your account dashboard shows completed lessons, skills learned, and recommendations for your next steps."
    },
    {
      question: "How soon can I start after signing up?",
      answer: "In most cases, you can start within 24–48 hours depending on instructor availability in your area."
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
                    <option value="Others">Others</option>
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
                
                {/* OR separator */}
                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink mx-4 text-gray-500">OR</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>
                
                {/* WhatsApp contact button */}
                <motion.a
                  href="https://wa.me/917303537421?text=Hello%20team%20drivigo"
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={scaleIn}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="btn-success w-full bg-green-500 flex justify-center items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Contact on WhatsApp
                </motion.a>
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
            className="space-y-8 max-w-3xl mx-auto"
          >
            {faqs.map((faq, index) => (
              <motion.div 
                key={index}
                variants={fadeIn}
                className={`overflow-hidden rounded-xl border ${expandedFaq === index ? 'border-primary-300 dark:border-primary-700' : 'border-secondary-200 dark:border-secondary-700'} bg-white dark:bg-secondary-800 shadow-lg transition-all duration-300 hover:shadow-xl`}
              >
                <motion.button
                  onClick={() => toggleFaq(index)}
                  className={`w-full flex justify-between items-center p-6 text-left focus:outline-none ${expandedFaq === index ? 'bg-primary-50 dark:bg-primary-900/20' : ''}`}
                  whileHover={{ backgroundColor: expandedFaq === index ? "rgba(79, 70, 229, 0.1)" : "rgba(0,0,0,0.02)" }}
                  whileTap={{ scale: 0.99 }}
                >
                  <h3 className={`text-lg font-semibold ${expandedFaq === index ? 'text-primary-700 dark:text-primary-300' : 'text-secondary-900 dark:text-secondary-100'}`}>
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${expandedFaq === index ? 'bg-primary-100 text-primary-600 dark:bg-primary-800 dark:text-primary-300' : 'bg-secondary-100 text-secondary-500 dark:bg-secondary-700 dark:text-secondary-300'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                      className="border-t border-primary-100 dark:border-primary-800/30"
                    >
                      <div className="px-6 py-5 bg-gradient-to-br from-white to-primary-50 dark:from-secondary-800 dark:to-primary-900/10">
                        <p className="text-secondary-700 dark:text-secondary-200 leading-relaxed">{faq.answer}</p>
                      </div>
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