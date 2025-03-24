import {
  useEffect,
  useMemo,
  useState,
} from 'react';

import Carousel from '@/Components/Core/Carousel';
import { CurrencyFormatter } from '@/Components/Core/CurrencyFormatter';
import { arraysAreEqual } from '@/helpers';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
  PageProps,
  Product,
  VariationTypeOption,
} from '@/types';
import {
  Head,
  Link,
  router,
  useForm,
  usePage,
} from '@inertiajs/react';

function Show({
    appName,
    product,
    variationOptions,
}: PageProps<{
    product: Product;
    variationOptions: number[];
}>) {
    const form = useForm<{
        option_ids: Record<string, number>;
        quantity: number;
        price: number | null;
    }>({
        option_ids: {},
        quantity: 1,
        price: null,
    });

    const { url } = usePage();

    const [selectedOptions, setSelectedOptions] = useState<
        Record<number, VariationTypeOption>
    >([]);

    const images = useMemo(() => {
        for (let typeId in selectedOptions) {
            const option = selectedOptions[typeId];
            if (option.images.length > 0) return option.images;
        }
        return product.images;
    }, [product, selectedOptions]);

    const computedProduct = useMemo(() => {
        const selectedOptionIds = Object.values(selectedOptions)
            .map((op) => op.id)
            .sort();

        for (let variation of product.variations) {
            const optionIds = variation.variation_type_option_ids.sort();
            if (arraysAreEqual(selectedOptionIds, optionIds)) {
                return {
                    price: variation.price,
                    quantity:
                        variation.quantity === null
                            ? Number.MAX_VALUE
                            : variation.quantity,
                };
            }
        }
        return {
            price: product.price,
            quantity: product.quantity,
        };
    }, [product, selectedOptions]);

    useEffect(() => {
        for (let type of product.variationTypes) {
            const selectedOptionId: number = variationOptions[type.id];
            chooseOption(
                type.id,
                type.options.find(
                    (op: { id: number }) => op.id == selectedOptionId
                ) || type.options[0],
                false
            );
        }
    }, []);

    const getOptionIdsMap = (newOptions: object) => {
        return Object.fromEntries(
            Object.entries(newOptions).map(([a, b]) => [a, b.id])
        );
    };

    const chooseOption = (
        typeId: number,
        option: VariationTypeOption,
        updateRouter: boolean = true
    ) => {
        setSelectedOptions((prevSelectedOptions) => {
            const newOptions = {
                ...prevSelectedOptions,
                [typeId]: option,
            };
            if (updateRouter) {
                router.get(
                    url,
                    {
                        options: getOptionIdsMap(newOptions),
                    },
                    {
                        preserveScroll: true,
                        preserveState: true,
                    }
                );
            }
            return newOptions;
        });
    };

    const onQuantityChange = (ev: React.ChangeEvent<HTMLSelectElement>) => {
        form.setData("quantity", parseInt(ev.target.value));
    };

    const addToCart = () => {
        form.post(route("cart.store", product.id), {
            preserveScroll: true,
            preserveState: true,
            onError: (err: any) => {
                console.log(err);
            },
        });
    };

    const renderProductVariationTypes: any = () => {
        return product.variationTypes.map((type, i) => {
            return (
                <div key={type.id}>
                    <b>{type.name}</b>
                    {type.type === "Image" && (
                        <div className="flex flex-wrap gap-2 mb-4">
                            {type.options.map((option: VariationTypeOption) => (
                                <div
                                    onClick={() =>
                                        chooseOption(type.id, option)
                                    }
                                    key={option.id}
                                    className={`flex items-center cursor-pointer ${
                                        selectedOptions[type.id]?.id ===
                                        option.id
                                            ? "outline outline-4 outline-primary"
                                            : ""
                                    }`}
                                >
                                    {option.images && (
                                        <img
                                            src={option.images[0].thumb}
                                            alt={option.name}
                                            className="w-[50px]"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    {type.type === "Radio" && (
                        <div className="flex flex-wrap join mb-4">
                            {type.options.map((option: VariationTypeOption) => (
                                <input
                                    onChange={() =>
                                        chooseOption(type.id, option)
                                    }
                                    key={option.id}
                                    className="join-item btn"
                                    type="radio"
                                    value={option.id}
                                    checked={
                                        selectedOptions[type.id]?.id ===
                                        option.id
                                    }
                                    name={"variation_type_" + type.id}
                                    aria-label={option.name}
                                />
                            ))}
                        </div>
                    )}
                </div>
            );
        });
    };

    const renderAddToCartButton = () => {
        // Check if the quantity is 0 to disable the button and show "Out of Stock"
        if (computedProduct.quantity === 0) {
            return (
                <div className="mb-8 flex flex-wrap gap-8">
                    <select
                        value={form.data.quantity}
                        onChange={onQuantityChange}
                        className="select select-bordered w-full md:w-auto"
                        disabled
                    >
                        <option value={0}>Quantity: 0</option>
                    </select>
                    <button className="btn btn-primary" disabled>
                        Out of Stock
                    </button>
                </div>
            );
        }

        return (
            <div className="mb-8 flex flex-wrap gap-8">
                <select
                    value={form.data.quantity}
                    onChange={onQuantityChange}
                    className="select select-bordered w-full md:w-auto"
                >
                    {Array.from({
                        length: Math.min(10, computedProduct.quantity),
                    }).map((el, i) => (
                        <option value={i + 1} key={i + 1}>
                            Quantity: {i + 1}
                        </option>
                    ))}
                </select>
                <button onClick={addToCart} className="btn btn-primary">
                    Add to Cart
                </button>
            </div>
        );
    };

    useEffect(() => {
        const idsMap = Object.fromEntries(
            Object.entries(selectedOptions).map(
                ([typeId, option]: [string, VariationTypeOption]) => [
                    typeId,
                    option.id,
                ]
            )
        );
        form.setData("option_ids", idsMap);
    }, [selectedOptions]);

    return (
        <AuthenticatedLayout>
            <Head>
                <title>{product.title}</title>
                <meta
                    name="title"
                    content={product.meta_title || product.title}
                ></meta>
                <link
                    rel="canonical"
                    href={route("product.show", product.slug)}
                ></link>

                <meta property="og:title" content={product.title}></meta>
                <meta
                    property="og:description"
                    content={product.meta_description}
                ></meta>
                <meta property="og:image" content={images[0]?.small}></meta>
                <meta
                    property="og:url"
                    content={route("product.show", product.slug)}
                ></meta>
                <meta property="og:type" content="website"></meta>
                <meta property="og:site_name" content={appName}></meta>
            </Head>
            <div className="container mx-auto p-4 md:p-8">
                <div className="grid gap-8 grid-cols-1 lg:grid-cols-12">
                    <div className="col-span-12 lg:col-span-7">
                        <Carousel images={images} />
                    </div>
                    <div className="col-span-12 lg:col-span-5">
                        <h1 className="text-2xl">{product.title}</h1>
                        <p className={"mb-8ve"}>
                            by{" "}
                            <Link
                                href={route(
                                    "vendor.profile",
                                    product.user.store_name
                                )}
                                className="hover:underline"
                            >
                                {product.user.store_name}
                            </Link>
                            &nbsp; in{" "}
                            <Link
                                href={route(
                                    "product.byDepartment",
                                    product.department.slug
                                )}
                                className="hover:underline"
                            >
                                {product.department.name}
                            </Link>
                        </p>
                        <div>
                            <div className="text-3xl font-semibold">
                                <CurrencyFormatter
                                    amount={computedProduct.price}
                                />
                            </div>
                        </div>

                        {renderProductVariationTypes()}
                        {computedProduct.quantity === 0 ? (
                            <div className="text-error my-4">
                                <span>Out of Stock</span>
                            </div>
                        ) : computedProduct.quantity < 5 ? (
                            <div className="text-red-500 mt-4">
                                Hurry, only {computedProduct.quantity} left in
                                stock!
                            </div>
                        ) : null}
                        {renderAddToCartButton()}
                        <b className="text-xl">About the Item</b>
                        <div
                            className="wysiwyg-output"
                            dangerouslySetInnerHTML={{
                                __html: product.description,
                            }}
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default Show;
