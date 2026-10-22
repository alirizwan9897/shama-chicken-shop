import FoodGrid from "../components/FoodGrid";

export default function Home() {
  return (
    <div style={{
      background: "linear-gradient(135deg, #fff3eb 0%, #ffe5d2 100%)",
      minHeight: "100vh",
      padding: "0 0 40px 0"
    }}>
      <div style={{
        textAlign: "center",
        padding: "48px 0 24px 0",
        color: "#c45114",
        fontFamily: "var(--site-font)",
        letterSpacing: "1px"
      }}>
        <h1 style={{ fontSize: "3rem", margin: 0, fontWeight: 800 }}>
          Welcome to <span style={{ color: "#f97316" }}>Crispy Chicken Corner</span>
        </h1>
        <p style={{ fontSize: "1.3rem", color: "#6b7280", margin: "18px 0 0 0" }}>
          Delicious, Freshly Cooked Chicken - Your Favorite Stop for Tasty Meals!
        </p>
      </div>
      <FoodGrid />
    </div>
  );
}