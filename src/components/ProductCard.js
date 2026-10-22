
import Image from "next/image";
import styles from "./product.module.css";

export default function ProductCard({ product, showImage = true }) {
  const price = Number(product?.price || 0);

  const originalPrice = Number(
    product?.original_price ?? product?.originalPrice ?? 0
  );

  const hasDiscount =
    originalPrice > price && price >= 0;

  const discount = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  return (
    <article className={styles.productCard}>
      {showImage && (
        <div className={styles.imageContainer}>
          <Image
            src={product.image}
            alt={product.name || "Chicken dish"}
            fill
            sizes="(max-width: 850px) 50vw, (max-width: 1200px) 33vw, 25vw"
            style={{ objectFit: "cover" }}
            quality={75}
          />

          {hasDiscount && (
            <span className={styles.discountBadge}>
              {discount}% OFF
            </span>
          )}
        </div>
      )}

      <div className={styles.content}>
        {product.category && (
          <span className={styles.category}>{product.category}</span>
        )}

        <h3 className={styles.productName}>
          {product.name}
        </h3>

        <p className={styles.description}>
          {product.description}
        </p>

        <div className={styles.priceBox}>
          <strong className={styles.price}>
            ₹{price.toFixed(2)}
          </strong>

          {hasDiscount && (
            <span className={styles.originalPrice}>
              ₹{originalPrice.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}