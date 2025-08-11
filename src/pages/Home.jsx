import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { user } = useAuth();
  const steps = [
    {
      id: 1,
      title: "Fill details",
      description: "Come at drivigo.in and fill your details",
    },
    {
      id: 2,
      title: "Choose",
      description: "Choose your preferred time and location",
    },
    {
      id: 3,
      title: "Book",
      description:
        "Book your preferred instructor and book your sessions",
    },
    {
      id: 4,
      title: "Pay Securely",
      description: "After instructor matching, pay securely",
    },
    {
      id: 5,
      title: "Learn",
      description:
        "Instructor will come to your place and your driving journey starts",
    },
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
  
  const slideIn = {
    hidden: { x: -60, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };
  
  const features = [
    {
      image: "/verified.png",
      title: "Verified Instructors",
      description: "All our instructors are thoroughly verified and certified professionals"
    },
    {
      image: "/secure.png",
      title: "Secure Payments",
      description: "Safe and secure payment processing with multiple options"
    },
    {
      image: "/booking.png",
      title: "Easy Booking",
      description: "Book your lessons in just a few clicks from anywhere"
    },
    {
      image: "/quality.png",
      title: "Quality Training",
      description: "Comprehensive driving lessons tailored to your needs"
    }
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <motion.section
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden bg-gradient-to-br from-primary-50 dark:from-primary-900 to-secondary-50 dark:to-secondary-900 py-20 lg:py-32"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div variants={slideIn} className="text-center lg:text-left">
              <motion.h1
                variants={fadeIn}
                className="text-4xl lg:text-6xl font-display font-bold text-secondary-900 mb-6 leading-tight"
              >
                Gaadi Seekhni h?
                <span className="text-gradient block"> Drivigo se Seekho!</span>
              </motion.h1>
              <motion.p
                variants={fadeIn}
                className="text-xl text-secondary-600 mb-8 leading-relaxed"
              >
                Verified instructors se seekho aur securely pay kro ❤️
              </motion.p>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <motion.div
                  variants={fadeIn}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to={user ? "/dashboard" : "/signup"}
                    className="btn-primary text-lg px-8 py-4 inline-block"
                  >
                    Book Your First Lesson
                  </Link>
                </motion.div>
                {/* <motion.div variants={fadeIn} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link 
                    to="/about" 
                    className="btn-secondary text-lg px-8 py-4 inline-block"
                  >
                    Learn More
                  </Link>
                </motion.div> */}
              </motion.div>
            </motion.div>

            {/* Right Image */}
            <motion.div
              variants={fadeIn}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <motion.img
                  src="/car.png"
                  alt="A person who has learned driving and is confident and happy"
                  className="w-full lg:h-[28rem] object-cover"
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: "easeInOut",
                  }}
                />
              </div>
              {/* Decorative elements */}
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                }}
                className="absolute -top-4 -right-4 w-24 h-24 bg-primary-200 rounded-full opacity-50"
              ></motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.6, 0.5] }}
                transition={{
                  repeat: Infinity,
                  duration: 5,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-secondary-200 rounded-full opacity-50"
              ></motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-20 bg-secondary-50 dark:bg-secondary-900"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeIn} className="text-center mb-16">
            <motion.h2
              variants={fadeIn}
              className="text-3xl lg:text-4xl font-display font-bold text-secondary-900 dark:text-secondary-100 mb-4"
            >
              Why Choose Drivigo?
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="text-xl text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto"
            >
              We make learning to drive simple, safe, and enjoyable with our
              comprehensive platform
            </motion.p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                className="card-hover text-center group"
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="h-24 mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                >
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="h-full object-contain"
                  />
                </motion.div>
                <motion.h3
                  variants={fadeIn}
                  className="text-xl font-display font-semibold text-secondary-900 dark:text-secondary-100 mb-3"
                >
                  {feature.title}
                </motion.h3>
                <motion.p
                  variants={fadeIn}
                  className="text-secondary-600 dark:text-secondary-400 leading-relaxed"
                >
                  {feature.description}
                </motion.p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
        className="bg-[#FFFDF8] py-16"
      >
        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.h2 
            variants={fadeIn}
            className="lg:text-4xl text-3xl font-bold text-gray-900"
          >
            How Drivigo Works
          </motion.h2>
          <motion.p 
            variants={fadeIn}
            className="text-gray-500 mt-2"
          >
            Getting on the road has never been easier. Just follow these simple
            steps:
          </motion.p>

          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8"
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                variants={fadeIn}
                custom={index}
                whileHover={{ y: -5, transition: { duration: 0.3 } }}
                className="flex flex-col items-center relative"
              >
                {/* Step Number */}
                <motion.div 
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-500 text-white font-bold text-lg"
                >
                  {step.id}
                </motion.div>

                {/* Line between steps */}
                {index < steps.length - 1 && (
                  <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    whileInView={{ width: '100%', opacity: 1 }}
                    transition={{ delay: 0.5 + (index * 0.1), duration: 0.8 }}
                    className="hidden md:block absolute top-5 left-[calc(50%+1rem)] border-t-2 border-primary-500 z-[1]"
                  ></motion.div>
                )}

                {/* Title */}
                <motion.h3 
                  variants={fadeIn}
                  className="mt-4 font-semibold text-gray-900"
                >
                  {step.title}
                </motion.h3>

                {/* Description */}
                <motion.p 
                  variants={fadeIn}
                  className="text-gray-600 text-sm mt-1 text-center"
                >
                  {step.description}
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
        className="lg:mx-24 mx-4 py-20 bg-primary-500 rounded-3xl my-16"
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
              to={user ? "/dashboard" : "/signup"}
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

export default Home;