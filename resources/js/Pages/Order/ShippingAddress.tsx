import React, {
  ChangeEvent,
  useState,
} from 'react';

import Checkbox from '@/Components/Core/Checkbox';
import InputLabel from '@/Components/Core/InputLabel';
import NumberInput from '@/Components/Core/NumberInput';
import TextInput from '@/Components/Core/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
  Address,
  PageProps,
} from '@/types';
import { Button } from '@headlessui/react';
import {
  Head,
  Link,
} from '@inertiajs/react';

function ShippingAddress({
    csrf_token,
    address = [],
}: PageProps<{ address?: Address[] }>) {
    const [showModal, setShowModal] = useState(false);
    const [updateModal, setUpdateModal] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    const [formData, setFormData] = useState({
        full_name: "",
        phone_number: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        zip_code: "",
        country: "",
        delivery_instruction: "",
        is_default: false,
    });

    const handleInputChange = (
        e: ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleEditClick = (id: any) => {
        setSelectedId(id);
        setUpdateModal(true);
    };

    const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: checked }));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Shipping Address" />
            <div className="container mx-auto p-4 mt-6">
                <h1 className="text-2xl font-bold mb-4">Shipping Addresses</h1>

                {/* Address List */}
                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {/* First Row: Add Address Button */}
                    <div className="border p-4 rounded-lg flex justify-center items-center cursor-pointer">
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center justify-center text-xl text-blue-500 hover:text-blue-700"
                        >
                            <span className="mr-2">+</span> Add New Address
                        </button>
                    </div>

                    {/* Address List */}
                    {address.length > 0 ? (
                        address.map((address) => (
                            <div
                                key={address.id}
                                className="border p-4 rounded-lg bg-base dark:border-gray-700"
                            >
                                <div className="font-semibold">
                                    {address.full_name}
                                    {address.isDefault == true && (
                                        <span className="ml-2 text-green-500 text-sm">
                                            Default
                                        </span>
                                    )}
                                </div>
                                <div>{address.address_line_1}</div>
                                <div>{address.address_line_2}</div>
                                <div>
                                    {address.city}, {address.state}{" "}
                                    {address.zip_code}
                                </div>
                                <div>{address.country}</div>
                                <div>Phone Number: {address.phone_number}</div>

                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    {address.delivery_instruction}
                                </div>
                                <div className="mt-2">
                                    {/* Show "Make Default" only if it's not already the default */}
                                    {!address.isDefault && (
                                        <Link
                                            href={route(
                                                "address.default",
                                                address.id
                                            )}
                                            className="text-blue-500 hover:text-blue-700 mr-2"
                                        >
                                            Make Default
                                        </Link>
                                    )}
                                    <Button
                                        onClick={() =>
                                            handleEditClick(address.id)
                                        }
                                        className="text-green-500 hover:text-green-700 mr-2"
                                    >
                                        Edit
                                    </Button>
                                    <Link
                                        href={route(
                                            "address.delete",
                                            address.id
                                        )}
                                        className="text-red-500 hover:text-red-700 hover:cursor-pointer"
                                    >
                                        Delete
                                    </Link>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-gray-600 dark:text-gray-400">
                                No addresses found.
                            </p>
                        </div>
                    )}

                    {showModal && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-base dark:bg-gray-900 text-black dark:text-white p-6 rounded-lg shadow-lg w-[650px] max-h-[90vh] overflow-y-auto">
                                <h2 className="text-xl font-semibold mb-4">
                                    Add a new address
                                </h2>

                                {/* Form with Address Store Route */}
                                <form
                                    action={route("address.store")}
                                    method="POST"
                                >
                                    <input
                                        type="hidden"
                                        name="_token"
                                        value={csrf_token}
                                    />

                                    {/* Country */}
                                    <InputLabel
                                        htmlFor="country"
                                        value="Country"
                                    />

                                    <select
                                        id="country"
                                        name="country"
                                        required
                                        className="input input-bordered mt-1 block w-full"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">
                                            Select a country
                                        </option>
                                        <option value="USA">USA</option>
                                        <option value="India">India</option>
                                        <option value="UK">UK</option>
                                    </select>

                                    {/* Full Name & Phone */}
                                    <div className="flex gap-2">
                                        <div className="w-1/2">
                                            <InputLabel
                                                htmlFor="full-name"
                                                value="Full Name"
                                            />

                                            <TextInput
                                                id="full-name"
                                                name="full_name"
                                                required
                                                className="mt-1 block w-full"
                                                value={formData.full_name}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="w-1/2">
                                            <InputLabel
                                                htmlFor="phone-number"
                                                value="Phone Number"
                                            />

                                            <NumberInput
                                                id="phone-number"
                                                name="phone_number"
                                                required
                                                className="mt-1 block w-full"
                                                value={formData.phone_number}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Address Line 1 & 2 */}
                                    <div className="flex gap-2">
                                        <div className="w-1/2">
                                            <InputLabel
                                                htmlFor="address_line_1"
                                                value="Address Line 1"
                                            />

                                            <TextInput
                                                type="text"
                                                id="address_line_1"
                                                name="address_line_1"
                                                required
                                                className="mt-1 block w-full"
                                                value={formData.address_line_1}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="w-1/2">
                                            <InputLabel
                                                htmlFor="address_line_2"
                                                value="Address Line 2"
                                            />

                                            <TextInput
                                                type="text"
                                                id="address_line_2"
                                                name="address_line_2"
                                                className="mt-1 block w-full"
                                                value={formData.address_line_2}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    {/* City, State, Zip Code */}
                                    <div className="flex gap-2">
                                        <div className="w-1/3">
                                            <InputLabel
                                                htmlFor="city"
                                                value="City"
                                            />

                                            <TextInput
                                                type="text"
                                                id="city"
                                                name="city"
                                                required
                                                className="mt-1 block w-full"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="w-1/3">
                                            <InputLabel
                                                htmlFor="state"
                                                value="State"
                                            />

                                            <TextInput
                                                type="text"
                                                id="state"
                                                name="state"
                                                required
                                                className="mt-1 block w-full"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                            />
                                        </div>

                                        <div className="w-1/3">
                                            <InputLabel
                                                htmlFor="zip_code"
                                                value="Zip Code"
                                            />

                                            <TextInput
                                                type="text"
                                                id="zip_code"
                                                name="zip_code"
                                                required
                                                className="mt-1 block w-full"
                                                value={formData.zip_code}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>

                                    {/* Default Address */}
                                    <div className="mt-3 flex items-center">
                                        <Checkbox
                                            id="is_default"
                                            name="is_default"
                                            checked={formData.is_default}
                                            onChange={handleCheckboxChange}
                                        />
                                        <label
                                            htmlFor="is_default"
                                            className="text-sm mx-2"
                                        >
                                            Default Shipping Address
                                        </label>
                                    </div>

                                    {/* Delivery Instruction */}
                                    <div className="mt-3">
                                        <InputLabel
                                            htmlFor="delivery_instruction"
                                            value="Delivery Instruction"
                                        />

                                        <TextInput
                                            id="delivery_instruction"
                                            name="delivery_instruction"
                                            className="mt-1 block w-full"
                                            value={
                                                formData.delivery_instruction
                                            }
                                            onChange={handleInputChange}
                                        />
                                    </div>

                                    <div className="mt-4 flex justify-between">
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                                        >
                                            Save Address
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {updateModal && selectedId && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                            <div className="bg-base dark:bg-gray-900 text-black dark:text-white p-6 rounded-lg shadow-lg w-[650px] max-h-[90vh] overflow-y-auto">
                                <h2 className="text-xl font-semibold mb-4">
                                    Edit Address
                                </h2>

                                {/* Iterate through the addresses to display them in modal */}
                                {address.length > 0 &&
                                    address.map((addressItem) =>
                                        addressItem.id === selectedId ? (
                                            <div key={addressItem.id}>
                                                {/* Form */}
                                                <form
                                                    action={route(
                                                        "address.update"
                                                    )}
                                                    method="POST"
                                                >
                                                    {/* CSRF Token */}
                                                    <input
                                                        type="hidden"
                                                        name="_token"
                                                        value={csrf_token}
                                                    />

                                                    <input
                                                        type="hidden"
                                                        name="id"
                                                        value={addressItem.id}
                                                    />

                                                    {/* Country */}
                                                    <div>
                                                        <InputLabel
                                                            htmlFor="country"
                                                            className="block text-sm"
                                                        />
                                                        <select
                                                            id="country"
                                                            name="country"
                                                            className="input input-bordered mt-1 block w-full"
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                            defaultValue={
                                                                addressItem.country ||
                                                                ""
                                                            }
                                                        >
                                                            <option value="">
                                                                Select a country
                                                            </option>
                                                            <option value="USA">
                                                                USA
                                                            </option>
                                                            <option value="India">
                                                                India
                                                            </option>
                                                            <option value="UK">
                                                                UK
                                                            </option>
                                                        </select>
                                                    </div>

                                                    {/* Full Name & Phone */}
                                                    <div className="flex gap-2">
                                                        <div className="w-1/2">
                                                            <InputLabel
                                                                htmlFor="full-name"
                                                                value="Full Name"
                                                            />

                                                            <TextInput
                                                                type="text"
                                                                id="full-name"
                                                                name="full_name"
                                                                className="mt-1 block w-full"
                                                                onChange={
                                                                    handleInputChange
                                                                }
                                                                defaultValue={
                                                                    addressItem.full_name ||
                                                                    ""
                                                                }
                                                            />
                                                        </div>

                                                        <div className="w-1/2">
                                                            <InputLabel
                                                                htmlFor="phone-number"
                                                                value="Phone Number"
                                                            />

                                                            <NumberInput
                                                                type="text"
                                                                id="phone-number"
                                                                name="phone_number"
                                                                className="mt-1 block w-full"
                                                                onChange={
                                                                    handleInputChange
                                                                }
                                                                defaultValue={
                                                                    addressItem.phone_number ||
                                                                    ""
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Address Line 1 & 2 */}
                                                    <div className="flex gap-2">
                                                        <div className="w-1/2">
                                                            <InputLabel
                                                                htmlFor="address_line_1"
                                                                value='AddressLine 1'
                                                            />

                                                            <TextInput
                                                                type="text"
                                                                id="address_line_1"
                                                                name="address_line_1"
                                                                className="mt-1 block w-full"
                                                                onChange={
                                                                    handleInputChange
                                                                }
                                                                defaultValue={
                                                                    addressItem.address_line_1 ||
                                                                    ""
                                                                }
                                                            />
                                                        </div>

                                                        <div className="w-1/2">
                                                            <InputLabel
                                                                htmlFor="address_line_2"
                                                                value='Address Line 2'
                                                            />

                                                            <TextInput
                                                                type="text"
                                                                id="address_line_2"
                                                                name="address_line_2"
                                                                className="mt-1 block w-full"
                                                                onChange={
                                                                    handleInputChange
                                                                }
                                                                defaultValue={
                                                                    addressItem.address_line_2 ||
                                                                    ""
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* City, State, Zip Code */}
                                                    <div className="flex gap-2">
                                                        <div className="w-1/3">
                                                            <InputLabel
                                                                htmlFor="city"
                                                                value='City'
                                                            />

                                                            <TextInput
                                                                type="text"
                                                                id="city"
                                                                name="city"
                                                                className="mt-1 block w-full"
                                                                onChange={
                                                                    handleInputChange
                                                                }
                                                                defaultValue={
                                                                    addressItem.city ||
                                                                    ""
                                                                }
                                                            />
                                                        </div>

                                                        <div className="w-1/3">
                                                            <InputLabel
                                                                htmlFor="state"
                                                                value='State'
                                                            />

                                                            <TextInput
                                                                type="text"
                                                                id="state"
                                                                name="state"
                                                                className="mt-1 block w-full"
                                                                onChange={
                                                                    handleInputChange
                                                                }
                                                                defaultValue={
                                                                    addressItem.state ||
                                                                    ""
                                                                }
                                                            />
                                                        </div>

                                                        <div className="w-1/3">
                                                            <InputLabel
                                                                htmlFor="zip-code"
                                                               value='Zip Code'
                                                            />

                                                            <TextInput
                                                                type="text"
                                                                id="zip-code"
                                                                name="zip_code"
                                                                className="mt-1 block w-full"
                                                                onChange={
                                                                    handleInputChange
                                                                }
                                                                defaultValue={
                                                                    addressItem.zip_code ||
                                                                    ""
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Delivery Instruction */}
                                                    <div>
                                                        <InputLabel
                                                            htmlFor="delivery-instruction"
                                                            value='Delivery Instruction'
                                                        />

                                                        <TextInput
                                                            id="delivery-instruction"
                                                            name="delivery_instruction"
                                                            className="mt-1 block w-full"
                                                            onChange={
                                                                handleInputChange
                                                            }
                                                            defaultValue={
                                                                addressItem.delivery_instruction ||
                                                                ""
                                                            }
                                                        />
                                                    </div>

                                                    <div className="mt-4 flex justify-between">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setUpdateModal(
                                                                    false
                                                                )
                                                            }
                                                            className="text-gray-500 hover:text-gray-700"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            type="submit"
                                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
                                                        >
                                                            Save Address
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        ) : null
                                    )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default ShippingAddress;
