import React from 'react';

import { CurrencyFormatter } from '@/Components/Core/CurrencyFormatter';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import {
  Address,
  Order,
  OrderItem,
  PageProps,
} from '@/types';
import {
  Head,
  Link,
} from '@inertiajs/react';

function Index({
  orders,
  address,
}: PageProps<{
  orders: Order[];
  address: Address;

}>) {

  return (
    <AuthenticatedLayout>
      <Head title="Your Orders" />

      <div className="container mx-auto p-6">
        <h2 className="text-3xl font-bold mb-8">Your Orders</h2>

        {orders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => {
              if (
                Array.isArray(order.order_items) &&
                order.order_items.length > 0
              ) {
                return order.order_items.map(
                  (item: OrderItem) => (

                    <div
                      key={item.id}
                      className="bg-base-100 shadow-md rounded-md overflow-hidden border border-gray-800 dark:border-gray-200 p-4"
                    >
                      <div className="flex justify-between mb-4">
                        <h3 className="text-xl font-semibold">
                          {item.product?.title || "N/A"}
                        </h3>
                        <span className="text-sm mx-2">
                          {order.shipping_status}
                        </span>
                      </div>
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex-1">
                          <p className="text-sm">
                            Order ID: {order.id}
                          </p>
                          <p className="text-sm">
                            Quantity: {item.quantity}
                          </p>

                          {/* Handle Variations (Color and Size) */}
                          {item.variations && Object.entries(item.variations).map(
                            ([typeId, names], index) => (
                              names.length > 0 && (
                                <p key={typeId}>
                                  <strong>
                                    {index === 0 ? "Color" :
                                      index === 1 ? "Size" :
                                      `Variation ${index + 1}`}
                                    :
                                  </strong> {names.join(", ")}
                                </p>
                              )
                            )
                          )}

                          {/* Access the specific address for each order */}
                          <p>
                            Full Name: {order.address?.full_name}
                          </p>
                          <p>
                            Address: {order.address?.address_line_1}
                          </p>
                          <p>
                            {order.address?.address_line_2 && (
                              <p>{order.address?.address_line_2}</p>
                            )}
                          </p>
                          <p>
                            {order.address?.city}, {order.address?.state} {order.address?.zip_code},
                          </p>
                          <p>
                            {order.address?.country}
                          </p>
                          <p className="mt-2 text-sm text-gray-500">
                            {order.address?.delivery_instruction || "No instructions"}
                          </p>
                        </div>

                        <div className="w-24 h-24 flex justify-center items-center">

                          {item.product?.image ? (
                            <img
                            key={item.product?.image} // Force React to update when image changes
                            src={item.product?.image}
                            alt={item.product?.title}
                            className="h-full w-full object-cover rounded-md"
                          />

                          ) : (
                            <div className="h-12 w-12 bg-base-200 rounded-md flex justify-center items-center">
                              No Image
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <span className="text-lg font-semibold mr-2">
                            <CurrencyFormatter amount={item.price}/>
                          </span>
                        </div>
                        <Link
                          href={`/order/${order.tracking_number}/track`}
                          className="bg-yellow-500 text-sm px-4 py-2 rounded-md hover:bg-yellow-600 transition duration-200 text-black dark:text-white"
                        >
                          Track Order
                        </Link>
                      </div>
                    </div>
                  )
                );
              } else {
                return (
                  <div
                    key={order.id}
                    className="bg-black dark:bg-white shadow-md rounded-md overflow-hidden border border-gray-800 dark:border-gray-200 p-4"
                  >
                    <p className="text-center">
                      No items for this order.
                    </p>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}

export default Index;
