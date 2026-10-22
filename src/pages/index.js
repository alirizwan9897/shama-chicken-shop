import FoodGrid from "../components/FoodGrid";
import styles from "../styles/module/Home.module.css";

export default function Home() {
  return (
    <section className={styles.homePage}>
      <div className={styles.heroCopy}>
        <p className={styles.kicker}>Freshly cooked, every day</p>
        <h1>
          Welcome to <span>Crispy Chicken Corner</span>
        </h1>
        <p className={styles.subtitle}>
          Delicious, freshly cooked chicken and your favourite meals.
        </p>
      </div>
      <FoodGrid showImages={false} />
    </section>
  );
}