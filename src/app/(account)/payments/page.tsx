"use client";
import Icon from "@/components/atoms/icons";
import styles from "./payments.module.scss";
export default function PaymentsPage() {
    return (
        <div className={styles.paymentspage}>
            <div className={styles.container}>
                <h1 className={styles.title}>
                    <div className={styles.logo}>
                    <Icon name="bill" size={40} />
                    </div>
                    Payments
                </h1>

                <div className={styles.table}>
                    <div className={styles.row}>
                        <div className={styles.cell}>
                            <div className={styles.data}>
                                <h2 className={styles.cost}><span className={styles.rupeesymbol}>₹</span>
                                    4599
                                </h2>
                                <h2 className={styles.description}>
                                    Orbit capsule
                                </h2>
                            </div>
                            <div className={styles.timing}>
                                <p className={styles.paidon}>Paid on</p>
                                <p className={styles.timestamp}>14/06/2004</p>
                            </div>
                        </div>


                        <h3 className={styles.paymentstatus}>
                            <span className={styles.g}></span>
                            Paid
                        </h3>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.cell}>
                            <div className={styles.data}>
                                <h2 className={styles.cost}><span className={styles.rupeesymbol}>₹</span>
                                    4599
                                </h2>
                                <h2 className={styles.description}>
                                    Orbit capsule
                                </h2>
                            </div>
                            <div className={styles.timing}>
                                <p className={styles.paidon}>Paid on</p>
                                <p className={styles.timestamp}>14/06/2004</p>
                            </div>
                        </div>


                        <h3 className={styles.paymentstatus}>
                            <span className={styles.g}></span>
                            Paid
                        </h3>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.cell}>
                            <div className={styles.data}>
                                <h2 className={styles.cost}><span className={styles.rupeesymbol}>₹</span>
                                    4599
                                </h2>
                                <h2 className={styles.description}>
                                    Orbit capsule
                                </h2>
                            </div>
                            <div className={styles.timing}>
                                <p className={styles.paidon}>Paid on</p>
                                <p className={styles.timestamp}>14/06/2004</p>
                            </div>
                        </div>


                        <h3 className={styles.paymentstatus}>
                            <span className={styles.r}></span>
                            Failed
                        </h3>
                    </div>
                </div>
            </div>
        </div>
    );
}