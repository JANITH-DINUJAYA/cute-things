import ShopPage from '../page';

export const metadata = {
  title: 'Shop by Category',
};

// Re-use the same ShopPage component — params.category is passed through
export default function CategoryPage({ params }) {
  return <ShopPage params={params} />;
}

export async function generateStaticParams() {
  return [
    { category: 'plush-toys'    },
    { category: 'accessories'   },
    { category: 'gifts'         },
    { category: 'anime-plushies'},
  ];
}
