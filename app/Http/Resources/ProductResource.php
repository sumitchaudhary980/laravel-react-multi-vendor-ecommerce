<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public static $wrap = false;

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'meta_title' => $this->meta_title,
            'meta_description'=> $this->meta_description,
            'price' => $this->price,
            'quantity' => $this->quantity,
            'vendor' => $this->vendor,
            'image' => $this->getFirstMediaUrl('images'),
            'images' => $this->getMedia('images')->map(fn($image) => [
                'id' => $image->id,
                'thumb' => $image->getUrl('thumb'),
                'small' => $image->getUrl('small'),
                'large' => $image->getUrl('large'),
            ]),
            'user' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'store_name' => $this->user->vendor->store_name,
            ] : null,
            'department' => $this->department ? [
                'id' => $this->department->id,
                'name' => $this->department->name,
                'slug' => $this->department->slug,
            ] : null,
            'variationTypes' => $this->variationTypes ? $this->variationTypes->map(fn($type) => [
                'id' => $type->id,
                'name' => $type->name,
                'type' => $type->type,
                'options' => $type->options ? $type->options->map(fn($option) => [
                    'id' => $option->id,
                    'name' => $option->name,
                    'images' => $option->getMedia('images')->map(fn($image) => [
                        'id' => $image->id,
                        'thumb' => $image->getUrl('thumb'),
                        'small' => $image->getUrl('small'),
                        'large' => $image->getUrl('large'),
                    ]),
                ]) : [],
            ]) : [],
            'variations' => $this->variations ? $this->variations->map(fn($variation) => [
                'id' => $variation->id,
                'variation_type_option_ids' => $variation->variation_type_option_ids,
                'quantity' => $variation->quantity,
                'price' => $variation->price,
            ]) : [],
        ];
    }
}
