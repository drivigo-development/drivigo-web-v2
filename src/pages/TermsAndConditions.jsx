import React from 'react';
import { motion } from 'framer-motion';

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

function TermsAndConditions() {
  // Scroll to top on component mount
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-secondary-900">
      {/* Hero Section */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="bg-gradient-to-br from-primary-50 dark:from-primary-900 to-secondary-50 dark:to-secondary-900 py-20"
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-primary-600 dark:text-primary-400"
            variants={fadeIn}
          >
            Terms and Conditions
          </motion.h1>
          <motion.p 
            variants={fadeIn}
            className="text-xl text-secondary-600 dark:text-secondary-400 leading-relaxed max-w-2xl mx-auto"
          >
            Last updated: August 10, 2025
          </motion.p>
        </div>
      </motion.section>

      {/* Terms and Conditions Content */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="py-16 px-4"
      >
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            variants={fadeIn}
            className="prose prose-lg dark:prose-invert prose-headings:text-primary-600 dark:prose-headings:text-primary-400 prose-a:text-primary-600 dark:prose-a:text-primary-400 max-w-none"
          >
            <h2 className="text-2xl font-bold mt-8 mb-4 text-primary-600 dark:text-primary-400">1. Introduction</h2>
            <p>
              These Terms and Conditions ("Terms") govern your use of the Drivigo mobile application ("App"), 
              operated by Drivigo Training Private Limited ("Drivigo," "we," "us," or "our"). By downloading, 
              accessing, or using our App, you agree to be bound by these Terms. If you disagree with any part 
              of these Terms, you may not access the App.
            </p>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-primary-600 dark:text-primary-400">2. Definitions</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>"Service" refers to the App and all related services provided by Drivigo</li>
              <li>"User" refers to learners seeking driving instruction</li>
              <li>"Instructor" refers to driving instructors registered on the platform</li>
              <li>"Lesson" refers to a driving instruction session</li>
              <li>"Content" refers to all information, text, graphics, and materials available on the App</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-primary-600 dark:text-primary-400">3. Account Registration</h2>
            
            <h3 className="text-xl font-bold mt-6 mb-3 text-primary-600 dark:text-primary-400">3.1 User Eligibility</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>While there is no minimum age requirement to use the App, users must meet the minimum age requirements as per local driving laws to book lessons</li>
              <li>Users must possess a valid learner's permit/license as required by local regulations</li>
              <li>Users must have the legal capacity to enter into binding contracts</li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3 text-primary-600 dark:text-primary-400">3.2 Account Creation</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Users must provide accurate, current, and complete information</li>
              <li>Required information includes but is not limited to:
                <ul className="list-disc pl-6 mt-2">
                  <li>Full legal name</li>
                  <li>Valid email address</li>
                  <li>Phone number</li>
                  <li>Current address</li>
                  <li>Valid learner's permit/license</li>
                  <li>Profile photo (if required)</li>
                </ul>
              </li>
              <li>Users are responsible for maintaining the confidentiality of their account credentials</li>
              <li>Users must immediately notify us of any unauthorized use of their account</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-primary-600 dark:text-primary-400">4. User Responsibilities</h2>
            
            <h3 className="text-xl font-bold mt-6 mb-3 text-primary-600 dark:text-primary-400">4.1 General Conduct</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Comply with all applicable traffic and driving laws</li>
              <li>Follow instructor directions during lessons</li>
              <li>Maintain appropriate behavior toward instructors and staff</li>
              <li>Provide accurate medical information that may affect driving ability</li>
              <li>Arrive on time for scheduled lessons</li>
              <li>Maintain appropriate personal hygiene and attire</li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3 text-primary-600 dark:text-primary-400">4.2 Prohibited Activities</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sharing account credentials</li>
              <li>Providing false or misleading information</li>
              <li>Harassment or abuse of instructors or staff</li>
              <li>Using the service for illegal activities</li>
              <li>Attempting to manipulate ratings or reviews</li>
              <li>Sharing instructor contact information outside the platform</li>
              <li>Recording lessons without explicit consent</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-primary-600 dark:text-primary-400">5. Booking and Services</h2>
            
            <h3 className="text-xl font-bold mt-6 mb-3 text-primary-600 dark:text-primary-400">5.1 Lesson Booking</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Users must book lessons through the App</li>
              <li>Booking confirmation is subject to instructor availability</li>
              <li>Pick-up and drop-off locations must be within service areas</li>
              <li>Minimum notice periods apply for bookings</li>
              <li>Users must verify lesson details before confirmation</li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3 text-primary-600 dark:text-primary-400">5.2 Service Delivery</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Lessons will be conducted in the instructor's vehicle</li>
              <li>Duration and scope as specified in booking</li>
              <li>Instructor may refuse service if user appears unfit to drive</li>
              <li>Service may be affected by weather conditions</li>
              <li>GPS tracking may be used during lessons</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-primary-600 dark:text-primary-400">6. Payments</h2>
            
            <h3 className="text-xl font-bold mt-6 mb-3 text-primary-600 dark:text-primary-400">6.1 Pricing</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>All fees are clearly displayed before booking</li>
              <li>Prices may vary based on location, duration, and timing</li>
              <li>Additional charges may apply for extended distances</li>
              <li>Platform fees and taxes will be itemized</li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3 text-primary-600 dark:text-primary-400">6.2 Payment Terms</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Payment required at time of booking</li>
              <li>Accepted payment methods as specified in the App</li>
              <li>All transactions processed through secure third-party providers</li>
              <li>Users responsible for any payment processing fees</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-primary-600 dark:text-primary-400">7. Cancellations</h2>
            
            <h3 className="text-xl font-bold mt-6 mb-3 text-primary-600 dark:text-primary-400">7.1 User Cancellations</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Free cancellation until instructor arrival</li>
              <li>Cancellation fees apply after instructor arrival</li>
              <li>Minimum notice periods for rescheduling</li>
              <li>No-show fees apply</li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3 text-primary-600 dark:text-primary-400">7.2 Instructor Cancellations</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Users will be notified immediately</li>
              <li>Full refund or free rescheduling offered</li>
              <li>Alternative instructor may be provided when available</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-primary-600 dark:text-primary-400">8. Liability</h2>
            
            <h3 className="text-xl font-bold mt-6 mb-3 text-primary-600 dark:text-primary-400">8.1 Limitation of Liability</h3>
            <p>Drivigo not liable for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Accidents during lessons</li>
              <li>Personal injury or property damage</li>
              <li>Loss of personal belongings</li>
              <li>Third-party payment processing issues</li>
              <li>Service interruptions</li>
              <li>Maximum liability limited to fees paid</li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3 text-primary-600 dark:text-primary-400">8.2 Insurance</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Users covered under instructor's insurance during lessons</li>
              <li>Additional insurance requirements as per local regulations</li>
              <li>Users responsible for any deductibles</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-primary-600 dark:text-primary-400">9. Privacy and Data</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Data collection and use governed by Privacy Policy</li>
              <li>User data shared only with assigned instructor</li>
              <li>Documentation stored securely</li>
              <li>Third-party service providers may access necessary data</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-primary-600 dark:text-primary-400">10. Intellectual Property</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All App content owned by Drivigo</li>
              <li>Users granted limited license to use App</li>
              <li>No reproduction or distribution without permission</li>
              <li>User feedback may be used without compensation</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-primary-600 dark:text-primary-400">11. Termination</h2>
            
            <h3 className="text-xl font-bold mt-6 mb-3 text-primary-600 dark:text-primary-400">11.1 User Termination</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Users may delete account at any time</li>
              <li>Outstanding payments must be settled</li>
              <li>Certain data retained as required by law</li>
            </ul>

            <h3 className="text-xl font-bold mt-6 mb-3 text-primary-600 dark:text-primary-400">11.2 Drivigo Termination Rights</h3>
            <p>May suspend or terminate accounts for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Terms violation</li>
              <li>Fraudulent activity</li>
              <li>Safety concerns</li>
              <li>Extended inactivity</li>
              <li>Legal requirements</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-primary-600 dark:text-primary-400">12. Modifications</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Terms may be modified at any time</li>
              <li>Users notified of significant changes</li>
              <li>Continued use constitutes acceptance</li>
              <li>Regular review of Terms recommended</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-primary-600 dark:text-primary-400">13. Governing Law</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Terms governed by Indian law</li>
              <li>Disputes subject to exclusive jurisdiction of Delhi courts</li>
              <li>Mandatory arbitration for certain disputes</li>
            </ul>

            <h2 className="text-2xl font-bold mt-8 mb-4 text-primary-600 dark:text-primary-400">14. Contact Information</h2>
            <p>For questions about these Terms:</p>
            <ul className="list-none pl-0 space-y-2">
              <li><strong>Email:</strong> <a href="mailto:contact@drivigo.in" className="text-primary-600 dark:text-primary-400 hover:underline">contact@drivigo.in</a></li>
              <li><strong>Address:</strong> Najafgarh, New Delhi, South West Delhi- 110043, Delhi</li>
              <li><strong>Phone:</strong> 9205620971, 8076685233</li>
            </ul>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}

export default TermsAndConditions;
