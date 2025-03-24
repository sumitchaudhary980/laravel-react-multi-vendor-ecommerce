import ProductItem from '@/Components/App/ProductItem';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
  PageProps,
  PaginationProps,
  Product,
  Vendor,
} from '@/types';
import { Head } from '@inertiajs/react';

export default function Profile({
    vendor,
    products,
}: PageProps<{ vendor: Vendor; products: PaginationProps<Product> }>) {
    return (
        <AuthenticatedLayout>
            <Head title={vendor.store_name + "Profile Page"} />
            <div
                className="hero min-h-[320px]"
                style={{
                    backgroundImage:
                        "url(https://img.daisyui.com/images/stock/photo-1507358522600-9f71e620c44e.webp)",
                }}
            >
                <div className="hero-overlay"></div>
                <div className="hero-content text-neutral-content text-center">
                    <div className="max-w-md">
                        <h1 className="mb-5 text-5xl font-bold">{vendor.store_name}</h1>

                    </div>
                </div>
            </div>
            {products.data.length === 0 && (
                    <div
                        className={
                            "bg-base-200 py-16 px-8 text-center text-gray-300  text-3xl"
                        }
                    >
                        No Products Found
                    </div>
                )}
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 p-8">
                {products?.data?.map((product) => (
                    <ProductItem product={product} key={product.id} />
                ))}
            </div>
        </AuthenticatedLayout>
    );
}
