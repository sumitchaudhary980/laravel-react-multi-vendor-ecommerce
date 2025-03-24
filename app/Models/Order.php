<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Illuminate\Database\Eloquent\Builder;

class Order extends Model
{
    protected $fillable = [
        'stripe_session_id',
        'user_id',
        'total_price',
        'status',
        'online_payment_commission',
        'website_commission',
        'vendor_subtotal',
        'payment_intent'
    ];

    use InteractsWithMedia;

    public function registerMediaCollections(?Media $media = null): void
    {
        $this->addMediaConversion('thumb')
        ->width(100);

        $this->addMediaConversion('small')
        ->width(400);

        $this->addMediaConversion('large')
        ->width(1200);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
    public function vendorUser(): BelongsTo
    {
        return $this->belongsTo(User::class,'vendor_user_id');
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class, 'vendor_user_id', 'user_id');
    }

    public function scopeForVendor(Builder $query): Builder
    {
        return $query->where('vendor_user_id',auth()->user()->id);
    }
    public function address(): BelongsTo
    {
        return $this->belongsTo(Address::class);
    }

}
