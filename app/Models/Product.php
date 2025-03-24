<?php

namespace App\Models;

use App\Enums\ProductStatusEnum;
use App\Enums\VendorStatusEnum;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Collections\MediaCollection;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class Product extends Model implements HasMedia
{

    use InteractsWithMedia;

    public function registerMediaCollections(): void
    {
        $this->addMediaConversion('thumb')
        ->width(100);

        $this->addMediaConversion('small')
        ->width(400);

        $this->addMediaConversion('large')
        ->width(1200);
    }

    public function scopeForVendor(Builder $query): Builder
    {
        return $query->where('created_by',auth()->user()->id);
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('products.status',ProductStatusEnum::Published);
    }

    public function scopeForWebsite(Builder $query): Builder
    {
        return $query->published()->vendorApproved();
    }

    public function scopeVendorApproved(Builder $query)
    {
       return $query->join('vendors', 'vendors.user_id', '=', 'products.created_by')
        ->where('vendors.status', VendorStatusEnum::Approved->value);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(Vendor::class,'vendor_user_id','user_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function variationTypes(): HasMany
    {
        return $this->hasMany(VariationType::class);
    }

    public function variationTypeOption(): BelongsTo
    {
        return $this->belongsTo(VariationTypeOption::class);
    }
    public function variations(): HasMany
{
    return $this->hasMany(ProductVariation::class, 'product_id'); // Returns related variations
}

public function getPriceForOptions($optionIds = [])
{
    $optionIds = array_values($optionIds);
    sort($optionIds);
    foreach($this->variations as $variation){
        $a = $variation->variation_type_option_ids;
        sort($a);
        if($optionIds == $a){
            return $variation->price !== null ? $variation->price : $this->price;
        }
    }

    return $this->price;
}

public function getImageForOptions(array $optionIds = null)
{
    if ($optionIds) {
        $optionIds = array_values($optionIds);
        sort($optionIds);

        // Fetch variation options
        $options = VariationTypeOption::whereIn('id', $optionIds)->get();

        // Check if the product has a color variation
        $colorOption = $options->firstWhere('variation_type_id', 1); // Assuming 1 is the 'Color' type

        if ($colorOption) {
            $colorImage = $colorOption->getFirstMediaUrl('images', 'small');
            if ($colorImage) {

                return $colorImage; // Ensure color image is returned
            }
        }

        // If no color-specific image is found, return the first available variation image
        foreach ($options as $option) {
            $image = $option->getFirstMediaUrl('images', 'small');
            if ($image) {

                return $image;
            }
        }
    }

    // Fallback to the default product image
    $defaultImage = $this->getFirstMediaUrl('images', 'small');
    return $defaultImage;
}


public function getImagesForOptions(array $optionIds = null)
{
    if($optionIds){
        $optionIds = array_values($optionIds);
        sort($optionIds);
        $options = VariationTypeOption::whereIn('id', $optionIds)->get();

        foreach($options as $option){
            $images = $option->getMedia('images');
            if($images){
                return $images;
            }
        }
    }
    return $this->getFirstMediaUrl('images', 'small');
}

public function getImages(): MediaCollection
{
    if($this->options->count() > 0){
        foreach($this->options as $option){
            $images = $option->getMedia('images');
            if($images){
                return $images;
            }
        }
    }
    return $this->getMedia('images');
}

public function getImagesForOptionOrder(array $optionIds = null)
{
    if($optionIds){
        $optionIds = array_values($optionIds);
        sort($optionIds);
        $options = VariationTypeOption::whereIn('id', $optionIds)->get();

        foreach($options as $option){
            $images = $option->getMedia('images');
            if($images){
                return $images;
            }
        }
    }
    return $this->getFirstMediaUrl('images', 'small');
}

}
