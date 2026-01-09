export interface FAQItem {
    id: string | number;
    question: string;
    answer: string;
}

export const FAQ_DATA: FAQItem[] = [
  {
    id: 1,
    question: "Is the .com domain included?",
    answer:
      "Yes. On day one, we secure yourname.com (or the closest available option). The domain is registered in your name for one year. Ownership is entirely yours."
  },
  {
    id: 2,
    question: "Eighteen months feels like a commitment.",
    answer:
      "Many people invest four years in education that struggles to keep pace with reality. This is an eighteen months investment in skills designed for the world you will work in.\n\nThe time will pass either way. This is about choosing intention over default."
  },
  {
    id: 3,
    question: "Is the mountain experience fully covered?",
    answer:
      "Yes. As part of the Voyager Fellowship, your travel*, accommodation, and meals are fully sponsored.\n\nWe believe space, silence, and scenery unlock deeper focus and better work."
  },
  {
    id: 4,
    question: "Is there a refund option?",
    answer:
      "Yes. You have a one week trial period to experience the fellowship.\n\nRefunds are available provided no perks have been claimed. Once assets such as domains are purchased on your behalf, those costs are non-reversible."
  }
];
