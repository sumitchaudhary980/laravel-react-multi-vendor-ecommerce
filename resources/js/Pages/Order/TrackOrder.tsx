import React, {
  useEffect,
  useState,
} from 'react';

import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
  Order,
  PageProps,
} from '@/types';
import {
  Head,
  Link,
} from '@inertiajs/react';

function TrackOrder({
    orders,
}: PageProps<{
    orders: Order;
}>) {
    const [orderData, setOrderData] = useState<Order | null>(orders);

    useEffect(() => {
        if (!orderData && orders) {
            const { tracking_number } = orders;
            fetch(`/api/orders/${tracking_number}/tracking`) // Make sure the endpoint is correct
                .then((response) => response.json())
                .then((data) => setOrderData(data))
                .catch((error) =>
                    console.error("Error fetching tracking data:", error)
                );
        }
    }, [orders, orderData]);

    if (!orderData) {
        return <div>Loading...</div>;
    }

    // Define the progress steps based on the shipping status
    const progressSteps = [
        {
            status: "placed",
            completed: orderData.shipping_status.toLowerCase() === "placed",
        },
        {
            status: "shipped",
            completed: orderData.shipping_status.toLowerCase() === "shipped",
        },
        {
            status: "out for delivery",
            completed:
                orderData.shipping_status.toLowerCase() === "out for delivery",
        },
        {
            status: "delivered",
            completed: orderData.shipping_status.toLowerCase() === "delivered",
        },
    ];

    // Calculate the progress width based on the highest completed step
    const lastCompletedIndex = progressSteps.findIndex(
        (step) => step.completed
    );
    const progressWidth = (lastCompletedIndex + 1) * 25;

    // Mark all previous steps as completed
    progressSteps.forEach((step, index) => {
        if (index <= lastCompletedIndex) {
            step.completed = true;
        }
    });

    return (
        <AuthenticatedLayout>
            <Head title="Track Order" />

            <div className="container mx-auto p-6">
                <h2 className="text-3xl font-bold mb-8">
                    Track Order #{orderData.tracking_number}
                </h2>

                <div className="space-y-4">
                    {/* Order Status Information */}
                    <div className="bg-white shadow-md p-4 rounded-md dark:bg-gray-800">
                        <h3 className="text-lg font-semibold">
                            Tracking Status: {orderData.shipping_status}
                        </h3>
                        {orderData.shipping_status === "delivered" ? (
                            <p className="text-sm">
                                Delivered on:{" "}
                                {new Date(orderData.updated_at)
                                    .toLocaleDateString("en-GB")
                                    .replace(",", " at")}
                            </p>
                        ) : (
                            <p className="text-sm">
                                Estimated Delivery:{" "}
                                {orderData.estimated_delivery}
                            </p>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="relative pt-1">
                        <div className="flex mb-6 items-center justify-between">
                            {progressSteps.map((step, index) => (
                                <div key={index} className="flex-1 text-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                            step.completed
                                                ? "bg-green-500 text-white dark:bg-green-400"
                                                : "bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-400"
                                        }`}
                                    >
                                        {step.completed ? "✔" : index + 1}
                                    </div>
                                    <p className="mt-2 text-sm">
                                        {step.status}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* Progress Line */}
                        <div className="absolute top-1/2 w-full h-1 bg-gray-300 dark:bg-gray-600"></div>
                        <div
                            className="absolute top-1/2 w-full h-1 bg-green-500 dark:bg-green-400"
                            style={{ width: `${progressWidth}%` }}
                        ></div>
                    </div>
                    <Link
                        href={route("order.show")}
                        className="btn btn-primary"
                    >
                        Go Back
                    </Link>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

export default TrackOrder;
