import React from "react";
import { useNavigate } from "react-router-dom";

function TermsPage() {
  const navigate = useNavigate();

  return (
    <div className="page-shell container">
      <h1>Terms and Conditions</h1>
      <p className="page-intro">
        Please read these terms and conditions carefully before using the ASTU MSJ Bootcamp platform.
      </p>

      <div className="page-content max-w-4xl">
        <section className="space-y-6">
          <div className="info-card">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using the ASTU MSJ Bootcamp Management System, you accept and agree to be bound by the terms and conditions outlined in this agreement. If you do not agree to these terms, please do not use this platform.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">2. Eligibility</h2>
            <p className="mb-4">
              The bootcamp is open exclusively to students of Adama Science and Technology University (ASTU) who are members of the Muslim Students Jema'a (MSJ). By registering, you confirm that:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
              <li>You are a current student at ASTU</li>
              <li>You are a member of ASTU MSJ</li>
              <li>You have the time and commitment to complete the bootcamp requirements</li>
              <li>All information provided during registration is accurate and truthful</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8">3. User Accounts</h2>
            <p className="mb-4">
              When you create an account on our platform, you are responsible for:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
              <li>Maintaining the confidentiality of your password</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
              <li>Ensuring your contact information is current and accurate</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8">4. Bootcamp Participation</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6">4.1 Attendance</h3>
            <p className="mb-4">
              Students are expected to attend all scheduled sessions. Attendance will be tracked, and excessive absences may result in removal from the program.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.2 Assignments and Projects</h3>
            <p className="mb-4">
              Students must complete all assigned work and submit projects by the specified deadlines. Late submissions may affect your final evaluation.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-6">4.3 Code of Conduct</h3>
            <p className="mb-4">
              All participants must:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
              <li>Treat fellow students, mentors, and staff with respect</li>
              <li>Maintain Islamic ethics and adab in all interactions</li>
              <li>Refrain from plagiarism or academic dishonesty</li>
              <li>Respect the learning environment and avoid disruptive behavior</li>
              <li>Follow gender-appropriate interaction guidelines as per Islamic principles</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8">5. Intellectual Property</h2>
            <h3 className="text-xl font-semibold mb-3 mt-6">5.1 Course Materials</h3>
            <p className="mb-4">
              All learning resources, course materials, and content provided through the platform are the property of ASTU MSJ Bootcamp and its content creators. You may not:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
              <li>Reproduce or distribute course materials without permission</li>
              <li>Use materials for commercial purposes</li>
              <li>Share access credentials with non-enrolled individuals</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-6">5.2 Student Work</h3>
            <p className="mb-4">
              You retain ownership of the projects and code you create during the bootcamp. However, by submitting work through the platform, you grant ASTU MSJ Bootcamp a non-exclusive license to use your work for educational and promotional purposes.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">6. Privacy and Data Protection</h2>
            <p className="mb-4">
              We collect and process personal information as described in our Privacy Policy. By using this platform, you consent to such processing and warrant that all data provided is accurate.
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
              <li>Your personal information will be kept confidential</li>
              <li>We will not share your data with third parties without consent</li>
              <li>You have the right to access and update your information</li>
              <li>We implement security measures to protect your data</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8">7. Certification</h2>
            <p className="mb-4">
              Upon successful completion of the bootcamp requirements, students will receive an ASTU MSJ Bootcamp certificate. Certification requirements include:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
              <li>Maintaining satisfactory attendance (minimum 80%)</li>
              <li>Completing all assignments and assessments</li>
              <li>Successfully completing the capstone project</li>
              <li>Adhering to the code of conduct throughout the program</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8">8. Program Fees and Refunds</h2>
            <p className="mb-4">
              The ASTU MSJ Bootcamp is provided free of charge to all MSJ members. There are no tuition fees, registration fees, or hidden costs. As such, no refund policy is applicable.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">9. Termination</h2>
            <p className="mb-4">
              We reserve the right to suspend or terminate your access to the platform if you:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
              <li>Violate these terms and conditions</li>
              <li>Engage in dishonest or unethical behavior</li>
              <li>Fail to meet minimum attendance requirements</li>
              <li>Disrupt the learning environment</li>
              <li>Provide false information during registration</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8">10. Limitation of Liability</h2>
            <p className="mb-4">
              ASTU MSJ Bootcamp and its organizers, mentors, and staff shall not be liable for:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
              <li>Any direct, indirect, or consequential damages arising from platform use</li>
              <li>Loss of data or unauthorized access to your account</li>
              <li>Technical issues or service interruptions</li>
              <li>Employment outcomes or career advancement</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8">11. Platform Use</h2>
            <p className="mb-4">
              You agree to use the platform only for lawful purposes and in accordance with these terms. You shall not:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
              <li>Attempt to gain unauthorized access to any part of the platform</li>
              <li>Upload viruses or malicious code</li>
              <li>Interfere with other users' access to the platform</li>
              <li>Use automated systems to access the platform</li>
              <li>Impersonate others or misrepresent your identity</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8">12. Community Guidelines</h2>
            <p className="mb-4">
              Our platform includes community features such as forums and group discussions. When participating, you must:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
              <li>Be respectful and professional in all communications</li>
              <li>Refrain from hate speech, harassment, or discriminatory language</li>
              <li>Avoid sharing personal contact information publicly</li>
              <li>Report inappropriate behavior to administrators</li>
              <li>Uphold Islamic values in all interactions</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8">13. Modifications to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify these terms and conditions at any time. Changes will be effective immediately upon posting to the platform. Continued use of the platform after changes constitutes acceptance of the modified terms.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">14. Dispute Resolution</h2>
            <p className="mb-4">
              Any disputes arising from these terms or platform use shall be resolved through:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-2 ml-4">
              <li>Initial discussion with bootcamp administrators</li>
              <li>Mediation through ASTU MSJ leadership if necessary</li>
              <li>Final resolution according to Ethiopian law and Islamic principles</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8">15. Governing Law</h2>
            <p className="mb-4">
              These terms and conditions are governed by the laws of the Federal Democratic Republic of Ethiopia. Any legal proceedings shall be conducted in courts located in Adama, Ethiopia.
            </p>

            <h2 className="text-2xl font-bold mb-4 mt-8">16. Contact Information</h2>
            <p className="mb-4">
              For questions or concerns regarding these terms and conditions, please contact us at:
            </p>
            <ul className="list-none mb-4 space-y-2 ml-4">
              <li><strong>Email:</strong> hello@astumsj.org</li>
              <li><strong>Location:</strong> ASTU Main Campus, Adama, Ethiopia</li>
              <li><strong>Telegram:</strong> @ASTUMSJ_GROUP</li>
            </ul>

            <h2 className="text-2xl font-bold mb-4 mt-8">17. Acknowledgment</h2>
            <p className="mb-4">
              By registering for and participating in the ASTU MSJ Bootcamp, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.
            </p>

            <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                Bismillah ar-Rahman ar-Rahim. We ask Allah (SWT) to bless this endeavor and make it a means of benefit for all participants. May this bootcamp help you grow in knowledge, skill, and character.
              </p>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Register Now
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default TermsPage;
