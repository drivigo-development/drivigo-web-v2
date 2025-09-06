import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Lessons from "../components/Lessons";

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
      description: "Book your preferred instructor and book your sessions",
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
      transition: { duration: 0.6 },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const slideIn = {
    hidden: { x: -60, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const features = [
    {
      image: "/verified.png",
      title: "Verified Instructors",
      description:
        "All our instructors are thoroughly verified and certified professionals",
    },
    {
      image: "/secure.png",
      title: "Secure Payments",
      description: "Safe and secure payment processing with multiple options",
    },
    {
      image: "/booking.png",
      title: "Easy Booking",
      description: "Book your lessons in just a few clicks from anywhere",
    },
    {
      image: "/quality.png",
      title: "Quality Training",
      description: "Comprehensive driving lessons tailored to your needs",
    },
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
                className="flex flex-col lg:flex-row lg:justify-start gap-4 justify-center lg:gap-6"
              >
                <motion.div
                  variants={fadeIn}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full lg:w-1/4 "
                >
                  <Link
                    to="/signup"
                    className="bg-primary-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200  mx-auto lg:mx-0 w-1/2 lg:w-full  flex justify-center items-center gap-2"
                  >
                   Book Now
                  </Link>
                </motion.div>
                {/* WhatsApp contact button */}
                <motion.a
                  href="https://wa.me/917303537421?text=I%20want%20to%20learn%20driving"
                  target="_blank"
                  rel="noopener noreferrer"
                  // variants={scaleIn}
                  // whileHover={{ scale: 1.03 }}
                  // whileTap={{ scale: 0.97 }}
                  className="btn-success mx-auto lg:mx-0 w-1/2 lg:w-auto bg-green-500 flex justify-center items-center gap-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Get in touch
                </motion.a>
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

      <Lessons />
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
          <motion.p variants={fadeIn} className="text-gray-500 mt-2">
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
                    whileInView={{ width: "100%", opacity: 1 }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
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
