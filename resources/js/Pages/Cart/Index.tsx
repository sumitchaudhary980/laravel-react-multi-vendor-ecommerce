import React, { useState } from 'react';

import { CartItem } from '@/Components/App/CartItem';
import { CurrencyFormatter } from '@/Components/Core/CurrencyFormatter';
import PrimaryButton from '@/Components/Core/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
  Address,
  GroupedCartItems,
  PageProps,
} from '@/types';
import { CreditCardIcon } from '@heroicons/react/20/solid';
import {
  Head,
  Link,
} from '@inertiajs/react';

// ErrorBoundary Component
class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): { hasError: boolean } {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error("Error caught in Error Boundary:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return <h1>Something went wrong. Please try again later.</h1>;
        }

        return this.props.children;
    }
}
function Index({
    csrf_token,
    cartItems,
    totalQuantity,
    totalPrice,
    isAuthenticated,
    isEmailVerified,
    addresses = [],
}: PageProps<{
    cartItems: Record<number, GroupedCartItems>;
    isAuthenticated: boolean;
    isEmailVerified: boolean;
    addresses?: Address[];
}>) {
    const [selectedAddress, setSelectedAddress] = useState(
        addresses.find((address) => address.isDefault) || addresses[0]
    );
    const [showAddressModal, setShowAddressModal] = useState(false);
    const isCartEmpty = Object.keys(cartItems).length === 0;
    const isDisabled =
        isCartEmpty || !isAuthenticated || isEmailVerified || !selectedAddress;

    return (
        <ErrorBoundary>
            <AuthenticatedLayout>
                <Head title="Your Cart" />

                {/* Address Selection Modal */}
                <dialog open={showAddressModal} className="modal modal-middle">
                    <div className="modal-box max-w-2xl">
                        <h3 className="font-bold text-lg mb-4">
                            Select a shipping address
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {addresses.length > 0 ? (
                                addresses.map((address) => (
                                    <div
                                        key={address.id}
                                        className={`card bg-base-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
                                            selectedAddress.id === address.id
                                                ? "ring-2 ring-primary"
                                                : ""
                                        }`}
                                    >
                                        <div className="card-body p-4">
                                            <label className="flex items-center cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    value={address.id}
                                                    checked={
                                                        selectedAddress.id ===
                                                        address.id
                                                    }
                                                    onChange={() =>
                                                        setSelectedAddress(
                                                            address
                                                        )
                                                    }
                                                    className="radio radio-primary mr-2"
                                                />
                                                <div>
                                                    <h4 className="card-title text-sm">
                                                        {address.full_name}
                                                    </h4>
                                                    <p className="text-sm">
                                                        {address.address_line_1}
                                                        <br />
                                                        {address.address_line_2 && (
                                                            <>
                                                                {
                                                                    address.address_line_2
                                                                }
                                                                <br />
                                                            </>
                                                        )}
                                                        {address.city},{" "}
                                                        {address.state}{" "}
                                                        {address.zip_code}{" "}
                                                        <br />
                                                        {address.country}
                                                    </p>
                                                    <div className="text-xs mt-2 text-gray-500">
                                                        {
                                                            address.delivery_instruction
                                                        }
                                                    </div>
                                                </div>
                                            </label>
                                            {address.isDefault == true && (
                                                <div className="absolute top-2 right-2 text-xs text-green-500">
                                                    Default
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-sm text-gray-500">
                                    No addresses available.
                                    <Link
                                        href={route("address.show")}
                                        className="link link-primary"
                                    >
                                        Manage addresses
                                    </Link>
                                </div>
                            )}
                        </div>

                        <div className="modal-action justify-between mt-6">
                            <Link
                                href={route("address.show")}
                                className="link link-primary text-sm"
                            >
                                Manage addresses
                            </Link>
                            <div className="space-x-2">
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => setShowAddressModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setShowAddressModal(false)}
                                >
                                    Select
                                </button>
                            </div>
                        </div>
                    </div>
                </dialog>

                <div className="container mx-auto p-4 sm:p-8 flex flex-col lg:flex-row gap-4">
                    {/* Cart Section */}
                    <div className="card flex-1 bg-base-200 lg:min-w-[260px]">
                        <div className="card-body">
                            <h2 className="text-lg font-bold">Shopping Cart</h2>

                            <div className="my-4">
                                {isCartEmpty && (
                                    <div className="py-2 text-gray-500 text-center">
                                        You don't have any items yet.
                                    </div>
                                )}
                                {Object.values(cartItems).map((cartItem) => (
                                    <div key={cartItem.user.id}>
                                        <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-gray-300 mb-4">
                                            <Link
                                                href="/"
                                                className="underline text-sm sm:text-base"
                                            >
                                                {cartItem.user.name}
                                            </Link>
                                            <div className="mt-2 sm:mt-0">
                                                <form
                                                    action={route(
                                                        "cart.checkout"
                                                    )}
                                                    method="post"
                                                >
                                                    <input
                                                        type="hidden"
                                                        name="_token"
                                                        value={csrf_token}
                                                    />
                                                    <input
                                                        type="hidden"
                                                        name="vendor_id"
                                                        value={cartItem.user.id}
                                                    />
                                                    <button
                                                        className="btn btn-sm btn-ghost flex items-center gap-2"
                                                        disabled={isDisabled}
                                                    >
                                                        <CreditCardIcon className="w-4 h-4" />
                                                        Pay Only for this seller
                                                    </button>
                                                </form>
                                            </div>
                                        </div>
                                        {cartItem.items.map((item) => (
                                            <CartItem
                                                item={item}
                                                key={item.id}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Address and Checkout Section */}
                    <div className="flex flex-col lg:w-1/3 gap-4">
                        {/* Shipping Address */}
                        <div className="card bg-base-200 p-4">
                            <h3 className="font-bold text-lg mb-2">
                                Shipping Address
                            </h3>
                            <div className="bg-base-100 p-4 rounded-lg">
                                {selectedAddress ? (
                                    <>
                                        <p className="font-semibold">
                                            {selectedAddress.full_name}
                                        </p>
                                        <p>{selectedAddress.address_line_1}</p>
                                        <p>
                                            {selectedAddress.address_line_2 && (
                                                <p>
                                                    {
                                                        selectedAddress.address_line_2
                                                    }
                                                </p>
                                            )}
                                        </p>
                                        <p>
                                            {selectedAddress.city},{" "}
                                            {selectedAddress.state}{" "}
                                            {selectedAddress.zip_code},{" "}
                                        </p>
                                        <p>{selectedAddress.country}</p>
                                        <p className="mt-2 text-sm text-gray-500">
                                            {selectedAddress.delivery_instruction ||
                                                "No instructions"}
                                        </p>
                                        <button
                                            onClick={() =>
                                                setShowAddressModal(true)
                                            }
                                            className="btn btn-link btn-sm p-0 text-primary hover:no-underline mt-2"
                                        >
                                            Change Address
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center">
                                        <Link
                                            href={route("address.show")}
                                            className="link link-primary"
                                        >
                                            Manage addresses
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Checkout Button */}
                        <div className="card bg-base-200 p-4">
                            <form action={route("cart.checkout")} method="post">
                                <input
                                    type="hidden"
                                    name="_token"
                                    value={csrf_token}
                                />
                                <input
                                    type="hidden"
                                    name="address_id"
                                    value={selectedAddress?.id}
                                />
                                <PrimaryButton
                                    className="rounded-full w-full flex items-center gap-2 justify-center"
                                    disabled={isDisabled}
                                >
                                    <CreditCardIcon className="w-4 h-4" />
                                    Proceed to checkout
                                </PrimaryButton>
                            </form>
                            <p className="text-lg font-bold mt-2">
                                Subtotal ({totalQuantity} items):{" "}
                                <CurrencyFormatter amount={totalPrice} />
                            </p>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        </ErrorBoundary>
    );
}

export default Index;
