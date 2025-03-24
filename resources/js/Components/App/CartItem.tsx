import { useState } from 'react';

import { productRoute } from '@/helpers';
import { CartItem as CartItemType } from '@/types';
import {
  Link,
  router,
  useForm,
} from '@inertiajs/react';

import { CurrencyFormatter } from '../Core/CurrencyFormatter';
import TextInput from '../Core/TextInput';

function CartItem({ item }: { item: CartItemType }) {
    const deleteForm = useForm({
        option_ids: item.option_ids,
    });

    const { post } = useForm();


    const [error, setError] = useState("");

    const onDeleteClick = () => {
        deleteForm.delete(route("cart.destroy", item.product_id), {
            preserveScroll: true,
        });
    };

    const onSaveLater = () => {
        post(route("cart.savelater", item.id), {
            preserveScroll: true,
            preserveState: true,
        });
    };

    const handleQuantityChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        setError("");
        router.put(
            route("cart.update", item.product_id),
            {
                quantity: ev.target.value,
                option_ids: item.option_ids,
            },
            {
                preserveScroll: true,
                onError: (errors) => {
                    setError(Object.values(errors)[0]);
                },
            }
        );
    };

    return (
        <>
            <div className="flex flex-col lg:flex-row gap-6 p-3">
                <Link
                    href={productRoute(item)}
                    className="w-full sm:w-32 sm:min-w-32 sm:min-h-32 flex justify-center self-start"
                >
                    <img
                        src={item.image}
                        alt={item.title}
                        className="max-w-full max-h-full"
                    />
                </Link>
                <div className="flex-1 flex flex-col">
                    <h3 className="mb-3 text-sm font-semibold">
                        <Link href={productRoute(item)}>{item.title}</Link>
                    </h3>
                    <div className="text-xs">
                        {item.options.map((option) => (
                            <div key={option.id}>
                                <strong>{option.type.name}:</strong>{" "}
                                {option.name}
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-center mt-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm">Quantity:</span>
                            <TextInput
                                type="number"
                                defaultValue={item.quantity}
                                onBlur={handleQuantityChange}
                                className="input-sm w-16"
                            />
                            <button
                                onClick={onDeleteClick}
                                className="btn btn-sm btn-ghost text-red-500 hover:underline"
                            >
                                Delete
                            </button>
                            {/* Conditional rendering based on saved_for_later */}
                            {item.saved_for_later == true ? (
                                <span className="text-sm text-gray-500">
                                    Already saved for later
                                </span>
                            ) : (
                                <button
                                    onClick={onSaveLater}
                                    className="btn btn-sm btn-ghost text-blue-500 hover:underline"
                                >
                                    Save for Later
                                </button>
                            )}
                        </div>
                        <div className="font-bold text-lg mt-2 sm:mt-0">
                            <CurrencyFormatter
                                amount={item.price * item.quantity}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div className="divider"></div>
        </>
    );
}

export { CartItem };
