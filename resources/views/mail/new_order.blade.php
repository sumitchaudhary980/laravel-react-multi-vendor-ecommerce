<x-mail::message>
<h1 style="text-align: center; font-size: 24px">
        Congratulation! You have new Order.
</h1>

<x-mail::button :url="$order->id">
        View Order Details
</x-mail::button>

<h3 style="font-size: 20px; margin-bottom: 15px">Order Summary</h3>
<x-mail::table>
    <table>
        <tbody>
            <tr>
                <td>Order #</td>
                <td>{!! $order->id !!}</td>
            </tr>
            <tr>
                <td>Order Date</td>
                <td>{!! $order->created_at !!}</td>
            </tr>
            <tr>
                <td>Order Total</td>
                <td>{!! Number::currency($order->total_price) !!}</td>
            </tr>
            <tr>
                <td>Payment Processing Fee</td>
                <td>{!! Number::currency($order->online_payment_commission ?: 0) !!}</td>
            </tr>
            <tr>
                <td>Platform Fee</td>
                <td>{!! Number::currency($order->website_commission ?: 0) !!}</td>
            </tr>
            <tr>
                <td>Your Earnings</td>
                <td>{!! Number::currency($order->vendor_subtotal ?: 0) !!}</td>
            </tr>
        </tbody>
    </table>
</x-mail::table>


<hr>
<x-mail::table>
        <table>
            <thead>
                <tr>
                    <th>Items</th>
                    <th>Quantity</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($order->orderItems as $orderItem )
                    <tr>
                        <td>
                            <table>
                                <tbody>
                                    <tr>
                                        <td padding="5" style="padding: 5px">
                                            <img  style="min-width: 60px; max-width: 60px;"src="{{$orderItem->product->getImageForOptions($orderItem->variation_type_option_ids)}}" alt="">
                                        </td>
                                        <td style="font-size: 13px; padding: 5px;">
                                            {{ $orderItem->product->title }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                        <td>
                            {{ $orderItem->quantity }}
                        </td>
                        <td>
                            {{ Number::currency($orderItem->price) }}
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
</x-mail::table>

<x-mail::panel>
        Thank you for having business with us.
</x-mail::panel>

Thanks, <br>
{{ config('app.name') }}
</x-mail::message>
