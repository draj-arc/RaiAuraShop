import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQPage() {
  const faqs = [
    {
      question: "What materials are used in your jewellery?",
      answer: "We use high-quality materials including sterling silver, 14k and 18k gold, rose gold, and ethically sourced gemstones. Each product listing specifies the exact materials used.",
    },
    {
      question: "Do you offer international shipping?",
      answer: "Yes, we ship across India! Shipping is free on orders over ₹999. For orders below ₹999, a flat rate of ₹99 applies.",
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for unworn items in their original condition. Custom or personalized pieces are non-returnable. Please see our Policies page for full details.",
    },
    {
      question: "How do I care for my jewellery?",
      answer: "Avoid contact with water, perfume, and chemicals. Store pieces in a cool, dry place when not in use. Clean gently with a soft, lint-free cloth. Specific care instructions are provided with each purchase.",
    },
    {
      question: "Do you offer gift wrapping?",
      answer: "Yes! All orders come beautifully packaged in our signature boxes. Gift wrapping and personalized messages are available at checkout at no extra charge.",
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping typically takes 5-7 business days. Express shipping (2-3 business days) is available at checkout. Orders are processed within 1-2 business days.",
    },
    {
      question: "Can I track my order?",
      answer: "Yes, you'll receive a tracking number via email once your order ships. You can also track your order status from your account dashboard.",
    },
    {
      question: "Do you offer custom or personalized jewellery?",
      answer: "We offer engraving services on select pieces. For custom designs, please contact us directly through our Contact page to discuss your vision.",
    },
  ];

  return (
    <div className="min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <h1 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-4 text-center">
          Frequently Asked Questions
        </h1>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          Find answers to common questions about our jewellery and services
        </p>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left" data-testid={`faq-question-${index}`}>
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground" data-testid={`faq-answer-${index}`}>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 p-8 bg-accent/20 rounded-lg text-center">
          <h3 className="font-serif text-2xl text-foreground mb-2">Still have questions?</h3>
          <p className="text-muted-foreground mb-4">
            Our customer service team is here to help
          </p>
          <a href="/contact" className="text-primary hover:underline">
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
