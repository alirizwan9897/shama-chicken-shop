export function getServerSideProps() {
  return {
    redirect: {
      destination: "/products",
      permanent: false,
    },
  };
}

export default function Home() {
  return null;
}