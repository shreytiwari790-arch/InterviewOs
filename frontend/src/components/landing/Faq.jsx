import { useState } from 'react';
import { Plus } from 'lucide-react';
import { faqs } from '../../content/marketing';
import { cn } from '../../utils/cn';
import { SectionHeading } from './SectionHeading';

export function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="bg-slate-50/70 py-24 sm:py-28">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <SectionHeading eyebrow="FAQ" title="Questions, answered" />
        <div className="mt-12 divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white">
          {faqs.map(({ question, answer }, index) => {
            const isOpen = openIndex === index;
            return (
              <div key={question}>
                <h3>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left text-[15px] font-medium text-ink-900 sm:px-8"
                  >
                    {question}
                    <Plus
                      className={cn(
                        'size-5 shrink-0 text-brand-600 transition-transform duration-200',
                        isOpen && 'rotate-45',
                      )}
                      aria-hidden="true"
                    />
                  </button>
                </h3>
                <div
                  className={cn(
                    'grid transition-[grid-template-rows] duration-300',
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  )}
                >
                  <p className="overflow-hidden px-6 text-sm leading-relaxed text-ink-500 sm:px-8">
                    <span className="block pb-6">{answer}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
