import styles from "./garagecard.module.scss";

const GarageCards = () => {
    const cards = [
        {
            src: "https://plus.unsplash.com/premium_photo-1666264200782-8cc1096bb417?q=80&w=2487&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            link: "/",
            heading: "Spotify for Artists Tools",
            description: "Tangible resources you can leverage to turn listeners into fans.",
        },
        {
            src: "https://img.youtube.com/vi/g4XcSnJQd78/maxresdefault.jpg",
            link: "/",
            heading: "Music Industry Glossary: 80+ Terms Every Artist Should Know",
            description: "An alphabetical guide to the vocabulary of music.",
        },
        {
            src: "https://plus.unsplash.com/premium_photo-1671732135769-f4051b8a08f0?q=80&w=2487&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            link: "/",
            heading: "7 Ways to Increase Global Listenership",
            description: "From playlists to merch, these Spotify strategies can help build your presence around the world.",
        },
    ];

    return (
        <div className={styles.garagecardswraper}>
            <h1 className={styles.sectionhead}>Discover more</h1>
            <div className={styles.container}>
                <div className={styles.row}>
                    {cards.slice(0, 2).map((card, index) => (
                        <div key={index} className={styles.box}>
                            <a href={card.link}>
                                <img src={card.src} className={styles.imagebanner} alt={card.heading} />
                                <div className={styles.content}>
                                    <h3 className={styles.heading}>{card.heading}</h3>
                                    <p className={styles.description}>{card.description}</p>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>

    );
};

export default GarageCards;