import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import styles from "../styles/module/Products.module.css";

export default function FoodGrid({ showImages = true }) {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetch("/data/products.json")
            .then((res) => res.json())
            .then(setProducts);
    }, []);

    return (
        <div className={`${styles.foodGrid} ${showImages ? "" : styles.textOnlyGrid}`}>
            {products.map((product) => (
                <ProductCard key={product.id} product={product} showImage={showImages} />
            ))}
        </div>
    );
}
