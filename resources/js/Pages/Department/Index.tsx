import React from 'react';

import ProductItem from '@/Components/App/ProductItem';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
  Department,
  PageProps,
  PaginationProps,
  Product,
} from '@/types';
import { Head } from '@inertiajs/react';

function Index({
    appName,
    department,
    products,
}: PageProps<{
    department: Department;
    products: PaginationProps<Product>;
}>) {
    return (
        <AuthenticatedLayout>
            <Head>
                <title>{department.name}</title>
                <meta name="title" content={department.meta_title}></meta>
                <link
                    rel="canonical"
                    href={route("product.byDepartment", department.slug)}
                ></link>

                <meta property="og:title" content={department.name}></meta>
                <meta
                    property="og:description"
                    content={department.meta_description}
                ></meta>
                <meta
                    property="og:url"
                    content={route("product.byDepartment", department.slug)}
                ></meta>
                <meta property="og:type" content="website"></meta>
                <meta property="og:site_name" content={appName}></meta>
            </Head>

            <div className="bg-base-200 container mx-auto">
                <div className="hero bg-base-200 min-h-[120px]">
                    <div className="hero-content text-center">
                        <div className="max-w-lg">
                            <h1 className="text-5xl font-bold">
                                {department.name}
                            </h1>
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
                <div className="bg-base-200 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 p-8 ">
                    {products.data.map((product) => {

                        return (
                            <ProductItem product={product} key={product.id} />
                        );
                    })}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
export default Index;
