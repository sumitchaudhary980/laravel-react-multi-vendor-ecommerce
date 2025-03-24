<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\Order;
use App\Models\VariationTypeOption; // Import the VariationTypeOption model
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();
        $keyword = $request->query('keyword');

        $orders = Order::where('user_id', $userId)
            ->where('status', 'paid')
            ->with(['orderItems.product', 'address'])
            ->orderBy('created_at', 'desc')
            ->get();

        foreach ($orders as $order) {
            $order->address = Address::find($order->address_id); // Find the address by address_id

            foreach ($order->orderItems as $item) {
                // Ensure 'variation_type_option_ids' is always an array
                $optionIds = $item->variation_type_option_ids ?? [];
                $optionIds = is_array($optionIds) ? $optionIds : json_decode($optionIds, true);

                // Fetch variation names using the correct mapping
                $variations = DB::table('variation_type_options')
                    ->whereIn('id', $optionIds)
                    ->get(['id', 'variation_type_id', 'name']);

                // Categorize variations dynamically
                $categorizedVariations = [];

                foreach ($variations as $variation) {
                    $categorizedVariations[$variation->variation_type_id][] = $variation->name;
                }

                // Attach categorized variations to the item
                $item->variations = $categorizedVariations;

                // Attach price to the item (make sure your OrderItem model has a `price` column)
                $item->price = $item->price;

                // Assign the correct image
                if (!empty($optionIds)) {
                    $item->product->image = $item->product->getImageForOptions($optionIds);
                } else {
                    $item->product->image = $item->product->getFirstMediaUrl('images', 'small');
                }
            }
            \Log::info('Final Orders Data: ', $orders->toArray());

        }

        return Inertia::render('Order/Index', [
            'isAuthenticated' => auth()->check(),
            'orders' => $orders,
        ]);
    }


    public function trackOrder($tracking_number)
    {
        // Find the order by tracking number
        $order = Order::where('tracking_number', $tracking_number)->firstOrFail();

        // Return tracking information to a view
        return Inertia::render('Order/TrackOrder', [
            'orders' => $order,

        ]);
    }

    // public function show($orderId)
    // {
    //     // Get the logged-in user ID
    //     $userId = Auth::id();

    //     // Fetch the specific order details only if it belongs to the logged-in user
    //     $order = Order::where('id', $orderId)
    //         ->where('user_id', $userId)
    //         ->with(['orderItems.product', 'orderItems.product.media']) // Eager loading order items and their products with media (image)
    //         ->first();

    //     if (!$order) {
    //         return response()->json(['message' => 'Order not found or unauthorized'], 404);
    //     }

    //     // Map order items to include product images and variation options
    //     $order->orderItems = $order->orderItems->map(function ($orderItem) {
    //         $product = $orderItem->product;
    //         $productImageUrl = $product->getFirstMediaUrl('images', 'small') ?: null;
    //         $orderItem->product->image = $productImageUrl; // Attach image to the product data

    //         // Fetch variation options images
    //         $optionIds = $orderItem->option_ids ?? [];
    //         $options = VariationTypeOption::whereIn('id', $optionIds)->get();

    //         $optionImages = [];
    //         foreach ($options as $option) {
    //             $optionImageUrl = $option->getFirstMediaUrl('images', 'small') ?: null;
    //             $optionImages[] = [
    //                 'id' => $option->id,
    //                 'name' => $option->name,
    //                 'image' => $optionImageUrl,
    //             ];
    //         }

    //         // Attach variation option images
    //         $orderItem->optionImages = $optionImages;
    //         return $orderItem;
    //     });

    //     return response()->json($order);
    // }
}
