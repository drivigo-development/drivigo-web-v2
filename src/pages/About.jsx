import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
function About() {
  const { user } = useAuth();
  const values = [
    {
      image: "/secure.png",
      title: "Safety First",
      description: "We prioritize safety in everything we do, ensuring all instructors meet strict safety standards."
    },
    {
      image: "/trust.png",
      title: "Trust & Reliability",
      description: "Building trust through verified instructors and transparent booking processes."
    },
    {
      image: "/education.png",
      title: "Quality Education",
      description: "Comprehensive driving lessons tailored to individual learning needs and styles."
    },
    {
      image: "/innovation.png",
      title: "Innovation",
      description: "Leveraging technology to make learning to drive accessible and convenient."
    }
  ];

  const stats = [
    { number: "1000+", label: "Happy Learners" },
    { number: "50+", label: "Expert Instructors" },
    { number: "95%", label: "Success Rate" },
    { number: "4.8", label: "Average Rating" }
  ];

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
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
  
  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeIn}
        className="bg-gradient-to-br from-primary-50 dark:from-primary-900 to-secondary-50 rounded-3xl dark:to-secondary-900 py-20"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            variants={fadeIn}
            className="text-4xl lg:text-5xl font-display font-bold text-secondary-900 mb-6"
          >
            About <span className="text-gradient">Drivigo</span>
          </motion.h1>
          <motion.p 
            variants={fadeIn}
            className="text-xl text-secondary-600 dark:text-secondary-400 leading-relaxed max-w-3xl mx-auto"
          >
            Drivigo was founded with a simple mission: to connect aspiring drivers with professional, 
            vetted, and friendly instructors in their local area. We believe that learning to drive 
            should be a safe, comfortable, and empowering experience.
          </motion.p>
        </div>
      </motion.section>

      {/* Mission Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-20 bg-white dark:bg-secondary-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-4 items-center">
            <motion.div variants={fadeIn}>
              <motion.h2 
                variants={fadeIn}
                className="text-3xl lg:text-5xl font-display font-bold text-secondary-900 dark:text-secondary-100 mb-6"
              >
                Our <span className="text-primary-500">Mission</span>
              </motion.h2>
              <motion.p 
                variants={fadeIn}
                className="text-xl text-secondary-600 dark:text-secondary-400 leading-relaxed mb-6"
              >
              To make people learn drive in a more convenient and right way with best professional experience.
              </motion.p>
              <motion.p 
                variants={fadeIn}
                className="text-xl text-secondary-600 dark:text-secondary-400 leading-relaxed"
              >
              To create a reliable and secure job for all driving instructors and to help them reach all the potential learners.
              </motion.p>
            </motion.div>
            <motion.div 
              variants={fadeIn}
              className="relative"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center bg-primary-500 rounded-2xl p-8">
                <motion.div 
                  variants={fadeIn}
                  className="text-white w-96"
                >
                  <h3 className="text-3xl text-black font-display font-bold mb-4 lg:w-96 ">Why Choose Drivigo?</h3>
                  <motion.ul 
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    className="space-y-3 text-black"
                  >
                    <motion.li variants={fadeIn} className="flex items-center">
                      <img src="/tick_g.png" alt="Checkmark" className="w-5 h-5 mr-3" />
                      Verified and certified instructors
                    </motion.li>
                    <motion.li variants={fadeIn} className="flex items-center">
                      <img src="/tick_g.png" alt="Checkmark" className="w-5 h-5 mr-3" />
                      Flexible scheduling options
                    </motion.li>
                    <motion.li variants={fadeIn} className="flex items-center">
                      <img src="/tick_g.png" alt="Checkmark" className="w-5 h-5 mr-3" />
                      Secure payment processing
                    </motion.li>
                    <motion.li variants={fadeIn} className="flex items-center">
                      <img src="/tick_g.png" alt="Checkmark" className="w-5 h-5 mr-3" />
                      24/7 customer support
                    </motion.li>
                  </motion.ul>
                </motion.div>
                <motion.div 
                  variants={fadeIn}
                  className="flex justify-center items-center"
                >
                  <motion.img 
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    src="/character_key.png" 
                    alt="Car with keys" 
                    className="max-w-52 object-contain" 
                  />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      {/* <section className="py-16 bg-secondary-50 dark:bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl lg:text-4xl font-display font-bold text-primary-600 dark:text-primary-100 mb-2">
                  {stat.number}
                </div>
                <div className="text-secondary-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Values Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-20 bg-white dark:bg-secondary-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={fadeIn}
            className="text-center mb-16"
          >
            <motion.h2 
              variants={fadeIn}
              className="text-3xl lg:text-4xl font-display font-bold text-secondary-900 dark:text-secondary-100 mb-4"
            >
              Our <span className="text-primary-500">Values</span>
            </motion.h2>
            <motion.p 
              variants={fadeIn}
              className="text-xl text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto"
            >
              These core principles guide everything we do at Drivigo
            </motion.p>
          </motion.div>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {values.map((value, index) => (
              <motion.div 
                key={index} 
                variants={fadeIn}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="bg-white dark:bg-secondary-800  p-6 text-center"
              >
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="mb-4 h-24 flex items-center justify-center"
                >
                  <img src={`${value.image}`} alt={value.title} className="h-full object-contain" />
                </motion.div>
                <motion.h3 
                  variants={fadeIn}
                  className="text-xl font-display font-semibold text-secondary-900 dark:text-secondary-100 mb-3"
                >
                  {value.title}
                </motion.h3>
                <motion.p 
                  variants={fadeIn}
                  className="text-secondary-600 dark:text-secondary-400 leading-relaxed"
                >
                  {value.description}
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeIn}
        className="lg:mx-24 mx-4 py-20 bg-primary-500 rounded-3xl mb-16"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            variants={fadeIn}
            className="text-3xl lg:text-4xl font-display font-bold text-white mb-6"
          >
            Ready to Start Your Driving Journey?
          </motion.h2>

          <motion.div
            variants={fadeIn}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link 
              to={user ? "/dashboard" : "/signin"} 
              className="btn-secondary text-lg px-8 py-4 inline-block"
            >
              Book Your First Lesson
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}

export default About;