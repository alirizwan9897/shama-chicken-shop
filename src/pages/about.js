import React from "react";
import styles from "./about.module.css";
function About() {
  return (
    <div className={styles.aboutPage}>
      <div className={styles.aboutHero}>
        <div className="container text-center">
          <h1>🍗 CRISPY CHICKEN CORNER</h1>
          <p>
            Serving authentic, delicious fried chicken with passion and excellence.
          </p>
        </div>
      </div>
      <div className="container py-5">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <img
              src="https://images.unsplash.com/photo-1626082927389-6cd097cdc46e?q=80&w=600&auto=format&fit=crop"
              alt="Fried Chicken"
              className="img-fluid rounded shadow"
            />
          </div>
          <div className="col-lg-6">
            <h2 className={styles.marginTop}>Who We Are</h2>
            <p className={styles.aboutText}>
              Crispy Chicken Corner is your ultimate destination for fresh,
              delicious fried chicken and authentic chicken preparations. We use
              premium quality chicken and secret spice blends to deliver mouth-watering
              flavors in every bite.
            </p>
            <button className="btn btn-primary">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default About;