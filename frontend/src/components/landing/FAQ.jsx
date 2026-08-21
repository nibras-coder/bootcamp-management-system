import { useState } from "react";

const faqs = [
  {
    question: "Who can join the bootcamp?",
    answer: "Any ASTU student with a valid ASTU email can register.",
  },
  {
    question: "Is the bootcamp free?",
    answer: "Yes, it's completely free for all enrolled students.",
  },
  {
    question: "How long does it take?",
    answer: "The bootcamp runs for 3 weeks, full-time.",
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="max-w-4xl mx-auto px-6 py-16">
      <h2 className="text-3xl font-bold text-teal-900 mb-8">
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={faq.question}
            className="border border-gray-200 rounded-xl p-5 cursor-pointer"
            onClick={() => toggle(index)}
          >
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-teal-900">{faq.question}</h3>
              <span className="text-teal-700">
                {openIndex === index ? "−" : "+"}
              </span>
            </div>
            {openIndex === index && (
              <p className="text-gray-600 mt-3">{faq.answer}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default FAQ;