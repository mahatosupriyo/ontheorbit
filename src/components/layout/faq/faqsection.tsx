"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FAQItem } from '@/server/lib/faq';
import styles from './faqsection.module.scss';
import Icon from '@/components/atoms/icons/icons';

const ANIMATION_CONFIG = {
    duration: 0.3,
    ease: [0.04, 0.62, 0.23, 0.98]
};

interface AccordionItemProps {
    item: FAQItem;
    isOpen: boolean;
    onToggle: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ item, isOpen, onToggle }) => {
    return (
        <div className={`${styles.item} ${isOpen ? styles.open : ''}`}>
            <button
                className={styles.header}
                onClick={onToggle}
                aria-expanded={isOpen}
            >
                <span className={styles.question}>{item.question}</span>
                <motion.div
                    className={styles.icon}
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={ANIMATION_CONFIG}
                >
                    <Icon name="downarrow" size={18} fill="#000000" />
                </motion.div>
            </button>

            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        key={`content-${item.id}`}
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            // REMOVED OPACITY: This keeps text fully visible "behind" the mask
                            open: { height: "auto" },
                            collapsed: { height: 0 }
                        }}
                        transition={ANIMATION_CONFIG}
                        className={styles.body}
                    >
                        <div className={styles.inner}>
                            {item.answer.split('\n').map((line, i) => (
                                <React.Fragment key={i}>
                                    {line}
                                    {i !== item.answer.split('\n').length - 1 && <br />}
                                </React.Fragment>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

interface FAQSectionProps {
    items: FAQItem[];
    defaultOpenId?: string | number;
}

const FAQSection: React.FC<FAQSectionProps> = ({ items, defaultOpenId }) => {
    const [openId, setOpenId] = useState<string | number | null>(defaultOpenId || null);

    const handleToggle = (id: string | number) => {
        setOpenId(prev => (prev === id ? null : id));
    };

    return (
        <section className={styles.wrapper}>
            <div className={styles.container}>
                <div className={styles.info}>
                    <h2 className={styles.headline}>
                        Have questions?
                        <br />
                        Find answers.
                    </h2>
                    {/* 
                    <Button
                        variant="secondary"
                        style={{ textWrap: 'nowrap', color: '#fff', background: '#000', borderRadius: '1.6rem', fontSize: '1.4rem', padding: '1.4rem 1rem', fontWeight: 600 }}
                        className={styles.cta}>
                        Schedule call
                        <Icon name="reqcall" size={16} fill="#FFFFFF" />
                    </Button> */}
                </div>

                <div className={styles.list}>
                    {items.map((item) => (
                        <AccordionItem
                            key={item.id}
                            item={item}
                            isOpen={openId === item.id}
                            onToggle={() => handleToggle(item.id)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FAQSection;