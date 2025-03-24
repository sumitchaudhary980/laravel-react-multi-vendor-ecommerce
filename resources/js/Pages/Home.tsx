import ProductItem from '@/Components/App/ProductItem';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
  PageProps,
  PaginationProps,
  Product,
} from '@/types';
import { Head } from '@inertiajs/react';

export default function Home({
    products,
}: PageProps<{ products: PaginationProps<Product> }>) {
    return (

        <AuthenticatedLayout>
                     <Head title="Welcome" />

           {products.data.length === 0 && (
                    <div
                        className="bg-base-200 py-16 px-8 text-center text-gray-300 text-3xl"
                    >
                        No Products Found
                    </div>
                )}
            <div className="bg-base-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 p-8">
                {products?.data?.map((product) => (
                    <ProductItem product={product} key={product.id} />
                ))}
            </div>
        </AuthenticatedLayout>
    );
}
