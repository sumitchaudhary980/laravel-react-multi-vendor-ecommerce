<?php
namespace App\Http\Controllers;

use App\Enums\OrderStatusEnum;
use App\Http\Resources\OrderviewResource;
use App\Mail\CheckoutCompleted;
use App\Mail\NewOrderMail;
use App\Models\CartItem;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Stripe\Exception\SignatureVerificationException;
use Stripe\StripeClient;
use Stripe\Webhook;
use Illuminate\Support\Facades\Mail;

class StripeController extends Controller
{
    public function success(Request $request)
    {
        $user = auth()->user();
        $session_id = $request->get('session_id');
        $orders = Order::where('stripe_session_id', $session_id)
            ->with(['vendorUser'])
            ->get();

        if ($orders->isEmpty()) {
            abort(404);
        }

        foreach ($orders as $order) {
            if ($order->user_id != $user->id) {
                abort(403);
            }
        }

        return Inertia::render('Stripe/Success', [
            'orders' => OrderviewResource::collection($orders)->collection->toArray(),
        ]);
    }

    public function failure()
    {
        //
    }

    public function webhook(Request $request)
    {
        $stripe = new StripeClient(config('app.stripe_secret_key'));
        $endpoint_secret = config('app.stripe_webhook_secret');
        $payload = $request->getContent();
        $sig_header = $request->header('Stripe-signature');


        try {
            $event = Webhook::constructEvent($payload, $sig_header, $endpoint_secret);
        } catch (\Exception $e) {
            Log::error($e);
            return response('Invalid Payload', 400);
        }

        switch ($event->type) {
            case 'charge.updated':
                $charge = $event->data->object;
                $transactionId = $charge['balance_transaction'];
                $paymentIntent = $charge['payment_intent'];
                $balanceTransaction = $stripe->balanceTransactions->retrieve($transactionId);

                $orders = Order::where('payment_intent', $paymentIntent)->get();
                $totalAmount = $balanceTransaction['amount'];
                $stripeFee = collect($balanceTransaction['fee_details'])
                    ->where('type', 'stripe_fee')
                    ->sum('amount');
                $platformFeePercent = config('app.platform_fee_pct');

                foreach ($orders as $order) {
                    $vendorShare = $order->total_price / $totalAmount;
                    $order->online_payment_commission = $vendorShare * $stripeFee;
                    $order->website_commission = ($order->total_price - $order->online_payment_commission) * ($platformFeePercent / 100);
                    $order->vendor_subtotal = $order->total_price - $order->online_payment_commission - $order->website_commission;
                    $order->save();

                    Mail::to($order->vendorUser)->send(new NewOrderMail($order));
                }

                Mail::to($orders->first()->user)->send(new CheckoutCompleted($orders));
                break;

            case 'checkout.session.completed':
                $session = $event->data->object;
                $pi = $session['payment_intent'];

                $orders = Order::where('stripe_session_id', $session['id'])
                    ->with(['orderItems'])
                    ->get();

                if ($orders->isEmpty()) {
                    break;
                }

                $productsToDeleteFromCart = [];

                foreach ($orders as $order) {
                    if (!$order->payment_intent) {
                        $order->payment_intent = $pi;
                        $order->status = OrderStatusEnum::Paid;
                        $order->tracking_number = rand(10000000000, 99999999999);
                        $order->shipping_status = 'placed';
                        $order->estimated_delivery = now()->addDays(rand(7, 13));
                        $order->save();
                    }

                    $productsToDeleteFromCart = array_merge(
                        $productsToDeleteFromCart,
                        $order->orderItems->pluck('product_id')->toArray()
                    );

                    foreach ($order->orderItems as $orderItem) {
                        $optionsArray = is_array($orderItem->variation_type_option_ids)
                            ? $orderItem->variation_type_option_ids
                            : json_decode($orderItem->variation_type_option_ids, true);
                        sort($optionsArray);

                        $product = $orderItem->product;

                        if ($optionsArray) {
                            $variation = $product->variations()
                                ->where('variation_type_option_ids', json_encode($optionsArray))
                                ->first();

                            if ($variation && $variation->quantity !== null) {
                                $variation->decrement('quantity', $orderItem->quantity);
                            }
                        } else {
                            if ($product->quantity !== null) {
                                $product->decrement('quantity', $orderItem->quantity);
                            }
                        }
                    }
                }

                CartItem::where('user_id', $orders->first()->user_id)
                    ->whereIn('product_id', $productsToDeleteFromCart)
                    ->where('saved_for_later', false)
                    ->delete();
                break;

            default:
                Log::info('Received unknown event type: ' . $event->type);
        }

        return response('', 200);
    }

    public function connect()
    {
        $user = auth()->user();

        if (!$user->getStripeAccountId()) {
            $user->createStripeAccount(['type' => 'express']);
        }

        if (!$user->isStripeAccountActive()) {
            return redirect($user->getStripeAccountLink());
        }

        return back()->with('success', 'Your account is already active');
    }
}
