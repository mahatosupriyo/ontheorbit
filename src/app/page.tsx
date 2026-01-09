import FAQSection from "@/components/layout/faq/faqsection";
import styles from "./home.module.scss";
import { FAQ_DATA } from "@/server/lib/faq";


export default async function HomePage() {
  return (
    <div className={styles.container}>
      <FAQSection items={FAQ_DATA} defaultOpenId={1} />
    </div>
  );
}