import Image from 'next/image';
import styles from './product.module.css';
export default function ProductCard({ product }) {
  return (
    <div
      className={styles.productCard}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          "0 12px 25px rgba(212, 100, 43, 0.25)";
        e.currentTarget.style.transform = "translateY(-8px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow =
          "0 4px 15px rgba(212, 100, 43, 0.15)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div className={styles.imageContainer}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          style={{ objectFit: "cover" }}
          quality={85}
        />
      </div>
      <div className={styles.content}>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <strong>₹{product.price}</strong>
      </div>
    </div>
  );
}