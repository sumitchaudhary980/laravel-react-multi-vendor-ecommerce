<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductVariation extends Model
{

    protected $casts = [
        'variation_type_option_ids' => 'json',
    ];
}
