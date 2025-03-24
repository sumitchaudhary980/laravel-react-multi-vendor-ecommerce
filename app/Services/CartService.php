<?php

namespace App\services;

use App\Models\CartItem;
use App\Models\Product;
use App\Models\VariationType;
use App\Models\VariationTypeOption;
use Exception;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CartService
{
    private ?array $cachedCartItems = null;
    protected const COOKIE_NAME = 'cartItems';
    protected const COOKIE_LIFETIME = 60 * 24 * 365; // 1 year

    public function addItemToCart(Product $product, int $quantity = 1, $optionIds = null)
    {
        // Handle null options
        if ($optionIds === null) {
            $optionIds = $product->variationTypes->mapWithKeys(fn(VariationType $type) => [$type->id => $type->options[0]?->id])
                ->toArray();
        }

        $price = $product->getPriceForOptions($optionIds);

        if (Auth::check()) {
            $this->saveItemToDatabase($product->id, $quantity, $price, $optionIds);
        } else {
            $this->saveItemToCookies($product->id, $quantity, $price, $optionIds);
        }
    }

    public function updateItemQuantity(int $productId, int $quantity, $optionIds = null)
    {
        if (Auth::check()) {
            $this->updateItemQuantityInDatabase($productId, $quantity, $optionIds);
        } else {
            $this->updateItemQuantityInCookies($productId, $quantity, $optionIds);
        }
    }

    public function removeItemFromCart(int $productId, $optionIds = null)
    {
        if (Auth::check()) {
            $this->removeItemFromDatabase($productId, $optionIds);
        } else {
            $this->removeItemFromCookies($productId, $optionIds);
        }
    }

    public function getCartItems(): array
    {
        try {
            if ($this->cachedCartItems === null) {
                $cartItems = Auth::check() ? $this->getCartItemsFromDatabase() : $this->getCartItemsFromCookies();
                $cartItems = $cartItems ?? []; // Ensure $cartItems is always an array

                // Map the product IDs from the cartItems array
                $productIds = collect($cartItems)
                    ->filter(fn($item) => isset($item['product_id'])) // Ensure 'product_id' exists
                    ->pluck('product_id')
                    ->toArray();

                // Retrieve products with relationships
                $products = Product::whereIn('id', $productIds)
                    ->with('user.vendor')
                    ->forWebsite()
                    ->get()
                    ->keyBy('id');

                $cartItemData = [];
                foreach ($cartItems as $cartItem) {
                    $product = data_get($products, $cartItem['product_id']);
                    if (!$product) {
                        continue;
                    }

                    // Ensure 'option_ids' is always an array
                    $optionIds = ($cartItem['option_ids'] ?? []);
                    $optionIds = is_array($optionIds) ? $optionIds : [];

                    $options = VariationTypeOption::with('variationType')
                        ->whereIn('id', $optionIds)
                        ->get()
                        ->keyBy('id');

                    $optionInfo = [];
                    $imageUrl = null;

                    foreach ($optionIds as $optionId) {
                        $option = data_get($options, $optionId);
                        if (!$option) {
                            continue;
                        }
                        if (!$imageUrl) {
                            $imageUrl = $option->getFirstMediaUrl('images', 'small');
                        }
                        $optionInfo[] = [
                            'id' => $optionId,
                            'name' => $option->name,
                            'type' => [
                                'id' => $option->variationType->id,
                                'name' => $option->variationType->name,
                            ],
                        ];
                    }
                    if (Auth::check()) {
                        $cartItemData[] = [
                            'id' => $cartItem['id'],
                            'product_id' => $product->id,
                            'title' => $product->title,
                            'slug' => $product->slug,
                            'price' => $cartItem['price'],
                            'saved_for_later' => $cartItem['saved_for_later'],
                            'quantity' => $cartItem['quantity'],
                            'option_ids' => $optionIds,
                            'options' => $optionInfo,
                            'image' => $imageUrl ?: $product->getFirstMediaUrl('images', 'small'),
                            'user' => [
                                    'id' => $product->created_by,
                                    'name' => $product->user->vendor->store_name,
                                ],
                        ];
                    } else {
                        $cartItemData[] = [
                            'id' => $cartItem['id'],
                            'product_id' => $product->id,
                            'title' => $product->title,
                            'slug' => $product->slug,
                            'price' => $cartItem['price'],
                            'quantity' => $cartItem['quantity'],
                            'option_ids' => $optionIds,
                            'options' => $optionInfo,
                            'image' => $imageUrl ?: $product->getFirstMediaUrl('images', 'small'),
                            'user' => [
                                    'id' => $product->created_by,
                                    'name' => $product->user->vendor->store_name,
                                ],
                        ];
                    }
                }

                $this->cachedCartItems = $cartItemData;
            }

            return $this->cachedCartItems;
        } catch (Exception $e) {
            // Log::error('Error in getCartItems: ' . $e->getMessage(), [
            //     'cartItems' => $cartItems ?? null,
            //     'exception' => $e,
            // ]);
        }

        return [];
    }


    public function getTotalQuantity(): int
    {
        $totalQuantity = 0;

        foreach ($this->getCartItems() as $item) {
            $totalQuantity += $item['quantity'];
        }

        return $totalQuantity;
    }

    public function getTotalPrice(): float
    {
        $total = 0;
        foreach ($this->getCartItems() as $item) {
            $total += $item['quantity'] * $item['price'];
        }

        return $total;
    }

    protected function updateItemQuantityInDatabase(int $productId, int $quantity, array $optionIds)
    {
        $userId = Auth::id();
        $cartItem = CartItem::where('user_id', $userId)
            ->where('product_id', $productId)
            ->where('variation_type_option_ids', json_encode($optionIds))
            ->first();

        if ($cartItem) {
            $cartItem->update([
                'quantity' => $quantity
            ]);
        }
    }

    protected function updateItemQuantityInCookies(int $productId, int $quantity, array $optionIds)
    {
        $cartItems = $this->getCartItemsFromCookies();

        ksort($optionIds);

        //use a unique key based on product ID and oprion IDs
        $itemKey = $productId . '_' . json_encode($optionIds);

        if (isset($cartItems[$itemKey])) {
            $cartItems[$itemKey]['quantity'] = $quantity;
        }


        //save updated items back to cookie
        Cookie::queue(self::COOKIE_NAME, json_encode($cartItems), self::COOKIE_LIFETIME);
    }

    protected function saveItemToDatabase(int $productId, int $quantity, $price, array $optionIds)
    {
        $userId = Auth::id();


        // sort($optionIds); // Ensure the array is sorted to avoid mismatches

        $cartItem = CartItem::where('user_id', $userId)
            ->where('product_id', $productId)
            ->where('variation_type_option_ids', $optionIds)
            ->first();

        if ($cartItem) {
            $cartItem->update([
                'quantity' => DB::raw('quantity + ' . $quantity),
            ]);
        } else {
            CartItem::create([
                'user_id' => $userId,
                'product_id' => $productId,
                'quantity' => $quantity,
                'price' => $price,
                'variation_type_option_ids' => $optionIds,
            ]);
        }
    }


    protected function saveItemToCookies(int $productId, int $quantity, $price, array $optionIds)
    {
        $cartItems = $this->getCartItemsFromCookies();
        ksort($optionIds);

        //use a unique key based on product ID and option IDs
        $itemKey = $productId . '_' . json_encode($optionIds);
        if (isset($cartItems[$itemKey])) {
            $cartItems[$itemKey]['quantity'] += $quantity;
            $cartItems[$itemKey]['price'] = $price;
        } else {
            $cartItems[$itemKey] = [
                'id' => \Str::uuid(),
                'product_id' => $productId,
                'quantity' => $quantity,
                'price' => $price,
                'option_ids' => $optionIds,
            ];
        }
        //save updated cart items back to the cookie
        Cookie::queue(self::COOKIE_NAME, json_encode($cartItems), self::COOKIE_LIFETIME);
    }

    protected function removeItemFromDatabase(int $productId, array $optionIds)
    {
        $userId = Auth::id();
        ksort($optionIds);

        CartItem::where('user_id', $userId)
            ->where('product_id', $productId)
            ->where('variation_type_option_ids', json_encode($optionIds))
            ->delete();
    }


    protected function removeItemFromCookies(int $productId, array $optionIds)
    {
        $cartItems = $this->getCartItemsFromCookies();

        ksort($optionIds);

        //Define the cart key
        $cartKey = $productId . '_' . json_encode($optionIds);

        //Remove the item from cart
        unset($cartItems[$cartKey]);

        Cookie::queue(self::COOKIE_NAME, json_encode($cartItems), self::COOKIE_LIFETIME);

    }
    protected function getCartItemsFromDatabase(): array
    {
        $userId = Auth::id();

        $cartItems = CartItem::where('user_id', $userId)
            ->get()
            ->map(function ($cartItem) {
                // Decode the JSON-encoded variation_type_option_ids
                $optionIds = $cartItem->variation_type_option_ids;

                return [
                    'id' => $cartItem->id,
                    'product_id' => $cartItem->product_id,
                    'quantity' => $cartItem->quantity,
                    'price' => $cartItem->price,
                    'saved_for_later' => $cartItem['saved_for_later'],

                    'option_ids' => $optionIds, // Return as array for further processing
                    // Optionally include related product or variation data
                    'product' => $cartItem->product, // Assuming there's a relationship
                    'options' => $cartItem->options, // Assuming a relationship for option data
                ];
            })->toArray();
        return $cartItems;
    }


    protected function getCartItemsFromCookies(): array
    {
        $cartItems = json_decode(Cookie::get(self::COOKIE_NAME, '[]'), true);

        // Assuming $optionIds exists in $cartItems and needs to be sorted
        if (isset($cartItems['optionIds'])) {
            ksort($cartItems['optionIds']);
        }
        return $cartItems;
    }

    public function getCartItemsGrouped(): array
    {
        $cartItems = $this->getCartItems();

        return collect($cartItems)
            ->groupBy(fn($item) => $item['user']['id'])
            ->map(fn($items, $userId) => [
                'user' => $items->first()['user'],
                'items' => $items->toArray(),
                'totalQuantity' => $items->sum('quantity'),
                'totalPrice' => $items->sum(fn($item) => $item['price'] * $item['quantity']),
            ])->toArray();
    }
    public function moveCartItemsToDatabase($userId): void
    {
        //Get the cart items from cookie
        $cartItems = $this->getCartItemsFromCookies();


        //Loop through the cart Items and insert into the database
        foreach ($cartItems as $itemkey => $cartItem) {
            //Check if cart item already exists for user
            $existingItem = CartItem::where('user_id', $userId)
                ->where('product_id', $cartItem['product_id'])
                ->where('variation_type_option_ids', $cartItem['option_ids'])
                ->first();

            if ($existingItem) {
                //if the item exists update the quantity
                $existingItem->update([
                    'quantity' => $existingItem->quantity + $cartItem['quantity'],
                    'price' => $cartItem['price']
                ]);
            } else {
                // If the item doesn't exists create a new record
                CartItem::create([
                    'user_id' => $userId,
                    'product_id' => $cartItem['product_id'],
                    'quantity' => $cartItem['quantity'],
                    'price' => $cartItem['price'],
                    'variation_type_option_ids' => $cartItem['option_ids'],
                ]);
            }
        }

        //After storing the items delete from cookie
        Cookie::queue(self::COOKIE_NAME, '', -1);
    }
}
